// API 모듈들을 한 곳에서 관리
export * as authAPI from './authAPI';
export * as workoutAPI from './workoutAPI';
export * as ecommerceAPI from './ecommerceAPI';
export * as communityAPI from './communityAPI';
export { default as axiosInstance } from './axiosConfig';

// 편의를 위한 기본 export
export { default as api } from './axiosConfig'; 