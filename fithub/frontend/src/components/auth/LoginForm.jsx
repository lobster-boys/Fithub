import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-[300px] p-4">
        <h1 className="text-3xl font-bold text-center mb-6">FitHub</h1>

        <input
          type="email"
          placeholder="이메일"
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />

        <button className="w-full bg-orange-500 text-white py-2 rounded font-bold mb-4 hover:bg-orange-600">
          로그인
        </button>

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
