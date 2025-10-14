// src/utils/errorHandler.js
/**
 * 통합 에러 핸들링 시스템
 */

import { ApiError } from '../services/apiService.js';

/**
 * 에러 타입 정의
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
};

/**
 * 에러 분류 함수
 */
export function classifyError(error) {
  if (error instanceof ApiError) {
    if (error.status === 0) return ErrorTypes.NETWORK;
    if (error.status === 401 || error.status === 403) return ErrorTypes.AUTH;
    if (error.status >= 400 && error.status < 500) return ErrorTypes.VALIDATION;
    if (error.status >= 500) return ErrorTypes.SERVER;
  }
  
  return ErrorTypes.UNKNOWN;
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
export function getUserFriendlyMessage(error) {
  const errorType = classifyError(error);
  
  switch (errorType) {
    case ErrorTypes.NETWORK:
      return '네트워크 연결을 확인해주세요.';
    
    case ErrorTypes.AUTH:
      return '로그인이 필요하거나 권한이 없습니다.';
    
    case ErrorTypes.VALIDATION:
      return error.message || '입력한 정보를 확인해주세요.';
    
    case ErrorTypes.SERVER:
      return '서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.';
  }
}

/**
 * 글로벌 에러 핸들러 클래스
 */
class ErrorHandler {
  constructor() {
    this.errorListeners = [];
    this.setupGlobalHandlers();
  }

  /**
   * 글로벌 에러 핸들러 설정
   */
  setupGlobalHandlers() {
    // unhandled promise rejection 처리
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
      event.preventDefault();
    });

    // 일반 JavaScript 에러 처리
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError(event.error);
    });

    // 인증 실패 이벤트 처리
    window.addEventListener('auth:logout', () => {
      this.handleAuthFailure();
    });
  }

  /**
   * 에러 처리
   */
  handleError(error) {
    const errorType = classifyError(error);
    const userMessage = getUserFriendlyMessage(error);

    // 에러 정보 객체 생성
    const errorInfo = {
      type: errorType,
      originalError: error,
      message: userMessage,
      timestamp: new Date().toISOString(),
    };

    // 개발 환경에서 에러 정보만 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Handled:', { type: errorType, message: userMessage, error });
    }

    // 에러 리스너들에게 알림
    this.notifyListeners(errorInfo);

    // 에러 로깅 (운영 환경에서)
    if (process.env.NODE_ENV === 'production') {
      this.logError(errorInfo);
    }

    return errorInfo;
  }

  /**
   * 인증 실패 처리
   */
  handleAuthFailure() {
    // 로그인 페이지로 리다이렉트하거나 모달 표시
    this.notifyListeners({
      type: ErrorTypes.AUTH,
      message: '세션이 만료되었습니다. 다시 로그인해주세요.',
      timestamp: new Date().toISOString(),
      requiresReauth: true,
    });
  }

  /**
   * 에러 리스너 등록
   */
  addErrorListener(listener) {
    this.errorListeners.push(listener);
    
    // 리스너 제거 함수 반환
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * 에러 리스너들에게 알림
   */
  notifyListeners(errorInfo) {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * 에러 로깅 (운영 환경)
   */
  logError(errorInfo) {
    // 여기에 외부 로깅 서비스 연동 (예: Sentry, LogRocket 등)
    // 현재는 콘솔에만 출력
    console.error('Production error:', errorInfo);
  }

  /**
   * 비동기 함수를 에러 핸들링으로 감싸는 유틸리티
   */
  wrapAsync(asyncFn) {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        this.handleError(error);
        throw error; // 호출자가 필요시 추가 처리할 수 있도록 재던짐
      }
    };
  }

  /**
   * React 컴포넌트용 에러 바운더리 헬퍼
   */
  createErrorBoundaryInfo(error, errorInfo) {
    return {
      type: ErrorTypes.UNKNOWN,
      message: '화면을 표시하는 중 오류가 발생했습니다.',
      originalError: error,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    };
  }
}

// 싱글톤 인스턴스 생성 및 export
const errorHandler = new ErrorHandler();

export default errorHandler;
export { ErrorHandler };