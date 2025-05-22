import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    address: '',
    agreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!form.agreed) {
      alert('약관에 동의해주세요.');
      return;
    }
    // onSubmit prop이 있으면 호출, 아니면 예시로 로그인 페이지로 이동
    if (onSubmit) {
      onSubmit(form);
    } else {
      console.log('폼 데이터 →', form);
      navigate('/login');
    }
  };

  const handleDuplicateCheck = (field) => {
    // TODO: API 콜로 중복 검사 로직 넣기
    alert(`${field === 'userId' ? '아이디' : '닉네임'} 중복 확인 로직을 구현하세요.`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 아이디 + 중복확인 */}
      <div className="flex space-x-2">
        <input
          name="userId"
          value={form.userId}
          onChange={handleChange}
          placeholder="아이디"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <button
          type="button"
          onClick={() => handleDuplicateCheck('userId')}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          중복확인
        </button>
      </div>

      {/* 닉네임 + 중복확인 */}
      <div className="flex space-x-2">
        <input
          name="nickname"
          value={form.nickname}
          onChange={handleChange}
          placeholder="닉네임"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <button
          type="button"
          onClick={() => handleDuplicateCheck('nickname')}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          중복확인
        </button>
      </div>

      {/* 비밀번호 */}
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="비밀번호"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
        required
      />

      {/* 비밀번호 확인 */}
      <input
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="비밀번호 확인"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
        required
      />

      {/* 주소 */}
      <input
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="주소 (배송지)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
        required
      />

      {/* 약관 동의 */}
      <div className="flex items-center">
        <input
          id="agreed"
          name="agreed"
          type="checkbox"
          checked={form.agreed}
          onChange={handleChange}
          className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
        />
        <label htmlFor="agreed" className="ml-2 text-sm text-gray-600">
          이용약관 및 개인정보 수집에 동의합니다
        </label>
      </div>

      {/* 가입하기 버튼 */}
      <button
        type="submit"
        className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
      >
        회원가입
      </button>
    </form>
  );
};

export default RegisterForm;