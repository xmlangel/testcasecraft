// src/components/TestCase/TestCaseHybridForm.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Backdrop,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Close as CloseIcon,
  OpenInFull as MaximizeIcon,
  CloseFullscreen as RestoreIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import useProjectRole from "../../hooks/useProjectRole.js";
import { canEditProjectContent } from "../TestCaseTree/utils/permissionUtils.js";
import { debugLog, debugWarn } from "../../utils/logger.js";
import TestCaseForm from "../TestCaseForm.jsx";
import TestCaseSpreadsheet from "./TestCaseSpreadsheet.jsx";
import InputModeSwitch from "./InputModeSwitch.jsx";
import TestCaseDatasheetGrid from "./TestCaseDatasheetGrid.jsx";
import FolderCaseList from "./FolderCaseList.jsx";
import {
  getAllDescendants,
  getAllChildIds,
  getAncestorIds,
  getTreeOrderedTestCaseIds,
  isUnfiledTestCase,
  VIRTUAL_ALL_CASES_ID,
  VIRTUAL_UNFILED_ID,
} from "../../utils/treeUtils.jsx";
import NoSelectionPlaceholder from "../common/NoSelectionPlaceholder.jsx";
import useBookmarks from "../../hooks/useBookmarks.js";
import useLatestResults from "../../hooks/useLatestResults.js";
import { CHROME_ICON_SX } from "../common/iconSizes.js";
import Resizer from "../common/Resizer.jsx";
import useElementWidth from "../../hooks/useElementWidth.js";
import usePaneLayoutMode from "../../hooks/usePaneLayoutMode.js";
import useEscapeToClose from "../../hooks/useEscapeToClose.js";
import PaneLayoutSelector from "../common/PaneLayoutSelector.jsx";
import useCaseAutomationFilter from "../../hooks/useCaseAutomationFilter.js";
import {
  AUTOMATION_FILTER,
  matchesAutomationFilter,
} from "../TestCaseTree/utils/treeFilter.js";
import ProjectHeaderSlot from "../common/ProjectHeaderSlot.jsx";
import {
  clampListWidth,
  detailWidthForList,
  resolvePaneLayout,
  resolveListContextId,
  CASE_LIST_DEFAULT_WIDTH,
  CASE_LIST_MIN_WIDTH,
  DETAIL_PANE_DEFAULT_WIDTH,
  DETAIL_PANE_MIN_WIDTH,
  SPLIT_GUTTER_WIDTH,
} from "./splitPane.js";

