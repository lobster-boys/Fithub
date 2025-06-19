import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
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
    console.log('[RegisterPage] 이미 인증된 사용자, 홈으로 리다이렉트');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-12 px-4">
      {/* 상단 로고 */}
      <h1 className="text-3xl font-bold mb-6">FitHub</h1>

      {/* 카드 컨테이너 */}
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold mb-1">회원가입</h2>
        <p className="text-sm text-gray-600 mb-6">기본 정보를 입력해주세요</p>

        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;