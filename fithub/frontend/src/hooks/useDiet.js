import { useState, useEffect, useCallback } from 'react';
import dietService from '../services/dietService';

// 식단 데이터 관리 커스텀 훅
export const useDiet = () => {
  const [dietLogs, setDietLogs] = useState([]);
  const [todayDiet, setTodayDiet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 식단 로그 목록 조회 (목 데이터 사용)
  const fetchDietLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    // 백엔드가 없으므로 목 데이터 직접 사용
    const mockData = [
      {
        id: 1,
        date: '2024-01-15',
        meals: [
          { name: '아침', foods: ['그릭 요거트', '블루베리', '그래놀라'], calories: 320, time: '08:00' },
          { name: '간식', foods: ['사과', '아몬드 버터'], calories: 200, time: '10:30' },
          { name: '점심', foods: ['그릴드 치킨', '퀴노아', '브로콜리'], calories: 450, time: '12:30' }
        ],
        totalCalories: 970,
        targetCalories: 1800,
        water: 6
      },
      {
        id: 2,
        date: '2024-01-14',
        meals: [
          { name: '아침', foods: ['오트밀', '바나나', '견과류'], calories: 350, time: '07:30' },
          { name: '점심', foods: ['연어', '현미밥', '시금치'], calories: 520, time: '12:00' },
          { name: '저녁', foods: ['두부', '야채볶음', '미소국'], calories: 380, time: '19:00' }
        ],
        totalCalories: 1250,
        targetCalories: 1800,
        water: 8
      }
    ];
    
    // 로딩 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDietLogs(mockData);
    setLoading(false);
    return mockData;
  }, []);

  // 오늘의 식단 조회 (목 데이터 사용)
  const fetchTodayDiet = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // 백엔드가 없으므로 목 데이터 직접 사용
    const mockData = {
      id: 1,
      date: new Date().toISOString().split('T')[0],
      meals: [
        { name: '아침', foods: ['그릭 요거트', '블루베리', '그래놀라'], calories: 320, time: '08:00' },
        { name: '간식', foods: ['사과', '아몬드 버터'], calories: 200, time: '10:30' },
        { name: '점심', foods: ['그릴드 치킨', '퀴노아', '브로콜리'], calories: 450, time: '12:30' }
      ],
      totalCalories: 970,
      targetCalories: 1800,
      water: 6
    };
    
    // 로딩 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setTodayDiet(mockData);
    setLoading(false);
    return mockData;
  }, []);

  // 식사 추가
  const addMeal = useCallback(async (mealData) => {
    setLoading(true);
    setError(null);
    try {
      const newMeal = await dietService.addMeal(mealData);
      // 로컬 상태 업데이트
      await fetchDietLogs();
      await fetchTodayDiet();
      return newMeal;
    } catch (err) {
      setError(err.message || '식사 추가에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDietLogs, fetchTodayDiet]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchDietLogs();
    fetchTodayDiet();
  }, [fetchDietLogs, fetchTodayDiet]);

  return {
    dietLogs,
    todayDiet,
    loading,
    error,
    fetchDietLogs,
    fetchTodayDiet,
    addMeal,
    refetch: () => {
      fetchDietLogs();
      fetchTodayDiet();
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
    
    // 백엔드가 없으므로 목 데이터 직접 사용
    const mockStats = {
      totalCalories: 2220,
      avgCalories: 1110,
      totalMeals: 6,
      totalWater: 14,
      avgWater: 7,
      daysCount: 2
    };
    
    // 로딩 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 400));
    
    setStats(mockStats);
    setLoading(false);
    return mockStats;
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

export default useDiet; 