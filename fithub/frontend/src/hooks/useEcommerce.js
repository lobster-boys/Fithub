import { useState, useEffect, useMemo } from 'react';
import * as ecommerceAPI from '../api/ecommerceAPI';

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

const useEcommerce = () => {
  const [products, setProducts] = useState(PRODUCTS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // ========== API 기반 함수들 ==========

  // 전체 상품 목록 가져오기
  const getAllProducts = async (params = {}) => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.getProducts(params);
      setProducts(data.results || data);
      return data;
    } catch (err) {
      setError(err);
      // API 실패 시 더미 데이터 반환
      return products;
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별 상품 필터링
  const getProductsByCategory = async (categoryId) => {
    if (categoryId === 'all') {
      return getAllProducts();
    }
    
    setLoading(true);
    try {
      const data = await ecommerceAPI.getProductsByCategory(categoryId);
      return data;
    } catch (err) {
      setError(err);
      // API 실패 시 로컬 필터링
      return products.filter(product => product.category === categoryId);
    } finally {
      setLoading(false);
    }
  };

  // 상품 ID로 특정 상품 가져오기
  const getProductById = async (productId) => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.getProduct(productId);
      return data;
    } catch (err) {
      setError(err);
      // API 실패 시 로컬 검색
      return products.find(product => product.id === parseInt(productId));
    } finally {
      setLoading(false);
    }
  };

  // 상품 검색
  const searchProducts = async (query) => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.searchProducts(query);
      return data;
    } catch (err) {
      setError(err);
      // API 실패 시 로컬 검색
      return products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } finally {
      setLoading(false);
    }
  };

  // 가격 범위로 상품 필터링
  const getProductsByPriceRange = async (minPrice, maxPrice) => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.getProductsByPriceRange(minPrice, maxPrice);
      return data;
    } catch (err) {
      setError(err);
      // API 실패 시 로컬 필터링
      return products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      );
    } finally {
      setLoading(false);
    }
  };

  // ========== 로컬 유틸리티 함수들 ==========

  // 추천 상품 가져오기 (로컬 로직)
  const getRecommendedProducts = (type = 'popular', limit = 4) => {
    let recommendedProducts = [...products];

    switch (type) {
      case 'popular':
        recommendedProducts.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'bestseller':
        recommendedProducts = recommendedProducts.filter(product => product.isBestseller);
        break;
      case 'discount':
        recommendedProducts = recommendedProducts.filter(product => product.discount > 0)
          .sort((a, b) => b.discount - a.discount);
        break;
      case 'high_rated':
        recommendedProducts.sort((a, b) => b.rating - a.rating);
        break;
      default:
        recommendedProducts.sort((a, b) => b.popularity - a.popularity);
    }

    return recommendedProducts.slice(0, limit);
  };

  // 홈페이지 추천 상품
  const getHomePageRecommendations = (limit = 4) => {
    return getRecommendedProducts('popular', limit);
  };

  // 관련 상품 가져오기
  const getRelatedProducts = (productId, limit = 4) => {
    const currentProduct = products.find(p => p.id === parseInt(productId));
    if (!currentProduct) return [];

    return products
      .filter(product => 
        product.id !== parseInt(productId) && 
        product.category === currentProduct.category
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  };

  // 평점별 상품 필터링
  const getProductsByRating = (minRating) => {
    return products.filter(product => product.rating >= minRating);
  };

  // 카테고리 목록 가져오기
  const getCategories = () => {
    return CATEGORIES;
  };

  // ========== 장바구니 관련 함수들 ==========

  // 내 장바구니 조회
  const getMyCart = async () => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.getMyCart();
      return data;
    } catch (err) {
      setError(err);
      return { items: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  // 장바구니에 상품 추가
  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.addToCart(productId, quantity);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 장바구니에서 상품 제거
  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.removeFromCart(itemId);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== 리뷰 관련 함수들 ==========

  // 상품 리뷰 조회
  const getProductReviews = async (productId) => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.getProductReviews(productId);
      return data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 리뷰 생성
  const createReview = async (reviewData) => {
    setLoading(true);
    try {
      const data = await ecommerceAPI.createReview(reviewData);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // 상태
    products,
    loading,
    error,
    activeCategory,
    setActiveCategory,

    // API 기반 함수들
    getAllProducts,
    getProductsByCategory,
    getProductById,
    searchProducts,
    getProductsByPriceRange,

    // 로컬 유틸리티 함수들
    getRecommendedProducts,
    getHomePageRecommendations,
    getRelatedProducts,
    getProductsByRating,
    getCategories,

    // 장바구니 관련
    getMyCart,
    addToCart,
    removeFromCart,

    // 리뷰 관련
    getProductReviews,
    createReview
  };
};

export default useEcommerce; 