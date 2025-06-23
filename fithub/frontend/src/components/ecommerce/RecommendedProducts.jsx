import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Eye, ShoppingCart } from 'lucide-react';
import ProductCard from './ProductCard';
import Button from '../common/Button';
import useEcommerce from '../../hooks/useEcommerce';

const RecommendedProducts = ({ 
  userId,
  limit = 8,
  showBestProducts = true,
  showPersonalized = true,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('personalized');
  const [loading, setLoading] = useState(false);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  
  const { 
    getRecommendedProducts, 
    getBestProducts,
    recordProductClick,
    addToCart 
  } = useEcommerce();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const promises = [];
      
      if (showPersonalized) {
        promises.push(
          getRecommendedProducts(limit).then(data => {
            setPersonalizedProducts(data.results || data || []);
          })
        );
      }
      
      if (showBestProducts) {
        promises.push(
          getBestProducts(limit).then(data => {
            setBestProducts(data.results || data || []);
          })
        );
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('추천 상품 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product) => {
    try {
      // 클릭 기록 (추천 시스템 개선용)
      await recordProductClick(product.id);
    } catch (error) {
      console.error('상품 클릭 기록 실패:', error);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1);
      alert('장바구니에 추가되었습니다.');
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      alert('장바구니 추가에 실패했습니다.');
    }
  };

  const getCurrentProducts = () => {
    switch (activeTab) {
      case 'personalized':
        return personalizedProducts;
      case 'best':
        return bestProducts;
      default:
        return [];
    }
  };

  const tabs = [
    ...(showPersonalized ? [{
      id: 'personalized',
      label: '맞춤 추천',
      icon: Sparkles,
      description: '회원님을 위한 맞춤 상품'
    }] : []),
    ...(showBestProducts ? [{
      id: 'best',
      label: '베스트 상품',
      icon: TrendingUp,
      description: '인기 있는 상품들'
    }] : [])
  ];

  if (!showPersonalized && !showBestProducts) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        {/* 헤더 & 탭 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              추천 상품
            </h2>
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
          
          {tabs.length > 1 && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 로딩 상태 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 상품 목록 */}
            {getCurrentProducts().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {getCurrentProducts().map((product) => (
                  <div key={product.id} className="group">
                    <ProductCard
                      product={product}
                      onView={() => handleProductClick(product)}
                      onAddToCart={() => handleAddToCart(product)}
                      showQuickActions={true}
                      className="h-full"
                    />
                    
                    {/* 추천 라벨 */}
                    {activeTab === 'personalized' && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                        <Sparkles className="w-3 h-3" />
                        <span>맞춤 추천</span>
                      </div>
                    )}
                    
                    {activeTab === 'best' && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>베스트 상품</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {activeTab === 'personalized' ? (
                    <Sparkles className="w-16 h-16 mx-auto" />
                  ) : (
                    <TrendingUp className="w-16 h-16 mx-auto" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'personalized' 
                    ? '추천 상품이 없습니다'
                    : '베스트 상품이 없습니다'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'personalized' 
                    ? '더 많은 상품을 둘러보시면 맞춤 추천을 받을 수 있습니다.'
                    : '곧 인기 상품들을 만나보실 수 있습니다.'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={loadRecommendations}
                  className="mx-auto"
                >
                  다시 로드
                </Button>
              </div>
            )}

            {/* 더보기 버튼 */}
            {getCurrentProducts().length > 0 && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    // 전체 상품 페이지로 이동 로직
                    const category = activeTab === 'best' ? 'best' : 'recommended';
                    window.location.href = `/ecommerce?category=${category}`;
                  }}
                  className="mx-auto"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  더 많은 {activeTab === 'personalized' ? '추천 상품' : '베스트 상품'} 보기
                </Button>
              </div>
            )}
          </>
        )}

        {/* 추천 알고리즘 설명 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {activeTab === 'personalized' ? '맞춤 추천 기준' : '베스트 상품 기준'}
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {activeTab === 'personalized' ? (
              <>
                <li>• 회원님의 구매 이력과 관심 상품을 분석합니다</li>
                <li>• 비슷한 취향의 다른 회원들이 구매한 상품을 추천합니다</li>
                <li>• 최근 본 상품과 관련된 상품들을 제안합니다</li>
              </>
            ) : (
              <>
                <li>• 판매량과 리뷰 평점을 종합 분석합니다</li>
                <li>• 최근 인기 트렌드를 반영합니다</li>
                <li>• 재구매율이 높은 상품들을 우선 선별합니다</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts; 