import axiosInstance from './axiosConfig';

// ========== 챌린지 CRUD ==========

// 챌린지 목록 조회 (필터링: status, is_personal, goal_type)
export const getChallenges = async (params) => {
  try {
    const response = await axiosInstance.get('/challenges/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 챌린지 상세 조회
export const getChallenge = async (id) => {
  try {
    const response = await axiosInstance.get(`/challenges/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 챌린지 생성
export const createChallenge = async (challengeData) => {
  try {
    const response = await axiosInstance.post('/challenges/', challengeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 챌린지 수정
export const updateChallenge = async (id, challengeData) => {
  try {
    const response = await axiosInstance.put(`/challenges/${id}/`, challengeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 챌린지 삭제
export const deleteChallenge = async (id) => {
  try {
    const response = await axiosInstance.delete(`/challenges/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 챌린지 참여 관리 ==========

// 챌린지 참여자 목록 조회
export const getChallengeParticipants = async (challengeId, params) => {
  try {
    const response = await axiosInstance.get(`/challenges/${challengeId}/participants/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 챌린지 참여
export const joinChallenge = async (challengeId, participantData) => {
  try {
    const response = await axiosInstance.post(`/challenges/${challengeId}/participants/`, participantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 챌린지 탈퇴
export const leaveChallenge = async (challengeId, participantId) => {
  try {
    const response = await axiosInstance.delete(`/challenges/${challengeId}/participants/${participantId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 내가 참여한 챌린지 목록
export const getMyChallenges = async (params) => {
  try {
    const response = await axiosInstance.get('/challenge-participants/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 챌린지 진행 상황 ==========

// 챌린지 진행 상황 업데이트
export const updateChallengeProgress = async (participantId, progressData) => {
  try {
    const response = await axiosInstance.patch(`/challenge-participants/${participantId}/`, progressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 챌린지 완료 처리
export const completeChallenge = async (participantId) => {
  try {
    const response = await axiosInstance.post(`/challenge-participants/${participantId}/complete/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 챌린지 보상 수령
export const claimChallengeReward = async (participantId) => {
  try {
    const response = await axiosInstance.post(`/challenge-participants/${participantId}/claim_reward/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 사용자 로그 및 통계 ==========

// 사용자 운동 로그 조회 (챌린지 진행도 계산용)
export const getUserLogs = async (params) => {
  try {
    const response = await axiosInstance.get('/user-logs/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 사용자 로그 생성 (운동 기록 시 자동 생성)
export const createUserLog = async (logData) => {
  try {
    const response = await axiosInstance.post('/user-logs/', logData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 소셜 공유 ==========

// 챌린지 소셜 공유
export const shareChallengeToSocial = async (challengeId, shareData) => {
  try {
    const response = await axiosInstance.post('/social-shares/', {
      content_type: 'challenge',
      object_id: challengeId,
      ...shareData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 소셜 공유 내역 조회
export const getSocialShares = async (params) => {
  try {
    const response = await axiosInstance.get('/social-shares/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========== 편의 함수들 ==========

// 활성 챌린지 목록 조회 (참여 가능한 챌린지)
export const getActiveChallenges = async () => {
  return getChallenges({
    status: 'active',
    is_active: true,
    ordering: '-created_at'
  });
};

// 내가 생성한 챌린지 목록
export const getMyCreatedChallenges = async () => {
  return getChallenges({
    is_personal: false, // 공개 챌린지만
    ordering: '-created_at'
  });
};

// 완료된 챌린지 목록
export const getCompletedChallenges = async () => {
  return getMyChallenges({
    is_completed: true,
    ordering: '-completion_datetime'
  });
};

// 진행 중인 챌린지 목록
export const getInProgressChallenges = async () => {
  return getMyChallenges({
    is_completed: false,
    ordering: '-join_datetime'
  });
};

// 챌린지 유형별 조회
export const getChallengesByType = async (goalType) => {
  return getChallenges({
    goal_type: goalType,
    status: 'active',
    ordering: '-created_at'
  });
};

// 참여자 수 기준 챌린지 필터링
export const getChallengesByParticipantCount = async (minCount, maxCount) => {
  const challenges = await getActiveChallenges();
  return challenges.results?.filter(challenge => {
    const participantCount = challenge.participants?.length || 0;
    return participantCount >= minCount && (maxCount ? participantCount <= maxCount : true);
  });
};

// 포인트를 사용한 챌린지 참여
export const joinChallengeWithPoints = async (challengeId, pointCost) => {
  try {
    // 먼저 포인트 사용
    const { usePointsForChallenge } = await import('./pointsAPI');
    await usePointsForChallenge(challengeId, pointCost);
    
    // 챌린지 참여
    const participantData = {
      point_cost: pointCost,
      joined_with_points: true
    };
    
    return await joinChallenge(challengeId, participantData);
  } catch (error) {
    throw error;
  }
};

// 챌린지 보상 계산 (참여자 수 기준)
export const calculateChallengeReward = (baseCost, participantCount) => {
  let multiplier = 1.5; // 기본 배수
  
  if (participantCount >= 100) {
    multiplier = 5;
  } else if (participantCount >= 50) {
    multiplier = 3;
  } else if (participantCount >= 25) {
    multiplier = 2.5;
  } else if (participantCount >= 10) {
    multiplier = 2;
  } else if (participantCount >= 5) {
    multiplier = 1.5;
  }
  
  return Math.floor(baseCost * multiplier);
};

// 챌린지 시작 가능 여부 확인
export const canStartChallenge = (challengeData) => {
  const participantCount = challengeData.participants?.length || 0;
  const minParticipants = 5; // 최소 참여자 수
  
  return {
    canStart: participantCount >= minParticipants,
    participantCount,
    minParticipants,
    shortfall: Math.max(0, minParticipants - participantCount)
  };
};

// 주간 운동 목표 달성 여부 확인
export const checkWeeklyWorkoutGoal = async (userId, weekStart, weekEnd) => {
  try {
    const logs = await getUserLogs({
      user: userId,
      date__gte: weekStart,
      date__lte: weekEnd,
      log_type: 'workout_count'
    });
    
    const totalWorkouts = logs.results?.reduce((sum, log) => sum + log.value, 0) || 0;
    return {
      totalWorkouts,
      goalAchieved: totalWorkouts >= 3, // 주 3회 기본 목표
      logs: logs.results
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeParticipants,
  joinChallenge,
  leaveChallenge,
  getMyChallenges,
  updateChallengeProgress,
  completeChallenge,
  claimChallengeReward,
  getUserLogs,
  createUserLog,
  shareChallengeToSocial,
  getSocialShares,
  getActiveChallenges,
  getMyCreatedChallenges,
  getCompletedChallenges,
  getInProgressChallenges,
  getChallengesByType,
  getChallengesByParticipantCount,
  joinChallengeWithPoints,
  calculateChallengeReward,
  canStartChallenge,
  checkWeeklyWorkoutGoal
}; 