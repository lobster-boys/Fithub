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

// JWT 토큰 기반 회원가입
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/dj-rest-auth/registration/', userData);
    if (response.data.access_token || response.data.access) {
      const accessToken = response.data.access_token || response.data.access;
      const refreshToken = response.data.refresh_token || response.data.refresh;
      
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
    return response.data;
  } catch (error) {
    throw error;
  }
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

// ========== JWT 토큰 기반 인증 관리 ==========

// 로그인 (JWT 토큰 발급)
export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/dj-rest-auth/login/', credentials);
    if (response.data.access_token || response.data.access) {
      const accessToken = response.data.access_token || response.data.access;
      const refreshToken = response.data.refresh_token || response.data.refresh;
      
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 로그아웃 (JWT 토큰 무효화)
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/dj-rest-auth/logout/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return response.data;
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

// JWT 토큰 새로고침
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await axiosInstance.post('/dj-rest-auth/token/refresh/', { refresh: refreshToken });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 현재 사용자 정보 조회 (JWT 토큰 기반)
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/dj-rest-auth/user/');
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

 