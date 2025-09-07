import React, { useState, useEffect } from 'react';
import { useDietRecommendations } from '../../../hooks/diet/useDietRecommendations';
import { useDietLogs } from '../../../hooks/diet/useDietLogs';
import BaseModal from './BaseModal';

/**
 * 식단 추천 모달 컴포넌트
 */
const RecommendationModal = ({ isOpen, onClose, mealType = null }) => {
  const {
    recommendations,
    loading,
    error,
    getBasicRecommendation,
    getRecommendationByMealType,
    clearError
  } = useDietRecommendations();

  const { createLog: createDietLog } = useDietLogs();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [applyingRecommendation, setApplyingRecommendation] = useState(false);
  const [hasRequestedData, setHasRequestedData] = useState(false);
  const [currentMealType, setCurrentMealType] = useState(null);

  // 모달이 열릴 때 추천 데이터 가져오기
  useEffect(() => {
    if (isOpen && (!hasRequestedData || currentMealType !== mealType) && !loading) {
      setHasRequestedData(true);
      setCurrentMealType(mealType);
      if (mealType) {
        getRecommendationByMealType(mealType);
      } else {
        getBasicRecommendation();
      }
    }
  }, [isOpen, mealType]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setCurrentSlide(0);
      setSelectedMeal(null);
      setShowDetail(false);
      setApplyingRecommendation(false);
      setHasRequestedData(false);
      setCurrentMealType(null);
      clearError();
    }
  }, [isOpen, clearError]);

  // 캐러셀 네비게이션
  const nextSlide = () => {
    if (recommendations?.meals && currentSlide < recommendations.meals.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // 식사 타입 라벨 변환
  const getMealTypeLabel = (type) => {
    switch (type) {
      case 'breakfast': return '아침';
      case 'lunch': return '점심';
      case 'dinner': return '저녁';
      case 'snack': return '간식';
      default: return type;
    }
  };

  // 식사 타입별 아이콘
  const getMealIcon = (type) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🍽️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  // 칼로리 포맷팅
  const formatCalories = (calories) => {
    return Math.round(calories).toLocaleString();
  };

  // 상세 보기 모달 열기
  const openMealDetail = (meal) => {
    setSelectedMeal(meal);
    setShowDetail(true);
  };

  // 상세 보기 모달 닫기
  const closeMealDetail = () => {
    setSelectedMeal(null);
    setShowDetail(false);
  };

  // 추천 식단을 식사 기록으로 추가
  const applyMealRecommendation = async (meal) => {
    setApplyingRecommendation(true);
    try {
      const logData = {
        meal_name: `추천 ${getMealTypeLabel(meal.meal_type)} - ${meal.name || '식단'}`,
        date: new Date().toISOString().split('T')[0],
        meal_time: meal.meal_type || 'breakfast',
        foods: meal.foods.map(food => ({
          ...food,
          quantity: food.quantity || 1,
          calories_per_serving: food.calories
        })),
        total_calories: meal.total_calories || meal.foods.reduce((sum, food) => sum + food.calories * (food.quantity || 1), 0)
      };

      await createDietLog(logData);
      
      // 성공 시 모달 닫기
      onClose();
    } catch (err) {
      console.error('추천 식단 적용 실패:', err);
    } finally {
      setApplyingRecommendation(false);
    }
  };

  // 전체 추천 식단 적용
  const applyAllRecommendations = async () => {
    if (!recommendations?.meals || recommendations.meals.length === 0) return;

    setApplyingRecommendation(true);
    try {
      const promises = recommendations.meals.map(meal => 
        applyMealRecommendation(meal)
      );
      
      await Promise.all(promises);
      onClose();
    } catch (err) {
      console.error('전체 추천 식단 적용 실패:', err);
    } finally {
      setApplyingRecommendation(false);
    }
  };

  // 새로운 추천 요청
  const handleRefreshRecommendation = () => {
    setHasRequestedData(false);
    if (mealType) {
      getRecommendationByMealType(mealType);
    } else {
      getBasicRecommendation();
    }
  };

  const renderMealCard = (meal, index) => (
    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold flex items-center">
          <span className="text-2xl mr-2">{getMealIcon(meal.meal_type)}</span>
          {getMealTypeLabel(meal.meal_type)}
          {meal.name && <span className="ml-2 text-gray-600">- {meal.name}</span>}
        </h4>
        <span className="text-lg font-bold text-primary">
          {formatCalories(meal.total_calories || meal.foods.reduce((sum, food) => sum + food.calories * (food.quantity || 1), 0))}kcal
        </span>
      </div>

      {/* 음식 목록 */}
      <div className="space-y-2 mb-4">
        {meal.foods.map((food, foodIndex) => (
          <div key={foodIndex} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {food.name} {food.quantity && food.quantity !== 1 ? `x${food.quantity}` : ''}
            </span>
            <span className="font-medium text-gray-900">
              {formatCalories(food.calories * (food.quantity || 1))}kcal
            </span>
          </div>
        ))}
      </div>

      {/* 영양소 정보 */}
      {meal.nutrients && (
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="text-sm text-gray-600">단백질</div>
            <div className="font-medium text-blue-600">{Math.round(meal.nutrients.protein)}g</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">탄수화물</div>
            <div className="font-medium text-green-600">{Math.round(meal.nutrients.carbs)}g</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">지방</div>
            <div className="font-medium text-yellow-600">{Math.round(meal.nutrients.fat)}g</div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex space-x-2">
        <button
          onClick={() => openMealDetail(meal)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          자세히 보기
        </button>
        <button
          onClick={() => applyMealRecommendation(meal)}
          disabled={applyingRecommendation}
          className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50"
        >
          {applyingRecommendation ? '적용 중...' : '기록에 추가'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">
            {mealType ? `${getMealTypeLabel(mealType)} 추천을 생성하고 있습니다...` : '맞춤 식단을 생성하고 있습니다...'}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">추천 생성 실패</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefreshRecommendation}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (!recommendations?.meals || recommendations.meals.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-utensils text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">추천 결과 없음</h3>
          <p className="text-gray-600 mb-4">추천할 식단이 없습니다.</p>
          <button
            onClick={handleRefreshRecommendation}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            새로 추천받기
          </button>
        </div>
      );
    }

    return (
      <>
        {/* 요약 정보 */}
        {recommendations.summary && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-target mr-2 text-primary"></i>
              {mealType ? `${getMealTypeLabel(mealType)} 추천 요약` : '오늘의 추천 식단 요약'}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCalories(recommendations.summary.total_calories)}
                </div>
                <div className="text-sm text-gray-600">총 칼로리</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {recommendations.summary.meal_count}
                </div>
                <div className="text-sm text-gray-600">식사 횟수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {recommendations.summary.food_count}
                </div>
                <div className="text-sm text-gray-600">총 음식 개수</div>
              </div>
            </div>
          </div>
        )}

        {/* 식사 추천 목록 */}
        <div className="space-y-4">
          {recommendations.meals.length === 1 ? (
            // 단일 식사 추천 (특정 meal_type)
            renderMealCard(recommendations.meals[0], 0)
          ) : (
            // 다중 식사 추천 (캐러셀)
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">식사별 추천</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {currentSlide + 1} / {recommendations.meals.length}
                  </span>
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === recommendations.meals.length - 1}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              {/* 슬라이드 */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {recommendations.meals.map((meal, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      {renderMealCard(meal, index)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="flex items-center">
            <i className="fas fa-utensils w-6 h-6 mr-2 text-primary"></i>
            {mealType ? `${getMealTypeLabel(mealType)} 추천` : '맞춤 식단 추천'}
          </span>
        }
        size="large"
      >
        <div className="p-6">
          {renderContent()}
        </div>

        {/* 하단 액션 버튼 */}
        {recommendations?.meals && recommendations.meals.length > 1 && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleRefreshRecommendation}
                className="text-gray-600 hover:text-gray-800 flex items-center"
                disabled={loading}
              >
                <i className="fas fa-refresh mr-2"></i>
                새로 추천받기
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={applyingRecommendation}
                >
                  닫기
                </button>
                <button
                  onClick={applyAllRecommendations}
                  disabled={applyingRecommendation}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {applyingRecommendation ? '적용 중...' : '전체 적용'}
                </button>
              </div>
            </div>
          </div>
        )}
      </BaseModal>

      {/* 상세 보기 모달 */}
      {showDetail && selectedMeal && (
        <BaseModal
          isOpen={showDetail}
          onClose={closeMealDetail}
          title={`${getMealTypeLabel(selectedMeal.meal_type)} 상세 정보`}
          size="default"
        >
          <div className="p-6">
            {/* 상세 음식 정보 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-3">포함된 음식</h4>
              {selectedMeal.foods.map((food, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-900">{food.name}</h5>
                      <p className="text-sm text-gray-600">{food.category || '일반'}</p>
                      {food.description && (
                        <p className="text-sm text-gray-500 mt-1">{food.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {formatCalories(food.calories * (food.quantity || 1))}kcal
                      </div>
                      {food.quantity && food.quantity !== 1 && (
                        <div className="text-sm text-gray-500">
                          {food.quantity}인분
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 영양소 정보 */}
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">단백질: </span>
                      <span className="font-medium">{Math.round(food.protein * (food.quantity || 1))}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600">탄수화물: </span>
                      <span className="font-medium">{Math.round(food.carbs * (food.quantity || 1))}g</span>
                    </div>
                    <div>
                      <span className="text-gray-600">지방: </span>
                      <span className="font-medium">{Math.round(food.fat * (food.quantity || 1))}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeMealDetail}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  applyMealRecommendation(selectedMeal);
                  closeMealDetail();
                }}
                disabled={applyingRecommendation}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                기록에 추가
              </button>
            </div>
          </div>
        </BaseModal>
      )}
    </>
  );
};

export default RecommendationModal; 