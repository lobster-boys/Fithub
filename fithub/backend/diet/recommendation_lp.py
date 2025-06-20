import random
import pulp
from typing import Tuple, Dict, List, Optional, Any
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from diet.models import Food, FoodCategory, RecommendHistory

# 식사 시간별 카테고리 매핑
MEAL_CATEGORY_MAPPING = {
    "breakfast": ["과일", "채소", "탄수화물"],
    "lunch": ["탄수화물", "지방", "채소", "유제품", "과일", "단백질"],
    "dinner": ["채소", "지방", "단백질"],
}

# 고정 설정 상수 (간소화)
FIXED_MEAL_COUNT = 3
FIXED_TOP_N = 5
MIN_SERVING_BOUND = 0.0
MAX_SERVING_BOUND = 0.5
MIN_SERVING_THRESHOLD = 1e-3
SAMPLE_SIZE = 50

def calculate_nutrient_targets(target_cal: float) -> Dict[str, float]:
    """단백질:탄수화물:지방 = 30:50:20"""
    protein = (target_cal * 0.30) / 4
    carbs = (target_cal * 0.50) / 4
    fat = (target_cal * 0.20) / 9
    return {"protein": protein, "carbs": carbs, "fat": fat}

def _validate_user_profile(user) -> float:
    """UserProfile.target_calories 확인"""
    profile = user.profile
    if not profile.target_calories or profile.target_calories <= 0:
        raise ValidationError("사용자 프로필에 유효한 목표 칼로리 값이 설정되어야 합니다.")
    return float(profile.target_calories)

def _get_recent_recommended_foods(user, meal_type: str, days: int = 7) -> List[int]:
    """최근 추천된 음식 ID 조회 (중복 방지)"""
    cutoff_date = datetime.now() - timedelta(days=days)
    recent_histories = RecommendHistory.objects.filter(
        user=user,
        meal_type=meal_type,
        recommended_at__gte=cutoff_date
    ).values_list('food_id', flat=True)
    
    return list(recent_histories)

def _save_recommend_history(user, food_ids: List[int], meal_type: str):
    """추천 이력 저장"""
    recommend_histories = [
        RecommendHistory(
            user=user,
            food_id=food_id,
            meal_type=meal_type
        )
        for food_id in food_ids
    ]
    RecommendHistory.objects.bulk_create(recommend_histories)

