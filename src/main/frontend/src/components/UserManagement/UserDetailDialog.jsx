// src/components/UserManagement/UserDetailDialog.jsx
/**
 * 사용자 상세 정보 다이얼로그 컴포넌트
 * 
 * 선택된 사용자의 상세 정보를 표시하고 편집할 수 있는 다이얼로그입니다.
 * 기본 정보 수정, 역할 변경, 계정 활성화/비활성화 등의 기능을 제공합니다.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
  Work as WorkIcon,
  BugReport as BugReportIcon,
  AccountCircle as UserIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  History as HistoryIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import { useUserDetail } from '../../hooks/useUserManagement.js';
import { USER_ROLES } from '../../services/userManagementService.js';
import LoadingSpinner from '../atoms/LoadingSpinner/LoadingSpinner.jsx';
import ErrorMessage from '../atoms/ErrorMessage/ErrorMessage.jsx';
import ConfirmDialog from '../molecules/ConfirmDialog/ConfirmDialog.jsx';
import AdminPasswordChangeDialog from './AdminPasswordChangeDialog.jsx';
import { formatDateSafe } from '../../utils/dateUtils';
import { useI18n } from '../../context/I18nContext.jsx';

/**
 * 역할 아이콘 매핑
 */
const ROLE_ICONS = {
  ADMIN: AdminIcon,
  MANAGER: WorkIcon,
  TESTER: BugReportIcon,
  USER: UserIcon
};

/**
 * 활동 상태 정보
 */
const ACTIVITY_STATUS = {
  active: { label: 'userDetail.activity.active', color: 'success' },
  recent: { label: 'userDetail.activity.recent', color: 'info' },
  moderate: { label: 'userDetail.activity.moderate', color: 'warning' },
  inactive: { label: 'userDetail.activity.inactive', color: 'error' },
  unknown: { label: 'userDetail.activity.unknown', color: 'default' }
};

/**
 * 사용자 상세 정보 다이얼로그
 */
