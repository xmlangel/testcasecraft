// src/main/frontend/src/context/I18nContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { API_CONFIG, getDynamicApiUrl } from '../utils/apiConstants.js';

// 초기 상태
const initialState = {
  currentLanguage: 'ko',
  availableLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어', isDefault: true, isActive: true },
    { code: 'en', name: 'English', nativeName: 'English', isDefault: false, isActive: true }
  ],
  translations: {},
  loading: false,
  error: null
};

// 액션 타입
const I18N_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LANGUAGES: 'SET_LANGUAGES',
  SET_CURRENT_LANGUAGE: 'SET_CURRENT_LANGUAGE',
  SET_TRANSLATIONS: 'SET_TRANSLATIONS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// 리듀서
const i18nReducer = (state, action) => {
  switch (action.type) {
    case I18N_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case I18N_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case I18N_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case I18N_ACTIONS.SET_LANGUAGES:
      return { ...state, availableLanguages: action.payload };
    case I18N_ACTIONS.SET_CURRENT_LANGUAGE:
      return { ...state, currentLanguage: action.payload };
    case I18N_ACTIONS.SET_TRANSLATIONS:
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.languageCode]: action.payload.translations
        },
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

// 컨텍스트 생성
const I18nContext = createContext();

// API 유틸리티
const getApiBaseUrl = async () => {
  try {
    const url = await getDynamicApiUrl();
    return url || window.location.origin;
  } catch (error) {
    console.warn('동적 API URL 로드 실패, 현재 origin 사용:', error);
    return window.location.origin;
  }
};