def _get_candidate_foods(user, meal_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """후보 Food 목록 구성 - 간소화"""
    qs = Food.objects.select_related('category').filter(
        category__isnull=False,
        category__is_active=True,
        is_public_data=True  # 공공 데이터만 사용
    )
    
    print(f"DEBUG: 전체 Food 개수: {qs.count()}")
    
    # meal_type에 따른 필터링
    if meal_type and meal_type.lower() in MEAL_CATEGORY_MAPPING:
        categories = MEAL_CATEGORY_MAPPING[meal_type.lower()]
        qs = qs.filter(category__name__in=categories)
        
        print(f"DEBUG: {meal_type}에 해당하는 카테고리: {categories}")
        print(f"DEBUG: 필터링 후 Food 개수: {qs.count()}")
        
        # 최근 추천된 음식 제외 (중복 방지)
        recent_food_ids = _get_recent_recommended_foods(user, meal_type)
        if recent_food_ids:
            qs = qs.exclude(id__in=recent_food_ids)
            print(f"DEBUG: 중복 제외 후 Food 개수: {qs.count()}")
        
        # 각 카테고리별 Food 개수 확인
        for cat_name in categories:
            count = qs.filter(category__name=cat_name).count()
            print(f"DEBUG: '{cat_name}' 카테고리 Food 개수: {count}")
    
    candidates = []
    error_count = 0
    
    for food in qs:
        try:
            serving = food.get_standard_serving()
            candidates.append({
                "id": food.id,
                "name": food.name,
                "calories": float(food.calories),
                "protein": float(food.protein),
                "carbs": float(food.carbs),
                "fat": float(food.fat),
                "serving": float(serving),
                "category": food.category.name if food.category else "Unknown"
            })
        except Exception as e:
            error_count += 1
            print(f"DEBUG: {food.name} serving_size 파싱 오류: {e}")
            continue
    
    print(f"DEBUG: 전체 Food {qs.count()}개 중 {len(candidates)}개 후보, {error_count}개 오류")
    
    if not candidates:
        print("DEBUG: 후보 식품이 없습니다.")
        if meal_type:
            categories = MEAL_CATEGORY_MAPPING.get(meal_type.lower(), [])
            print(f"DEBUG: 요구되는 카테고리: {categories}")
            
            # 각 카테고리별 상세 확인
            for cat_name in categories:
                try:
                    cat = FoodCategory.objects.get(name=cat_name)
                    all_foods = Food.objects.filter(category=cat)
                    public_foods = all_foods.filter(is_public_data=True)
                    print(f"DEBUG: '{cat_name}' - 전체: {all_foods.count()}, 공공데이터: {public_foods.count()}, 활성화: {cat.is_active}")
                except FoodCategory.DoesNotExist:
                    print(f"DEBUG: '{cat_name}' 카테고리가 존재하지 않음")
        
        raise ValidationError(f"'{meal_type}' 식사에 적합한 후보 식품이 없습니다.")
    
    # 샘플링 (다양성을 위해 카테고리별로 균등하게)
    if len(candidates) > SAMPLE_SIZE:
        category_groups = {}
        for cand in candidates:
            cat = cand["category"]
            if cat not in category_groups:
                category_groups[cat] = []
            category_groups[cat].append(cand)
        
        sampled_candidates = []
        per_category = max(1, SAMPLE_SIZE // len(category_groups))
        
        for cat, cands in category_groups.items():
            if len(cands) <= per_category:
                sampled_candidates.extend(cands)
            else:
                sampled_candidates.extend(random.sample(cands, per_category))
        
        # 남은 자리가 있다면 무작위로 추가
        if len(sampled_candidates) < SAMPLE_SIZE:
            remaining_count = SAMPLE_SIZE - len(sampled_candidates)
            all_remaining = [c for c in candidates if c not in sampled_candidates]
            if all_remaining:
                additional = random.sample(all_remaining, min(remaining_count, len(all_remaining)))
                sampled_candidates.extend(additional)
        
        candidates = sampled_candidates
    else:
        random.shuffle(candidates)
    
    return candidates

def _create_lp_problem(candidates: List[Dict[str, Any]], targets: Dict[str, float], meal_type: str) -> Tuple[pulp.LpProblem, Dict[int, pulp.LpVariable]]:
    """LP 문제 구성"""
    prob = pulp.LpProblem(f"MealPlan_{meal_type}", pulp.LpMinimize)
    
    # 식사별로 다른 노이즈 적용 (다양성 확보)
    noise_ranges = {
        "breakfast": (0.85, 1.15),
        "lunch": (0.90, 1.10),
        "dinner": (0.88, 1.12),
    }
    
    noise_min, noise_max = noise_ranges.get(meal_type, (0.95, 1.05))
    
    randomized_candidates = []
    for cand in candidates:
        adjusted = cand.copy()
        import time
        meal_seed = hash(meal_type + str(int(time.time() * 1000))) % 10000
        random.seed(meal_seed + cand["id"])
        
        category_noise_multiplier = {
            "탄수화물": 1.0,
            "단백질": 1.1,
            "지방": 1.2,
            "과일": 0.9,
            "채소": 0.95,
            "유제품": 1.05,
            "기타": 1.3
        }
        
        multiplier = category_noise_multiplier.get(cand.get("category", "기타"), 1.0)
        actual_noise_min = noise_min * multiplier
        actual_noise_max = noise_max * multiplier
        
        adjusted["protein"] *= random.uniform(actual_noise_min, actual_noise_max)
        adjusted["carbs"] *= random.uniform(actual_noise_min, actual_noise_max)
        adjusted["fat"] *= random.uniform(actual_noise_min, actual_noise_max)
        randomized_candidates.append(adjusted)
    
    # 결정 변수 생성
    x_vars = {
        cand["id"]: pulp.LpVariable(f"x_{meal_type}_{cand['id']}", lowBound=MIN_SERVING_BOUND, upBound=MAX_SERVING_BOUND, cat="Continuous")
        for cand in randomized_candidates
    }
    
    prob += pulp.lpSum([x_vars[cand["id"]] for cand in randomized_candidates]) == 1, "TotalServings"
    
    deviation_vars = {}
    for nutrient in ["protein", "carbs", "fat"]:
        deviation_vars[f"{nutrient}_pos"] = pulp.LpVariable(f"d_{meal_type}_{nutrient}_pos", lowBound=0, cat="Continuous")
        deviation_vars[f"{nutrient}_neg"] = pulp.LpVariable(f"d_{meal_type}_{nutrient}_neg", lowBound=0, cat="Continuous")
    
    prob += (
        pulp.lpSum([cand["protein"] * x_vars[cand["id"]] for cand in randomized_candidates]) +
        deviation_vars["protein_neg"] - deviation_vars["protein_pos"] == targets["protein"]
    ), "ProteinConstraint"
    
    prob += (
        pulp.lpSum([cand["carbs"] * x_vars[cand["id"]] for cand in randomized_candidates]) +
        deviation_vars["carbs_neg"] - deviation_vars["carbs_pos"] == targets["carbs"]
    ), "CarbsConstraint"
    
    prob += (
        pulp.lpSum([cand["fat"] * x_vars[cand["id"]] for cand in randomized_candidates]) +
        deviation_vars["fat_neg"] - deviation_vars["fat_pos"] == targets["fat"]
    ), "FatConstraint"
    
    prob += (
        deviation_vars["protein_pos"] + deviation_vars["protein_neg"] +
        deviation_vars["carbs_pos"] + deviation_vars["carbs_neg"] +
        deviation_vars["fat_pos"] + deviation_vars["fat_neg"]
    ), "MinimizeDeviation"
    
    return prob, x_vars

def _extract_recommendations(candidates: List[Dict[str, Any]],
                           x_vars: Dict[int, pulp.LpVariable]) -> List[Dict[str, Any]]:
    """추천 결과 추출 - 고정된 개수"""
    recommended = []
    for cand in candidates:
        servings = x_vars[cand["id"]].varValue
        if servings is not None and servings > MIN_SERVING_THRESHOLD:
            recommended.append({
                "id": cand["id"],
                "name": cand["name"],
                "servings": round(float(servings), 4),
                "protein": round(cand["protein"] * servings, 2),
                "carbs": round(cand["carbs"] * servings, 2),
                "fat": round(cand["fat"] * servings, 2),
                "calories": round(cand["calories"] * servings, 2),
                "category": cand.get("category", "Unknown")
            })
    
    recommended.sort(key=lambda x: x["servings"], reverse=True)
    return recommended[:FIXED_TOP_N]  # 고정된 5개

def recommend_meal_plan_lp(user, meal_type: Optional[str] = None) -> Dict[str, List[Dict[str, Any]]]:
    """
    간소화된 LP 추천 알고리즘 - meal_type만 지원
    """
    try:
        target_cal = _validate_user_profile(user)
        profile_nutrients = calculate_nutrient_targets(target_cal)
        targets = {nutrient: value / FIXED_MEAL_COUNT for nutrient, value in profile_nutrients.items()}
        
        result = {}
        
        if meal_type:
            # 특정 meal_type 추천
            candidates = _get_candidate_foods(user, meal_type)
            prob, x_vars = _create_lp_problem(candidates, targets, meal_type)
            status = prob.solve()
            
            if pulp.LpStatus[status] != "Optimal":
                raise ValidationError(f"추천 식단 최적화 실패: {pulp.LpStatus[status]}")
                
            recommended = _extract_recommendations(candidates, x_vars)
            result[meal_type.lower()] = recommended
            
            # 추천 이력 저장
            recommended_food_ids = [item["id"] for item in recommended]
            _save_recommend_history(user, recommended_food_ids, meal_type)
            
        else:
            # 전체 추천 - 각 meal_type별로 독립적으로 처리
            meal_types = ["breakfast", "lunch", "dinner"]
            
            for mt in meal_types:
                try:
                    print(f"\n=== {mt.upper()} 추천 시작 ===")
                    candidates = _get_candidate_foods(user, mt)
                    prob, x_vars = _create_lp_problem(candidates, targets, mt)
                    status = prob.solve()
                    
                    if pulp.LpStatus[status] != "Optimal":
                        print(f"WARNING: '{mt}' 추천 최적화 실패: {pulp.LpStatus[status]}")
                        result[mt] = []
                        continue
                        
                    recommended = _extract_recommendations(candidates, x_vars)
                    result[mt] = recommended
                    print(f"DEBUG: {mt} 추천 완료 - {len(recommended)}개 항목")
                    
                    # 추천 이력 저장
                    recommended_food_ids = [item["id"] for item in recommended]
                    _save_recommend_history(user, recommended_food_ids, mt)
                    
                except ValidationError as e:
                    print(f"WARNING: '{mt}' 카테고리에서 추천 실패: {e}")
                    result[mt] = []
                    continue
        
        return result
        
    except Exception as e:
        raise ValidationError(f"추천 시스템 오류: {str(e)}")
