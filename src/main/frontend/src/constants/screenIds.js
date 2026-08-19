// src/constants/screenIds.js
//
// 화면 ID(S0~S11) 정의와 주소 → 화면 ID 판별.
//
// 화면 기획 문서(`docs/screen_spec/`)의 화면 구분과 1:1로 맞춘다. 화면 하단에 이 ID를
// 작게 띄워 두면 QA·기획이 보고 있는 화면을 문서에서 바로 찾을 수 있다.
// 문서의 폴더 번호와 여기의 ID 번호가 같아야 한다 — 한쪽만 고치면 추적이 끊긴다.

/** 화면 ID → 이름·문서 폴더 */
export const SCREENS = {
  S0: { name: "로그인·계정", folder: "0.로그인계정" },
  S1: { name: "프로젝트", folder: "1.프로젝트" },
  S2: { name: "공통 레이아웃", folder: "2.공통레이아웃" },
  S3: { name: "대시보드", folder: "3.대시보드" },
  S4: { name: "테스트케이스", folder: "4.테스트케이스" },
  S5: { name: "테스트 플랜", folder: "5.테스트플랜" },
  S6: { name: "테스트 실행", folder: "6.테스트실행" },
  S7: { name: "테스트 결과", folder: "7.테스트결과" },
  S8: { name: "자동화 테스트", folder: "8.자동화테스트" },
  S9: { name: "RAG 문서", folder: "9.RAG문서" },
  S10: { name: "탐색 세션", folder: "10.탐색세션" },
  S11: { name: "관리자 설정", folder: "11.관리자설정" },
};

// 판별 규칙. 위에서부터 먼저 맞는 것을 쓴다 — 순서가 규칙의 일부다.
// 프로젝트 안의 실행 목록과 결과 통계가 같은 주소를 쓰므로(`viewType` 쿼리로 갈린다)
// 결과 쪽 규칙을 실행 쪽보다 앞에 둔다.
const RULES = [
  // 인증 밖 / 전역
  [/^\/(login)?$/, "S0"],
  [/^\/verify-email/, "S0"],
  [/^\/manual/, "S0"],
  [/^\/guides\//, "S0"],
  [/^\/dashboard/, "S3"],
  [/^\/organizations/, "S11"],
  [/^\/users/, "S11"],
  [/^\/mail-settings/, "S11"],
  [/^\/llm-config/, "S11"],
  [/^\/scheduler/, "S11"],
  [/^\/translation-management/, "S11"],
  [/^\/junit-results\//, "S8"],
  [/^\/automation-tests\//, "S8"],
  [/^\/executions\//, "S6"],

  // 프로젝트 작업공간
  [/^\/projects\/[^/]+\/bookmarks/, "S2"],
  [/^\/projects\/[^/]+\/settings/, "S1"],
  [/^\/projects\/[^/]+\/testcases/, "S4"],
  [/^\/projects\/[^/]+\/testplans/, "S5"],
  [/^\/projects\/[^/]+\/results/, "S7"],
  [/^\/projects\/[^/]+\/executions/, "S6"], // 결과 판별은 아래 viewType 처리에서 앞선다
  [/^\/projects\/[^/]+\/(automation|junit)/, "S8"],
  [/^\/projects\/[^/]+\/rag/, "S9"],
  [/^\/projects\/[^/]+\/exploratory/, "S10"],
  [/^\/projects\/[^/]+\/?$/, "S3"], // 프로젝트 진입 직후 기본 영역
  [/^\/projects\/?$/, "S1"],
];

/**
 * 주소로 화면 ID를 판별한다.
 *
 * @param {string} pathname 예: `/projects/abc/testcases`
 * @param {string} [search] 예: `?viewType=summary`
 * @returns {string|null} 화면 ID. 규칙에 없는 주소면 `null`
 */
export const resolveScreenId = (pathname, search = "") => {
  if (!pathname) return null;
  const path = pathname.replace(/\/+$/, "") || "/";

  // 실행 주소에 viewType 이 붙으면 결과 통계 화면이다(같은 주소를 두 화면이 나눠 쓴다).
  if (/^\/projects\/[^/]+\/executions/.test(path) && /(\?|&)viewType=/.test(`?${search.replace(/^\?/, "")}`)) {
    return "S7";
  }

  const hit = RULES.find(([re]) => re.test(path));
  return hit ? hit[1] : null;
};

/** 화면 ID 로 기획 문서 폴더 경로를 만든다 */
export const screenDocPath = (id) =>
  SCREENS[id] ? `docs/screen_spec/${SCREENS[id].folder}/` : null;
