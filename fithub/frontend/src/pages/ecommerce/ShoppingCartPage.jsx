import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../../components/layout/PageTransition';
import { useCart } from '../../hooks/useCart';

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartTotal, 
    loading, 
    error, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  // 수량 변경 핸들러
  const handleQuantityChange = async (cartItemId, amount) => {
    try {
      const currentItem = cartItems.find(item => item.id === cartItemId);
      if (!currentItem) return;
      
      const newQuantity = currentItem.quantity + amount;
      if (newQuantity > 0) {
        await updateCartItemQuantity(cartItemId, newQuantity);
      }
    } catch (error) {
      console.error('수량 변경 실패:', error);
      alert('수량 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 상품 삭제 핸들러
  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 장바구니 비우기
  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
      alert('장바구니 비우기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 애니메이션 설정
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">장바구니를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-shopping-cart text-gray-300 text-5xl mb-4"></i>
            <h2 className="text-xl font-medium text-gray-600 mb-4">장바구니가 비어있습니다</h2>
            <p className="text-gray-500 mb-6">쇼핑을 계속하고 마음에 드는 상품을 담아보세요!</p>
            <button 
              onClick={() => navigate('/shop')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              스토어로 이동
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 장바구니 상품 목록 */}
            <div className="lg:w-2/3">
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden mb-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold">장바구니 상품 ({cartItems.length})</h2>
                  <button 
                    onClick={handleClearCart}
                    className="text-sm text-gray-500 hover:text-red-500"
                    disabled={loading}
                  >
                    비우기
                  </button>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.id} 
                      className="p-4 flex flex-col sm:flex-row gap-4"
                      variants={itemVariants}
                    >
                      {/* 상품 이미지 */}
                      <div className="sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product?.image_url || '/placeholder-image.jpg'} 
                          alt={item.product?.name || '상품'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* 상품 정보 */}
                      <div className="flex-1">
                        <Link to={`/shop/${item.product?.id}`} className="font-medium hover:text-primary">
                          {item.product?.name || '상품명 없음'}
                        </Link>
                        
                        <div className="flex items-center mt-2">
                          <span className="font-bold text-primary">
                            {item.product?.price ? item.product.price.toLocaleString() : 0}원
                          </span>
                        </div>
                        
                        {/* 수량 조절 및 삭제 */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center">
                            <button 
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                              disabled={item.quantity <= 1 || loading}
                            >
                              <i className="fas fa-minus text-xs"></i>
                            </button>
                            <span className="mx-3">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                              disabled={loading}
                            >
                              <i className="fas fa-plus text-xs"></i>
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-bold">
                              {((item.product?.price || 0) * item.quantity).toLocaleString()}원
                            </span>
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-500"
                              disabled={loading}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => navigate('/shop')}
                  className="text-primary hover:underline flex items-center"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  쇼핑 계속하기
                </button>
              </div>
            </div>
            
            {/* 주문 요약 */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-20">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold">주문 요약</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액</span>
                    <span>{cartTotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">배송비</span>
                    <span>{cartTotal >= 50000 ? '무료' : '3,000원'}</span>
                  </div>
                  
                  <div className="border-t border-gray-100 my-4 pt-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>총 결제 금액</span>
                      <span className="text-xl text-primary">
                        {(cartTotal >= 50000 ? cartTotal : cartTotal + 3000).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    주문하기
                  </button>
                  
                  <div className="text-xs text-gray-500 pt-4">
                    <p>- 50,000원 이상 구매 시 무료 배송</p>
                    <p>- 결제 완료 후 1-3일 이내 발송</p>
                    <p>- 30일 이내 무료 반품</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ShoppingCartPage; 