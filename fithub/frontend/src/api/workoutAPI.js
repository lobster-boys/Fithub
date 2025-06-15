import axiosInstance from './axiosConfig';

// 운동 목록 조회
export const getExercises = async (params) => {
  try {
    const response = await axiosInstance.get('/workouts/exercises/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 상세 조회
export const getExercise = async (id) => {
  try {
    const response = await axiosInstance.get(`/workouts/exercises/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 루틴 목록 조회
export const getRoutines = async (params) => {
  try {
    const response = await axiosInstance.get('/workouts/routines/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 루틴 상세 조회
export const getRoutine = async (id) => {
  try {
    const response = await axiosInstance.get(`/workouts/routines/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 루틴 생성
export const createRoutine = async (routineData) => {
  try {
    const response = await axiosInstance.post('/workouts/routines/', routineData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 루틴 수정
export const updateRoutine = async (id, routineData) => {
  try {
    const response = await axiosInstance.put(`/workouts/routines/${id}/`, routineData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 루틴 삭제
export const deleteRoutine = async (id) => {
  try {
    const response = await axiosInstance.delete(`/workouts/routines/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 루틴에 운동 추가
export const addExerciseToRoutine = async (routineId, exerciseData) => {
  try {
    const response = await axiosInstance.post(`/workouts/routines/${routineId}/exercises/`, exerciseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 루틴에서 운동 삭제
export const removeExerciseFromRoutine = async (routineId, exerciseId) => {
  try {
    const response = await axiosInstance.delete(`/workouts/routines/${routineId}/exercises/${exerciseId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 조회
export const getWorkoutLogs = async (params) => {
  try {
    const response = await axiosInstance.get('/workouts/logs/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 상세 조회
export const getWorkoutLog = async (id) => {
  try {
    const response = await axiosInstance.get(`/workouts/logs/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 생성
export const createWorkoutLog = async (logData) => {
  try {
    const response = await axiosInstance.post('/workouts/logs/', logData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 수정
export const updateWorkoutLog = async (id, logData) => {
  try {
    const response = await axiosInstance.put(`/workouts/logs/${id}/`, logData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 삭제
export const deleteWorkoutLog = async (id) => {
  try {
    const response = await axiosInstance.delete(`/workouts/logs/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 새로 추가된 API 함수들 ==========

// 운동 로그별 상세 운동 목록 조회
export const getWorkoutLogExercises = async (workoutLogId) => {
  try {
    const response = await axiosInstance.get(`/workouts/logs/${workoutLogId}/exercises/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그에 상세 운동 추가
export const addExerciseToWorkoutLog = async (workoutLogId, exerciseData) => {
  try {
    const response = await axiosInstance.post(`/workouts/logs/${workoutLogId}/add_exercise/`, exerciseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그에 여러 운동 한번에 추가
export const bulkAddExercisesToWorkoutLog = async (workoutLogId, exercisesData) => {
  try {
    const response = await axiosInstance.post(`/workouts/logs/${workoutLogId}/bulk_add_exercises/`, {
      exercises: exercisesData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 상세 운동 수정
export const updateWorkoutLogExercise = async (id, exerciseData) => {
  try {
    const response = await axiosInstance.put(`/workouts/log-exercises/${id}/`, exerciseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 상세 운동 삭제
export const deleteWorkoutLogExercise = async (id) => {
  try {
    const response = await axiosInstance.delete(`/workouts/log-exercises/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 타입 목록 조회
export const getWorkoutTypes = async () => {
  try {
    const response = await axiosInstance.get('/workouts/types/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 타입 상세 조회
export const getWorkoutType = async (id) => {
  try {
    const response = await axiosInstance.get(`/workouts/types/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 기본 운동 통계 조회
export const getWorkoutStats = async () => {
  try {
    const response = await axiosInstance.get('/workouts/stats/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 확장 운동 통계 조회
export const getAdvancedWorkoutStats = async () => {
  try {
    const response = await axiosInstance.get('/workouts/stats/advanced/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 연속 운동일 통계 조회
export const getWorkoutStreak = async () => {
  try {
    const response = await axiosInstance.get('/workouts/stats/streak/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 타입별 분포 통계 조회
export const getWorkoutTypeDistribution = async () => {
  try {
    const response = await axiosInstance.get('/workouts/stats/type_distribution/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 새로운 Custom Action API 함수들 ==========

// 내 운동 루틴 조회
export const getMyRoutines = async () => {
  try {
    const response = await axiosInstance.get('/workouts/routines/my_routines/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 인기 운동 루틴 조회
export const getPopularRoutines = async () => {
  try {
    const response = await axiosInstance.get('/workouts/routines/popular/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 루틴 복사
export const duplicateRoutine = async (routineId) => {
  try {
    const response = await axiosInstance.post(`/workouts/routines/${routineId}/duplicate/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 루틴 공유
export const shareRoutine = async (routineId) => {
  try {
    const response = await axiosInstance.post(`/workouts/routines/${routineId}/share/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 내 운동 로그 조회
export const getMyWorkoutLogs = async () => {
  try {
    const response = await axiosInstance.get('/workouts/logs/my_logs/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 최근 운동 로그 조회
export const getRecentWorkoutLogs = async () => {
  try {
    const response = await axiosInstance.get('/workouts/logs/recent/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 요약 조회
export const getWorkoutLogSummary = async (logId) => {
  try {
    const response = await axiosInstance.get(`/workouts/logs/${logId}/summary/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 완료 처리
export const completeWorkoutLog = async (logId) => {
  try {
    const response = await axiosInstance.post(`/workouts/logs/${logId}/complete/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동별 개인 기록 조회
export const getPersonalRecords = async (exerciseId) => {
  try {
    const response = await axiosInstance.get(`/workouts/exercises/${exerciseId}/personal_records/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 인기 운동 조회
export const getPopularExercises = async () => {
  try {
    const response = await axiosInstance.get('/workouts/exercises/popular/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 추천 운동 조회
export const getRecommendedExercises = async () => {
  try {
    const response = await axiosInstance.get('/workouts/exercises/recommended/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 검색
export const searchExercises = async (query) => {
  try {
    const response = await axiosInstance.get('/workouts/exercises/search/', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 월별 운동 통계
export const getMonthlyStats = async () => {
  try {
    const response = await axiosInstance.get('/workouts/stats/monthly/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 주간 운동 통계
export const getWeeklyStats = async () => {
  try {
    const response = await axiosInstance.get('/workouts/stats/weekly/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 목표 달성률
export const getGoalProgress = async () => {
  try {
    const response = await axiosInstance.get('/workouts/stats/goal_progress/');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 