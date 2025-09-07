import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  ArrowLeft,
  Plus,
  Edit,
  Check,
  ShoppingBag,
  Package
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import useEcommerce from '../../hooks/useEcommerce';

const BillingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { 
    getShippingAddresses, 
    createShippingAddress, 
    setDefaultShippingAddress,
    formatPrice 
  } = useEcommerce();

  // 주문할 상품들 (장바구니에서 전달받거나 바로구매)
  const { selectedItems = [], fromCart = false, directPurchase = false } = location.state || {};

  // 상태 관리
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // 주문자 정보
  const [orderInfo, setOrderInfo] = useState({
    name: user?.first_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || ''
  });

  // 새 배송지 폼
  const [addressForm, setAddressForm] = useState({
    recipient_name: '',
    phone: '',
    address: '',
    detail_address: '',
    postal_code: '',
    is_default: false
  });
  const [addressErrors, setAddressErrors] = useState({});

  // 결제 정보
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      navigate('/shop');
      return;
    }

    loadShippingAddresses();
  }, []);

  const loadShippingAddresses = async () => {
    setLoading(true);
    try {
      const addresses = await getShippingAddresses();
      setShippingAddresses(addresses);
      
      // 기본 배송지 설정
      const defaultAddress = addresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (addresses.length > 0) {
        setSelectedAddress(addresses[0]);
      }
    } catch (error) {
      console.error('배송지 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 주문 금액 계산
  const calculateOrderTotal = () => {
    const subtotal = selectedItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
    
    const shippingFee = subtotal >= 50000 ? 0 : 3000;
    return { subtotal, shippingFee, total: subtotal + shippingFee };
  };

  const { subtotal, shippingFee, total } = calculateOrderTotal();

  // 새 배송지 추가
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    const errors = {};
    if (!addressForm.recipient_name.trim()) errors.recipient_name = '받는 사람 이름을 입력해주세요.';
    if (!addressForm.phone.trim()) errors.phone = '전화번호를 입력해주세요.';
    if (!addressForm.address.trim()) errors.address = '주소를 입력해주세요.';
    if (!addressForm.detail_address.trim()) errors.detail_address = '상세주소를 입력해주세요.';
    if (!addressForm.postal_code.trim()) errors.postal_code = '우편번호를 입력해주세요.';
    
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const newAddress = await createShippingAddress(addressForm);
      setShippingAddresses(prev => [...prev, newAddress]);
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
      setAddressForm({
        recipient_name: '',
        phone: '',
        address: '',
        detail_address: '',
        postal_code: '',
        is_default: false
      });
      
      if (addressForm.is_default) {
        await setDefaultShippingAddress(newAddress.id);
      }
    } catch (error) {
      console.error('배송지 추가 실패:', error);
      alert('배송지 추가에 실패했습니다.');
    }
  };

  // 주문 처리
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('배송지를 선택해주세요.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        alert('카드 정보를 모두 입력해주세요.');
        return;
      }
    }

    setOrderLoading(true);
    try {
      // 실제 주문 API 호출 (백엔드 구현 필요)
      const orderData = {
        items: selectedItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shipping_address: selectedAddress.id,
        payment_method: paymentMethod,
        payment_info: paymentMethod === 'card' ? paymentInfo : null,
        order_info: orderInfo,
        total_amount: total
      };

      // 주문 API 호출 (실제 구현 시 백엔드 API 연동)
      console.log('주문 데이터:', orderData);
      
      // 임시로 성공 처리
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('주문이 완료되었습니다!');
      navigate('/orders'); // 주문 내역 페이지로 이동
      
    } catch (error) {
      console.error('주문 처리 실패:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setOrderLoading(false);
    }
  };

  // 주소 검색 (Daum 우편번호 API 등 사용 가능)
  const handleAddressSearch = () => {
    // 실제 구현에서는 Daum 우편번호 API 등을 사용
    alert('주소 검색 기능은 실제 구현에서 Daum 우편번호 API를 연동하세요.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(fromCart ? '/cart' : '/shop')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {fromCart ? '장바구니로 돌아가기' : '상품으로 돌아가기'}
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">주문/결제</h1>
          <p className="text-gray-600">주문 정보를 확인하고 결제를 진행하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 주문 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 상품 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                주문 상품 ({selectedItems.length}개)
              </h2>
              
              <div className="space-y-4">
                {selectedItems.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.product?.name || '상품명 없음'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        수량: {item.quantity}개
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {formatPrice((item.product?.price || 0) * item.quantity)}원
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 주문자 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                주문자 정보
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <Input
                    type="text"
                    value={orderInfo.name}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="주문자 이름"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  <Input
                    type="tel"
                    value={orderInfo.phone}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <Input
                    type="email"
                    value={orderInfo.email}
                    onChange={(e) => setOrderInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </div>

            {/* 배송지 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  배송지 정보
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  새 배송지
                </Button>
              </div>

              {/* 배송지 목록 */}
              {shippingAddresses.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {shippingAddresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <input
                              type="radio"
                              name="shipping_address"
                              checked={selectedAddress?.id === address.id}
                              onChange={() => setSelectedAddress(address)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                              selectedAddress?.id === address.id ? 'border-blue-500' : 'border-gray-300'
                            }`}>
                              {selectedAddress?.id === address.id && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {address.recipient_name}
                              </span>
                              {address.is_default && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  기본 배송지
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              ({address.postal_code}) {address.address}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              {address.detail_address}
                            </p>
                            <p className="text-sm text-gray-500">
                              {address.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>등록된 배송지가 없습니다.</p>
                  <p className="text-sm">새 배송지를 추가해주세요.</p>
                </div>
              )}

              {/* 새 배송지 추가 폼 */}
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t pt-4"
                >
                  <h3 className="font-medium text-gray-900 mb-4">새 배송지 추가</h3>
                  
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          받는 사람 *
                        </label>
                        <Input
                          type="text"
                          value={addressForm.recipient_name}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, recipient_name: e.target.value }))}
                          placeholder="받는 사람 이름"
                          error={addressErrors.recipient_name}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          전화번호 *
                        </label>
                        <Input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="010-0000-0000"
                          error={addressErrors.phone}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          우편번호 *
                        </label>
                        <Input
                          type="text"
                          value={addressForm.postal_code}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                          placeholder="12345"
                          error={addressErrors.postal_code}
                        />
                      </div>
                      <div className="flex-shrink-0 flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddressSearch}
                        >
                          주소 검색
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        주소 *
                      </label>
                      <Input
                        type="text"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="기본 주소"
                        error={addressErrors.address}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        상세주소 *
                      </label>
                      <Input
                        type="text"
                        value={addressForm.detail_address}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, detail_address: e.target.value }))}
                        placeholder="상세 주소 (동, 호수 등)"
                        error={addressErrors.detail_address}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_default"
                        checked={addressForm.is_default}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_default" className="text-sm text-gray-700">
                        기본 배송지로 설정
                      </label>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                        className="flex-1"
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                      >
                        배송지 추가
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>

            {/* 결제 방법 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                결제 방법
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">신용카드</span>
                </label>
                
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="w-5 h-5 text-gray-400 flex items-center justify-center">🏦</span>
                  <span className="font-medium">무통장 입금</span>
                </label>
                
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="kakao"
                    checked={paymentMethod === 'kakao'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="w-5 h-5 text-gray-400 flex items-center justify-center">💳</span>
                  <span className="font-medium">카카오페이</span>
                </label>
              </div>

              {/* 카드 정보 입력 */}
              {paymentMethod === 'card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카드번호
                      </label>
                      <Input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="0000-0000-0000-0000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        유효기간
                      </label>
                      <Input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                        placeholder="MM/YY"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <Input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="000"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카드 소유자명
                      </label>
                      <Input
                        type="text"
                        value={paymentInfo.cardholderName}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                        placeholder="카드에 표시된 이름"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* 오른쪽: 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 요약</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">상품 금액</span>
                  <span className="font-medium">{formatPrice(subtotal)}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">배송비</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? '무료' : `${formatPrice(shippingFee)}원`}
                  </span>
                </div>
                {subtotal < 50000 && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    💡 50,000원 이상 구매 시 무료배송
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">총 결제 금액</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(total)}원
                  </span>
                </div>
              </div>
              
              <Button
                variant="primary"
                className="w-full mb-4"
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || orderLoading}
              >
                {orderLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    주문 처리 중...
                  </>
                ) : (
                  `${formatPrice(total)}원 결제하기`
                )}
              </Button>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• 주문 완료 후 취소/변경이 어려울 수 있습니다</p>
                <p>• 결제 완료 후 1-3일 이내 발송됩니다</p>
                <p>• 배송 관련 문의는 고객센터로 연락해주세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;