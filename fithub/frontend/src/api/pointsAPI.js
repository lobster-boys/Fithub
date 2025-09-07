import axiosInstance from './axiosConfig';

// ========== 포인트 잔액 및 요약 정보 ==========

// 내 포인트 잔액 조회
export const getMyPointBalance = async () => {
  try {
    const response = await axiosInstance.get('/points/balance/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 포인트 요약 정보 조회 (잔액, 이번 달 적립/사용량 등)
export const getPointSummary = async () => {
  try {
    const response = await axiosInstance.get('/points/summary/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 포인트 거래 내역 ==========

// 포인트 거래 내역 조회 (필터링: transaction_type, reference_type, date)
export const getPointTransactions = async (params) => {
  try {
    const response = await axiosInstance.get('/points/transactions/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 포인트 적립 (시스템에서 자동 호출용)
export const earnPoints = async (pointData) => {
  try {
    const response = await axiosInstance.post('/points/transactions/earn_points/', pointData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 포인트 사용 (챌린지, 쿠폰 구매, 상품 할인 등)
export const usePoints = async (pointData) => {
  try {
    const response = await axiosInstance.post('/points/transactions/use_points/', pointData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 포인트 정책 조회 ==========

// 포인트 적립 정책 조회
export const getPointPolicies = async () => {
  try {
    const response = await axiosInstance.get('/points/policies/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 특정 정책 기반 포인트 계산
export const calculatePointsByPolicy = async (policyType, baseAmount) => {
  try {
    const response = await axiosInstance.post('/points/policies/calculate/', {
      policy_type: policyType,
      base_amount: baseAmount
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 포인트 만료 정보 ==========

// 포인트 만료 예정 내역 조회
export const getPointExpiries = async (params) => {
  try {
    const response = await axiosInstance.get('/points/expiries/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 편의 함수들 ==========

// 챌린지 참여를 위한 포인트 사용
export const usePointsForChallenge = async (challengeId, amount) => {
  return usePoints({
    amount: amount,
    reference_type: 'CHALLENGE',
    description: `챌린지 참여 (ID: ${challengeId})`,
    reference_id: challengeId.toString()
  });
};

// 쿠폰 구매를 위한 포인트 사용
export const usePointsForCoupon = async (couponId, amount) => {
  return usePoints({
    amount: amount,
    reference_type: 'COUPON',
    description: `쿠폰 구매 (ID: ${couponId})`,
    reference_id: couponId.toString()
  });
};

// 상품 구매 시 포인트 할인 적용
export const usePointsForDiscount = async (orderId, amount) => {
  return usePoints({
    amount: amount,
    reference_type: 'ORDER',
    description: `상품 구매 할인 (주문 ID: ${orderId})`,
    reference_id: orderId.toString()
  });
};

// 운동 목표 달성 포인트 적립
export const earnPointsFromWorkout = async (workoutLogId, points, description) => {
  return earnPoints({
    amount: points,
    reference_type: 'WORKOUT',
    description: description || '주간 운동 목표 달성',
    reference_id: workoutLogId.toString()
  });
};

// 월별 포인트 거래 내역 조회
export const getMonthlyPointTransactions = async (year, month) => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // 해당 월 마지막일
  
  return getPointTransactions({
    created_at__gte: startDate,
    created_at__lte: endDate,
    ordering: '-created_at'
  });
};

// 포인트 거래 유형별 조회
export const getPointTransactionsByType = async (transactionType) => {
  return getPointTransactions({
    transaction_type: transactionType,
    ordering: '-created_at'
  });
};

// 포인트 사용 가능 여부 확인
export const checkPointAvailability = async (amount) => {
  try {
    const balance = await getMyPointBalance();
    return {
      available: balance.balance >= amount,
      currentBalance: balance.balance,
      shortfall: Math.max(0, amount - balance.balance)
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getMyPointBalance,
  getPointSummary,
  getPointTransactions,
  earnPoints,
  usePoints,
  getPointPolicies,
  calculatePointsByPolicy,
  getPointExpiries,
  usePointsForChallenge,
  usePointsForCoupon,
  usePointsForDiscount,
  earnPointsFromWorkout,
  getMonthlyPointTransactions,
  getPointTransactionsByType,
  checkPointAvailability
}; 