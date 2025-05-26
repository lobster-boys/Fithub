import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 메시지 초기화
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.userId || !formData.password) {
      setLocalError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(formData);
      // 로그인 성공 시 홈페이지로 이동
      navigate('/');
    } catch (err) {
      setLocalError(err.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-[300px] p-4">
        <h1 className="text-3xl font-bold text-center mb-6">FitHub</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            placeholder="아이디 또는 이메일"
            className="w-full p-2 border border-gray-300 rounded mb-3"
            disabled={isLoading}
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
            className="w-full p-2 border border-gray-300 rounded mb-3"
            disabled={isLoading}
          />

          {/* 에러 메시지 표시 */}
          {(localError || error) && (
            <div className="text-red-500 text-sm mb-3 text-center">
              {localError || error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-2 rounded font-bold mb-4 hover:bg-orange-600 disabled:bg-gray-400"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 mb-3">또는</div>

        <button className="w-full bg-yellow-400 text-black py-2 rounded font-semibold mb-2 hover:bg-yellow-500">
          카카오로 시작하기
        </button>
        <button className="w-full bg-green-500 text-white py-2 rounded font-semibold mb-2 hover:bg-green-600">
          네이버로 시작하기
        </button>
        <button className="w-full bg-white border border-gray-400 text-black py-2 rounded font-semibold hover:bg-gray-100">
          구글로 시작하기
        </button>

        <div className="text-center text-sm mt-6">
          계정이 없으신가요?{' '}
          <button
            className="text-black underline"
            onClick={() => navigate('/auth/register')}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
    
  );
};

export default LoginForm;
