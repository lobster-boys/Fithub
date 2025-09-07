import React, { useState, useEffect } from 'react';
import { Gift, Ticket, Plus, Search, Filter } from 'lucide-react';
import CouponCard from '../../components/ecommerce/CouponCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useEcommerce from '../../hooks/useEcommerce';
import { usePoints } from '../../hooks/usePoints';

const CouponsPage = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [myCoupons, setMyCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { 
    getCoupons, 
    getMyCoupons, 
    purchaseCouponWithPoints,
    useCoupon 
  } = useEcommerce();
  
  const { fetchPointSummary } = usePoints();

  useEffect(() => {
    loadCoupons();
  }, [activeTab]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      if (activeTab === 'available') {
        const data = await getCoupons({ 
          search: searchQuery,
          is_point_purchasable: filterType === 'point' ? true : undefined
        });
        setAvailableCoupons(data.results || data || []);
      } else {
        const data = await getMyCoupons({ 
          search: searchQuery,
          is_used: filterType === 'used' ? true : filterType === 'unused' ? false : undefined
        });
        setMyCoupons(data.results || data || []);
      }
    } catch (error) {
      console.error('쿠폰 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCoupon = async (couponId, pointCost) => {
    try {
      await purchaseCouponWithPoints(couponId, pointCost);
      alert('쿠폰을 성공적으로 구매했습니다!');
      
      // 포인트 정보 새로고침
      await fetchPointSummary();
      
      // 쿠폰 목록 새로고침
      await loadCoupons();
      
      // 내 쿠폰 탭으로 이동
      setActiveTab('my');
    } catch (error) {
      console.error('쿠폰 구매 실패:', error);
      alert('쿠폰 구매에 실패했습니다.');
    }
  };

  const handleUseCoupon = async (couponCode) => {
    try {
      await useCoupon(couponCode);
      alert('쿠폰을 성공적으로 사용했습니다!');
      
      // 내 쿠폰 목록 새로고침
      await loadCoupons();
    } catch (error) {
      console.error('쿠폰 사용 실패:', error);
      alert('쿠폰 사용에 실패했습니다.');
    }
  };

  const handleSearch = () => {
    loadCoupons();
  };

  const getCurrentCoupons = () => {
    return activeTab === 'available' ? availableCoupons : myCoupons;
  };

  const getFilteredCoupons = () => {
    let coupons = getCurrentCoupons();
    
    if (searchQuery) {
      coupons = coupons.filter(coupon => 
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return coupons;
  };

  const tabs = [
    {
      id: 'available',
      label: '구매 가능한 쿠폰',
      icon: Gift,
      count: availableCoupons.length
    },
    {
      id: 'my',
      label: '내 쿠폰',
      icon: Ticket,
      count: myCoupons.length
    }
  ];

  const filterOptions = activeTab === 'available' 
    ? [
        { value: 'all', label: '전체' },
        { value: 'point', label: '포인트 구매 가능' }
      ]
    : [
        { value: 'all', label: '전체' },
        { value: 'unused', label: '사용 가능' },
        { value: 'used', label: '사용 완료' }
      ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">쿠폰</h1>
          <p className="text-gray-600">
            포인트로 쿠폰을 구매하거나 보유한 쿠폰을 관리하세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 검색 및 필터 */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="쿠폰 코드로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  className="whitespace-nowrap"
                >
                  <Search className="w-4 h-4 mr-2" />
                  검색
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 쿠폰 목록 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : getFilteredCoupons().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredCoupons().map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                isMyCoupon={activeTab === 'my'}
                onPurchase={handlePurchaseCoupon}
                onUse={handleUseCoupon}
                onView={(coupon) => {
                  // 쿠폰 상세 모달 또는 페이지로 이동
                  console.log('쿠폰 상세 보기:', coupon);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 mb-4">
              {activeTab === 'available' ? (
                <Gift className="w-16 h-16 mx-auto" />
              ) : (
                <Ticket className="w-16 h-16 mx-auto" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'available' 
                ? '구매 가능한 쿠폰이 없습니다'
                : '보유한 쿠폰이 없습니다'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'available' 
                ? '새로운 쿠폰이 추가되면 알려드리겠습니다.'
                : '포인트로 쿠폰을 구매해보세요.'
              }
            </p>
            {activeTab === 'my' && (
              <Button
                variant="primary"
                onClick={() => setActiveTab('available')}
                className="mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                쿠폰 구매하기
              </Button>
            )}
          </div>
        )}

        {/* 하단 정보 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            쿠폰 이용 안내
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">쿠폰 구매</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 포인트로 쿠폰을 구매할 수 있습니다</li>
                <li>• 구매한 쿠폰은 내 쿠폰에서 확인 가능합니다</li>
                <li>• 쿠폰별로 사용 조건이 다를 수 있습니다</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">쿠폰 사용</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 주문 시 쿠폰 코드를 입력하여 사용합니다</li>
                <li>• 최소 주문 금액 조건을 확인해주세요</li>
                <li>• 사용된 쿠폰은 복원할 수 없습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponsPage; 