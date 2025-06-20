import api from './api';

// 식단 관련 API 서비스
export const dietService = {
  // ========== 음식 (Foods) ==========
  
  // 음식 목록 조회 (필터링: category, search)
  getFoods: async (params = {}) => {
    try {
      const response = await api.get('/diet/foods/', { params });
      return response.data;
    } catch (error) {
      console.error('음식 목록 조회 실패:', error);
      throw error;
    }
  },

  // 음식 상세 조회
  getFood: async (foodId) => {
    try {
      const response = await api.get(`/diet/foods/${foodId}/`);
      return response.data;
    } catch (error) {
      console.error('음식 상세 조회 실패:', error);
      throw error;
    }
  },

  // 음식 생성
  createFood: async (foodData) => {
    try {
      const response = await api.post('/diet/foods/', foodData);
      return response.data;
    } catch (error) {
      console.error('음식 생성 실패:', error);
      throw error;
    }
  },

  // 음식 수정
  updateFood: async (foodId, foodData) => {
    try {
      const response = await api.put(`/diet/foods/${foodId}/`, foodData);
      return response.data;
    } catch (error) {
      console.error('음식 수정 실패:', error);
      throw error;
    }
  },

  // 음식 삭제
  deleteFood: async (foodId) => {
    try {
      const response = await api.delete(`/diet/foods/${foodId}/`);
      return response.data;
    } catch (error) {
      console.error('음식 삭제 실패:', error);
      throw error;
    }
  },

  // ========== 식단 계획 (MealPlans) ==========
  
  // 식단 계획 목록 조회
  getMealPlans: async (params = {}) => {
    try {
      const response = await api.get('/diet/mealplan/', { params });
      return response.data;
    } catch (error) {
      console.error('식단 계획 목록 조회 실패:', error);
      throw error;
    }
  },

  // 식단 계획 상세 조회
  getMealPlan: async (mealPlanId) => {
    try {
      const response = await api.get(`/diet/mealplan/${mealPlanId}/`);
      return response.data;
    } catch (error) {
      console.error('식단 계획 상세 조회 실패:', error);
      throw error;
    }
  },

  // 식단 계획 생성
  createMealPlan: async (mealPlanData) => {
    try {
      const response = await api.post('/diet/mealplan/', mealPlanData);
      return response.data;
    } catch (error) {
      console.error('식단 계획 생성 실패:', error);
      throw error;
    }
  },

  // 식단 계획 수정
  updateMealPlan: async (mealPlanId, mealPlanData) => {
    try {
      const response = await api.put(`/diet/mealplan/${mealPlanId}/`, mealPlanData);
      return response.data;
    } catch (error) {
      console.error('식단 계획 수정 실패:', error);
      throw error;
    }
  },

  // 식단 계획 삭제
  deleteMealPlan: async (mealPlanId) => {
    try {
      const response = await api.delete(`/diet/mealplan/${mealPlanId}/`);
      return response.data;
    } catch (error) {
      console.error('식단 계획 삭제 실패:', error);
      throw error;
    }
  },

  // ========== 편의 함수들 ==========

  // 음식 검색
  searchFoods: async (query) => {
    return dietService.getFoods({ search: query });
  },

  // 카테고리별 음식 조회
  getFoodsByCategory: async (category) => {
    return dietService.getFoods({ category });
  },

  // 날짜별 식단 조회 (MealPlan 활용)
  getMealPlansByDate: async (date) => {
    return dietService.getMealPlans({ date });
  },

  // 기간별 식단 조회
  getMealPlansByDateRange: async (startDate, endDate) => {
    return dietService.getMealPlans({ 
      start_date: startDate, 
      end_date: endDate 
    });
  },

  // ========== 식단 추천 (Diet Recommendations) ==========

  // 기본 식단 추천 (사용자 프로필 기반)
  getBasicRecommendation: async () => {
    try {
      // 디버깅: API 호출 재활성화
      console.log('Diet recommend API call - attempting to reach backend');
      
      const response = await api.get('/diet/recommend/');
      console.log('Diet recommend API call successful:', response);
      return response.data;
    } catch (error) {
      console.error('기본 식단 추천 조회 실패:', error);
      throw error;
    }
  },

  // 맞춤형 식단 추천 (상세 옵션 포함)
  getCustomRecommendation: async (options = {}) => {
    try {
      const {
        mealCount = 3,
        topN = 5,
        candidateFoodIds = null,
        mealType = null
      } = options;

      const requestData = {
        meal_count: mealCount,
        top_n: topN,
        ...(candidateFoodIds && { candidate_food_ids: candidateFoodIds }),
        ...(mealType && { meal_type: mealType })
      };

      const response = await api.post('/diet/recommend/', requestData);
      return response.data;
    } catch (error) {
      console.error('맞춤형 식단 추천 조회 실패:', error);
      throw error;
    }
  },

  // 특정 음식들을 기반으로 한 추천
  getRecommendationWithFoods: async (foodIds, options = {}) => {
    return dietService.getCustomRecommendation({
      ...options,
      candidateFoodIds: foodIds
    });
  },

  // 특정 식사 타입에 대한 추천 (아침, 점심, 저녁 등)
  getRecommendationByMealType: async (mealType, options = {}) => {
    return dietService.getCustomRecommendation({
      ...options,
      mealType
    });
  }
};

export default dietService; 