const UserDetailDialog = ({
  open,
  onClose,
  userId,
  onUserUpdated,
  ...dialogProps
}) => {
  const { t } = useI18n();

  // 사용자 상세 정보 훅
  const { user, activity, loading, error, updateUser, refresh } = useUserDetail(userId);

  // 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true
  });

  // 확인 다이얼로그 상태
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // 로컬 에러 상태
  const [localError, setLocalError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // 비밀번호 변경 다이얼로그 상태
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);

  /**
   * 사용자 정보가 로드되면 편집 폼 초기화
   */
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'USER',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
      setLocalError(null);
    }
  }, [user]);

  /**
   * 다이얼로그가 열릴 때마다 편집 모드 해제
   */
  useEffect(() => {
    if (open) {
      setIsEditing(false);
      setLocalError(null);
    }
  }, [open]);

  /**
   * 편집 모드 토글
   */
  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // 편집 취소 시 원래 값으로 복원
      if (user) {
        setEditForm({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'USER',
          isActive: user.isActive !== undefined ? user.isActive : true
        });
      }
      setLocalError(null);
    }
    setIsEditing(!isEditing);
  }, [isEditing, user]);

  /**
   * 폼 필드 변경 처리
   */
  const handleFormChange = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setLocalError(null);
  }, []);

  /**
   * 사용자 정보 저장
   */
  const handleSave = useCallback(async () => {
    if (!user) return;

    // 기본 정보 검증
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setLocalError(t('userDetail.validation.required', '이름과 이메일은 필수 입력 항목입니다.'));
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setLocalError(t('userDetail.validation.emailFormat', '올바른 이메일 형식을 입력해주세요.'));
      return;
    }

    setSaveLoading(true);
    setLocalError(null);

    try {
      // 사용자 정보 업데이트 (모든 필드 포함)
      const updateResult = await updateUser({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        isActive: editForm.isActive
      });

      if (!updateResult.success) {
        setLocalError(updateResult.error);
        return;
      }

      setIsEditing(false);
      if (onUserUpdated) {
        onUserUpdated();
      }

    } catch (err) {
      setLocalError(t('userDetail.error.saveError', '저장 중 오류가 발생했습니다.'));
    } finally {
      setSaveLoading(false);
    }
  }, [user, editForm, updateUser, onUserUpdated]);

  /**
   * 확인 다이얼로그 표시
   */
  const showConfirmDialog = useCallback((title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm
    });
  }, []);

  /**
   * 확인 다이얼로그 닫기
   */
  const handleConfirmDialogClose = useCallback(() => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      onConfirm: null
    });
  }, []);

  /**
   * 다이얼로그 닫기
   */
  const handleClose = useCallback(() => {
    if (isEditing) {
      showConfirmDialog(
        t('userDetail.editCancel.title', '편집 취소'),
        t('userDetail.editCancel.message', '편집 중인 내용이 있습니다. 저장하지 않고 닫으시겠습니까?'),
        () => {
          setIsEditing(false);
          onClose();
          handleConfirmDialogClose();
        }
      );
    } else {
      onClose();
    }
  }, [isEditing, onClose, showConfirmDialog, handleConfirmDialogClose]);

  /**
   * 역할 아이콘 렌더링
   */
  const renderRoleIcon = useCallback((role) => {
    const IconComponent = ROLE_ICONS[role] || UserIcon;
    return <IconComponent />;
  }, []);

  /**
   * 활동 상태 정보 렌더링
   */
  const renderActivityStatus = useCallback(() => {
    if (!activity) return null;

    const status = ACTIVITY_STATUS[activity.activityStatus] || ACTIVITY_STATUS.unknown;

    return (
      <Chip
        icon={<HistoryIcon />}
        label={t(status.label)}
        color={status.color}
        size="small"
        variant="outlined"
      />
    );
  }, [activity]);

  /**
   * 로딩 상태 렌더링
   */
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <LoadingSpinner message={t('userDetail.loading', '사용자 정보를 불러오는 중...')} />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  /**
   * 에러 상태 렌더링
   */
  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{t('userDetail.title', '사용자 정보')}</DialogTitle>
        <DialogContent>
          <ErrorMessage
            message={error}
            onRetry={refresh}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('userDetail.button.close', '닫기')}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * 사용자 정보가 없는 경우
   */
  if (!user) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{t('userDetail.title', '사용자 정보')}</DialogTitle>
        <DialogContent>
          <Typography>{t('userDetail.notFound', '사용자 정보를 찾을 수 없습니다.')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('userDetail.button.close', '닫기')}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        {...dialogProps}
        slotProps={{
          paper: {
            sx: { minHeight: '600px' }
          }
        }}>
        <DialogTitle id="user-detail-dialog-title">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {renderRoleIcon(user.role)}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {user.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  @{user.username}
                </Typography>
              </Box>
            </Box>
            <Box>
              {isEditing ? (
                <Box>
                  <Tooltip title={t('userDetail.tooltip.save', '저장')}>
                    <IconButton
                      onClick={handleSave}
                      disabled={saveLoading}
                      color="primary"
                    >
                      {saveLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('userDetail.tooltip.cancel', '취소')}>
                    <IconButton onClick={handleEditToggle}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Box display="flex" gap={1}>
                  <Tooltip title={t('userDetail.tooltip.edit', '편집')}>
                    <IconButton onClick={handleEditToggle}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('userDetail.tooltip.passwordChange', '비밀번호 변경')}>
                    <IconButton onClick={() => setPasswordChangeOpen(true)}>
                      <SecurityIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent id="user-detail-dialog-description">
          {/* 에러 메시지 */}
          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* 기본 정보 */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('userDetail.section.basicInfo', '기본 정보')}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={t('userDetail.form.name', '이름')}
                        value={editForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        margin="normal"
                        slotProps={{
                          input: {
                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={t('userDetail.form.email', '이메일')}
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        disabled={!isEditing}
                        fullWidth
                        margin="normal"
                        slotProps={{
                          input: {
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth margin="normal" disabled={!isEditing}>
                        <InputLabel>{t('userDetail.form.role', '역할')}</InputLabel>
                        <Select
                          value={editForm.role}
                          label={t('userDetail.form.role', '역할')}
                          onChange={(e) => handleFormChange('role', e.target.value)}
                          startAdornment={renderRoleIcon(editForm.role)}
                        >
                          {Object.entries(USER_ROLES).map(([value, role]) => (
                            <MenuItem key={value} value={value}>
                              <Box display="flex" alignItems="center">
                                {renderRoleIcon(value)}
                                <Box ml={1}>
                                  <Typography variant="body2">
                                    {t(role.label)}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {t(role.description)}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editForm.isActive}
                            onChange={(e) => handleFormChange('isActive', e.target.checked)}
                            disabled={!isEditing}
                          />
                        }
                        label={t('userDetail.form.accountActive', '계정 활성화')}
                        sx={{ mt: 2 }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* 상태 정보 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('userDetail.section.statusInfo', '상태 정보')}
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('userDetail.status.role', '역할')}
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Chip
                            icon={renderRoleIcon(user.role)}
                            label={t(USER_ROLES[user.role]?.label || user.role)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        }
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        {user.isActive ? <CheckCircleIcon color="success" /> : <BlockIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={t('userDetail.status.account', '계정 상태')}
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Chip
                            label={user.isActive ? t('userDetail.status.active', '활성') : t('userDetail.status.inactive', '비활성')}
                            size="small"
                            color={user.isActive ? 'success' : 'error'}
                            variant={user.isActive ? 'filled' : 'outlined'}
                          />
                        }
                      />
                    </ListItem>

                    {activity && (
                      <ListItem>
                        <ListItemIcon>
                          <HistoryIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={t('userDetail.status.activity', '활동 상태')}
                          secondaryTypographyProps={{ component: 'div' }}
                          secondary={renderActivityStatus()}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>

              {/* 시간 정보 */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('userDetail.section.timeInfo', '시간 정보')}
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('userDetail.time.createdAt', '가입일')}
                        secondary={formatDateSafe(user.createdAt)}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('userDetail.time.updatedAt', '최종 수정일')}
                        secondary={
                          user.updatedAt
                            ? formatDateSafe(user.updatedAt)
                            : t('userDetail.time.none', '없음')
                        }
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('userDetail.time.lastLogin', '최종 로그인')}
                        secondary={
                          user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString('ko-KR')
                            : t('userDetail.time.none', '없음')
                        }
                      />
                    </ListItem>

                    {activity && activity.daysSinceLastLogin !== null && (
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={t('userDetail.time.daysSinceLogin', '미접속 일수')}
                          secondary={`${activity.daysSinceLastLogin}${t('userDetail.time.days', '일')}`}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{t('userDetail.button.close', '닫기')}</Button>
          {isEditing && (
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saveLoading}
              startIcon={saveLoading ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              {t('userDetail.button.save', '저장')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleConfirmDialogClose}
      />
      {/* 비밀번호 변경 다이얼로그 */}
      <AdminPasswordChangeDialog
        open={passwordChangeOpen}
        onClose={() => setPasswordChangeOpen(false)}
        user={user}
        onSuccess={(message) => {
          setLocalError(null);
          // 성공 메시지를 확인 다이얼로그로 표시
          setConfirmDialog({
            open: true,
            title: t('userDetail.success.passwordChanged', '비밀번호 변경 완료'),
            message: message,
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, open: false }))
          });
        }}
      />
    </>
  );
};

export default UserDetailDialog;