import { useState, useEffect, useCallback } from 'react';
import pointsAPI from '../api/pointsAPI';

// 포인트 잔액 및 기본 정보 관리 훅
export const usePoints = () => {
  const [pointBalance, setPointBalance] = useState(0);
  const [pointSummary, setPointSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 포인트 잔액 조회
  const fetchPointBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const balance = await pointsAPI.getMyPointBalance();
      setPointBalance(balance.balance || 0);
      return balance;
    } catch (err) {
      setError(err.message || '포인트 잔액 조회에 실패했습니다.');
      console.error('Failed to fetch point balance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 포인트 요약 정보 조회
  const fetchPointSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await pointsAPI.getPointSummary();
      setPointSummary(summary);
      setPointBalance(summary.balance || 0);
      return summary;
    } catch (err) {
      setError(err.message || '포인트 요약 정보 조회에 실패했습니다.');
      console.error('Failed to fetch point summary:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 포인트 사용 가능 여부 확인
  const checkPointAvailability = useCallback(async (amount) => {
    try {
      const availability = await pointsAPI.checkPointAvailability(amount);
      return availability;
    } catch (err) {
      console.error('Failed to check point availability:', err);
      throw err;
    }
  }, []);

  // 포인트 사용
  const usePoints = useCallback(async (amount, referenceType, description, referenceId) => {
    try {
      setLoading(true);
      setError(null);
      
      // 포인트 사용 가능 여부 확인
      const availability = await checkPointAvailability(amount);
      if (!availability.available) {
        throw new Error(`포인트가 부족합니다. (필요: ${amount}P, 보유: ${availability.currentBalance}P)`);
      }

      const result = await pointsAPI.usePoints({
        amount,
        reference_type: referenceType,
        description,
        reference_id: referenceId
      });

      // 포인트 잔액 업데이트
      await fetchPointBalance();
      
      return result;
    } catch (err) {
      setError(err.message || '포인트 사용에 실패했습니다.');
      console.error('Failed to use points:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPointBalance, checkPointAvailability]);

  // 컴포넌트 마운트 시 포인트 잔액 조회
  useEffect(() => {
    fetchPointBalance();
  }, [fetchPointBalance]);

  return {
    pointBalance,
    pointSummary,
    loading,
    error,
    fetchPointBalance,
    fetchPointSummary,
    checkPointAvailability,
    usePoints,
    // 포인트 보유 여부 확인 유틸리티
    hasEnoughPoints: (amount) => pointBalance >= amount,
    // 포인트 부족 시 필요한 포인트 계산
    getShortfall: (amount) => Math.max(0, amount - pointBalance)
  };
};

// 포인트 거래 내역 관리 훅
export const usePointTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1
  });

  // 포인트 거래 내역 조회
  const fetchTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await pointsAPI.getPointTransactions(params);
      setTransactions(response.results || []);
      setPagination({
        count: response.count || 0,
        next: response.next,
        previous: response.previous,
        current_page: params.page || 1,
        total_pages: Math.ceil((response.count || 0) / (params.page_size || 20))
      });
      return response;
    } catch (err) {
      setError(err.message || '포인트 거래 내역 조회에 실패했습니다.');
      console.error('Failed to fetch point transactions:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 월별 거래 내역 조회
  const fetchMonthlyTransactions = useCallback(async (year, month) => {
    try {
      const response = await pointsAPI.getMonthlyPointTransactions(year, month);
      return response;
    } catch (err) {
      console.error('Failed to fetch monthly transactions:', err);
      throw err;
    }
  }, []);

  // 거래 유형별 내역 조회
  const fetchTransactionsByType = useCallback(async (transactionType) => {
    try {
      const response = await pointsAPI.getPointTransactionsByType(transactionType);
      return response;
    } catch (err) {
      console.error('Failed to fetch transactions by type:', err);
      throw err;
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    pagination,
    fetchTransactions,
    fetchMonthlyTransactions,
    fetchTransactionsByType,
    // 페이지네이션 헬퍼
    hasNextPage: !!pagination.next,
    hasPreviousPage: !!pagination.previous,
    currentPage: pagination.current_page,
    totalPages: pagination.total_pages
  };
};

// 챌린지 포인트 연동 훅
export const useChallengePoints = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 챌린지 참여 시 포인트 사용
  const joinChallengeWithPoints = useCallback(async (challengeId, pointCost) => {
    try {
      setLoading(true);
      setError(null);
      
      // 포인트 사용 가능 여부 확인
      const availability = await pointsAPI.checkPointAvailability(pointCost);
      if (!availability.available) {
        throw new Error(`포인트가 부족합니다. ${availability.shortfall}P가 더 필요합니다.`);
      }

      // 포인트 사용
      await pointsAPI.usePoints(
        pointCost,
        'CHALLENGE',
        `챌린지 참여 (ID: ${challengeId})`,
        challengeId.toString()
      );

      return true;
    } catch (err) {
      setError(err.message || '챌린지 참여 중 오류가 발생했습니다.');
      console.error('Failed to join challenge with points:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 운동 목표 달성 시 포인트 적립
  const earnWorkoutPoints = useCallback(async (workoutLogId, points, description) => {
    try {
      setLoading(true);
      setError(null);
      
      await pointsAPI.earnPointsFromWorkout(workoutLogId, points, description);
      return true;
    } catch (err) {
      setError(err.message || '포인트 적립 중 오류가 발생했습니다.');
      console.error('Failed to earn workout points:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    joinChallengeWithPoints,
    earnWorkoutPoints
  };
};

// 쿠폰 포인트 연동 훅
export const useCouponPoints = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 포인트로 쿠폰 구매
  const purchaseCouponWithPoints = useCallback(async (couponId, pointCost) => {
    try {
      setLoading(true);
      setError(null);
      
      // 포인트 사용 가능 여부 확인
      const availability = await pointsAPI.checkPointAvailability(pointCost);
      if (!availability.available) {
        throw new Error(`포인트가 부족합니다. ${availability.shortfall}P가 더 필요합니다.`);
      }

      // 포인트 사용
      await pointsAPI.usePoints(
        pointCost,
        'COUPON',
        `쿠폰 구매 (ID: ${couponId})`,
        couponId.toString()
      );

      return true;
    } catch (err) {
      setError(err.message || '쿠폰 구매 중 오류가 발생했습니다.');
      console.error('Failed to purchase coupon with points:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    purchaseCouponWithPoints
  };
};

// 이커머스 포인트 연동 훅
export const useEcommercePoints = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 주문 시 포인트 할인 적용
  const applyPointDiscount = useCallback(async (orderId, discountAmount) => {
    try {
      setLoading(true);
      setError(null);
      
      // 포인트 사용 가능 여부 확인
      const availability = await pointsAPI.checkPointAvailability(discountAmount);
      if (!availability.available) {
        throw new Error(`포인트가 부족합니다. ${availability.shortfall}P가 더 필요합니다.`);
      }

      // 포인트 사용 (1:1 비율로 원화 할인)
      await pointsAPI.usePoints(
        discountAmount,
        'ORDER',
        `주문 할인 (주문 ID: ${orderId})`,
        orderId.toString()
      );

      return true;
    } catch (err) {
      setError(err.message || '포인트 할인 적용 중 오류가 발생했습니다.');
      console.error('Failed to apply point discount:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 포인트 할인 계산 (최대 할인 가능 금액)
  const calculateMaxDiscount = useCallback((orderAmount, pointBalance) => {
    // 포인트 1P = 1원 할인, 최대 주문 금액의 50%까지 할인 가능
    const maxDiscountByOrder = Math.floor(orderAmount * 0.5);
    const maxDiscountByPoints = pointBalance;
    
    return Math.min(maxDiscountByOrder, maxDiscountByPoints);
  }, []);

  return {
    loading,
    error,
    applyPointDiscount,
    calculateMaxDiscount
  };
};

export default usePoints; 