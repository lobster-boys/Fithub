import { useState, useCallback } from 'react';
import { mealPlanService } from '../../services/diet/mealPlanService';
import { ERROR_TYPES } from '../../utils/errorHandler';

/**
 * 식단 계획 관련 상태 관리 훅
 */
export const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [publicMealPlans, setPublicMealPlans] = useState([]);
  const [recommendedMealPlans, setRecommendedMealPlans] = useState([]);
  const [todayMealPlan, setTodayMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 에러 상태 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 개인 식단 계획 목록 조회
  const fetchMealPlans = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mealPlanService.getPersonalMealPlans(params);
      setMealPlans(response.data);
      return response;
    } catch (err) {
      if (err.type === ERROR_TYPES.AUTHENTICATION) {
        setMealPlans([]);
        setError(err.message);
        return { data: [], pagination: null };
      }
      
      setError(err.message);
      setMealPlans([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 공개 식단 계획 목록 조회
  const fetchPublicMealPlans = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mealPlanService.getPublicMealPlans(params);
      setPublicMealPlans(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      setPublicMealPlans([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 추천 식단 계획 목록 조회
  const fetchRecommendedMealPlans = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mealPlanService.getRecommendedMealPlans(params);
      setRecommendedMealPlans(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      setRecommendedMealPlans([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 날짜별 식단 계획 조회 (오늘의 식단 포함)
  const fetchMealPlansByDate = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mealPlanService.getMealPlansByDate(date);
      const plans = response.data;
      
      // 오늘 날짜인 경우 todayMealPlan 업데이트
      const today = new Date().toISOString().split('T')[0];
      const targetDate = typeof date === 'string' ? date : date?.toISOString().split('T')[0];
      
      if (targetDate === today && plans.length > 0) {
        const mainPlan = plans[0];
        const combinedMealPlan = {
          ...mainPlan,
          date: today,
          water: 0, // UI에서 필요한 물 섭취량 기본값
          _originalPlans: plans // 원본 계획들 보관
        };
        setTodayMealPlan(combinedMealPlan);
      }
      
      return response;
    } catch (err) {
      if (err.type === ERROR_TYPES.AUTHENTICATION) {
        setError(err.message);
        if (date === today) setTodayMealPlan(null);
        return { data: [], pagination: null };
      }
      
      setError(err.message);
      if (targetDate === today) setTodayMealPlan(null);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 오늘의 식단 계획 조회
  const fetchTodayMealPlan = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    return fetchMealPlansByDate(today);
  }, [fetchMealPlansByDate]);

  // 특정 식단 계획 조회
  const getMealPlan = useCallback(async (mealPlanId) => {
    setLoading(true);
    setError(null);
    
    try {
      const plan = await mealPlanService.getMealPlan(mealPlanId);
      return plan;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 공개 식단 상세 조회
  const getPublicMealPlan = useCallback(async (mealPlanId) => {
    setLoading(true);
    setError(null);
    
    try {
      const plan = await mealPlanService.getPublicMealPlan(mealPlanId);
      return plan;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 계획 생성
  const createMealPlan = useCallback(async (planData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('useMealPlans.createMealPlan - 요청 데이터:', planData);
      
      const newPlan = await mealPlanService.createMealPlan(planData);
      
      console.log('useMealPlans.createMealPlan - 응답 데이터:', newPlan);
      
      // 현재 식단 목록에 새 계획 추가
      setMealPlans(prevPlans => [newPlan, ...prevPlans]);
      
      // 오늘 식단도 새로고침 (오늘 날짜가 포함된 경우)
      const today = new Date().toISOString().split('T')[0];
      if (planData.start_date <= today && planData.end_date >= today) {
        await fetchTodayMealPlan();
      }
      
      return newPlan;
    } catch (err) {
      console.error('useMealPlans.createMealPlan - 에러:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayMealPlan]);

  // 식단 계획 수정
  const updateMealPlan = useCallback(async (mealPlanId, planData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPlan = await mealPlanService.updateMealPlan(mealPlanId, planData);
      
      // 현재 식단 목록에서 수정된 계획 업데이트
      setMealPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === mealPlanId ? updatedPlan : plan
        )
      );
      
      // 오늘 식단이 수정된 경우 업데이트
      if (todayMealPlan && todayMealPlan.id === mealPlanId) {
        setTodayMealPlan(updatedPlan);
      }
      
      return updatedPlan;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [todayMealPlan]);

  // 식단 계획 부분 수정
  const patchMealPlan = useCallback(async (mealPlanId, planData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPlan = await mealPlanService.patchMealPlan(mealPlanId, planData);
      
      // 현재 식단 목록에서 수정된 계획 업데이트
      setMealPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === mealPlanId ? updatedPlan : plan
        )
      );
      
      return updatedPlan;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 계획 삭제
  const deleteMealPlan = useCallback(async (mealPlanId) => {
    setLoading(true);
    setError(null);
    
    try {
      await mealPlanService.deleteMealPlan(mealPlanId);
      
      // 현재 식단 목록에서 삭제된 계획 제거
      setMealPlans(prevPlans => 
        prevPlans.filter(plan => plan.id !== mealPlanId)
      );
      
      // 오늘 식단이 삭제된 경우 초기화
      if (todayMealPlan && todayMealPlan.id === mealPlanId) {
        setTodayMealPlan(null);
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [todayMealPlan]);

  // 식단 계획 좋아요 토글
  const toggleMealPlanLike = useCallback(async (mealPlanId) => {
    try {
      const result = await mealPlanService.toggleMealPlanLike(mealPlanId);
      
      // 공개 식단 목록에서 좋아요 수 업데이트
      setPublicMealPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === mealPlanId 
            ? { ...plan, likes_count: result.likes_count, is_liked: result.is_liked }
            : plan
        )
      );
      
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // 물 섭취량 업데이트 (로컬 상태만)
  const updateWaterIntake = useCallback((amount) => {
    if (todayMealPlan) {
      setTodayMealPlan(prev => ({
        ...prev,
        water: Math.max(0, (prev.water || 0) + amount)
      }));
    }
  }, [todayMealPlan]);

  // 모든 상태 초기화
  const reset = useCallback(() => {
    setMealPlans([]);
    setPublicMealPlans([]);
    setRecommendedMealPlans([]);
    setTodayMealPlan(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // 상태
    mealPlans,
    publicMealPlans,
    recommendedMealPlans,
    todayMealPlan,
    loading,
    error,
    
    // 액션
    fetchMealPlans,
    fetchPublicMealPlans,
    fetchRecommendedMealPlans,
    fetchMealPlansByDate,
    fetchTodayMealPlan,
    getMealPlan,
    getPublicMealPlan,
    createMealPlan,
    updateMealPlan,
    patchMealPlan,
    deleteMealPlan,
    toggleMealPlanLike,
    updateWaterIntake,
    clearError,
    reset
  };
};

export default useMealPlans; 