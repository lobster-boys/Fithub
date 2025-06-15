import api from './api';

// 식단 관련 API 서비스
export const dietService = {
  // 음식 목록 조회
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

  // 음식 검색
  searchFoods: async (query) => {
    try {
      const response = await api.get('/diet/foods/search/', { 
        params: { q: query } 
      });
      return response.data;
    } catch (error) {
      console.error('음식 검색 실패:', error);
      throw error;
    }
  },

  // 인기 음식 조회
  getPopularFoods: async () => {
    try {
      const response = await api.get('/diet/foods/popular/');
      return response.data;
    } catch (error) {
      console.error('인기 음식 조회 실패:', error);
      throw error;
    }
  },

  // 추천 음식 조회
  getRecommendedFoods: async () => {
    try {
      const response = await api.get('/diet/foods/recommended/');
      return response.data;
    } catch (error) {
      console.error('추천 음식 조회 실패:', error);
      throw error;
    }
  },

  // 음식 영양 정보 조회
  getFoodNutrition: async (foodId) => {
    try {
      const response = await api.get(`/diet/foods/${foodId}/nutrition/`);
      return response.data;
    } catch (error) {
      console.error('음식 영양 정보 조회 실패:', error);
      throw error;
    }
  },

  // 음식 카테고리별 조회
  getFoodsByCategory: async (category) => {
    try {
      const response = await api.get('/diet/foods/by_category/', {
        params: { category }
      });
      return response.data;
    } catch (error) {
      console.error('카테고리별 음식 조회 실패:', error);
      throw error;
    }
  }
};

export default dietService; 