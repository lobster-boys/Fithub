/**
 * Diet 관련 서비스 통합 모듈
 */

import { foodService } from './foodService';
import { mealPlanService } from './mealPlanService';
import { dietLogService } from './dietLogService';
import { recommendationService } from './recommendationService';

// 개별 서비스 export
export { foodService } from './foodService';
export { mealPlanService } from './mealPlanService';
export { dietLogService } from './dietLogService';
export { recommendationService } from './recommendationService';

// 통합된 diet 서비스 객체
export const dietService = {
  // 음식 관련
  food: foodService,
  
  // 식단 계획 관련
  mealPlan: mealPlanService,
  
  // 식단 기록 관련
  log: dietLogService,
  
  // 추천 관련
  recommendation: recommendationService,

  // 레거시 호환성을 위한 메서드들 (기존 dietService.js와 호환)
  getFoods: (params) => foodService.getFoods(params),
  searchFoods: (query, params) => foodService.searchFoods(query, params),
  getFood: (foodId) => foodService.getFood(foodId),
  createFood: (foodData) => foodService.createFood(foodData),
  updateFood: (foodId, foodData) => foodService.updateFood(foodId, foodData),
  deleteFood: (foodId) => foodService.deleteFood(foodId),
  getFoodCategories: () => foodService.getFoodCategories(),
  getFoodsByCategory: (categoryName, params) => foodService.getFoodsByCategory(categoryName, params),

  getMealPlans: (params) => mealPlanService.getPersonalMealPlans(params),
  getMealPlan: (mealPlanId) => mealPlanService.getMealPlan(mealPlanId),
  createMealPlan: (planData) => mealPlanService.createMealPlan(planData),
  updateMealPlan: (mealPlanId, planData) => mealPlanService.updateMealPlan(mealPlanId, planData),
  patchMealPlan: (mealPlanId, planData) => mealPlanService.patchMealPlan(mealPlanId, planData),
  deleteMealPlan: (mealPlanId) => mealPlanService.deleteMealPlan(mealPlanId),
  toggleMealPlanLike: (mealPlanId) => mealPlanService.toggleMealPlanLike(mealPlanId),
  getPublicMealPlans: (params) => mealPlanService.getPublicMealPlans(params),
  getPublicMealPlan: (mealPlanId) => mealPlanService.getPublicMealPlan(mealPlanId),
  getRecommendedMealPlans: (params) => mealPlanService.getRecommendedMealPlans(params),
  getMealPlansByDate: (date) => mealPlanService.getMealPlansByDate(date),

  getDietLogs: (params) => dietLogService.getDietLogs(params),
  getDietLogsByDate: (date) => dietLogService.getDietLogsByDate(date),
  getDietLog: (logId) => dietLogService.getDietLog(logId),
  createDietLog: (logData) => dietLogService.createDietLog(logData),
  updateDietLog: (logId, logData) => dietLogService.updateDietLog(logId, logData),
  deleteDietLog: (logId) => dietLogService.deleteDietLog(logId),
  getDietStats: (date) => dietLogService.getDietStats(date),
  createDietLogFromRecommendation: (recommendationData) => dietLogService.createDietLogFromRecommendation(recommendationData),

  getRecommendation: () => recommendationService.getFullDayRecommendation(),
  getRecommendationByMealType: (mealType) => recommendationService.getMealTypeRecommendation(mealType)
};

// 기본 export는 통합된 dietService
export default dietService;