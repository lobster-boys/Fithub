import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

/**
 * 식사 기록 편집 모달 컴포넌트
 */
const MealEditModal = ({ isOpen, onClose, meal, onSave }) => {
  const [formData, setFormData] = useState({
    meal_name: '',
    meal_time: 'breakfast',
    date: new Date().toISOString().split('T')[0],
    foods: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달이 열릴 때 기존 식사 데이터로 폼 초기화
  useEffect(() => {
    if (isOpen && meal) {
      setFormData({
        meal_name: meal.meal_name || '',
        meal_time: meal.meal_time || 'breakfast',
        date: meal.date || new Date().toISOString().split('T')[0],
        foods: meal.foods || [],
        notes: meal.notes || ''
      });
      setError('');
    }
  }, [isOpen, meal]);

  // 폼 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        return sum + (food.calories_per_serving || food.calories || 0) * (food.quantity || 1);
      }, 0);

      const updatedMeal = {
        ...formData,
        total_calories: totalCalories,
        updated_at: new Date().toISOString()
      };

      await onSave(updatedMeal);
    } catch (err) {
      setError(err.message || '식사 기록 수정에 실패했습니다.');
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
    return sum + (food.calories_per_serving || food.calories || 0) * (food.quantity || 1);
  }, 0);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="식사 기록 편집"
      size="lg"
    >
      <div className="space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              식사명
            </label>
            <input
              type="text"
              name="meal_name"
              value={formData.meal_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="예: 아침 식사"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              식사 시간
            </label>
            <select
              name="meal_time"
              value={formData.meal_time}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            >
              <option value="breakfast">아침</option>
              <option value="lunch">점심</option>
              <option value="dinner">저녁</option>
              <option value="snack">간식</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              총 칼로리
            </label>
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600">
              {Math.round(totalCalories)} kcal
            </div>
          </div>
        </div>

        {/* 음식 목록 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">음식 목록</h3>
            <span className="text-sm text-gray-500">
              {formData.foods.length}개 음식
            </span>
          </div>

          {formData.foods.length > 0 ? (
            <div className="space-y-3">
              {formData.foods.map((food, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{food.name}</h4>
                      {food.brand && (
                        <p className="text-sm text-gray-600">{food.brand}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFood(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">수량</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={food.quantity || 1}
                        onChange={(e) => updateFoodQuantity(index, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">칼로리</label>
                      <div className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                        {Math.round((food.calories_per_serving || food.calories || 0) * (food.quantity || 1))} kcal
                      </div>
                    </div>
                  </div>

                  {/* 영양소 정보 */}
                  {(food.protein || food.carbs || food.fat) && (
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      <div className="text-center">
                        <div className="text-gray-600">단백질</div>
                        <div className="font-medium text-blue-600">
                          {Math.round((food.protein || 0) * (food.quantity || 1))}g
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">탄수화물</div>
                        <div className="font-medium text-green-600">
                          {Math.round((food.carbs || 0) * (food.quantity || 1))}g
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">지방</div>
                        <div className="font-medium text-yellow-600">
                          {Math.round((food.fat || 0) * (food.quantity || 1))}g
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <i className="fas fa-utensils text-2xl mb-2 block"></i>
              <p>음식이 없습니다</p>
            </div>
          )}
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메모 (선택사항)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
            placeholder="식사에 대한 추가 메모를 입력하세요..."
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading || formData.foods.length === 0}
            className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
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
    </BaseModal>
  );
};

export default MealEditModal; 