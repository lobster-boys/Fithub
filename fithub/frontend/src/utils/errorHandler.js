/**
 * 중앙화된 에러 처리 시스템
 */

// 에러 타입 정의
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: '네트워크 연결을 확인해주세요.',
  [ERROR_TYPES.VALIDATION]: '입력된 정보를 다시 확인해주세요.',
  [ERROR_TYPES.AUTHENTICATION]: '로그인이 필요한 서비스입니다.',
  [ERROR_TYPES.AUTHORIZATION]: '권한이 없습니다.',
  [ERROR_TYPES.NOT_FOUND]: '요청한 데이터를 찾을 수 없습니다.',
  [ERROR_TYPES.SERVER]: '서버에 일시적인 오류가 발생했습니다.',
  [ERROR_TYPES.UNKNOWN]: '알 수 없는 오류가 발생했습니다.'
};

/**
 * HTTP 상태 코드를 기반으로 에러 타입 결정
 */
export const getErrorType = (error) => {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response.status;
  
  switch (status) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * 에러 타입에 따른 사용자 친화적 메시지 반환
 */
export const getErrorMessage = (error, customMessage = null) => {
  if (customMessage) {
    return customMessage;
  }

  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType];
};

/**
 * 표준화된 에러 객체 생성
 */
export const createStandardError = (error, context = '') => {
  const errorType = getErrorType(error);
  const message = getErrorMessage(error);
  
  return {
    type: errorType,
    message,
    context,
    originalError: error,
    details: error.response?.data || null,
    status: error.response?.status || null
  };
};

/**
 * 에러 로깅 (개발 환경에서만)
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Diet API Error - ${context}`);
    console.error('Error Type:', getErrorType(error));
    console.error('Message:', getErrorMessage(error));
    console.error('Status:', error.response?.status);
    console.error('Details:', error.response?.data);
    console.error('Original Error:', error);
    console.groupEnd();
  }
};

/**
 * API 에러 처리 헬퍼 함수
 */
export const handleApiError = (error, context = '', customMessage = null) => {
  logError(error, context);
  const standardError = createStandardError(error, context);
  
  if (customMessage) {
    standardError.message = customMessage;
  }
  
  return standardError;
}; 