import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RegisterForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  
  const [form, setForm] = useState({
    userId: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
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
    
    if (!form.userId.trim()) {
      errors.userId = '아이디를 입력해주세요.';
    } else if (form.userId.length < 4) {
      errors.userId = '아이디는 4자 이상이어야 합니다.';
    }
    
    if (!form.nickname.trim()) {
      errors.nickname = '닉네임을 입력해주세요.';
    }
    
    if (!form.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!form.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (form.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.';
    }
    
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!form.address.trim()) {
      errors.address = '주소를 입력해주세요.';
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
        userId: form.userId,
        nickname: form.nickname,
        email: form.email,
        password: form.password,
        address: form.address
      };
      
      await register(userData);
      
      // 회원가입 성공 시 온보딩 페이지로 이동
      navigate('/onboarding');
    } catch (err) {
      setLocalError(err.message || '회원가입에 실패했습니다.');
    }
  };

  const handleDuplicateCheck = (field) => {
    // TODO: 실제 중복 검사 로직 (현재는 임시)
    alert(`${field === 'userId' ? '아이디' : '닉네임'} 중복 확인 기능은 추후 구현됩니다.`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 전체 에러 메시지 */}
      {(localError || error) && (
        <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
          {localError || error}
        </div>
      )}

      {/* 아이디 + 중복확인 */}
      <div className="flex space-x-2">
        <div className="flex-1">
          <input
            name="userId"
            value={form.userId}
            onChange={handleChange}
            placeholder="아이디"
            className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              validationErrors.userId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            required
          />
          {validationErrors.userId && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.userId}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => handleDuplicateCheck('userId')}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          disabled={isLoading}
        >
          중복확인
        </button>
      </div>

      {/* 닉네임 + 중복확인 */}
      <div className="flex space-x-2">
        <div className="flex-1">
          <input
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder="닉네임"
            className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              validationErrors.nickname ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            required
          />
          {validationErrors.nickname && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.nickname}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => handleDuplicateCheck('nickname')}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          disabled={isLoading}
        >
          중복확인
        </button>
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

      {/* 비밀번호 */}
      <div>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="비밀번호"
          className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            validationErrors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          required
        />
        {validationErrors.password && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
        )}
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

      {/* 주소 */}
      <div>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="주소 (배송지)"
          className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            validationErrors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          required
        />
        {validationErrors.address && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
        )}
      </div>

      {/* 약관 동의 */}
      <div className="flex items-center">
        <input
          id="agreed"
          name="agreed"
          type="checkbox"
          checked={form.agreed}
          onChange={handleChange}
          className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
          disabled={isLoading}
        />
        <label htmlFor="agreed" className="ml-2 text-sm text-gray-600">
          이용약관 및 개인정보 수집에 동의합니다
        </label>
      </div>
      {validationErrors.agreed && (
        <p className="text-red-500 text-xs">{validationErrors.agreed}</p>
      )}

      {/* 가입하기 버튼 */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:bg-gray-400"
      >
        {isLoading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
};

export default RegisterForm;