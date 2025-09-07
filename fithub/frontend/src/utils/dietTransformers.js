/**
 * Diet 관련 데이터 변환 유틸리티
 */

/**
 * DietLog 배열을 식사별로 그룹화하여 UI용 meal 객체로 변환
 */
export const transformDietLogsToMeals = (dietLogs) => {
  if (!Array.isArray(dietLogs)) {
    return [];
  }

  console.log('transformDietLogsToMeals - Input dietLogs:', dietLogs);

  // 식사 타입별로 그룹화
  const mealGroups = dietLogs.reduce((groups, log) => {
    const mealType = log.meal_type || 'snack';
    if (!groups[mealType]) {
      groups[mealType] = [];
    }
    groups[mealType].push(log);
    return groups;
  }, {});

  console.log('transformDietLogsToMeals - Meal groups:', mealGroups);

  // UI용 meal 객체 배열로 변환
  const meals = [];
  const mealTypeMap = {
    breakfast: { name: '아침', time: '07:00', emoji: '🌅' },
    lunch: { name: '점심', time: '12:00', emoji: '☀️' },
    dinner: { name: '저녁', time: '18:00', emoji: '🌙' },
    snack: { name: '간식', time: '15:00', emoji: '🍪' }
  };

  Object.keys(mealTypeMap).forEach((mealType) => {
    const logs = mealGroups[mealType] || [];
    const mealInfo = mealTypeMap[mealType];
    
    const totalCalories = logs.reduce((sum, log) => sum + (parseFloat(log.calories) || 0), 0);
    
    meals.push({
      id: `meal-${mealType}`,
      name: mealInfo.name,
      time: mealInfo.time,
      emoji: mealInfo.emoji,
      type: mealType,
      meal_time: mealType, // 호환성을 위해 추가
      foods: logs.map(log => ({
        id: log.id,
        name: log.food?.name || '알 수 없는 음식',
        calories: parseFloat(log.calories) || 0,
        quantity: parseFloat(log.quantity) || 0,
        unit: 'g',
        food_id: log.food?.id,
        brand: log.food?.brand || '',
        category: log.food?.category_name || log.food?.category?.name || '',
        ...log
      })),
      calories: totalCalories,
      isComplete: logs.length > 0
    });
  });

  const result = meals.sort((a, b) => {
    const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
    return order[a.type] - order[b.type];
  });

  console.log('transformDietLogsToMeals - Final result:', result);
  
  return result;
};

/**
 * API 응답의 MealPlan을 UI용 형태로 변환
 */
export const formatApiPlan = (plan) => {
  if (!plan) return null;

  const formattedItems = (plan.items || []).reduce((acc, item) => {
    const mealTime = item.meal_time || 'breakfast';
    if (!acc[mealTime]) {
      acc[mealTime] = [];
    }
    
    acc[mealTime].push({
      id: item.id,
      name: item.food?.name || '알 수 없는 음식',
      calories: parseFloat(item.food?.calories || 0) * (parseFloat(item.quantity || 1) / 100),
      quantity: parseFloat(item.quantity || 0),
      food: item.food
    });
    
    return acc;
  }, {});

  const nutrition = plan.nutrition || {};
  
  return {
    id: plan.id,
    title: plan.name || '식단 계획',
    type: plan.target_goal || '건강관리',
    image: null,
    calories: Math.round(parseFloat(plan.total_calories || 0)),
    meals: Object.keys(formattedItems).map(mealTime => {
      const items = formattedItems[mealTime];
      const mealCalories = items.reduce((sum, item) => sum + item.calories, 0);
      const mealNames = items.map(item => item.name).join(', ');
      
      const mealTypeMap = {
        breakfast: '아침',
        lunch: '점심', 
        dinner: '저녁',
        snack: '간식'
      };
      
      return {
        name: `${mealTypeMap[mealTime] || mealTime}: ${mealNames}`,
        calories: Math.round(mealCalories)
      };
    }),
    nutrients: {
      protein: Math.round(parseFloat(nutrition.protein || 0)),
      carbs: Math.round(parseFloat(nutrition.carbs || 0)),
      fat: Math.round(parseFloat(nutrition.fat || 0))
    },
    isApiData: true,
    originalData: plan
  };
};

/**
 * 추천 응답 데이터를 UI용 형태로 변환
 * 백엔드 응답 형식: { data: { breakfast: [...], lunch: [...], dinner: [...] }, nutrition_summary: {...} }
 */
