import React, { useState, useEffect } from 'react';
import { X, Users, Trophy, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import { usePoints } from '../../hooks/usePoints';
import { useChallengeParticipation, useChallengeRewards } from '../../hooks/useChallenge';

const ChallengeJoinModal = ({ 
  challenge, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  
  const { pointBalance, hasEnoughPoints, getShortfall } = usePoints();
  const { joinChallenge } = useChallengeParticipation();
  const { getCurrentTier, calculateTotalReward } = useChallengeRewards();

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setAgreed(false);
    }
  }, [isOpen]);

  if (!isOpen || !challenge) return null;

  const participantCount = challenge.participants?.length || 0;
  const currentTier = getCurrentTier(participantCount);
  const totalReward = calculateTotalReward(challenge.entry_cost, participantCount);
  const canAfford = hasEnoughPoints(challenge.entry_cost);
  const shortfall = getShortfall(challenge.entry_cost);

  // 챌린지 참여 처리
  const handleJoin = async () => {
    if (!agreed) {
      setError('약관에 동의해주세요.');
      return;
    }

    if (!canAfford) {
      setError(`포인트가 부족합니다. ${shortfall}P가 더 필요합니다.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await joinChallenge(challenge.id, challenge.entry_cost);
      
      // 성공 알림
      onSuccess?.({
        type: 'success',
        message: '챌린지에 성공적으로 참여했습니다!',
        challenge: challenge.name,
        pointsUsed: challenge.entry_cost
      });
      
      onClose();
    } catch (err) {
      setError(err.message || '챌린지 참여에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 목표 유형 라벨
  const getGoalTypeLabel = () => {
    switch (challenge.goal_type) {
      case 'WORKOUT_COUNT':
        return '운동 횟수';
      case 'RUNNING_DISTANCE':
        return '달린 거리';
      case 'CALORIE_BURN':
        return '칼로리 소모';
      default:
        return '운동 횟수';
    }
  };

  // 기간 라벨
  const getPeriodLabel = () => {
    return challenge.period === 'W' ? '주간' : '월간';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            챌린지 참여
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 챌린지 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {challenge.name}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>유형:</span>
                <span>{getGoalTypeLabel()} ({getPeriodLabel()})</span>
              </div>
              <div className="flex justify-between">
                <span>목표:</span>
                <span className="font-medium">
                  {challenge.goal_value}
                  {challenge.goal_type === 'WORKOUT_COUNT' && '회'}
                  {challenge.goal_type === 'RUNNING_DISTANCE' && 'km'}
                  {challenge.goal_type === 'CALORIE_BURN' && 'kcal'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>기간:</span>
                <span>
                  {new Date(challenge.start_date).toLocaleDateString()} ~ {' '}
                  {new Date(challenge.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* 참여자 및 보상 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900">참여자 현황</span>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">현재 참여자</span>
                <span className="font-semibold text-blue-600">
                  {participantCount}명
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">보상 단계</span>
                <span className={`px-2 py-1 rounded text-xs font-medium bg-${currentTier.color}-100 text-${currentTier.color}-600`}>
                  {currentTier.label} ({currentTier.multiplier}x)
                </span>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (participantCount / challenge.min_participants) * 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                시작 조건: {challenge.min_participants}명
              </div>
            </div>
          </div>

          {/* 비용 및 보상 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-gray-900">비용 및 보상</span>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">참여비</span>
                <span className="text-lg font-semibold text-red-600">
                  -{challenge.entry_cost}P
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">예상 보상</span>
                <span className="text-lg font-semibold text-green-600">
                  +{totalReward}P
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">예상 수익</span>
                  <span className={`text-lg font-bold ${totalReward > challenge.entry_cost ? 'text-green-600' : 'text-red-600'}`}>
                    {totalReward > challenge.entry_cost ? '+' : ''}{totalReward - challenge.entry_cost}P
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 포인트 잔액 확인 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">내 포인트 잔액</span>
              <span className="font-semibold text-gray-900">{pointBalance}P</span>
            </div>
            {!canAfford && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>포인트가 {shortfall}P 부족합니다</span>
              </div>
            )}
            {canAfford && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>참여 가능합니다</span>
              </div>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-600">
              <h4 className="font-medium text-gray-900 mb-2">참여 안내사항</h4>
              <ul className="space-y-1 text-xs">
                <li>• 챌린지 시작 후에는 중도 탈퇴할 수 없습니다.</li>
                <li>• 목표 달성 시에만 보상을 받을 수 있습니다.</li>
                <li>• 참여자 수에 따라 보상이 변동될 수 있습니다.</li>
                <li>• 운동 기록은 정확히 입력해주세요.</li>
              </ul>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                위 안내사항을 모두 확인했으며, 챌린지 참여에 동의합니다.
              </span>
            </label>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleJoin}
              className="flex-1"
              disabled={loading || !canAfford || !agreed}
              loading={loading}
            >
              {loading ? '참여 중...' : `참여하기 (${challenge.entry_cost}P)`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeJoinModal; 