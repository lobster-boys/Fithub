import React, { useState } from 'react';
import { Calendar, Gift, Tag, Clock, Users, Zap } from 'lucide-react';
import Button from '../common/Button';
import { usePoints } from '../../hooks/usePoints';

const CouponCard = ({ 
  coupon, 
  isMyCoupon = false,
  onPurchase,
  onUse,
  onView,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const { checkPointAvailability } = usePoints();

  // 할인 타입별 표시
  const getDiscountDisplay = () => {
    if (coupon.discount_type === 'PERCENTAGE') {
      return `${coupon.discount_value}% 할인`;
    } else {
      return `${coupon.discount_value.toLocaleString()}원 할인`;
    }
  };

  // 유효기간 표시
  const getValidityDisplay = () => {
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);
    const now = new Date();
    
    const isActive = startDate <= now && now <= endDate;
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    return {
      isActive,
      daysLeft,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString()
    };
  };

  // 쿠폰 상태 색상
  const getStatusColor = () => {
    if (isMyCoupon) {
      return coupon.is_used ? 'text-gray-500 bg-gray-100' : 'text-green-600 bg-green-100';
    }
    
    const validity = getValidityDisplay();
    if (!validity.isActive) return 'text-gray-500 bg-gray-100';
    if (validity.daysLeft <= 3) return 'text-red-600 bg-red-100';
    return 'text-blue-600 bg-blue-100';
  };

  // 포인트로 쿠폰 구매
  const handlePurchaseWithPoints = async () => {
    if (!coupon.is_point_purchasable || coupon.point_cost <= 0) return;
    
    setLoading(true);
    try {
      // 포인트 충분한지 확인
      const availability = await checkPointAvailability(coupon.point_cost);
      if (!availability.available) {
        alert(`포인트가 부족합니다. (필요: ${coupon.point_cost}P, 보유: ${availability.currentBalance}P)`);
        return;
      }

      if (window.confirm(`${coupon.point_cost}P로 이 쿠폰을 구매하시겠습니까?`)) {
        await onPurchase(coupon.id, coupon.point_cost);
      }
    } catch (error) {
      console.error('쿠폰 구매 실패:', error);
      alert('쿠폰 구매에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 쿠폰 사용
  const handleUse = async () => {
    if (window.confirm('이 쿠폰을 사용하시겠습니까?')) {
      try {
        await onUse(coupon.code);
      } catch (error) {
        console.error('쿠폰 사용 실패:', error);
        alert('쿠폰 사용에 실패했습니다.');
      }
    }
  };

  const validity = getValidityDisplay();

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-yellow-400 ${className}`}>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {coupon.code}
              </h3>
              <p className="text-sm text-gray-600">
                쿠폰 코드
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {isMyCoupon ? (coupon.is_used ? '사용완료' : '사용가능') : 
             (validity.isActive ? '사용가능' : '만료')}
          </div>
        </div>

        {/* 할인 정보 */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-700 mb-1">
                {getDiscountDisplay()}
              </div>
              <div className="text-sm text-gray-600">
                {coupon.min_purchase_amount > 0 && (
                  <span>최소 {coupon.min_purchase_amount.toLocaleString()}원 이상 구매 시</span>
                )}
                {coupon.max_discount_amount && (
                  <span className="ml-2">최대 {coupon.max_discount_amount.toLocaleString()}원</span>
                )}
              </div>
            </div>
            <Tag className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="space-y-3 mb-4">
          {/* 유효기간 */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {validity.startDate} ~ {validity.endDate}
            </span>
            {validity.isActive && validity.daysLeft <= 7 && (
              <span className="text-red-500 font-medium">
                ({validity.daysLeft}일 남음)
              </span>
            )}
          </div>

          {/* 사용 제한 */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {coupon.usage_count}/{coupon.usage_limit} 사용됨
            </span>
          </div>

          {/* 포인트 구매 가능 */}
          {coupon.is_point_purchasable && coupon.point_cost > 0 && !isMyCoupon && (
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-600 font-medium">
                {coupon.point_cost}P로 구매 가능
              </span>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(coupon)}
            className="flex-1"
          >
            자세히 보기
          </Button>
          
          {isMyCoupon ? (
            // 내 쿠폰인 경우
            !coupon.is_used && validity.isActive ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleUse}
                className="flex-1"
              >
                사용하기
              </Button>
            ) : (
              <div className="flex-1 px-3 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg text-center">
                {coupon.is_used ? '사용완료' : '사용불가'}
              </div>
            )
          ) : (
            // 구매 가능한 쿠폰인 경우
            coupon.is_point_purchasable && coupon.point_cost > 0 && validity.isActive ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePurchaseWithPoints}
                disabled={loading}
                className="flex-1"
              >
                {loading ? '구매 중...' : `${coupon.point_cost}P로 구매`}
              </Button>
            ) : (
              <div className="flex-1 px-3 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg text-center">
                구매불가
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCard; 