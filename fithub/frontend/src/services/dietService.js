import api from './api';

// 식단 관련 API 서비스
export const dietService = {
  // 식단 로그 목록 조회
  getDietLogs: async (params = {}) => {
    try {
      const response = await api.get('/diet/logs', { params });
      return response.data;
    } catch (error) {
      console.error('식단 로그 조회 실패:', error);
      throw error;
    }
  },

  // 특정 날짜의 식단 로그 조회
  getDietLogByDate: async (date) => {
    try {
      const response = await api.get(`/diet/logs/${date}`);
      return response.data;
    } catch (error) {
      console.error('특정 날짜 식단 로그 조회 실패:', error);
      throw error;
    }
  },

  // 오늘의 식단 조회
  getTodayDiet: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/diet/logs/${today}`);
      return response.data;
    } catch (error) {
      console.error('오늘 식단 조회 실패:', error);
      throw error;
    }
  },

  // 새 식사 추가
  addMeal: async (mealData) => {
    try {
      const response = await api.post('/diet/meals', mealData);
      return response.data;
    } catch (error) {
      console.error('식사 추가 실패:', error);
      throw error;
    }
  },

  // 식사 수정
  updateMeal: async (mealId, mealData) => {
    try {
      const response = await api.put(`/diet/meals/${mealId}`, mealData);
      return response.data;
    } catch (error) {
      console.error('식사 수정 실패:', error);
      throw error;
    }
  },

  // 식사 삭제
  deleteMeal: async (mealId) => {
    try {
      const response = await api.delete(`/diet/meals/${mealId}`);
      return response.data;
    } catch (error) {
      console.error('식사 삭제 실패:', error);
      throw error;
    }
  },

  // 식단 통계 조회
  getDietStats: async (period = 'week') => {
    try {
      const response = await api.get('/diet/stats', { 
        params: { period } 
      });
      return response.data;
    } catch (error) {
      console.error('식단 통계 조회 실패:', error);
      throw error;
    }
  },

  // 물 섭취량 업데이트
  updateWaterIntake: async (date, waterAmount) => {
    try {
      const response = await api.patch(`/diet/logs/${date}/water`, {
        water: waterAmount
      });
      return response.data;
    } catch (error) {
      console.error('물 섭취량 업데이트 실패:', error);
      throw error;
    }
  },

  // 추천 식단 조회
  getRecommendedMealPlans: async () => {
    try {
      const response = await api.get('/diet/meal-plans/recommended');
      return response.data;
    } catch (error) {
      console.error('추천 식단 조회 실패:', error);
      throw error;
    }
  }
};

export default dietService; 