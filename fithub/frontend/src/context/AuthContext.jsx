import React, { createContext, useState, useEffect } from 'react';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 임시 사용자 데이터베이스 (로컬 스토리지 사용)
  const getStoredUsers = () => {
    const users = localStorage.getItem('fithub_users');
    return users ? JSON.parse(users) : [];
  };

  const saveUser = (userData) => {
    const users = getStoredUsers();
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('fithub_users', JSON.stringify(users));
    return newUser;
  };

  // 사용자 정보 로드
  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('fithub_token');
      const currentUser = localStorage.getItem('fithub_current_user');
      
      if (!token || !currentUser) {
        setIsLoading(false);
        return;
      }

      const userData = JSON.parse(currentUser);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError('사용자 정보를 불러오는데 실패했습니다.');
      localStorage.removeItem('fithub_token');
      localStorage.removeItem('fithub_current_user');
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 처리
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const users = getStoredUsers();
      
      // 중복 체크
      const existingUser = users.find(user => 
        user.userId === userData.userId || user.email === userData.email
      );
      
      if (existingUser) {
        throw new Error('이미 존재하는 사용자입니다.');
      }

      // 새 사용자 저장
      const newUser = saveUser(userData);
      
      // 자동 로그인
      const token = `token_${newUser.id}_${Date.now()}`;
      localStorage.setItem('fithub_token', token);
      localStorage.setItem('fithub_current_user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { user: newUser, token };
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
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

      const users = getStoredUsers();
      const user = users.find(u => 
        (u.userId === credentials.userId || u.email === credentials.email) && 
        u.password === credentials.password
      );

      if (!user) {
        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
      }

      const token = `token_${user.id}_${Date.now()}`;
      localStorage.setItem('fithub_token', token);
      localStorage.setItem('fithub_current_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { user, token };
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('fithub_token');
      localStorage.removeItem('fithub_current_user');
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
    register,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 