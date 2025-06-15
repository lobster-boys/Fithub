import axiosInstance from './axiosConfig';

// ========== 상품 관련 API ==========

// 상품 목록 조회
export const getProducts = async (params) => {
  try {
    const response = await axiosInstance.get('/ecommerce/products/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 상품 상세 조회
export const getProduct = async (id) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/products/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 상품 생성 (관리자용)
export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post('/ecommerce/products/', productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 상품 수정 (관리자용)
export const updateProduct = async (id, productData) => {
  try {
    const response = await axiosInstance.put(`/ecommerce/products/${id}/`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 상품 삭제 (관리자용)
export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`/ecommerce/products/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 추천 상품 조회
export const getRecommendedProducts = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/products/recommended/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 인기 상품 조회
export const getPopularProducts = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/products/popular/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 할인 상품 조회
export const getDiscountedProducts = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/products/discounted/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 상품 검색
export const searchProducts = async (query) => {
  try {
    const response = await axiosInstance.get('/ecommerce/products/search/', { 
      params: { q: query } 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 카테고리 관련 API ==========

// 카테고리 목록 조회
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/categories/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 카테고리 상세 조회
export const getCategory = async (id) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/categories/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 카테고리별 상품 조회
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/categories/${categoryId}/products/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 장바구니 관련 API ==========

// 내 장바구니 조회
export const getMyCart = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/carts/my_cart/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니에 상품 추가
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await axiosInstance.post('/ecommerce/carts/add_item/', {
      product: productId,
      quantity: quantity
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 아이템 수정
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await axiosInstance.put(`/ecommerce/cart-items/${itemId}/`, {
      quantity: quantity
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 아이템 삭제
export const removeFromCart = async (itemId) => {
  try {
    const response = await axiosInstance.delete(`/ecommerce/cart-items/${itemId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 비우기
export const clearCart = async () => {
  try {
    const response = await axiosInstance.post('/ecommerce/carts/clear/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 요약 정보
export const getCartSummary = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/carts/summary/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 주문 관련 API ==========

// 내 주문 목록 조회
export const getMyOrders = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/orders/my_orders/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 주문 상세 조회
export const getOrder = async (id) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/orders/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 주문 생성
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post('/ecommerce/orders/', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 최근 주문 조회
export const getRecentOrders = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/orders/recent/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 주문 취소
export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.post(`/ecommerce/orders/${orderId}/cancel/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 주문 요약 정보
export const getOrderSummary = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/orders/summary/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 리뷰 관련 API ==========

// 리뷰 목록 조회
export const getReviews = async (params) => {
  try {
    const response = await axiosInstance.get('/ecommerce/reviews/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 리뷰 상세 조회
export const getReview = async (id) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/reviews/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 리뷰 작성
export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post('/ecommerce/reviews/', reviewData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 리뷰 수정
export const updateReview = async (id, reviewData) => {
  try {
    const response = await axiosInstance.put(`/ecommerce/reviews/${id}/`, reviewData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 리뷰 삭제
export const deleteReview = async (id) => {
  try {
    const response = await axiosInstance.delete(`/ecommerce/reviews/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 내 리뷰 목록 조회
export const getMyReviews = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/reviews/my_reviews/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 상품별 리뷰 조회
export const getProductReviews = async (productId) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/reviews/by_product/`, {
      params: { product_id: productId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 상품 리뷰 통계
export const getProductReviewStats = async (productId) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/reviews/product_stats/`, {
      params: { product_id: productId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 최근 리뷰 조회
export const getRecentReviews = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/reviews/recent/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 높은 평점 리뷰 조회
export const getHighRatedReviews = async () => {
  try {
    const response = await axiosInstance.get('/ecommerce/reviews/high_rated/');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 