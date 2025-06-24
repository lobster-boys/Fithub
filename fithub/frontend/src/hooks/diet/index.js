/**
 * Diet 관련 훅 통합 모듈
 */

import { useFoods } from './useFoods';
import { useMealPlans } from './useMealPlans';
import { useDietLogs } from './useDietLogs';
import { useDietRecommendations } from './useDietRecommendations';
import { useDietStats } from './useDietStats';

// 개별 훅 export
export { useFoods } from './useFoods';
export { useMealPlans } from './useMealPlans';
export { useDietLogs } from './useDietLogs';
export { useDietRecommendations } from './useDietRecommendations';
export { useDietStats } from './useDietStats';

/**
 * 통합된 Diet 훅 - 모든 diet 관련 기능을 한번에 제공
 * 
 * 기존 useDiet.js와의 호환성을 유지하면서도
 * 모듈화된 개별 훅들을 조합하여 더 나은 구조 제공
 */
export const useDiet = () => {
  const foods = useFoods();
  const mealPlans = useMealPlans();
  const dietLogs = useDietLogs();
  const recommendations = useDietRecommendations();
  const stats = useDietStats();

  // 전체 로딩 상태 (모든 서브 훅의 로딩 상태를 확인)
  const loading = foods.loading || mealPlans.loading || dietLogs.loading || recommendations.loading || stats.loading;

  // 전체 에러 상태 (첫 번째 에러만 표시)
  const error = foods.error || mealPlans.error || dietLogs.error || recommendations.error || stats.error;

  // 모든 상태 초기화
  const resetAll = () => {
    foods.reset();
    mealPlans.reset();
    dietLogs.reset();
    recommendations.reset();
    // stats는 다른 훅들을 조합하므로 별도 reset 불필요
  };

  // 에러 상태 초기화
  const clearAllErrors = () => {
    foods.clearError();
    mealPlans.clearError();
    dietLogs.clearError();
    recommendations.clearError();
  };

  return {
    // 전체 상태
    loading,
    error,
    
    // 개별 훅들
    foods,
    mealPlans,
    dietLogs,
    recommendations,
    stats,
    
    // 전체 액션
    resetAll,
    clearAllErrors,

    // 레거시 호환성을 위한 단축 접근자들
    // 음식 관련
    foodList: foods.foods,
    searchFoods: foods.searchFoods,
    createFood: foods.createFood,
    
    // 식단 계획 관련
    mealPlanList: mealPlans.mealPlans,
    todayMealPlan: mealPlans.todayMealPlan,
    createMealPlan: mealPlans.createMealPlan,
    fetchTodayMealPlan: mealPlans.fetchTodayMealPlan,
    
    // 식단 기록 관련
    dietLogList: dietLogs.dietLogs,
    logs: dietLogs.logs,
    todayMeals: dietLogs.todayMeals,
    getTodayLogs: dietLogs.getTodayLogs,
    createDietLog: dietLogs.createDietLog,
    fetchTodayDietLogs: dietLogs.fetchTodayDietLogs,
    fetchLogs: dietLogs.fetchLogs,
    createLog: dietLogs.createLog,
    updateLog: dietLogs.updateLog,
    deleteLog: dietLogs.deleteLog,
    
    // 추천 관련
    recommendationData: recommendations.recommendations,
    getBasicRecommendation: recommendations.getBasicRecommendation,
    
    // 통계 관련
    todayStats: stats.todayStats,
    goalProgress: stats.goalProgress,
    nutritionBalance: stats.nutritionBalance
  };
};

// 기본 export는 통합된 useDiet
export default useDiet; 