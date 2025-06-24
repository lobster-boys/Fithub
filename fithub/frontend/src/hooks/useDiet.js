import { useState, useEffect, useCallback } from 'react';
import dietService from '../services/dietService';



// 식단 데이터 관리 커스텀 훅
export const useDiet = () => {
  const [foods, setFoods] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [todayMealPlan, setTodayMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ========== 음식 관련 함수들 ==========

  // 음식 목록 조회
  const fetchFoods = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.getFoods(params);
      const foodsData = response.results || response;
      setFoods(foodsData);
      return foodsData;
    } catch (err) {
      console.error('Failed to fetch foods:', err);
      // 401 에러 시 인증 문제로 간주하고 기본값 설정
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        setFoods([]);
        return [];
      }
      setError('음식 목록을 불러오는데 실패했습니다.');
      // API 실패 시 빈 배열 반환
      setFoods([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 음식 검색
  const searchFoods = useCallback(async (query) => {
    if (!query.trim()) {
      return fetchFoods();
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.searchFoods(query);
      const foodsData = response.results || response;
      setFoods(foodsData);
      return foodsData;
    } catch (err) {
      console.error('Failed to search foods:', err);
      // 401 에러 시 인증 문제로 간주
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        setFoods([]);
        return [];
      }
      setError('음식 검색에 실패했습니다.');
      setFoods([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchFoods]);

  // 특정 음식 상세 조회
  const getFoodById = useCallback(async (foodId) => {
    setLoading(true);
    setError(null);
    try {
      const foodData = await dietService.getFood(foodId);
      return foodData;
    } catch (err) {
      console.error('Failed to fetch food by ID:', err);
      // 401 에러 시 인증 문제로 간주
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      setError('음식 정보를 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== 식단 계획 관련 함수들 ==========

  // 식단 계획 목록 조회 (백엔드 데이터 직접 사용)
  const fetchMealPlans = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.getMealPlans(params);
      
      // 백엔드 응답 데이터를 직접 사용 (페이지네이션 포함)
      const rawMealPlansData = response.results || response;
      const mealPlansArray = Array.isArray(rawMealPlansData) ? rawMealPlansData : [];

      setMealPlans(mealPlansArray);
      return mealPlansArray;
    } catch (err) {
      console.error('Failed to fetch meal plans:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        setMealPlans([]);
        return [];
      }
      setError('식단 계획을 불러오는데 실패했습니다.');
      setMealPlans([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 오늘의 식단 계획 조회 (백엔드 구조 직접 사용)
  const fetchTodayMealPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await dietService.getMealPlansByDate(today);
      
      console.log('fetchTodayMealPlan - 응답 데이터:', response);
      
      // 응답 데이터 구조 확인 (페이지네이션 지원)
      const rawData = response.results || response;
      const todayPlans = Array.isArray(rawData) ? rawData : [rawData].filter(Boolean);
      
      console.log('fetchTodayMealPlan - 파싱된 데이터:', todayPlans);
      
      if (todayPlans.length === 0) {
        setTodayMealPlan(null);
        return null;
      }
      
      // 백엔드 구조를 직접 사용
      const mainPlan = todayPlans[0];
      
      const combinedMealPlan = {
        ...mainPlan,
        date: today,
        water: 0, // UI에서 필요한 물 섭취량 기본값
        _originalPlans: todayPlans // 원본 계획들 보관 (삭제 등에 필요)
      };
      
      console.log('fetchTodayMealPlan - 최종 데이터:', combinedMealPlan);
      
      setTodayMealPlan(combinedMealPlan);
      return combinedMealPlan;
    } catch (err) {
      console.error('Failed to fetch today meal plan:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        setTodayMealPlan(null);
        return null;
      }
      setError('오늘의 식단을 불러오는데 실패했습니다.');
      setTodayMealPlan(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 계획 생성 (백엔드 응답 직접 사용)
  const createMealPlan = useCallback(async (planData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('useDiet.createMealPlan - 요청 데이터:', JSON.stringify(planData, null, 2));
      
      const newPlan = await dietService.createMealPlan(planData);
      
      console.log('useDiet.createMealPlan - 응답 데이터:', JSON.stringify(newPlan, null, 2));
      
      // 백엔드 응답을 직접 사용하여 상태 업데이트
      setMealPlans(prevPlans => [newPlan, ...prevPlans]);
      
      // 오늘 식단도 새로고침 (식사 기록 섹션에 반영되도록)
      const today = new Date().toISOString().split('T')[0];
      if (planData.start_date === today || planData.end_date === today) {
        await fetchTodayMealPlan();
      }
      
      return newPlan;
    } catch (err) {
      console.error('Failed to create meal plan:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      setError('식단 계획 생성에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayMealPlan]);

  // 식단 계획 수정 (백엔드 응답 직접 사용)
  const updateMealPlan = useCallback(async (mealPlanId, mealPlanData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedMealPlan = await dietService.updateMealPlan(mealPlanId, mealPlanData);
      
      // 로컬 상태 업데이트
      await fetchMealPlans();
      if (todayMealPlan?.id === mealPlanId) {
        await fetchTodayMealPlan();
      }
      return updatedMealPlan;
    } catch (err) {
      console.error('Failed to update meal plan:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      setError('식단 계획 수정에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMealPlans, fetchTodayMealPlan, todayMealPlan]);

  // 식단 계획 삭제 (백엔드 응답 직접 사용)
  const deleteMealPlan = useCallback(async (mealPlanId) => {
    setLoading(true);
    setError(null);
    try {
      await dietService.deleteMealPlan(mealPlanId);
      
      // 로컬 상태 업데이트
      await fetchMealPlans();
      if (todayMealPlan?.id === mealPlanId) {
        await fetchTodayMealPlan();
      }
      return true;
    } catch (err) {
      console.error('Failed to delete meal plan:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return false;
      }
      setError('식단 계획 삭제에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMealPlans, fetchTodayMealPlan, todayMealPlan]);

  // ========== 새로운 MealPlan 관련 함수들 ==========

  // 공개 식단 목록 조회
  const fetchPublicMealPlans = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.getPublicMealPlans(params);
      return response;
    } catch (err) {
      console.error('Failed to fetch public meal plans:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return [];
      }
      setError('공개 식단 목록을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 추천 식단 목록 조회
  const fetchRecommendedMealPlans = useCallback(async (userGoal = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.getRecommendedMealPlans();
      return response;
    } catch (err) {
      console.error('Failed to fetch recommended meal plans:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return [];
      }
      setError('추천 식단을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 좋아요/좋아요 취소
  const toggleMealPlanLike = useCallback(async (mealPlanId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.toggleMealPlanLike(mealPlanId);
      return response;
    } catch (err) {
      console.error('Failed to toggle meal plan like:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.detail || '좋아요 처리에 실패했습니다.');
      } else {
        setError('좋아요 처리에 실패했습니다.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 공개 식단 상세 조회
  const fetchPublicMealPlanDetail = useCallback(async (mealPlanId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.getPublicMealPlan(mealPlanId);
      return response;
    } catch (err) {
      console.error('Failed to fetch public meal plan detail:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      setError('식단 상세 정보를 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 계획 복사하기 (공개 식단을 개인 식단으로)
  const copyPublicMealPlan = useCallback(async (publicMealPlanId, customizations = {}) => {
    setLoading(true);
    setError(null);
    try {
      // 공개 식단 상세 정보 가져오기
      const publicMealPlan = await fetchPublicMealPlanDetail(publicMealPlanId);
      if (!publicMealPlan) {
        throw new Error('공개 식단을 찾을 수 없습니다.');
      }

      // 새로운 식단 데이터 구성
      const newMealPlanData = {
        name: customizations.name || `${publicMealPlan.name} (복사본)`,
        description: customizations.description || publicMealPlan.description,
        start_date: customizations.start_date || new Date().toISOString().split('T')[0],
        end_date: customizations.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: customizations.is_active ?? false,
        is_public: false, // 복사본은 기본적으로 비공개
        target_goal: customizations.target_goal || publicMealPlan.target_goal,
        target_calories_min: customizations.target_calories_min || publicMealPlan.target_calories_min,
        target_calories_max: customizations.target_calories_max || publicMealPlan.target_calories_max,
        difficulty: customizations.difficulty || publicMealPlan.difficulty,
        items: publicMealPlan.items || []
      };

      const newMealPlan = await createMealPlan(newMealPlanData);
      return newMealPlan;
    } catch (err) {
      console.error('Failed to copy public meal plan:', err);
      setError('식단 복사에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPublicMealPlanDetail, createMealPlan]);

  // ========== 로컬 계산 및 유틸리티 함수들 ==========





  // 칼로리 계산 (식사별)
  const calculateMealCalories = useCallback((foods) => {
    if (!foods || !Array.isArray(foods)) return 0;
    // 간단한 음식별 칼로리 추정 (실제로는 음식 DB에서 가져와야 함)
    return foods.reduce((total, food) => {
      // 기본 칼로리 추정값 (실제 구현에서는 foods API에서 가져옴)
      const estimatedCalories = typeof food === 'object' ? food.calories || 100 : 100;
      return total + estimatedCalories;
    }, 0);
  }, []);

  // 영양소 계산 (식사별)
  const calculateNutrients = useCallback((foods) => {
    if (!foods || !Array.isArray(foods)) {
      return { protein: 0, carbs: 0, fat: 0, fiber: 0 };
    }
    
    return foods.reduce((total, food) => {
      // 기본 영양소 추정값 (실제 구현에서는 foods API에서 가져옴)
      const nutrients = typeof food === 'object' ? food.nutrients || {} : {};
      return {
        protein: total.protein + (nutrients.protein || 0),
        carbs: total.carbs + (nutrients.carbs || 0),
        fat: total.fat + (nutrients.fat || 0),
        fiber: total.fiber + (nutrients.fiber || 0)
      };
    }, { protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, []);

  // 물 섭취량 관리 (로컬 저장)
  const updateWaterIntake = useCallback((amount) => {
    if (todayMealPlan) {
      const updatedPlan = {
        ...todayMealPlan,
        water: Math.max(0, (todayMealPlan.water || 0) + amount)
      };
      setTodayMealPlan(updatedPlan);
      
      // localStorage에 저장 (임시)
      localStorage.setItem(`water-intake-${updatedPlan.date}`, updatedPlan.water.toString());
    }
  }, [todayMealPlan]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 병렬로 데이터 로드
        await Promise.all([
          fetchFoods(),
          fetchMealPlans(),
          fetchTodayMealPlan()
        ]);
      } catch (err) {
        console.error('Failed to initialize diet data:', err);
      }
    };

    initializeData();
  }, [fetchFoods, fetchMealPlans, fetchTodayMealPlan]);

  // ========== 추천 관련 함수들 ==========

  // 기본 식단 추천 조회
  const getBasicRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('useDiet: Starting basic recommendation fetch');
      const response = await dietService.getBasicRecommendation();
      console.log('useDiet: Basic recommendation fetch successful:', response);
      
      if (response.status === 'success' && response.data) {
        return response.data;
      } else {
        throw new Error(response.detail || '추천 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('useDiet: Basic recommendation fetch error:', err);
      
      // 401 에러 시 인증 문제로 간주
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      
      // 400 에러 시 목표 칼로리 미설정 문제
      if (err.response?.status === 400) {
        setError('목표 칼로리가 설정되지 않았습니다. 프로필에서 목표 칼로리를 설정해주세요.');
        return null;
      }
      
      setError('식단 추천을 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 식사 타입 추천 조회
  const getRecommendationByMealType = useCallback(async (mealType) => {
    setLoading(true);
    setError(null);
    try {
      console.log('useDiet: Starting meal type recommendation fetch for:', mealType);
      const response = await dietService.getRecommendationByMealType(mealType);
      console.log('useDiet: Meal type recommendation fetch successful:', response);
      
      if (response.status === 'success' && response.data) {
        return response.data;
      } else {
        throw new Error(response.detail || '추천 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('useDiet: Meal type recommendation fetch error:', err);
      
      // 401 에러 시 인증 문제로 간주
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      
      // 400 에러 시 목표 칼로리 미설정 문제
      if (err.response?.status === 400) {
        setError('목표 칼로리가 설정되지 않았습니다. 프로필에서 목표 칼로리를 설정해주세요.');
        return null;
      }
      
      setError(`${mealType} 식사 추천을 불러오는데 실패했습니다.`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== 식단 로그 관련 함수들 ==========

  // 식단 로그 목록 조회
  const fetchDietLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.getDietLogs(params);
      const rawData = response.results || response;
      const dietLogsArray = Array.isArray(rawData) ? rawData : [];
      return dietLogsArray;
    } catch (err) {
      console.error('Failed to fetch diet logs:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return [];
      }
      setError('식단 로그를 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 로그 생성
  const createDietLog = useCallback(async (dietLogData) => {
    setLoading(true);
    setError(null);
    try {
      const newDietLog = await dietService.createDietLog(dietLogData);
      
      // 오늘 식단 새로고침 (오늘 날짜의 로그인 경우)
      const today = new Date().toISOString().split('T')[0];
      if (dietLogData.date === today) {
        await fetchTodayMealPlan();
      }
      
      return newDietLog;
    } catch (err) {
      console.error('Failed to create diet log:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      setError('식단 로그 생성에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayMealPlan]);

  // 식단 로그 수정
  const updateDietLog = useCallback(async (dietLogId, dietLogData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedDietLog = await dietService.updateDietLog(dietLogId, dietLogData);
      
      // 오늘 식단 새로고침
      await fetchTodayMealPlan();
      
      return updatedDietLog;
    } catch (err) {
      console.error('Failed to update diet log:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      setError('식단 로그 수정에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayMealPlan]);

  // 식단 로그 삭제
  const deleteDietLog = useCallback(async (dietLogId) => {
    setLoading(true);
    setError(null);
    try {
      await dietService.deleteDietLog(dietLogId);
      
      // 오늘 식단 새로고침
      await fetchTodayMealPlan();
      
      return true;
    } catch (err) {
      console.error('Failed to delete diet log:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return false;
      }
      setError('식단 로그 삭제에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayMealPlan]);

  // 식단 로그 통계 조회
  const fetchDietLogStats = useCallback(async (date = null) => {
    setLoading(true);
    setError(null);
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const stats = await dietService.getDietLogStats(targetDate);
      return stats;
    } catch (err) {
      console.error('Failed to fetch diet log stats:', err);
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      setError('식단 통계를 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);



  return {
    // 상태
    foods,
    mealPlans,
    todayMealPlan,
    loading,
    error,

    // 음식 관련 함수들
    fetchFoods,
    searchFoods,
    getFoodById,

    // 식단 계획 관련 함수들
    fetchMealPlans,
    fetchTodayMealPlan,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,

    // 새로운 MealPlan 관련 함수들
    fetchPublicMealPlans,
    fetchRecommendedMealPlans,
    toggleMealPlanLike,
    fetchPublicMealPlanDetail,
    copyPublicMealPlan,

    // 추천 관련 함수들
    getBasicRecommendation,
    getRecommendationByMealType,

    // 식단 로그 관련 함수들
    fetchDietLogs,
    createDietLog,
    updateDietLog,
    deleteDietLog,
    fetchDietLogStats,

    // 유틸리티 함수들
    calculateMealCalories,
    calculateNutrients,
    updateWaterIntake,

    // 새로고침 함수
    refetch: async () => {
      await Promise.all([
        fetchFoods(),
        fetchMealPlans(),
        fetchTodayMealPlan()
      ]);
    }
  };
};

// 식단 통계 관리 커스텀 훅
export const useDietStats = (period = 'week') => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 백엔드 통계 API가 없으므로 MealPlan 데이터로 계산
      const endDate = new Date();
      const startDate = new Date();
      
      // 기간 설정
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const response = await dietService.getMealPlansByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      const mealPlans = response.results || response || [];
      
      // 통계 계산
      const totalCalories = mealPlans.reduce((sum, plan) => sum + (plan.totalCalories || 0), 0);
      const totalMeals = mealPlans.reduce((sum, plan) => sum + (plan.meals?.length || 0), 0);
      const totalWater = mealPlans.reduce((sum, plan) => sum + (plan.water || 0), 0);
      const daysCount = mealPlans.length || 1;
      
      const calculatedStats = {
        totalCalories,
        avgCalories: Math.round(totalCalories / daysCount),
        totalMeals,
        totalWater,
        avgWater: Math.round(totalWater / daysCount),
        daysCount
      };
      
      setStats(calculatedStats);
      return calculatedStats;
    } catch (err) {
      console.error('Failed to fetch diet stats:', err);
      
      // 401 에러 시 인증 문제로 간주
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        setStats(null);
        return null;
      }
      
      setError('식단 통계를 불러오는데 실패했습니다.');
      setStats(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

// 식단 추천 관리 커스텀 훅
export const useDietRecommendation = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 기본 추천 조회
  const fetchBasicRecommendation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useDietRecommendation: Starting basic recommendation fetch');
      const data = await dietService.getBasicRecommendation();
      console.log('useDietRecommendation: Basic recommendation fetch successful');
      setRecommendations(data);
      return data;
    } catch (err) {
      console.error('useDietRecommendation: Basic recommendation fetch error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.message,
        url: err.config?.url
      });
      
      // 401 (인증 오류) 에러는 재시도하지 않고 조용히 처리
      if (err.response?.status === 401) {
        console.log('useDietRecommendation: 401 Unauthorized - authentication required');
        setError('로그인이 필요한 서비스입니다.');
        // 401 에러 시에는 샘플 데이터도 제공하지 않음
        setRecommendations(null);
        return null;
      }
      
      if (err.response?.status === 404 || err.response?.status === 500) {
        console.log('useDietRecommendation: API not available, providing sample data');
        // 백엔드 API가 구현되지 않은 경우 샘플 데이터 제공
        const sampleData = {
          summary: {
            total_calories: 2000,
            meal_count: 3,
            food_count: 9
          },
          meals: [
            {
              meal_type: 'breakfast',
              total_calories: 600,
              foods: [
                { name: '오트밀', calories: 150, protein: 5, carbs: 27, fat: 3 },
                { name: '바나나', calories: 90, protein: 1, carbs: 23, fat: 0 },
                { name: '저지방 우유', calories: 80, protein: 8, carbs: 12, fat: 0 }
              ]
            },
            {
              meal_type: 'lunch',
              total_calories: 700,
              foods: [
                { name: '현미밥', calories: 220, protein: 5, carbs: 45, fat: 2 },
                { name: '닭가슴살', calories: 165, protein: 31, carbs: 0, fat: 4 },
                { name: '브로콜리', calories: 25, protein: 3, carbs: 5, fat: 0 }
              ]
            },
            {
              meal_type: 'dinner',
              total_calories: 700,
              foods: [
                { name: '연어구이', calories: 250, protein: 35, carbs: 0, fat: 12 },
                { name: '고구마', calories: 100, protein: 2, carbs: 23, fat: 0 },
                { name: '샐러드', calories: 50, protein: 3, carbs: 10, fat: 0 }
              ]
            }
          ]
        };
        setRecommendations(sampleData);
        return sampleData;
      }
      
      // 기타 에러의 경우 에러 메시지 설정
      setError('기본 식단 추천을 불러오는데 실패했습니다.');
      setRecommendations(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 맞춤형 추천 조회
  const fetchCustomRecommendation = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useDietRecommendation: Starting custom recommendation fetch with options:', options);
      const data = await dietService.getCustomRecommendation(options);
      console.log('useDietRecommendation: Custom recommendation fetch successful');
      setRecommendations(data);
      return data;
    } catch (err) {
      console.error('useDietRecommendation: Custom recommendation fetch error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.message,
        url: err.config?.url,
        options
      });
      
      // 401 (인증 오류) 에러는 재시도하지 않고 조용히 처리
      if (err.response?.status === 401) {
        console.log('useDietRecommendation: 401 Unauthorized - authentication required');
        setError('로그인이 필요한 서비스입니다.');
        setRecommendations(null);
        return null;
      }
      
      setError('맞춤형 식단 추천을 불러오는데 실패했습니다.');
      setRecommendations(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 음식들을 기반으로 한 추천
  const fetchRecommendationWithFoods = useCallback(async (foodIds, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dietService.getRecommendationWithFoods(foodIds, options);
      setRecommendations(data);
      return data;
    } catch (err) {
      console.error('Food-based recommendation fetch error:', err);
      
      // 401 (인증 오류) 에러는 재시도하지 않고 조용히 처리
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      
      setError('음식 기반 식단 추천을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 식사 타입에 대한 추천
  const fetchRecommendationByMealType = useCallback(async (mealType, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dietService.getRecommendationByMealType(mealType, options);
      setRecommendations(data);
      return data;
    } catch (err) {
      console.error('Meal type recommendation fetch error:', err);
      
      // 401 (인증 오류) 에러는 재시도하지 않고 조용히 처리
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        return null;
      }
      
      setError('식사 타입별 식단 추천을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 추천 결과 초기화
  const clearRecommendations = useCallback(() => {
    setRecommendations(null);
    setError(null);
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    recommendations,
    loading,
    error,

    // 추천 관련 함수들
    fetchBasicRecommendation,
    fetchCustomRecommendation,
    fetchRecommendationWithFoods,
    fetchRecommendationByMealType,

    // 유틸리티 함수들
    clearRecommendations,
    clearError
  };
};

export default useDiet; 