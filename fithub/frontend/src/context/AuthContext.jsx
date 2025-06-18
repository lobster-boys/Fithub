import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { getOnboardingStatus } from '../api';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // 사용자 정보 로드
  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 세션 기반 인증 - 직접 사용자 정보 요청
      const response = await axiosInstance.get('/dj-rest-auth/user/');
      setUser(response.data);
      setIsAuthenticated(true);

      // 온보딩 상태 확인
      try {
        const onboardingResponse = await getOnboardingStatus();
        setOnboardingCompleted(onboardingResponse.onboarding_completed || false);
      } catch (onboardingErr) {
        console.log('Failed to load onboarding status:', onboardingErr);
        setOnboardingCompleted(false);
      }
    } catch (err) {
      // 403 또는 401 에러는 정상적인 상황 (로그인하지 않은 상태)
      if (err.response?.status === 403 || err.response?.status === 401) {
        console.log('User not authenticated - this is normal for initial load');
      } else {
        console.error('Failed to load user:', err);
      }
      setIsAuthenticated(false);
      setUser(null);
      setOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 처리
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.post('/dj-rest-auth/registration/', {
        username: userData.username,
        email: userData.email,
        password1: userData.password,
        password2: userData.password,
        first_name: userData.firstName || '',
        last_name: userData.lastName || ''
      });
      
      // 세션 기반 인증이므로 토큰 저장 불필요
      // 사용자 정보 설정
      setUser(response.data.user || response.data);
      setIsAuthenticated(true);
      
      // 회원가입 후에는 온보딩이 필요하므로 false로 설정
      setOnboardingCompleted(false);
      
      return response.data;
    } catch (err) {
      console.error('Registration error details:', err.response?.data);
      
      let errorMessage = '회원가입에 실패했습니다.';
      
      if (err.response?.data) {
        const data = err.response.data;
        
        // 필드별 에러 메시지 처리
        if (data.username) {
          errorMessage = `사용자명: ${Array.isArray(data.username) ? data.username[0] : data.username}`;
        } else if (data.email) {
          errorMessage = `이메일: ${Array.isArray(data.email) ? data.email[0] : data.email}`;
        } else if (data.password1) {
          errorMessage = `비밀번호: ${Array.isArray(data.password1) ? data.password1[0] : data.password1}`;
        } else if (data.password2) {
          errorMessage = `비밀번호 확인: ${Array.isArray(data.password2) ? data.password2[0] : data.password2}`;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 처리
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.post('/dj-rest-auth/login/', {
        email: credentials.email,
        password: credentials.password
      });

      // 세션 기반 인증이므로 토큰 저장 불필요
      // 사용자 정보 설정
      setUser(response.data.user || response.data);
      setIsAuthenticated(true);
      
      // 로그인 후 온보딩 상태 확인
      try {
        const onboardingResponse = await getOnboardingStatus();
        setOnboardingCompleted(onboardingResponse.onboarding_completed || false);
      } catch (onboardingErr) {
        console.log('Failed to load onboarding status after login:', onboardingErr);
        setOnboardingCompleted(false);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.non_field_errors?.[0] ||
                          '로그인에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      setIsLoading(true);
      
      await axiosInstance.post('/dj-rest-auth/logout/');
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      // 상태 초기화
      setUser(null);
      setIsAuthenticated(false);
      setOnboardingCompleted(false);
      setIsLoading(false);
      
      // 브라우저의 모든 쿠키 삭제
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // 세션 스토리지와 로컬 스토리지 클리어
      sessionStorage.clear();
      localStorage.clear();
      
      // 로그아웃 후 명시적으로 홈 페이지로 리다이렉팅
      window.location.href = '/';
    }
  };

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    loadUser();
  }, []);

  // 온보딩 완료 처리 함수
  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  const value = {
    user,
    isAuthenticated,
    onboardingCompleted,
    isLoading,
    error,
    login,
    logout,
    register,
    loadUser,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}; 