import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDietLogs } from './useDietLogs';
import { useMealPlans } from './useMealPlans';

/**
 * 식단 통계 관련 상태 관리 훅 (다른 Diet 훅들을 조합하여 통계 제공)
 */
export const useDietStats = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: null,
    to: null
  });

  const { 
    dietLogs,
    todayMeals,
    stats: dietLogStats,
    fetchDietStats,
    fetchDietLogs,
    loading: logsLoading,
    error: logsError 
  } = useDietLogs();

  const { 
    todayMealPlan,
    loading: planLoading,
    error: planError 
  } = useMealPlans();

  // 전체 로딩 상태
  const loading = logsLoading || planLoading;

  // 전체 에러 상태 (첫 번째 에러만 표시)
  const error = logsError || planError;

  // 오늘의 식단 요약 통계
  const todayStats = useMemo(() => {
    if (!Array.isArray(todayMeals)) {
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        completedMeals: 0,
        totalMeals: 4, // 아침, 점심, 저녁, 간식
        mealCompletion: 0
      };
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let completedMeals = 0;

    todayMeals.forEach(meal => {
      if (meal.isComplete) {
        completedMeals++;
      }
      
      totalCalories += meal.calories || 0;
      
      if (meal.foods && Array.isArray(meal.foods)) {
        meal.foods.forEach(food => {
          totalProtein += parseFloat(food.protein || 0);
          totalCarbs += parseFloat(food.carbs || 0);
          totalFat += parseFloat(food.fat || 0);
        });
      }
    });

    return {
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      completedMeals,
      totalMeals: 4,
      mealCompletion: Math.round((completedMeals / 4) * 100)
    };
  }, [todayMeals]);

  // 목표 대비 달성률 계산
  const goalProgress = useMemo(() => {
    if (!todayMealPlan) {
      return {
        caloriesProgress: 0,
        proteinProgress: 0,
        carbsProgress: 0,
        fatProgress: 0,
        targetCalories: 2000, // 기본 목표
        targetProtein: 100,
        targetCarbs: 250,
        targetFat: 65
      };
    }

    const targetCalories = todayMealPlan.calories || todayMealPlan.total_calories || 2000;
    const targetProtein = todayMealPlan.nutrients?.protein || 100;
    const targetCarbs = todayMealPlan.nutrients?.carbs || 250;
    const targetFat = todayMealPlan.nutrients?.fat || 65;

    return {
      caloriesProgress: targetCalories > 0 ? Math.round((todayStats.totalCalories / targetCalories) * 100) : 0,
      proteinProgress: targetProtein > 0 ? Math.round((todayStats.totalProtein / targetProtein) * 100) : 0,
      carbsProgress: targetCarbs > 0 ? Math.round((todayStats.totalCarbs / targetCarbs) * 100) : 0,
      fatProgress: targetFat > 0 ? Math.round((todayStats.totalFat / targetFat) * 100) : 0,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat
    };
  }, [todayStats, todayMealPlan]);

  // 주간 통계 데이터 (월요일~오늘) 실제 계산
  const weeklyStats = useMemo(() => {
    if (!Array.isArray(dietLogs) || dietLogs.length === 0) {
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        completionRate: 0,
        daysTracked: 0
      };
    }

    // 이번 주 (월요일 시작) 범위 계산
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday
    const diffToMonday = day === 0 ? -6 : 1 - day; // adjust if Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const trackedDates = new Set();

    dietLogs.forEach(log => {
      const logDateStr = log.date || log.created_at?.split('T')[0];
      if (!logDateStr) return;
      const logDate = new Date(logDateStr);
      // normalize time
      logDate.setHours(0, 0, 0, 0);
      if (logDate < monday || logDate > today) return; // 주간 범위 밖

      trackedDates.add(logDateStr);

      // 칼로리
      totalCalories += parseFloat(log.calories || 0);

      // 영양소 (food 또는 foods 배열 확인)
      if (Array.isArray(log.foods) && log.foods.length > 0) {
        log.foods.forEach(food => {
          totalProtein += parseFloat(food.protein || 0);
          totalCarbs += parseFloat(food.carbs || 0);
          totalFat += parseFloat(food.fat || 0);
        });
      } else if (log.food) {
        const factor = (parseFloat(log.quantity || 100) / 100); // g 기준 비율
        totalProtein += parseFloat(log.food.protein || 0) * factor;
        totalCarbs += parseFloat(log.food.carbs || 0) * factor;
        totalFat += parseFloat(log.food.fat || 0) * factor;
      }
    });

    const daysTracked = trackedDates.size || 1;

    return {
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      avgCalories: Math.round(totalCalories / daysTracked),
      avgProtein: Math.round(totalProtein / daysTracked),
      avgCarbs: Math.round(totalCarbs / daysTracked),
      avgFat: Math.round(totalFat / daysTracked),
      completionRate: 0, // 추후 구현 (식사 완료율 등)
      daysTracked
    };
  }, [dietLogs]);

  // 영양소 균형 평가
  const nutritionBalance = useMemo(() => {
    const { totalCalories, totalProtein, totalCarbs, totalFat } = todayStats;
    
    if (totalCalories === 0) {
      return {
        proteinRatio: 0,
        carbsRatio: 0,
        fatRatio: 0,
        balance: 'insufficient'
      };
    }

    // 칼로리당 영양소 비율 계산 (일반적인 권장 비율: 단백질 15-20%, 탄수화물 45-65%, 지방 20-35%)
    const proteinCalories = totalProtein * 4; // 단백질 1g = 4kcal
    const carbsCalories = totalCarbs * 4; // 탄수화물 1g = 4kcal
    const fatCalories = totalFat * 9; // 지방 1g = 9kcal

    const proteinRatio = Math.round((proteinCalories / totalCalories) * 100);
    const carbsRatio = Math.round((carbsCalories / totalCalories) * 100);
    const fatRatio = Math.round((fatCalories / totalCalories) * 100);

    // 균형 평가
    let balance = 'balanced';
    if (proteinRatio < 15 || proteinRatio > 25) balance = 'unbalanced';
    if (carbsRatio < 40 || carbsRatio > 70) balance = 'unbalanced';
    if (fatRatio < 15 || fatRatio > 40) balance = 'unbalanced';

    return {
      proteinRatio,
      carbsRatio,
      fatRatio,
      balance
    };
  }, [todayStats]);

  // 날짜별 통계 조회
  const getStatsForDate = useCallback(async (date) => {
    const stats = await fetchDietStats(date);
    setSelectedDate(date);
    return stats;
  }, [fetchDietStats]);

  // 날짜 범위별 통계 조회 (향후 구현)
  const getStatsForDateRange = useCallback(async (dateFrom, dateTo) => {
    setSelectedDateRange({ from: dateFrom, to: dateTo });
    // 실제 구현 시 백엔드에서 범위별 통계 API 호출
    console.warn('날짜 범위별 통계는 아직 구현되지 않았습니다.');
    return null;
  }, []);

  // 물 섭취량 통계 (오늘만)
  const waterStats = useMemo(() => {
    const currentWater = todayMealPlan?.water || 0;
    const targetWater = 2000; // 기본 목표 2L
    
    return {
      current: currentWater,
      target: targetWater,
      progress: Math.round((currentWater / targetWater) * 100),
      remaining: Math.max(0, targetWater - currentWater)
    };
  }, [todayMealPlan]);

  // 식사별 상세 통계
  const mealDetailStats = useMemo(() => {
    if (!Array.isArray(todayMeals)) return [];
    
    return todayMeals.map(meal => ({
      type: meal.type,
      name: meal.name,
      calories: meal.calories || 0,
      foodCount: meal.foods?.length || 0,
      isComplete: meal.isComplete,
      nutrients: meal.foods?.reduce((totals, food) => {
        totals.protein += parseFloat(food.protein || 0);
        totals.carbs += parseFloat(food.carbs || 0);
        totals.fat += parseFloat(food.fat || 0);
        return totals;
      }, { protein: 0, carbs: 0, fat: 0 }) || { protein: 0, carbs: 0, fat: 0 }
    }));
  }, [todayMeals]);

  // 최초 로드 시 전체(또는 최근) 식단 로그 불러오기
  useEffect(() => {
    // 이미 로그가 있으면 추가 호출 생략
    if (dietLogs && dietLogs.length > 0) return;
    fetchDietLogs();
  }, [fetchDietLogs]);

  return {
    // 기본 상태
    loading,
    error,
    selectedDate,
    selectedDateRange,
    
    // 오늘 통계
    todayStats,
    goalProgress,
    nutritionBalance,
    waterStats,
    mealDetailStats,
    
    // 주간/기간별 통계
    weeklyStats,
    
    // 백엔드 통계 (dietLogStats)
    dietLogStats,
    
    // 액션
    getStatsForDate,
    getStatsForDateRange,
    setSelectedDate,
    setSelectedDateRange
  };
};

export default useDietStats; 