export const formatRecommendationData = (recommendations) => {
  if (!recommendations) return null;

  // 백엔드에서 반환하는 형식 처리
  if (recommendations.data && typeof recommendations.data === 'object') {
    const meals = [];
    
    // 각 시간대별 추천 데이터 처리
    Object.entries(recommendations.data).forEach(([mealType, foods]) => {
      if (Array.isArray(foods) && foods.length > 0) {
        const formattedFoods = foods.map(food => ({
          id: food.id,
          name: food.name,
          calories: parseFloat(food.calories || 0),
          protein: parseFloat(food.protein || 0),
          carbs: parseFloat(food.carbs || 0),
          fat: parseFloat(food.fat || 0),
          servings: parseFloat(food.servings || 1),
          serving_size: food.serving_size || '100g',
          category: food.category || '기타'
        }));

        meals.push({
          meal_type: mealType,
          foods: formattedFoods,
          total_calories: formattedFoods.reduce((sum, food) => sum + food.calories, 0),
          nutrients: {
            protein: formattedFoods.reduce((sum, food) => sum + food.protein, 0),
            carbs: formattedFoods.reduce((sum, food) => sum + food.carbs, 0),
            fat: formattedFoods.reduce((sum, food) => sum + food.fat, 0)
          }
        });
      }
    });

    return {
      meals: meals,
      nutrition_summary: recommendations.nutrition_summary || {}
    };
  }

  // 기존 형식 호환성 유지
  // 추천 데이터가 배열인 경우 (여러 식사)
  if (Array.isArray(recommendations)) {
    return {
      meals: recommendations.map(rec => ({
        meal_type: rec.meal_type,
        foods: rec.foods?.map(food => ({
          id: food.id,
          name: food.name,
          calories: parseFloat(food.calories || 0),
          protein: parseFloat(food.protein || 0),
          carbs: parseFloat(food.carbs || 0),
          fat: parseFloat(food.fat || 0),
          servings: parseFloat(food.servings || 1),
          serving_size: food.serving_size || '100g',
          category: food.category?.name || '기타'
        })) || []
      }))
    };
  }

  // 단일 식사 추천인 경우
  if (recommendations.meal_type) {
    return {
      meals: [{
        meal_type: recommendations.meal_type,
        foods: recommendations.foods?.map(food => ({
          id: food.id,
          name: food.name,
          calories: parseFloat(food.calories || 0),
          protein: parseFloat(food.protein || 0),
          carbs: parseFloat(food.carbs || 0),
          fat: parseFloat(food.fat || 0),
          servings: parseFloat(food.servings || 1),
          serving_size: food.serving_size || '100g',
          category: food.category?.name || '기타'
        })) || []
      }]
    };
  }

  return null;
};

/**
 * 음식 검색 결과를 표준화
 */
export const formatFoodSearchResults = (foods) => {
  if (!Array.isArray(foods)) {
    return [];
  }

  return foods.map(food => ({
    id: food.id,
    name: food.name,
    calories: parseFloat(food.calories || 0),
    calories_per_100g: parseFloat(food.calories || 0),
    calories_per_serving: parseFloat(food.calories || 0),
    protein: parseFloat(food.protein || 0),
    carbs: parseFloat(food.carbs || 0),
    fat: parseFloat(food.fat || 0),
    serving_size: food.serving_size || '100g',
    category: food.category?.name || food.category_name || '기타',
    brand: food.brand || '',
    is_custom: !!food.user,
    description: food.description || ''
  }));
};

/**
 * 식단 통계 데이터 변환
 */
export const formatDietStats = (stats) => {
  if (!stats) return null;

  return {
    date: stats.date,
    totalCalories: Math.round(parseFloat(stats.total_calories || 0)),
    totalProtein: Math.round(parseFloat(stats.total_protein || 0)),
    totalCarbs: Math.round(parseFloat(stats.total_carbs || 0)),
    totalFat: Math.round(parseFloat(stats.total_fat || 0)),
    mealBreakdown: stats.meal_breakdown || {},
    recommendedVsManual: stats.recommended_vs_manual || {
      recommended_count: 0,
      manual_count: 0
    }
  };
};

/**
 * 식단 계획 생성 요청 데이터 변환
 */
export const formatMealPlanCreateData = (planData) => {
  const formattedData = {
    name: planData.name || '',
    description: planData.description || '',
    start_date: planData.start_date,
    end_date: planData.end_date,
    is_active: planData.is_active || false,
    total_calories: parseInt(planData.total_calories || 0),
    is_public: planData.is_public || false,
    target_goal: planData.target_goal || 'health',
    difficulty: planData.difficulty || 'medium',
    items: []
  };

  // 식사별 아이템 변환
  if (planData.meals && Array.isArray(planData.meals)) {
    planData.meals.forEach(meal => {
      if (meal.foods && Array.isArray(meal.foods)) {
        meal.foods.forEach(food => {
          formattedData.items.push({
            food: food.id || food.food_id,
            quantity: parseFloat(food.quantity || food.amount || 100),
            meal_time: meal.type || 'breakfast'
          });
        });
      }
    });
  }

  return formattedData;
};

/**
 * 날짜 형식 변환 유틸리티
 */
export const formatDateForApi = (date) => {
  if (!date) return new Date().toISOString().split('T')[0];
  
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  return new Date().toISOString().split('T')[0];
};

/**
 * 칼로리 계산 유틸리티
 */
export const calculateMealCalories = (foods) => {
  if (!Array.isArray(foods)) return 0;
  
  return foods.reduce((total, food) => {
    const calories = parseFloat(food.calories || 0);
    const quantity = parseFloat(food.quantity || food.amount || 1);
    const serving = parseFloat(food.serving_size?.replace(/[^\d.]/g, '') || 100);
    
    return total + (calories * quantity / serving);
  }, 0);
}; 