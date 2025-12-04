// src/components/OrganizationList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { OrganizationService } from '../services/organizationService';
import { getRoleDisplayName, getRoleChipColor } from '../utils/roleUtils';
// ICT-272: 표준 레이아웃 패턴 import
import { PAGE_CONTAINER_SX } from '../styles/layoutConstants';
import { useTranslation } from '../context/I18nContext';

const OrganizationList = () => {
  const { api, user } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // 조직 생성/수정 다이얼로그
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 삭제 확인 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState(null);

  const organizationService = new OrganizationService(api);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError('');
      setErrorDetails(null);
      const data = await organizationService.getOrganizations();
      setOrganizations(data);
    } catch (err) {
      console.error('조직 목록 로딩 오류:', err);
      setError(err.message);

      // 백엔드 에러 응답의 상세 정보를 활용
      if (err.errorCode === 'ACCESS_DENIED') {
        setErrorDetails({
          type: err.errorCode,
          title: '조직 접근 권한 없음',
          description: '현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.',
          timestamp: err.timestamp,
          details: err.details
        });
      } else if (err.errorCode) {
        // 기타 백엔드 에러 코드가 있는 경우
        setErrorDetails({
          type: err.errorCode,
          title: getErrorTitle(err.errorCode),
          description: getErrorDescription(err.errorCode),
          timestamp: err.timestamp,
          details: err.details
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorTitle = (errorCode) => {
    switch (errorCode) {
      case 'ACCESS_DENIED': return t('organization.error.accessDenied');
      case 'AUTHENTICATION_REQUIRED': return t('organization.error.authRequired');
      case 'RESOURCE_NOT_FOUND': return t('organization.error.resourceNotFound');
      default: return t('organization.error.general');
    }
  };

  const getErrorDescription = (errorCode) => {
    switch (errorCode) {
      case 'ACCESS_DENIED':
        return t('organization.messages.accessDenied');
      case 'AUTHENTICATION_REQUIRED':
        return t('organization.error.authDescription');
      case 'RESOURCE_NOT_FOUND':
        return t('organization.error.notFoundDescription');
      default:
        return t('organization.error.generalDescription');
    }
  };

  const handleMenuOpen = (event, org) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrg(org);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrg(null);
  };

  const handleNewOrganization = () => {
    setEditingOrg(null);
    setFormData({ name: '', description: '' });
    setFormError('');
    setDialogOpen(true);
  };

  const handleEditOrganization = () => {
    setEditingOrg(selectedOrg);
    setFormData({
      name: selectedOrg.name,
      description: selectedOrg.description || ''
    });
    setFormError('');
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeletingOrg(selectedOrg);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingOrg(null);
    setFormData({ name: '', description: '' });
    setFormError('');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setFormError(t('organization.form.nameRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      if (editingOrg) {
        await organizationService.updateOrganization(editingOrg.id, formData);
      } else {
        await organizationService.createOrganization(formData);
      }

      await loadOrganizations();
      handleDialogClose();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrg) return;

    try {
      setSubmitting(true);
      await organizationService.deleteOrganization(deletingOrg.id);
      await loadOrganizations();
      setDeleteDialogOpen(false);
      setDeletingOrg(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={PAGE_CONTAINER_SX.main}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('organization.management.title')}
        </Typography>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewOrganization}
          >
            {t('organization.buttons.createNew')}
          </Button>
        )}
      </Box>
      {error && (
        <Alert severity={errorDetails?.type === 'ACCESS_DENIED' ? 'warning' : 'error'} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {errorDetails?.title || t('organization.error.problemOccurred')}
          </Typography>
          <Typography variant="body2" color="inherit">
            {error}
          </Typography>
          {errorDetails?.description && (
            <Typography variant="body2" color="inherit" sx={{ mt: 1, fontStyle: 'italic' }}>
              {errorDetails.description}
            </Typography>
          )}
          {errorDetails?.timestamp && (
            <Typography variant="caption" color="inherit" sx={{ mt: 1, opacity: 0.7 }}>
              {t('organization.error.occurredAt', { date: new Date(errorDetails.timestamp).toLocaleString() })}
            </Typography>
          )}
        </Alert>
      )}
      {organizations.length === 0 && !error ? (
        <Box textAlign="center" py={8}>
          <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('organization.messages.noOrganizations')}
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            {user?.role === 'ADMIN' ? t('organization.messages.createHint') : t('organization.messages.joinHint')}
          </Typography>
          {user?.role === 'ADMIN' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewOrganization}
            >
              {t('organization.buttons.firstOrganization')}
            </Button>
          )}
        </Box>
      ) : organizations.length > 0 ? (
        <Grid container spacing={3}>
          {organizations.map((org) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={org.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {org.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={getRoleDisplayName(org.userRole)}
                        color={getRoleChipColor(org.userRole)}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, org)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {org.description && (
                    <Typography variant="body2" color="text.secondary" sx={{
                      marginBottom: "16px"
                    }}>
                      {org.description}
                    </Typography>
                  )}

                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Tooltip title={t('organization.dashboard.charts.projectDistribution.projects')}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AssignmentIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {(org.projects && org.projects.length) || 0}
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title={t('organization.dashboard.charts.projectDistribution.members')}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {(org.organizationUsers && org.organizationUsers.length) || 0}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      navigate(`/organizations/${org.id}`);
                    }}
                  >
                    {t('organization.buttons.view')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}
      {/* 에러가 있고 권한 없는 상황에서 새 조직 생성 안내 */}
      {error && errorDetails?.type === 'ACCESS_DENIED' && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary" mb={2}>
            {user?.role === 'ADMIN' ? t('organization.messages.canCreateNew') : t('organization.messages.noAccessContact')}
          </Typography>
          {user?.role === 'ADMIN' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewOrganization}
              color="primary"
            >
              {t('organization.buttons.createNew')}
            </Button>
          )}
        </Box>
      )}
      {/* 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditOrganization}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.buttons.edit')}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.buttons.delete')}
        </MenuItem>
      </Menu>
      {/* 조직 생성/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOrg ? t('organization.dialog.edit.title') : t('organization.dialog.create.title')}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            label={t('organization.form.name')}
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            label={t('organization.form.description')}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder={t('organization.form.descriptionPlaceholder')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={submitting}>
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : (editingOrg ? t('common.buttons.edit') : t('common.buttons.create'))}
          </Button>
        </DialogActions>
      </Dialog>
      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('organization.dialog.delete.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            '<strong>{deletingOrg?.name}</strong>' {t('organization.dialog.delete.message')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('organization.dialog.delete.warning')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : t('common.buttons.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationList;