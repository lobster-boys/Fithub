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

  // 식단 계획 목록 조회
  const fetchMealPlans = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietService.getMealPlans(params);
      const mealPlansData = response.results || response;
      setMealPlans(mealPlansData);
      return mealPlansData;
    } catch (err) {
      console.error('Failed to fetch meal plans:', err);
      // 401 에러 시 인증 문제로 간주하고 기본값 설정
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        // API 실패 시 기본 추천 식단 제공
        const defaultMealPlans = getDefaultMealPlans();
        setMealPlans(defaultMealPlans);
        return defaultMealPlans;
      }
      setError('식단 계획을 불러오는데 실패했습니다.');
      
      // API 실패 시 기본 추천 식단 제공
      const defaultMealPlans = getDefaultMealPlans();
      setMealPlans(defaultMealPlans);
      return defaultMealPlans;
    } finally {
      setLoading(false);
    }
  }, []);

  // 오늘의 식단 계획 조회
  const fetchTodayMealPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await dietService.getMealPlansByDate(today);
      const todayPlan = response.results?.[0] || response[0] || null;
      
      // API에서 데이터가 없으면 기본 구조 생성
      if (!todayPlan) {
        const defaultTodayPlan = createDefaultTodayPlan();
        setTodayMealPlan(defaultTodayPlan);
        return defaultTodayPlan;
      }
      
      setTodayMealPlan(todayPlan);
      return todayPlan;
    } catch (err) {
      console.error('Failed to fetch today meal plan:', err);
      // 401 에러 시 인증 문제로 간주하고 기본값 설정
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        // API 실패 시 기본 오늘 식단 생성
        const defaultTodayPlan = createDefaultTodayPlan();
        setTodayMealPlan(defaultTodayPlan);
        return defaultTodayPlan;
      }
      setError('오늘의 식단을 불러오는데 실패했습니다.');
      
      // API 실패 시 기본 오늘 식단 생성
      const defaultTodayPlan = createDefaultTodayPlan();
      setTodayMealPlan(defaultTodayPlan);
      return defaultTodayPlan;
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 계획 생성
  const createMealPlan = useCallback(async (mealPlanData) => {
    setLoading(true);
    setError(null);
    try {
      const newMealPlan = await dietService.createMealPlan(mealPlanData);
      // 로컬 상태 업데이트
      await fetchMealPlans();
      return newMealPlan;
    } catch (err) {
      console.error('Failed to create meal plan:', err);
      setError('식단 계획 생성에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMealPlans]);

  // 식단 계획 수정
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
      setError('식단 계획 수정에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMealPlans, fetchTodayMealPlan, todayMealPlan]);

  // 식단 계획 삭제
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
      setError('식단 계획 삭제에 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMealPlans, fetchTodayMealPlan, todayMealPlan]);

  // ========== 로컬 계산 및 유틸리티 함수들 ==========

  // 기본 추천 식단 생성 (API 실패 시 fallback)
  const getDefaultMealPlans = useCallback(() => {
    return [
      {
        id: 'default-1',
        title: '고단백 다이어트 식단',
        type: '체중 감량',
        calories: 1500,
        meals: [
          { name: '아침', foods: ['계란 흰자', '오트밀', '베리'], calories: 300 },
          { name: '점심', foods: ['닭가슴살', '현미', '브로콜리'], calories: 450 },
          { name: '저녁', foods: ['연어', '아스파라거스', '고구마'], calories: 400 },
          { name: '간식', foods: ['그릭 요거트', '견과류'], calories: 250 }
        ],
        nutrients: { protein: 120, carbs: 150, fat: 45 },
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 'default-2',
        title: '근육 증가 식단',
        type: '근육 증가',
        calories: 2200,
        meals: [
          { name: '아침', foods: ['오트밀', '바나나', '프로틴'], calories: 450 },
          { name: '점심', foods: ['소고기', '현미', '야채'], calories: 650 },
          { name: '저녁', foods: ['닭가슴살', '고구마', '아보카도'], calories: 550 },
          { name: '간식', foods: ['견과류', '우유', '과일'], calories: 350 }
        ],
        nutrients: { protein: 150, carbs: 220, fat: 70 },
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
      },
      {
        id: 'default-3',
        title: '균형 잡힌 건강 식단',
        type: '건강 유지',
        calories: 1800,
        meals: [
          { name: '아침', foods: ['통곡물 빵', '아보카도', '계란'], calories: 380 },
          { name: '점심', foods: ['퀴노아', '연어', '샐러드'], calories: 480 },
          { name: '저녁', foods: ['두부', '현미', '야채'], calories: 420 },
          { name: '간식', foods: ['과일', '요거트'], calories: 200 }
        ],
        nutrients: { protein: 90, carbs: 180, fat: 60 },
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
      }
    ];
  }, []);

  // 기본 오늘 식단 생성
  const createDefaultTodayPlan = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      id: `today-${today}`,
      date: today,
      meals: [
        { name: '아침', foods: ['그릭 요거트', '블루베리', '그래놀라'], calories: 320, time: '08:00' },
        { name: '간식', foods: ['사과', '아몬드 버터'], calories: 200, time: '10:30' },
        { name: '점심', foods: ['그릴드 치킨', '퀴노아', '브로콜리'], calories: 450, time: '12:30' }
      ],
      totalCalories: 970,
      targetCalories: 1800,
      water: 6 // 물 섭취량 (잔)
    };
  }, []);

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

    // 유틸리티 함수들
    calculateMealCalories,
    calculateNutrients,
    updateWaterIntake,
    getDefaultMealPlans,

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
      
      // 401 에러 시 인증 문제로 간주하고 기본 통계 제공
      if (err.response?.status === 401) {
        setError('로그인이 필요한 서비스입니다.');
        // API 실패 시 기본 통계 제공
        const defaultStats = {
          totalCalories: 2220,
          avgCalories: 1110,
          totalMeals: 6,
          totalWater: 14,
          avgWater: 7,
          daysCount: 2
        };
        setStats(defaultStats);
        return defaultStats;
      }
      
      setError('식단 통계를 불러오는데 실패했습니다.');
      
      // API 실패 시 기본 통계 제공
      const defaultStats = {
        totalCalories: 2220,
        avgCalories: 1110,
        totalMeals: 6,
        totalWater: 14,
        avgWater: 7,
        daysCount: 2
      };
      setStats(defaultStats);
      return defaultStats;
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