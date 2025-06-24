import { useState, useCallback } from 'react';
import { foodService } from '../../services/diet/foodService';
import { ERROR_TYPES } from '../../utils/errorHandler';

/**
 * 음식 관련 상태 관리 훅
 */
export const useFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 에러 상태 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 음식 목록 조회
  const fetchFoods = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodService.getFoods(params);
      setFoods(response.data);
      return response;
    } catch (err) {
      // 인증 오류 시 빈 배열로 설정
      if (err.type === ERROR_TYPES.AUTHENTICATION) {
        setFoods([]);
        setError(err.message);
        return { data: [], pagination: null };
      }
      
      setError(err.message);
      setFoods([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 음식 검색
  const searchFoods = useCallback(async (query, params = {}) => {
    if (!query?.trim()) {
      return fetchFoods(params);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodService.searchFoods(query, params);
      setFoods(response.data);
      return response;
    } catch (err) {
      if (err.type === ERROR_TYPES.AUTHENTICATION) {
        setFoods([]);
        setError(err.message);
        return { data: [], pagination: null };
      }
      
      setError(err.message);
      setFoods([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, [fetchFoods]);

  // 카테고리별 음식 조회
  const getFoodsByCategory = useCallback(async (categoryName, params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodService.getFoodsByCategory(categoryName, params);
      setFoods(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      setFoods([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 음식 조회
  const getFood = useCallback(async (foodId) => {
    setLoading(true);
    setError(null);
    
    try {
      const food = await foodService.getFood(foodId);
      return food;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 음식 생성
  const createFood = useCallback(async (foodData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newFood = await foodService.createFood(foodData);
      
      // 현재 음식 목록에 새 음식 추가
      setFoods(prevFoods => [newFood, ...prevFoods]);
      
      return newFood;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 음식 수정
  const updateFood = useCallback(async (foodId, foodData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedFood = await foodService.updateFood(foodId, foodData);
      
      // 현재 음식 목록에서 수정된 음식 업데이트
      setFoods(prevFoods => 
        prevFoods.map(food => 
          food.id === foodId ? updatedFood : food
        )
      );
      
      return updatedFood;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 음식 삭제
  const deleteFood = useCallback(async (foodId) => {
    setLoading(true);
    setError(null);
    
    try {
      await foodService.deleteFood(foodId);
      
      // 현재 음식 목록에서 삭제된 음식 제거
      setFoods(prevFoods => 
        prevFoods.filter(food => food.id !== foodId)
      );
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 카테고리 목록 조회
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await foodService.getFoodCategories();
      setCategories(categoriesData);
      return categoriesData;
    } catch (err) {
      setError(err.message);
      setCategories([]);
      return [];
    }
  }, []);

  // 내가 추가한 음식 목록
  const fetchMyFoods = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await foodService.getMyFoods(params);
      setFoods(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      setFoods([]);
      return { data: [], pagination: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // 인기 음식 목록
  const fetchPopularFoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const popularFoods = await foodService.getPopularFoods();
      setFoods(popularFoods);
      return popularFoods;
    } catch (err) {
      setError(err.message);
      setFoods([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 음식 영양 정보 조회
  const getFoodNutritionInfo = useCallback(async (foodId) => {
    setLoading(true);
    setError(null);
    
    try {
      const nutritionInfo = await foodService.getFoodNutritionInfo(foodId);
      return nutritionInfo;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 모든 상태 초기화
  const reset = useCallback(() => {
    setFoods([]);
    setCategories([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // 상태
    foods,
    categories,
    loading,
    error,
    
    // 액션
    fetchFoods,
    searchFoods,
    getFoodsByCategory,
    getFood,
    createFood,
    updateFood,
    deleteFood,
    fetchCategories,
    fetchMyFoods,
    fetchPopularFoods,
    getFoodNutritionInfo,
    clearError,
    reset
  };
};

export default useFoods; 