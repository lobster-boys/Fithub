import React, { useState, useCallback, useEffect } from 'react';
import { useFoods } from '../../../hooks/diet/useFoods';
import BaseModal from './BaseModal';

/**
 * 음식 검색 모달 컴포넌트
 */
const FoodSearchModal = ({
  isOpen,
  onClose,
  onSelectFood,
  multiSelect = false,
  selectedFoods = [],
  excludeIds = []
}) => {
  const {
    foods,
    categories,
    loading,
    error,
    searchFoods,
    fetchCategories,
    getFoodsByCategory,
    clearError
  } = useFoods();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 카테고리 로드
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen, categories.length, fetchCategories]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedCategory('');
      setSearchResults([]);
      setIsSearching(false);
      clearError();
    }
  }, [isOpen, clearError]);

  // 검색 실행
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && !selectedCategory) return;

    setIsSearching(true);
    try {
      let results;
      if (searchQuery.trim()) {
        const response = await searchFoods(searchQuery.trim(), {
          category: selectedCategory || undefined
        });
        results = response.data;
      } else if (selectedCategory) {
        const response = await getFoodsByCategory(selectedCategory);
        results = response.data;
      }

      // 제외할 음식들 필터링
      const filteredResults = results.filter(food => 
        !excludeIds.includes(food.id)
      );

      setSearchResults(filteredResults);
    } catch (err) {
      console.error('음식 검색 실패:', err);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedCategory, excludeIds]);

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else if (searchQuery.trim().length === 0 && selectedCategory) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  // 카테고리 변경 시 검색
  useEffect(() => {
    if (selectedCategory) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [selectedCategory]);

  // 음식 선택 처리
  const handleFoodSelect = (food) => {
    if (multiSelect) {
      const isSelected = selectedFoods.some(f => f.id === food.id);
      if (isSelected) {
        onSelectFood(selectedFoods.filter(f => f.id !== food.id));
      } else {
        onSelectFood([...selectedFoods, food]);
      }
    } else {
      onSelectFood(food);
      onClose();
    }
  };

  // 음식이 선택되었는지 확인
  const isFoodSelected = (food) => {
    return selectedFoods.some(f => f.id === food.id);
  };

  // 선택된 음식들 적용 (다중 선택 모드)
  const handleApplySelection = () => {
    onClose();
  };

  const renderSearchResults = () => {
    if (isSearching || loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">검색 중...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <i className="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleSearch}
            className="mt-3 text-primary hover:text-orange-600"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (searchResults.length === 0 && (searchQuery.trim() || selectedCategory)) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="fas fa-search text-2xl"></i>
          </div>
          <p className="text-gray-600">검색 결과가 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {searchResults.map((food) => (
          <div
            key={food.id}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all
              ${isFoodSelected(food) 
                ? 'border-primary bg-orange-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handleFoodSelect(food)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{food.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{food.category}</p>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="font-medium text-primary">
                    {Math.round(food.calories)}kcal
                  </span>
                  <span>단백질 {Math.round(food.protein)}g</span>
                  <span>탄수화물 {Math.round(food.carbs)}g</span>
                  <span>지방 {Math.round(food.fat)}g</span>
                </div>
                
                {food.serving_size && (
                  <p className="text-xs text-gray-400 mt-1">
                    기준량: {food.serving_size}
                  </p>
                )}
              </div>
              
              {multiSelect && isFoodSelected(food) && (
                <div className="text-primary">
                  <i className="fas fa-check-circle"></i>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center">
          <i className="fas fa-search w-6 h-6 mr-2 text-primary"></i>
          음식 검색
        </span>
      }
      subtitle={multiSelect ? "여러 음식을 선택할 수 있습니다" : "음식을 선택하세요"}
      size="large"
    >
      {/* 검색 영역 */}
      <div className="p-6 border-b border-gray-200">
        <div className="space-y-4">
          {/* 검색어 입력 */}
          <div className="relative">
            <input
              type="text"
              placeholder="음식 이름을 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">전체 카테고리</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {multiSelect && selectedFoods.length > 0 && (
            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
              <span className="text-sm text-gray-700">
                {selectedFoods.length}개 음식 선택됨
              </span>
              <button
                onClick={() => onSelectFood([])}
                className="text-sm text-red-600 hover:text-red-700"
              >
                모두 해제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderSearchResults()}
      </div>

      {/* 다중 선택 모드 하단 버튼 */}
      {multiSelect && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              취소
            </button>
            <button
              onClick={handleApplySelection}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
              disabled={selectedFoods.length === 0}
            >
              선택 완료 ({selectedFoods.length})
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default FoodSearchModal; 