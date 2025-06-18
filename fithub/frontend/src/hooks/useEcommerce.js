import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosConfig';

const useEcommerce = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // ========== API 기반 함수들 ==========

  // 전체 상품 목록 가져오기
  const getAllProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/ecommerce/products/', { params });
      const productsData = response.data.results || response.data;
      setProducts(productsData);
      return productsData;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('상품을 불러오는데 실패했습니다.');
      // 백엔드 미지원 시 빈 배열 반환
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 카테고리 목록 가져오기
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/ecommerce/categories/');
      const categoriesData = response.data.results || response.data;
      
      // "전체" 카테고리 추가
      const categoriesWithAll = [
        { id: 'all', name: '전체 상품' },
        ...categoriesData
      ];
      
      setCategories(categoriesWithAll);
      return categoriesWithAll;
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // 백엔드 미지원 시 기본 카테고리만 반환
      const defaultCategories = [
        { id: 'all', name: '전체 상품' },
        { id: 'equipment', name: '운동 기구' },
        { id: 'nutrition', name: '영양 보충제' },
        { id: 'accessories', name: '악세서리' }
      ];
      setCategories(defaultCategories);
      return defaultCategories;
    }
  }, []);

  // 카테고리별 상품 필터링
  const getProductsByCategory = useCallback(async (categoryId) => {
    if (categoryId === 'all') {
      return getAllProducts();
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/ecommerce/products/', {
        params: { category: categoryId }
      });
      const productsData = response.data.results || response.data;
      setProducts(productsData);
      return productsData;
    } catch (err) {
      console.error('Failed to fetch products by category:', err);
      setError('카테고리별 상품을 불러오는데 실패했습니다.');
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getAllProducts]);

  // 상품 ID로 특정 상품 가져오기
  const getProductById = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/ecommerce/products/${productId}/`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch product by ID:', err);
      setError('상품 정보를 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 상품 검색
  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) {
      return getAllProducts();
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/ecommerce/products/', {
        params: { search: query }
      });
      const productsData = response.data.results || response.data;
      setProducts(productsData);
      return productsData;
    } catch (err) {
      console.error('Failed to search products:', err);
      setError('상품 검색에 실패했습니다.');
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getAllProducts]);

  // 가격 범위로 상품 필터링
  const getProductsByPriceRange = useCallback(async (minPrice, maxPrice) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/ecommerce/products/', {
        params: { 
          min_price: minPrice,
          max_price: maxPrice 
        }
      });
      const productsData = response.data.results || response.data;
      setProducts(productsData);
      return productsData;
    } catch (err) {
      console.error('Failed to fetch products by price range:', err);
      setError('가격대별 상품을 불러오는데 실패했습니다.');
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 베스트셀러 상품 가져오기
  const getBestsellerProducts = useCallback(async (limit = 8) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/ecommerce/products/', {
        params: { 
          is_bestseller: true,
          limit: limit
        }
      });
      const productsData = response.data.results || response.data;
      return productsData;
    } catch (err) {
      console.error('Failed to fetch bestseller products:', err);
      // 백엔드 미지원 시 현재 상품에서 필터링
      return products.filter(product => product.is_bestseller).slice(0, limit);
    } finally {
      setLoading(false);
    }
  }, [products]);

  // 높은 평점 상품 가져오기
  const getHighRatedProducts = useCallback(async (minRating = 4.5, limit = 8) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/ecommerce/products/', {
        params: { 
          min_rating: minRating,
          limit: limit
        }
      });
      const productsData = response.data.results || response.data;
      return productsData;
    } catch (err) {
      console.error('Failed to fetch high rated products:', err);
      // 백엔드 미지원 시 현재 상품에서 필터링
      return products.filter(product => (product.rating || 0) >= minRating).slice(0, limit);
    } finally {
      setLoading(false);
    }
  }, [products]);

  // ========== 장바구니 관련 함수들 ==========

  // 장바구니 가져오기
  const getMyCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/ecommerce/carts/');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('장바구니를 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 장바구니에 상품 추가
  const addToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/ecommerce/carts/', {
        product: productId,
        quantity: quantity
      });
      return response.data;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setError('장바구니에 추가하는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 장바구니에서 상품 제거
  const removeFromCart = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/ecommerce/carts/${itemId}/`);
      return true;
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setError('장바구니에서 제거하는데 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== 리뷰 관련 함수들 ==========

  // 상품 리뷰 가져오기
  const getProductReviews = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/ecommerce/products/${productId}/reviews/`);
      return response.data.results || response.data;
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('리뷰를 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 리뷰 작성
  const createReview = useCallback(async (reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/ecommerce/reviews/', reviewData);
      return response.data;
    } catch (err) {
      console.error('Failed to create review:', err);
      setError('리뷰 작성에 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== 로컬 유틸리티 함수들 ==========

  // 추천 상품 가져오기 (현재 로드된 상품들 기준)
  const getRecommendedProducts = useCallback((type = 'popular', limit = 4) => {
    if (!products.length) return [];

    let recommendedProducts = [...products];

    switch (type) {
      case 'bestseller':
        recommendedProducts = recommendedProducts.filter(product => product.is_bestseller);
        break;
      case 'high_rated':
        recommendedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        // popularity 필드가 있으면 사용, 없으면 평점 기준
        recommendedProducts.sort((a, b) => (b.popularity || b.rating || 0) - (a.popularity || a.rating || 0));
        break;
      default:
        // 기본적으로 ID 순으로 정렬 (최신순 가정)
        recommendedProducts.sort((a, b) => b.id - a.id);
    }

    return recommendedProducts.slice(0, limit);
  }, [products]);

  // 관련 상품 가져오기 (API 우선, 로컬 fallback)
  const getRelatedProducts = useCallback(async (productId, limit = 4) => {
    try {
      // 먼저 API에서 관련 상품 시도
      const response = await axiosInstance.get(`/ecommerce/products/${productId}/related/`, {
        params: { limit }
      });
      return response.data.results || response.data;
    } catch (err) {
      console.error('Failed to fetch related products from API:', err);
      
      // API 실패 시 로컬 데이터로 fallback
      if (!products.length) return [];

      const currentProduct = products.find(product => product.id === parseInt(productId));
      if (!currentProduct) return [];

      // 같은 카테고리의 다른 상품들
      const relatedProducts = products
        .filter(product => 
          product.id !== parseInt(productId) && 
          product.category === currentProduct.category
        )
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);

      return relatedProducts;
    }
  }, [products]);

  // 홈페이지 추천 상품 가져오기
  const getHomePageRecommendations = useCallback((limit = 4) => {
    if (!products.length) return [];

    // 베스트셀러와 높은 평점 상품들을 우선으로 추천
    const recommendedProducts = products
      .filter(product => product.is_bestseller || (product.rating || 0) >= 4.5)
      .sort((a, b) => {
        // 베스트셀러 우선, 그 다음 평점 순
        if (a.is_bestseller && !b.is_bestseller) return -1;
        if (!a.is_bestseller && b.is_bestseller) return 1;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, limit);

    // 추천 상품이 충분하지 않으면 일반 상품으로 채우기
    if (recommendedProducts.length < limit) {
      const remainingProducts = products
        .filter(product => !recommendedProducts.includes(product))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit - recommendedProducts.length);
      
      recommendedProducts.push(...remainingProducts);
    }

    return recommendedProducts;
  }, [products]);

  // 카테고리 가져오기
  const getCategories = useCallback(() => {
    return categories;
  }, [categories]);

  // 평점별 상품 필터링
  const getProductsByRating = useCallback((minRating) => {
    return products.filter(product => (product.rating || 0) >= minRating);
  }, [products]);

  // 가격 정보 포맷팅
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  }, []);

  // 할인 가격 계산
  const calculateDiscountedPrice = useCallback((price, discount) => {
    if (!discount) return price;
    return Math.floor(price * (100 - discount) / 100);
  }, []);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 카테고리와 상품을 병렬로 로드
        await Promise.all([
          fetchCategories(),
          getAllProducts()
        ]);
      } catch (err) {
        console.error('Failed to initialize ecommerce data:', err);
      }
    };

    initializeData();
  }, [getAllProducts, fetchCategories]);

  return {
    // 상태
    products,
    categories,
    loading,
    error,
    activeCategory,
    setActiveCategory,

    // 상품 API 함수들
    getAllProducts,
    getProductsByCategory,
    getProductById,
    searchProducts,
    getProductsByPriceRange,
    getBestsellerProducts,
    getHighRatedProducts,

    // 장바구니 함수들
    getMyCart,
    addToCart,
    removeFromCart,

    // 리뷰 함수들
    getProductReviews,
    createReview,

    // 유틸리티 함수들
    getRecommendedProducts,
    getRelatedProducts,
    getHomePageRecommendations,
    getCategories,
    getProductsByRating,
    formatPrice,
    calculateDiscountedPrice,
  };
};

export default useEcommerce; 