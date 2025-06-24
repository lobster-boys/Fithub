import { useState, useCallback } from 'react';
import { recommendationService } from '../../services/diet/recommendationService';

/**
 * 식단 추천 관련 상태 관리 훅
 */
export const useDietRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  // 에러 상태 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 추천 데이터 초기화
  const clearRecommendations = useCallback(() => {
    setRecommendations(null);
  }, []);

  // 전체 식단 추천 (아침, 점심, 저녁)
  const getBasicRecommendation = useCallback(async () => {
    if (isRequestInProgress) {
      console.log('추천 요청이 이미 진행 중입니다.');
      return;
    }
    
    setIsRequestInProgress(true);
    setLoading(true);
    setError(null);
    
    try {
      const recommendationsData = await recommendationService.getFullDayRecommendation();
      setRecommendations(recommendationsData);
      return recommendationsData;
    } catch (err) {
      setError(err.message);
      setRecommendations(null);
      return null;
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  }, [isRequestInProgress]);

  // 특정 식사 시간대 추천
  const getRecommendationByMealType = useCallback(async (mealType) => {
    if (isRequestInProgress) {
      console.log('추천 요청이 이미 진행 중입니다.');
      return;
    }
    
    setIsRequestInProgress(true);
    setLoading(true);
    setError(null);
    
    try {
      const recommendationsData = await recommendationService.getMealTypeRecommendation(mealType);
      setRecommendations(recommendationsData);
      return recommendationsData;
    } catch (err) {
      setError(err.message);
      setRecommendations(null);
      return null;
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  }, [isRequestInProgress]);

  // 아침 식사 추천
  const getBreakfastRecommendation = useCallback(async () => {
    return getRecommendationByMealType('breakfast');
  }, [getRecommendationByMealType]);

  // 점심 식사 추천
  const getLunchRecommendation = useCallback(async () => {
    return getRecommendationByMealType('lunch');
  }, [getRecommendationByMealType]);

  // 저녁 식사 추천
  const getDinnerRecommendation = useCallback(async () => {
    return getRecommendationByMealType('dinner');
  }, [getRecommendationByMealType]);

  // 사용자 맞춤 추천
  const getPersonalizedRecommendation = useCallback(async (preferences = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const recommendationsData = await recommendationService.getPersonalizedRecommendation(preferences);
      setRecommendations(recommendationsData);
      return recommendationsData;
    } catch (err) {
      setError(err.message);
      setRecommendations(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 추천 결과를 식단 기록 데이터로 변환
  const convertRecommendationToLogs = useCallback((recommendationsData = null, date = null) => {
    const dataToConvert = recommendationsData || recommendations;
    if (!dataToConvert) return [];
    
    return recommendationService.convertRecommendationToLogs(dataToConvert, date);
  }, [recommendations]);

  // 추천 기반 식단 기록 생성을 위한 데이터 포맷
  const formatRecommendationForLog = useCallback((recommendationsData = null, date = null) => {
    const dataToConvert = recommendationsData || recommendations;
    if (!dataToConvert) return null;
    
    return recommendationService.formatRecommendationForLog(dataToConvert, date);
  }, [recommendations]);

  // 추천 데이터에서 총 칼로리 계산
  const getTotalCalories = useCallback((recommendationsData = null) => {
    const dataToCalculate = recommendationsData || recommendations;
    if (!Array.isArray(dataToCalculate)) return 0;
    
    return dataToCalculate.reduce((total, mealRec) => {
      if (!mealRec.foods || !Array.isArray(mealRec.foods)) return total;
      
      const mealCalories = mealRec.foods.reduce((mealTotal, food) => {
        return mealTotal + (parseFloat(food.calories) || 0);
      }, 0);
      
      return total + mealCalories;
    }, 0);
  }, [recommendations]);

  // 추천 데이터에서 영양소 정보 계산
  const getTotalNutrients = useCallback((recommendationsData = null) => {
    const dataToCalculate = recommendationsData || recommendations;
    if (!Array.isArray(dataToCalculate)) {
      return { protein: 0, carbs: 0, fat: 0 };
    }
    
    const totals = { protein: 0, carbs: 0, fat: 0 };
    
    dataToCalculate.forEach(mealRec => {
      if (mealRec.foods && Array.isArray(mealRec.foods)) {
        mealRec.foods.forEach(food => {
          totals.protein += parseFloat(food.protein) || 0;
          totals.carbs += parseFloat(food.carbs) || 0;
          totals.fat += parseFloat(food.fat) || 0;
        });
      }
    });
    
    return {
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat)
    };
  }, [recommendations]);

  // 식사별 통계 정보 계산
  const getMealStatistics = useCallback((recommendationsData = null) => {
    const dataToCalculate = recommendationsData || recommendations;
    if (!Array.isArray(dataToCalculate)) return [];
    
    return dataToCalculate.map(mealRec => {
      const mealCalories = mealRec.foods?.reduce((total, food) => {
        return total + (parseFloat(food.calories) || 0);
      }, 0) || 0;
      
      const mealNutrients = mealRec.foods?.reduce((totals, food) => {
        totals.protein += parseFloat(food.protein) || 0;
        totals.carbs += parseFloat(food.carbs) || 0;
        totals.fat += parseFloat(food.fat) || 0;
        return totals;
      }, { protein: 0, carbs: 0, fat: 0 }) || { protein: 0, carbs: 0, fat: 0 };
      
      return {
        meal_type: mealRec.meal_type,
        calories: Math.round(mealCalories),
        nutrients: {
          protein: Math.round(mealNutrients.protein),
          carbs: Math.round(mealNutrients.carbs),
          fat: Math.round(mealNutrients.fat)
        },
        foodCount: mealRec.foods?.length || 0
      };
    });
  }, [recommendations]);

  // 카테고리별 필터링 (클라이언트 사이드)
  const filterByCategories = useCallback((excludeCategories, recommendationsData = null) => {
    const dataToFilter = recommendationsData || recommendations;
    if (!dataToFilter || !Array.isArray(excludeCategories)) return dataToFilter;
    
    const filtered = recommendationService.filterRecommendationsByCategory(dataToFilter, excludeCategories);
    
    // 현재 상태 업데이트 (원본 데이터를 전달한 경우에만)
    if (!recommendationsData) {
      setRecommendations(filtered);
    }
    
    return filtered;
  }, [recommendations]);

  // 모든 상태 초기화
  const reset = useCallback(() => {
    setRecommendations(null);
    setError(null);
    setLoading(false);
    setIsRequestInProgress(false);
  }, []);

  return {
    // 상태
    recommendations,
    loading,
    error,
    
    // 추천 액션
    getBasicRecommendation,
    getRecommendationByMealType,
    getBreakfastRecommendation,
    getLunchRecommendation,
    getDinnerRecommendation,
    getPersonalizedRecommendation,
    
    // 유틸리티
    convertRecommendationToLogs,
    formatRecommendationForLog,
    getTotalCalories,
    getTotalNutrients,
    getMealStatistics,
    filterByCategories,
    
    // 기타
    clearError,
    clearRecommendations,
    reset
  };
};

export default useDietRecommendations; 