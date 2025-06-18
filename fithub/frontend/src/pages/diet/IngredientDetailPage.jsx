import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiet } from '../../hooks/useDiet';

function IngredientDetailPage() {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { getFoodById, foods, loading, error } = useDiet();

  // 로컬 상태
  const [food, setFood] = useState(null);
  const [relatedFoods, setRelatedFoods] = useState([]);

  // 컴포넌트 마운트 시 음식 상세 정보 로드
  useEffect(() => {
    const loadFoodDetail = async () => {
      if (foodId) {
        try {
          const foodData = await getFoodById(foodId);
          if (foodData) {
            setFood(foodData);
            // 관련 음식 추천 (같은 카테고리)
            const related = foods
              .filter(f => f.id !== parseInt(foodId) && f.category === foodData.category)
              .slice(0, 4);
            setRelatedFoods(related);
          }
        } catch (err) {
          console.error('음식 상세 정보 로드 실패:', err);
        }
      }
    };

    loadFoodDetail();
  }, [foodId, getFoodById, foods]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">음식 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태 또는 음식을 찾을 수 없는 경우
  if (error || !food) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h1 className="text-xl font-bold text-red-800 mb-2">음식 정보를 찾을 수 없습니다</h1>
          <p className="text-red-600 mb-4">
            {error || '요청하신 음식 정보가 존재하지 않거나 삭제되었습니다.'}
          </p>
          <button 
            onClick={() => navigate('/diet')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            식단 관리로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 영양소 정보 계산 (기본값 제공)
  const nutritionInfo = food.nutrition || {
    calories: food.calories || 100,
    protein: food.protein || 5,
    carbs: food.carbs || 15,
    fat: food.fat || 3,
    fiber: food.fiber || 2,
    sodium: food.sodium || 100,
    sugar: food.sugar || 5
  };

  // 1회 제공량 정보
  const servingInfo = {
    size: food.serving_size || '100g',
    calories: nutritionInfo.calories,
    weight: food.unit_weight_g || 100
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/diet')}
          className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold">음식 상세 정보</h1>
      </div>

      {/* 음식 개요 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {/* 음식 이미지 */}
        {food.image_url ? (
          <img 
            src={food.image_url} 
            alt={food.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-utensils text-4xl text-orange-500 mb-2"></i>
              <p className="text-orange-600 font-medium">{food.name}</p>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">{food.name}</h2>
              <p className="text-gray-600 mb-2">{food.description || '영양가 있는 건강한 음식입니다.'}</p>
              <div className="flex items-center gap-4">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                  {food.category || '일반 식품'}
                </span>
                <span className="text-sm text-gray-500">
                  {servingInfo.size} 기준
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{servingInfo.calories}</div>
              <div className="text-sm text-gray-500">kcal</div>
            </div>
          </div>

          {/* 칼로리 진행바 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>일일 권장 칼로리 대비</span>
              <span>{Math.round((servingInfo.calories / 2000) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((servingInfo.calories / 2000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 영양 성분 상세 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">영양 성분 ({servingInfo.size} 기준)</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{nutritionInfo.protein}g</div>
            <div className="text-sm text-gray-600">단백질</div>
            <div className="text-xs text-gray-500">{Math.round((nutritionInfo.protein * 4 / servingInfo.calories) * 100)}%</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{nutritionInfo.carbs}g</div>
            <div className="text-sm text-gray-600">탄수화물</div>
            <div className="text-xs text-gray-500">{Math.round((nutritionInfo.carbs * 4 / servingInfo.calories) * 100)}%</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{nutritionInfo.fat}g</div>
            <div className="text-sm text-gray-600">지방</div>
            <div className="text-xs text-gray-500">{Math.round((nutritionInfo.fat * 9 / servingInfo.calories) * 100)}%</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{nutritionInfo.fiber}g</div>
            <div className="text-sm text-gray-600">식이섬유</div>
            <div className="text-xs text-gray-500">일일 권장량의 {Math.round((nutritionInfo.fiber / 25) * 100)}%</div>
          </div>
        </div>

        {/* 추가 영양 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-3">미네랄</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>나트륨</span>
                <span className="font-medium">{nutritionInfo.sodium}mg</span>
              </div>
              <div className="flex justify-between">
                <span>당분</span>
                <span className="font-medium">{nutritionInfo.sugar}g</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-3">섭취 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1회 제공량</span>
                <span className="font-medium">{servingInfo.size}</span>
              </div>
              <div className="flex justify-between">
                <span>무게</span>
                <span className="font-medium">{servingInfo.weight}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 영양 팁 및 건강 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">건강 정보</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-green-800 mb-2">
            <i className="fas fa-leaf mr-2"></i>
            영양 팁
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            {food.nutrition_tips && food.nutrition_tips.length > 0 ? (
              food.nutrition_tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))
            ) : (
              <>
                <li>• 균형 잡힌 식단의 일부로 섭취하세요.</li>
                <li>• 적절한 운동과 함께 섭취하면 더욱 효과적입니다.</li>
                <li>• 개인의 건강 상태에 따라 섭취량을 조절하세요.</li>
              </>
            )}
          </ul>
        </div>
        
        {/* 칼로리별 운동량 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            <i className="fas fa-running mr-2"></i>
            {servingInfo.calories} kcal 소모에 필요한 운동량
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{Math.round(servingInfo.calories / 5)}분</div>
              <div className="text-blue-700">걷기</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">{Math.round(servingInfo.calories / 8)}분</div>
              <div className="text-blue-700">조깅</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">{Math.round(servingInfo.calories / 10)}분</div>
              <div className="text-blue-700">자전거</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">{Math.round(servingInfo.calories / 12)}분</div>
              <div className="text-blue-700">수영</div>
            </div>
          </div>
        </div>
      </div>

      {/* 관련 음식 추천 */}
      {relatedFoods.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">관련 음식 추천</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedFoods.map((relatedFood) => (
              <div 
                key={relatedFood.id}
                onClick={() => navigate(`/diet/food/${relatedFood.id}`)}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-center">
                  {relatedFood.image_url ? (
                    <img 
                      src={relatedFood.image_url} 
                      alt={relatedFood.name}
                      className="w-full h-20 object-cover rounded mb-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <i className="fas fa-utensils text-gray-400"></i>
                    </div>
                  )}
                  <h4 className="font-medium text-sm mb-1">{relatedFood.name}</h4>
                  <p className="text-xs text-gray-600">{relatedFood.calories || 100} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="fixed bottom-6 left-4 right-4 md:relative md:bottom-auto md:left-auto md:right-auto md:mt-6">
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={() => navigate('/diet')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            목록으로
          </button>
          <button
            onClick={() => {
              // 식단에 추가 기능 (향후 구현)
              console.log('식단에 추가:', food.name);
            }}
            className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center"
          >
            <i className="fas fa-plus mr-2"></i>
            식단에 추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default IngredientDetailPage; 