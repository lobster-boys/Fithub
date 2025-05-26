import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../../components/layout/PageTransition';
import { useDiet, useDietStats } from '../../hooks/useDiet';

const DietLogPage = () => {
  const navigate = useNavigate();
  
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

  // 식단 로그 상태 관리
  const [dietLogs, setDietLogs] = useState([
    {
      id: 1,
      date: '2024-01-15',
      meals: [
        { name: '아침', foods: ['그릭 요거트', '블루베리', '그래놀라'], calories: 320, time: '08:00' },
        { name: '간식', foods: ['사과', '아몬드 버터'], calories: 200, time: '10:30' },
        { name: '점심', foods: ['그릴드 치킨', '퀴노아', '브로콜리'], calories: 450, time: '12:30' }
      ],
      totalCalories: 970,
      targetCalories: 1800,
      water: 6 // 물 섭취량 (잔)
    },
    {
      id: 2,
      date: '2024-01-14',
      meals: [
        { name: '아침', foods: ['오트밀', '바나나', '견과류'], calories: 350, time: '07:30' },
        { name: '점심', foods: ['연어', '현미밥', '시금치'], calories: 520, time: '12:00' },
        { name: '저녁', foods: ['두부', '야채볶음', '미소국'], calories: 380, time: '19:00' }
      ],
      totalCalories: 1250,
      targetCalories: 1800,
      water: 8
    }
  ]);

  // 추천 식단 데이터
  const [mealPlans, setMealPlans] = useState([
    {
      id: 1,
      title: '고단백 다이어트 식단',
      type: '체중 감량',
      calories: 1500,
      meals: [
        { name: '아침', foods: ['계란 흰자', '오트밀', '베리'], calories: 300 },
        { name: '점심', foods: ['닭가슴살', '현미', '브로콜리'], calories: 450 },
        { name: '저녁', foods: ['연어', '아스파라거스', '고구마'], calories: 400 },
        { name: '간식', foods: ['그릭 요거트', '견과류'], calories: 250 }
      ],
      nutrients: { protein: 120, carbs: 150, fat: 45 },
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 2,
      title: '근육 증가 식단',
      type: '근육 증가',
      calories: 2200,
      meals: [
        { name: '아침', foods: ['오트밀', '바나나', '프로틴'], calories: 450 },
        { name: '점심', foods: ['소고기', '현미', '야채'], calories: 650 },
        { name: '저녁', foods: ['닭가슴살', '고구마', '아보카도'], calories: 550 },
        { name: '간식', foods: ['견과류', '우유', '과일'], calories: 350 }
      ],
      nutrients: { protein: 150, carbs: 220, fat: 70 },
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 3,
      title: '균형 잡힌 건강 식단',
      type: '건강 유지',
      calories: 1800,
      meals: [
        { name: '아침', foods: ['통곡물 빵', '아보카도', '계란'], calories: 380 },
        { name: '점심', foods: ['퀴노아', '연어', '샐러드'], calories: 480 },
        { name: '저녁', foods: ['두부', '현미', '야채'], calories: 420 },
        { name: '간식', foods: ['과일', '요거트'], calories: 200 }
      ],
      nutrients: { protein: 90, carbs: 180, fat: 60 },
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    }
  ]);

  // 모달 상태 관리
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

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

  // 통계 계산
  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = dietLogs.find(log => log.date === today) || dietLogs[0];
    
    return {
      totalCalories: todayLog?.totalCalories || 0,
      targetCalories: todayLog?.targetCalories || 1800,
      mealsCount: todayLog?.meals?.length || 0,
      waterIntake: todayLog?.water || 0
    };
  };

  const getWeeklyStats = () => {
    // 이번 주 데이터만 필터링
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ...
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // 월요일로 설정
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // 일요일로 설정

    const thisWeekLogs = dietLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    const totalCalories = thisWeekLogs.reduce((sum, log) => sum + log.totalCalories, 0);
    const totalMeals = thisWeekLogs.reduce((sum, log) => sum + log.meals.length, 0);
    const totalWater = thisWeekLogs.reduce((sum, log) => sum + log.water, 0);
    const avgCalories = thisWeekLogs.length > 0 ? Math.round(totalCalories / thisWeekLogs.length) : 0;
    
    return {
      totalCalories,
      avgCalories,
      totalMeals,
      totalWater,
      avgWater: thisWeekLogs.length > 0 ? Math.round(totalWater / thisWeekLogs.length) : 0,
      daysCount: thisWeekLogs.length
    };
  };

  // 주간 데이터 계산 (차트용)
  const getWeeklyData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ...
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // 월요일로 설정
    
    const weeklyData = Array(7).fill(0);
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    
    dietLogs.forEach(log => {
      const logDate = new Date(log.date);
      const diffTime = logDate.getTime() - weekStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        weeklyData[diffDays] += log.totalCalories;
      }
    });
    
    return { weeklyData, dayLabels };
  };

  // 월간 데이터 계산
  const getMonthlyData = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthlyData = Array(daysInMonth).fill(0);
    const dayLabels = Array.from({length: daysInMonth}, (_, i) => `${i + 1}일`);
    
    let totalCalories = 0;
    let totalMeals = 0;
    let totalWater = 0;
    let daysCount = 0;
    
    dietLogs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear) {
        const day = logDate.getDate() - 1;
        monthlyData[day] += log.totalCalories;
        totalCalories += log.totalCalories;
        totalMeals += log.meals.length;
        totalWater += log.water;
        daysCount++;
      }
    });
    
    return { 
      monthlyData, 
      dayLabels, 
      totalCalories, 
      totalMeals, 
      totalWater,
      avgCalories: daysCount > 0 ? Math.round(totalCalories / daysCount) : 0,
      avgWater: daysCount > 0 ? Math.round(totalWater / daysCount) : 0,
      daysCount 
    };
  };

  // 연간 데이터 계산
  const getYearlyData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const yearlyData = Array(12).fill(0);
    const monthLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    
    let totalCalories = 0;
    let totalMeals = 0;
    let totalWater = 0;
    let daysCount = 0;
    
    dietLogs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate.getFullYear() === currentYear) {
        const month = logDate.getMonth();
        yearlyData[month] += log.totalCalories;
        totalCalories += log.totalCalories;
        totalMeals += log.meals.length;
        totalWater += log.water;
        daysCount++;
      }
    });
    
    return { 
      yearlyData, 
      monthLabels, 
      totalCalories, 
      totalMeals, 
      totalWater,
      avgCalories: daysCount > 0 ? Math.round(totalCalories / daysCount) : 0,
      avgWater: daysCount > 0 ? Math.round(totalWater / daysCount) : 0,
      daysCount 
    };
  };

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();
  const weeklyChartData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const yearlyData = getYearlyData();

  // 현재 선택된 기간에 따른 데이터
  const getCurrentPeriodData = () => {
    switch(weeklyViewPeriod) {
      case 'week':
        return {
          ...weeklyStats,
          chartData: weeklyChartData.weeklyData,
          labels: weeklyChartData.dayLabels,
          title: '이번 주'
        };
      case 'month':
        return {
          ...monthlyData,
          chartData: monthlyData.monthlyData,
          labels: monthlyData.dayLabels,
          title: '이번 달'
        };
      case 'year':
        return {
          ...yearlyData,
          chartData: yearlyData.yearlyData,
          labels: yearlyData.monthLabels,
          title: '올해'
        };
      default:
        return {
          ...weeklyStats,
          chartData: weeklyChartData.weeklyData,
          labels: weeklyChartData.dayLabels,
          title: '이번 주'
        };
    }
  };

  // 식사 추가 핸들러
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

  const handleAddMeal = () => {
    if (newMeal.name && newMeal.foods.length > 0) {
      // 기존 로그에서 해당 날짜 찾기
      const existingLogIndex = dietLogs.findIndex(log => log.date === newMeal.date);
      
      const newMealData = {
        name: newMeal.name,
        foods: newMeal.foods,
        calories: newMeal.calories,
        time: newMeal.time
      };

      if (existingLogIndex >= 0) {
        // 기존 날짜에 식사 추가
        const updatedLogs = [...dietLogs];
        updatedLogs[existingLogIndex] = {
          ...updatedLogs[existingLogIndex],
          meals: [...updatedLogs[existingLogIndex].meals, newMealData],
          totalCalories: updatedLogs[existingLogIndex].totalCalories + newMeal.calories
        };
        setDietLogs(updatedLogs);
      } else {
        // 새로운 날짜로 로그 생성
        const newLog = {
          id: Date.now(),
          date: newMeal.date,
          meals: [newMealData],
          totalCalories: newMeal.calories,
          targetCalories: 1800,
          water: 0
        };
        setDietLogs([newLog, ...dietLogs]);
      }

      setShowAddMealModal(false);
      setNewMeal({
        name: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        foods: [],
        calories: 0
      });
    }
  };

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

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
                  <p className="text-2xl font-bold">{todayStats.waterIntake} 잔</p>
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
            <button
              onClick={() => setShowMealPlanModal(true)}
              className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 flex items-center shadow-sm"
              aria-label="식단 계획 만들기"
            >
              <i className="fas fa-plus mr-2"></i>
              <span>식단 계획</span>
            </button>
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
              {dietLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{new Date(log.date).toLocaleDateString('ko-KR')}</h3>
                      <p className="text-sm text-gray-600">
                        총 {log.totalCalories} kcal / 목표 {log.targetCalories} kcal
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">달성률</div>
                      <div className="text-lg font-bold text-primary">
                        {Math.round((log.totalCalories / log.targetCalories) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* 칼로리 진행 바 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>칼로리 섭취</span>
                      <span>{log.totalCalories} / {log.targetCalories} kcal</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((log.totalCalories / log.targetCalories) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 식사 목록 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    {log.meals.map((meal, index) => (
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
                      <span className="text-sm text-gray-600">물 섭취: {log.water} 잔</span>
                    </div>
                    <button
                      onClick={() => handleViewDetail(log)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      자세히 보기
                    </button>
                  </div>
                </div>
              ))}
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
                                {/* 툴팁 */}
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
                      <div>
                        <input
                          type="text"
                          placeholder="음식 이름"
                          value={newFood.name}
                          onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
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
      </div>
    </PageTransition>
  );
};

export default DietLogPage; 