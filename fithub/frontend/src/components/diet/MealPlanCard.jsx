import React, { useState } from 'react';
import { useDiet } from '../../hooks/useDiet';

const MealPlanCard = ({ mealPlan, isPublic = false, onLike, onCopy }) => {
  const { toggleMealPlanLike } = useDiet();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking || !isPublic) return;
    
    setIsLiking(true);
    try {
      const result = await toggleMealPlanLike(mealPlan.id);
      if (onLike) {
        onLike(mealPlan.id, result.is_liked, result.likes_count);
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(mealPlan);
    }
  };

  const formatCalories = (min, max) => {
    if (min && max) {
      return `${min}-${max} kcal`;
    } else if (min) {
      return `${min}+ kcal`;
    } else if (max) {
      return `~${max} kcal`;
    }
    return '칼로리 정보 없음';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {mealPlan.name}
        </h3>
        {isPublic && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                mealPlan.is_liked_by_user
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{mealPlan.is_liked_by_user ? '❤️' : '🤍'}</span>
              <span className="text-sm">{mealPlan.likes_count || 0}</span>
            </button>
          </div>
        )}
      </div>

      {/* 설명 */}
      {mealPlan.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {mealPlan.description}
        </p>
      )}

      {/* 메타 정보 */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2">
          {/* 목표 */}
          {mealPlan.target_goal_display && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {mealPlan.target_goal_display}
            </span>
          )}
          
          {/* 난이도 */}
          {mealPlan.difficulty_display && (
            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(mealPlan.difficulty)}`}>
              {mealPlan.difficulty_display}
            </span>
          )}
          
          {/* 칼로리 범위 */}
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {formatCalories(mealPlan.target_calories_min, mealPlan.target_calories_max)}
          </span>
        </div>

        {/* 영양 정보 */}
        {mealPlan.calculated_nutrition && (
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>🔥 {Math.round(mealPlan.calculated_nutrition.total_calories || 0)} kcal</span>
            <span>🥩 {Math.round(mealPlan.calculated_nutrition.total_protein || 0)}g</span>
            <span>🍞 {Math.round(mealPlan.calculated_nutrition.total_carbs || 0)}g</span>
            <span>🥑 {Math.round(mealPlan.calculated_nutrition.total_fat || 0)}g</span>
          </div>
        )}
      </div>

      {/* 통계 정보 */}
      {isPublic && (
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>👀 조회 {mealPlan.views_count || 0}회</span>
          <span>📅 {new Date(mealPlan.created_at).toLocaleDateString()}</span>
          {mealPlan.user_name && (
            <span>👤 by {mealPlan.user_name}</span>
          )}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
          상세보기
        </button>
        
        {isPublic && (
          <button
            onClick={handleCopy}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
          >
            복사하기
          </button>
        )}
        
        {!isPublic && (
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
            수정
          </button>
        )}
      </div>
    </div>
  );
};

export default MealPlanCard; 