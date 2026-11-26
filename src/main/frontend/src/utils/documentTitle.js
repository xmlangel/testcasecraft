// src/utils/documentTitle.js
//
// 브라우저 탭 제목. 예전에는 모든 화면이 index.html 의 "I can craft test cases" 로
// 같아서 탭을 여러 개 열면 어느 탭이 어느 화면인지 알 수 없었다(ICT-511).
// "<화면 이름> · Testcase Craft" 로 맞추고, 화면 이름이 없으면 제품명만 쓴다.

export const APP_TITLE = "Testcase Craft";
export const TITLE_SEPARATOR = " · ";

/**
 * @param {string|null|undefined} screenName 화면 이름(번역된 문구)
 * @returns {string} 탭 제목
 */
export const buildDocumentTitle = (screenName) => {
  const name = typeof screenName === "string" ? screenName.trim() : "";
  if (!name || name === APP_TITLE) return APP_TITLE;
  return `${name}${TITLE_SEPARATOR}${APP_TITLE}`;
};
