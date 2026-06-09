// src/components/TestExecutionList.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx";
import { useTranslation } from "../context/I18nContext.jsx";
import { ExecutionStatus } from "../models/testExecution.jsx";

const EXECUTIONS_PER_PAGE = 5;
// 리스트를 보고 있는 동안 진행률/상태를 자동 갱신하는 폴링 주기(ms)
const REFRESH_INTERVAL_MS = 20000;
// API_BASE_URL은 api 함수를 통해 동적으로 처리됨

// 제목 검색 필터를 프로젝트별로 보존하기 위한 sessionStorage 키 접두사.
// 상세(실행) 화면을 다녀오면 컴포넌트가 언마운트→재마운트되어 로컬 state가
// 초기화되므로, 마지막으로 적용한 필터를 sessionStorage에 남겨 복원한다.
const SEARCH_STORAGE_PREFIX = "testExecutionList.search.";
const readSavedSearch = (projectId) => {
  if (!projectId) return "";
  try {
    return sessionStorage.getItem(`${SEARCH_STORAGE_PREFIX}${projectId}`) || "";
  } catch {
    return "";
  }
};
const writeSavedSearch = (projectId, value) => {
  if (!projectId) return;
  try {
    sessionStorage.setItem(`${SEARCH_STORAGE_PREFIX}${projectId}`, value || "");
  } catch {
    // sessionStorage 미지원/차단 환경에서는 무시(필터 미보존)
  }
};