// API 호출 함수들
const apiCall = async (endpoint, options = {}) => {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  // JWT 토큰이 있으면 Authorization 헤더 추가
  const token = localStorage.getItem('accessToken');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// I18n Provider 컴포넌트
export const I18nProvider = ({ children }) => {
  const [state, dispatch] = useReducer(i18nReducer, initialState);

  // 사용자 선호 언어 우선순위에 따른 결정
  const getUserPreferredLanguage = () => {
    try {
      // 1. 최우선: 로그인한 사용자의 프로필 언어 설정
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.preferredLanguage && user.preferredLanguage.trim()) {
          console.log('사용자 프로필 언어 사용:', user.preferredLanguage);
          return user.preferredLanguage;
        }
      }

      // 2. 차순위: 로컬 스토리지의 임시 언어 설정 (로그인 전 설정)
      const savedLanguage = localStorage.getItem('preferred-language');
      if (savedLanguage && savedLanguage.trim()) {
        console.log('로컬 저장 언어 사용:', savedLanguage);
        return savedLanguage;
      }

      // 3. 브라우저 언어 자동 감지 (지원 언어 내에서)
      const browserLanguage = navigator.language || navigator.languages[0];
      if (browserLanguage) {
        // 영어 계열 언어들
        if (browserLanguage.toLowerCase().includes('en')) {
          console.log('브라우저 언어 감지 (영어):', browserLanguage);
          return 'en';
        }
        // 한국어
        if (browserLanguage.toLowerCase().includes('ko')) {
          console.log('브라우저 언어 감지 (한국어):', browserLanguage);
          return 'ko';
        }
      }

      // 4. 기본값: 한국어
      console.log('기본 언어 사용: ko');
      return 'ko';

    } catch (error) {
      console.warn('언어 설정 로드 중 오류:', error);
      return 'ko'; // 오류 시 기본값
    }
  };

  // 활성화된 언어 목록 로드
  const loadAvailableLanguages = async () => {
    try {
      dispatch({ type: I18N_ACTIONS.SET_LOADING, payload: true });
      const languages = await apiCall('/api/i18n/languages');
      dispatch({ type: I18N_ACTIONS.SET_LANGUAGES, payload: languages });
    } catch (error) {
      console.error('언어 목록 로드 실패:', error);
      dispatch({ type: I18N_ACTIONS.SET_ERROR, payload: '언어 목록을 로드할 수 없습니다' });
    } finally {
      dispatch({ type: I18N_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // 번역 데이터 로드
  const loadTranslations = async (languageCode, forceReload = false) => {
    try {
      dispatch({ type: I18N_ACTIONS.SET_LOADING, payload: true });

      // 강제 재로드가 아니고 이미 로드된 번역이 있는지 확인
      if (!forceReload && state.translations[languageCode]) {
        dispatch({ type: I18N_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      const response = await apiCall(`/api/i18n/translations/${languageCode}`);

      dispatch({
        type: I18N_ACTIONS.SET_TRANSLATIONS,
        payload: {
          languageCode: response.languageCode,
          translations: response.translations
        }
      });
    } catch (error) {
      console.error('번역 데이터 로드 실패:', error);
      dispatch({ type: I18N_ACTIONS.SET_ERROR, payload: '번역 데이터를 로드할 수 없습니다' });
    }
  };

  // 언어 변경 (사용자 프로필 및 서버 동기화)
  const changeLanguage = async (languageCode) => {
    try {
      console.log(`언어 변경 시작: ${languageCode}`);

      // 1. 현재 언어 설정 (즉시 UI 반영)
      dispatch({ type: I18N_ACTIONS.SET_CURRENT_LANGUAGE, payload: languageCode });

      // 2. 번역 데이터 로드 (강제 재로드)
      await loadTranslations(languageCode, true);

      // 3. 로컬 스토리지에 임시 저장 (로그인 전에도 동작)
      localStorage.setItem('preferred-language', languageCode);

      // 4. 로그인한 사용자인 경우 서버 및 사용자 정보 업데이트
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // 서버에 언어 설정 저장
          await apiCall('/api/auth/preferred-language', {
            method: 'PUT',
            body: JSON.stringify({ languageCode })
          });

          // 로컬 사용자 정보도 업데이트
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.preferredLanguage = languageCode;
            localStorage.setItem('user', JSON.stringify(user));
            console.log('사용자 프로필 언어 업데이트 완료:', languageCode);
          }

        } catch (error) {
          console.warn('서버 언어 설정 업데이트 실패 (로컬 설정은 유지):', error);
          // 서버 실패해도 로컬 설정은 유지하여 사용자 경험 보장
        }
      } else {
        console.log('비로그인 상태 - 로컬 설정만 저장됨');
      }

      console.log(`언어 변경 완료: ${languageCode}`);

    } catch (error) {
      console.error('언어 변경 실패:', error);
      dispatch({ type: I18N_ACTIONS.SET_ERROR, payload: '언어 변경에 실패했습니다' });
    }
  };

  // 번역 함수 (fallback 지원)
  const t = (key, defaultValue = null, params = {}) => {
    // 두 번째 매개변수가 문자열이면 기본값으로, 객체면 params로 처리
    let actualDefault = defaultValue;
    let actualParams = params;

    if (typeof defaultValue === 'object' && defaultValue !== null) {
      actualParams = defaultValue;
      actualDefault = null;
    }

    const currentTranslations = state.translations[state.currentLanguage] || {};
    let translation = currentTranslations[key];

    // 번역이 없으면 fallback 시도
    if (!translation) {
      // 기본 언어로 fallback
      const defaultLanguage = state.availableLanguages.find(lang => lang.isDefault)?.code || 'ko';
      if (defaultLanguage !== state.currentLanguage) {
        const defaultTranslations = state.translations[defaultLanguage] || {};
        translation = defaultTranslations[key];
      }

      // 여전히 없으면 제공된 기본값 또는 키 자체 반환
      if (!translation) {
        if (actualDefault) {
          translation = actualDefault;
        } else {
          console.warn(`번역 누락: ${key} (${state.currentLanguage})`);
          translation = key;
        }
      }
    }

    // 매개변수 치환
    if (typeof translation === 'string' && Object.keys(actualParams).length > 0) {
      return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return actualParams[paramKey] !== undefined ? actualParams[paramKey] : match;
      });
    }

    return translation;
  };

  // 초기화
  useEffect(() => {
    const initializeI18n = async () => {
      // 1. 사용자 선호 언어 설정
      const preferredLanguage = getUserPreferredLanguage();
      dispatch({ type: I18N_ACTIONS.SET_CURRENT_LANGUAGE, payload: preferredLanguage });

      // 2. 언어 목록 로드
      await loadAvailableLanguages();

      // 3. 초기 번역 데이터 로드
      await loadTranslations(preferredLanguage);
    };

    initializeI18n();
  }, []); // 빈 의존성 배열

  // 현재 언어 변경 시 번역 데이터 로드
  useEffect(() => {
    if (state.currentLanguage && !state.translations[state.currentLanguage]) {
      loadTranslations(state.currentLanguage);
    }
  }, [state.currentLanguage]);

  const value = {
    // 상태
    currentLanguage: state.currentLanguage,
    availableLanguages: state.availableLanguages,
    translations: state.translations,
    loading: state.loading,
    error: state.error,

    // 함수
    changeLanguage,
    t,
    loadTranslations,
    loadAvailableLanguages,

    // 유틸리티
    clearError: () => dispatch({ type: I18N_ACTIONS.CLEAR_ERROR }),
    getCurrentLanguageInfo: () => state.availableLanguages.find(lang => lang.code === state.currentLanguage),
    isLanguageLoaded: (languageCode) => !!state.translations[languageCode],
    forceReloadTranslations: (languageCode) => loadTranslations(languageCode || state.currentLanguage, true)
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// 커스텀 훅
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n은 I18nProvider 내에서 사용되어야 합니다');
  }
  return context;
};

// 번역 전용 훅 (성능 최적화)
export const useTranslation = () => {
  const { t, currentLanguage, loading } = useI18n();
  return { t, currentLanguage, loading };
};

export default I18nContext;