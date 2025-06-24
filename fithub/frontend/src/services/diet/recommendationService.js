import api from '../api';
import { handleApiError } from '../../utils/errorHandler';
import { formatRecommendationData } from '../../utils/dietTransformers';

/**
 * 식단 추천 관련 API 서비스
 */
export const recommendationService = {
  /**
   * 전체 식단 추천 (아침, 점심, 저녁)
   */
  async getFullDayRecommendation() {
    try {
      console.log('전체 식단 추천 API 호출 시작');
      const response = await api.get('/diet/recommend/');
      
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);
      console.log('API 응답 원본 데이터:', response.data);
      
      if (response.data.status === 'success') {
        console.log('추천 데이터 변환 전:', response.data.data);
        const formattedData = formatRecommendationData(response.data.data);
        console.log('추천 데이터 변환 후:', formattedData);
        return formattedData;
      } else {
        console.error('API 응답 실패:', response.data);
        throw new Error(response.data.detail || '추천 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('전체 식단 추천 API 오류:', error);
      throw handleApiError(error, 'RecommendationService.getFullDayRecommendation', '전체 식단 추천을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 특정 식사 시간대 추천
   */
  async getMealTypeRecommendation(mealType) {
    try {
      const validMealTypes = ['breakfast', 'lunch', 'dinner'];
      if (!validMealTypes.includes(mealType)) {
        throw new Error('meal_type은 breakfast, lunch, dinner 중 하나여야 합니다.');
      }

      console.log(`특정 시간대 추천 API 호출: ${mealType}`);
      const response = await api.post('/diet/recommend/', {
        meal_type: mealType
      });
      
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 원본 데이터:', response.data);
      
      if (response.data.status === 'success') {
        console.log('추천 데이터 변환 전:', response.data.data);
        const formattedData = formatRecommendationData(response.data.data);
        console.log('추천 데이터 변환 후:', formattedData);
        return formattedData;
      } else {
        console.error('API 응답 실패:', response.data);
        throw new Error(response.data.detail || '추천 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error(`${mealType} 추천 API 오류:`, error);
      throw handleApiError(error, 'RecommendationService.getMealTypeRecommendation', `${mealType} 추천을 불러오는데 실패했습니다.`);
    }
  },

  /**
   * 아침 식사 추천
   */
  async getBreakfastRecommendation() {
    return this.getMealTypeRecommendation('breakfast');
  },

  /**
   * 점심 식사 추천
   */
  async getLunchRecommendation() {
    return this.getMealTypeRecommendation('lunch');
  },

  /**
   * 저녁 식사 추천
   */
  async getDinnerRecommendation() {
    return this.getMealTypeRecommendation('dinner');
  },

  /**
   * 사용자 맞춤 추천 (목표 칼로리 기반)
   */
  async getPersonalizedRecommendation(preferences = {}) {
    try {
      // 기본적으로 전체 추천을 받되, 향후 개인화 옵션 추가 가능
      const recommendations = await this.getFullDayRecommendation();
      
      // 개인화 필터링 로직 (향후 확장 가능)
      if (preferences.excludeCategories && Array.isArray(preferences.excludeCategories)) {
        return this.filterRecommendationsByCategory(recommendations, preferences.excludeCategories);
      }
      
      return recommendations;
    } catch (error) {
      throw handleApiError(error, 'RecommendationService.getPersonalizedRecommendation', '개인 맞춤 추천을 불러오는데 실패했습니다.');
    }
  },

  /**
   * 카테고리별 추천 필터링 (클라이언트 사이드)
   */
  filterRecommendationsByCategory(recommendations, excludeCategories) {
    if (!Array.isArray(recommendations) || !Array.isArray(excludeCategories)) {
      return recommendations;
    }

    return recommendations.map(mealRec => ({
      ...mealRec,
      foods: mealRec.foods.filter(food => 
        !excludeCategories.includes(food.category)
      )
    })).filter(mealRec => mealRec.foods.length > 0);
  },

  /**
   * 추천 결과를 식단 기록으로 변환하는 헬퍼 함수
   */
  convertRecommendationToLogs(recommendations, date = null) {
    if (!Array.isArray(recommendations)) {
      return [];
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const logs = [];

    recommendations.forEach(mealRec => {
      if (mealRec.foods && Array.isArray(mealRec.foods)) {
        mealRec.foods.forEach(food => {
          logs.push({
            food_id: food.id,
            date: targetDate,
            meal_type: mealRec.meal_type,
            quantity: 100, // 기본 100g
            calories: food.calories
          });
        });
      }
    });

    return logs;
  },

  /**
   * 추천 기반 식단 기록 생성 요청 데이터 포맷
   */
  formatRecommendationForLog(recommendations, date = null) {
    const logs = this.convertRecommendationToLogs(recommendations, date);
    
    return {
      recommendations: logs,
      date: date || new Date().toISOString().split('T')[0]
    };
  }
};

export default recommendationService; 