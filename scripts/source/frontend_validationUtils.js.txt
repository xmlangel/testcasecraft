// src/utils/validationUtils.js
/**
 * 검증 관련 유틸리티 함수들
 */

/**
 * 이메일 주소 유효성 검사
 * @param {string} email - 검사할 이메일 주소
 * @returns {boolean} 유효성 여부
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * 비밀번호 강도 검사
 * @param {string} password - 검사할 비밀번호
 * @returns {object} 검사 결과 { isValid, strength, issues }
 */
export function validatePassword(password) {
  const result = {
    isValid: false,
    strength: 'weak',
    issues: [],
  };
  
  if (!password || typeof password !== 'string') {
    result.issues.push('비밀번호를 입력해주세요.');
    return result;
  }
  
  if (password.length < 8) {
    result.issues.push('비밀번호는 8자 이상이어야 합니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    result.issues.push('소문자를 포함해야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    result.issues.push('대문자를 포함해야 합니다.');
  }
  
  if (!/\d/.test(password)) {
    result.issues.push('숫자를 포함해야 합니다.');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.issues.push('특수문자를 포함해야 합니다.');
  }
  
  const strengthScore = 5 - result.issues.length;
  
  if (strengthScore >= 4) {
    result.strength = 'strong';
    result.isValid = true;
  } else if (strengthScore >= 2) {
    result.strength = 'medium';
    result.isValid = true;
  } else {
    result.strength = 'weak';
    result.isValid = false;
  }
  
  return result;
}

/**
 * 사용자명 유효성 검사
 * @param {string} username - 검사할 사용자명
 * @returns {object} 검사 결과 { isValid, issues }
 */
export function validateUsername(username) {
  const result = {
    isValid: false,
    issues: [],
  };
  
  if (!username || typeof username !== 'string') {
    result.issues.push('사용자명을 입력해주세요.');
    return result;
  }
  
  const trimmedUsername = username.trim();
  
  if (trimmedUsername.length < 3) {
    result.issues.push('사용자명은 3자 이상이어야 합니다.');
  }
  
  if (trimmedUsername.length > 20) {
    result.issues.push('사용자명은 20자 이하여야 합니다.');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    result.issues.push('사용자명은 영문, 숫자, 언더스코어, 하이픈만 사용할 수 있습니다.');
  }
  
  result.isValid = result.issues.length === 0;
  return result;
}

/**
 * 필수 입력 필드 검사
 * @param {any} value - 검사할 값
 * @param {string} fieldName - 필드명
 * @returns {object} 검사 결과 { isValid, message }
 */
export function validateRequired(value, fieldName = '필드') {
  const isValid = value !== null && value !== undefined && 
                  (typeof value === 'string' ? value.trim() !== '' : true);
  
  return {
    isValid,
    message: isValid ? '' : `${fieldName}는 필수 입력 항목입니다.`,
  };
}

/**
 * 문자열 길이 검사
 * @param {string} value - 검사할 문자열
 * @param {number} minLength - 최소 길이
 * @param {number} maxLength - 최대 길이
 * @param {string} fieldName - 필드명
 * @returns {object} 검사 결과 { isValid, message }
 */
export function validateLength(value, minLength = 0, maxLength = Infinity, fieldName = '필드') {
  if (!value || typeof value !== 'string') {
    return {
      isValid: false,
      message: `${fieldName}는 문자열이어야 합니다.`,
    };
  }
  
  const trimmedValue = value.trim();
  
  if (trimmedValue.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName}는 ${minLength}자 이상이어야 합니다.`,
    };
  }
  
  if (trimmedValue.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName}는 ${maxLength}자 이하여야 합니다.`,
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
}

/**
 * 숫자 범위 검사
 * @param {number} value - 검사할 값
 * @param {number} min - 최솟값
 * @param {number} max - 최댓값
 * @param {string} fieldName - 필드명
 * @returns {object} 검사 결과 { isValid, message }
 */
export function validateNumberRange(value, min = -Infinity, max = Infinity, fieldName = '필드') {
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      message: `${fieldName}는 유효한 숫자여야 합니다.`,
    };
  }
  
  if (value < min) {
    return {
      isValid: false,
      message: `${fieldName}는 ${min} 이상이어야 합니다.`,
    };
  }
  
  if (value > max) {
    return {
      isValid: false,
      message: `${fieldName}는 ${max} 이하여야 합니다.`,
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
}

/**
 * 다중 검증 실행
 * @param {Array} validations - 검증 함수들의 배열
 * @returns {object} 검사 결과 { isValid, messages }
 */
export function validateMultiple(validations) {
  const messages = [];
  let isValid = true;
  
  for (const validation of validations) {
    if (typeof validation === 'function') {
      const result = validation();
      if (result && !result.isValid) {
        isValid = false;
        if (result.message) {
          messages.push(result.message);
        }
        if (result.issues && Array.isArray(result.issues)) {
          messages.push(...result.issues);
        }
      }
    }
  }
  
  return {
    isValid,
    messages,
  };
}

/**
 * 폼 데이터 전체 검증
 * @param {object} formData - 폼 데이터
 * @param {object} validationRules - 검증 규칙
 * @returns {object} 검사 결과 { isValid, errors }
 */
export function validateForm(formData, validationRules) {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const fieldValue = formData[fieldName];
    const fieldErrors = [];
    
    for (const rule of rules) {
      const result = rule(fieldValue, fieldName);
      if (result && !result.isValid) {
        if (result.message) {
          fieldErrors.push(result.message);
        }
        if (result.issues && Array.isArray(result.issues)) {
          fieldErrors.push(...result.issues);
        }
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
      isValid = false;
    }
  }
  
  return {
    isValid,
    errors,
  };
}