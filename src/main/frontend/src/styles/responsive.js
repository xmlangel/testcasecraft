// src/styles/responsive.js
// ICT-510: 좁은 화면 전환 경계.
//
// MUI 기본 경계(md 900px, lg 1200px)와 맞지 않아 폭을 직접 적는다. 리뷰(P0-1)가
// 정한 기준이 1024px·768px 이기 때문이다. 둘 다 "미만"이라 .95 를 붙인다
// (MUI breakpoints.down 과 같은 방식).

/** 1024px 미만: 좌측 영역 메뉴를 서랍(Drawer)으로, 상단 텍스트 메뉴를 햄버거 하나로 묶는다. */
export const COMPACT_NAV_QUERY = "(max-width:1023.95px)";

/** 768px 미만: 테스트케이스 트리·상세 2단을 1단(트리 위, 상세 아래)으로 바꾼다. */
export const SINGLE_PANE_QUERY = "(max-width:767.95px)";

/** sx 안에서 쓰는 미디어 쿼리 키 */
export const COMPACT_NAV_MEDIA = `@media ${COMPACT_NAV_QUERY}`;
export const SINGLE_PANE_MEDIA = `@media ${SINGLE_PANE_QUERY}`;
