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

const OrganizationList = () => {
  const { api, user } = useAppContext();
  const navigate = useNavigate();
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
      case 'ACCESS_DENIED': return '접근 권한 없음';
      case 'AUTHENTICATION_REQUIRED': return '인증 필요';
      case 'RESOURCE_NOT_FOUND': return '리소스 없음';
      default: return '오류 발생';
    }
  };

  const getErrorDescription = (errorCode) => {
    switch (errorCode) {
      case 'ACCESS_DENIED': 
        return '현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.';
      case 'AUTHENTICATION_REQUIRED': 
        return '로그인이 필요합니다. 다시 로그인해주세요.';
      case 'RESOURCE_NOT_FOUND': 
        return '요청한 리소스를 찾을 수 없습니다.';
      default: 
        return '문제가 지속되면 시스템 관리자에게 문의하세요.';
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
      setFormError('조직 이름을 입력해주세요.');
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
          조직 관리
        </Typography>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewOrganization}
          >
            새 조직 생성
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity={errorDetails?.type === 'ACCESS_DENIED' ? 'warning' : 'error'} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {errorDetails?.title || '문제가 발생했습니다'}
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
              발생 시간: {new Date(errorDetails.timestamp).toLocaleString('ko-KR')}
            </Typography>
          )}
        </Alert>
      )}

      {organizations.length === 0 && !error ? (
        <Box textAlign="center" py={8}>
          <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            조직이 없습니다
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            {user?.role === 'ADMIN' ? '새 조직을 생성하여 프로젝트와 팀을 관리해보세요.' : '조직에 참가하려면 시스템 관리자에게 문의하세요.'}
          </Typography>
          {user?.role === 'ADMIN' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewOrganization}
            >
              첫 번째 조직 생성
            </Button>
          )}
        </Box>
      ) : organizations.length > 0 ? (
        <Grid container spacing={3}>
          {organizations.map((org) => (
            <Grid item xs={12} md={6} lg={4} key={org.id}>
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
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {org.description}
                    </Typography>
                  )}

                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Tooltip title="프로젝트 수">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AssignmentIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {(org.projects && org.projects.length) || 0}
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title="멤버 수">
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
                      console.log('[OrganizationList] 조직 보기 클릭:', org);
                      console.log('[OrganizationList] 네비게이션 경로:', `/organizations/${org.id}`);
                      navigate(`/organizations/${org.id}`);
                    }}
                  >
                    조직 보기
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
            {user?.role === 'ADMIN' ? '기존 조직에 접근할 수 없지만, 새로운 조직을 생성할 수 있습니다.' : '현재 참가 가능한 조직이 없습니다. 시스템 관리자에게 문의하세요.'}
          </Typography>
          {user?.role === 'ADMIN' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewOrganization}
              color="primary"
            >
              새 조직 생성
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
          수정
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>

      {/* 조직 생성/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOrg ? '조직 수정' : '새 조직 생성'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            label="조직 이름"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            label="설명"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="조직에 대한 설명을 입력하세요..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={submitting}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : (editingOrg ? '수정' : '생성')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>조직 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            '<strong>{deletingOrg?.name}</strong>' 조직을 정말 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이 작업은 되돌릴 수 없습니다. 조직에 속한 모든 프로젝트와 데이터도 함께 삭제됩니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationList;