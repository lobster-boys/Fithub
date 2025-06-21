import logging
import random
import pulp
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.db import models 
from diet.models import Food, RecommendHistory
from django.conf import settings

logger = logging.getLogger(__name__)

# 식단 추천 관련 설정을 settings.py에서 가져오기
# .env에서 값을 가져오면 str 형태로 가져옴
SAMPLE_SIZE_PER_CATEGORY = getattr(settings, 'DIET_SAMPLE_SIZE_PER_CATEGORY', 15)
RECENT_DAYS = getattr(settings, 'DIET_RECENT_DAYS', 7)
FREQUENT_THRESHOLD = getattr(settings, 'DIET_FREQUENT_THRESHOLD', 3)

# 식사별 카테고리 → 필요한 아이템 개수 매핑
MEAL_CATEGORY_MAPPING = {
    "breakfast": {"과일": 1, "탄수화물": 2, "채소": 2},
    "lunch": {"탄수화물": 2, "지방": 1, "채소": 1, "유제품": 1, "과일": 2, "단백질": 2},
    "dinner": {"단백질": 2, "지방": 1, "채소": 1},
}

def calculate_nutrient_targets(daily_kcal: float) -> Dict[str, float]:
    """단백질:탄수화물:지방 = 30:50:20"""
    return {
        "protein": (daily_kcal * 0.30) / 4,
        "carbs": (daily_kcal * 0.50) / 4,
        "fat": (daily_kcal * 0.20) / 9,
    }

def _validate_user_profile(user) -> float:
    """사용자 프로필 검증"""
    profile = user.profile
    if not profile.target_calories or profile.target_calories <= 0:
        raise ValidationError("유효한 목표 칼로리가 설정되어야 합니다.")
    return float(profile.target_calories)

def _get_recent_ids(user, meal_type: str, days: int = None) -> List[int]:
    """최근 추천된 음식 ID 조회"""
    if days is None:
        days = RECENT_DAYS 
    
    cutoff = datetime.now() - timedelta(days=days)
    return list(
        RecommendHistory.objects.filter(
            user=user,
            meal_type=meal_type,
            recommended_at__gte=cutoff
        ).values_list("food_id", flat=True)
    )

def _save_history(user, food_ids: List[int], meal_type: str):
    """추천 이력 저장"""
    RecommendHistory.objects.bulk_create([
        RecommendHistory(user=user, food_id=fid, meal_type=meal_type)
        for fid in food_ids
    ])

def _weighted_random_choice(
    candidates: List[Dict[str, Any]],
    k: int,
    weight_attr: str = "weight"
) -> List[Dict[str, Any]]:
    """가중치 기반 무작위 샘플링"""
    if not candidates:
        return []
    
    weights = [c.get(weight_attr, 1.0) for c in candidates]
    return random.choices(candidates, weights=weights, k=min(k, len(candidates)))

def _get_candidate_foods_optimized(user, meal_type: str) -> Dict[str, List[Dict[str, Any]]]:
    """단일 쿼리로 모든 카테고리 데이터 조회"""
    if meal_type not in MEAL_CATEGORY_MAPPING:
        raise ValidationError(f"지원되지 않는 meal_type: {meal_type}")

    # 필요한 카테고리 목록
    required_categories = list(MEAL_CATEGORY_MAPPING[meal_type].keys())
    
    # 최근 추천된 음식 ID 조회
    recent_ids = _get_recent_ids(user, meal_type)
    
    # 자주 추천된 음식 ID 조회
    frequent_ids = RecommendHistory.get_frequently_recommended_foods(
        user, meal_type, threshold=FREQUENT_THRESHOLD
    )
    
    foods_qs = Food.objects.filter(
        category__name__in=required_categories,
        is_public_data=True
    ).exclude(id__in=recent_ids).select_related('category').annotate(
        is_frequent=models.Case(
            models.When(id__in=frequent_ids, then=models.Value(0.3)),
            default=models.Value(1.0),
            output_field=models.FloatField()
        ),
        # id 기반 샘플링
        random_order=models.F('id') % 1000
    ).order_by('random_order')
    
    # 카테고리별로 그룹화
    category_candidates = {}
    for category_name in required_categories:
        category_candidates[category_name] = []
    
    # 카테고리별 카운터
    category_counts = {cat: 0 for cat in required_categories}
    
    for food in foods_qs:
        category_name = food.category.name
        if category_name in category_counts and category_counts[category_name] < SAMPLE_SIZE_PER_CATEGORY:
            try:
                serving = food.get_standard_serving()
                category_candidates[category_name].append({
                    "id": food.id,
                    "name": food.name,
                    "calories": float(food.calories),
                    "protein": float(food.protein),
                    "carbs": float(food.carbs),
                    "fat": float(food.fat),
                    "serving": float(serving),
                    "category": category_name,
                    "weight": food.is_frequent
                })
                category_counts[category_name] += 1
            except Exception as e:
                logger.error(f"Food#{food.id} 처리 실패: {str(e)}")
                continue
    
    for category_name, candidates in category_candidates.items():
        logger.debug(f"[{meal_type}/{category_name}] 후보 {len(candidates)}개 준비")
    
    return category_candidates

