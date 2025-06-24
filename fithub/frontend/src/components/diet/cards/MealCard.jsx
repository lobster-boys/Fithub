import React from 'react';

/**
 * 식사 기록 카드 컴포넌트
 */
const MealCard = ({ 
  meal, 
  onEdit, 
  onDelete, 
  onViewDetail,
  showActions = true,
  compact = false,
  className = ''
}) => {
  // 식사 시간 아이콘
  const getMealIcon = (mealTime) => {
    switch (mealTime) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍪';
      default: return '🍽️';
    }
  };

  // 식사 시간 라벨
  const getMealLabel = (mealTime) => {
    switch (mealTime) {
      case 'breakfast': return '아침';
      case 'lunch': return '점심';
      case 'dinner': return '저녁';
      case 'snack': return '간식';
      default: return mealTime;
    }
  };

  // 칼로리 포맷팅
  const formatCalories = (calories) => {
    return Math.round(calories).toLocaleString();
  };

  // 시간 포맷팅
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  // DietLog 데이터 구조에 맞게 필드 추출
  const mealType = meal.meal_type || meal.meal_time || 'breakfast';
  const foodName = meal.food?.name || meal.name || '알 수 없는 음식';
  const calories = meal.calories || meal.total_calories || 0;
  const quantity = meal.quantity || 1;

  console.log('MealCard - meal data:', meal);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${compact ? 'p-3' : 'p-4'} hover:shadow-md transition-shadow ${className}`}>
      {/* 헤더 */}
      <div className={`flex items-start justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center space-x-3">
          <div className={compact ? 'text-lg' : 'text-2xl'}>{getMealIcon(mealType)}</div>
          <div>
            <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : ''}`}>
              {foodName}
            </h3>
            {!compact && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{getMealLabel(mealType)}</span>
                {meal.created_at && (
                  <>
                    <span>•</span>
                    <span>{formatTime(meal.created_at)}</span>
                  </>
                )}
              </div>
            )}
            {compact && meal.created_at && (
              <div className="text-xs text-gray-500">
                {formatTime(meal.created_at)}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className={`font-bold text-primary ${compact ? 'text-base' : 'text-lg'}`}>
            {formatCalories(calories)}kcal
          </div>
          <div className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
            {quantity}g
          </div>
        </div>
      </div>

      {/* 음식 정보 (DietLog는 단일 음식) */}
      <div className={compact ? 'mb-2' : 'mb-3'}>
        <div className="flex flex-wrap gap-1">
          <span className={`inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded ${compact ? 'text-xs' : 'text-xs'}`}>
            {foodName}
            <span className="ml-1 text-gray-500">{quantity}g</span>
          </span>
          {meal.food?.category_name && (
            <span className={`inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded ${compact ? 'text-xs' : 'text-xs'}`}>
              {meal.food.category_name}
            </span>
          )}
        </div>
      </div>

      {/* 영양소 정보 (Food에서 가져옴) */}
      {meal.food && !compact && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-blue-50 py-2 px-3 rounded">
            <div className="text-xs text-blue-600">단백질</div>
            <div className="font-medium text-blue-800">
              {Math.round((meal.food.protein || 0) * (quantity / 100))}g
            </div>
          </div>
          <div className="bg-green-50 py-2 px-3 rounded">
            <div className="text-xs text-green-600">탄수화물</div>
            <div className="font-medium text-green-800">
              {Math.round((meal.food.carbs || 0) * (quantity / 100))}g
            </div>
          </div>
          <div className="bg-yellow-50 py-2 px-3 rounded">
            <div className="text-xs text-yellow-600">지방</div>
            <div className="font-medium text-yellow-800">
              {Math.round((meal.food.fat || 0) * (quantity / 100))}g
            </div>
          </div>
        </div>
      )}
      
      {/* compact 모드에서는 영양소를 한 줄로 표시 */}
      {meal.food && compact && (
        <div className="flex justify-center space-x-4 mb-2 text-xs">
          <span className="text-blue-600">단백질 {Math.round((meal.food.protein || 0) * (quantity / 100))}g</span>
          <span className="text-green-600">탄수화물 {Math.round((meal.food.carbs || 0) * (quantity / 100))}g</span>
          <span className="text-yellow-600">지방 {Math.round((meal.food.fat || 0) * (quantity / 100))}g</span>
        </div>
      )}

      {/* 액션 버튼 */}
      {showActions && (
        <div className={`flex space-x-2 ${compact ? 'gap-1' : ''}`}>
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(meal)}
              className={`flex-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${compact ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-sm'}`}
            >
              <i className="fas fa-eye mr-1"></i>
              {compact ? '상세' : '상세보기'}
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(meal)}
              className={`flex-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors ${compact ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-sm'}`}
            >
              <i className="fas fa-edit mr-1"></i>
              수정
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(meal)}
              className={`flex-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors ${compact ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-sm'}`}
            >
              <i className="fas fa-trash mr-1"></i>
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MealCard; 