import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RegisterForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreed: false,
  });
  
  const [localError, setLocalError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 입력 시 에러 메시지 초기화
    if (localError) setLocalError('');
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // 사용자명 검증
    if (!form.username.trim()) {
      errors.username = '사용자명을 입력해주세요.';
    } else if (form.username.length < 3) {
      errors.username = '사용자명은 최소 3자 이상이어야 합니다.';
    } else if (form.username.length > 20) {
      errors.username = '사용자명은 최대 20자까지 가능합니다.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      errors.username = '사용자명은 영문, 숫자, 언더스코어(_)만 사용 가능합니다.';
    } else if (/^\d+$/.test(form.username)) {
      errors.username = '사용자명은 숫자로만 구성될 수 없습니다.';
    }
    
    // 이메일 검증
    if (!form.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    // 비밀번호 검증 (백엔드 요구사항에 맞춤)
    if (!form.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else {
      const passwordErrors = [];
      
      if (form.password.length < 8) {
        passwordErrors.push('8자 이상');
      }
      if (!/[A-Z]/.test(form.password)) {
        passwordErrors.push('대문자 1개 이상');
      }
      if (!/[a-z]/.test(form.password)) {
        passwordErrors.push('소문자 1개 이상');
      }
      if (!/[0-9]/.test(form.password)) {
        passwordErrors.push('숫자 1개 이상');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        passwordErrors.push('특수문자 1개 이상');
      }
      
      // 연속 문자 검증
      for (let i = 0; i < form.password.length - 2; i++) {
        if (form.password.charCodeAt(i) === form.password.charCodeAt(i+1) - 1 && 
            form.password.charCodeAt(i+1) === form.password.charCodeAt(i+2) - 1) {
          passwordErrors.push('연속된 문자 금지');
          break;
        }
      }
      
      // 반복 문자 검증
      for (let i = 0; i < form.password.length - 2; i++) {
        if (form.password[i] === form.password[i+1] && form.password[i+1] === form.password[i+2]) {
          passwordErrors.push('동일 문자 3번 연속 금지');
          break;
        }
      }
      
      if (passwordErrors.length > 0) {
        errors.password = `비밀번호 요구사항: ${passwordErrors.join(', ')}`;
      }
    }
    
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!form.agreed) {
      errors.agreed = '약관에 동의해주세요.';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setValidationErrors({});
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // 회원가입 데이터 준비
      const userData = {
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName
      };
      
      await register(userData);
      
      // 회원가입 성공 시 온보딩 페이지로 이동
      navigate('/onboarding');
    } catch (err) {
      setLocalError(err.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 전체 에러 메시지 */}
      {(localError || error) && (
        <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
          {localError || error}
        </div>
      )}

      {/* 사용자명 */}
      <div>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="사용자명"
          className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            validationErrors.username ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          required
        />
        {validationErrors.username && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>
        )}
      </div>

      {/* 이메일 */}
      <div>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="이메일"
          className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            validationErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          required
        />
        {validationErrors.email && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
        )}
      </div>

      {/* 이름 (선택사항) */}
      <div className="grid grid-cols-2 gap-2">
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="이름 (선택사항)"
          className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          disabled={isLoading}
        />
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="성 (선택사항)"
          className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          disabled={isLoading}
        />
      </div>

      {/* 비밀번호 */}
      <div>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="비밀번호 (8자이상, 대소문자+숫자+특수문자)"
          className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            validationErrors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          required
        />
        {validationErrors.password && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
        )}
        <div className="text-xs text-gray-500 mt-1">
          <p>비밀번호 요구사항:</p>
          <ul className="list-disc list-inside ml-2">
            <li>8자 이상</li>
            <li>대문자, 소문자, 숫자, 특수문자 각 1개 이상</li>
            <li>연속된 문자나 반복 문자 금지</li>
          </ul>
          <p className="mt-1 text-blue-600">예시: Password123!</p>
        </div>
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="비밀번호 확인"
          className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          required
        />
        {validationErrors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
        )}
      </div>

      {/* 약관 동의 */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="agreed"
          checked={form.agreed}
          onChange={handleChange}
          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
          disabled={isLoading}
          required
        />
        <label className="text-sm text-gray-700">
          이용약관 및 개인정보처리방침에 동의합니다. (필수)
        </label>
      </div>
      {validationErrors.agreed && (
        <p className="text-red-500 text-xs mt-1">{validationErrors.agreed}</p>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-200 disabled:bg-gray-400"
      >
        {isLoading ? '회원가입 중...' : '회원가입'}
      </button>

      {/* 로그인 링크 */}
      <div className="text-center text-sm text-gray-600 mt-4">
        이미 계정이 있으신가요?{' '}
        <button
          type="button"
          onClick={() => navigate('/auth/login')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          로그인
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;