import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosConfig';
import * as ecommerceAPI from '../api/ecommerceAPI';

const useEcommerce = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'all', name: '전체 상품' },
    { id: 'equipment', name: '운동 기구' },
    { id: 'supplements', name: '보충제/영양제' },
    { id: 'seafood', name: '생선/해산물' },
    { id: 'meat', name: '고기/육류' },
    { id: 'vegetables', name: '채소/과일' },
    { id: 'dairy', name: '유제품' },
    { id: 'grains', name: '곡물/견과류' },
    { id: 'beverages', name: '음료/차' },
    { id: 'snacks', name: '건강간식' },
    { id: 'apparel', name: '운동복' },
    { id: 'accessories', name: '운동용품' }
  ]);
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
      
      // API에서 카테고리를 성공적으로 받아온 경우에만 업데이트
      if (categoriesData && categoriesData.length > 0) {
        // "전체" 카테고리 추가
        const categoriesWithAll = [
          { id: 'all', name: '전체 상품' },
          ...categoriesData
        ];
        
        setCategories(categoriesWithAll);
        return categoriesWithAll;
      } else {
        // API에서 빈 데이터를 받은 경우 기존 카테고리 유지
        console.log('API에서 빈 카테고리 데이터를 받았습니다. 기존 카테고리를 유지합니다.');
        return categories;
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // API 요청 실패 시 기존 카테고리 유지 (초기 상태의 기본 카테고리들)
      console.log('카테고리 API 요청 실패. 기존 카테고리를 유지합니다.');
      return categories;
    }
  }, [categories]);

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
    // 임시로 빈 배열 반환 (리뷰 API가 구현되지 않았음)
    console.log(`리뷰 API가 구현되지 않아 빈 배열을 반환합니다. productId: ${productId}`);
    return [];
    
    /* 실제 API 구현 시 사용할 코드:
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
    */
  }, []);

  // 리뷰 작성
  const createReview = useCallback(async (reviewData) => {
    // 임시로 가짜 리뷰 데이터 반환 (리뷰 API가 구현되지 않았음)
    console.log('리뷰 API가 구현되지 않아 가짜 데이터를 반환합니다:', reviewData);
    
    // 가짜 리뷰 데이터 생성
    const fakeReview = {
      id: Date.now(),
      product: reviewData.product,
      rating: reviewData.rating,
      comment: reviewData.comment,
      user: {
        username: '사용자',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTIwIDEyQzE3Ljc5IDEyIDE2IDEzLjc5IDE2IDE2QzE2IDE4LjIxIDE3Ljc5IDIwIDIwIDIwQzIyLjIxIDIwIDI0IDE4LjIxIDI0IDE2QzI0IDEzLjc5IDIyLjIxIDEyIDIwIDEyWk0yMCAyOEMxNiAyOCAxMi44IDI5LjM0IDEwIDMxVjMzSDMwVjMxQzI3LjIgMjkuMzQgMjQgMjggMjAgMjhaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo='
      },
      created_at: new Date().toISOString(),
      is_verified_purchase: true
    };
    
    return fakeReview;

    /* 실제 API 구현 시 사용할 코드:
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
    */
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

  // 관련 상품 가져오기 (로컬 데이터 기반)
  const getRelatedProducts = useCallback(async (productId, limit = 4) => {
    console.log(`관련 상품을 로컬 데이터에서 가져옵니다. productId: ${productId}`);
    
    // 로컬 데이터로 관련 상품 생성
    if (!products.length) return [];

    const currentProduct = products.find(product => product.id === parseInt(productId));
    if (!currentProduct) return [];

    // 같은 카테고리의 다른 상품들
    const relatedProducts = products
      .filter(product => 
        product.id !== parseInt(productId) && 
        (product.category?.id === currentProduct.category?.id || 
         product.category === currentProduct.category)
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);

    // 같은 카테고리 상품이 충분하지 않으면 다른 상품들로 채우기
    if (relatedProducts.length < limit) {
      const otherProducts = products
        .filter(product => 
          product.id !== parseInt(productId) && 
          !relatedProducts.includes(product)
        )
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit - relatedProducts.length);
      
      relatedProducts.push(...otherProducts);
    }

    return relatedProducts;

    /* 실제 API 구현 시 사용할 코드:
    try {
      // 먼저 API에서 관련 상품 시도
      const response = await axiosInstance.get(`/ecommerce/products/${productId}/related/`, {
        params: { limit }
      });
      return response.data.results || response.data;
    } catch (err) {
      console.error('Failed to fetch related products from API:', err);
      // 위의 로컬 데이터 fallback 로직 사용
    }
    */
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
        // 상품만 로드 (카테고리는 이미 초기 상태에서 설정됨)
        await getAllProducts();
        // 필요시 카테고리 API도 시도해볼 수 있음
        // await fetchCategories();
      } catch (err) {
        console.error('Failed to initialize ecommerce data:', err);
      }
    };

    initializeData();
  }, [getAllProducts]);

  // ========== 새로 추가된 기능들 ==========

  // 쿠폰 관련 함수들
  const getCoupons = useCallback(async (params = {}) => {
    try {
      const response = await axiosInstance.get('/ecommerce/coupons/', { params });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      throw err;
    }
  }, []);

  const getMyCoupons = useCallback(async (params = {}) => {
    try {
      const response = await axiosInstance.get('/ecommerce/user-coupons/', { params });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch my coupons:', err);
      throw err;
    }
  }, []);

  const purchaseCouponWithPoints = useCallback(async (couponId, pointCost) => {
    try {
      const response = await axiosInstance.post('/ecommerce/user-coupons/', {
        coupon: couponId
      });
      return response.data;
    } catch (err) {
      console.error('Failed to purchase coupon with points:', err);
      throw err;
    }
  }, []);

  const useCoupon = useCallback(async (couponCode) => {
    try {
      const response = await axiosInstance.post('/ecommerce/coupons/use_coupon/', {
        coupon_code: couponCode
      });
      return response.data;
    } catch (err) {
      console.error('Failed to use coupon:', err);
      throw err;
    }
  }, []);

  // 리뷰 관련 함수들 (추가)
  const getReviews = useCallback(async (params = {}) => {
    try {
      const response = await axiosInstance.get('/ecommerce/reviews/', { params });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      throw err;
    }
  }, []);

  const getMyReviews = useCallback(async (params = {}) => {
    try {
      const response = await axiosInstance.get('/ecommerce/reviews/my_reviews/', { params });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch my reviews:', err);
      throw err;
    }
  }, []);

  const updateReview = useCallback(async (reviewId, reviewData) => {
    try {
      const response = await axiosInstance.put(`/ecommerce/reviews/${reviewId}/`, reviewData);
      return response.data;
    } catch (err) {
      console.error('Failed to update review:', err);
      throw err;
    }
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      const response = await axiosInstance.delete(`/ecommerce/reviews/${reviewId}/`);
      return response.data;
    } catch (err) {
      console.error('Failed to delete review:', err);
      throw err;
    }
  }, []);

  const getProductReviewStats = useCallback(async (productId) => {
    try {
      const response = await axiosInstance.get(`/ecommerce/reviews/product/${productId}/stats/`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch product review stats:', err);
      throw err;
    }
  }, []);

  // 배송지 관련 함수들
  const getShippingAddresses = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/ecommerce/shipping-addresses/');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch shipping addresses:', err);
      throw err;
    }
  }, []);

  const createShippingAddress = useCallback(async (addressData) => {
    try {
      const response = await axiosInstance.post('/ecommerce/shipping-addresses/', addressData);
      return response.data;
    } catch (err) {
      console.error('Failed to create shipping address:', err);
      throw err;
    }
  }, []);

  const updateShippingAddress = useCallback(async (addressId, addressData) => {
    try {
      const response = await axiosInstance.put(`/ecommerce/shipping-addresses/${addressId}/`, addressData);
      return response.data;
    } catch (err) {
      console.error('Failed to update shipping address:', err);
      throw err;
    }
  }, []);

  const deleteShippingAddress = useCallback(async (addressId) => {
    try {
      const response = await axiosInstance.delete(`/ecommerce/shipping-addresses/${addressId}/`);
      return response.data;
    } catch (err) {
      console.error('Failed to delete shipping address:', err);
      throw err;
    }
  }, []);

  const setDefaultShippingAddress = useCallback(async (addressId) => {
    try {
      const response = await axiosInstance.patch(`/ecommerce/shipping-addresses/${addressId}/set_default/`);
      return response.data;
    } catch (err) {
      console.error('Failed to set default shipping address:', err);
      throw err;
    }
  }, []);

  // 추천 상품 관련 함수들 (API 기반)
  const getRecommendedProductsAPI = useCallback(async (limit = 10) => {
    try {
      const response = await axiosInstance.get('/ecommerce/recommand/clicked/', {
        params: { limit }
      });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch recommended products:', err);
      throw err;
    }
  }, []);

  const getBestProducts = useCallback(async (limit = 10) => {
    try {
      const response = await axiosInstance.get('/ecommerce/products/', {
        params: { 
          ordering: '-recommendations_score',
          is_featured: true,
          limit 
        }
      });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch best products:', err);
      throw err;
    }
  }, []);

  const recordProductClick = useCallback(async (productId) => {
    try {
      const response = await axiosInstance.post('/ecommerce/recommand/clicked/', {
        product_id: productId
      });
      return response.data;
    } catch (err) {
      console.error('Failed to record product click:', err);
      throw err;
    }
  }, []);

  // 관리자 - 모든 상품 조회
  const getAllProductsAdmin = async () => {
    setLoading(true);
    try {
      const products = await ecommerceAPI.getAllProducts();
      return products;
    } catch (error) {
      console.error('전체 상품 조회 실패:', error);
      setError('상품 목록을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 관리자 - 상품 등록
  const createProductAdmin = async (productData) => {
    setLoading(true);
    try {
      const newProduct = await ecommerceAPI.createProduct(productData);
      return newProduct;
    } catch (error) {
      console.error('상품 등록 실패:', error);
      setError('상품 등록에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 관리자 - 상품 수정
  const updateProductAdmin = async (productId, productData) => {
    setLoading(true);
    try {
      const updatedProduct = await ecommerceAPI.updateProduct(productId, productData);
      return updatedProduct;
    } catch (error) {
      console.error('상품 수정 실패:', error);
      setError('상품 수정에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 관리자 - 상품 삭제
  const deleteProductAdmin = async (productId) => {
    setLoading(true);
    try {
      await ecommerceAPI.deleteProduct(productId);
      return true;
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      setError('상품 삭제에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
    getReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    getProductReviewStats,

    // 쿠폰 함수들
    getCoupons,
    getMyCoupons,
    purchaseCouponWithPoints,
    useCoupon,

    // 배송지 함수들
    getShippingAddresses,
    createShippingAddress,
    updateShippingAddress,
    deleteShippingAddress,
    setDefaultShippingAddress,

    // 추천 시스템 함수들
    getRecommendedProductsAPI,
    getBestProducts,
    recordProductClick,

    // 유틸리티 함수들
    getRecommendedProducts,
    getRelatedProducts,
    getHomePageRecommendations,
    getCategories,
    fetchCategories,
    getProductsByRating,
    formatPrice,
    calculateDiscountedPrice,

    // 관리자 함수들
    getAllProductsAdmin,
    createProductAdmin,
    updateProductAdmin,
    deleteProductAdmin,
  };
};

export default useEcommerce; 