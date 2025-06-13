import { useState, useEffect, useMemo } from 'react';

// 상품 데이터 (실제 환경에서는 API에서 가져올 데이터)
const PRODUCTS_DATA = [
  {
    id: 1,
    name: '프리미엄 요가 매트',
    category: 'equipment',
    price: 39000,
    discount: 10,
    rating: 4.8,
    reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1599447292461-38fb53fb0fee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    isBestseller: true,
    tags: ['yoga', 'beginner', 'home'],
    description: '고품질 TPE 소재로 제작된 친환경 요가 매트',
    popularity: 95
  },
  {
    id: 2,
    name: '조절식 덤벨 세트',
    category: 'equipment',
    price: 150000,
    discount: 0,
    rating: 4.9,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1638536532686-d610adba8c7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    isBestseller: true,
    tags: ['strength', 'advanced', 'home'],
    description: '2.5kg부터 24kg까지 조절 가능한 스마트 덤벨',
    popularity: 88
  },
  {
    id: 3,
    name: '운동용 저항 밴드 세트',
    category: 'equipment',
    price: 25000,
    discount: 20,
    rating: 4.6,
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1598550480917-1c485268a92a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    isBestseller: false,
    tags: ['resistance', 'portable', 'beginner'],
    description: '5가지 강도의 저항 밴드로 구성된 완벽한 세트',
    popularity: 92
  },
  {
    id: 4,
    name: '프로틴 쉐이커 보틀',
    category: 'accessories',
    price: 15000,
    discount: 0,
    rating: 4.5,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
    isBestseller: false,
    tags: ['nutrition', 'portable', 'essential'],
    description: 'BPA-free 소재의 프리미엄 쉐이커 보틀',
    popularity: 75
  },
  {
    id: 5,
    name: '프리미엄 웨이트 프로틴',
    category: 'nutrition',
    price: 59000,
    discount: 5,
    rating: 4.7,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c1b933c0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    isBestseller: true,
    tags: ['protein', 'muscle', 'nutrition'],
    description: '고품질 WPI 단백질로 제작된 프리미엄 프로틴',
    popularity: 90
  },
  {
    id: 6,
    name: '스포츠 손목 밴드',
    category: 'accessories',
    price: 12000,
    discount: 0,
    rating: 4.3,
    reviewCount: 68,
    image: 'https://images.unsplash.com/photo-1531917115039-473db54f8482?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    isBestseller: false,
    tags: ['support', 'accessories', 'comfort'],
    description: '운동 중 손목을 보호하는 편안한 밴드',
    popularity: 65
  },
  {
    id: 7,
    name: '폼 롤러',
    category: 'equipment',
    price: 35000,
    discount: 15,
    rating: 4.6,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    isBestseller: false,
    tags: ['recovery', 'massage', 'flexibility'],
    description: '근육 회복과 마사지를 위한 고밀도 폼 롤러',
    popularity: 78
  },
  {
    id: 8,
    name: 'BCAA 아미노산',
    category: 'nutrition',
    price: 45000,
    discount: 10,
    rating: 4.4,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
    isBestseller: false,
    tags: ['amino', 'recovery', 'endurance'],
    description: '운동 전후 근육 회복을 돕는 필수 아미노산',
    popularity: 82
  }
];

// 카테고리 정보
const CATEGORIES = [
  { id: 'all', name: '전체 상품' },
  { id: 'equipment', name: '운동 기구' },
  { id: 'nutrition', name: '영양 보충제' },
  { id: 'accessories', name: '악세서리' }
];

// 추천 알고리즘 타입
const RECOMMENDATION_TYPES = {
  POPULAR: 'popular',           // 인기 상품
  BESTSELLER: 'bestseller',     // 베스트셀러
  DISCOUNT: 'discount',         // 할인 상품
  HIGH_RATED: 'high_rated',     // 높은 평점
  CATEGORY_BASED: 'category_based', // 카테고리 기반
  USER_BASED: 'user_based'      // 사용자 기반 (향후 구현)
};

