import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from './useAuth';

export const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 장바구니 조회
  const fetchCart = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/ecommerce/carts/my_cart/');
      setCart(response.data);
      setCartItems(response.data.items || []);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      if (err.response?.status === 404) {
        // 장바구니가 없는 경우 빈 상태로 설정
        setCart(null);
        setCartItems([]);
      } else {
        setError('장바구니를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 장바구니에 상품 추가
  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post('/ecommerce/carts/add_item/', {
        product_id: productId,
        quantity: quantity
      });
      
      // 장바구니 다시 조회하여 최신 상태 반영
      await fetchCart();
      
      // 장바구니 업데이트 이벤트 발생 (다른 컴포넌트에서 감지할 수 있도록)
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return response.data;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error ||
                          '장바구니에 상품을 추가하는 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 장바구니 상품 수량 변경
  const updateCartItemQuantity = async (cartItemId, quantity) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.patch(`/ecommerce/cart-items/${cartItemId}/`, {
        quantity: quantity
      });
      
      // 로컬 상태 업데이트
      setCartItems(prev => prev.map(item => 
        item.id === cartItemId ? { ...item, quantity: quantity } : item
      ));
      
      // 장바구니 총액 등 다시 계산
      await fetchCart();
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return response.data;
    } catch (err) {
      console.error('Failed to update cart item quantity:', err);
      setError('상품 수량 변경 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 장바구니에서 상품 제거
  const removeFromCart = async (cartItemId) => {
    setLoading(true);
    setError(null);
    
    try {
      await axiosInstance.delete(`/ecommerce/cart-items/${cartItemId}/`);
      
      // 로컬 상태 업데이트
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      
      // 장바구니 총액 등 다시 계산
      await fetchCart();
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setError('상품 제거 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 장바구니 비우기
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 모든 카트 아이템 삭제
      await Promise.all(cartItems.map(item => 
        axiosInstance.delete(`/ecommerce/cart-items/${item.id}/`)
      ));
      
      setCartItems([]);
      setCart(null);
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('장바구니 비우기 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 장바구니 총 아이템 수 계산
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // 장바구니 총 금액 계산
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // 특정 상품이 장바구니에 있는지 확인
  const isInCart = (productId) => {
    return cartItems.some(item => item.product?.id === productId);
  };

  // 특정 상품의 장바구니 내 수량 반환
  const getCartItemQuantity = (productId) => {
    const item = cartItems.find(item => item.product?.id === productId);
    return item ? item.quantity : 0;
  };

  // 사용자가 변경될 때마다 장바구니 새로고침
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setCartItems([]);
    }
  }, [user]);

  // 장바구니 업데이트 이벤트 리스너
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user) {
        fetchCart();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);

  return {
    // 데이터
    cart,
    cartItems,
    loading,
    error,
    
    // 계산된 값들
    cartItemsCount: getCartItemsCount(),
    cartTotal: getCartTotal(),
    
    // API 함수들
    fetchCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    
    // 유틸리티 함수들
    isInCart,
    getCartItemQuantity,
    
    // 새로고침
    refetch: fetchCart
  };
}; 