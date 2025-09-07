import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PageTransition from '../../components/layout/PageTransition';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

// 모듈화된 diet 훅들
import { 
  useDietLogs, 
  useDietStats, 
  useDietRecommendations,
  useMealPlans 
} from '../../hooks/diet';

// 모듈화된 컴포넌트들 - 개별 import
import MealCard from '../../components/diet/cards/MealCard';
import StatsCard from '../../components/diet/cards/StatsCard';

// 모달들을 index.js를 통해 일괄 import
import {
  BaseModal,
  FoodSearchModal,
  MealLogModal,
  MealEditModal
} from '../../components/diet/modals';

const DietLogPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Diet 훅들
  const {
    logs: dietLogs,
    loading: logsLoading,
    error: logsError,
    fetchLogs,
    getTodayLogs,
    createLog,
    createMealLog,
    updateLog,
    deleteLog
  } = useDietLogs();

  const {
    todayStats,
    weeklyStats,
    waterStats,
    loading: statsLoading,
    error: statsError,
    updateWaterIntake
  } = useDietStats();

  const {
    recommendations,
    loading: recommendationLoading,
    error: recommendationError,
    getBasicRecommendation,
    getRecommendationByMealType
  } = useDietRecommendations();

  const {
    mealPlans,
    todayMealPlan,
    loading: mealPlansLoading,
    error: mealPlansError,
    fetchMealPlans,
    createMealPlan
  } = useMealPlans();

  // 사용자 프로필 (목표 칼로리 등)
  const { profile, loading: profileLoading } = useProfile();

  // 로컬 상태
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showMealLog, setShowMealLog] = useState(false);

  const [showMealEdit, setShowMealEdit] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isRecommending, setIsRecommending] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
      fetchMealPlans();
    }
  }, [isAuthenticated, fetchLogs, fetchMealPlans]);

  // 오늘 식사 기록
  const todayMeals = getTodayLogs ? getTodayLogs() : [];
  
  console.log('DietLogPage - todayMeals:', todayMeals);
  
  // 식사 시간대별 그룹화
  const mealsByType = todayMeals.reduce((acc, meal) => {
    const mealType = meal.meal_type || meal.meal_time || 'breakfast';
    if (!acc[mealType]) acc[mealType] = [];
    acc[mealType].push(meal);
    return acc;
  }, {});
  
  console.log('DietLogPage - mealsByType:', mealsByType);

  // 오늘 식사 데이터 기반 영양소 총합 & 음식 리스트 계산 (식사 시간대 포함 중복 제거)
  const aggregatedStats = useMemo(() => {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;
    const foodListWithMeal = [];

    const mealTypeLabel = {
      breakfast: '아침',
      lunch: '점심',
      dinner: '저녁',
      snack: '간식'
    };

    todayMeals.forEach((meal) => {
      // 식사별 칼로리 (meal 자체에 총칼로리가 있을 수 있음)
      if (meal.calories) {
        totalCalories += parseFloat(meal.calories) || 0;
      }

      // 음식 리스트 및 영양 계산
      if (Array.isArray(meal.foods) && meal.foods.length > 0) {
        meal.foods.forEach((food) => {
          const protein = parseFloat(food.protein || food.protein_g || 0);
          const carbs = parseFloat(food.carbs || food.carbohydrates || 0);
          const fat = parseFloat(food.fat || food.fat_g || 0);
          const calories = parseFloat(food.calories || 0);

          totalProtein += protein;
          totalCarbs += carbs;
          totalFat += fat;
          totalCalories += calories; // 음식 단위의 칼로리 합산

          // 음식명 추출 (여러 데이터 구조 대응)
          const foodName = food.name || food.food_name || food.food?.name;
          if (foodName) {
            const label = mealTypeLabel[meal.meal_time || meal.meal_type] || '기타';
            foodListWithMeal.push(`${label}: ${foodName}`);
          }
        });
      } else {
        // foods 배열이 없고 단일 food 필드가 있는 경우
        if (meal.food) {
          const { protein = 0, carbs = 0, fat = 0, calories = 0, name } = meal.food;
          totalProtein += parseFloat(protein);
          totalCarbs += parseFloat(carbs);
          totalFat += parseFloat(fat);
          totalCalories += parseFloat(calories);
          if (name) {
            const label = mealTypeLabel[meal.meal_time || meal.meal_type] || '기타';
            foodListWithMeal.push(`${label}: ${name}`);
          }
        }
      }
    });

    // 중복 제거 (같은 식사 시간대·같은 음식명의 완전 일치한 항목만 제거)
    const dedupedFoods = Array.from(new Set(foodListWithMeal));

    return {
      total_calories: Math.round(totalCalories),
      total_protein: Math.round(totalProtein),
      total_carbs: Math.round(totalCarbs),
      total_fat: Math.round(totalFat),
      meal_count: todayMeals.length,
      foods: dedupedFoods
    };
  }, [todayMeals]);

  // 통합 로딩 상태
  const totalLoading = logsLoading || statsLoading || recommendationLoading || mealPlansLoading || profileLoading;

  // 식사 시간대 라벨
  const getMealTypeLabel = (type) => {
    switch (type) {
      case 'breakfast': return '아침';
      case 'lunch': return '점심';
      case 'dinner': return '저녁';
      case 'snack': return '간식';
      default: return type;
    }
  };

  // 식사 시간대 아이콘
  const getMealIcon = (type) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🍽️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  // 식사 추가 버튼 클릭
  const handleAddMeal = (mealType) => {
    setSelectedMealType(mealType);
    setShowMealLog(true);
  };

  // 추천 받기 버튼 클릭
  const handleGetRecommendation = async (mealType = null) => {
    setIsRecommending(true);
    
    try {
      console.log('AI 추천 요청:', mealType);
      
      let recommendationData;
      if (mealType) {
        // 특정 시간대 추천
        console.log('특정 시간대 추천 요청:', mealType);
        recommendationData = await getRecommendationByMealType(mealType);
      } else {
        // 전체 식단 추천
        console.log('전체 식단 추천 요청');
        recommendationData = await getBasicRecommendation();
      }
      
      console.log('추천 API 응답 데이터:', recommendationData);
      console.log('추천 데이터 키들:', Object.keys(recommendationData || {}));
      console.log('추천 데이터 meals 필드:', recommendationData?.meals);
      
      if (recommendationData && recommendationData.meals && recommendationData.meals.length > 0) {
        // 추천 결과 요약 생성
        const summary = generateRecommendationSummary(recommendationData, mealType);
        
        // 사용자에게 확인 요청
        const confirmMessage = `AI 추천 식단을 생성했습니다!\n\n${summary}\n\n이 추천 식단을 식단 기록에 추가하시겠습니까?`;
        
        if (window.confirm(confirmMessage)) {
          await handleApplyRecommendations(recommendationData, mealType);
          
          // 성공 메시지 표시
          alert(`${mealType ? getMealTypeLabel(mealType) : '전체'} 식단 추천이 완료되었습니다!`);
          
          // 데이터 새로고침
          fetchLogs();
        }
        
      } else {
        console.error('추천 데이터가 비어있음:', recommendationData);
        alert('추천 데이터를 생성할 수 없습니다. 프로필에서 목표 칼로리가 설정되어 있는지 확인하거나, 이전에 추천받은 음식이 너무 많지 않은지 확인해주세요.');
      }
    } catch (error) {
      console.error('AI 추천 오류:', error);
      console.error('오류 스택:', error.stack);
      alert('AI 추천 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setIsRecommending(false);
    }
  };

  // 추천 결과 요약 생성
  const generateRecommendationSummary = (recommendationData, mealType) => {
    const allMeals = recommendationData.meals || [];
    let summary = '';
    let totalCalories = 0;
    
    const targetMeals = mealType 
      ? allMeals.filter(m => m.meal_type === mealType)
      : allMeals;
    
    targetMeals.forEach(meal => {
      const foods = meal.foods;
      if (foods && Array.isArray(foods)) {
        const mealCalories = meal.total_calories || foods.reduce((sum, food) => sum + (food.calories || 0), 0);
        totalCalories += mealCalories;
        
        summary += `🍽️ ${getMealTypeLabel(meal.meal_type)}: ${Math.round(mealCalories)}kcal\n`;
        foods.forEach(food => {
          summary += `   • ${food.name} (${Math.round(food.calories)}kcal)\n`;
        });
        summary += '\n';
      }
    });
    
    summary += `📊 총 칼로리: ${Math.round(totalCalories)}kcal`;
    
    // 영양소 요약 추가 (백엔드에서 제공하는 경우)
    if (recommendationData.nutrition_summary) {
      const { calories_achievement } = recommendationData.nutrition_summary;
      if (calories_achievement) {
        summary += `\n🎯 목표 대비: ${Math.round(calories_achievement || 0)}%`;
      }
    }
    
    return summary;
  };

  // 추천 데이터를 식단 기록으로 변환 및 저장
  const handleApplyRecommendations = async (recommendationData, mealType = null) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const mealsToApply = recommendationData.meals || [];
      
      const processMeal = async (meal) => {
        if (meal && Array.isArray(meal.foods) && meal.foods.length > 0) {
          await saveMealRecommendation(meal.foods, meal.meal_type, today);
        }
      };

      if (mealType) {
        // 특정 시간대만 처리
        const meal = mealsToApply.find(m => m.meal_type === mealType);
        await processMeal(meal);
      } else {
        // 전체 시간대 처리
        for (const meal of mealsToApply) {
          await processMeal(meal);
        }
      }
    } catch (error) {
      console.error('추천 데이터 저장 오류:', error);
      throw error;
    }
  };

  // 개별 식사 추천을 저장
  const saveMealRecommendation = async (foods, mealType, date) => {
    try {
      // 백엔드 추천 형식을 프론트엔드 저장 형식으로 변환
      const mealLogData = {
        meal_name: `AI 추천 ${getMealTypeLabel(mealType)}`,
        meal_time: mealType,
        date: date,
        foods: foods.map(food => ({
          id: food.id,
          quantity: (food.servings || 1) * 100  // servings를 g 단위로 변환
        })),
        notes: `AI가 추천한 ${getMealTypeLabel(mealType)} 식단 (총 ${Math.round(foods.reduce((sum, f) => sum + f.calories, 0))}kcal)`
      };

      console.log('저장할 식사 데이터:', mealLogData);
      
      await createMealLog(mealLogData);
      console.log(`${mealType} 추천 식단 저장 완료`);
    } catch (error) {
      console.error(`${mealType} 추천 저장 실패:`, error);
      throw error;
    }
  };

  // 식사 편집
  const handleEditMeal = (meal) => {
    setSelectedMeal(meal);
    setShowMealEdit(true);
  };

  // 물 섭취량 업데이트
  const handleWaterUpdate = (amount) => {
    updateWaterIntake(amount);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 페이지 헤더 */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-4 md:px-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">식단 관리</h1>
              <button
                onClick={() => handleGetRecommendation()}
                disabled={isRecommending}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isRecommending 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-primary text-white hover:bg-orange-600'
                }`}
              >
                {isRecommending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    AI 추천 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    AI 추천
                  </>
                )}
              </button>
            </div>
            
            {/* 탭 네비게이션 */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('today')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'today'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                오늘
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                기록
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                통계
              </button>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {totalLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="px-4 md:px-6 py-6">
          {activeTab === 'today' && (
            <div className="space-y-6">
              {/* 오늘의 통계 카드 */}
              <StatsCard 
                stats={{
                  ...aggregatedStats,
                  water_intake: waterStats?.current || 0,
                }}
                targetCalories={profile?.target_calories || 2000}
                onWaterUpdate={handleWaterUpdate}
                loading={statsLoading || profileLoading}
              />

              {/* 통합 식사 기록 섹션 */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="text-xl mr-2">🍽️</span>
                    오늘의 식사 기록
                    <span className="ml-2 text-sm text-gray-500">
                      ({todayMeals.length}개)
                    </span>
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGetRecommendation()}
                      disabled={isRecommending}
                      className={`text-sm ${
                        isRecommending 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-primary hover:text-orange-600'
                      }`}
                    >
                      {isRecommending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                          추천 중...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic mr-1"></i>
                          AI 추천
                        </>
                      )}
                    </button>
                    <div className="relative group">
                      <button className="text-primary hover:text-orange-600 text-sm flex items-center">
                        <i className="fas fa-plus mr-1"></i>
                        식사 추가
                        <i className="fas fa-chevron-down ml-1 text-xs"></i>
                      </button>
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-1">
                          {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                            <button
                              key={mealType}
                              onClick={() => handleAddMeal(mealType)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <span className="mr-2">{getMealIcon(mealType)}</span>
                              {getMealTypeLabel(mealType)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {todayMeals.length > 0 ? (
                    <div className="space-y-4">
                      {/* 식사 시간대별로 그룹화하여 표시 */}
                      {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                        const mealsForType = mealsByType[mealType];
                        if (!mealsForType || mealsForType.length === 0) return null;
                        
                        return (
                          <div key={mealType} className="border-l-4 border-primary pl-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-800 flex items-center">
                                <span className="mr-2">{getMealIcon(mealType)}</span>
                                {getMealTypeLabel(mealType)}
                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {mealsForType.length}개
                                </span>
                              </h4>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleGetRecommendation(mealType)}
                                  disabled={isRecommending}
                                  className={`text-xs ${
                                    isRecommending 
                                      ? 'text-gray-400 cursor-not-allowed' 
                                      : 'text-primary hover:text-orange-600'
                                  }`}
                                >
                                  {isRecommending ? (
                                    <>
                                      <i className="fas fa-spinner fa-spin mr-1"></i>
                                      추천 중
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-magic mr-1"></i>
                                      추천
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleAddMeal(mealType)}
                                  className="text-xs text-primary hover:text-orange-600"
                                >
                                  <i className="fas fa-plus mr-1"></i>
                                  추가
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {mealsForType.map((meal, index) => (
                                <MealCard
                                  key={meal.id || index}
                                  meal={meal}
                                  onEdit={() => handleEditMeal(meal)}
                                  onDelete={() => deleteLog(meal.id)}
                                  showActions={true}
                                  compact={true}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <i className="fas fa-utensils text-4xl mb-4 block text-gray-300"></i>
                      <p className="text-lg mb-2">아직 오늘 기록된 식사가 없습니다</p>
                      <p className="text-sm text-gray-400 mb-4">첫 식사를 기록해보세요!</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                          <button
                            key={mealType}
                            onClick={() => handleAddMeal(mealType)}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center"
                          >
                            <span className="mr-2">{getMealIcon(mealType)}</span>
                            {getMealTypeLabel(mealType)} 추가
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 빠른 액션 버튼들 */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowFoodSearch(true)}
                  className="bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-search mr-2"></i>
                  음식 검색
                </button>
                <button
                  onClick={() => handleGetRecommendation()}
                  disabled={isRecommending}
                  className={`py-3 px-4 rounded-xl transition-colors ${
                    isRecommending 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isRecommending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      추천 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lightbulb mr-2"></i>
                      맞춤 추천
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* 날짜 선택기 */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜 선택
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* 선택된 날짜의 기록 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDate} 식사 기록
                </h3>
                
                {dietLogs.filter(log => {
                  const logDate = log.date || log.created_at?.split('T')[0];
                  return logDate === selectedDate;
                }).length > 0 ? (
                  <div className="space-y-4">
                    {dietLogs
                      .filter(log => {
                        const logDate = log.date || log.created_at?.split('T')[0];
                        return logDate === selectedDate;
                      })
                      .map((meal, index) => (
                        <MealCard
                          key={meal.id || index}
                          meal={meal}
                          onEdit={() => handleEditMeal(meal)}
                          onDelete={() => deleteLog(meal.id)}
                          showActions={true}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <i className="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">선택한 날짜에 기록된 식사가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* 주간 통계 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  이번 주 통계
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(weeklyStats?.avgCalories || 0)}
                    </div>
                    <div className="text-sm text-gray-600">평균 칼로리</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(weeklyStats?.avgProtein || 0)}g
                    </div>
                    <div className="text-sm text-gray-600">평균 단백질</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(weeklyStats?.avgCarbs || 0)}g
                    </div>
                    <div className="text-sm text-gray-600">평균 탄수화물</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round(weeklyStats?.avgFat || 0)}g
                    </div>
                    <div className="text-sm text-gray-600">평균 지방</div>
                  </div>
                </div>
              </div>

              {/* 추가 통계 차트나 분석 내용 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  식사 패턴 분석
                </h3>
                <p className="text-gray-600">
                  자세한 통계 분석 기능은 추후 업데이트 예정입니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 모달들 */}
        <FoodSearchModal
          isOpen={showFoodSearch}
          onClose={() => setShowFoodSearch(false)}
        />

        <MealLogModal
          isOpen={showMealLog}
          onClose={() => setShowMealLog(false)}
          mealType={selectedMealType}
          onSave={(mealData) => {
            createMealLog(mealData);
            setShowMealLog(false);
          }}
        />

        {selectedMeal && (
          <MealEditModal
            isOpen={showMealEdit}
            onClose={() => {
              setShowMealEdit(false);
              setSelectedMeal(null);
            }}
            meal={selectedMeal}
            onSave={(updatedMeal) => {
              updateLog(selectedMeal.id, updatedMeal);
              setShowMealEdit(false);
              setSelectedMeal(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default DietLogPage;