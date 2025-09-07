import { useState, useEffect, useCallback } from 'react';
import challengeAPI from '../api/challengeAPI';
import { useChallengePoints } from './usePoints';

// 챌린지 목록 및 상세 정보 관리 훅
export const useChallenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1
  });

  // 챌린지 목록 조회
  const fetchChallenges = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 챌린지 목록 조회 시작:', params);
      const response = await challengeAPI.getChallenges(params);
      console.log('📊 챌린지 API 응답:', response);
      console.log('🔍 response 타입:', typeof response);
      console.log('🔍 Array.isArray(response):', Array.isArray(response));
      
      // 응답이 배열인지 페이지네이션 객체인지 확인
      let challengeList = [];
      let count = 0;
      
      if (Array.isArray(response)) {
        // 배열로 직접 반환된 경우 (페이지네이션 없음)
        challengeList = response;
        count = response.length;
        console.log('📋 배열 응답 - 챌린지 개수:', challengeList.length);
      } else if (response && response.results) {
        // 페이지네이션된 응답
        challengeList = response.results;
        count = response.count || 0;
        console.log('📋 페이지네이션 응답 - 챌린지 개수:', challengeList.length);
      } else {
        console.warn('⚠️ 예상치 못한 응답 형식:', response);
        challengeList = [];
        count = 0;
      }
      
      console.log('📋 최종 챌린지 목록:', challengeList);
      setChallenges(challengeList);
      setPagination({
        count: count,
        next: response.next || null,
        previous: response.previous || null,
        current_page: params.page || 1,
        total_pages: Math.ceil(count / (params.page_size || 20))
      });
      return response;
    } catch (err) {
      setError(err.message || '챌린지 목록 조회에 실패했습니다.');
      console.error('Failed to fetch challenges:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 챌린지 상세 조회
  const fetchChallenge = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const challenge = await challengeAPI.getChallenge(id);
      setCurrentChallenge(challenge);
      return challenge;
    } catch (err) {
      setError(err.message || '챌린지 정보 조회에 실패했습니다.');
      console.error('Failed to fetch challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 챌린지 생성
  const createChallenge = useCallback(async (challengeData) => {
    try {
      setLoading(true);
      setError(null);
      const newChallenge = await challengeAPI.createChallenge(challengeData);
      
      // 목록에 새 챌린지 추가
      setChallenges(prev => [newChallenge, ...prev]);
      
      return newChallenge;
    } catch (err) {
      setError(err.message || '챌린지 생성에 실패했습니다.');
      console.error('Failed to create challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 활성 챌린지 조회
  const fetchActiveChallenges = useCallback(async () => {
    return fetchChallenges({
      status: 'active',
      is_active: true,
      ordering: '-created_at'
    });
  }, [fetchChallenges]);

  // 참여자 수별 챌린지 필터링
  const getChallengesByParticipantCount = useCallback(async (minCount, maxCount) => {
    try {
      const response = await challengeAPI.getChallengesByParticipantCount(minCount, maxCount);
      return response;
    } catch (err) {
      console.error('Failed to get challenges by participant count:', err);
      throw err;
    }
  }, []);

  return {
    challenges,
    currentChallenge,
    loading,
    error,
    pagination,
    fetchChallenges,
    fetchChallenge,
    createChallenge,
    fetchActiveChallenges,
    getChallengesByParticipantCount,
    setCurrentChallenge,
    // 유틸리티 메서드들
    hasNextPage: !!pagination.next,
    hasPreviousPage: !!pagination.previous,
    currentPage: pagination.current_page,
    totalPages: pagination.total_pages
  };
};

// 챌린지 참여 관리 훅
export const useChallengeParticipation = () => {
  const [myParticipations, setMyParticipations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { joinChallengeWithPoints } = useChallengePoints();

  // 내가 참여한 챌린지 목록 조회
  const fetchMyChallenges = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await challengeAPI.getMyChallenges(params);
      setMyParticipations(response.results || []);
      return response;
    } catch (err) {
      setError(err.message || '참여 챌린지 조회에 실패했습니다.');
      console.error('Failed to fetch my challenges:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 챌린지 참여자 목록 조회
  const fetchChallengeParticipants = useCallback(async (challengeId, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await challengeAPI.getChallengeParticipants(challengeId, params);
      setParticipants(response.results || []);
      return response;
    } catch (err) {
      setError(err.message || '참여자 목록 조회에 실패했습니다.');
      console.error('Failed to fetch challenge participants:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 챌린지 참여 (포인트 사용)
  const joinChallenge = useCallback(async (challengeId, pointCost) => {
    try {
      setLoading(true);
      setError(null);
      
      // 포인트로 참여
      await joinChallengeWithPoints(challengeId, pointCost);
      
      // 일반 참여 처리
      const participation = await challengeAPI.joinChallenge(challengeId, {
        entry_points_paid: pointCost,
        joined_with_points: true
      });
      
      // 내 참여 목록 업데이트
      setMyParticipations(prev => [...prev, participation]);
      
      return participation;
    } catch (err) {
      setError(err.message || '챌린지 참여에 실패했습니다.');
      console.error('Failed to join challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [joinChallengeWithPoints]);

  // 챌린지 탈퇴
  const leaveChallenge = useCallback(async (challengeId, participantId) => {
    try {
      setLoading(true);
      setError(null);
      
      await challengeAPI.leaveChallenge(challengeId, participantId);
      
      // 내 참여 목록에서 제거
      setMyParticipations(prev => 
        prev.filter(p => p.id !== participantId)
      );
      
      return true;
    } catch (err) {
      setError(err.message || '챌린지 탈퇴에 실패했습니다.');
      console.error('Failed to leave challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 챌린지 완료 처리
  const completeChallenge = useCallback(async (participantId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await challengeAPI.completeChallenge(participantId);
      
      // 내 참여 목록 업데이트
      setMyParticipations(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, is_completed: true, completion_datetime: new Date().toISOString() }
            : p
        )
      );
      
      return result;
    } catch (err) {
      setError(err.message || '챌린지 완료 처리에 실패했습니다.');
      console.error('Failed to complete challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 챌린지 보상 수령
  const claimReward = useCallback(async (participantId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await challengeAPI.claimChallengeReward(participantId);
      
      // 내 참여 목록 업데이트
      setMyParticipations(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, reward_claimed: true }
            : p
        )
      );
      
      return result;
    } catch (err) {
      setError(err.message || '보상 수령에 실패했습니다.');
      console.error('Failed to claim reward:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 진행 중인 챌린지 목록
  const getInProgressChallenges = useCallback(() => {
    return myParticipations.filter(p => !p.is_completed);
  }, [myParticipations]);

  // 완료된 챌린지 목록
  const getCompletedChallenges = useCallback(() => {
    return myParticipations.filter(p => p.is_completed);
  }, [myParticipations]);

  return {
    myParticipations,
    participants,
    loading,
    error,
    fetchMyChallenges,
    fetchChallengeParticipants,
    joinChallenge,
    leaveChallenge,
    completeChallenge,
    claimReward,
    getInProgressChallenges,
    getCompletedChallenges
  };
};

// 챌린지 진행 상황 관리 훅
export const useChallengeProgress = () => {
  const [userLogs, setUserLogs] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 사용자 로그 조회
  const fetchUserLogs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await challengeAPI.getUserLogs(params);
      setUserLogs(response.results || []);
      return response;
    } catch (err) {
      setError(err.message || '사용자 로그 조회에 실패했습니다.');
      console.error('Failed to fetch user logs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 운동 로그 생성
  const createWorkoutLog = useCallback(async (logData) => {
    try {
      setLoading(true);
      setError(null);
      const newLog = await challengeAPI.createUserLog(logData);
      setUserLogs(prev => [newLog, ...prev]);
      return newLog;
    } catch (err) {
      setError(err.message || '운동 로그 생성에 실패했습니다.');
      console.error('Failed to create workout log:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 주간 운동 목표 달성 여부 확인
  const checkWeeklyGoal = useCallback(async (userId, weekStart, weekEnd) => {
    try {
      const progress = await challengeAPI.checkWeeklyWorkoutGoal(userId, weekStart, weekEnd);
      setWeeklyProgress(progress);
      return progress;
    } catch (err) {
      console.error('Failed to check weekly goal:', err);
      throw err;
    }
  }, []);

  // 챌린지 진행도 업데이트
  const updateProgress = useCallback(async (participantId, progressData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await challengeAPI.updateChallengeProgress(participantId, progressData);
      return result;
    } catch (err) {
      setError(err.message || '진행도 업데이트에 실패했습니다.');
      console.error('Failed to update progress:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    userLogs,
    weeklyProgress,
    loading,
    error,
    fetchUserLogs,
    createWorkoutLog,
    checkWeeklyGoal,
    updateProgress
  };
};

// 챌린지 보상 계산 및 유틸리티 훅
export const useChallengeRewards = () => {
  // 참여자 수에 따른 보상 배수 계산
  const calculateRewardMultiplier = useCallback((participantCount) => {
    return challengeAPI.calculateChallengeReward(100, participantCount) / 100; // 기본 100P 기준으로 배수 계산
  }, []);

  // 총 보상 포인트 계산
  const calculateTotalReward = useCallback((entryCost, participantCount) => {
    return challengeAPI.calculateChallengeReward(entryCost, participantCount);
  }, []);

  // 챌린지 시작 가능 여부 확인
  const canStartChallenge = useCallback((challengeData) => {
    return challengeAPI.canStartChallenge(challengeData);
  }, []);

  // 참여자 수 구간별 정보
  const getParticipantTiers = useCallback(() => {
    return [
      { min: 5, max: 9, multiplier: 1.5, label: '5-9명', color: 'blue' },
      { min: 10, max: 24, multiplier: 2.0, label: '10-24명', color: 'green' },
      { min: 25, max: 49, multiplier: 2.5, label: '25-49명', color: 'yellow' },
      { min: 50, max: 99, multiplier: 3.0, label: '50-99명', color: 'orange' },
      { min: 100, max: Infinity, multiplier: 5.0, label: '100명+', color: 'red' }
    ];
  }, []);

  // 현재 참여자 수에 해당하는 구간 정보
  const getCurrentTier = useCallback((participantCount) => {
    const tiers = getParticipantTiers();
    return tiers.find(tier => 
      participantCount >= tier.min && participantCount <= tier.max
    ) || tiers[0];
  }, [getParticipantTiers]);

  // 다음 구간까지 필요한 참여자 수
  const getNextTierRequirement = useCallback((participantCount) => {
    const tiers = getParticipantTiers();
    const currentTierIndex = tiers.findIndex(tier => 
      participantCount >= tier.min && participantCount <= tier.max
    );
    
    if (currentTierIndex === -1 || currentTierIndex === tiers.length - 1) {
      return null; // 최고 구간이거나 구간을 찾을 수 없음
    }
    
    const nextTier = tiers[currentTierIndex + 1];
    return {
      nextTier,
      remainingParticipants: nextTier.min - participantCount
    };
  }, [getParticipantTiers]);

  return {
    calculateRewardMultiplier,
    calculateTotalReward,
    canStartChallenge,
    getParticipantTiers,
    getCurrentTier,
    getNextTierRequirement
  };
};

export default useChallenge; 