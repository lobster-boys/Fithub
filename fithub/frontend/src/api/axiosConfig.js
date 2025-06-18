import axios from 'axios';

// CSRF 토큰 가져오기 함수
const getCSRFToken = () => {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
                   document.cookie.split('; ')
                     .find(row => row.startsWith('csrftoken='))
                     ?.split('=')[1];
  return csrfToken;
};

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // 세션 쿠키 자동 전송
});

// 요청 인터셉터 - CSRF 토큰 처리
axiosInstance.interceptors.request.use(
  (config) => {
    // POST, PUT, PATCH, DELETE 요청에 CSRF 토큰 추가
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
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
    
    // 401/403 에러 (인증 필요) - 특정 경우에만 리다이렉트
    if (status === 401 || status === 403) {
      // 로그인/회원가입 관련 요청이 아닌 경우에만 리다이렉트
      if (!error.config?.url?.includes('dj-rest-auth/user') && 
          !error.config?.url?.includes('dj-rest-auth/login') &&
          !error.config?.url?.includes('dj-rest-auth/registration')) {
        window.location.href = '/auth/login';
      }
    }
    
    // 500 에러 (서버 에러)
    if (status >= 500) {
      console.error('서버 에러가 발생했습니다.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 