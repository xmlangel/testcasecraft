// src/styles/layoutConstants.js
// ICT-272: 전체 애플리케이션 표준 레이아웃 패턴

/**
 * 표준 컨테이너 maxWidth 설정
 *
 * 화면 폭을 그대로 쓴다. 이전에는 md 1600px·lg 1900px·xl 98vw 로 묶어 두었는데, 가로가 넓은
 * 모니터에서 목록 열이 좁아지고 양옆에 쓰지 않는 띠가 남았다. 좌우 여백은 아래 컨테이너
 * 패딩으로만 준다.
 */
export const STANDARD_MAX_WIDTH = {
  xs: "100%",
  sm: "100%",
  md: "100%",
  lg: "100%",
  xl: "100%",
};

/**
 * 페이지별 컨테이너 스타일 템플릿
 */
export const PAGE_CONTAINER_SX = {
  // 메인 페이지 컨테이너 (Dashboard, ProjectManager 등)
  main: {
    maxWidth: STANDARD_MAX_WIDTH,
    mx: "auto",
    p: 1.5,
    bgcolor: "background.default",
    minHeight: "calc(100vh - 64px)", // AppBar 높이 제외
  },

  // 탭·좌측 메뉴 본문에 얹히는 화면 (App.jsx 가 이미 Paper 를 두른 자리)
  //
  // main 과 달리 배경을 칠하지 않는다. background.default(#F8FAFC)를 Paper 안에 다시
  // 칠하면 유리 질감이 덮여 그 화면만 회색 판으로 보인다 — 테스트결과·자동화가
  // 테스트실행·테스트플랜과 달라 보였던 이유다. 높이도 감싼 Paper 가 정한다.
  tabContent: {
    maxWidth: STANDARD_MAX_WIDTH,
    mx: "auto",
    p: 1.5,
  },

  // 폼 페이지 컨테이너 (TestExecutionForm, TestPlanForm 등)
  form: {
    maxWidth: STANDARD_MAX_WIDTH,
    mx: "auto",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 1,
    p: 2,
    mt: 1.5,
    mb: 1.5,
  },

  // 다이얼로그 내부 컨테이너
  dialog: {
    maxWidth: "100%",
    p: 2,
  },

  // 카드/Paper 컨테이너
  card: {
    maxWidth: "100%",
    p: 2,
    borderRadius: 2,
    elevation: 1,
  },
};

/**
 * 표준 Grid 설정
 */
export const GRID_SETTINGS = {
  // 메인 콘텐츠 영역
  mainContent: {
    container: true,
    spacing: 3,
    sx: { mt: 1 },
  },

  // 폼 영역
  formContent: {
    container: true,
    spacing: 2,
  },

  // 대시보드 카드 그리드
  dashboardCards: {
    container: true,
    spacing: 3,
    sx: { mt: 2 },
  },
};

/**
 * 반응형 브레이크포인트별 설정
 * MUI Grid v2: size={{ xs: ..., md: ... }} 구문 사용
 */
export const RESPONSIVE_SETTINGS = {
  // 사이드바가 있는 레이아웃
  withSidebar: {
    size: {
      xs: 12,
      md: 8,
      lg: 9,
      xl: 10,
    },
  },

  // 전체 폭 사용하는 레이아웃
  fullWidth: {
    size: {
      xs: 12,
    },
  },

  // 절반 폭 사용하는 레이아웃
  halfWidth: {
    size: {
      xs: 12,
      md: 6,
    },
  },

  // 1/3 폭 사용하는 레이아웃
  thirdWidth: {
    size: {
      xs: 12,
      sm: 6,
      md: 4,
    },
  },
};

/**
 * 공통 스타일 유틸리티
 */
export const LAYOUT_UTILS = {
  // 중앙 정렬 컨테이너
  centerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  },

  // 플렉스 헤더 (제목 + 액션 버튼)
  flexHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2,
  },

  // 스크롤 가능한 콘텐츠
  scrollableContent: {
    maxHeight: "70vh",
    overflowY: "auto",
    overflowX: "hidden",
  },
};

/**
 * 화면 제목 규격 — 앞 아이콘 + 제목 한 줄 (한 곳에서 정의).
 *
 * 대시보드·테스트실행·테스트결과·자동화 테스트가 같은 값을 쓴다. 화면마다
 * variant·fontWeight·아이콘 크기를 손으로 적으면 한쪽만 바뀌어 제목이 튄다.
 * 실제 렌더는 components/common/PageTitle.jsx 가 담당한다.
 */
export const PAGE_TITLE = {
  /** 아이콘·제목·부속물을 담는 줄 */
  row: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    flexWrap: "wrap",
    mb: 2,
  },
  /** 제목 앞 아이콘 (제목 글자 24px 보다 살짝 크게) */
  icon: {
    fontSize: 26,
  },
  /** 제목 글자 — theme h5(1.5rem) 에 굵기만 올린다 */
  text: {
    fontWeight: 700,
  },
};

/**
 * 네비게이션·작업 화면 껍데기의 글자 규격 (한 곳에서 정의).
 *
 * 가로 탭 레이아웃과 좌측 메뉴 레이아웃이 같은 값을 써야 화면을 오갈 때 글자 크기·
 * 굵기가 튀지 않는다. 컴포넌트마다 0.875rem·0.65rem 을 손으로 적으면 한쪽만 바뀌어
 * 이질감이 생기므로 여기서만 고친다.
 */
export const CHROME_TYPOGRAPHY = {
  /** 패널·섹션 제목 (트리 머리, 상세 제목) */
  paneTitle: {
    fontSize: "0.8125rem",
    fontWeight: 700,
    lineHeight: 1.4,
  },
  /** 영역 이동 항목·목록 행 (탭 라벨, 사이드바 항목, 트리 행) */
  navItem: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  /** 선택된 항목 */
  navItemSelected: {
    fontSize: "0.875rem",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  /** 개수 배지 (테스트케이스 964 등) */
  countBadge: {
    fontSize: "0.72rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  /** 상태 칩 (통과·실행 중 등) */
  statusChip: {
    height: 20,
    fontSize: "0.72rem",
  },
  /** 보조 안내 문구 */
  hint: {
    fontSize: "0.78rem",
    lineHeight: 1.5,
  },
};