const TestExecutionList = ({ onNewExecution, onEditExecution }) => {
  const { getTestPlan, activeProject, user, api } = useAppContext();
  const { t } = useTranslation();
  const theme = useTheme();
  const [testExecutions, setTestExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);
  const [page, setPage] = useState(0); // 서버는 0-based
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  // 폴링 갱신용 ref — stale closure 없이 최신 값을 읽기 위해 사용
  const isRefreshingRef = useRef(false);
  const loadedCountRef = useRef(0);
  const searchQueryRef = useRef("");

  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isUser = user?.role === "USER";

  // 검색 상태 관리 — 마운트 시 현재 프로젝트에 저장된 필터를 복원
  const [searchQuery, setSearchQuery] = useState(() =>
    readSavedSearch(activeProject?.id),
  );
  const [triggerSearch, setTriggerSearch] = useState(0); // 검색 실행 트리거
  // 현재 searchQuery 가 어느 프로젝트의 것인지 추적(프로젝트 전환 감지용)
  const searchProjectIdRef = useRef(activeProject?.id);

  const fetchTestExecutions = useCallback(
    async (projectId, name, pageNum = 0, isInitial = false) => {
      if (!projectId) {
        setTestExecutions([]);
        setIsLoading(false);
        return;
      }
      try {
        if (isInitial) {
          setIsLoading(true);
        } else {
          setIsFetchingMore(true);
        }

        let url = `/api/test-executions/by-project/${projectId}?page=${pageNum}&size=${EXECUTIONS_PER_PAGE}`;
        if (name) {
          url += `&name=${encodeURIComponent(name)}`;
        }
        const response = await api(url);
        if (!response.ok) throw new Error("Failed to fetch executions");
        const data = await response.json();

        const newContent = data.content || (Array.isArray(data) ? data : []);

        if (isInitial) {
          setTestExecutions(newContent);
        } else {
          setTestExecutions((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewContent = newContent.filter(
              (item) => !existingIds.has(item.id),
            );
            return [...prev, ...uniqueNewContent];
          });
        }

        // 더 가져올 데이터가 있는지 판단
        if (data.last !== undefined) {
          setHasMore(!data.last);
        } else {
          setHasMore(newContent.length === EXECUTIONS_PER_PAGE);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [api],
  );

  // 최신 값을 폴링 콜백에서 stale 없이 읽기 위해 ref 동기화
  useEffect(() => {
    loadedCountRef.current = testExecutions.length;
  }, [testExecutions]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // 이미 로드된 윈도우 전체를 한 번에 재조회하여 진행률/상태를 in-place 머지.
  // createdAt DESC(안정 정렬)라 결과 기록으로 순서가 바뀌지 않으므로,
  // 스크롤로 올린 이전 항목도 변경되면 함께 갱신된다. 신규 항목은 상단에 prepend.
  const refreshExecutions = useCallback(async () => {
    const projectId = activeProject?.id;
    if (!projectId) return;
    if (isRefreshingRef.current) return; // 진행 중 요청과 중복 방지
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      const size = Math.max(loadedCountRef.current, EXECUTIONS_PER_PAGE);
      let url = `/api/test-executions/by-project/${projectId}?page=0&size=${size}`;
      const name = searchQueryRef.current;
      if (name) {
        url += `&name=${encodeURIComponent(name)}`;
      }
      const response = await api(url);
      if (!response.ok) return; // 폴링 실패는 조용히 무시(다음 주기에 재시도)
      const data = await response.json();
      const newContent = data.content || (Array.isArray(data) ? data : []);

      setTestExecutions((prev) => {
        const respById = new Map(newContent.map((it) => [it.id, it]));
        const prevIds = new Set(prev.map((it) => it.id));
        // 기존 순서를 보존하며, 응답에 온 항목은 최신 데이터로 교체(in-place 갱신)
        const updated = prev.map((it) =>
          respById.has(it.id) ? respById.get(it.id) : it,
        );
        // 보던 중 새로 생성된 실행은 응답 순서(createdAt DESC) 그대로 상단 prepend
        const newcomers = newContent.filter((it) => !prevIds.has(it.id));
        return newcomers.length ? [...newcomers, ...updated] : updated;
      });
    } catch {
      // 자동 갱신 실패는 사용자에게 노출하지 않음
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [activeProject?.id, api]);

  // 리스트가 보일 때만 주기적 폴링. 탭이 백그라운드면 정지, 복귀 시 즉시 1회 갱신.
  useEffect(() => {
    if (!activeProject?.id) return undefined;
    let intervalId = null;
    const start = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        if (!document.hidden) refreshExecutions();
      }, REFRESH_INTERVAL_MS);
    };
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        refreshExecutions();
        start();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    if (!document.hidden) start();
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeProject?.id, refreshExecutions]);

  useEffect(() => {
    if (activeProject?.id) {
      // 프로젝트가 바뀌면 해당 프로젝트에 저장된 필터를 복원해 그 값으로 조회한다.
      // (state 갱신은 다음 렌더에 반영되므로 조회에는 effectiveQuery 를 직접 사용)
      let effectiveQuery = searchQuery;
      if (searchProjectIdRef.current !== activeProject.id) {
        searchProjectIdRef.current = activeProject.id;
        effectiveQuery = readSavedSearch(activeProject.id);
        setSearchQuery(effectiveQuery);
        searchQueryRef.current = effectiveQuery;
      }
      setPage(0);
      setHasMore(true);
      fetchTestExecutions(activeProject.id, effectiveQuery, 0, true);
    } else {
      setTestExecutions([]);
    }
  }, [activeProject?.id, triggerSearch]); // projectId나 검색 트리거 시 초기화 로드

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !isFetchingMore &&
          activeProject?.id
        ) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchTestExecutions(activeProject.id, searchQuery, nextPage, false);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [
    hasMore,
    isLoading,
    isFetchingMore,
    activeProject?.id,
    searchQuery,
    fetchTestExecutions,
  ]);

  const handleSearch = () => {
    // 적용된 필터를 프로젝트별로 보존 — 상세 화면 왕복/프로젝트 전환 후 복원
    writeSavedSearch(activeProject?.id, searchQuery);
    setTriggerSearch((prev) => prev + 1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleConfirmDelete = async () => {
    if (!executionToDelete) return;
    setIsLoading(true);
    try {
      const response = await api(`/api/test-executions/${executionToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      setTestExecutions((prev) =>
        prev.filter((e) => e.id !== executionToDelete),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const renderStatusChip = (status) => {
    switch (status) {
      case ExecutionStatus.NOTSTARTED:
        return (
          <Chip
            size="small"
            icon={<ScheduleIcon />}
            label={t("testExecution.status.notStarted")}
            color="default"
          />
        );
      case ExecutionStatus.INPROGRESS:
        return (
          <Chip
            size="small"
            icon={<PlayArrowIcon />}
            label={t("testExecution.status.inProgress")}
            color="primary"
          />
        );
      case ExecutionStatus.COMPLETED:
        return (
          <Chip
            size="small"
            icon={<CheckCircleIcon />}
            label={t("testExecution.status.completed")}
            color="success"
          />
        );
      default:
        return null;
    }
  };

  const paginatedExecutions = testExecutions;

  if (isLoading && !testExecutions.length)
    // 초기 로딩만 표시, 재검색 시에는 리스트 유지하면서 로딩 처리하려면 조건 변경 필요. 여기서는 간단히.
    return <CircularProgress sx={{ display: "block", margin: "2rem auto" }} />;
  if (error)
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="div">
            {t("testExecution.list.title")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              placeholder={t(
                "testExecution.list.searchPlaceholder",
                "Title Search",
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSearch}
                      edge="end"
                      data-testid="execution-search-button"
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              slotProps={{
                htmlInput: { "data-testid": "execution-search-input" },
              }}
              sx={{ width: 250 }}
            />
            <Tooltip title={t("testExecution.list.refresh", "새로고침")}>
              <span>
                <IconButton
                  onClick={refreshExecutions}
                  disabled={isRefreshing}
                  data-testid="execution-refresh-button"
                  aria-label={t("testExecution.list.refresh", "새로고침")}
                >
                  {isRefreshing ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            {isAdminOrManager && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={onNewExecution}
                data-testid="execution-add-button"
              >
                {t("testExecution.list.newExecution")}
              </Button>
            )}
          </Box>
        </Box>
        {testExecutions.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 3 }}
          >
            {t("testExecution.list.noExecutions")}
          </Typography>
        ) : (
          <List sx={{ width: "100%" }}>
            {paginatedExecutions.map((execution, index) => {
              const testPlan = getTestPlan(execution.testPlanId);
              const progress = Math.min(
                Math.max(execution.progress || 0, 0),
                100,
              );
              return (
                <React.Fragment key={execution.id}>
                  {index !== 0 && <Divider component="li" />}
                  <ListItem
                    alignItems="flex-start"
                    disablePadding
                    data-testid={`execution-item-${execution.id}`}
                    secondaryAction={
                      isAdminOrManager && (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExecutionToDelete(execution.id);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ color: theme.palette.error.main }}
                          data-testid={`execution-delete-button-${execution.id}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemButton
                      onClick={() => onEditExecution(execution.id)}
                      alignItems="flex-start"
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {execution.displayId && (
                              <Chip
                                label={execution.displayId}
                                variant="outlined"
                                size="small"
                                sx={{
                                  fontSize: "0.75rem",
                                  height: "20px",
                                  mr: 0.5,
                                }}
                              />
                            )}
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{ mr: 1 }}
                            >
                              {execution.name}
                            </Typography>
                            {renderStatusChip(execution.status)}
                            {execution.tags && execution.tags.length > 0 && (
                              <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                                {execution.tags.map((tag, tagIndex) => (
                                  <Chip
                                    key={tagIndex}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.75rem", height: "20px" }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              component="span"
                              color="text.primary"
                              sx={{ mr: 2 }}
                            >
                              {testPlan ? testPlan.name : ""}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                flexGrow: 1,
                                mr: 1,
                                height: 8,
                                borderRadius: 4,
                              }}
                            />
                            <Typography variant="body2" component="span">
                              {progress}%
                            </Typography>
                          </Box>
                        }
                        slotProps={{
                          primary: { component: "span" },
                          secondary: { component: "span" },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}
        {hasMore && (
          <Box
            ref={loaderRef}
            sx={{ display: "flex", justifyContent: "center", p: 2 }}
          >
            {isFetchingMore && <CircularProgress size={24} />}
          </Box>
        )}
        {!hasMore && testExecutions.length > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 2, mb: 1 }}
          >
            {t(
              "testExecution.list.noMoreExecutions",
              "모든 데이터를 불러왔습니다.",
            )}
          </Typography>
        )}
      </CardContent>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        disableRestoreFocus
      >
        <DialogTitle>{t("testExecution.list.delete.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("testExecution.list.delete.confirm")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            data-testid="execution-delete-cancel-button"
          >
            {t("testExecution.list.delete.cancel")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            data-testid="execution-delete-confirm-button"
          >
            {t("testExecution.list.delete.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TestExecutionList;