const useEcommerce = () => {
  const [products, setProducts] = useState(PRODUCTS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // 전체 상품 목록 가져오기
  const getAllProducts = () => {
    return products;
  };

  // 카테고리별 상품 필터링
  const getProductsByCategory = (categoryId) => {
    if (categoryId === 'all') {
      return products;
    }
    return products.filter(product => product.category === categoryId);
  };

  // 상품 ID로 특정 상품 가져오기
  const getProductById = (productId) => {
    return products.find(product => product.id === parseInt(productId));
  };

  // 추천 상품 가져오기
  const getRecommendedProducts = (type = RECOMMENDATION_TYPES.POPULAR, limit = 4, options = {}) => {
    let recommendedProducts = [...products];

    switch (type) {
      case RECOMMENDATION_TYPES.POPULAR:
        // 인기도 기준 정렬
        recommendedProducts = recommendedProducts.sort((a, b) => b.popularity - a.popularity);
        break;

      case RECOMMENDATION_TYPES.BESTSELLER:
        // 베스트셀러만 필터링 후 인기도 정렬
        recommendedProducts = recommendedProducts
          .filter(product => product.isBestseller)
          .sort((a, b) => b.popularity - a.popularity);
        break;

      case RECOMMENDATION_TYPES.DISCOUNT:
        // 할인 상품만 필터링 후 할인율 정렬
        recommendedProducts = recommendedProducts
          .filter(product => product.discount > 0)
          .sort((a, b) => b.discount - a.discount);
        break;

      case RECOMMENDATION_TYPES.HIGH_RATED:
        // 평점 4.5 이상 상품을 평점 순으로 정렬
        recommendedProducts = recommendedProducts
          .filter(product => product.rating >= 4.5)
          .sort((a, b) => b.rating - a.rating);
        break;

      case RECOMMENDATION_TYPES.CATEGORY_BASED:
        // 특정 카테고리 기반 추천
        const { category } = options;
        if (category && category !== 'all') {
          recommendedProducts = recommendedProducts
            .filter(product => product.category === category)
            .sort((a, b) => b.popularity - a.popularity);
        }
        break;

      case RECOMMENDATION_TYPES.USER_BASED:
        // 사용자 기반 추천 (향후 구현 - 현재는 인기도 기준)
        const { userPreferences } = options;
        if (userPreferences && userPreferences.length > 0) {
          recommendedProducts = recommendedProducts
            .filter(product => 
              product.tags.some(tag => userPreferences.includes(tag))
            )
            .sort((a, b) => b.popularity - a.popularity);
        } else {
          recommendedProducts = recommendedProducts.sort((a, b) => b.popularity - a.popularity);
        }
        break;

      default:
        recommendedProducts = recommendedProducts.sort((a, b) => b.popularity - a.popularity);
    }

    return recommendedProducts.slice(0, limit);
  };

  // 홈페이지용 추천 상품 (베스트셀러 + 인기 상품 조합)
  const getHomePageRecommendations = (limit = 4) => {
    const bestsellers = getRecommendedProducts(RECOMMENDATION_TYPES.BESTSELLER, 2);
    const popular = getRecommendedProducts(RECOMMENDATION_TYPES.POPULAR, limit - bestsellers.length)
      .filter(product => !bestsellers.find(bs => bs.id === product.id));
    
    return [...bestsellers, ...popular].slice(0, limit);
  };

  // 관련 상품 추천 (특정 상품과 같은 카테고리의 다른 상품)
  const getRelatedProducts = (productId, limit = 4) => {
    const currentProduct = getProductById(productId);
    if (!currentProduct) return [];

    return products
      .filter(product => 
        product.id !== currentProduct.id && 
        product.category === currentProduct.category
      )
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  };

  // 검색 기능
  const searchProducts = (query) => {
    if (!query.trim()) return products;

    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  // 가격 범위로 필터링
  const getProductsByPriceRange = (minPrice, maxPrice) => {
    return products.filter(product => {
      const finalPrice = product.discount > 0 
        ? product.price * (1 - product.discount / 100)
        : product.price;
      return finalPrice >= minPrice && finalPrice <= maxPrice;
    });
  };

  // 평점으로 필터링
  const getProductsByRating = (minRating) => {
    return products.filter(product => product.rating >= minRating);
  };

  // 카테고리 목록 가져오기
  const getCategories = () => {
    return CATEGORIES;
  };

  // 추천 타입 상수 반환
  const getRecommendationTypes = () => {
    return RECOMMENDATION_TYPES;
  };

  // 상품 통계 정보
  const getProductStats = useMemo(() => {
    return {
      totalProducts: products.length,
      totalCategories: CATEGORIES.length - 1, // 'all' 제외
      bestsellersCount: products.filter(p => p.isBestseller).length,
      discountedCount: products.filter(p => p.discount > 0).length,
      averageRating: (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1),
      averagePrice: Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
    };
  }, [products]);

  return {
    // 상태
    products,
    loading,
    error,
    activeCategory,
    setActiveCategory,

    // 기본 조회 함수
    getAllProducts,
    getProductsByCategory,
    getProductById,
    getCategories,

    // 추천 시스템
    getRecommendedProducts,
    getHomePageRecommendations,
    getRelatedProducts,
    getRecommendationTypes,

    // 검색 및 필터링
    searchProducts,
    getProductsByPriceRange,
    getProductsByRating,

    // 통계
    getProductStats,

    // 상수
    RECOMMENDATION_TYPES
  };
};

export default useEcommerce; 