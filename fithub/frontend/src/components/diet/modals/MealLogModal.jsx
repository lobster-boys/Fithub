import React, { useState, useEffect } from 'react';
import { useFoods } from '../../../hooks/diet/useFoods';
import BaseModal from './BaseModal';

/**
 * 새 식사 기록 모달 컴포넌트
 */
const MealLogModal = ({ isOpen, onClose, mealType = 'breakfast', onSave }) => {
  const { searchFoods, loading: foodsLoading } = useFoods();
  
  const [formData, setFormData] = useState({
    meal_name: '',
    meal_time: mealType,
    date: new Date().toISOString().split('T')[0],
    foods: [],
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        meal_name: '',
        meal_time: mealType,
        date: new Date().toISOString().split('T')[0],
        foods: [],
        notes: ''
      });
      setSearchQuery('');
      setSearchResults([]);
      setError('');
      setShowSearch(false);
    }
  }, [isOpen, mealType]);

  // 폼 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 음식 검색
  const handleFoodSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await searchFoods(searchQuery);
      setSearchResults(response.data || []);
    } catch (err) {
      console.error('음식 검색 실패:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // 검색 입력 핸들러
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // 엔터 키 검색
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFoodSearch();
    }
  };

  // 음식 추가
  const addFood = (food) => {
    const foodToAdd = {
      ...food,
      quantity: 1,
      calories_per_serving: food.calories_per_100g || food.calories || 0
    };

    setFormData(prev => ({
      ...prev,
      foods: [...prev.foods, foodToAdd]
    }));
  };

  // 음식 제거
  const removeFood = (index) => {
    setFormData(prev => ({
      ...prev,
      foods: prev.foods.filter((_, i) => i !== index)
    }));
  };

  // 음식 수량 변경
  const updateFoodQuantity = (index, quantity) => {
    const numQuantity = Math.max(0.1, parseFloat(quantity) || 1);
    setFormData(prev => ({
      ...prev,
      foods: prev.foods.map((food, i) => 
        i === index 
          ? { ...food, quantity: numQuantity }
          : food
      )
    }));
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!formData.meal_name.trim()) {
      setError('식사명을 입력해주세요.');
      return;
    }

    if (formData.foods.length === 0) {
      setError('최소 하나의 음식을 추가해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 총 칼로리 계산
      const totalCalories = formData.foods.reduce((sum, food) => {
        return sum + (food.calories_per_serving || 0) * (food.quantity || 1);
      }, 0);

      const mealData = {
        ...formData,
        total_calories: totalCalories,
        created_at: new Date().toISOString()
      };

      await onSave(mealData);
    } catch (err) {
      setError(err.message || '식사 기록 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

  // 총 칼로리 계산
  const totalCalories = formData.foods.reduce((sum, food) => {
    return sum + (food.calories_per_serving || 0) * (food.quantity || 1);
  }, 0);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`새 ${getMealTypeLabel(mealType)} 기록`}
      size="lg"
    >
      <div className="flex flex-col h-full">
        {/* 에러 메시지 - 고정 위치 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mx-6 mt-4 mb-2">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div 
          className="flex-1 overflow-y-scroll overflow-x-hidden px-6 pb-4" 
          style={{ 
            maxHeight: 'calc(90vh - 200px)',
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="space-y-5">
            {/* 기본 정보 섹션 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    식사명
                  </label>
                  <input
                    type="text"
                    name="meal_name"
                    value={formData.meal_name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                    placeholder={`예: ${getMealTypeLabel(mealType)} 식사`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    식사 시간
                  </label>
                  <select
                    name="meal_time"
                    value={formData.meal_time}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                  >
                    <option value="breakfast">아침</option>
                    <option value="lunch">점심</option>
                    <option value="dinner">저녁</option>
                    <option value="snack">간식</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    날짜
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    총 칼로리
                  </label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold">
                    {Math.round(totalCalories)} kcal
                  </div>
                </div>
              </div>
            </div>

            {/* 음식 검색 섹션 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">음식 추가</h3>
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-primary hover:text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded"
                >
                  {showSearch ? '검색 닫기' : '음식 검색'}
                </button>
              </div>

              {showSearch && (
                <div className="border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleSearchKeyPress}
                      placeholder="음식명을 입력하세요"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                    />
                    <button
                      onClick={handleFoodSearch}
                      disabled={searching || !searchQuery.trim()}
                      className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
                    >
                      {searching ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-search"></i>
                      )}
                    </button>
                  </div>

                  {/* 검색 결과 */}
                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto overflow-x-hidden space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {searchResults.map((food, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{food.name}</h4>
                            {food.brand && (
                              <p className="text-xs text-gray-600 truncate">{food.brand}</p>
                            )}
                            <p className="text-xs text-gray-600">
                              {food.calories_per_100g || food.calories}kcal/100g
                            </p>
                          </div>
                          <button
                            onClick={() => addFood(food)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors ml-2 shrink-0"
                          >
                            추가
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && !searching && (
                    <div className="text-center py-3 text-gray-500 text-sm">
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 추가된 음식 목록 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700">추가된 음식</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {formData.foods.length}개 음식
                </span>
              </div>

              {formData.foods.length > 0 ? (
                <div className="max-h-60 overflow-y-auto overflow-x-hidden space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {formData.foods.map((food, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{food.name}</h4>
                          {food.brand && (
                            <p className="text-xs text-gray-600 truncate">{food.brand}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFood(index)}
                          className="text-red-500 hover:text-red-700 ml-2 shrink-0"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">수량 (단위)</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={food.quantity || 1}
                            onChange={(e) => updateFoodQuantity(index, e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">칼로리</label>
                          <div className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                            {Math.round((food.calories_per_serving || 0) * (food.quantity || 1))} kcal
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <i className="fas fa-utensils text-lg mb-2 block"></i>
                  <p className="text-sm">아직 추가된 음식이 없습니다</p>
                  <p className="text-xs">위에서 음식을 검색하여 추가해보세요</p>
                </div>
              )}
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                메모 (선택사항)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary resize-none"
                placeholder="식사에 대한 추가 메모를 입력하세요..."
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 - 고정 위치 */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={loading || formData.foods.length === 0}
              className="flex-1 bg-primary text-white py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  저장 중...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  저장
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default MealLogModal; 