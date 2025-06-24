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
  
  // 식단 계획 목록 조회 (ViewSet 기반)
  getMealPlans: async (params = {}) => {
    try {
      const response = await api.get('/diet/mealplans/', { params });
      return response.data;
    } catch (error) {
      console.error('식단 계획 목록 조회 실패:', error);
      throw error;
    }
  },

  // 식단 계획 상세 조회 (ViewSet 기반)
  getMealPlan: async (mealPlanId) => {
    try {
      const response = await api.get(`/diet/mealplans/${mealPlanId}/`);
      return response.data;
    } catch (error) {
      console.error('식단 계획 상세 조회 실패:', error);
      throw error;
    }
  },

  // 식단 계획 생성 (ViewSet 기반)
  createMealPlan: async (mealPlanData) => {
    try {
      console.log('dietService.createMealPlan - 요청 데이터:', JSON.stringify(mealPlanData, null, 2));
      const response = await api.post('/diet/mealplans/', mealPlanData);
      console.log('dietService.createMealPlan - 응답 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('식단 계획 생성 실패:', error);
      if (error.response?.data) {
        console.error('dietService.createMealPlan - 에러 상세:', error.response.data);
      }
      throw error;
    }
  },

  // 식단 계획 수정 (ViewSet 기반)
  updateMealPlan: async (mealPlanId, mealPlanData) => {
    try {
      const response = await api.put(`/diet/mealplans/${mealPlanId}/`, mealPlanData);
      return response.data;
    } catch (error) {
      console.error('식단 계획 수정 실패:', error);
      throw error;
    }
  },

  // 식단 계획 부분 수정 (ViewSet 기반)
  patchMealPlan: async (mealPlanId, mealPlanData) => {
    try {
      const response = await api.patch(`/diet/mealplans/${mealPlanId}/`, mealPlanData);
      return response.data;
    } catch (error) {
      console.error('식단 계획 부분 수정 실패:', error);
      throw error;
    }
  },

  // 식단 계획 삭제 (ViewSet 기반)
  deleteMealPlan: async (mealPlanId) => {
    try {
      const response = await api.delete(`/diet/mealplans/${mealPlanId}/`);
      return response.data;
    } catch (error) {
      console.error('식단 계획 삭제 실패:', error);
      throw error;
    }
  },

  // 식단 계획 좋아요 토글 (ViewSet 기반)
  toggleMealPlanLike: async (mealPlanId) => {
    try {
      const response = await api.post(`/diet/mealplans/${mealPlanId}/like/`);
      return response.data;
    } catch (error) {
      console.error('식단 계획 좋아요 실패:', error);
      throw error;
    }
  },

  // 공개 식단 목록 조회 (ViewSet 기반)
  getPublicMealPlans: async (params = {}) => {
    try {
      const response = await api.get('/diet/mealplans/public/', { params });
      return response.data;
    } catch (error) {
      console.error('공개 식단 목록 조회 실패:', error);
      throw error;
    }
  },

  // 공개 식단 상세 조회 (ViewSet 기반)
  getPublicMealPlan: async (mealPlanId) => {
    try {
      const response = await api.get(`/diet/mealplans/${mealPlanId}/public-detail/`);
      return response.data;
    } catch (error) {
      console.error('공개 식단 상세 조회 실패:', error);
      throw error;
    }
  },

  // 추천 식단 목록 조회 (ViewSet 기반)
  getRecommendedMealPlans: async () => {
    try {
      const response = await api.get('/diet/mealplans/recommended/');
      return response.data;
    } catch (error) {
      console.error('추천 식단 목록 조회 실패:', error);
      throw error;
    }
  },

  // ========== 카테고리 관련 ==========

  // 음식 카테고리 목록 조회
  getFoodCategories: async () => {
    try {
      const response = await api.get('/diet/foods/categories/');
      return response.data;
    } catch (error) {
      console.error('음식 카테고리 목록 조회 실패:', error);
      throw error;
    }
  },

  // 카테고리별 음식 조회 (전용 엔드포인트)
  getFoodsByCategory: async (categoryName, params = {}) => {
    try {
      const response = await api.get('/diet/foods/by_category/', { 
        params: { category: categoryName, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error('카테고리별 음식 조회 실패:', error);
      throw error;
    }
  },

  // ========== 편의 함수들 ==========

  // 음식 검색
  searchFoods: async (query) => {
    return dietService.getFoods({ search: query });
  },

  // 날짜별 식단 조회 (통일된 API 사용)
  getMealPlansByDate: async (date) => {
    try {
      const response = await dietService.getMealPlans({ 
        date: date 
      });
      return response;
    } catch (error) {
      console.error('날짜별 식단 조회 실패:', error);
      throw error;
    }
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
  },

  // ========== 식단 로그 (Diet Logs) ==========
  
  // 식단 로그 목록 조회
  getDietLogs: async (params = {}) => {
    try {
      const response = await api.get('/diet/logs/', { params });
      return response.data;
    } catch (error) {
      console.error('식단 로그 목록 조회 실패:', error);
      throw error;
    }
  },

  // 식단 로그 상세 조회
  getDietLog: async (logId) => {
    try {
      const response = await api.get(`/diet/logs/${logId}/`);
      return response.data;
    } catch (error) {
      console.error('식단 로그 상세 조회 실패:', error);
      throw error;
    }
  },

  // 식단 로그 생성
  createDietLog: async (logData) => {
    try {
      const response = await api.post('/diet/logs/', logData);
      return response.data;
    } catch (error) {
      console.error('식단 로그 생성 실패:', error);
      throw error;
    }
  },

  // 식단 로그 수정
  updateDietLog: async (logId, logData) => {
    try {
      const response = await api.patch(`/diet/logs/${logId}/`, logData);
      return response.data;
    } catch (error) {
      console.error('식단 로그 수정 실패:', error);
      throw error;
    }
  },

  // 식단 로그 삭제
  deleteDietLog: async (logId) => {
    try {
      const response = await api.delete(`/diet/logs/${logId}/`);
      return response.data;
    } catch (error) {
      console.error('식단 로그 삭제 실패:', error);
      throw error;
    }
  },

  // 식단 로그 통계 조회
  getDietLogStats: async (date) => {
    try {
      const response = await api.get('/diet/logs/stats/', { 
        params: { date: date || new Date().toISOString().split('T')[0] } 
      });
      return response.data;
    } catch (error) {
      console.error('식단 로그 통계 조회 실패:', error);
      throw error;
    }
  },

};

export default dietService; 