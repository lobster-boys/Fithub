import React, { createContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getUserProfile } from '../api/authAPI';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 사용자 정보 로드
  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userData = await getUserProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError('사용자 정보를 불러오는데 실패했습니다.');
      // 토큰이 유효하지 않거나 만료된 경우 제거
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 처리
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await loginUser(credentials);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 