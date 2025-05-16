import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 전 처리 (예: 토큰 추가)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 데이터 가공
    return response;
  },
  (error) => {
    // 에러 처리
    const { status, data } = error?.response || {};
    
    // 401 에러 (인증 만료)
    if (status === 401) {
      localStorage.removeItem('token');
      // 로그인 페이지로 이동 또는 토큰 갱신 로직
      window.location.href = '/auth/login';
    }
    
    // 500 에러 (서버 에러)
    if (status >= 500) {
      console.error('서버 에러가 발생했습니다.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 