import axiosInstance from './axiosConfig';

// ========== 사용자 프로필 (User Profiles) ==========

// 사용자 프로필 목록 조회 (관리자용)
export const getUserProfiles = async (params) => {
  try {
    const response = await axiosInstance.get('/users/profiles/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 사용자 프로필 상세 조회
export const getUserProfile = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/profiles/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 사용자 프로필 생성 (회원가입)
export const createUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.post('/users/profiles/', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 사용자 프로필 수정
export const updateUserProfile = async (id, profileData) => {
  try {
    const response = await axiosInstance.put(`/users/profiles/${id}/`, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 사용자 프로필 삭제
export const deleteUserProfile = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/profiles/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 편의 함수들 (기존 코드와의 호환성을 위해) ==========

// 회원가입 (createUserProfile의 별칭)
export const registerUser = async (userData) => {
  return createUserProfile(userData);
};

// 현재 사용자 프로필 조회 (토큰 기반)
export const getCurrentUserProfile = async () => {
  try {
    // 토큰에서 사용자 ID를 추출하거나, 백엔드에서 현재 사용자 정보를 반환하는 엔드포인트가 있다면 사용
    const response = await axiosInstance.get('/users/profiles/me/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 현재 사용자 프로필 수정
export const updateCurrentUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/users/profiles/me/', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 인증 관련 함수들 (JWT 토큰 관리) ==========

// 로그인 (JWT 토큰 발급)
export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login/', credentials);
    if (response.data.token || response.data.access) {
      const token = response.data.token || response.data.access;
      localStorage.setItem('token', token);
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 로그아웃
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout/');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// 토큰 새로고침
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axiosInstance.post('/auth/refresh/', { refresh: refreshToken });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 검색 및 필터링 편의 함수들 ==========

// 사용자명으로 검색
export const searchUsersByUsername = async (username) => {
  return getUserProfiles({ search: username });
};

// 이메일로 검색
export const searchUsersByEmail = async (email) => {
  return getUserProfiles({ email });
};

 