def _calculate_nutrition_achievement(recommendations: List[Dict[str, Any]], 
                                   targets: Dict[str, float]) -> Dict[str, float]:
    """영양소 목표 달성 검증"""
    total_nutrition = {"protein": 0, "carbs": 0, "fat": 0, "calories": 0}
    
    for item in recommendations:
        total_nutrition["protein"] += item["protein"]
        total_nutrition["carbs"] += item["carbs"] 
        total_nutrition["fat"] += item["fat"]
        total_nutrition["calories"] += item["calories"]
    
    # 목표 대비 달성률 계산
    achievement = {}
    for nutrient in ["protein", "carbs", "fat"]:
        if targets[nutrient] > 0:
            achievement[f"{nutrient}_achievement"] = round(
                (total_nutrition[nutrient] / targets[nutrient]) * 100, 2
            )
        else:
            achievement[f"{nutrient}_achievement"] = 0
    
    # 실제 비율 계산 (30:50:20 목표 대비)
    total_calories_from_nutrients = (
        total_nutrition["protein"] * 4 + 
        total_nutrition["carbs"] * 4 + 
        total_nutrition["fat"] * 9
    )
    
    if total_calories_from_nutrients > 0:
        actual_ratios = {
            "protein_ratio": round((total_nutrition["protein"] * 4 / total_calories_from_nutrients) * 100, 1),
            "carbs_ratio": round((total_nutrition["carbs"] * 4 / total_calories_from_nutrients) * 100, 1),
            "fat_ratio": round((total_nutrition["fat"] * 9 / total_calories_from_nutrients) * 100, 1)
        }
    else:
        actual_ratios = {"protein_ratio": 0, "carbs_ratio": 0, "fat_ratio": 0}
    
    return {**achievement, **actual_ratios, "total_calories": total_nutrition["calories"]}

