import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import PageTransition from '../../components/layout/PageTransition';
import Button from '../../components/common/Button';
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

  // 선택된 상품들 관리
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
    setSelectAll(!selectAll);
  };

  // 개별 상품 선택/해제
  const handleSelectItem = (itemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectedItems.size === cartItems.length);
  };

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
      // 삭제된 상품을 선택 목록에서도 제거
      const newSelectedItems = new Set(selectedItems);
      newSelectedItems.delete(cartItemId);
      setSelectedItems(newSelectedItems);
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 선택된 상품들 삭제
  const handleRemoveSelectedItems = async () => {
    if (selectedItems.size === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택된 ${selectedItems.size}개 상품을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      for (const itemId of selectedItems) {
        await removeFromCart(itemId);
      }
      setSelectedItems(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('선택 상품 삭제 실패:', error);
      alert('선택된 상품 삭제에 실패했습니다.');
    }
  };

  // 장바구니 비우기
  const handleClearCart = async () => {
    if (!window.confirm('장바구니를 모두 비우시겠습니까?')) {
      return;
    }

    try {
      await clearCart();
      setSelectedItems(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
      alert('장바구니 비우기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 선택된 상품들의 총 금액 계산
  const getSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  };

  // 선택된 상품들로 결제 진행
  const handleCheckoutSelected = () => {
    if (selectedItems.size === 0) {
      alert('결제할 상품을 선택해주세요.');
      return;
    }

    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    // 선택된 상품 정보를 state로 전달하며 결제 페이지로 이동
    navigate('/billing', { 
      state: { 
        selectedItems: selectedCartItems,
        fromCart: true 
      } 
    });
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">장바구니를 불러오는 중...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">장바구니</h1>
            <p className="text-gray-600">선택한 상품들을 확인하고 주문하세요</p>
          </div>
          
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
          
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-600 mb-4">장바구니가 비어있습니다</h2>
              <p className="text-gray-500 mb-6">쇼핑을 계속하고 마음에 드는 상품을 담아보세요!</p>
              <Button 
                variant="primary"
                onClick={() => navigate('/shop')}
              >
                스토어로 이동
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 장바구니 상품 목록 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 선택 및 관리 버튼 */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                            selectAll ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}>
                            {selectAll && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          전체 선택 ({selectedItems.size}/{cartItems.length})
                        </span>
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedItems.size > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveSelectedItems}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          선택 삭제
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearCart}
                        className="text-gray-600"
                      >
                        전체 삭제
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 상품 목록 */}
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.id} 
                      className="bg-white rounded-lg shadow-sm border p-6"
                      variants={itemVariants}
                    >
                      <div className="flex items-start gap-4">
                        {/* 체크박스 */}
                        <label className="flex-shrink-0 cursor-pointer mt-1">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                              selectedItems.has(item.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}>
                              {selectedItems.has(item.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </label>

                        {/* 상품 이미지 */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product?.name || '상품'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingBag className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        
                        {/* 상품 정보 */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/products/${item.product?.id}`} 
                            className="font-medium text-gray-900 hover:text-blue-600 block truncate"
                          >
                            {item.product?.name || '상품명 없음'}
                          </Link>
                          
                          <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {item.product?.description || '상품 설명이 없습니다.'}
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <div className="text-lg font-bold text-gray-900">
                              {item.product?.price ? item.product.price.toLocaleString() : 0}원
                            </div>
                            
                            {/* 수량 조절 */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button 
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                  disabled={item.quantity <= 1 || loading}
                                >
                                  -
                                </button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <button 
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                  disabled={loading}
                                >
                                  +
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                                disabled={loading}
                                title="상품 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* 소계 */}
                          <div className="mt-2 text-right">
                            <span className="text-sm text-gray-500">소계: </span>
                            <span className="font-bold text-gray-900">
                              {((item.product?.price || 0) * item.quantity).toLocaleString()}원
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* 쇼핑 계속하기 */}
                <div className="flex justify-start">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/shop')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    쇼핑 계속하기
                  </Button>
                </div>
              </div>
              
              {/* 주문 요약 */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 요약</h2>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">선택된 상품</span>
                      <span className="font-medium">{selectedItems.size}개</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">상품 금액</span>
                      <span className="font-medium">{getSelectedTotal().toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">배송비</span>
                      <span className="font-medium">
                        {getSelectedTotal() >= 50000 ? '무료' : '3,000원'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">총 결제 금액</span>
                      <span className="text-xl font-bold text-blue-600">
                        {(getSelectedTotal() >= 50000 ? getSelectedTotal() : getSelectedTotal() + 3000).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    className="w-full mb-4"
                    onClick={handleCheckoutSelected}
                    disabled={selectedItems.size === 0}
                  >
                    선택 상품 주문하기 ({selectedItems.size})
                  </Button>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 50,000원 이상 구매 시 무료 배송</p>
                    <p>• 결제 완료 후 1-3일 이내 발송</p>
                    <p>• 30일 이내 무료 반품/교환</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ShoppingCartPage; 