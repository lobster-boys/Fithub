import { useState, useCallback } from 'react';
import { dietLogService } from '../../services/diet/dietLogService';
import { transformDietLogsToMeals } from '../../utils/dietTransformers';
import { ERROR_TYPES } from '../../utils/errorHandler';

/**
 * 식단 기록 관련 상태 관리 훅
 */
export const useDietLogs = () => {
  const [dietLogs, setDietLogs] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 에러 상태 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 식단 기록 목록 조회
  const fetchDietLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dietLogService.getDietLogs(params);
      setDietLogs(response.data);
      return response;
    } catch (err) {
      if (err.type === ERROR_TYPES.AUTHENTICATION) {
        setDietLogs([]);
        setError(err.message);
        return { data: [], pagination: null };
      }
      
      setError(err.message);
      setDietLogs([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 날짜별 식단 기록 조회
  const fetchDietLogsByDate = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dietLogService.getDietLogsByDate(date);
      const logs = response.data;
      
      // 오늘 날짜인 경우 todayMeals 업데이트
      const today = new Date().toISOString().split('T')[0];
      const targetDate = typeof date === 'string' ? date : date?.toISOString().split('T')[0];
      
      if (targetDate === today) {
        const meals = transformDietLogsToMeals(logs);
        setTodayMeals(meals);
      }
      
      return response;
    } catch (err) {
      if (err.type === ERROR_TYPES.AUTHENTICATION) {
        setError(err.message);
        if (targetDate === today) setTodayMeals([]);
        return { data: [], pagination: null };
      }
      
      setError(err.message);
      if (targetDate === today) setTodayMeals([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 오늘의 식단 기록 조회
  const fetchTodayDietLogs = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    return fetchDietLogsByDate(today);
  }, [fetchDietLogsByDate]);

  // 식사 타입별 식단 기록 조회
  const fetchDietLogsByMealType = useCallback(async (mealType, date = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dietLogService.getDietLogsByMealType(mealType, date);
      return response;
    } catch (err) {
      setError(err.message);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 날짜 범위별 식단 기록 조회
  const fetchDietLogsByDateRange = useCallback(async (dateFrom, dateTo) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dietLogService.getDietLogsByDateRange(dateFrom, dateTo);
      setDietLogs(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      setDietLogs([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 식단 기록 조회
  const getDietLog = useCallback(async (logId) => {
    setLoading(true);
    setError(null);
    
    try {
      const log = await dietLogService.getDietLog(logId);
      return log;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 기록 생성 (단일 음식)
  const createDietLog = useCallback(async (logData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newLog = await dietLogService.createDietLog(logData);
      
      // 현재 기록 목록에 새 기록 추가
      setDietLogs(prevLogs => [newLog, ...prevLogs]);
      
      // 오늘 기록인 경우 meals 업데이트
      const today = new Date().toISOString().split('T')[0];
      const logDate = typeof logData.date === 'string' ? logData.date : logData.date?.toISOString().split('T')[0];
      
      if (logDate === today) {
        await fetchTodayDietLogs();
      }
      
      return newLog;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayDietLogs]);

  // 식사 기록 생성 (복수 음식)
  const createMealLog = useCallback(async (mealData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newLogs = await dietLogService.createMealLog(mealData);
      
      // 현재 기록 목록에 새 기록들 추가
      setDietLogs(prevLogs => [...newLogs, ...prevLogs]);
      
      // 오늘 기록인 경우 meals 업데이트
      const today = new Date().toISOString().split('T')[0];
      const logDate = typeof mealData.date === 'string' ? mealData.date : mealData.date?.toISOString().split('T')[0];
      
      if (logDate === today) {
        await fetchTodayDietLogs();
      }
      
      return newLogs;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayDietLogs]);

  // 여러 식단 기록 일괄 생성
  const createMultipleDietLogs = useCallback(async (logsData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newLogs = await dietLogService.createMultipleDietLogs(logsData);
      
      // 현재 기록 목록에 새 기록들 추가
      setDietLogs(prevLogs => [...newLogs, ...prevLogs]);
      
      // 오늘 기록이 포함된 경우 meals 업데이트
      const today = new Date().toISOString().split('T')[0];
      const hasTodayLog = logsData.some(logData => {
        const logDate = typeof logData.date === 'string' ? logData.date : logData.date?.toISOString().split('T')[0];
        return logDate === today;
      });
      
      if (hasTodayLog) {
        await fetchTodayDietLogs();
      }
      
      return newLogs;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchTodayDietLogs]);

  // 추천 기반 식단 기록 생성
  const createDietLogFromRecommendation = useCallback(async (recommendationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newLogs = await dietLogService.createDietLogFromRecommendation(recommendationData);
      
      // 현재 기록 목록에 새 기록들 추가
      setDietLogs(prevLogs => [...newLogs, ...prevLogs]);
      
      // 오늘 기록인 경우 meals 업데이트
      const today = new Date().toISOString().split('T')[0];
      const logDate = recommendationData.date || today;
      
      if (logDate === today) {
        await fetchTodayDietLogs();
      }
      
      return newLogs;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchTodayDietLogs]);

  // 식단 기록 수정
  const updateDietLog = useCallback(async (logId, logData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedLog = await dietLogService.updateDietLog(logId, logData);
      
      // 현재 기록 목록에서 수정된 기록 업데이트
      setDietLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === logId ? updatedLog : log
        )
      );
      
      // 오늘 기록인 경우 meals 업데이트
      const today = new Date().toISOString().split('T')[0];
      const logDate = typeof logData.date === 'string' ? logData.date : logData.date?.toISOString().split('T')[0];
      
      if (logDate === today) {
        await fetchTodayDietLogs();
      }
      
      return updatedLog;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayDietLogs]);

  // 식단 기록 삭제
  const deleteDietLog = useCallback(async (logId) => {
    setLoading(true);
    setError(null);
    
    try {
      await dietLogService.deleteDietLog(logId);
      
      // 현재 기록 목록에서 삭제된 기록 제거
      setDietLogs(prevLogs => 
        prevLogs.filter(log => log.id !== logId)
      );
      
      // 오늘 기록인 경우 meals 업데이트
      await fetchTodayDietLogs();
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTodayDietLogs]);

  // 여러 식단 기록 일괄 삭제
  const deleteMultipleDietLogs = useCallback(async (logIds) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dietLogService.deleteMultipleDietLogs(logIds);
      
      // 현재 기록 목록에서 삭제된 기록들 제거
      setDietLogs(prevLogs => 
        prevLogs.filter(log => !logIds.includes(log.id))
      );
      
      // 오늘 기록이 포함된 경우 meals 업데이트
      await fetchTodayDietLogs();
      
      return result;
    } catch (err) {
      setError(err.message);
      return { successful: 0, failed: logIds.length, total: logIds.length };
    } finally {
      setLoading(false);
    }
  }, [fetchTodayDietLogs]);

  // 날짜별 모든 식단 기록 삭제
  const deleteDietLogsByDate = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dietLogService.deleteDietLogsByDate(date);
      
      // 오늘 기록인 경우 meals 초기화
      const today = new Date().toISOString().split('T')[0];
      const targetDate = typeof date === 'string' ? date : date?.toISOString().split('T')[0];
      
      if (targetDate === today) {
        setTodayMeals([]);
      }
      
      // 전체 기록 목록에서도 해당 날짜 기록들 제거
      setDietLogs(prevLogs => 
        prevLogs.filter(log => {
          const logDate = log.date || log.created_at?.split('T')[0];
          return logDate !== targetDate;
        })
      );
      
      return result;
    } catch (err) {
      setError(err.message);
      return { successful: 0, failed: 0, total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  // 식단 통계 조회
  const fetchDietStats = useCallback(async (date = null) => {
    try {
      const statsData = await dietLogService.getDietStats(date);
      setStats(statsData);
      return statsData;
    } catch (err) {
      setError(err.message);
      setStats(null);
      return null;
    }
  }, []);

  // 칼로리 계산 유틸리티
  const calculateMealCalories = useCallback((foods) => {
    if (!Array.isArray(foods)) return 0;
    
    return foods.reduce((total, food) => {
      const calories = parseFloat(food.calories || 0);
      return total + calories;
    }, 0);
  }, []);

  // 모든 상태 초기화
  const reset = useCallback(() => {
    setDietLogs([]);
    setTodayMeals([]);
    setStats(null);
    setError(null);
    setLoading(false);
  }, []);

  // 레거시 호환성을 위한 함수들
  const getTodayLogs = useCallback(() => {
    return dietLogs.filter(log => {
      const today = new Date().toISOString().split('T')[0];
      const logDate = log.date || log.created_at?.split('T')[0];
      return logDate === today;
    });
  }, [dietLogs]);

  const fetchLogs = useCallback(async (params = {}) => {
    return fetchDietLogs(params);
  }, [fetchDietLogs]);

  const createLog = useCallback(async (logData) => {
    return createDietLog(logData);
  }, [createDietLog]);

  const updateLog = useCallback(async (logId, logData) => {
    return updateDietLog(logId, logData);
  }, [updateDietLog]);

  const deleteLog = useCallback(async (logId) => {
    return deleteDietLog(logId);
  }, [deleteDietLog]);

  return {
    // 상태
    dietLogs,
    todayMeals,
    stats,
    loading,
    error,
    
    // 주요 액션
    fetchDietLogs,
    fetchDietLogsByDate,
    fetchTodayDietLogs,
    fetchDietLogsByMealType,
    fetchDietLogsByDateRange,
    getDietLog,
    createDietLog,
    createMealLog,
    createMultipleDietLogs,
    createDietLogFromRecommendation,
    updateDietLog,
    deleteDietLog,
    deleteMultipleDietLogs,
    deleteDietLogsByDate,
    fetchDietStats,
    calculateMealCalories,
    clearError,
    reset,

    // 레거시 호환성을 위한 별칭들
    logs: dietLogs,
    getTodayLogs,
    fetchLogs,
    createLog,
    updateLog,
    deleteLog
  };
};

export default useDietLogs; 