import random
import pulp
from typing import Tuple, Dict, List, Optional, Any
from django.core.exceptions import ValidationError
from diet.models import Food

# 식사 시간별 카테고리 매핑 상수
MEAL_CATEGORY_MAPPING = {
    "breakfast": ["과일", "채소", "유제품"],
    "lunch": ["탄수화물", "지방", "채소", "유제품", "과일", "단백질"],
    "dinner": ["채소", "지방", "단백질"],
    "snack": ["과일", "유제품", "건강보조식품"]
}

# 기본 설정 상수
DEFAULT_MEAL_COUNT = 3
DEFAULT_TOP_N = 5
MIN_SERVING_BOUND = 0.0
MAX_SERVING_BOUND = 0.5
MIN_SERVING_THRESHOLD = 1e-3
SAMPLE_SIZE = 20

def calculate_nutrient_targets(target_cal: float) -> Dict[str, float]:
    protein = (target_cal * 0.30) / 4
    carbs   = (target_cal * 0.50) / 4
    fat     = (target_cal * 0.20) / 9
    return {"protein": protein, "carbs": carbs, "fat": fat}

def _validate_user_profile(user) -> float:
    profile = user.profile
    if not profile.target_calories or profile.target_calories <= 0:
        raise ValidationError("사용자 프로필에 유효한 목표 칼로리 값이 설정되어야 합니다.")
    return float(profile.target_calories)

def _get_candidate_foods(meal_type: Optional[str] = None, 
                           candidate_food_ids: Optional[List[int]] = None) -> List[Dict[str, Any]]:
    qs = Food.objects.select_related('category').all()
    if candidate_food_ids:
        qs = qs.filter(id__in=candidate_food_ids)
    if meal_type and meal_type.lower() in MEAL_CATEGORY_MAPPING:
        categories = MEAL_CATEGORY_MAPPING[meal_type.lower()]
        qs = qs.filter(category__name__in=categories)
    candidates = []
    for food in qs:
        try:
            serving = food.get_standard_serving()
        except Exception:
            continue
        candidates.append({
            "id": food.id,
            "name": food.name,
            "calories": float(food.calories),
            "protein": float(food.protein),
            "carbs": float(food.carbs),
            "fat": float(food.fat),
            "serving": float(serving)
        })
    if not candidates:
        raise ValidationError("추천에 사용할 후보 식품이 없습니다.")
    
    if len(candidates) > SAMPLE_SIZE:
        candidates = random.sample(candidates, SAMPLE_SIZE)
    else:
        random.shuffle(candidates)
    
    return candidates

def _create_lp_problem(candidates: List[Dict[str, Any]], targets: Dict[str, float]) -> Tuple[pulp.LpProblem, Dict[int, pulp.LpVariable]]:
    """
    후보 Food의 영양소 값에 소량의 무작위 노이즈를 곱하여
    LP 문제를 구성합니다.
    """
    prob = pulp.LpProblem("MealPlanRecommendationExtended", pulp.LpMinimize)
    
    # 각 후보 Food의 영양소 값에 노이즈 적용 (0.95~1.05 곱)
    randomized_candidates = []
    for cand in candidates:
        adjusted = cand.copy()
        adjusted["protein"] *= random.uniform(0.95, 1.05)
        adjusted["carbs"]   *= random.uniform(0.95, 1.05)
        adjusted["fat"]     *= random.uniform(0.95, 1.05)
        randomized_candidates.append(adjusted)
    
    # 결정 변수 생성
    x_vars = {
        cand["id"]: pulp.LpVariable(f"x_{cand['id']}", lowBound=MIN_SERVING_BOUND, upBound=MAX_SERVING_BOUND, cat="Continuous")
        for cand in randomized_candidates
    }
    prob += pulp.lpSum([x_vars[cand["id"]] for cand in randomized_candidates]) == 1, "TotalServings"
    
    deviation_vars = {}
    for nutrient in ["protein", "carbs", "fat"]:
        deviation_vars[f"{nutrient}_pos"] = pulp.LpVariable(f"d_{nutrient}_pos", lowBound=0, cat="Continuous")
        deviation_vars[f"{nutrient}_neg"] = pulp.LpVariable(f"d_{nutrient}_neg", lowBound=0, cat="Continuous")
    
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
                             x_vars: Dict[int, pulp.LpVariable], top_n: int) -> List[Dict[str, Any]]:
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
                "calories": round(cand["calories"] * servings, 2)
            })
    recommended.sort(key=lambda x: x["servings"], reverse=True)
    return recommended[:top_n]

def recommend_meal_plan_lp(user, meal_type: Optional[str] = None, 
                           candidate_food_ids: Optional[List[int]] = None, 
                           meal_count: int = DEFAULT_MEAL_COUNT, 
                           top_n: int = DEFAULT_TOP_N) -> Dict[str, List[Dict[str, Any]]]:
    """
    LP 기반 추천 알고리즘.
    UserProfile.target_calories만 사용하고, 백엔드에서
    (단백질, 탄수화물, 지방) 목표를 자동으로 계산합니다.
    
    Args:
        user: 현재 요청 User 객체 (UserProfile.target_calories 값 사용)
        meal_type: 식사 유형 ("breakfast", "lunch", "dinner", "snack")
        candidate_food_ids: 후보 Food ID 리스트 (선택사항)
        meal_count: 하루 식사 횟수 (default 3)
        top_n: 각 식사별 추천 Food 개수 (default 5)
    
    Returns:
        Dict: {"breakfast": [...], "lunch": [...], "dinner": [...]}
    """
    try:
        target_cal = _validate_user_profile(user)
        profile_nutrients = calculate_nutrient_targets(target_cal)
        targets = {nutrient: value / meal_count for nutrient, value in profile_nutrients.items()}
        result = {}
        # 개별 식사별로 LP 최적화 수행 (meal_type이 없는 경우)
        if meal_type:
            candidates = _get_candidate_foods(meal_type, candidate_food_ids)
            prob, x_vars = _create_lp_problem(candidates, targets)
            status = prob.solve()
            if pulp.LpStatus[status] != "Optimal":
                raise ValidationError(f"추천 식단 최적화 실패: {pulp.LpStatus[status]}")
            recommended = _extract_recommendations(candidates, x_vars, top_n)
            result[meal_type.lower()] = recommended
        else:
            for mt in ["breakfast", "lunch", "dinner"]:
                candidates = _get_candidate_foods(mt, candidate_food_ids)
                prob, x_vars = _create_lp_problem(candidates, targets)
                status = prob.solve()
                if pulp.LpStatus[status] != "Optimal":
                    raise ValidationError(f"'{mt}' 추천 최적화 실패: {pulp.LpStatus[status]}")
                recommended = _extract_recommendations(candidates, x_vars, top_n)
                result[mt] = recommended
        return result
    except Exception as e:
        raise ValidationError(f"추천 시스템 오류: {str(e)}")