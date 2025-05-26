import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import ProductCardList from '../../components/ecommerce/ProductCardList';
import useWorkoutData from '../../hooks/useWorkoutData';
import { useDiet } from '../../hooks/useDiet';
import useEcommerce from '../../hooks/useEcommerce';
import useCommunity from '../../hooks/useCommunity';

function HomePage() {
  // 실제 인증 상태에 따라 동적으로 변경됩니다
  const isAuthenticated = true;
  const user = {
    username: '사용자',
    level: '초급자',
    goals: '체중 감량, 근력 강화'
  };

  // 운동 데이터 훅 사용
  const { getWeeklyStats, getStreakDays } = useWorkoutData();
  const weeklyStats = getWeeklyStats();
  const streakDays = getStreakDays();

  // 식단 데이터 훅 사용
  const { todayDiet, loading: dietLoading, error: dietError } = useDiet();

  // 이커머스 데이터 훅 사용
  const { getHomePageRecommendations } = useEcommerce();
  const recommendedProducts = getHomePageRecommendations(4);

  // 커뮤니티 데이터 훅 사용
  const { getPopularPosts } = useCommunity();
  const popularPosts = getPopularPosts(2);

  // 목표 값들 (설정 가능)
  const weeklyWorkoutGoal = 5; // 주 5회 운동 목표
  const workoutDaysProgress = Math.min((weeklyStats.workoutDays / weeklyWorkoutGoal) * 100, 100);

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
            <Link to="/workouts/log" className="text-primary font-medium">
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
                    strokeDashoffset={100 - workoutDaysProgress}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{weeklyStats.workoutDays}/{weeklyWorkoutGoal}</span>
                </div>
              </div>
              <p className="text-lg font-bold">{weeklyStats.workoutDays} 일</p>
              <p className="text-sm text-gray-600">운동 일수</p>
            </div>
            
            {/* 소모 칼로리 */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <i className="fas fa-fire text-3xl text-primary"></i>
              </div>
              <p className="text-lg font-bold">{weeklyStats.totalCalories.toLocaleString()} kcal</p>
              <p className="text-sm text-gray-600">소모 칼로리</p>
            </div>
            
            {/* 활동 시간 */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <i className="fas fa-clock text-3xl text-primary"></i>
              </div>
              <p className="text-lg font-bold">{weeklyStats.totalDuration} min</p>
              <p className="text-sm text-gray-600">활동 시간</p>
            </div>
            
            {/* 연속 기록 */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <i className="fas fa-bolt text-3xl text-primary"></i>
              </div>
              <p className="text-lg font-bold">{streakDays} 일</p>
              <p className="text-sm text-gray-600">연속 기록</p>
            </div>
          </div>
        </div>
      </section>

      {/* 추천 운동 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">맞춤 추천 운동</h2>
          <Link to="/workouts/log" className="text-primary font-medium">
            더보기
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 운동 카드 1 */}
          <Link to="/workouts/1" className="bg-white rounded-xl overflow-hidden shadow-sm relative workout-card">
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
                <span className="text-primary font-medium text-sm">
                  시작하기
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 workout-overlay">
              <span className="bg-primary text-white px-4 py-2 rounded-full font-medium">
                <i className="fas fa-play mr-1"></i> 운동 시작하기
              </span>
            </div>
          </Link>

          {/* 운동 카드 2 */}
          <Link to="/workouts/2" className="bg-white rounded-xl overflow-hidden shadow-sm relative workout-card">
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
                <span className="text-primary font-medium text-sm">
                  시작하기
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 workout-overlay">
              <span className="bg-primary text-white px-4 py-2 rounded-full font-medium">
                <i className="fas fa-play mr-1"></i> 운동 시작하기
              </span>
            </div>
          </Link>

          {/* 운동 카드 3 */}
          <Link to="/workouts/3" className="bg-white rounded-xl overflow-hidden shadow-sm relative workout-card">
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
                <span className="text-primary font-medium text-sm">
                  시작하기
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 workout-overlay">
              <span className="bg-primary text-white px-4 py-2 rounded-full font-medium">
                <i className="fas fa-play mr-1"></i> 운동 시작하기
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 식단 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">오늘의 식단</h2>
          <Link to="/diet" className="text-primary font-medium">
            더보기
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {dietLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">식단 정보를 불러오는 중...</p>
            </div>
          ) : dietError ? (
            <div className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
              <p className="text-gray-500">식단 정보를 불러올 수 없습니다.</p>
            </div>
          ) : todayDiet && todayDiet.meals && todayDiet.meals.length > 0 ? (
            todayDiet.meals.map((meal, index) => {
              const mealIcons = {
                '아침': 'fas fa-utensils',
                '점심': 'fas fa-drumstick-bite',
                '저녁': 'fas fa-utensils',
                '간식': 'fas fa-apple-alt'
              };
              
              const mealTypes = {
                '아침': '고단백',
                '점심': '균형 잡힌',
                '저녁': '저칼로리',
                '간식': '건강한 지방'
              };

              return (
                <Link 
                  key={index} 
                  to={`/ingredient/${meal.id || index + 1}`} 
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    index < todayDiet.meals.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center mr-4">
                      <i className={`${mealIcons[meal.name] || 'fas fa-utensils'} text-primary text-xl`}></i>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold">{meal.name}</h3>
                      <p className="text-sm text-gray-600">
                        {meal.foods.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{meal.calories} kcal</p>
                      <p className="text-xs text-gray-500">{mealTypes[meal.name] || '영양가 있는'}</p>
                    </div>
                    <div className="ml-3">
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <i className="fas fa-utensils text-gray-300 text-3xl mb-3"></i>
              <p className="text-gray-500 mb-3">오늘 등록된 식사가 없습니다.</p>
              <Link 
                to="/diet" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
              >
                <i className="fas fa-plus mr-1"></i>
                식사 추가하기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 쇼핑 섹션 */}
      <section className="mb-8">
        <ProductCardList
          title="추천 용품"
          viewAllLink={
            <Link to="/shop" className="text-primary font-medium">
              모두 보기
            </Link>
          }
          products={recommendedProducts}
          compact={true}
        />
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
          {popularPosts.length > 0 ? (
            popularPosts.map((post, index) => (
              <Link 
                key={post.id} 
                to={`/community/${post.id}`}
                className={`block p-4 hover:bg-gray-50 transition-colors ${
                  index < popularPosts.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{post.author.name}</h4>
                    <p className="text-xs text-gray-500">{post.date}</p>
                  </div>
                </div>
                <h3 className="font-bold mb-2">{post.title}</h3>
                <p className="mb-3 text-gray-700 line-clamp-2">
                  {post.content.length > 100 
                    ? `${post.content.substring(0, 100)}...` 
                    : post.content
                  }
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <div className="flex items-center text-gray-500">
                      <i className="far fa-heart mr-1"></i>
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <i className="far fa-comment mr-1"></i>
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <i className="far fa-eye mr-1"></i>
                      <span>{post.views}</span>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center">
              <i className="fas fa-comments text-gray-300 text-3xl mb-3"></i>
              <p className="text-gray-500 mb-3">아직 게시글이 없습니다.</p>
              <Link 
                to="/community" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
              >
                <i className="fas fa-plus mr-1"></i>
                첫 번째 글 작성하기
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage; 