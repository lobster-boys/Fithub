import React, { useState, useEffect } from 'react';
import { useDietRecommendation } from '../../hooks/useDiet';
import { useAuth } from '../../hooks/useAuth';

const DietRecommendationModal = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const {
    recommendations,
    loading,
    error,
    fetchBasicRecommendation,
    clearError
  } = useDietRecommendation();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // 모달이 열릴 때 추천 데이터 가져오기
  useEffect(() => {
    if (isOpen && isAuthenticated && !recommendations && !loading) {
      fetchBasicRecommendation();
    }
  }, [isOpen, isAuthenticated, recommendations, loading, fetchBasicRecommendation]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setCurrentSlide(0);
      setSelectedMeal(null);
      setShowDetail(false);
      clearError();
    }
  }, [isOpen, clearError]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <i className="fas fa-utensils w-6 h-6 mr-2 text-primary"></i>
            맞춤 식단 추천
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <i className="fas fa-times w-6 h-6 text-gray-400"></i>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">맞춤 식단을 생성하고 있습니다...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <i className="fas fa-exclamation-triangle text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">추천 생성 실패</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchBasicRecommendation}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : recommendations?.meals && recommendations.meals.length > 0 ? (
            <>
              {/* 요약 정보 */}
              {recommendations.summary && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <i className="fas fa-target mr-2 text-primary"></i>
                    오늘의 추천 식단 요약
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

              {/* 캐러셀 */}
              <div className="relative">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-semibold">식사별 추천</h3>
                  <div className="ml-auto flex items-center space-x-2">
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

                {/* 캐러셀 슬라이드 */}
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {recommendations.meals.map((meal, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <div 
                          className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openMealDetail(meal)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-semibold flex items-center">
                              <span className="text-2xl mr-3">{getMealIcon(meal.meal_type)}</span>
                              {getMealTypeLabel(meal.meal_type)}
                            </h4>
                            <div className="flex items-center text-gray-600">
                              <i className="fas fa-clock mr-1"></i>
                              <span className="text-sm">{formatCalories(meal.total_calories)} kcal</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {meal.foods.slice(0, 6).map((food, foodIndex) => (
                              <div key={foodIndex} className="bg-gray-50 rounded-lg p-3">
                                <h5 className="font-medium text-sm mb-1">{food.name}</h5>
                                <div className="text-xs text-gray-600">
                                  {formatCalories(food.calories)} kcal
                                </div>
                              </div>
                            ))}
                            {meal.foods.length > 6 && (
                              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
                                <span className="text-sm text-gray-500">
                                  +{meal.foods.length - 6}개 더
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 text-center">
                            <span className="text-sm text-primary font-medium">
                              클릭해서 상세 정보 보기
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 인디케이터 */}
                <div className="flex justify-center mt-4 space-x-2">
                  {recommendations.meals.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={() => {
                    // TODO: 식단 계획에 추가 기능
                    console.log('Add to meal plan:', recommendations);
                  }}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  식단 계획에 추가
                </button>
                <button
                  onClick={fetchBasicRecommendation}
                  disabled={loading}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  새로운 추천 받기
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-utensils text-6xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">추천 식단이 없습니다</h3>
              <p className="text-gray-600 mb-4">
                맞춤 식단 추천을 생성해보세요.
              </p>
              <button
                onClick={fetchBasicRecommendation}
                disabled={loading}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                추천 식단 생성
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {showDetail && selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold flex items-center">
                <span className="text-2xl mr-3">{getMealIcon(selectedMeal.meal_type)}</span>
                {getMealTypeLabel(selectedMeal.meal_type)} 상세 정보
              </h3>
              <button
                onClick={closeMealDetail}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="fas fa-times text-gray-400"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {formatCalories(selectedMeal.total_calories)} kcal
                  </div>
                  <div className="text-sm text-gray-600">총 칼로리</div>
                </div>
              </div>
              
              <h4 className="text-lg font-semibold mb-4">포함된 음식</h4>
              <div className="space-y-3">
                {selectedMeal.foods.map((food, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{food.name}</h5>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {formatCalories(food.calories)} kcal
                        </div>
                        {food.serving_size && (
                          <div className="text-xs text-gray-500">
                            권장량: {food.serving_size}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {food.protein && (
                        <div className="text-center">
                          <div className="font-medium text-blue-600">
                            {food.protein.toFixed(1)}g
                          </div>
                          <div className="text-gray-500">단백질</div>
                        </div>
                      )}
                      {food.carbs && (
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {food.carbs.toFixed(1)}g
                          </div>
                          <div className="text-gray-500">탄수화물</div>
                        </div>
                      )}
                      {food.fat && (
                        <div className="text-center">
                          <div className="font-medium text-yellow-600">
                            {food.fat.toFixed(1)}g
                          </div>
                          <div className="text-gray-500">지방</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietRecommendationModal; 