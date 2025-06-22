import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, History, Eye, EyeOff } from 'lucide-react';
import { usePoints, usePointTransactions } from '../../hooks/usePoints';
import Button from '../common/Button';

const PointsWidget = ({ 
  compact = false, 
  showTransactions = true,
  className = '' 
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  
  const { 
    pointBalance, 
    pointSummary, 
    loading: pointsLoading, 
    fetchPointSummary 
  } = usePoints();
  
  const { 
    transactions, 
    loading: transactionsLoading, 
    fetchTransactions 
  } = usePointTransactions();

  useEffect(() => {
    fetchPointSummary();
    if (showTransactions) {
      fetchTransactions({ page_size: 5, ordering: '-created_at' });
    }
  }, [fetchPointSummary, fetchTransactions, showTransactions]);

  // 오늘 포인트 변동량 계산
  const getTodayChange = () => {
    if (!transactions.length) return 0;
    
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(t => 
      new Date(t.created_at).toDateString() === today
    );
    
    return todayTransactions.reduce((sum, t) => {
      return sum + (t.transaction_type === 'EARN' ? t.amount : -t.amount);
    }, 0);
  };

  const todayChange = getTodayChange();

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Coins className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">포인트</span>
          </div>
          <div className="text-right">
            {showBalance ? (
              <div className="text-lg font-semibold text-gray-900">
                {pointsLoading ? '...' : `${pointBalance.toLocaleString()}P`}
              </div>
            ) : (
              <div className="text-lg font-semibold text-gray-400">***P</div>
            )}
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">내 포인트</h3>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 포인트 잔액 */}
      <div className="p-4">
        <div className="text-center mb-4">
          {showBalance ? (
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {pointsLoading ? '로딩 중...' : `${pointBalance.toLocaleString()}P`}
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-400 mb-1">***P</div>
          )}
          <div className="text-sm text-gray-500">사용 가능한 포인트</div>
        </div>

        {/* 오늘 변동량 */}
        {todayChange !== 0 && showBalance && (
          <div className="flex items-center justify-center gap-1 mb-4">
            {todayChange > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  +{todayChange.toLocaleString()}P
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">
                  {todayChange.toLocaleString()}P
                </span>
              </>
            )}
            <span className="text-xs text-gray-500">오늘</span>
          </div>
        )}

        {/* 포인트 요약 */}
        {pointSummary && showBalance && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                +{pointSummary.monthly_earned?.toLocaleString() || 0}P
              </div>
              <div className="text-xs text-gray-500">이번 달 적립</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                -{pointSummary.monthly_used?.toLocaleString() || 0}P
              </div>
              <div className="text-xs text-gray-500">이번 달 사용</div>
            </div>
          </div>
        )}
      </div>

      {/* 최근 거래 내역 */}
      {showTransactions && (
        <div className="border-t">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">최근 내역</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs"
              >
                {showHistory ? '접기' : '더보기'}
              </Button>
            </div>

            {showHistory && (
              <div className="space-y-2">
                {transactionsLoading ? (
                  <div className="text-center text-sm text-gray-500 py-4">
                    로딩 중...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-4">
                    거래 내역이 없습니다
                  </div>
                ) : (
                  transactions.slice(0, 5).map((transaction) => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction}
                      showBalance={showBalance}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 거래 내역 아이템 컴포넌트
const TransactionItem = ({ transaction, showBalance }) => {
  const isEarn = transaction.transaction_type === 'EARN';
  const date = new Date(transaction.created_at);
  const isToday = date.toDateString() === new Date().toDateString();
  
  // 거래 유형별 아이콘 및 색상
  const getTransactionDisplay = () => {
    const type = transaction.reference_type;
    switch (type) {
      case 'WORKOUT':
        return { icon: '💪', color: 'text-green-600', label: '운동 완료' };
      case 'CHALLENGE':
        return { icon: '🏆', color: 'text-blue-600', label: '챌린지' };
      case 'COUPON':
        return { icon: '🎟️', color: 'text-purple-600', label: '쿠폰 구매' };
      case 'ORDER':
        return { icon: '🛒', color: 'text-orange-600', label: '상품 구매' };
      default:
        return { icon: '💰', color: 'text-gray-600', label: '기타' };
    }
  };

  const display = getTransactionDisplay();

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="text-lg">{display.icon}</span>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {transaction.description || display.label}
          </div>
          <div className="text-xs text-gray-500">
            {isToday ? date.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : date.toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className={`text-sm font-semibold ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
        {showBalance ? (
          <>
            {isEarn ? '+' : '-'}{transaction.amount.toLocaleString()}P
          </>
        ) : (
          '***P'
        )}
      </div>
    </div>
  );
};

export default PointsWidget; 