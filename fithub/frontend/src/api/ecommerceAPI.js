import axiosInstance from './axiosConfig';

// ========== 상품 (Products) ==========

// 상품 목록 조회 (필터링: category, price_min, price_max, search)
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

// ========== 카테고리 (Categories) ==========

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

// ========== 장바구니 (Carts) ==========

// 장바구니 목록 조회
export const getCarts = async (params) => {
  try {
    const response = await axiosInstance.get('/ecommerce/carts/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 상세 조회
export const getCart = async (id) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/carts/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 생성
export const createCart = async (cartData) => {
  try {
    const response = await axiosInstance.post('/ecommerce/carts/', cartData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 수정
export const updateCart = async (id, cartData) => {
  try {
    const response = await axiosInstance.put(`/ecommerce/carts/${id}/`, cartData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 삭제
export const deleteCart = async (id) => {
  try {
    const response = await axiosInstance.delete(`/ecommerce/carts/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

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
export const addItemToCart = async (productId, quantity = 1) => {
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

// ========== 장바구니 아이템 (Cart Items) ==========

// 장바구니 아이템 목록 조회
export const getCartItems = async (params) => {
  try {
    const response = await axiosInstance.get('/ecommerce/cart-items/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 아이템 상세 조회
export const getCartItem = async (id) => {
  try {
    const response = await axiosInstance.get(`/ecommerce/cart-items/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 아이템 생성
export const createCartItem = async (itemData) => {
  try {
    const response = await axiosInstance.post('/ecommerce/cart-items/', itemData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 아이템 수정
export const updateCartItem = async (id, itemData) => {
  try {
    const response = await axiosInstance.put(`/ecommerce/cart-items/${id}/`, itemData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 장바구니 아이템 삭제
export const deleteCartItem = async (id) => {
  try {
    const response = await axiosInstance.delete(`/ecommerce/cart-items/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 주문 (Orders) ==========

// 주문 목록 조회 (필터링: status, date)
export const getOrders = async (params) => {
  try {
    const response = await axiosInstance.get('/ecommerce/orders/', { params });
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

// 주문 수정
export const updateOrder = async (id, orderData) => {
  try {
    const response = await axiosInstance.put(`/ecommerce/orders/${id}/`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 주문 삭제
export const deleteOrder = async (id) => {
  try {
    const response = await axiosInstance.delete(`/ecommerce/orders/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 리뷰 (Reviews) ==========

// 리뷰 목록 조회 (필터링: product, rating)
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

// 리뷰 생성
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

// ========== 편의 함수들 (프론트엔드에서 자주 사용하는 패턴) ==========

// 카테고리별 상품 조회
export const getProductsByCategory = async (categoryId) => {
  return getProducts({ category: categoryId });
};

// 상품 검색
export const searchProducts = async (query) => {
  return getProducts({ search: query });
};

// 가격 범위로 상품 조회
export const getProductsByPriceRange = async (minPrice, maxPrice) => {
  return getProducts({ price_min: minPrice, price_max: maxPrice });
};

// 특정 상품의 리뷰 조회
export const getProductReviews = async (productId) => {
  return getReviews({ product: productId });
};

// 평점별 리뷰 조회
export const getReviewsByRating = async (rating) => {
  return getReviews({ rating });
};

// 주문 상태별 조회
export const getOrdersByStatus = async (status) => {
  return getOrders({ status });
};

// 특정 날짜의 주문 조회
export const getOrdersByDate = async (date) => {
  return getOrders({ date });
};

// 장바구니에 상품 추가 (별칭)
export const addToCart = async (productId, quantity = 1) => {
  return addItemToCart(productId, quantity);
};

// 장바구니에서 상품 제거 (별칭)
export const removeFromCart = async (itemId) => {
  return deleteCartItem(itemId);
}; 