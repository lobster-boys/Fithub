import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../common/Button';
import Input from '../common/Input';
import useAuth from '../../hooks/useAuth';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login, error: authError, isLoading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const validate = () => {
    const errors = {};
    if (!credentials.username.trim()) {
      errors.username = '사용자 이름을 입력해주세요';
    }
    if (!credentials.password) {
      errors.password = '비밀번호를 입력해주세요';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      await login(credentials);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      // authError는 useAuth 훅에서 자동 처리됨
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
      
      {authError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          label="사용자 이름"
          id="username"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          error={errors.username}
        />
        
        <Input
          label="비밀번호"
          id="password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          error={errors.password}
        />
        
        <div className="flex justify-between items-center mt-2 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-primary focus:ring-primary rounded"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              로그인 유지
            </label>
          </div>
          <a href="#" className="text-sm text-primary hover:underline">
            비밀번호 찾기
          </a>
        </div>
        
        <Button fullWidth type="submit" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
        
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">계정이 없으신가요?</span>
          <button
            type="button"
            onClick={() => navigate('/auth/signup')}
            className="text-sm text-primary hover:underline ml-1"
          >
            회원가입
          </button>
        </div>
        
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-sm text-gray-500">또는</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="bg-gray-100 p-2 rounded-lg flex items-center justify-center hover:bg-gray-200"
          >
            <i className="fab fa-google text-red-500 mr-2"></i>
            <span className="text-sm">구글 로그인</span>
          </button>
          
          <button
            type="button"
            className="bg-gray-100 p-2 rounded-lg flex items-center justify-center hover:bg-gray-200"
          >
            <i className="fab fa-facebook text-blue-600 mr-2"></i>
            <span className="text-sm">페이스북 로그인</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm; 