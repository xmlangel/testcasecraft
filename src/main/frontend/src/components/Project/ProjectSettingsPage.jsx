// src/components/Project/ProjectSettingsPage.jsx
//
// 프로젝트 설정 화면 (`/projects/:projectId/settings`).
//
// 두 갈래를 한 화면에 둔다.
//   일반 — 프로젝트 이름·설명·정렬 순서 변경 (PROJECT_MANAGER)
//   멤버 — 사용자별 프로젝트 역할 부여·변경·제거 (PROJECT_MANAGER, LEAD_DEVELOPER)
//
// 진입 자체를 역할로 막는다. 백엔드 멤버 API 는 hasManagementRole 로 두 역할만
// 통과시키므로, 다른 역할에게 화면을 열어 주면 저장 단계에서 403 만 보게 된다.
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  RemoveCircleOutline as RemoveIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import useProjectRole from "../../hooks/useProjectRole.js";
import projectService from "../../services/projectService.js";
import projectMemberService, {
  PROJECT_ROLES,
} from "../../services/projectMemberService.js";
import {
  canManageProjectMembers,
  canManageProjectSettings,
} from "../TestCaseTree/utils/permissionUtils.js";

export default function ProjectSettingsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const { projectRole, loading: roleLoading } = useProjectRole(projectId, user);

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  // 일반 탭
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    displayOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  // 멤버 탭
  const [members, setMembers] = useState([]);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState("TESTER");
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const canEditMembers = canManageProjectMembers(projectRole);
  const canEditSettings = canManageProjectSettings(projectRole);

  // 역할 라벨. 번역 키와 한국어 기본값을 t() 안에 두어야 i18n 스캐너가 하드코딩으로 세지 않는다.
  const roleLabel = useCallback(
    (role) => {
      switch (role) {
        case "PROJECT_MANAGER":
          return t("projectSettings.role.projectManager", "프로젝트 매니저");
        case "LEAD_DEVELOPER":
          return t("projectSettings.role.leadDeveloper", "리드 개발자");
        case "DEVELOPER":
          return t("projectSettings.role.developer", "개발자");
        case "TESTER":
          return t("projectSettings.role.tester", "테스터");
        case "CONTRIBUTOR":
          return t("projectSettings.role.contributor", "기여자");
        case "VIEWER":
          return t("projectSettings.role.viewer", "뷰어");
        default:
          return role;
      }
    },
    [t],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectData, memberList] = await Promise.all([
        projectService.getProject(projectId),
        projectMemberService.getMembers(projectId),
      ]);
      setProject(projectData);
      setForm({
        name: projectData?.name ?? "",
        description: projectData?.description ?? "",
        displayOrder: projectData?.displayOrder ?? 0,
      });
      setMembers(Array.isArray(memberList) ? memberList : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!roleLoading && canEditMembers) {
      load();
    } else if (!roleLoading) {
      setLoading(false);
    }
  }, [roleLoading, canEditMembers, load]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await projectService.updateProject(projectId, {
        ...project,
        name: form.name,
        description: form.description,
        displayOrder: Number(form.displayOrder) || 0,
      });
      setProject(updated);
      setNotice(
        t("projectSettings.general.saved", "프로젝트 설정을 저장했습니다."),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (member, nextRole) => {
    setError(null);
    try {
      await projectMemberService.updateMemberRole(
        projectId,
        member.user.id,
        nextRole,
      );
      setMembers((cur) =>
        cur.map((m) =>
          m.id === member.id ? { ...m, roleInProject: nextRole } : m,
        ),
      );
      setNotice(
        t("projectSettings.members.roleUpdated", "역할을 변경했습니다."),
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return;
    setInviting(true);
    setError(null);
    try {
      await projectMemberService.inviteMember(
        projectId,
        inviteUsername.trim(),
        inviteRole,
      );
      setInviteUsername("");
      setNotice(t("projectSettings.members.invited", "멤버를 추가했습니다."));
      const memberList = await projectMemberService.getMembers(projectId);
      setMembers(Array.isArray(memberList) ? memberList : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setError(null);
    try {
      await projectMemberService.removeMember(projectId, removeTarget.user.id);
      setMembers((cur) => cur.filter((m) => m.id !== removeTarget.id));
      setNotice(t("projectSettings.members.removed", "멤버를 제거했습니다."));
    } catch (e) {
      setError(e.message);
    } finally {
      setRemoveTarget(null);
    }
  };

  const goBack = () => navigate(`/projects/${projectId}`);

  if (roleLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!canEditMembers) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning" data-testid="project-settings-denied">
          {t(
            "projectSettings.denied",
            "프로젝트 설정은 프로젝트 매니저·리드 개발자·시스템 관리자만 열 수 있습니다.",
          )}
        </Alert>
        <Button sx={{ mt: 2 }} onClick={goBack} startIcon={<ArrowBackIcon />}>
          {t("projectSettings.back", "프로젝트로 돌아가기")}
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            onClick={goBack}
            title={t("projectSettings.back", "프로젝트로 돌아가기")}
            data-testid="project-settings-back"
          >
            <ArrowBackIcon />
          </IconButton>
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("projectSettings.title", "프로젝트 설정")}
            {project?.name ? ` · ${project.name}` : ""}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs
          value={tab}
          onChange={(_, next) => setTab(next)}
          sx={{ mb: 2 }}
          data-testid="project-settings-tabs"
        >
          <Tab
            label={t("projectSettings.tab.general", "일반")}
            data-testid="project-settings-tab-general"
          />
          <Tab
            label={t("projectSettings.tab.members", "멤버")}
            data-testid="project-settings-tab-members"
          />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          <Paper variant="outlined" sx={{ p: 2, maxWidth: 640 }}>
            {!canEditSettings && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t(
                  "projectSettings.general.readonly",
                  "프로젝트 정보 변경은 프로젝트 매니저와 시스템 관리자만 할 수 있습니다.",
                )}
              </Alert>
            )}
            <TextField
              label={t("projectSettings.general.code", "프로젝트 코드")}
              value={project?.code ?? ""}
              fullWidth
              margin="normal"
              disabled
              helperText={t(
                "projectSettings.general.codeHint",
                "코드는 생성 후 변경할 수 없습니다.",
              )}
            />
            <TextField
              label={t("projectSettings.general.name", "프로젝트 이름")}
              value={form.name}
              onChange={(e) =>
                setForm((cur) => ({ ...cur, name: e.target.value }))
              }
              fullWidth
              margin="normal"
              disabled={!canEditSettings}
              inputProps={{ maxLength: 100 }}
              data-testid="project-settings-name"
            />
            <TextField
              label={t("projectSettings.general.description", "설명")}
              value={form.description}
              onChange={(e) =>
                setForm((cur) => ({ ...cur, description: e.target.value }))
              }
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              disabled={!canEditSettings}
              inputProps={{ maxLength: 1000 }}
              data-testid="project-settings-description"
            />
            <TextField
              label={t("projectSettings.general.displayOrder", "정렬 순서")}
              value={form.displayOrder}
              onChange={(e) =>
                setForm((cur) => ({ ...cur, displayOrder: e.target.value }))
              }
              type="number"
              fullWidth
              margin="normal"
              disabled={!canEditSettings}
              data-testid="project-settings-display-order"
            />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSaveGeneral}
                disabled={!canEditSettings || saving || !form.name.trim()}
                data-testid="project-settings-save"
              >
                {t("projectSettings.general.save", "저장")}
              </Button>
            </Box>
          </Paper>
        ) : (
          <Box>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {t("projectSettings.members.invite", "멤버 추가")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  size="small"
                  label={t("projectSettings.members.username", "사용자명")}
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  sx={{ minWidth: 220 }}
                  data-testid="project-settings-invite-username"
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="invite-role-label">
                    {t("projectSettings.members.column.role", "역할")}
                  </InputLabel>
                  <Select
                    labelId="invite-role-label"
                    label={t("projectSettings.members.column.role", "역할")}
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    data-testid="project-settings-invite-role"
                  >
                    {PROJECT_ROLES.map((role) => (
                      <MenuItem key={role} value={role}>
                        {roleLabel(role)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={handleInvite}
                  disabled={inviting || !inviteUsername.trim()}
                  data-testid="project-settings-invite-submit"
                >
                  {t("projectSettings.members.inviteSubmit", "추가")}
                </Button>
              </Box>
            </Paper>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small" data-testid="project-settings-member-table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {t("projectSettings.members.column.username", "사용자명")}
                    </TableCell>
                    <TableCell>
                      {t("projectSettings.members.column.name", "이름")}
                    </TableCell>
                    <TableCell>
                      {t("projectSettings.members.column.email", "이메일")}
                    </TableCell>
                    <TableCell sx={{ width: 220 }}>
                      {t("projectSettings.members.column.role", "역할")}
                    </TableCell>
                    <TableCell align="right" sx={{ width: 80 }}>
                      {t("projectSettings.members.column.actions", "동작")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          {t(
                            "projectSettings.members.empty",
                            "프로젝트 멤버가 없습니다.",
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.user?.username}</TableCell>
                        <TableCell>{member.user?.name}</TableCell>
                        <TableCell>{member.user?.email}</TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            fullWidth
                            value={member.roleInProject}
                            onChange={(e) =>
                              handleRoleChange(member, e.target.value)
                            }
                            data-testid={`project-settings-role-${member.user?.username}`}
                          >
                            {PROJECT_ROLES.map((role) => (
                              <MenuItem key={role} value={role}>
                                {roleLabel(role)}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setRemoveTarget(member)}
                            title={t(
                              "projectSettings.members.remove",
                              "멤버 제거",
                            )}
                            data-testid={`project-settings-remove-${member.user?.username}`}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              {t(
                "projectSettings.members.hint",
                "역할을 바꾸면 곧바로 적용됩니다. 마지막 프로젝트 매니저는 역할을 바꾸거나 제거할 수 없습니다.",
              )}
            </Typography>
          </Box>
        )}
      </Container>

      <Dialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
      >
        <DialogTitle>
          {t("projectSettings.members.remove", "멤버 제거")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "projectSettings.members.removeConfirm",
              "{username} 을(를) 이 프로젝트에서 제거하시겠습니까?",
              { username: removeTarget?.user?.username ?? "" },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(null)}>
            {t("common.buttons.cancel", "취소")}
          </Button>
          <Button
            color="error"
            onClick={handleRemove}
            data-testid="project-settings-remove-confirm"
          >
            {t("projectSettings.members.remove", "멤버 제거")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3000}
        onClose={() => setNotice("")}
        message={notice}
      />
    </Box>
  );
}
