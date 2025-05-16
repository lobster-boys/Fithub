import axiosInstance from './axiosConfig';

// 회원가입
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/users/register/', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 로그인
export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/users/login/', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 로그아웃
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/users/logout/');
    localStorage.removeItem('token');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    throw error;
  }
};

// 사용자 프로필 조회
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 사용자 프로필 수정
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/users/profile/', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 소셜 로그인 (예: 구글)
export const socialLogin = async (provider, code) => {
  try {
    const response = await axiosInstance.post(`/users/social-login/${provider}/`, { code });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 비밀번호 변경
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.post('/users/change-password/', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 비밀번호 재설정 요청
export const resetPasswordRequest = async (email) => {
  try {
    const response = await axiosInstance.post('/users/reset-password/', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 