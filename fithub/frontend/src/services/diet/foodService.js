import api from '../api';
import { handleApiError } from '../../utils/errorHandler';
import { formatFoodSearchResults } from '../../utils/dietTransformers';

/**
 * 음식 관련 API 서비스
 */
export const foodService = {
  /**
   * 음식 목록 조회 (통합된 함수)
   */
  async getFoods(params = {}) {
    try {
      const response = await api.get('/diet/foods/', { params });
      const foods = response.data.results || response.data;
      return {
        data: formatFoodSearchResults(foods),
        pagination: response.data.results ? {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        } : null
      };
    } catch (error) {
      throw handleApiError(error, 'FoodService.getFoods');
    }
  },

  /**
   * 음식 검색 (getFoods와 통합)
   */
  async searchFoods(query, params = {}) {
    return this.getFoods({ search: query, ...params });
  },

  /**
   * 카테고리별 음식 조회
   */
  async getFoodsByCategory(categoryName, params = {}) {
    try {
      const response = await api.get('/diet/foods/by_category/', { 
        params: { category: categoryName, ...params } 
      });
      const foods = response.data.results || response.data;
      return {
        data: formatFoodSearchResults(foods),
        pagination: response.data.results ? {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        } : null
      };
    } catch (error) {
      throw handleApiError(error, 'FoodService.getFoodsByCategory');
    }
  },

  /**
   * 음식 상세 조회
   */
  async getFood(foodId) {
    try {
      const response = await api.get(`/diet/foods/${foodId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'FoodService.getFood', '음식 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 음식 생성
   */
  async createFood(foodData) {
    try {
      const response = await api.post('/diet/foods/', foodData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'FoodService.createFood', '음식 생성에 실패했습니다.');
    }
  },

  /**
   * 음식 수정
   */
  async updateFood(foodId, foodData) {
    try {
      const response = await api.put(`/diet/foods/${foodId}/`, foodData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'FoodService.updateFood', '음식 수정에 실패했습니다.');
    }
  },

  /**
   * 음식 삭제
   */
  async deleteFood(foodId) {
    try {
      const response = await api.delete(`/diet/foods/${foodId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'FoodService.deleteFood', '음식 삭제에 실패했습니다.');
    }
  },

  /**
   * 음식 카테고리 목록 조회
   */
  async getFoodCategories() {
    try {
      const response = await api.get('/diet/foods/categories/');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'FoodService.getFoodCategories', '카테고리 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 내가 추가한 음식 목록
   */
  async getMyFoods(params = {}) {
    try {
      const response = await api.get('/diet/foods/my_foods/', { params });
      const foods = response.data.results || response.data;
      return {
        data: formatFoodSearchResults(foods),
        pagination: response.data.results ? {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        } : null
      };
    } catch (error) {
      throw handleApiError(error, 'FoodService.getMyFoods', '내 음식 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 인기 음식 목록
   */
  async getPopularFoods() {
    try {
      const response = await api.get('/diet/foods/popular/');
      return formatFoodSearchResults(response.data);
    } catch (error) {
      throw handleApiError(error, 'FoodService.getPopularFoods', '인기 음식 목록을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 음식 영양 정보 상세
   */
  async getFoodNutritionInfo(foodId) {
    try {
      const response = await api.get(`/diet/foods/${foodId}/nutrition_info/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'FoodService.getFoodNutritionInfo', '영양 정보를 불러오는데 실패했습니다.');
    }
  }
};

export default foodService; 