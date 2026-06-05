// src/components/TestCase/TestResultEditPermissionsManager.jsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Box,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Approve as ApproveIcon,
} from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext.jsx";
import testResultEditService from "../../services/testResultEditService.js";
import { useDateFormatter } from "../../hooks/useDateFormatter";
import { useTranslation } from "../../context/I18nContext.jsx";

/**
 * 테스트 결과 편집 권한 관리 컴포넌트
 * 편집본 승인 대기 목록과 권한 관리 기능을 제공
 */
const TestResultEditPermissionsManager = ({ open, onClose }) => {
  const { user } = useAppContext();
  const { formatDate } = useDateFormatter();
  const { t } = useTranslation();

  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingEdits, setPendingEdits] = useState([]);
  const [myEdits, setMyEdits] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'my-edits', 'statistics'

  // 초기화
  useEffect(() => {
    if (open) {
      loadPermissionsData();
    }
  }, [open]);

  const loadPermissionsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [pendingData, myEditsData, statsData] = await Promise.all([
        testResultEditService.getPendingApprovals(0, 50),
        testResultEditService.getMyEdits(0, 50),
        testResultEditService.getEditStatistics(),
      ]);

      setPendingEdits(pendingData.content || []);
      setMyEdits(myEditsData.content || []);
      setStatistics(statsData);
    } catch (err) {
      const errorMsg = t(
        "testResultEdit.permissions.loadFailed",
        "권한 데이터 로드 실패"
      );
      console.error(`${errorMsg}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (editId, approved, comment = "") => {
    setLoading(true);
    setError(null);

    try {
      await testResultEditService.processEditApproval(
        editId,
        approved,
        comment,
      );

      // 데이터 새로고침
      await loadPermissionsData();
    } catch (err) {
      const errorMsg = t(
        "testResultEdit.permissions.approveFailed",
        "편집본 승인 처리 실패"
      );
      console.error(`${errorMsg}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (editId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await testResultEditService.applyEdit(editId);

      if (result.success) {
        await loadPermissionsData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMsg = t(
        "testResultEdit.permissions.applyFailed",
        "편집본 적용 실패"
      );
      console.error(`${errorMsg}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPendingApprovals = () => (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ScheduleIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {t(
              "testResultEdit.permissions.pendingApprovals",
              "승인 대기 중인 편집본",
            )}
          </Typography>
          <Chip
            label={pendingEdits.length}
            size="small"
            color="warning"
            sx={{ ml: 1 }}
          />
        </Box>

        {pendingEdits.length === 0 ? (
          <Alert severity="info">
            {t(
              "testResultEdit.permissions.noPendingEdits",
              "승인 대기 중인 편집본이 없습니다.",
            )}
          </Alert>
        ) : (
          <List>
            {pendingEdits.map((edit, index) => (
              <ListItem
                key={edit.id}
                divider={index < pendingEdits.length - 1}
                sx={{ alignItems: "flex-start" }}
              >
                <ListItemIcon>
                  <EditIcon color="warning" />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle2">
                        v{edit.editVersion} -{" "}
                        {edit.originalData?.testCaseName ||
                          t("testResultEdit.permissions.testCase", "테스트케이스")}
                      </Typography>
                      <Chip
                        label={
                          testResultEditService.getEditStatusInfo(
                            edit.editStatus,
                          ).label
                        }
                        size="small"
                        color="warning"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <PersonIcon
                          sx={{
                            fontSize: "1rem",
                            mr: 0.5,
                            verticalAlign: "middle",
                          }}
                        />
                        편집자: {edit.editedByUserName}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        편집 이유: {edit.editReason}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        요청일: {formatDate(edit.createdAt)}
                      </Typography>
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Tooltip
                      title={t("testResultEdit.permissions.approve", "승인")}
                    >
                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        onClick={() => handleApproval(edit.id, true)}
                        disabled={loading}
                        startIcon={<CheckIcon />}
                      >
                        {t("testResultEdit.permissions.approve", "승인")}
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title={t("testResultEdit.permissions.reject", "거부")}
                    >
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleApproval(edit.id, false)}
                        disabled={loading}
                        startIcon={<CloseIcon />}
                      >
                        {t("testResultEdit.permissions.reject", "거부")}
                      </Button>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const renderMyEdits = () => (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {t("testResultEdit.permissions.myEdits", "내 편집본")}
          </Typography>
          <Chip
            label={myEdits.length}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        </Box>

        {myEdits.length === 0 ? (
          <Alert severity="info">
            {t(
              "testResultEdit.permissions.noMyEdits",
              "생성한 편집본이 없습니다.",
            )}
          </Alert>
        ) : (
          <List>
            {myEdits.map((edit, index) => {
              const statusInfo = testResultEditService.getEditStatusInfo(
                edit.editStatus,
              );

              return (
                <ListItem
                  key={edit.id}
                  divider={index < myEdits.length - 1}
                  sx={{ alignItems: "flex-start" }}
                >
                  <ListItemIcon>
                    <span style={{ fontSize: "1.2em" }}>{statusInfo.icon}</span>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle2">
                          v{edit.editVersion} -{" "}
                          {edit.originalData?.testCaseName ||
                            t("testResultEdit.permissions.testCase", "테스트케이스")}
                        </Typography>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          color={statusInfo.color}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          편집 이유: {edit.editReason}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          생성일: {formatDate(edit.createdAt)}
                          {edit.appliedAt && (
                            <> | 적용일: {formatDate(edit.appliedAt)}</>
                          )}
                        </Typography>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    {edit.editStatus === "APPROVED" && (
                      <Tooltip
                        title={t("testResultEdit.permissions.apply", "적용")}
                      >
                        <Button
                          size="small"
                          color="primary"
                          variant="contained"
                          onClick={() => handleApply(edit.id)}
                          disabled={loading}
                          startIcon={<ApproveIcon />}
                        >
                          {t("testResultEdit.permissions.apply", "적용")}
                        </Button>
                      </Tooltip>
                    )}
                    {edit.editStatus === "APPLIED" && (
                      <Chip
                        label={t("testResultEdit.permissions.active", "활성")}
                        size="small"
                        color="success"
                        variant="filled"
                      />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const renderStatistics = () => (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AdminIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {t("testResultEdit.permissions.statistics", "편집 통계")}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <Typography variant="h4" color="primary">
                {statistics.totalEdits || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("testResultEdit.statistics.totalEdits", "전체 편집본")}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <Typography variant="h4" color="warning.main">
                {statistics.pendingEdits || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("testResultEdit.statistics.pending", "승인 대기")}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <Typography variant="h4" color="success.main">
                {statistics.appliedEdits || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("testResultEdit.statistics.applied", "적용됨")}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ textAlign: "center", p: 2 }}>
              <Typography variant="h4" color="info.main">
                {statistics.approvalRate?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("testResultEdit.statistics.approvalRate", "승인율")}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t("testResultEdit.statistics.detailed", "상세 통계")}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Chip
                label={t(
                  "testResultEdit.statistics.draft",
                  "임시저장: {count}",
                  { count: statistics.draftEdits || 0 },
                )}
                variant="outlined"
              />
              <Chip
                label={t(
                  "testResultEdit.statistics.approved",
                  "승인됨: {count}",
                  { count: statistics.approvedEdits || 0 },
                )}
                color="success"
                variant="outlined"
              />
              <Chip
                label={t(
                  "testResultEdit.statistics.rejected",
                  "거부됨: {count}",
                  { count: statistics.rejectedEdits || 0 },
                )}
                color="error"
                variant="outlined"
              />
              <Chip
                label={t(
                  "testResultEdit.statistics.reverted",
                  "되돌림: {count}",
                  { count: statistics.revertedEdits || 0 },
                )}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: "80vh" },
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon />
          {t("testResultEdit.permissions.title", "편집 권한 관리")}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 탭 네비게이션 */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant={activeTab === "pending" ? "contained" : "outlined"}
              onClick={() => setActiveTab("pending")}
              startIcon={<ScheduleIcon />}
              size="small"
            >
              {t("testResultEdit.permissions.pendingTab", "승인 대기")} (
              {pendingEdits.length})
            </Button>
            <Button
              variant={activeTab === "my-edits" ? "contained" : "outlined"}
              onClick={() => setActiveTab("my-edits")}
              startIcon={<PersonIcon />}
              size="small"
            >
              {t("testResultEdit.permissions.myEditsTab", "내 편집본")} (
              {myEdits.length})
            </Button>
            <Button
              variant={activeTab === "statistics" ? "contained" : "outlined"}
              onClick={() => setActiveTab("statistics")}
              startIcon={<AdminIcon />}
              size="small"
            >
              {t("testResultEdit.permissions.statisticsTab", "통계")}
            </Button>
          </Box>
        </Box>

        {/* 탭 컨텐츠 */}
        {activeTab === "pending" && renderPendingApprovals()}
        {activeTab === "my-edits" && renderMyEdits()}
        {activeTab === "statistics" && renderStatistics()}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={loadPermissionsData}
          disabled={loading}
          startIcon={<ViewIcon />}
        >
          {t("common.refresh", "새로고침")}
        </Button>
        <Button onClick={onClose}>{t("common.close", "닫기")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestResultEditPermissionsManager;
