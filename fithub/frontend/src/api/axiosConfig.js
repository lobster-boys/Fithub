import axios from 'axios';

// JWT 토큰 가져오기 함수
const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // 쿠키 자동 전송 (refresh token cookie용)
});

// 요청 인터셉터 - JWT 토큰 처리
axiosInstance.interceptors.request.use(
  (config) => {
    // Authorization 헤더에 JWT 토큰 추가
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - JWT 토큰 갱신 처리
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 데이터 가공
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { status } = error?.response || {};
    
    // 401 에러 (토큰 만료) - 토큰 갱신 시도
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // 토큰 갱신 API 호출 (순환 참조 방지를 위해 새 axios 인스턴스 사용)
          const response = await axios.post('http://localhost:8000/api/dj-rest-auth/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access, refresh } = response.data;
          
          // 새 토큰 저장
          localStorage.setItem('access_token', access);
          if (refresh) {
            localStorage.setItem('refresh_token', refresh);
          }
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리
        console.log('Token refresh failed, clearing tokens');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // 강제 리다이렉트 대신 에러를 반환하여 AuthContext에서 처리하도록 함
        return Promise.reject(refreshError);
      }
    }
    
    // 403 에러 (권한 없음)
    if (status === 403) {
      console.error('권한이 없습니다.');
    }
    
    // 500 에러 (서버 에러)
    if (status >= 500) {
      console.error('서버 에러가 발생했습니다.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 