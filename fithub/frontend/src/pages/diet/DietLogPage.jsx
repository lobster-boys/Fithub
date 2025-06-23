import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../../components/layout/PageTransition';
import { useDiet, useDietStats } from '../../hooks/useDiet';
import { useAuth } from '../../hooks/useAuth';
import DietRecommendationModal from '../../components/diet/DietRecommendationModal';
import MealPlanModal from '../../components/diet/MealPlanModal';

const DietLogPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // useDiet 훅 사용 - 인증된 사용자만
  const {
    foods,
    mealPlans,
    todayMealPlan,
    loading,
    error,
    searchFoods,
    fetchMealPlans,
    createMealPlan,
    updateWaterIntake,
    calculateMealCalories,
    getBasicRecommendation,
    getRecommendationByMealType,
    getSampleRecommendationData,
    refetch
  } = isAuthenticated ? useDiet() : {
    foods: [],
    mealPlans: [],
    todayMealPlan: null,
    loading: false,
    error: '로그인이 필요한 서비스입니다.',
    searchFoods: () => {},
    fetchMealPlans: () => {},
    createMealPlan: () => {},
    updateWaterIntake: () => {},
    calculateMealCalories: () => 0,
    getBasicRecommendation: () => null,
    getRecommendationByMealType: () => null,
    getSampleRecommendationData: () => null,
    refetch: () => {}
  };

  // useDietStats 훅 사용 - 인증된 사용자만
  const { stats: dietStats } = isAuthenticated ? useDietStats() : { stats: null };
  
  // 웹킷 스크롤바 숨기기 스타일 추가
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #meals-carousel::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 로컬 상태 관리
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // 추천 관련 상태
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);

  // 새 식사 추가 상태
  const [newMeal, setNewMeal] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    foods: [],
    calories: 0
  });

  const [newFood, setNewFood] = useState({
    name: '',
    calories: 0,
    amount: ''
  });

  // 음식 검색 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 캐러셀 상태 관리
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 로그 필터 상태
  const [logPeriod, setLogPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [weeklyViewPeriod, setWeeklyViewPeriod] = useState('week'); // 'week', 'month', 'year'

  // 캐러셀 스크롤 상태 확인
  const checkScrollButtons = () => {
    const container = document.getElementById('meals-carousel');
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  // 캐러셀 스크롤 함수
  const scrollCarousel = (direction) => {
    const container = document.getElementById('meals-carousel');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  // 컴포넌트 마운트 시 스크롤 버튼 상태 확인
  useEffect(() => {
    const container = document.getElementById('meals-carousel');
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, []);

  useEffect(() => {
    setTimeout(checkScrollButtons, 100);
  }, [mealPlans]);

  // 오늘 통계 계산 (todayMealPlan 기반)
  const getTodayStats = () => {
    if (!todayMealPlan) {
      return {
        totalCalories: 0,
        targetCalories: 1800,
        mealsCount: 0,
        waterIntake: 0
      };
    }

    return {
      totalCalories: todayMealPlan.totalCalories || 0,
      targetCalories: todayMealPlan.targetCalories || 1800,
      mealsCount: todayMealPlan.meals?.length || 0,
      waterIntake: todayMealPlan.water || 0
    };
  };

  // 주간 통계 계산 (dietStats 기반)
  const getWeeklyStats = () => {
    if (!dietStats) {
      return {
        totalCalories: 0,
        avgCalories: 0,
        totalMeals: 0,
        totalWater: 0,
        avgWater: 0,
        daysCount: 0
      };
    }

    return dietStats;
  };

  // 기간별 데이터 반환 함수들
  const getWeeklyData = () => {
    const stats = getWeeklyStats();
    return {
      title: '주간',
      totalCalories: stats.totalCalories,
      avgCalories: stats.avgCalories,
      totalMeals: stats.totalMeals,
      totalWater: stats.totalWater,
      avgWater: stats.avgWater,
      daysCount: stats.daysCount
    };
  };

  const getMonthlyData = () => {
    // 월간 데이터는 주간 데이터를 기반으로 추정
    const weeklyData = getWeeklyData();
    const weeksInMonth = 4;
    
    return {
      title: '월간',
      totalCalories: Math.round(weeklyData.totalCalories * weeksInMonth),
      avgCalories: weeklyData.avgCalories,
      totalMeals: Math.round(weeklyData.totalMeals * weeksInMonth),
      totalWater: Math.round(weeklyData.totalWater * weeksInMonth),
      avgWater: weeklyData.avgWater,
      daysCount: Math.round(weeklyData.daysCount * weeksInMonth)
    };
  };

  const getYearlyData = () => {
    // 연간 데이터는 주간 데이터를 기반으로 추정
    const weeklyData = getWeeklyData();
    const weeksInYear = 52;
    
    return {
      title: '연간',
      totalCalories: Math.round(weeklyData.totalCalories * weeksInYear),
      avgCalories: weeklyData.avgCalories,
      totalMeals: Math.round(weeklyData.totalMeals * weeksInYear),
      totalWater: Math.round(weeklyData.totalWater * weeksInYear),
      avgWater: weeklyData.avgWater,
      daysCount: Math.round(weeklyData.daysCount * weeksInYear)
    };
  };

  const getCurrentPeriodData = () => {
    switch (weeklyViewPeriod) {
      case 'week':
        return getWeeklyData();
      case 'month':
        return getMonthlyData();
      case 'year':
        return getYearlyData();
      default:
        return getWeeklyData();
    }
  };

  // 음식 검색 처리
  const handleFoodSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchFoods(query);
        setSearchResults(results);
      } catch (error) {
        console.error('음식 검색 실패:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // 검색 결과에서 음식 선택
  const handleSelectFood = (food) => {
    setNewFood({
      name: food.name || food.title,
      calories: food.calories || 100,
      amount: food.serving_size || '1인분'
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // 식사에 음식 추가
  const handleAddFood = () => {
    if (newFood.name && newFood.calories > 0) {
      setNewMeal({
        ...newMeal,
        foods: [...newMeal.foods, `${newFood.name} (${newFood.amount})`],
        calories: newMeal.calories + parseInt(newFood.calories)
      });
      setNewFood({ name: '', calories: 0, amount: '' });
    }
  };

  // 새 식사 추가 (API 호출)
  const handleAddMeal = async () => {
    if (newMeal.name && newMeal.foods.length > 0) {
      try {
        const mealData = {
          date: newMeal.date,
          name: newMeal.name,
          foods: newMeal.foods,
          calories: newMeal.calories,
          time: newMeal.time
        };

        // MealPlan API로 식사 추가
        await createMealPlan(mealData);
        
        setShowAddMealModal(false);
        setNewMeal({
          name: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          foods: [],
          calories: 0
        });

        // 성공 메시지 (선택사항)
        console.log('식사가 성공적으로 추가되었습니다.');
      } catch (error) {
        console.error('식사 추가 실패:', error);
        // 에러 처리 (토스트 메시지 등)
      }
    }
  };

  // 물 섭취량 추가
  const handleAddWater = () => {
    updateWaterIntake(1); // 1잔 추가
  };

  // 물 섭취량 감소
  const handleRemoveWater = () => {
    updateWaterIntake(-1); // 1잔 감소
  };

  // 로그 상세 보기
  const handleViewDetail = (log) => {
    setSelectedLog(log || todayMealPlan);
    setShowDetailModal(true);
  };

  // ========== 추천 관련 함수들 ==========

  // 기본 식단 추천 요청
  const handleGetRecommendation = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    setRecommendationLoading(true);
    setRecommendationError(null);
    
    try {
      const result = await getBasicRecommendation();
      
      if (result) {
        setRecommendations(result);
        setShowRecommendationModal(true);
      } else {
        // 샘플 데이터 사용
        const sampleData = getSampleRecommendationData();
        setRecommendations(sampleData);
        setShowRecommendationModal(true);
      }
    } catch (err) {
      console.error('추천 요청 실패:', err);
      setRecommendationError('식단 추천을 불러오는데 실패했습니다.');
      
      // 에러 시에도 샘플 데이터 제공
      const sampleData = getSampleRecommendationData();
      setRecommendations(sampleData);
      setShowRecommendationModal(true);
    } finally {
      setRecommendationLoading(false);
    }
  };

  // 특정 식사 타입 추천 요청
  const handleGetMealTypeRecommendation = async (mealType) => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    setRecommendationLoading(true);
    setRecommendationError(null);
    
    try {
      const result = await getRecommendationByMealType(mealType);
      
      if (result) {
        setRecommendations({ [mealType]: result });
        setShowRecommendationModal(true);
      } else {
        // 샘플 데이터 사용
        const sampleData = getSampleRecommendationData();
        setRecommendations({ [mealType]: sampleData[mealType] || [] });
        setShowRecommendationModal(true);
      }
    } catch (err) {
      console.error('식사 타입 추천 요청 실패:', err);
      setRecommendationError(`${mealType} 추천을 불러오는데 실패했습니다.`);
      
      // 에러 시에도 샘플 데이터 제공
      const sampleData = getSampleRecommendationData();
      setRecommendations({ [mealType]: sampleData[mealType] || [] });
      setShowRecommendationModal(true);
    } finally {
      setRecommendationLoading(false);
    }
  };

  // 추천 모달 닫기
  const handleCloseRecommendationModal = () => {
    setShowRecommendationModal(false);
    setRecommendations(null);
    setRecommendationError(null);
  };

  // ========== 식단 계획 관련 함수들 ==========

  // 식단 계획 생성/수정 처리
  const handleMealPlanSubmit = async (mealPlanData) => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      await createMealPlan(mealPlanData);
      console.log('식단 계획이 성공적으로 생성되었습니다.');
      
      // 데이터 새로고침
      await refetch();
    } catch (error) {
      console.error('식단 계획 생성 실패:', error);
      alert('식단 계획 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 식단 계획 모달 닫기
  const handleCloseMealPlanModal = () => {
    setShowMealPlanModal(false);
  };

  // 통계 값들
  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();
  const weeklyChartData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const yearlyData = getYearlyData();

  return (
    <PageTransition>
      <div className="pb-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center px-4 py-4 md:px-6 md:py-6 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">식단 관리</h1>
        </div>

        {/* 통계 요약 - 모바일에서는 스크롤 가능 */}
        <div className="px-4 md:px-6 mb-6 overflow-x-auto">
          <div className="flex md:grid md:grid-cols-4 gap-4 min-w-max md:min-w-0">
            {logPeriod === 'daily' ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
                  <p className="text-gray-600 mb-1">오늘 섭취</p>
                  <p className="text-2xl font-bold text-primary">
                    {todayStats.totalCalories} kcal
                  </p>
                  <p className="text-sm text-gray-500">목표: {todayStats.targetCalories} kcal</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
                  <p className="text-gray-600 mb-1">오늘 식사</p>
                  <p className="text-2xl font-bold">{todayStats.mealsCount} 회</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
                  <p className="text-gray-600 mb-1">주간 평균</p>
                  <p className="text-2xl font-bold">{weeklyStats.avgCalories} kcal</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
                  <p className="text-gray-600 mb-1">물 섭취</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{todayStats.waterIntake} 잔</p>
                    <div className="flex gap-1">
                      <button
                        onClick={handleRemoveWater}
                        className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        disabled={todayStats.waterIntake <= 0}
                      >
                        <i className="fas fa-minus text-xs"></i>
                      </button>
                      <button
                        onClick={handleAddWater}
                        className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                      >
                        <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">목표: 8 잔</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
                  <p className="text-gray-600 mb-1">{getCurrentPeriodData().title} 총 섭취</p>
                  <p className="text-2xl font-bold text-primary">
                    {getCurrentPeriodData().totalCalories} kcal
                  </p>
                  <p className="text-sm text-gray-500">{getCurrentPeriodData().daysCount}일 기록</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
                  <p className="text-gray-600 mb-1">{getCurrentPeriodData().title} 식사</p>
                  <p className="text-2xl font-bold">{getCurrentPeriodData().totalMeals} 회</p>
                  <p className="text-sm text-gray-500">평균 {Math.round(getCurrentPeriodData().totalMeals / Math.max(getCurrentPeriodData().daysCount, 1))} 회/일</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
                  <p className="text-gray-600 mb-1">일평균 칼로리</p>
                  <p className="text-2xl font-bold">{getCurrentPeriodData().avgCalories} kcal</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm min-w-[140px] w-full">
                  <p className="text-gray-600 mb-1">{getCurrentPeriodData().title} 물 섭취</p>
                  <p className="text-2xl font-bold">{getCurrentPeriodData().totalWater} 잔</p>
                  <p className="text-sm text-gray-500">평균 {getCurrentPeriodData().avgWater} 잔/일</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 추천 식단 섹션 */}
        <div className="px-4 md:px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">추천 식단</h2>
            <div className="flex gap-2">
              <button
                onClick={handleGetRecommendation}
                disabled={recommendationLoading}
                className="bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 flex items-center shadow-sm"
                aria-label="식단 추천 받기"
              >
                {recommendationLoading ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-lightbulb mr-2"></i>
                )}
                <span>식단 추천</span>
              </button>
              <button
                onClick={() => setShowMealPlanModal(true)}
                className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 flex items-center shadow-sm"
                aria-label="식단 계획 만들기"
              >
                <i className="fas fa-plus mr-2"></i>
                <span>식단 계획</span>
              </button>
            </div>
          </div>
          
          {/* 식단 캐러셀 */}
          <div className="relative">
            {/* 좌측 스크롤 버튼 */}
            <button
              onClick={() => scrollCarousel('left')}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary transition-colors ${!canScrollLeft && 'opacity-50 cursor-not-allowed'}`}
              style={{ marginLeft: '-20px' }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {/* 우측 스크롤 버튼 */}
            <button
              onClick={() => scrollCarousel('right')}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary transition-colors ${!canScrollRight && 'opacity-50 cursor-not-allowed'}`}
              style={{ marginRight: '-20px' }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
            
            {/* 캐러셀 컨테이너 */}
            <div 
              id="meals-carousel"
              className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitScrollbar: { display: 'none' },
                scrollSnapType: 'x mandatory'
              }}
              onScroll={checkScrollButtons}
            >
              {mealPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex-shrink-0"
                  style={{ 
                    minWidth: '280px', 
                    width: '280px',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <img 
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{plan.title}</h3>
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {plan.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      <i className="fas fa-fire mr-1"></i> {plan.calories} kcal/일
                    </p>
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">식사 구성:</h4>
                      <ul className="text-sm text-gray-600">
                        {plan.meals.slice(0, 2).map((meal, idx) => (
                          <li key={idx} className="mb-1">- {meal.name}: {meal.calories} kcal</li>
                        ))}
                        {plan.meals.length > 2 && (
                          <li className="text-gray-500">+ {plan.meals.length - 2}개 더...</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-600 mb-3">
                      <span>단백질: {plan.nutrients.protein}g</span>
                      <span>탄수화물: {plan.nutrients.carbs}g</span>
                      <span>지방: {plan.nutrients.fat}g</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <button className="text-primary hover:text-primary-dark font-medium text-sm">
                        자세히 보기
                      </button>
                      <button className="text-primary hover:text-primary-dark font-medium text-sm">
                        적용하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 새 식단 추가 카드 */}
              <div 
                onClick={() => setShowMealPlanModal(true)}
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors flex-shrink-0 cursor-pointer flex items-center justify-center"
                style={{ minWidth: '280px', width: '280px', height: '320px' }}
              >
                <div className="text-center text-gray-500">
                  <i className="fas fa-plus text-3xl mb-3"></i>
                  <p className="font-medium">새 식단 계획</p>
                  <p className="text-sm">나만의 식단을 계획하세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 식단 로그 섹션 */}
        <div className="px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
            <h2 className="text-xl font-bold">식단 로그</h2>
            
            <div className="flex items-center">
              {/* 식단 추천 버튼 */}
              <Link
                to="/diet/recommendation"
                className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center shadow-sm mr-3"
              >
                <i className="fas fa-lightbulb mr-2"></i>
                <span>식단 추천</span>
              </Link>
              
              {/* 식사 추가 버튼 */}
              <button
                onClick={() => setShowAddMealModal(true)}
                className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 flex items-center shadow-sm mr-3"
                aria-label="새 식사 기록 추가"
              >
                <i className="fas fa-plus mr-2"></i>
                <span>식사 추가</span>
              </button>
              
              {/* 기간 선택 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLogPeriod('daily')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    logPeriod === 'daily' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  일간
                </button>
                <button
                  onClick={() => setLogPeriod('weekly')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    logPeriod === 'weekly' 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  통계
                </button>
              </div>
            </div>
          </div>

          {/* 식단 로그 목록 */}
          {logPeriod === 'daily' ? (
            <div className="space-y-4">
              {todayMealPlan && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{new Date(todayMealPlan.date).toLocaleDateString('ko-KR')}</h3>
                      <p className="text-sm text-gray-600">
                        총 {todayMealPlan.totalCalories} kcal / 목표 {todayMealPlan.targetCalories} kcal
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">달성률</div>
                      <div className="text-lg font-bold text-primary">
                        {Math.round((todayMealPlan.totalCalories / todayMealPlan.targetCalories) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* 칼로리 진행 바 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>칼로리 섭취</span>
                      <span>{todayMealPlan.totalCalories} / {todayMealPlan.targetCalories} kcal</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((todayMealPlan.totalCalories / todayMealPlan.targetCalories) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 식사 목록 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {todayMealPlan.meals.map((meal, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{meal.name}</h4>
                          <span className="text-sm text-gray-500">{meal.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {meal.foods.join(', ')}
                        </p>
                        <p className="text-sm font-medium text-primary">{meal.calories} kcal</p>
                      </div>
                    ))}
                  </div>

                  {/* 물 섭취량 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <i className="fas fa-tint text-blue-500 mr-2"></i>
                      <span className="text-sm text-gray-600">물 섭취: {todayMealPlan.water} 잔</span>
                    </div>
                    <button
                      onClick={() => handleViewDetail(todayMealPlan)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      자세히 보기
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 통계 뷰 */
            <div className="space-y-6">
              {/* 기간 선택 버튼 */}
              <div className="flex justify-center">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setWeeklyViewPeriod('week')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      weeklyViewPeriod === 'week' 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    주간
                  </button>
                  <button
                    onClick={() => setWeeklyViewPeriod('month')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      weeklyViewPeriod === 'month' 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    월간
                  </button>
                  <button
                    onClick={() => setWeeklyViewPeriod('year')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      weeklyViewPeriod === 'year' 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    연간
                  </button>
                </div>
              </div>

              {/* 기간별 총합 카드 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-4">{getCurrentPeriodData().title} 식단 총합</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{getCurrentPeriodData().totalCalories}</div>
                    <div className="text-sm text-gray-600">총 칼로리</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{getCurrentPeriodData().totalMeals}</div>
                    <div className="text-sm text-gray-600">총 식사 횟수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{getCurrentPeriodData().avgCalories}</div>
                    <div className="text-sm text-gray-600">일평균 칼로리</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{getCurrentPeriodData().totalWater}</div>
                    <div className="text-sm text-gray-600">총 물 섭취 (잔)</div>
                  </div>
                </div>

                {/* 차트 */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">칼로리 섭취 추이</h4>
                  <div className="relative">
                    {/* 차트 컨테이너 */}
                    <div className="flex items-end justify-between h-48 bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      {getCurrentPeriodData().chartData.map((calories, index) => {
                        const maxCalories = Math.max(...getCurrentPeriodData().chartData, 1);
                        const height = (calories / maxCalories) * 100;
                        
                        return (
                          <div key={index} className="flex flex-col items-center min-w-0 flex-1 mx-1">
                            <div className="relative flex-1 flex items-end w-full">
                              <div 
                                className="bg-primary rounded-t-md w-full transition-all duration-500 hover:bg-orange-600 cursor-pointer relative group"
                                style={{ height: `${height}%`, minHeight: calories > 0 ? '8px' : '0px' }}
                                title={`${calories} kcal`}
                              >
                                {/* 툴크 */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {calories} kcal
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                              {getCurrentPeriodData().labels[index]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Y축 라벨 */}
                    <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500 -ml-12">
                      <span>{Math.max(...getCurrentPeriodData().chartData)}</span>
                      <span>{Math.round(Math.max(...getCurrentPeriodData().chartData) / 2)}</span>
                      <span>0</span>
                    </div>
                  </div>
                </div>

                {/* 추가 통계 정보 */}
                <div className="border-t pt-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-2">기록 일수</h5>
                      <p className="text-xl font-bold">{getCurrentPeriodData().daysCount}일</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-2">일평균 식사</h5>
                      <p className="text-xl font-bold">
                        {getCurrentPeriodData().daysCount > 0 
                          ? Math.round(getCurrentPeriodData().totalMeals / getCurrentPeriodData().daysCount * 10) / 10 
                          : 0}회
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-2">일평균 물 섭취</h5>
                      <p className="text-xl font-bold">{getCurrentPeriodData().avgWater}잔</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 식사 추가 모달 */}
        {showAddMealModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">새 식사 추가</h3>
                  <button
                    onClick={() => setShowAddMealModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">식사 종류</label>
                    <select
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">선택하세요</option>
                      <option value="아침">아침</option>
                      <option value="점심">점심</option>
                      <option value="저녁">저녁</option>
                      <option value="간식">간식</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                      <input
                        type="date"
                        value={newMeal.date}
                        onChange={(e) => setNewMeal({ ...newMeal, date: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                      <input
                        type="time"
                        value={newMeal.time}
                        onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* 음식 추가 */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">음식 추가</h4>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="음식 이름 검색..."
                          value={searchQuery || newFood.name}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (searchQuery !== undefined) {
                              handleFoodSearch(value);
                            } else {
                              setNewFood({ ...newFood, name: value });
                            }
                          }}
                          onFocus={() => setSearchQuery('')}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        
                        {/* 검색 결과 드롭다운 */}
                        {searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            {searchResults.map((food, index) => (
                              <div
                                key={index}
                                onClick={() => handleSelectFood(food)}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{food.name || food.title}</div>
                                <div className="text-sm text-gray-600">
                                  {food.calories || 100} kcal • {food.serving_size || '1인분'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="양 (예: 100g)"
                          value={newFood.amount}
                          onChange={(e) => setNewFood({ ...newFood, amount: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="칼로리"
                          value={newFood.calories}
                          onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleAddFood}
                        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        음식 추가
                      </button>
                    </div>
                  </div>

                  {/* 추가된 음식 목록 */}
                  {newMeal.foods.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">추가된 음식</h4>
                      <div className="space-y-2">
                        {newMeal.foods.map((food, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm">{food}</span>
                            <button
                              onClick={() => {
                                const updatedFoods = newMeal.foods.filter((_, i) => i !== index);
                                setNewMeal({ ...newMeal, foods: updatedFoods });
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">총 칼로리: {newMeal.calories} kcal</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddMealModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddMeal}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 상세 보기 모달 */}
        {showDetailModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">
                    {new Date(selectedLog.date).toLocaleDateString('ko-KR')} 식단 상세
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 칼로리 요약 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">칼로리 요약</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{selectedLog.totalCalories}</div>
                        <div className="text-sm text-gray-600">섭취 칼로리</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{selectedLog.targetCalories}</div>
                        <div className="text-sm text-gray-600">목표 칼로리</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round((selectedLog.totalCalories / selectedLog.targetCalories) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">달성률</div>
                      </div>
                    </div>
                  </div>

                  {/* 식사별 상세 */}
                  <div>
                    <h4 className="font-medium mb-3">식사별 상세</h4>
                    <div className="space-y-3">
                      {selectedLog.meals.map((meal, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">{meal.name}</h5>
                            <div className="text-sm text-gray-500">
                              {meal.time} • {meal.calories} kcal
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {meal.foods.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 물 섭취량 */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-tint text-blue-500 mr-2"></i>
                      <span className="font-medium">물 섭취량: {selectedLog.water} 잔</span>
                      <span className="text-sm text-gray-600 ml-2">(목표: 8 잔)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 식단 추천 모달 */}
        {showRecommendationModal && (
          <DietRecommendationModal
            isOpen={showRecommendationModal}
            onClose={handleCloseRecommendationModal}
            recommendations={recommendations}
            loading={recommendationLoading}
            error={recommendationError}
            onSelectFood={(food) => {
              // 추천된 음식을 식단에 추가하는 로직
              console.log('선택된 음식:', food);
              
              // 새 식사 추가 모달 열기
              setNewMeal(prev => ({
                ...prev,
                foods: [...prev.foods, `${food.name} (${food.serving_size})`],
                calories: prev.calories + (food.calories || 0)
              }));
              
              // 추천 모달 닫기
              handleCloseRecommendationModal();
              
              // 식사 추가 모달 열기
              setShowAddMealModal(true);
            }}
          />
        )}

        {/* 식단 계획 모달 */}
        {showMealPlanModal && (
          <MealPlanModal
            isOpen={showMealPlanModal}
            onClose={handleCloseMealPlanModal}
            onSubmit={handleMealPlanSubmit}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default DietLogPage; 