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

// 기본 export
export default api; 