import axiosInstance from './axiosConfig';

// ========== 운동 종목 (Exercises) ==========

// 운동 목록 조회 (필터링: muscle_group, type, search)
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

// ========== 운동 루틴 (Routines) ==========

// 운동 루틴 목록 조회 (필터링: difficulty)
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

// 운동 루틴 복사
export const copyRoutine = async (id) => {
  try {
    const response = await axiosInstance.post(`/workouts/routines/${id}/copy/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 운동 로그 (Logs) ==========

// 운동 로그 목록 조회 (필터링: date, completed)
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

// 운동 완료 처리
export const completeWorkoutLog = async (id) => {
  try {
    const response = await axiosInstance.post(`/workouts/logs/${id}/complete/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 운동 로그 상세 (Log Exercises) ==========

// 운동 로그 상세 목록 조회
export const getLogExercises = async (params) => {
  try {
    const response = await axiosInstance.get('/workouts/log-exercises/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 상세 생성
export const createLogExercise = async (exerciseData) => {
  try {
    const response = await axiosInstance.post('/workouts/log-exercises/', exerciseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 상세 조회
export const getLogExercise = async (id) => {
  try {
    const response = await axiosInstance.get(`/workouts/log-exercises/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 상세 수정
export const updateLogExercise = async (id, exerciseData) => {
  try {
    const response = await axiosInstance.put(`/workouts/log-exercises/${id}/`, exerciseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그 상세 삭제
export const deleteLogExercise = async (id) => {
  try {
    const response = await axiosInstance.delete(`/workouts/log-exercises/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 운동 타입 (Types) ==========

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

// ========== 운동 통계 (Stats) ==========

// 기본 운동 통계 조회
export const getWorkoutStats = async () => {
  try {
    const response = await axiosInstance.get('/workouts/stats/basic/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 편의 함수들 (프론트엔드에서 자주 사용하는 패턴) ==========

// 근육군별 운동 조회
export const getExercisesByMuscleGroup = async (muscleGroup) => {
  return getExercises({ muscle_group: muscleGroup });
};

// 운동 타입별 운동 조회
export const getExercisesByType = async (type) => {
  return getExercises({ type });
};

// 운동 검색
export const searchExercises = async (query) => {
  return getExercises({ search: query });
};

// 특정 날짜의 운동 로그 조회
export const getWorkoutLogsByDate = async (date) => {
  return getWorkoutLogs({ date });
};

// 완료된 운동 로그만 조회
export const getCompletedWorkoutLogs = async () => {
  return getWorkoutLogs({ completed: true });
};

// 미완료 운동 로그만 조회
export const getIncompleteWorkoutLogs = async () => {
  return getWorkoutLogs({ completed: false });
};

// 난이도별 루틴 조회
export const getRoutinesByDifficulty = async (difficulty) => {
  return getRoutines({ difficulty });
}; 