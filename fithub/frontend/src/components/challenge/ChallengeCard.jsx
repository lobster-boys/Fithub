import React from 'react';
import { Clock, Users, Trophy, Zap, Calendar } from 'lucide-react';
import Button from '../common/Button';
import { useChallengeRewards } from '../../hooks/useChallenge';

const ChallengeCard = ({ 
  challenge, 
  onJoin, 
  onView, 
  currentUser,
  showJoinButton = true,
  className = ''
}) => {
  const { getCurrentTier, getNextTierRequirement } = useChallengeRewards();
  
  // 참여자 수 및 보상 정보
  const participantCount = challenge.participants?.length || 0;
  const currentTier = getCurrentTier(participantCount);
  const nextTierInfo = getNextTierRequirement(participantCount);
  const isUserParticipating = challenge.participants?.some(p => p.user === currentUser?.id);
  const canStart = participantCount >= challenge.min_participants;
  const totalReward = Math.floor(challenge.entry_cost * currentTier.multiplier);

  // 챌린지 상태 색상
  const getStatusColor = () => {
    if (challenge.status === 'completed') return 'text-green-600 bg-green-100';
    if (canStart) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  // 챌린지 유형 아이콘
  const getGoalTypeIcon = () => {
    switch (challenge.goal_type) {
      case 'WORKOUT_COUNT':
        return <Zap className="w-4 h-4" />;
      case 'RUNNING_DISTANCE':
        return <Clock className="w-4 h-4" />;
      case 'CALORIE_BURN':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
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
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {challenge.name}
              </h3>
              {challenge.is_personal && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  개인
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getGoalTypeIcon()}
              <span>{getGoalTypeLabel()}</span>
              <span>•</span>
              <span>{getPeriodLabel()}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {challenge.status === 'completed' ? '완료' : canStart ? '진행중' : '모집중'}
          </div>
        </div>

        {/* 설명 */}
        {challenge.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {challenge.description}
          </p>
        )}

        {/* 목표 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">목표</span>
            <span className="text-lg font-semibold text-gray-900">
              {challenge.goal_value}
              {challenge.goal_type === 'WORKOUT_COUNT' && '회'}
              {challenge.goal_type === 'RUNNING_DISTANCE' && 'km'}
              {challenge.goal_type === 'CALORIE_BURN' && 'kcal'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {new Date(challenge.start_date).toLocaleDateString()} ~ {' '}
                {new Date(challenge.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* 참여자 및 보상 정보 */}
        <div className="space-y-3 mb-4">
          {/* 참여자 수 - 개인 챌린지는 다르게 표시 */}
          {!challenge.is_personal ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">참여자</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {participantCount}명
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium bg-${currentTier.color}-100 text-${currentTier.color}-600`}>
                  {currentTier.label}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">개인 챌린지</span>
              </div>
              <span className="text-sm font-medium text-purple-600">
                나만의 도전
              </span>
            </div>
          )}

          {/* 진행 상황 바 - 공개 챌린지만 표시 */}
          {!challenge.is_personal && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>최소 {challenge.min_participants}명</span>
                {nextTierInfo && (
                  <span>
                    다음 단계까지 {nextTierInfo.remainingParticipants}명
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-${currentTier.color}-500 transition-all duration-300`}
                  style={{ 
                    width: `${Math.min(100, (participantCount / challenge.min_participants) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* 포인트 정보 - 개인 챌린지는 다르게 표시 */}
          {!challenge.is_personal ? (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                참여비: <span className="font-medium text-gray-900">{challenge.entry_cost}P</span>
              </div>
              <div className="text-sm text-gray-600">
                보상: <span className="font-medium text-green-600">{totalReward}P</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({currentTier.multiplier}x)
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-sm text-purple-600">
                개인 목표 달성 시 <span className="font-medium">자기만족</span> 획득!
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(challenge)}
            className="flex-1"
          >
            자세히 보기
          </Button>
          
          {/* 개인 챌린지는 참여 버튼 대신 다른 버튼 표시 */}
          {challenge.is_personal ? (
            <div className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg text-center">
              내 챌린지
            </div>
          ) : (
            <>
              {showJoinButton && !isUserParticipating && challenge.status === 'active' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onJoin(challenge)}
                  className="flex-1"
                  disabled={!canStart && participantCount >= challenge.min_participants}
                >
                  {canStart ? `참여하기 (${challenge.entry_cost}P)` : '모집중'}
                </Button>
              )}
              
              {isUserParticipating && (
                <div className="flex-1 px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg text-center">
                  참여 중
                </div>
              )}
            </>
          )}
        </div>

        {/* 추가 정보 */}
        {nextTierInfo && participantCount < 100 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 {nextTierInfo.remainingParticipants}명이 더 참여하면 보상이{' '}
              <span className="font-semibold">
                {Math.floor(challenge.entry_cost * nextTierInfo.nextTier.multiplier)}P
              </span>
              로 증가합니다!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard; 