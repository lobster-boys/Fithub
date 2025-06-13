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
    const response = await axiosInstance.post(`/workouts/logs/${workoutLogId}/exercises/create/`, exerciseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 운동 로그에 여러 운동 한번에 추가
export const bulkAddExercisesToWorkoutLog = async (workoutLogId, exercisesData) => {
  try {
    const response = await axiosInstance.post(`/workouts/logs/${workoutLogId}/exercises/bulk-create/`, {
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
    const response = await axiosInstance.get('/workouts/stats/type-distribution/');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 