import api from '../api';
import { handleApiError } from '../../utils/errorHandler';
import { formatApiPlan, formatMealPlanCreateData, formatDateForApi } from '../../utils/dietTransformers';

/**
 * 식단 계획 관련 API 서비스 (통합된 버전)
 */
export const mealPlanService = {
  /**
   * 식단 계획 목록 조회 (통합된 함수)
   */
  async getMealPlans(options = {}) {
    const { type = 'personal', params = {} } = options;
    
    try {
      let endpoint = '/diet/mealplans/';
      
      // 타입별 엔드포인트 결정
      switch (type) {
        case 'public':
          endpoint = '/diet/mealplans/public/';
          break;
        case 'recommended':
          endpoint = '/diet/mealplans/recommended/';
          break;
        case 'personal':
        default:
          endpoint = '/diet/mealplans/';
          break;
      }

      const response = await api.get(endpoint, { params });
      const plans = response.data.results || response.data;
      
      return {
        data: Array.isArray(plans) ? plans.map(formatApiPlan) : [formatApiPlan(plans)].filter(Boolean),
        pagination: response.data.results ? {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        } : null
      };
    } catch (error) {
      throw handleApiError(error, `MealPlanService.getMealPlans(${type})`, '식단 계획을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 개인 식단 계획 목록
   */
  async getPersonalMealPlans(params = {}) {
    return this.getMealPlans({ type: 'personal', params });
  },

  /**
   * 공개 식단 계획 목록
   */
  async getPublicMealPlans(params = {}) {
    return this.getMealPlans({ type: 'public', params });
  },

  /**
   * 추천 식단 계획 목록
   */
  async getRecommendedMealPlans(params = {}) {
    return this.getMealPlans({ type: 'recommended', params });
  },

  /**
   * 날짜별 식단 계획 조회
   */
  async getMealPlansByDate(date) {
    const formattedDate = formatDateForApi(date);
    return this.getMealPlans({ 
      type: 'personal', 
      params: { date: formattedDate } 
    });
  },

  /**
   * 식단 계획 상세 조회
   */
  async getMealPlan(mealPlanId) {
    try {
      const response = await api.get(`/diet/mealplans/${mealPlanId}/`);
      return formatApiPlan(response.data);
    } catch (error) {
      throw handleApiError(error, 'MealPlanService.getMealPlan', '식단 계획 상세 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 공개 식단 상세 조회
   */
  async getPublicMealPlan(mealPlanId) {
    try {
      const response = await api.get(`/diet/mealplans/${mealPlanId}/public-detail/`);
      return formatApiPlan(response.data);
    } catch (error) {
      throw handleApiError(error, 'MealPlanService.getPublicMealPlan', '공개 식단 정보를 불러오는데 실패했습니다.');
    }
  },

  /**
   * 식단 계획 생성
   */
  async createMealPlan(planData) {
    try {
      const formattedData = formatMealPlanCreateData(planData);
      console.log('MealPlanService.createMealPlan - 요청 데이터:', JSON.stringify(formattedData, null, 2));
      
      const response = await api.post('/diet/mealplans/', formattedData);
      console.log('MealPlanService.createMealPlan - 응답 성공:', response.data);
      
      return formatApiPlan(response.data);
    } catch (error) {
      console.error('MealPlanService.createMealPlan - 에러 상세:', error.response?.data);
      throw handleApiError(error, 'MealPlanService.createMealPlan', '식단 계획 생성에 실패했습니다.');
    }
  },

  /**
   * 식단 계획 수정
   */
  async updateMealPlan(mealPlanId, planData) {
    try {
      const formattedData = formatMealPlanCreateData(planData);
      const response = await api.put(`/diet/mealplans/${mealPlanId}/`, formattedData);
      return formatApiPlan(response.data);
    } catch (error) {
      throw handleApiError(error, 'MealPlanService.updateMealPlan', '식단 계획 수정에 실패했습니다.');
    }
  },

  /**
   * 식단 계획 부분 수정
   */
  async patchMealPlan(mealPlanId, planData) {
    try {
      const response = await api.patch(`/diet/mealplans/${mealPlanId}/`, planData);
      return formatApiPlan(response.data);
    } catch (error) {
      throw handleApiError(error, 'MealPlanService.patchMealPlan', '식단 계획 부분 수정에 실패했습니다.');
    }
  },

  /**
   * 식단 계획 삭제
   */
  async deleteMealPlan(mealPlanId) {
    try {
      const response = await api.delete(`/diet/mealplans/${mealPlanId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'MealPlanService.deleteMealPlan', '식단 계획 삭제에 실패했습니다.');
    }
  },

  /**
   * 식단 계획 좋아요 토글
   */
  async toggleMealPlanLike(mealPlanId) {
    try {
      const response = await api.post(`/diet/mealplans/${mealPlanId}/like/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'MealPlanService.toggleMealPlanLike', '좋아요 처리에 실패했습니다.');
    }
  }
};

export default mealPlanService; 