def _solve_lp_optimization(category_candidates: Dict[str, List[Dict[str, Any]]], category_requirements: Dict[str, int], targets: Dict[str, float],
    meal_type: str, daily_target_calories: float) -> List[Dict[str, Any]]:
    """LP 최적화를 통한 추천 (칼로리 제약 추가)"""
    
    # 모든 후보 음식 통합
    all_candidates = []
    for candidates in category_candidates.values():
        all_candidates.extend(candidates)
    
    if not all_candidates:
        raise ValidationError(f"'{meal_type}'에 사용할 음식이 없습니다.")
    
    # 식사별 목표 칼로리 계산 (일일 목표의 1/3)
    meal_target_calories = daily_target_calories / 3
    calorie_tolerance = 50  # ±50kcal 허용 오차
    
    # LP 문제 정의
    prob = pulp.LpProblem(f"MealOptimization_{meal_type}", pulp.LpMinimize)
    
    # 결정 변수를 연속형으로 변경 (서빙 비율 조정 가능)
    x = {
        cand["id"]: pulp.LpVariable(f"x_{cand['id']}", lowBound=0, upBound=1, cat="Continuous")
        for cand in all_candidates
    }
    
    # 카테고리별 개수 제약
    for cat, cnt in category_requirements.items():
        cat_items = [cand["id"] for cand in all_candidates if cand["category"] == cat]
        if cat_items:
            # 정확한 개수 대신 최소-최대 범위로 조정
            prob += pulp.lpSum(x[item_id] for item_id in cat_items) >= cnt * 0.8
            prob += pulp.lpSum(x[item_id] for item_id in cat_items) <= cnt * 1.2
    
    # 총 칼로리 제약
    total_calories = pulp.lpSum(cand["calories"] * x[cand["id"]] for cand in all_candidates)
    prob += total_calories >= meal_target_calories - calorie_tolerance
    prob += total_calories <= meal_target_calories + calorie_tolerance
    
    # 영양소 편차 변수
    deviations = {}
    for nutrient in ["protein", "carbs", "fat"]:
        deviations[f"{nutrient}_pos"] = pulp.LpVariable(f"{nutrient}_pos", lowBound=0)
        deviations[f"{nutrient}_neg"] = pulp.LpVariable(f"{nutrient}_neg", lowBound=0)
        
        # 영양소 목표 제약
        prob += (
            pulp.lpSum(cand[nutrient] * x[cand["id"]] for cand in all_candidates) +
            deviations[f"{nutrient}_neg"] - 
            deviations[f"{nutrient}_pos"] == 
            targets[nutrient]
        )
    
    # 칼로리 편차 변수
    calorie_deviation_pos = pulp.LpVariable("calorie_dev_pos", lowBound=0)
    calorie_deviation_neg = pulp.LpVariable("calorie_dev_neg", lowBound=0)
    
    prob += (
        total_calories + calorie_deviation_neg - calorie_deviation_pos == meal_target_calories
    )
    
    # 칼로리 편차를 최우선으로 최소화
    normalized_nutrient_penalty = pulp.lpSum(
        (deviations[f"{nutrient}_pos"] + deviations[f"{nutrient}_neg"]) / max(targets[nutrient], 1e-5)
        for nutrient in ["protein", "carbs", "fat"]
    )
    
    # 칼로리 편차 페널티
    calorie_penalty = (calorie_deviation_pos + calorie_deviation_neg) / meal_target_calories
    
    # 가중치 패널티
    weight_penalty = pulp.lpSum(
        (2 - cand.get("weight", 1.0)) * x[cand["id"]]
        for cand in all_candidates
    )
    
    # 최종 목적 함수 (칼로리 편차에 가장 높은 가중치)
    prob += 10.0 * calorie_penalty + normalized_nutrient_penalty + 0.1 * weight_penalty
    
    # 문제 해결
    try:
        prob.solve(pulp.PULP_CBC_CMD(msg=0))
        status = pulp.LpStatus[prob.status]
        
        if status != "Optimal":
            logger.warning(f"LP 최적화 실패 ({status}) - 폴백 방식 사용")
            return _fallback_to_calorie_aware_random(category_candidates, category_requirements, meal_target_calories)
        
        # 결과 추출
        recommended = []
        total_meal_calories = 0
        
        for cand in all_candidates:
            serving_ratio = x[cand["id"]].value()
            if serving_ratio and serving_ratio > 0.01:  # 최소 임계값
                actual_calories = cand["calories"] * serving_ratio
                recommended.append({
                    "id": cand["id"],
                    "name": cand["name"],
                    "servings": round(serving_ratio, 3),
                    "protein": round(cand["protein"] * serving_ratio, 2),
                    "carbs": round(cand["carbs"] * serving_ratio, 2),
                    "fat": round(cand["fat"] * serving_ratio, 2),
                    "calories": round(actual_calories, 2),
                    "category": cand["category"],
                })
                total_meal_calories += actual_calories
        
        logger.info(f"LP 성공: {meal_type} → {len(recommended)}개, 총 {total_meal_calories:.1f}kcal (목표: {meal_target_calories:.1f}kcal)")
        return recommended
        
    except pulp.PulpSolverError as e:
        logger.error(f"LP 솔버 오류: {str(e)}")
        return _fallback_to_calorie_aware_random(category_candidates, category_requirements, meal_target_calories)

def _fallback_to_calorie_aware_random(category_candidates: Dict[str, List[Dict[str, Any]]], category_requirements: Dict[str, int], target_calories: float
    ) -> List[Dict[str, Any]]:
    """칼로리 인식 폴백 로직"""
    recommended = []
    remaining_calories = target_calories
    
    # 카테고리별로 저칼로리 음식 우선 선택
    for category, required_count in category_requirements.items():
        candidates = category_candidates.get(category, [])
        if not candidates:
            continue
            
        # 칼로리 기준 오름차순 정렬
        candidates_sorted = sorted(candidates, key=lambda x: x["calories"])
        
        for i in range(min(required_count, len(candidates_sorted))):
            if remaining_calories <= 0:
                break
                
            candidate = candidates_sorted[i]
            
            # 남은 칼로리에 맞춰 서빙 비율 조정
            max_serving = min(1.0, remaining_calories / candidate["calories"])
            serving_ratio = max(0.1, max_serving)  # 최소 0.1 서빙
            
            actual_calories = candidate["calories"] * serving_ratio
            
            recommended.append({
                "id": candidate["id"],
                "name": candidate["name"],
                "servings": round(serving_ratio, 3),
                "protein": round(candidate["protein"] * serving_ratio, 2),
                "carbs": round(candidate["carbs"] * serving_ratio, 2),
                "fat": round(candidate["fat"] * serving_ratio, 2),
                "calories": round(actual_calories, 2),
                "category": category,
            })
            
            remaining_calories -= actual_calories
    
    return recommended


