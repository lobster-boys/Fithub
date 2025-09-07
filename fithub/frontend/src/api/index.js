// API 모듈들을 중앙에서 관리하는 인덱스 파일

// 개별 API 모듈들 import
import * as workoutAPIModule from './workoutAPI';
import * as authAPIModule from './authAPI';
import * as ecommerceAPIModule from './ecommerceAPI';
import * as communityAPIModule from './communityAPI';
import axiosInstance from './axiosConfig';

// 개별 API 모듈들을 다시 export
export { workoutAPIModule as workoutAPI };
export { authAPIModule as authAPI };
export { ecommerceAPIModule as ecommerceAPI };
export { communityAPIModule as communityAPI };

// 기본 axios 설정
export { axiosInstance };

// 편의를 위한 통합 API 객체
export const api = {
  // 운동 관련
  workout: workoutAPIModule,
  
  // 인증 관련
  auth: authAPIModule,
  
  // 이커머스 관련
  ecommerce: ecommerceAPIModule,
  
  // 커뮤니티 관련
  community: communityAPIModule
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