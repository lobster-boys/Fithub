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

  // ========== 편의 함수들 ==========

  // 음식 검색
  searchFoods: async (query) => {
    return this.getFoods({ search: query });
  },

  // 카테고리별 음식 조회
  getFoodsByCategory: async (category) => {
    return this.getFoods({ category });
  }
};

export default dietService; 