def _recommend_one_meal(user: Any, meal_type: str, targets: Dict[str, float], daily_target_calories: float) -> Dict[str, Any]:
    """단일 식사 유형 추천"""
    logger.info(f"사용자#{user.id} - {meal_type} 추천 시작")
    
    # 후보 음식 조회
    try:
        category_candidates = _get_candidate_foods_optimized(user, meal_type)
    except ValidationError as e:
        logger.error(f"후보 음식 조회 실패: {str(e)}")
        return {"recommendations": [], "nutrition_analysis": {}}
    
    # 카테고리 요구사항
    category_requirements = MEAL_CATEGORY_MAPPING[meal_type]
    
    # LP 최적화 시도
    try:
        recommendations = _solve_lp_optimization(
            category_candidates,
            category_requirements,
            targets,
            meal_type,
            daily_target_calories
        )
    except Exception as e:
        logger.error(f"LP 최적화 실패: {str(e)}")
        meal_target_calories = daily_target_calories / 3
        recommendations = _fallback_to_calorie_aware_random(category_candidates, category_requirements, meal_target_calories)
    
    # 영양소 목표 달성 검증
    nutrition_analysis = _calculate_nutrition_achievement(recommendations, targets)
    
    # 칼로리 달성률 로깅
    meal_calories = nutrition_analysis.get("total_calories", 0)
    meal_target = daily_target_calories / 3
    calorie_achievement = (meal_calories / meal_target) * 100 if meal_target > 0 else 0
    
    logger.info(f"[{meal_type}] 칼로리: {meal_calories:.1f}kcal (목표: {meal_target:.1f}kcal, 달성률: {calorie_achievement:.1f}%)")
    
    # 추천 이력 저장
    food_ids = [item["id"] for item in recommendations]
    _save_history(user, food_ids, meal_type)
    
    return {
        "recommendations": recommendations,
        "nutrition_analysis": nutrition_analysis
    }

def recommend_meal_plan_lp(user: Any, meal_type: Optional[str] = None) -> Dict[str, Any]:
    """식단 추천 메인 함수 (칼로리 제약 추가)"""
    try:
        # 목표 칼로리 검증
        daily_kcal = _validate_user_profile(user)
        targets = calculate_nutrient_targets(daily_kcal)
        
        # 재현성을 위한 시드 설정
        random.seed(user.id)
        
        # 식사 유형 결정
        meal_types = [meal_type] if meal_type else list(MEAL_CATEGORY_MAPPING.keys())
        
        # 결과 컨테이너
        result = {"data": {}, "nutrition_summary": {}}
        
        # 각 식사 유형별 추천
        total_nutrition = {"protein": 0, "carbs": 0, "fat": 0, "calories": 0}
        
        for mt in meal_types:
            if mt not in MEAL_CATEGORY_MAPPING:
                continue
                
            meal_result = _recommend_one_meal(user, mt, targets, daily_kcal)
            result["data"][mt] = meal_result["recommendations"]
            
            # 전체 영양소 합계 계산
            meal_nutrition = meal_result["nutrition_analysis"]
            total_nutrition["calories"] += meal_nutrition.get("total_calories", 0)
        
        # 전체 식단 영양소 분석
        if total_nutrition["calories"] > 0:
            result["nutrition_summary"] = {
                "total_calories": round(total_nutrition["calories"], 1),
                "target_calories": daily_kcal,
                "calories_achievement": round((total_nutrition["calories"] / daily_kcal) * 100, 1)
            }
        
        return result
        
    except ValidationError as e:
        logger.error(f"사용자 프로필 오류: {str(e)}")
        return {"data": {}, "nutrition_summary": {}}
    except Exception as e:
        logger.exception(f"추천 시스템 오류: {str(e)}")
        return {"data": {}, "nutrition_summary": {}}