const TestCaseHybridForm = ({
  testCaseId,
  projectId,
  onSave,
  onSelectTestCase,
  // ICT-492: 1단에서는 트리를 접는다. 트리는 App 이 그리므로 접어 달라고 알린다.
  // treeReserveWidth 는 트리가 보일 때 차지하는 폭(트리·막대·여백)이다.
  treeReserveWidth = 0,
  treeHiddenByLayout = false,
  onTreeHiddenByLayoutChange,
}) => {
  const params = useParams();

  // Props가 없으면 URL Params 사용
  // testCaseId가 'new' 문자열이면 null로 처리하여 생성 모드로 진입
  const effectiveTestCaseId =
    testCaseId === "new" || params.testCaseId === "new"
      ? null
      : testCaseId || params.testCaseId;
  const effectiveProjectId = projectId || params.projectId;

  const {
    testCases,
    addTestCase,
    updateTestCase,
    fetchProjectTestCases,
    testCasesLoading,
    inputMode,
    setInputMode,
  } = useAppContext();
  const { t } = useI18n();
  const { user } = useAuth();
  // 편집 권한이 없으면 스프레드시트 모드를 아예 내보이지 않는다. 일괄 입력은 저장이
  // 목적이라, 열어 준 뒤 저장에서 막으면 무엇을 하려 했는지만 잃는다.
  const { projectRole } = useProjectRole(effectiveProjectId, user);
  const canEdit = canEditProjectContent(projectRole);

  // 입력 모드는 컨텍스트에 남아 있다. 편집 권한을 잃은 사용자가 스프레드시트 모드로
  // 들어와 있으면 토글이 사라져 돌아갈 길이 없으므로 개별 폼으로 되돌린다.
  useEffect(() => {
    if (!canEdit && inputMode !== "form") {
      setInputMode("form");
    }
  }, [canEdit, inputMode, setInputMode]);

  // 개인 북마크(즐겨찾기) 상태 — 케이스 리스트 별 버튼용
  const { favoriteIds, toggleFavorite } = useBookmarks(effectiveProjectId);
  const { latestResults } = useLatestResults(effectiveProjectId);
  // 'form' | 'spreadsheet' | 'advanced-spreadsheet'
  // 'form' | 'spreadsheet' | 'advanced-spreadsheet'

  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const isUserEditingRef = useRef(false); // 사용자 입력 중 플래그

  // 폴더 정보 편집 모드 (폴더 선택 시 기본은 케이스 목록, 편집 버튼으로 폼 전환)
  const [isFolderEditMode, setIsFolderEditMode] = useState(false);
  // 폴더 편집 모드도 같이 되돌린다. 버튼을 감춰도 이미 들어와 있으면 폼이 열린 채 남는다.
  useEffect(() => {
    if (!canEdit && isFolderEditMode) {
      setIsFolderEditMode(false);
    }
  }, [canEdit, isFolderEditMode]);
  useEffect(() => {
    setIsFolderEditMode(false);
  }, [effectiveTestCaseId]);

  // 프로젝트의 테스트케이스 및 폴더 개수 계산 (ICT-343: 폴더도 스프레드시트에 표시)
  // 유령 데이터 필터링: 이름이 없거나 빈 문자열인 경우 제외
  // useMemo로 불필요한 재계산 방지
  // 프로젝트의 테스트케이스 및 폴더 필터링 (ICT-UserReq: 폴더별 필터링 기능)
  const projectTestCases = useMemo(() => {
    debugLog(
      "HybridForm",
      "🔍 projectTestCases 필터링 시작 (선택 ID:",
      effectiveTestCaseId,
      ")",
    );

    // 1. 프로젝트 ID 및 데이터 유효성 기본 필터링
    const baseFiltered = testCases.filter((tc) => {
      const hasValidProjectId =
        String(tc.projectId) === String(effectiveProjectId);
      const hasValidType =
        tc.type === "testcase" || tc.type === "folder" || tc.type === null;
      const hasValidName = tc.name && tc.name.trim().length > 0;

      return hasValidProjectId && hasValidType && hasValidName;
    });

    // 2. 선택된 폴더 기준 계층 필터링 (스프레드시트/데이터시트 모드용)
    if (inputMode === "spreadsheet" || inputMode === "advanced-spreadsheet") {
      // 가상 노드: 전체 / 폴더 미지정
      if (effectiveTestCaseId === VIRTUAL_ALL_CASES_ID) {
        return baseFiltered;
      }
      if (effectiveTestCaseId === VIRTUAL_UNFILED_ID) {
        return baseFiltered.filter((tc) => isUnfiledTestCase(tc));
      }

      // 선택된 항목이 테스트케이스인 경우, 그 부모 폴더의 내용을 보여줌
      const selectedItem = baseFiltered.find(
        (tc) => String(tc.id) === String(effectiveTestCaseId),
      );
      const targetParentId =
        selectedItem?.type === "testcase"
          ? selectedItem.parentId
          : effectiveTestCaseId;

      const descendantIds = getAllChildIds(baseFiltered, targetParentId);
      const descendantIdSet = new Set(descendantIds.map(String));

      const hierarchicalFiltered = baseFiltered.filter((tc) => {
        const tcIdStr = String(tc.id);
        const isDescendant = descendantIdSet.has(tcIdStr);
        const isSelf = tcIdStr === String(targetParentId);

        return isDescendant || isSelf;
      });

      debugLog(
        "HybridForm",
        "✅ 계층 필터링 결과:",
        hierarchicalFiltered.length,
        "개 (Target Parent ID:",
        targetParentId,
        ")",
      );
      return hierarchicalFiltered;
    }

    debugLog("HybridForm", "✅ 기본 필터링 결과:", baseFiltered.length, "개");
    return baseFiltered;
  }, [testCases, effectiveProjectId, effectiveTestCaseId, inputMode]);

  // 스프레드시트 모드에서 사용할 데이터 준비 (중복 방지) - ICT-158 개선
  useEffect(() => {
    // 컴포넌트 마운트 시 데이터 로드 보장 (새로고침 시 빈 목록 방지)
    if (effectiveProjectId) {
      fetchProjectTestCases(effectiveProjectId);
    }
  }, [effectiveProjectId, fetchProjectTestCases]);

  useEffect(() => {
    if (inputMode === "spreadsheet" || inputMode === "advanced-spreadsheet") {
      // 사용자가 입력 중이면 백엔드 데이터로 덮어쓰지 않음
      // 단, 현재 스프레드시트 데이터가 비어있다면(초기 로딩) 강제로 업데이트 허용
      if (isUserEditingRef.current && spreadsheetData.length > 0) {
        debugLog("HybridForm", "⏸️ 사용자 입력 중 - 업데이트 스킵");
        return;
      }

      // JSON 비교로 실제 데이터 변경 여부 확인 (무한 루프 방지)
      const currentDataJson = JSON.stringify(spreadsheetData);
      const newDataJson = JSON.stringify(projectTestCases);

      // 데이터가 실제로 다를 때만 업데이트 (사용자 입력 보호)
      if (currentDataJson !== newDataJson) {
        debugLog(
          "HybridForm",
          "🔄 데이터 업데이트:",
          projectTestCases.length,
          "개 테스트케이스",
        );
        setSpreadsheetData(projectTestCases);
      } else {
        debugLog("HybridForm", "✅ 데이터 동일 - 업데이트 스킵");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode, projectTestCases]); // spreadsheetData는 의존성에서 제외 (비교만 수행)

  // 입력 모드 변경 핸들러
  const handleModeChange = (newMode) => {
    setInputMode(newMode);

    // 모드 변경 시 데이터 새로고침
    if (newMode === "spreadsheet" || newMode === "advanced-spreadsheet") {
      setSpreadsheetData(projectTestCases);
    }
  };

  // 현재 선택 항목 (폴더 여부 판별용 — 폴더면 폼 대신 폴더 케이스 목록 표시)
  const selectedItem = useMemo(
    () => testCases.find((tc) => String(tc.id) === String(effectiveTestCaseId)),
    [testCases, effectiveTestCaseId],
  );
  const isFolderSelected = selectedItem?.type === "folder";

  // 폴더 케이스 목록에서 사용할 프로젝트 전체 항목 (유효성 필터만 적용)
  // ICT-496: 트리의 자동화 필터(전체·자동화·수동)를 가운데 목록에도 건다. 폴더는 그대로 둔다.
  const [automationFilter] = useCaseAutomationFilter();
  const folderListItems = useMemo(
    () =>
      testCases.filter(
        (tc) =>
          String(tc.projectId) === String(effectiveProjectId) &&
          tc.name &&
          tc.name.trim().length > 0 &&
          (automationFilter === AUTOMATION_FILTER.ALL ||
            tc.type !== "testcase" ||
            matchesAutomationFilter(tc, automationFilter)),
      ),
    [testCases, effectiveProjectId, automationFilter],
  );

  // 가상 노드 (전체 / 폴더 미지정) 목록 데이터
  const virtualListData = useMemo(() => {
    if (effectiveTestCaseId === VIRTUAL_ALL_CASES_ID) {
      return {
        folder: {
          id: VIRTUAL_ALL_CASES_ID,
          name: t("testcase.tree.virtual.allCases", "모든 테스트케이스"),
        },
        rows: folderListItems
          .filter((tc) => tc.type === "testcase")
          .slice()
          .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
      };
    }
    if (effectiveTestCaseId === VIRTUAL_UNFILED_ID) {
      return {
        folder: {
          id: VIRTUAL_UNFILED_ID,
          name: t("testcase.tree.virtual.unfiled", "폴더에 없는 테스트케이스"),
        },
        rows: folderListItems.filter((tc) => isUnfiledTestCase(tc)),
      };
    }
    return null;
  }, [effectiveTestCaseId, folderListItems, t]);

  // ICT-491: 케이스를 열어도 가운데 칸의 케이스 목록을 그대로 둔다(트리 | 목록 | 상세).
  // listContextId 는 가운데 칸에 남길 목록(폴더 또는 가상 노드)이다.
  const [listContextId, setListContextId] = useState(null);
  // ICT-494 tl-1: 목록 폭을 정하고 상세 칸이 나머지를 쓴다(상세가 가장 넓다).
  const [listWidth, setListWidth] = useState(CASE_LIST_DEFAULT_WIDTH);
  const [detailMaximized, setDetailMaximized] = useState(false);
  useEffect(() => {
    setListContextId((prev) =>
      resolveListContextId(prev, effectiveTestCaseId, folderListItems),
    );
  }, [effectiveTestCaseId, folderListItems]);

  const listContext = useMemo(() => {
    if (!listContextId) return null;
    if (listContextId === VIRTUAL_ALL_CASES_ID) {
      return {
        folder: {
          id: VIRTUAL_ALL_CASES_ID,
          name: t("testcase.tree.virtual.allCases", "모든 테스트케이스"),
        },
        rows: folderListItems
          .filter((tc) => tc.type === "testcase")
          .slice()
          .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
      };
    }
    if (listContextId === VIRTUAL_UNFILED_ID) {
      return {
        folder: {
          id: VIRTUAL_UNFILED_ID,
          name: t("testcase.tree.virtual.unfiled", "폴더에 없는 테스트케이스"),
        },
        rows: folderListItems.filter((tc) => isUnfiledTestCase(tc)),
      };
    }
    const folder = folderListItems.find(
      (tc) => String(tc.id) === String(listContextId) && tc.type === "folder",
    );
    return folder ? { folder, rows: undefined } : null;
  }, [listContextId, folderListItems, t]);

  // 케이스를 고른 상태에서만 세 번째 칸이 열린다. 크게 보기면 목록을 접는다.
  const isSplitView =
    inputMode === "form" &&
    selectedItem?.type === "testcase" &&
    Boolean(listContext);
  // ICT-492: 폭과 고른 배치로 1단·2단·3단을 정한다.
  // 3단은 목록과 상세를 나란히, 2단은 상세를 목록 위에 오른쪽으로 겹쳐(목록의 ID·이름은 남김),
  // 1단은 트리를 접고 상세를 전체 폭으로 겹친다. 겹친 칸을 닫아도 아래 목록은 그대로 남는다.
  const [layoutMode, setLayoutMode] = usePaneLayoutMode();
  const [overlayOpen, setOverlayOpen] = useState(true);
  useEffect(() => {
    setOverlayOpen(true);
  }, [effectiveTestCaseId]);
  const [splitViewRef, splitViewWidth] = useElementWidth();
  // 1단에서 트리를 접으면 이 칸이 넓어진다. 단계가 오가지 않게 트리가 보일 때의 폭으로 판정한다.
  const layoutWidth = splitViewWidth
    ? splitViewWidth - (treeHiddenByLayout ? treeReserveWidth : 0)
    : 0;
  const desiredDetailWidth = detailWidthForList({
    containerWidth: layoutWidth,
    listWidth,
    detailMinWidth: DETAIL_PANE_MIN_WIDTH,
    fallbackWidth: DETAIL_PANE_DEFAULT_WIDTH,
  });
  const paneLayout = resolvePaneLayout({
    mode: layoutMode,
    containerWidth: layoutWidth,
    desiredWidth: desiredDetailWidth,
    listMinWidth: CASE_LIST_MIN_WIDTH,
    detailMinWidth: DETAIL_PANE_MIN_WIDTH,
  });
  const showListPane = isSplitView && !detailMaximized;
  const isOverlay = showListPane && paneLayout.overlay;
  const detailVisible = !isOverlay || overlayOpen;
  // 3단에서 목록이 실제로 차지하는 폭
  const listPaneWidth =
    layoutWidth && !paneLayout.overlay
      ? layoutWidth - paneLayout.width - SPLIT_GUTTER_WIDTH
      : listWidth;
  const effectiveListWidthRef = useRef(listPaneWidth);
  effectiveListWidthRef.current = listPaneWidth;

  const wantTreeHidden =
    isOverlay && overlayOpen && paneLayout.tier === 1 && treeReserveWidth > 0;
  useEffect(() => {
    onTreeHiddenByLayoutChange?.(wantTreeHidden);
  }, [wantTreeHidden, onTreeHiddenByLayoutChange]);
  useEffect(
    () => () => onTreeHiddenByLayoutChange?.(false),
    [onTreeHiddenByLayoutChange],
  );

  const closeOverlay = useCallback(() => setOverlayOpen(false), []);
  useEscapeToClose(isOverlay && overlayOpen, closeOverlay);

  const handleSelectFromList = useCallback(
    (item) => {
      setOverlayOpen(true);
      onSelectTestCase?.(item);
    },
    [onSelectTestCase],
  );

  const handleDetailResize = useCallback((dx) => {
    // 막대는 상세 칸 왼쪽에 있으므로 오른쪽으로 끌면 목록이 넓어지고 상세가 좁아진다.
    // 화면에 맞춰 정해진 목록 폭에서 출발해야 끄는 즉시 반응한다.
    setListWidth(() => clampListWidth(effectiveListWidthRef.current + dx));
  }, []);

  const handleCloseDetail = useCallback(() => {
    // 겹친 칸은 감추기만 한다. 선택한 케이스와 목록 스크롤은 그대로 둔다.
    if (isOverlay) {
      setOverlayOpen(false);
      return;
    }
    if (!listContext || !onSelectTestCase) return;
    setDetailMaximized(false);
    onSelectTestCase(listContext.folder);
  }, [isOverlay, listContext, onSelectTestCase]);

  // 선택 항목의 경로 브레드크럼 (조상 폴더 → 현재 항목)
  const breadcrumbItems = useMemo(() => {
    if (!selectedItem) return [];
    const itemMap = new Map(folderListItems.map((item) => [item.id, item]));
    const ancestorIds = getAncestorIds(folderListItems, selectedItem.id);
    return [
      ...ancestorIds.map((id) => itemMap.get(id)).filter(Boolean),
      selectedItem,
    ];
  }, [selectedItem, folderListItems]);

  // ICT-433: 작성 화면에서 트리를 다시 누르지 않고 이전/다음 케이스로 넘어간다.
  // 순서는 좌측 트리와 같다. 폴더·가상 노드를 보고 있을 때는 내보이지 않는다.
  const caseNav = useMemo(() => {
    if (inputMode !== "form" || selectedItem?.type !== "testcase") return null;
    const orderedIds = getTreeOrderedTestCaseIds(folderListItems);
    const index = orderedIds.findIndex(
      (id) => String(id) === String(selectedItem.id),
    );
    if (index < 0) return null;
    return {
      index,
      total: orderedIds.length,
      prevId: index > 0 ? orderedIds[index - 1] : null,
      nextId: index < orderedIds.length - 1 ? orderedIds[index + 1] : null,
    };
  }, [inputMode, selectedItem, folderListItems]);

  const goToCase = useCallback(
    (id) => {
      if (!id || !onSelectTestCase) return;
      const target = folderListItems.find((tc) => String(tc.id) === String(id));
      if (target) onSelectTestCase(target);
    },
    [folderListItems, onSelectTestCase],
  );

  // 현재 선택된 폴더 이름 추출 (새 행 생성 시 기본값으로 사용)
  const activeFolderName = useMemo(() => {
    const selectedItem = testCases.find(
      (tc) => String(tc.id) === String(effectiveTestCaseId),
    );
    if (!selectedItem) return "";
    if (selectedItem.type === "folder") return selectedItem.name;

    // 테스트케이스인 경우 부모 폴더의 이름을 찾음
    const parentFolder = testCases.find(
      (tc) => tc.id === selectedItem.parentId,
    );
    return parentFolder ? parentFolder.name : "";
  }, [testCases, effectiveTestCaseId]);

  // 스프레드시트 데이터 변경 핸들러
  const handleSpreadsheetChange = (updatedTestCases) => {
    debugLog(
      "HybridForm",
      "📝 사용자 입력 감지:",
      updatedTestCases.length,
      "개 행",
    );

    // 무한 루프 방지를 위해 직접 비교
    if (JSON.stringify(updatedTestCases) !== JSON.stringify(spreadsheetData)) {
      // 데이터가 실제로 변경되었을 때만 사용자 입력으로 간주
      isUserEditingRef.current = true;
      debugLog("HybridForm", "💾 스프레드시트 데이터 상태 업데이트");
      setSpreadsheetData(updatedTestCases);

      // 입력 완료 후 플래그 리셋 (디바운스)
      if (window.spreadsheetDebounceTimer)
        clearTimeout(window.spreadsheetDebounceTimer);
      window.spreadsheetDebounceTimer = setTimeout(() => {
        isUserEditingRef.current = false;
        debugLog("HybridForm", "✅ 사용자 입력 플래그 해제");
      }, 500);
    }
  };

  // 스프레드시트 일괄 저장 핸들러 (중복 생성 방지)
  const handleSpreadsheetSave = async (testCasesToSave) => {
    try {
      // 이미 자식 컴포넌트(Spreadsheet)에서 저장이 완료된 상태임.
      // 여기서는 추가적인 저장을 수행하지 않고, 상위 이벤트 전파만 수행함.
      // handleRefreshData() 호출 제거: Spreadsheet 컴포넌트의 onRefresh prop으로 이미 호출됨 (중복 GET 방지)

      // 성공 시 콜백 호출 (한 번만)
      if (onSave) {
        onSave();
      }

      return [];
    } catch (error) {
      throw error;
    }
  };

  // 데이터 새로고침 핸들러 (백엔드에서 최신 데이터 가져오기) - ICT-158 개선
  const handleRefreshData = useCallback(async () => {
    try {
      // 새로고침 시에는 사용자 입력 플래그 해제
      isUserEditingRef.current = false;

      // 백엔드에서 최신 테스트케이스 데이터 가져오기
      await fetchProjectTestCases(effectiveProjectId);

      // useEffect가 자동으로 스프레드시트 데이터를 업데이트할 것임
      // 따라서 여기서는 백엔드 호출만 하고 UI 업데이트는 useEffect에 맡김
    } catch (error) {
      throw error;
    }
  }, [effectiveProjectId, fetchProjectTestCases]);

  // 개별 폼 저장 핸들러
  const handleFormSave = () => {
    if (onSave) {
      onSave();
    }
  };

  // ICT-495 cl-3: 이전 · n/N · 다음은 상세 머리 동작 줄의 오른쪽 끝([저장][취소] 또는 [수정] 뒤,
  // 더보기 앞)에 둔다. 저장하지 않은 변경 확인은 goToCase 가 그대로 맡는다.
  const caseNavControls = caseNav ? (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
      data-testid="testcase-nav"
    >
      <Tooltip title={t("testcase.nav.prev", "이전 케이스")}>
        <span>
          <IconButton
            size="small"
            aria-label={t("testcase.nav.prev", "이전 케이스")}
            disabled={!caseNav.prevId}
            onClick={() => goToCase(caseNav.prevId)}
            data-testid="testcase-nav-prev"
          >
            <PrevIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Typography
        variant="body2"
        color="text.secondary"
        data-testid="testcase-nav-position"
      >
        {caseNav.index + 1} / {caseNav.total}
      </Typography>
      <Tooltip title={t("testcase.nav.next", "다음 케이스")}>
        <span>
          <IconButton
            size="small"
            aria-label={t("testcase.nav.next", "다음 케이스")}
            disabled={!caseNav.nextId}
            onClick={() => goToCase(caseNav.nextId)}
            data-testid="testcase-nav-next"
          >
            <NextIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  ) : null;

  // 하단 고정 바에는 닫기만 남긴다(분할 화면에서 목록 안의 케이스를 열었을 때).
  // 목록 밖 케이스·새 케이스는 경로 줄 오른쪽의 닫기를 쓴다.
  const caseFooterBar =
    caseNav && isSplitView ? (
      <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
        <Tooltip title={t("testcase.split.close", "상세 닫기")}>
          <IconButton
            size="small"
            aria-label={t("testcase.split.close", "상세 닫기")}
            onClick={handleCloseDetail}
            data-testid="testcase-detail-close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ) : null;

  // 입력 모드 선택 — 편집 권한이 있을 때만 내보인다. 없으면 개별 폼만 쓴다.
  // ICT-494 tl-2: 케이스 폼을 열면 이 전환을 폼 머리 한 줄에 아이콘으로(compact) 넣는다.
  const renderInputModeToggle = (compact = false) =>
    canEdit ? (
      <InputModeSwitch
        value={inputMode}
        onChange={handleModeChange}
        compact={compact}
      />
    ) : null;
  const showsCaseForm =
    inputMode === "form" &&
    effectiveTestCaseId !== undefined &&
    !virtualListData &&
    !isFolderSelected;

  const body = (
    <>
      {/* 선택 항목 경로 브레드크럼 (조상 폴더 클릭 시 해당 폴더로 이동) + 크게 보기 */}
      {(breadcrumbItems.length > 0 || isSplitView) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1,
          }}
        >
          {breadcrumbItems.length > 0 && (
            <Breadcrumbs
              separator="›"
              aria-label="testcase-path"
              sx={{ minWidth: 0 }}
              data-testid="testcase-breadcrumb"
            >
              {breadcrumbItems.map((item, idx) =>
                idx < breadcrumbItems.length - 1 ? (
                  <Link
                    key={item.id}
                    component="button"
                    type="button"
                    underline="hover"
                    color="inherit"
                    variant="body2"
                    onClick={() => onSelectTestCase && onSelectTestCase(item)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <Typography
                    key={item.id}
                    variant="body2"
                    color="text.primary"
                    fontWeight={600}
                  >
                    {item.name}
                  </Typography>
                ),
              )}
            </Breadcrumbs>
          )}
          {isSplitView && (
            <Box sx={{ ml: "auto", flexShrink: 0, display: "flex" }}>
              <Tooltip
                title={
                  detailMaximized
                    ? t("testcase.split.restore", "목록과 함께 보기")
                    : t("testcase.split.maximize", "크게 보기")
                }
              >
                <IconButton
                  size="small"
                  aria-label={
                    detailMaximized
                      ? t("testcase.split.restore", "목록과 함께 보기")
                      : t("testcase.split.maximize", "크게 보기")
                  }
                  onClick={() => setDetailMaximized((v) => !v)}
                  data-testid="testcase-detail-maximize"
                >
                  {detailMaximized ? (
                    <RestoreIcon fontSize="small" />
                  ) : (
                    <MaximizeIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              {/* 하단 바가 없는 경우(목록 밖 케이스·새 케이스)에도 닫을 수 있게 둔다 */}
              {!caseNav && (
                <Tooltip title={t("testcase.split.close", "상세 닫기")}>
                  <IconButton
                    size="small"
                    aria-label={t("testcase.split.close", "상세 닫기")}
                    onClick={handleCloseDetail}
                    data-testid="testcase-detail-close"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* 입력 모드 선택. 케이스 폼에서는 폼 머리 줄에 들어간다(ICT-494 tl-2). */}
      {canEdit && !showsCaseForm && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            mb: 1.5,
          }}
        >
          {renderInputModeToggle()}
        </Box>
      )}

      {/* 로딩 인디케이터 (스프레드시트 모드에서만 표시) */}
      {(inputMode === "spreadsheet" ||
        inputMode === "advanced-spreadsheet") && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: "absolute",
          }}
          open={testCasesLoading && spreadsheetData.length === 0}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      {/* 모드에 따른 컴포넌트 렌더링 */}
      {inputMode === "form" ? (
        effectiveTestCaseId === undefined ? (
          <NoSelectionPlaceholder />
        ) : virtualListData ? (
          <FolderCaseList
            folder={virtualListData.folder}
            items={folderListItems}
            rows={virtualListData.rows}
            onSelectItem={onSelectTestCase}
            favoriteIds={favoriteIds}
            onToggleFavorite={(item) => toggleFavorite(item.id)}
            latestResults={latestResults}
          />
        ) : isFolderSelected ? (
          isFolderEditMode ? (
            <Box>
              {/* 폴더 편집 모드: 목록 복귀 버튼 + 폴더 정보 폼 */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  variant="body2"
                  onClick={() => setIsFolderEditMode(false)}
                  data-testid="folder-edit-back-button"
                >
                  ←{" "}
                  {t(
                    "testcase.folderList.backToList",
                    "케이스 목록으로 돌아가기",
                  )}
                </Link>
              </Box>
              <TestCaseForm
                key={`folder-edit-${effectiveTestCaseId}`}
                testCaseId={effectiveTestCaseId}
                projectId={effectiveProjectId}
                onSave={() => {
                  setIsFolderEditMode(false);
                  handleFormSave();
                }}
              />
            </Box>
          ) : (
            <FolderCaseList
              folder={selectedItem}
              items={folderListItems}
              onSelectItem={onSelectTestCase}
              // 편집 권한이 없으면 폴더 편집 입구를 넘기지 않는다. FolderCaseList 는
              // 이 콜백이 있을 때만 연필 버튼을 그린다.
              onEditFolder={
                canEdit ? () => setIsFolderEditMode(true) : undefined
              }
              favoriteIds={favoriteIds}
              onToggleFavorite={(item) => toggleFavorite(item.id)}
              latestResults={latestResults}
            />
          )
        ) : (
          <TestCaseForm
            key={effectiveTestCaseId || "new"}
            testCaseId={effectiveTestCaseId}
            projectId={effectiveProjectId}
            onSave={handleFormSave}
            footerNav={caseFooterBar}
            headerNav={caseNavControls}
            headerExtra={renderInputModeToggle(true)}
          />
        )
      ) : inputMode === "spreadsheet" ? (
        <TestCaseSpreadsheet
          data={spreadsheetData}
          onChange={handleSpreadsheetChange}
          onSave={handleSpreadsheetSave}
          onRefresh={handleRefreshData}
          projectId={effectiveProjectId}
          isLoading={testCasesLoading}
          activeFolderName={activeFolderName}
          allData={testCases}
        />
      ) : (
        <TestCaseDatasheetGrid
          data={spreadsheetData}
          onChange={handleSpreadsheetChange}
          onSave={handleSpreadsheetSave}
          onRefresh={handleRefreshData}
          projectId={effectiveProjectId}
          activeFolderName={activeFolderName}
          allData={testCases}
        />
      )}
    </>
  );

  if (!isSplitView) {
    return <Box sx={CHROME_ICON_SX}>{body}</Box>;
  }

  // ICT-491·492·497 분할: 케이스 목록 | 상세. 나란히(화면 표기 2단)와 겹침(1단) 두 가지다.
  // 단계가 바뀌어도 목록과 상세가 다시 그려지지 않게(스크롤·입력 유지) 요소 구조를 그대로 둔다.
  const tier = paneLayout.tier;
  let detailSx;
  if (!showListPane) {
    detailSx = { flex: 1, width: "auto", overflowY: "auto" };
  } else if (!isOverlay) {
    detailSx = {
      flex: "0 0 auto",
      width: paneLayout.width,
      overflowY: "auto",
      pl: 1.5,
    };
  } else {
    detailSx = {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      width: "100%",
      zIndex: 3,
      display: overlayOpen ? "flex" : "none",
      // background.paper 는 반투명(0.7)이라 아래 목록이 비친다. 겹친 칸은 불투명한 바탕을 쓴다.
      bgcolor: "background.default",
      boxShadow: 8,
      borderRadius: 1,
    };
  }

  return (
    <Box
      ref={splitViewRef}
      sx={{
        ...CHROME_ICON_SX,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
      data-testid="testcase-split-view"
      data-pane-tier={showListPane ? tier : "max"}
    >
      {/* ICT-496: 배치 전환은 프로젝트 머리 줄(북마크·설정 아이콘 옆)에 둬서 한 줄을 아낀다.
          머리 줄이 없는 곳에서는 예전처럼 이 칸 위에 한 줄로 그린다. */}
      <ProjectHeaderSlot
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 0.5,
              flexShrink: 0,
            }}
          >
            <PaneLayoutSelector
              mode={layoutMode}
              onChange={setLayoutMode}
              tier={tier}
              downgraded={paneLayout.downgraded}
            />
          </Box>
        }
      >
        <PaneLayoutSelector
          mode={layoutMode}
          onChange={setLayoutMode}
          tier={tier}
          downgraded={paneLayout.downgraded}
        />
      </ProjectHeaderSlot>
      <Box
        sx={{ position: "relative", display: "flex", flex: 1, minHeight: 0 }}
      >
        {showListPane && (
          <>
            <Box
              sx={{
                flex: 1,
                minWidth: isOverlay ? 0 : CASE_LIST_MIN_WIDTH,
                overflow: "auto",
                pr: 1,
              }}
              data-testid="testcase-list-pane"
            >
              <FolderCaseList
                folder={listContext.folder}
                items={folderListItems}
                rows={listContext.rows}
                onSelectItem={handleSelectFromList}
                favoriteIds={favoriteIds}
                onToggleFavorite={(item) => toggleFavorite(item.id)}
                latestResults={latestResults}
                selectedId={selectedItem?.id}
                compact
              />
            </Box>
            {!isOverlay && (
              <Resizer
                onDrag={handleDetailResize}
                testId="testcase-detail-resizer"
              />
            )}
          </>
        )}
        <Box
          sx={{ minWidth: 0, ...detailSx }}
          data-testid="testcase-detail-pane"
          data-overlay={isOverlay ? "true" : "false"}
          aria-hidden={detailVisible ? undefined : true}
        >
          <Box
            sx={
              isOverlay
                ? { flex: 1, minWidth: 0, overflowY: "auto", p: 1.5 }
                : { display: "contents" }
            }
          >
            {body}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

TestCaseHybridForm.propTypes = {
  testCaseId: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  onSave: PropTypes.func,
  onSelectTestCase: PropTypes.func,
  treeReserveWidth: PropTypes.number,
  treeHiddenByLayout: PropTypes.bool,
  onTreeHiddenByLayoutChange: PropTypes.func,
};

export default TestCaseHybridForm;
