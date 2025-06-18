// API 모듈들을 중앙에서 관리하는 인덱스 파일

// 개별 API 모듈들 import
export * as workoutAPI from './workoutAPI';
export * as authAPI from './authAPI';
export * as ecommerceAPI from './ecommerceAPI';
export * as communityAPI from './communityAPI';

// 기본 axios 설정
export { default as axiosInstance } from './axiosConfig';

// 편의를 위한 통합 API 객체
export const api = {
  // 운동 관련
  workout: require('./workoutAPI'),
  
  // 인증 관련
  auth: require('./authAPI'),
  
  // 이커머스 관련
  ecommerce: require('./ecommerceAPI'),
  
  // 커뮤니티 관련
  community: require('./communityAPI')
};

// ========== 온보딩 관련 API ==========

// 온보딩 데이터 조회
export const getOnboardingData = async () => {
  try {
    const response = await axiosInstance.get('/onboarding/data/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 온보딩 데이터 저장
export const saveOnboardingData = async (onboardingData) => {
  try {
    const response = await axiosInstance.post('/onboarding/save/', onboardingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 온보딩 데이터 수정
export const updateOnboardingData = async (onboardingData) => {
  try {
    const response = await axiosInstance.post('/onboarding/update/', onboardingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 온보딩 상태 확인
export const getOnboardingStatus = async () => {
  try {
    const response = await axiosInstance.get('/onboarding/status/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 온보딩 선택지 목록 조회
export const getOnboardingChoices = async () => {
  try {
    const response = await axiosInstance.get('/onboarding/choices/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 온보딩 히스토리 조회
export const getOnboardingHistory = async () => {
  try {
    const response = await axiosInstance.get('/onboarding/history/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 온보딩 초기화
export const resetOnboarding = async () => {
  try {
    const response = await axiosInstance.post('/onboarding/reset/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 기본 export
export default api; 