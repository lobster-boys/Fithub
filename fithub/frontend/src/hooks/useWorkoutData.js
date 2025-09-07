import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from './useAuth';

const useWorkoutData = () => {
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [logExercises, setLogExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // 운동 로그 조회
  const fetchWorkoutLogs = async (filters = {}) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.completed !== undefined) params.append('completed', filters.completed);
      
      const response = await axiosInstance.get(`/workouts/logs/?${params.toString()}`);
      
      // 응답 데이터 정규화 - 백엔드 API 응답 구조에 맞게 처리
      const logs = response.data.results || response.data || [];
      
      // 데이터 구조 정규화
      const normalizedLogs = logs.map(log => ({
        id: log.id,
        routine_name: log.routine?.name || '운동',
        date: log.start_time,
        start_time: log.start_time,
        end_time: log.end_time,
        duration: log.duration_minutes,
        duration_minutes: log.duration_minutes,
        calories_burned: log.calories_burned,
        rating: log.rating,
        mood: log.mood,
        workout_type: log.workout_type,
        notes: log.notes,
        exercises: log.exercises || [],
        routine: log.routine,
        user: log.user
      }));
      
      setWorkoutLogs(normalizedLogs);
      return { results: normalizedLogs, ...response.data };
    } catch (err) {
      console.error('Failed to fetch workout logs:', err);
      setError('운동 로그를 불러오는 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 로그 새로고침 (세션 완료 후 호출용)
  const refreshWorkoutLogs = async () => {
    console.log('🔄 refreshWorkoutLogs 함수 실행 시작');
    try {
      console.log('📡 운동 로그 데이터 새로고침 중...');
      await fetchWorkoutLogs();
      console.log('📈 운동 통계 데이터 새로고침 중...');
      await fetchWorkoutStats();
      console.log('✅ 운동 데이터 새로고침 완료');
    } catch (error) {
      console.error('❌ 운동 데이터 새로고침 실패:', error);
      throw error;
    }
  };

  // 운동 통계 조회
  const fetchWorkoutStats = async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.get('/workouts/stats/basic/');
      setStats(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch workout stats:', err);
      setError('운동 통계를 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (user) {
      fetchWorkoutLogs();
      fetchWorkoutStats();
    }
  }, [user]);

  // 운동 로그 추가
  const addWorkoutLog = async (newLog) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/workouts/logs/', newLog);
      setWorkoutLogs(prev => [...prev, response.data]);
      await fetchWorkoutStats(); // 통계 새로고침
      return response.data;
    } catch (err) {
      console.error('Failed to add workout log:', err);
      setError('운동 로그 추가 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 로그 수정
  const updateWorkoutLog = async (id, updatedLog) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.patch(`/workouts/logs/${id}/`, updatedLog);
      setWorkoutLogs(prev => prev.map(log => log.id === id ? response.data : log));
      await fetchWorkoutStats(); // 통계 새로고침
      return response.data;
    } catch (err) {
      console.error('Failed to update workout log:', err);
      setError('운동 로그 수정 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 로그 삭제
  const deleteWorkoutLog = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await axiosInstance.delete(`/workouts/logs/${id}/`);
      setWorkoutLogs(prev => prev.filter(log => log.id !== id));
      await fetchWorkoutStats(); // 통계 새로고침
      return true;
    } catch (err) {
      console.error('Failed to delete workout log:', err);
      setError('운동 로그 삭제 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 완료 처리
  const completeWorkout = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post(`/workouts/logs/${id}/complete/`);
      setWorkoutLogs(prev => prev.map(log => log.id === id ? response.data : log));
      await fetchWorkoutStats(); // 통계 새로고침
      return response.data;
    } catch (err) {
      console.error('Failed to complete workout:', err);
      setError('운동 완료 처리 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =================== 새로 추가된 운동 종목 관련 기능들 ===================
  // 운동 종목 목록 조회
  const fetchExercises = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.muscle_groups) params.append('muscle_groups', filters.muscle_groups);
      if (filters.difficulty_level) params.append('difficulty_level', filters.difficulty_level);
      if (filters.equipment_needed) params.append('equipment_needed', filters.equipment_needed);
      if (filters.search) params.append('search', filters.search);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      
      const response = await axiosInstance.get(`/workouts/exercises/?${params.toString()}`);
      setExercises(response.data.results || response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
      setError('운동 종목을 불러오는 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 종목 상세 조회
  const fetchExerciseDetail = async (exerciseId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(`/workouts/exercises/${exerciseId}/`);
      setCurrentExercise(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch exercise detail:', err);
      setError('운동 종목 상세 정보를 불러오는 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =================== 새로 추가된 운동 루틴 관련 기능들 ===================
  // 운동 루틴 목록 조회
  const fetchRoutines = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.difficulty_level) params.append('difficulty_level', filters.difficulty_level);
      if (filters.is_featured !== undefined) params.append('is_featured', filters.is_featured);
      if (filters.is_template !== undefined) params.append('is_template', filters.is_template);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.search) params.append('search', filters.search);
      
      // is_public 파라미터 처리
      if (filters.is_public !== undefined) {
        params.append('is_public', filters.is_public.toString());
      }
      
      // 인증되지 않은 사용자는 공개 루틴만 볼 수 있음
      if (!user && !params.has('is_public')) {
        params.append('is_public', 'true');
      }
      
      const response = await axiosInstance.get(`/workouts/routines/?${params.toString()}`);
      setRoutines(response.data.results || response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch routines:', err);
      
      // 인증 오류가 아닌 경우 에러 메시지 설정
      if (err.response?.status !== 401) {
        setError('운동 루틴을 불러오는 중 오류가 발생했습니다.');
      }
      
      // 에러 발생 시 빈 배열로 설정하여 폴백 데이터 사용 가능
      setRoutines([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 루틴 상세 조회
  const fetchRoutineDetail = async (routineId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(`/workouts/routines/${routineId}/`);
      console.log('백엔드에서 받은 루틴 상세 데이터:', response.data);
      setCurrentRoutine(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch routine detail:', err);
      setError('운동 루틴 상세 정보를 불러오는 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 루틴 생성
  const createRoutine = async (routineData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/workouts/routines/', routineData);
      setRoutines(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to create routine:', err);
      setError('운동 루틴 생성 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 루틴 수정
  const updateRoutine = async (routineId, routineData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.patch(`/workouts/routines/${routineId}/`, routineData);
      setRoutines(prev => prev.map(routine => routine.id === routineId ? response.data : routine));
      if (currentRoutine && currentRoutine.id === routineId) {
        setCurrentRoutine(response.data);
      }
      return response.data;
    } catch (err) {
      console.error('Failed to update routine:', err);
      setError('운동 루틴 수정 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 루틴 삭제
  const deleteRoutine = async (routineId) => {
    setLoading(true);
    setError(null);
    
    try {
      await axiosInstance.delete(`/workouts/routines/${routineId}/`);
      setRoutines(prev => prev.filter(routine => routine.id !== routineId));
      if (currentRoutine && currentRoutine.id === routineId) {
        setCurrentRoutine(null);
      }
      return true;
    } catch (err) {
      console.error('Failed to delete routine:', err);
      setError('운동 루틴 삭제 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 루틴 복사
  const copyRoutine = async (routineId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post(`/workouts/routines/${routineId}/copy/`);
      setRoutines(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to copy routine:', err);
      setError('운동 루틴 복사 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 루틴 공개 상태 토글
  const toggleRoutinePublic = async (routineId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post(`/workouts/routines/${routineId}/toggle_public/`);
      
      // 현재 루틴 상태 업데이트
      if (currentRoutine && currentRoutine.id === parseInt(routineId)) {
        setCurrentRoutine(prev => ({ ...prev, is_public: response.data.is_public }));
      }
      
      // 루틴 목록 상태 업데이트
      setRoutines(prev => prev.map(routine => 
        routine.id === parseInt(routineId) 
          ? { ...routine, is_public: response.data.is_public }
          : routine
      ));
      
      return response.data;
    } catch (err) {
      console.error('Failed to toggle routine public:', err);
      setError('루틴 공개 상태 변경 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =================== 새로 추가된 운동 로그 상세 운동 관련 기능들 ===================
  // 운동 로그별 상세 운동 목록 조회
  const fetchLogExercises = async (workoutLogId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(`/workouts/log-exercises/?workout_log_id=${workoutLogId}`);
      setLogExercises(response.data.results || response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch log exercises:', err);
      setError('운동 로그 상세 운동을 불러오는 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 로그에 상세 운동 추가
  const addLogExercise = async (workoutLogId, exerciseData) => {
    setLoading(true);
    setError(null);
    
    try {
      const dataWithLogId = { ...exerciseData, workout_log_id: workoutLogId };
      const response = await axiosInstance.post('/workouts/log-exercises/', dataWithLogId);
      setLogExercises(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to add log exercise:', err);
      setError('운동 로그 상세 운동 추가 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 로그 상세 운동 수정
  const updateLogExercise = async (logExerciseId, exerciseData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.patch(`/workouts/log-exercises/${logExerciseId}/`, exerciseData);
      setLogExercises(prev => prev.map(exercise => exercise.id === logExerciseId ? response.data : exercise));
      return response.data;
    } catch (err) {
      console.error('Failed to update log exercise:', err);
      setError('운동 로그 상세 운동 수정 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 운동 로그 상세 운동 삭제
  const deleteLogExercise = async (logExerciseId) => {
    setLoading(true);
    setError(null);
    
    try {
      await axiosInstance.delete(`/workouts/log-exercises/${logExerciseId}/`);
      setLogExercises(prev => prev.filter(exercise => exercise.id !== logExerciseId));
      return true;
    } catch (err) {
      console.error('Failed to delete log exercise:', err);
      setError('운동 로그 상세 운동 삭제 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 여러 운동을 한번에 운동 로그에 추가
  const bulkAddLogExercises = async (workoutLogId, exercisesData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/workouts/log-exercises/bulk_create_exercises/', {
        workout_log_id: workoutLogId,
        exercises: exercisesData
      });
      setLogExercises(prev => [...prev, ...response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to bulk add log exercises:', err);
      setError('운동 로그 상세 운동 일괄 추가 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =================== 기존 로컬 통계 계산 기능들 ===================
  // 로컬 통계 계산 (백엔드 통계와 함께 사용)
  const getLocalStats = () => {
    if (!workoutLogs.length) {
      return {
        weeklyStats: { totalDuration: 0, totalCalories: 0, workoutDays: 0 },
        monthlyStats: { totalWorkouts: 0, completionRate: 0, totalCalories: 0, totalDuration: 0 },
        streakDays: 0
      };
    }

    const today = new Date();
    
    // 주간 통계
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    const weekLogs = workoutLogs.filter(log => {
      const logDate = new Date(log.start_time || log.created_at);
      return logDate >= weekStart && logDate <= today && log.end_time; // end_time이 있으면 완료된 것
    });

    // 월간 통계
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthLogs = workoutLogs.filter(log => {
      const logDate = new Date(log.start_time || log.created_at);
      return logDate >= monthStart && logDate <= today;
    });

    return {
      weeklyStats: {
        totalDuration: weekLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0),
        totalCalories: weekLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0),
        workoutDays: weekLogs.length
      },
      monthlyStats: {
        totalWorkouts: monthLogs.length,
        completionRate: monthLogs.length > 0 ? 
          Math.round((monthLogs.filter(log => log.end_time).length / monthLogs.length) * 100) : 0,
        totalCalories: monthLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0),
        totalDuration: monthLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0)
      },
      streakDays: calculateStreakDays()
    };
  };

  // 연속 운동 일수 계산 (헬퍼 함수)
  const calculateStreakDays = () => {
    if (!workoutLogs.length) return 0;

    const completedLogs = workoutLogs
      .filter(log => log.end_time) // end_time이 있으면 완료된 것
      .sort((a, b) => new Date(b.start_time || b.created_at) - new Date(a.start_time || a.created_at));

    if (!completedLogs.length) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < completedLogs.length; i++) {
      const logDate = new Date(completedLogs[i].start_time || completedLogs[i].created_at);
      const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));

      if (i === 0 && diffDays <= 1) {
        streak = 1;
        currentDate = logDate;
      } else if (diffDays === 1) {
        streak++;
        currentDate = logDate;
      } else {
        break;
      }
    }

    return streak;
  };

  // 현재 사용자 정보 확인 (디버깅용)
  const checkCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/user-info/');
      console.log('현재 로그인된 사용자:', response.data);
      return response.data;
    } catch (error) {
      console.error('사용자 정보 확인 실패:', error);
      throw error;
    }
  };

  return {
    // =================== 기존 데이터 ===================
    workoutLogs,
    stats,
    loading,
    error,
    
    // =================== 새로 추가된 데이터 ===================
    exercises,
    routines,
    currentExercise,
    currentRoutine,
    logExercises,
    
    // =================== 기존 API 함수들 ===================
    fetchWorkoutLogs,
    refreshWorkoutLogs,
    fetchWorkoutStats,
    addWorkoutLog,
    updateWorkoutLog,
    deleteWorkoutLog,
    completeWorkout,
    
    // =================== 새로 추가된 운동 종목 API 함수들 ===================
    fetchExercises,
    fetchExerciseDetail,
    
    // =================== 새로 추가된 운동 루틴 API 함수들 ===================
    fetchRoutines,
    fetchRoutineDetail,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    copyRoutine,
    toggleRoutinePublic,
    
    // =================== 새로 추가된 운동 로그 상세 운동 API 함수들 ===================
    fetchLogExercises,
    addLogExercise,
    updateLogExercise,
    deleteLogExercise,
    bulkAddLogExercises,
    
    // =================== 기존 로컬 계산 함수들 ===================
    getLocalStats,
    
    // =================== 호환성을 위한 레거시 함수들 ===================
    setWorkoutLogs,
    getWeeklyStats: () => getLocalStats().weeklyStats,
    getMonthlyStats: () => getLocalStats().monthlyStats,
    getStreakDays: () => getLocalStats().streakDays,
    
    // =================== 새로고침 함수들 ===================
    refetch: () => {
      fetchWorkoutLogs();
      fetchWorkoutStats();
    },
    refetchExercises: () => fetchExercises(),
    refetchRoutines: () => fetchRoutines(),
    
    // =================== 상태 초기화 함수들 ===================
    clearCurrentExercise: () => setCurrentExercise(null),
    clearCurrentRoutine: () => setCurrentRoutine(null),
    clearLogExercises: () => setLogExercises([]),
    clearError: () => setError(null),
    
    // 새로 추가된 함수들
    checkCurrentUser
  };
};

export default useWorkoutData; 