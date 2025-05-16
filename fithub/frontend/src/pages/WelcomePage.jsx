import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const handleSignupClick = () => {
    navigate('/auth/signup');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // 로그인 처리 로직
    setShowLoginModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-orange-400 to-primary text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-fire text-2xl"></i>
            <h1 className="text-xl font-bold">FitHub</h1>
          </div>
          <div>
            <button 
              onClick={handleLoginClick}
              className="bg-white text-primary font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              로그인
            </button>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-r from-orange-400 to-primary text-white py-16 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">당신만의 피트니스 여정을<br/>시작하세요</h1>
            <p className="text-lg mb-8">개인화된 운동 계획, 식단 관리, 피트니스 커뮤니티를 한 곳에서 경험하세요.</p>
            <button 
              onClick={handleSignupClick}
              className="bg-white text-primary font-bold px-8 py-3 rounded-full text-lg hover:bg-gray-100 shadow-lg"
            >
              무료로 시작하기
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt="Fitness" 
              className="rounded-lg shadow-2xl max-w-full h-auto w-4/5"
            />
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">FitHub가 제공하는 특별한 기능</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-dumbbell text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">맞춤형 운동 계획</h3>
              <p className="text-gray-600 text-center">당신의 목표, 피트니스 레벨, 사용 가능한 장비에 맞게 개인화된 운동 계획을 제공합니다.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-utensils text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">영양 및 식단 관리</h3>
              <p className="text-gray-600 text-center">건강한 식단 추천과 함께 영양 목표를 달성할 수 있도록 도와드립니다.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-users text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">피트니스 커뮤니티</h3>
              <p className="text-gray-600 text-center">같은 목표를 가진 사람들과 연결하고 동기부여를 받으세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-gradient-to-r from-orange-400 to-primary text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 FitHub에 가입하세요</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">건강한 라이프스타일을 위한 첫 걸음, FitHub와 함께하세요. 무료로 시작하고 더 건강한 버전의 당신을 만나보세요.</p>
          <button 
            onClick={handleSignupClick}
            className="bg-white text-primary font-bold px-8 py-3 rounded-full text-lg hover:bg-gray-100 shadow-lg"
          >
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">로그인</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">이메일</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">비밀번호</label>
                <input 
                  type="password" 
                  id="password" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  required
                />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input type="checkbox" id="remember" className="mr-2" />
                  <label htmlFor="remember" className="text-sm text-gray-600">로그인 상태 유지</label>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">비밀번호 찾기</a>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-orange-600"
              >
                로그인
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요? 
                <button 
                  onClick={handleSignupClick} 
                  className="text-primary hover:underline ml-1"
                >
                  회원가입
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage; 