import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  // 이미 인증된 사용자는 홈으로 리다이렉트
  if (isAuthenticated) {
    console.log('[LoginPage] 이미 인증된 사용자, 홈으로 리다이렉트');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <LoginForm />
    </div>
  );
};

export default LoginPage;