import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { dietService } from '../../services/dietService';

const MealPlanModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  // 기본 폼 데이터 (기존 유지)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    target_goal: initialData?.target_goal || 'weight_loss',
    target_calories_min: initialData?.target_calories_min || 1200,
    target_calories_max: initialData?.target_calories_max || 2000,
    is_public: initialData?.is_public ?? false,
    foods: initialData?.foods || [] // 선택된 음식들
  });

  const [errors, setErrors] = useState({});
  
  // 모달 단계 관리
  const [currentStep, setCurrentStep] = useState(1); // 1: 기본정보, 2: 음식선택
  
  // 음식 선택 관련 상태
  const [selectedCategories, setSelectedCategories] = useState([]); // 멀티 선택으로 변경
  const [selectedMealType, setSelectedMealType] = useState('');
  const [foods, setFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCalories, setTotalCalories] = useState(0);

  const targetGoalOptions = [
    { value: 'weight_loss', label: '체중 감량' },
    { value: 'muscle_gain', label: '근육 증가' },
    { value: 'maintenance', label: '체중 유지' },
    { value: 'health', label: '건강 관리' }
  ];

  // 음식 카테고리 (백엔드 시드 데이터 기반)
  const foodCategories = [
    { value: '탄수화물', label: '탄수화물', icon: '🍞' },
    { value: '단백질', label: '단백질', icon: '🥩' },
    { value: '지방', label: '지방', icon: '🥑' },
    { value: '채소', label: '채소', icon: '🥬' },
    { value: '과일', label: '과일', icon: '🍎' },
    { value: '유제품', label: '유제품', icon: '🥛' },
    { value: '음료', label: '음료', icon: '🥤' },
    { value: '건강보조식품', label: '건강보조식품', icon: '💊' }
  ];

  // 식사 타입
  const mealTypes = [
    { value: 'breakfast', label: '아침', icon: '🌅' },
    { value: 'lunch', label: '점심', icon: '☀️' },
    { value: 'dinner', label: '저녁', icon: '🌙' },
    { value: 'snack', label: '간식', icon: '🍪' }
  ];

  // 선택된 카테고리들의 음식 로드
  const loadFoodsByCategories = async (categoryNames) => {
    setLoading(true);
    try {
      // 여러 카테고리의 음식을 병렬로 로드
      const promises = categoryNames.map(async (categoryName) => {
        console.log(`Loading foods for category: ${categoryName}`);
        
        try {
          // 기본 getFoods 함수 사용 (카테고리 필터 포함)
          const response = await dietService.getFoods({ 
            category: categoryName,
            page_size: 20 
          });
          
          console.log(`Response for ${categoryName}:`, response);
          
          return (response.results || response || []).map(food => ({
            id: food.id,
            name: food.name,
            description: food.description,
            calories: parseFloat(food.calories),
            protein: parseFloat(food.protein || 0),
            carbs: parseFloat(food.carbs || 0),
            fat: parseFloat(food.fat || 0),
            serving_size: food.serving_size,
            category: food.category?.name || food.category_name || categoryName,
            image: `https://picsum.photos/300/200?random=${food.id}`, // 임시 이미지
            difficulty: food.calories > 300 ? '고급' : food.calories > 150 ? '중급' : '초급'
          }));
        } catch (error) {
          console.error(`카테고리 ${categoryName} 로드 실패:`, error);
          return getFallbackFoods(categoryName);
        }
      });
      
      const results = await Promise.all(promises);
      const allFoods = results.flat();
      
      console.log('All loaded foods:', allFoods);
      setFoods(allFoods);
    } catch (error) {
      console.error('음식 로드 실패:', error);
      // 모든 선택된 카테고리의 폴백 데이터 제공
      const fallbackFoods = categoryNames.flatMap(cat => getFallbackFoods(cat));
      setFoods(fallbackFoods);
    } finally {
      setLoading(false);
    }
  };

  // 폴백 데이터 (백엔드 연결 실패 시)
  const getFallbackFoods = (categoryName) => {
    const fallbackData = {
      '탄수화물': [
        { id: 'fb1', name: '백미밥', calories: 130, protein: 2.5, carbs: 28, fat: 0.3, serving_size: '210g', difficulty: '초급' },
        { id: 'fb2', name: '현미밥', calories: 180, protein: 4, carbs: 35, fat: 1.5, serving_size: '210g', difficulty: '중급' },
        { id: 'fb3', name: '고구마', calories: 300, protein: 3, carbs: 70, fat: 0.5, serving_size: '1kg', difficulty: '고급' }
      ],
      '단백질': [
        { id: 'fb4', name: '닭가슴살', calories: 800, protein: 50, carbs: 0, fat: 5, serving_size: '500g', difficulty: '고급' },
        { id: 'fb5', name: '계란', calories: 400, protein: 30, carbs: 2, fat: 20, serving_size: '10개', difficulty: '중급' },
        { id: 'fb6', name: '두부', calories: 200, protein: 15, carbs: 5, fat: 8, serving_size: '300g', difficulty: '초급' }
      ],
      '채소': [
        { id: 'fb7', name: '브로콜리', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, serving_size: '1송이', difficulty: '초급' },
        { id: 'fb8', name: '시금치', calories: 46, protein: 4, carbs: 7, fat: 0.5, serving_size: '200g', difficulty: '초급' }
      ]
    };
    
    return (fallbackData[categoryName] || []).map(food => ({
      ...food,
      category: categoryName,
      image: `https://picsum.photos/300/200?random=${food.id}`,
      description: `신선한 ${food.name}`
    }));
  };

  // 음식 선택/해제
  const handleFoodToggle = (food) => {
    const isSelected = selectedFoods.some(f => f.id === food.id);
    let newSelectedFoods;
    
    if (isSelected) {
      newSelectedFoods = selectedFoods.filter(f => f.id !== food.id);
    } else {
      // 칼로리 제한 체크
      const newTotalCalories = totalCalories + food.calories;
      if (newTotalCalories > formData.target_calories_max) {
        alert(`최대 칼로리(${formData.target_calories_max}kcal)를 초과합니다.`);
        return;
      }
      
      newSelectedFoods = [...selectedFoods, {
        ...food,
        meal_time: selectedMealType,
        quantity: 1 // 기본 수량
      }];
    }
    
    setSelectedFoods(newSelectedFoods);
    setTotalCalories(newSelectedFoods.reduce((sum, f) => sum + (f.calories * f.quantity), 0));
  };

  // 수량 변경
  const handleQuantityChange = (foodId, newQuantity) => {
    const newSelectedFoods = selectedFoods.map(food => 
      food.id === foodId ? { ...food, quantity: Math.max(0.1, newQuantity) } : food
    );
    setSelectedFoods(newSelectedFoods);
    setTotalCalories(newSelectedFoods.reduce((sum, f) => sum + (f.calories * f.quantity), 0));
  };

  // 선택된 음식 제거
  const removeSelectedFood = (foodId) => {
    const newSelectedFoods = selectedFoods.filter(f => f.id !== foodId);
    setSelectedFoods(newSelectedFoods);
    setTotalCalories(newSelectedFoods.reduce((sum, f) => sum + (f.calories * f.quantity), 0));
  };

  // 카테고리 선택 처리 (멀티 선택)
  const handleCategorySelection = () => {
    if (selectedCategories.length > 0 && selectedMealType) {
      loadFoodsByCategories(selectedCategories);
      setCurrentStep(2);
    }
  };

  // 카테고리 토글 함수
  const toggleCategory = (categoryValue) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryValue)) {
        return prev.filter(cat => cat !== categoryValue);
      } else {
        return [...prev, categoryValue];
      }
    });
  };

  // 기본 정보 유효성 검사
  const validateBasicInfo = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '식단 계획 이름은 필수입니다.';
    }

    if (formData.target_calories_min && formData.target_calories_max && 
        formData.target_calories_min > formData.target_calories_max) {
      newErrors.target_calories_max = '최대 칼로리는 최소 칼로리보다 커야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 최종 제출
  const handleSubmit = () => {
    if (validateBasicInfo()) {
      // 백엔드 API 구조에 맞게 데이터 변환
      const finalData = {
        name: formData.name,
        description: formData.description,
        target_goal: formData.target_goal,
        target_calories_min: formData.target_calories_min,
        target_calories_max: formData.target_calories_max,
        is_public: formData.is_public,
        start_date: new Date().toISOString().split('T')[0], // 기본값: 오늘
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 기본값: 일주일 후
        is_active: false, // 기본값: 비활성
        items: selectedFoods.map(food => ({
          food_id: food.id,
          quantity: food.quantity || 1,
          meal_time: food.meal_time
        }))
      };
      
      console.log('MealPlanModal - 백엔드 전송 데이터:', JSON.stringify(finalData, null, 2));
      
      onSubmit(finalData);
      handleClose();
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      target_goal: 'weight_loss',
      target_calories_min: 1200,
      target_calories_max: 2000,
      is_public: false,
      foods: []
    });
    setErrors({});
    setCurrentStep(1);
    setSelectedFoods([]);
    setTotalCalories(0);
    setSelectedCategories([]); // 멀티 선택 배열 초기화
    setSelectedMealType('');
    onClose();
  };

  // 이전 단계로
  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setFoods([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* 헤더 - 고정 */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center">
            <h3 className="text-lg md:text-xl font-bold">
              {initialData ? '식단 계획 수정' : '새 식단 계획 만들기'}
            </h3>
            <div className="ml-4 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>1</div>
              <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>2</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* 컨텐츠 - 스크롤 가능 */}
        <div className="flex-1 overflow-hidden">
          {currentStep === 1 ? (
            /* 1단계: 기본 정보 입력 */
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* 식단 계획 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      식단 계획 이름 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="예: 건강한 다이어트 식단"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* 설명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows="3"
                      placeholder="식단 계획에 대한 간단한 설명을 입력하세요"
                    />
                  </div>

                  {/* 목표 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      목표
                    </label>
                    <select
                      value={formData.target_goal}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_goal: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {targetGoalOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 칼로리 범위 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        최소 칼로리
                      </label>
                      <input
                        type="number"
                        value={formData.target_calories_min}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          target_calories_min: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        min="0"
                        placeholder="1200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        최대 칼로리
                      </label>
                      <input
                        type="number"
                        value={formData.target_calories_max}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          target_calories_max: parseInt(e.target.value) || 0 
                        }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.target_calories_max ? 'border-red-500' : 'border-gray-300'
                        }`}
                        min="0"
                        placeholder="2000"
                      />
                      {errors.target_calories_max && <p className="text-red-500 text-sm mt-1">{errors.target_calories_max}</p>}
                    </div>
                  </div>

                  {/* 식사 타입 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      식사 타입 선택
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {mealTypes.map((type) => (
                        <div
                          key={type.value}
                          onClick={() => setSelectedMealType(type.value)}
                          className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                            selectedMealType === type.value
                              ? 'border-primary bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <div className="font-medium">{type.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 음식 카테고리 선택 (멀티 선택) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      음식 카테고리 선택 (여러 개 선택 가능)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {foodCategories.map((category) => (
                        <div
                          key={category.value}
                          onClick={() => toggleCategory(category.value)}
                          className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all relative ${
                            selectedCategories.includes(category.value)
                              ? 'border-primary bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* 선택 체크 표시 */}
                          {selectedCategories.includes(category.value) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <i className="fas fa-check text-white text-xs"></i>
                            </div>
                          )}
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <div className="font-medium text-sm">{category.label}</div>
                        </div>
                      ))}
                    </div>
                    {selectedCategories.length > 0 && (
                      <div className="mt-3 text-sm text-gray-600">
                        선택된 카테고리: {selectedCategories.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* 공개 설정 */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                      다른 사용자에게 공개
                    </label>
                  </div>
                </div>
              </div>

              {/* 1단계 버튼 - 고정 푸터 */}
              <div className="p-4 md:p-6 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={handleCategorySelection}
                  disabled={selectedCategories.length === 0 || !selectedMealType}
                  className={`w-full py-3 rounded-lg font-medium ${
                    selectedCategories.length > 0 && selectedMealType
                      ? 'bg-primary hover:bg-orange-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  음식 선택하기 ({selectedCategories.length}개 카테고리)
                </button>
              </div>
            </div>
          ) : (
            /* 2단계: 음식 선택 */
            <div className="flex h-full">
              {/* 왼쪽: 음식 목록 */}
              <div className="flex-1 flex flex-col border-r border-gray-200">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold flex items-center">
                      <span className="text-2xl mr-2">🍽️</span>
                      선택한 카테고리 음식 ({selectedCategories.join(', ')})
                    </h4>
                    <button
                      onClick={handlePrevStep}
                      className="text-primary hover:text-orange-600 font-medium"
                    >
                      <i className="fas fa-arrow-left mr-1"></i>
                      뒤로 가기
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
                        <p className="text-gray-600">음식 정보를 불러오는 중...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {foods.map((food) => {
                        const isSelected = selectedFoods.some(f => f.id === food.id);
                        return (
                          <div
                            key={food.id}
                            onClick={() => handleFoodToggle(food)}
                            className={`relative bg-white border-2 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                              isSelected ? 'border-primary bg-orange-50' : 'border-gray-200'
                            }`}
                          >
                            {/* 체크박스 */}
                            <div className="absolute top-2 left-2 z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                isSelected 
                                  ? 'bg-primary border-primary text-white' 
                                  : 'bg-white border-gray-300'
                              }`}>
                                {isSelected && <i className="fas fa-check text-xs"></i>}
                              </div>
                            </div>

                            <div className="aspect-square overflow-hidden">
                              <img
                                src={food.image}
                                alt={food.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="p-3">
                              <h5 className="font-bold text-sm mb-1">{food.name}</h5>
                              <p className="text-xs text-gray-600 mb-2">
                                {food.calories}kcal • {food.serving_size}
                              </p>
                              <div className="text-xs text-gray-500 mb-2">
                                단백질 {food.protein}g • 탄수화물 {food.carbs}g • 지방 {food.fat}g
                              </div>
                              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                                food.difficulty === '초급' 
                                  ? 'bg-green-100 text-green-800'
                                  : food.difficulty === '중급'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {food.difficulty}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 선택된 음식 및 완료 */}
              <div className="w-96 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <h4 className="text-lg font-bold mb-2">선택된 음식</h4>
                  <div className="text-sm text-gray-600">
                    총 칼로리: <span className={`font-bold ${
                      totalCalories > formData.target_calories_max ? 'text-red-600' : 
                      totalCalories < formData.target_calories_min ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {totalCalories.toFixed(0)}kcal
                    </span> / {formData.target_calories_min}-{formData.target_calories_max}kcal
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedFoods.map((food) => (
                    <div key={food.id} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-sm">{food.name}</h5>
                        <button
                          onClick={() => removeSelectedFood(food.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {food.calories}kcal × {food.quantity} = {(food.calories * food.quantity).toFixed(0)}kcal
                      </div>
                      <div className="flex items-center">
                        <label className="text-xs text-gray-600 mr-2">수량:</label>
                        <input
                          type="number"
                          value={food.quantity}
                          onChange={(e) => handleQuantityChange(food.id, parseFloat(e.target.value) || 0.1)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                          min="0.1"
                          step="0.1"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2단계 버튼 - 고정 푸터 */}
                <div className="p-4 border-t border-gray-200 space-y-3 flex-shrink-0">
                  <button
                    onClick={handlePrevStep}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    다른 카테고리 선택
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={selectedFoods.length === 0 || totalCalories < formData.target_calories_min}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      selectedFoods.length > 0 && totalCalories >= formData.target_calories_min
                        ? 'bg-primary hover:bg-orange-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    식단 계획 완료
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

MealPlanModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default MealPlanModal; 