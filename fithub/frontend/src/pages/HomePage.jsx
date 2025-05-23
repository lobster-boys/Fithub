import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';

const HomePage = () => {
  // 실제 인증 상태에 따라 동적으로 변경됩니다
  const isAuthenticated = true;
  const user = {
    username: '사용자',
    level: '초급자',
    goals: '체중 감량, 근력 강화'
  };

  return (
    <div>
      {/* Welcome Section with User Info */}
      <section className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
            <i className="fas fa-user text-primary text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">안녕하세요, {user?.username}님!</h2>
            <p className="text-sm text-gray-600">레벨: {user?.level} • {user?.goals}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">주간 진행 현황</h2>
            <Link to="/workouts" className="text-primary font-medium">
              자세히 보기
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 운동 일수 */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    className="progress-ring__circle"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#FC4E00"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                    strokeDashoffset="40"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">3/5</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">운동 일수</p>
            </div>
            
            {/* 소모 칼로리 */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <i className="fas fa-fire text-3xl text-primary"></i>
              </div>
              <p className="text-lg font-bold">1,240 kcal</p>
              <p className="text-sm text-gray-600">소모 칼로리</p>
            </div>
            
            {/* 활동 시간 */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <i className="fas fa-clock text-3xl text-primary"></i>
              </div>
              <p className="text-lg font-bold">85 min</p>
              <p className="text-sm text-gray-600">활동 시간</p>
            </div>
            
            {/* 연속 기록 */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <i className="fas fa-bolt text-3xl text-primary"></i>
              </div>
              <p className="text-lg font-bold">7 일</p>
              <p className="text-sm text-gray-600">연속 기록</p>
            </div>
          </div>
        </div>
      </section>

      {/* 추천 운동 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">맞춤 추천 운동</h2>
          <Link to="/workouts" className="text-primary font-medium">
            더보기
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 운동 카드 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm relative workout-card">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Full Body Workout"
              className="w-full h-40 object-cover"
            />
            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              <i className="fas fa-bolt mr-1"></i> 초급자
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-1">전신 운동 루틴</h3>
              <p className="text-sm text-gray-600 mb-2">20분 • 180kcal</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <i className="fas fa-user-circle text-gray-400 mr-1"></i>
                  <span className="text-xs text-gray-500">12,400명 참여</span>
                </div>
                <Link to="/workouts/1" className="text-primary font-medium text-sm">
                  시작하기
                </Link>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 workout-overlay">
              <Link to="/workouts/1" className="bg-primary text-white px-4 py-2 rounded-full font-medium">
                <i className="fas fa-play mr-1"></i> 운동 시작하기
              </Link>
            </div>
          </div>

          {/* 운동 카드 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm relative workout-card">
            <img
              src="https://images.unsplash.com/photo-1538805060514-97d9cc87630a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
              alt="Core Workout"
              className="w-full h-40 object-cover"
            />
            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              <i className="fas fa-bolt mr-1"></i> 중급자
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-1">코어 강화 운동</h3>
              <p className="text-sm text-gray-600 mb-2">15분 • 120kcal</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <i className="fas fa-user-circle text-gray-400 mr-1"></i>
                  <span className="text-xs text-gray-500">8,700명 참여</span>
                </div>
                <Link to="/workouts/2" className="text-primary font-medium text-sm">
                  시작하기
                </Link>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 workout-overlay">
              <Link to="/workouts/2" className="bg-primary text-white px-4 py-2 rounded-full font-medium">
                <i className="fas fa-play mr-1"></i> 운동 시작하기
              </Link>
            </div>
          </div>

          {/* 운동 카드 3 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm relative workout-card">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c95595902d5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Yoga Flow"
              className="w-full h-40 object-cover"
            />
            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              <i className="fas fa-bolt mr-1"></i> 모든 레벨
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-1">모닝 요가 플로우</h3>
              <p className="text-sm text-gray-600 mb-2">25분 • 150kcal</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <i className="fas fa-user-circle text-gray-400 mr-1"></i>
                  <span className="text-xs text-gray-500">15,200명 참여</span>
                </div>
                <Link to="/workouts/3" className="text-primary font-medium text-sm">
                  시작하기
                </Link>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 workout-overlay">
              <Link to="/workouts/3" className="bg-primary text-white px-4 py-2 rounded-full font-medium">
                <i className="fas fa-play mr-1"></i> 운동 시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 식단 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">오늘의 식단</h2>
          <Link to="/diet" className="text-primary font-medium">
            전체 보기
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 식사 1 */}
          <div className="p-4 border-b border-gray-100 flex items-center">
            <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center mr-4">
              <i className="fas fa-utensils text-primary text-xl"></i>
            </div>
            <div className="flex-grow">
              <h3 className="font-bold">아침</h3>
              <p className="text-sm text-gray-600">그릭 요거트, 베리 및 그래놀라</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">320 kcal</p>
              <p className="text-xs text-gray-500">고단백</p>
            </div>
          </div>
          
          {/* 식사 2 */}
          <div className="p-4 border-b border-gray-100 flex items-center">
            <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center mr-4">
              <i className="fas fa-apple-alt text-primary text-xl"></i>
            </div>
            <div className="flex-grow">
              <h3 className="font-bold">간식</h3>
              <p className="text-sm text-gray-600">사과 및 아몬드 버터</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">200 kcal</p>
              <p className="text-xs text-gray-500">건강한 지방</p>
            </div>
          </div>
          
          {/* 식사 3 */}
          <div className="p-4 flex items-center">
            <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center mr-4">
              <i className="fas fa-drumstick-bite text-primary text-xl"></i>
            </div>
            <div className="flex-grow">
              <h3 className="font-bold">점심</h3>
              <p className="text-sm text-gray-600">그릴드 치킨, 퀴노아, 야채</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">450 kcal</p>
              <p className="text-xs text-gray-500">균형 잡힌</p>
            </div>
          </div>
        </div>
      </section>

      {/* 쇼핑 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">추천 용품</h2>
          <Link to="/shop" className="text-primary font-medium">
            모두 보기
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 상품 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1595079835353-a57d9648f3e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
                alt="Resistance Bands"
                className="w-full h-40 object-cover"
              />
              <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                <i className="fas fa-heart text-gray-400"></i>
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm mb-1">프리미엄 저항 밴드 세트</h3>
              <div className="flex items-center mb-1">
                <div className="flex text-yellow-400 text-xs">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star-half-alt"></i>
                </div>
                <span className="text-xs text-gray-500 ml-1">(1.2k)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary">₩24,900</span>
                <Link to="/shop/1" className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                  <i className="fas fa-shopping-cart mr-1"></i> 담기
                </Link>
              </div>
            </div>
          </div>
          
          {/* 상품 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1579751626657-72bc17010498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
                alt="Yoga Mat"
                className="w-full h-40 object-cover"
              />
              <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                <i className="fas fa-heart text-gray-400"></i>
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm mb-1">미끄럼 방지 요가 매트</h3>
              <div className="flex items-center mb-1">
                <div className="flex text-yellow-400 text-xs">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <span className="text-xs text-gray-500 ml-1">(2.4k)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary">₩29,900</span>
                <Link to="/shop/2" className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                  <i className="fas fa-shopping-cart mr-1"></i> 담기
                </Link>
              </div>
            </div>
          </div>
          
          {/* 추가 상품은 필요에 따라 계속 추가 가능 */}
        </div>
      </section>
      
      {/* 커뮤니티 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">커뮤니티</h2>
          <Link to="/community" className="text-primary font-medium">
            더보기
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 게시글 1 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-medium">Jessica Park</h4>
                <p className="text-xs text-gray-500">2시간 전</p>
              </div>
            </div>
            <p className="mb-3">30일 전신 챌린지를 완료했어요! 🎉 제 진행 상황이 너무 자랑스럽습니다. 마지막 주는 힘들었지만 완전히 가치가 있었어요!</p>
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button className="flex items-center text-gray-500 hover:text-primary">
                  <i className="far fa-heart mr-1"></i>
                  <span>124</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-primary">
                  <i className="far fa-comment mr-1"></i>
                  <span>23</span>
                </button>
              </div>
              <button className="text-gray-500 hover:text-primary">
                <i className="far fa-bookmark"></i>
              </button>
            </div>
          </div>
          
          {/* 게시글 2 */}
          <div className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-medium">Michael Chen</h4>
                <p className="text-xs text-gray-500">5시간 전</p>
              </div>
            </div>
            <p className="mb-3">새로운 코어 크러셔 운동을 해보신 분 계신가요? 자전거 크런치 중에 자세를 유지하는 팁이 필요합니다.</p>
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button className="flex items-center text-gray-500 hover:text-primary">
                  <i className="far fa-heart mr-1"></i>
                  <span>87</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-primary">
                  <i className="far fa-comment mr-1"></i>
                  <span>15</span>
                </button>
              </div>
              <button className="text-gray-500 hover:text-primary">
                <i className="far fa-bookmark"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 