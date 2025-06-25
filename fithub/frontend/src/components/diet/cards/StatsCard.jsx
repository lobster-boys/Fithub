import React from 'react';

/**
 * 식단 통계 카드 컴포넌트
 */
const StatsCard = ({ 
  title,
  stats,
  period = 'today', // 'today', 'week', 'month'
  className = '',
  showProgress = true,
  targetCalories = 2000
}) => {
  // 기본 통계 구조
  const defaultStats = {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    meal_count: 0,
    water_intake: 0,
    foods: [] // 새로 추가: 섭취 음식 목록
  };

  const currentStats = { ...defaultStats, ...stats };

  // 칼로리 포맷팅
  const formatCalories = (calories) => {
    return Math.round(calories).toLocaleString();
  };

  // 영양소 포맷팅
  const formatNutrient = (amount) => {
    return Math.round(amount);
  };

  // 진행률 계산
  const getCalorieProgress = () => {
    if (!targetCalories) return 0;
    return Math.min((currentStats.total_calories / targetCalories) * 100, 100);
  };

  // 진행률 색상
  const getProgressColor = (percentage) => {
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 80) return 'bg-yellow-500';
    if (percentage <= 100) return 'bg-green-500';
    return 'bg-orange-500';
  };

  // 기간별 제목
  const getPeriodTitle = () => {
    switch (period) {
      case 'today': return '오늘';
      case 'week': return '이번 주';
      case 'month': return '이번 달';
      default: return title;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {title || `${getPeriodTitle()} 통계`}
        </h3>
        <div className="text-sm text-gray-500">
          {currentStats.meal_count}회 식사
        </div>
      </div>

      {/* 칼로리 정보 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">칼로리</span>
          <span className="text-2xl font-bold text-primary">
            {formatCalories(currentStats.total_calories)}kcal
          </span>
        </div>
        
        {showProgress && targetCalories && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>목표: {formatCalories(targetCalories)}kcal</span>
              <span>{Math.round(getCalorieProgress())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getCalorieProgress())}`}
                style={{ width: `${getCalorieProgress()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 영양소 정보 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatNutrient(currentStats.total_protein)}g
            </div>
            <div className="text-xs text-blue-800">단백질</div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatNutrient(currentStats.total_carbs)}g
            </div>
            <div className="text-xs text-green-800">탄수화물</div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {formatNutrient(currentStats.total_fat)}g
            </div>
            <div className="text-xs text-yellow-800">지방</div>
          </div>
        </div>
      </div>

      {/* 수분 섭취 */}
      {currentStats.water_intake !== undefined && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💧</span>
              <span className="text-sm font-medium text-gray-700">수분 섭취</span>
            </div>
            <span className="font-semibold text-blue-600">
              {currentStats.water_intake || 0}잔
            </span>
          </div>
        </div>
      )}

      {/* 섭취 음식 리스트 */}
      {Array.isArray(currentStats.foods) && currentStats.foods.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4 max-h-48 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-2">섭취 음식</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {currentStats.foods.map((food, idx) => (
              <li key={`food-${idx}`}>{food}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 추가 정보 */}
      {currentStats.meal_count === 0 && (
        <div className="text-center py-4 text-gray-500">
          <i className="fas fa-utensils text-2xl mb-2 block"></i>
          <p className="text-sm">아직 기록된 식사가 없습니다</p>
        </div>
      )}
    </div>
  );
};

/**
 * 간단한 통계 카드 (미니 버전)
 */
export const MiniStatsCard = ({ 
  icon, 
  label, 
  value, 
  unit = '', 
  color = 'primary',
  className = '' 
}) => {
  const colorClasses = {
    primary: 'text-orange-600 bg-orange-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50'
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 mb-1">{label}</div>
          <div className="text-xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.primary}`}>
            <i className={`${icon} text-xl`}></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard; 