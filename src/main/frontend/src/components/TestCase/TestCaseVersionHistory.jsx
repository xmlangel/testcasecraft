// src/components/TestCase/TestCaseVersionHistory.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Compare as CompareIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";
import VersionComparison from "./VersionComparison";

const TestCaseVersionHistory = ({
  testCaseId,
  open,
  onClose,
  onRestore,
  inline = false,
}) => {
  const { api } = useAppContext();
  const { t, language } = useI18n();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState([]);

  // 현재 언어에 따른 date-fns 로케일 설정
  const dateLocale = useMemo(() => (language === "ko" ? ko : enUS), [language]);

  // 구조화된 다국어 키 문자열 번역 (형식: key|param1:val1,param2:val2;key2|...)
  const translateStructuredString = (str) => {
    if (!str)
      return t("testcase.versionHistory.changeSummary.empty", "변경 내용 없음");

    // 단순 번역 키인 경우 (구분자 없는 경우) 바로 번역 시도
    if (!str.includes("|") && !str.includes(":") && !str.includes(";")) {
      // 키가 영어/숫자/마침표 조합인 경우 키로 간주
      if (/^[a-zA-Z0-9.]+$/.test(str)) {
        return t(str, str);
      }
      return str; // 이미 번역된 문자열이거나 알 수 없는 형식
    }

    const segments = str
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    const translatedSegments = segments.map((segment) => {
      const [key, paramsStr] = segment.split("|");
      if (!paramsStr) return t(key, key);

      const params = {};
      paramsStr.split(",").forEach((p) => {
        const [k, v] = p.split(":");
        if (k && v) {
          // 값(v) 자체가 번역 키인 경우 번역하여 전달
          params[k] = /^[a-zA-Z0-9.]+$/.test(v) ? t(v, v) : v;
        }
      });
      return t(segment.includes("|") ? key : segment, params);
    });

    return translatedSegments.join("; ");
  };

  // 버전 히스토리 조회
  const fetchVersionHistory = async () => {
    if (!testCaseId || (!open && !inline)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api(
        `/api/testcase-versions/testcase/${testCaseId}/history`,
      );
      if (!response.ok) {
        throw new Error(
          t(
            "testcase.versionHistory.error.fetchFailed",
            "버전 히스토리를 불러오지 못했습니다.",
          ),
        );
      }
      const data = await response.json();
      setVersions(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error(
        t(
          "testcase.versionHistory.error.fetchError",
          "버전 히스토리 조회 오류",
        ),
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersionHistory();
  }, [testCaseId, open, inline]);

  // 버전 복원
  const handleRestore = async (versionId) => {
    try {
      setLoading(true);
      const response = await api(
        `/api/testcase-versions/${versionId}/restore`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          t(
            "testcase.versionHistory.error.restoreFailed",
            "버전 복원에 실패했습니다.",
          ),
        );
      }

      const data = await response.json();
      if (onRestore) {
        onRestore(data.data);
      }
      onClose();
    } catch (err) {
      setError(err.message);
      console.error(
        t("testcase.versionHistory.error.restoreError", "버전 복원 오류"),
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  // 버전 상세 보기
  const handleViewVersion = async (versionId) => {
    try {
      const response = await api(`/api/testcase-versions/${versionId}`);
      if (!response.ok) {
        throw new Error(
          t(
            "testcase.versionHistory.error.viewFailed",
            "버전 상세 정보를 불러오지 못했습니다.",
          ),
        );
      }
      const data = await response.json();
      setSelectedVersion(data.data);
    } catch (err) {
      console.error(
        t("testcase.versionHistory.error.viewError", "버전 상세 조회 오류"),
        err,
      );
      setError(
        t(
          "testcase.versionHistory.error.viewFailed",
          "버전 상세 정보를 불러오지 못했습니다.",
        ),
      );
    }
  };

  // 버전 비교
  const handleCompareVersions = (version1Id, version2Id) => {
    setCompareVersions([version1Id, version2Id]);
    setCompareDialogOpen(true);
  };

  // 변경 유형에 따른 색상 반환
  const getChangeTypeColor = (changeType) => {
    switch (changeType) {
      case "CREATE":
        return "success";
      case "UPDATE":
        return "primary";
      case "MANUAL_SAVE":
        return "info";
      case "RESTORE":
        return "warning";
      default:
        return "default";
    }
  };

  // 변경 유형 라벨 반환
  const getChangeTypeLabel = (changeType) => {
    switch (changeType) {
      case "CREATE":
        return t("testcase.versionHistory.changeType.create", "생성");
      case "UPDATE":
        return t("testcase.versionHistory.changeType.update", "수정");
      case "MANUAL_SAVE":
        return t("testcase.versionHistory.changeType.manualSave", "수동 저장");
      case "RESTORE":
        return t("testcase.versionHistory.changeType.restore", "복원");
      default:
        return t("testcase.versionHistory.changeType.unknown", "알 수 없음");
    }
  };

  // 버전 상세 다이얼로그 컴포넌트 (중복 제거를 위해 분리)
  const VersionDetailDialog = ({ version, open, onClose }) => {
    if (!version) return null;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {t("testcase.versionDetail.title", "버전 상세 보기")} -{" "}
          {translateStructuredString(version.versionLabel)}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("testcase.versionDetail.section.basic", "기본 정보")}
                </Typography>
                <Typography>
                  <strong>
                    {t("testcase.versionDetail.field.name", "이름")}
                  </strong>{" "}
                  {version.name}
                </Typography>
                <Typography>
                  <strong>
                    {t("testcase.versionDetail.field.description", "설명")}
                  </strong>{" "}
                  {version.description ||
                    t("testcase.versionDetail.field.none", "없음")}
                </Typography>
                <Typography>
                  <strong>
                    {t(
                      "testcase.versionDetail.field.preCondition",
                      "사전 조건",
                    )}
                  </strong>{" "}
                  {version.preCondition ||
                    t("testcase.versionDetail.field.none", "없음")}
                </Typography>
                <Typography>
                  <strong>
                    {t(
                      "testcase.versionDetail.field.expectedResults",
                      "기대 결과",
                    )}
                  </strong>{" "}
                  {version.expectedResults ||
                    t("testcase.versionDetail.field.none", "없음")}
                </Typography>
                <Typography>
                  <strong>
                    {t("testcase.versionDetail.field.priority", "우선순위")}
                  </strong>{" "}
                  {version.priority ||
                    t("testcase.versionDetail.field.none", "없음")}
                </Typography>
              </Paper>
            </Grid>

            {version.steps && version.steps.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {t("testcase.versionDetail.section.steps", "테스트 단계")}
                  </Typography>
                  {version.steps.map((step, index) => (
                    <Box
                      key={index}
                      sx={{ mb: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}
                    >
                      <Typography variant="body2">
                        <strong>
                          {t("testcase.versionDetail.step.number", "단계")}{" "}
                          {step.stepNumber}:
                        </strong>{" "}
                        {step.action}
                      </Typography>
                      {step.expectedResult && (
                        <Typography variant="body2" color="text.secondary">
                          {t(
                            "testcase.versionDetail.step.expectedResult",
                            "기대 결과:",
                          )}{" "}
                          {step.expectedResult}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("testcase.versionDetail.section.version", "버전 정보")}
                </Typography>
                <Typography>
                  <strong>
                    {t(
                      "testcase.versionDetail.field.versionNumber",
                      "버전 번호",
                    )}
                  </strong>{" "}
                  v{version.versionNumber}
                </Typography>
                <Typography>
                  <strong>
                    {t("testcase.versionDetail.field.changeType", "변경 유형")}
                  </strong>{" "}
                  {getChangeTypeLabel(version.changeType)}
                </Typography>
                <Typography>
                  <strong>
                    {t(
                      "testcase.versionDetail.field.changeSummary",
                      "변경 요약",
                    )}
                  </strong>{" "}
                  {translateStructuredString(version.changeSummary) ||
                    t("testcase.versionDetail.field.none", "없음")}
                </Typography>
                <Typography>
                  <strong>
                    {t("testcase.versionDetail.field.creator", "작성자")}
                  </strong>{" "}
                  {version.createdByName}
                </Typography>
                <Typography>
                  <strong>
                    {t("testcase.versionDetail.field.createdAt", "작성일시")}
                  </strong>{" "}
                  {new Date(version.createdAt).toLocaleString(
                    language === "ko" ? "ko-KR" : "en-US",
                  )}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {t("testcase.versionDetail.button.close", "닫기")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const historyContent = (
    <Box>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {!loading && !error && (
        <List sx={{ p: 0 }}>
          {versions.map((version, index) => (
            <React.Fragment key={version.id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  backgroundColor: version.isCurrentVersion
                    ? "action.selected"
                    : "transparent",
                }}
              >
                <ListItemText
                  primaryTypographyProps={{ component: "div" }}
                  secondaryTypographyProps={{ component: "div" }}
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {translateStructuredString(version.versionLabel)}
                      </Typography>
                      {version.isCurrentVersion && (
                        <Chip
                          label={t(
                            "testcase.versionHistory.current",
                            "현재 버전",
                          )}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={getChangeTypeLabel(version.changeType)}
                        size="small"
                        color={getChangeTypeColor(version.changeType)}
                        variant="filled"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {translateStructuredString(version.changeSummary)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {version.createdByName ||
                          t(
                            "testcase.versionHistory.creator.unknown",
                            "알 수 없음",
                          )}{" "}
                        •{" "}
                        {version.createdAt
                          ? formatDistanceToNow(new Date(version.createdAt), {
                              addSuffix: true,
                              locale: dateLocale,
                            })
                          : t(
                              "testcase.versionHistory.time.unknown",
                              "알 수 없음",
                            )}
                      </Typography>
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewVersion(version.id)}
                      title={t(
                        "testcase.versionHistory.action.view",
                        "상세 보기",
                      )}
                    >
                      <ViewIcon />
                    </IconButton>

                    {!version.isCurrentVersion && (
                      <IconButton
                        size="small"
                        onClick={() => handleRestore(version.id)}
                        title={t(
                          "testcase.versionHistory.action.restore",
                          "복원",
                        )}
                        color="primary"
                      >
                        <RestoreIcon />
                      </IconButton>
                    )}

                    {index < versions.length - 1 && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleCompareVersions(
                            version.id,
                            versions[index + 1].id,
                          )
                        }
                        title={t(
                          "testcase.versionHistory.action.compare",
                          "이전 버전과 비교",
                        )}
                      >
                        <CompareIcon />
                      </IconButton>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>

              {index < versions.length - 1 && <Divider />}
            </React.Fragment>
          ))}

          {versions.length === 0 && !loading && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t(
                  "testcase.versionHistory.empty",
                  "버전 히스토리가 없습니다.",
                )}
              </Typography>
            </Box>
          )}
        </List>
      )}
    </Box>
  );

  return (
    <>
      {inline ? (
        <Box>{historyContent}</Box>
      ) : (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: { sx: { height: "80vh" } },
          }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryIcon />
            {t("testcase.versionHistory.title", "버전 히스토리")}
            <IconButton
              onClick={onClose}
              sx={{ marginLeft: "auto" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {historyContent}
          </DialogContent>
        </Dialog>
      )}

      {/* 공용 상세 다이얼로그 (중복 제거됨) */}
      <VersionDetailDialog
        version={selectedVersion}
        open={!!selectedVersion}
        onClose={() => setSelectedVersion(null)}
      />

      {/* 버전 비교 다이얼로그 */}
      <VersionComparison
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        version1Id={compareVersions[1]}
        version2Id={compareVersions[0]}
      />
    </>
  );
};

export default TestCaseVersionHistory;
