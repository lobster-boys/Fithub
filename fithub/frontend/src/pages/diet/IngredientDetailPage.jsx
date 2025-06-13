import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function IngredientDetailPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();

  // 식사별 상세 데이터 (실제로는 API에서 가져올 데이터)
  const mealData = {
    1: {
      name: "아침",
      description: "그릭 요거트, 베리 및 그래놀라",
      totalCalories: 320,
      category: "고단백",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      ingredients: [
        {
          name: "그릭 요거트",
          amount: "150g",
          calories: 130,
          protein: 15,
          carbs: 9,
          fat: 4,
          fiber: 0
        },
        {
          name: "블루베리",
          amount: "80g",
          calories: 45,
          protein: 0.6,
          carbs: 11,
          fat: 0.2,
          fiber: 2.4
        },
        {
          name: "딸기",
          amount: "60g",
          calories: 20,
          protein: 0.4,
          carbs: 5,
          fat: 0.1,
          fiber: 1.2
        },
        {
          name: "그래놀라",
          amount: "30g",
          calories: 125,
          protein: 3,
          carbs: 18,
          fat: 5,
          fiber: 2
        }
      ],
      nutritionTips: [
        "그릭 요거트는 일반 요거트보다 단백질이 2배 많습니다.",
        "베리류는 항산화 성분이 풍부하여 면역력 강화에 도움됩니다.",
        "그래놀라는 적당량 섭취하여 칼로리를 조절하세요."
      ]
    },
    2: {
      name: "간식",
      description: "사과 및 아몬드 버터",
      totalCalories: 200,
      category: "건강한 지방",
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      ingredients: [
        {
          name: "사과",
          amount: "1개 (180g)",
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
          fiber: 4.4
        },
        {
          name: "아몬드 버터",
          amount: "15g",
          calories: 105,
          protein: 4,
          carbs: 3,
          fat: 9,
          fiber: 2
        }
      ],
      nutritionTips: [
        "사과는 식이섬유가 풍부하여 포만감을 오래 유지시켜줍니다.",
        "아몬드 버터는 건강한 불포화지방과 비타민 E가 풍부합니다.",
        "간식으로 적당한 칼로리와 영양소를 제공합니다."
      ]
    },
    3: {
      name: "점심",
      description: "그릴드 치킨, 퀴노아, 야채",
      totalCalories: 450,
      category: "균형 잡힌",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      ingredients: [
        {
          name: "그릴드 치킨 가슴살",
          amount: "120g",
          calories: 200,
          protein: 37,
          carbs: 0,
          fat: 4,
          fiber: 0
        },
        {
          name: "퀴노아",
          amount: "80g (조리된 것)",
          calories: 110,
          protein: 4,
          carbs: 20,
          fat: 2,
          fiber: 2.5
        },
        {
          name: "브로콜리",
          amount: "100g",
          calories: 35,
          protein: 3,
          carbs: 7,
          fat: 0.4,
          fiber: 2.6
        },
        {
          name: "당근",
          amount: "80g",
          calories: 35,
          protein: 0.8,
          carbs: 8,
          fat: 0.2,
          fiber: 2.4
        },
        {
          name: "올리브오일",
          amount: "1큰술 (15ml)",
          calories: 120,
          protein: 0,
          carbs: 0,
          fat: 14,
          fiber: 0
        }
      ],
      nutritionTips: [
        "치킨 가슴살은 고품질 단백질의 훌륭한 공급원입니다.",
        "퀴노아는 완전 단백질을 제공하는 슈퍼푸드입니다.",
        "다양한 색깔의 야채로 비타민과 미네랄을 골고루 섭취하세요."
      ]
    }
  };

  const meal = mealData[mealId];

  if (!meal) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">식사 정보를 찾을 수 없습니다</h1>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const totalNutrition = meal.ingredients.reduce((total, ingredient) => ({
    protein: total.protein + ingredient.protein,
    carbs: total.carbs + ingredient.carbs,
    fat: total.fat + ingredient.fat,
    fiber: total.fiber + ingredient.fiber
  }), { protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 p-2 rounded-lg hover:bg-gray-100"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold">식사 상세 정보</h1>
      </div>

      {/* 식사 개요 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <img 
          src={meal.image} 
          alt={meal.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">{meal.name}</h2>
              <p className="text-gray-600 mb-2">{meal.description}</p>
              <span className="inline-block bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm">
                {meal.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{meal.totalCalories} kcal</p>
              <p className="text-sm text-gray-500">총 칼로리</p>
            </div>
          </div>
        </div>
      </div>

      {/* 영양소 요약 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">영양소 요약</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalNutrition.protein.toFixed(1)}g</div>
            <div className="text-sm text-gray-600">단백질</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalNutrition.carbs.toFixed(1)}g</div>
            <div className="text-sm text-gray-600">탄수화물</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalNutrition.fat.toFixed(1)}g</div>
            <div className="text-sm text-gray-600">지방</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalNutrition.fiber.toFixed(1)}g</div>
            <div className="text-sm text-gray-600">식이섬유</div>
          </div>
        </div>
      </div>

      {/* 재료별 상세 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">재료별 영양 정보</h3>
        <div className="space-y-4">
          {meal.ingredients.map((ingredient, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold">{ingredient.name}</h4>
                  <p className="text-sm text-gray-600">{ingredient.amount}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{ingredient.calories} kcal</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium text-blue-600">{ingredient.protein}g</div>
                  <div className="text-gray-500">단백질</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-600">{ingredient.carbs}g</div>
                  <div className="text-gray-500">탄수화물</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-600">{ingredient.fat}g</div>
                  <div className="text-gray-500">지방</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-600">{ingredient.fiber}g</div>
                  <div className="text-gray-500">식이섬유</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 영양 팁 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">영양 팁</h3>
        <div className="space-y-3">
          {meal.nutritionTips.map((tip, index) => (
            <div key={index} className="flex items-start">
              <div className="w-6 h-6 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <i className="fas fa-lightbulb text-primary text-xs"></i>
              </div>
              <p className="text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IngredientDetailPage; 