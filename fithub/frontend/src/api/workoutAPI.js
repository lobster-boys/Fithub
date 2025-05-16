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