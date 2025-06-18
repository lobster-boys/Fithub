import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCardList from '../../components/ecommerce/ProductCardList';
import useEcommerce from '../../hooks/useEcommerce';

const EcommercePage = () => {
  // 이커머스 훅 사용
  const { 
    products,
    categories,
    loading,
    error,
    activeCategory, 
    setActiveCategory,
    getProductsByCategory,
    searchProducts,
    getBestsellerProducts,
    getHighRatedProducts,
    getProductsByPriceRange,
    formatPrice
  } = useEcommerce();

  // 지역 상태
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 검색 처리
  const handleSearch = async (query) => {
    if (!query.trim()) {
      // 검색어가 비어있으면 현재 카테고리의 상품들을 다시 로드
      const result = await getProductsByCategory(activeCategory);
      setFilteredProducts(result);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchProducts(query);
      setFilteredProducts(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 입력 변경 처리
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // 검색어가 비어있으면 즉시 처리
    if (!query.trim()) {
      handleSearch('');
    }
  };

  // 검색 제출 처리
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // 카테고리 변경 시 상품 필터링
  useEffect(() => {
    if (activeCategory) {
      getProductsByCategory(activeCategory).then(result => {
        setFilteredProducts(result);
        setSearchQuery(''); // 카테고리 변경 시 검색어 초기화
      });
    }
  }, [activeCategory, getProductsByCategory]);

  // 초기 로드 시 전체 상품 표시
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // 정렬 처리
  const applySorting = (productList, sortType) => {
    const sortedProducts = [...productList];
    
    switch (sortType) {
      case 'price_low':
        return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_high':
        return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popularity':
        return sortedProducts.sort((a, b) => (b.popularity || b.rating || 0) - (a.popularity || a.rating || 0));
      case 'name':
        return sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default:
        return sortedProducts.sort((a, b) => b.id - a.id); // 최신순
    }
  };

  // 정렬된 상품 목록
  const sortedProducts = applySorting(filteredProducts, sortBy);

  // 가격 범위 필터 적용
  const handlePriceFilter = async () => {
    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || 999999;
    
    if (min > max) {
      alert('최소 가격이 최대 가격보다 클 수 없습니다.');
      return;
    }

    try {
      const results = await getProductsByPriceRange(min, max);
      setFilteredProducts(results);
    } catch (err) {
      console.error('Price filter failed:', err);
    }
  };

  // 베스트셀러 상품 보기
  const handleShowBestsellers = async () => {
    try {
      const results = await getBestsellerProducts();
      setFilteredProducts(results);
      setActiveCategory('bestseller');
    } catch (err) {
      console.error('Failed to load bestsellers:', err);
    }
  };

  // 로딩 상태 표시
  if (loading && !products.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">상품을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center bg-red-50 p-8 rounded-lg">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h2 className="text-xl font-bold text-red-800 mb-2">오류 발생</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">FitHub 스토어</h1>
        <p className="text-gray-600">건강한 생활을 위한 최고의 피트니스 제품을 만나보세요.</p>
      </div>

      {/* 프로모션 배너 */}
      <div className="bg-gradient-to-r from-orange-400 to-primary rounded-xl p-6 mb-8 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">🔥 여름 맞이 특별 할인</h2>
            <p className="mb-4 text-lg">모든 운동 기구 최대 20% 할인 혜택을 놓치지 마세요!</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={handleShowBestsellers}
                className="bg-white text-primary font-medium px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🏆 베스트셀러 보기
              </button>
              <button 
                onClick={() => getHighRatedProducts().then(setFilteredProducts)}
                className="bg-white/20 text-white font-medium px-6 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                ⭐ 높은 평점 상품
              </button>
            </div>
          </div>
          <div className="mt-4 lg:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1579758629938-03607ccdbaba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
              alt="Promotion" 
              className="w-48 h-32 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* 검색 및 필터 섹션 */}
      <div className="mb-6">
        {/* 검색바 */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="상품명, 카테고리 등으로 검색..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              검색
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-filter mr-2"></i>
              필터
            </button>
          </div>
        </form>

        {/* 필터 옵션 */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 가격 범위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">가격 범위</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="최소"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <span className="self-center text-gray-500">~</span>
                  <input
                    type="number"
                    placeholder="최대"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <button
                  onClick={handlePriceFilter}
                  className="mt-2 w-full px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-orange-600 transition-colors"
                >
                  적용
                </button>
              </div>

              {/* 정렬 옵션 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="default">기본순</option>
                  <option value="popularity">인기순</option>
                  <option value="price_low">가격 낮은순</option>
                  <option value="price_high">가격 높은순</option>
                  <option value="rating">평점순</option>
                  <option value="name">이름순</option>
                </select>
              </div>

              {/* 퀵 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">빠른 필터</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleShowBestsellers}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
                  >
                    베스트셀러
                  </button>
                  <button
                    onClick={() => getHighRatedProducts().then(setFilteredProducts)}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    높은 평점
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 카테고리 탭 */}
        <div className="flex overflow-x-auto pb-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full mr-2 transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 결과 정보 */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-600">
            {searchQuery ? (
              <span>'{searchQuery}' 검색 결과: <strong>{sortedProducts.length}개</strong></span>
            ) : (
              <span>총 <strong>{sortedProducts.length}개</strong>의 상품</span>
            )}
          </div>
          
          {/* 검색 결과 초기화 */}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                handleSearch('');
              }}
              className="text-primary hover:text-orange-600 text-sm"
            >
              <i className="fas fa-times mr-1"></i>
              검색 초기화
            </button>
          )}
        </div>
      </div>

      {/* 상품 그리드 */}
      <ProductCardList 
        products={sortedProducts} 
        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        emptyMessage={
          searchQuery ? (
            <div className="text-center py-16">
              <i className="fas fa-search text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                다른 검색어를 시도해보세요
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleSearch('');
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                전체 상품 보기
              </button>
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-box-open text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {categories.find(c => c.id === activeCategory)?.name || '현재 카테고리'}에 상품이 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                다른 카테고리를 확인해보세요
              </p>
              <button
                onClick={() => setActiveCategory('all')}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                전체 상품 보기
              </button>
            </div>
          )
        }
      />

      {/* 로딩 오버레이 */}
      {(loading || isSearching) && sortedProducts.length > 0 && (
        <div className="fixed top-0 left-0 right-0 bg-primary bg-opacity-10 p-2 z-50">
          <div className="container mx-auto flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            <span className="text-primary font-medium">
              {isSearching ? '검색 중...' : '상품을 불러오는 중...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcommercePage; 