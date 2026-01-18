// src/components/OrganizationDetail.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Assignment as ProjectIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { OrganizationService } from '../services/organizationService';
import { getRoleChipColor } from '../utils/roleUtils';
import { formatDateOnlySafe } from '../utils/dateUtils';
import { useTranslation } from '../context/I18nContext';

import TabPanel from './common/TabPanel';

const OrganizationDetail = ({ organizationId }) => {
  const navigate = useNavigate();
  const { api, user } = useAppContext();
  const { t } = useTranslation();
  
  // props에서 받은 organizationId를 사용, fallback으로 useParams 사용
  const { id: paramId } = useParams();
  const id = organizationId || paramId;
  
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // 멤버 관리
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ username: '', role: 'MEMBER' });
  const [inviteError, setInviteError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // 프로젝트 생성 관리
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectData, setProjectData] = useState({ code: '', name: '', description: '' });
  const [projectError, setProjectError] = useState('');
  
  // 조직 수정 관리
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [editError, setEditError] = useState('');

  // 소유권 이전 관리
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTargetMember, setTransferTargetMember] = useState(null);
  const [transferError, setTransferError] = useState('');

  const organizationService = new OrganizationService(api);

  // 현재 사용자의 조직 내 권한 확인
  const getCurrentUserRole = () => {
    if (!user || !members.length) return null;
    const currentUserMember = members.find(member => member.user.username === user.username);
    return currentUserMember?.roleInOrganization || null;
  };

  const isCurrentUserOwner = () => {
    return getCurrentUserRole() === 'OWNER';
  };

  const isCurrentUserAdmin = () => {
    const role = getCurrentUserRole();
    return role === 'OWNER' || role === 'ADMIN';
  };

  const canManageOrganization = () => {
    // 시스템 관리자이거나 조직 소유자/관리자인 경우
    return user?.role === 'ADMIN' || isCurrentUserAdmin();
  };

  useEffect(() => {
    if (id) {
      loadOrganizationData();
    } else {
    }
  }, [id]);  // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!id) {
        throw new Error(t('organization.error.idNotProvided'));
      }

      const orgData = await organizationService.getOrganization(id);

      const membersData = await organizationService.getOrganizationMembers(id);

      // 조직 데이터에 이미 프로젝트가 포함되어 있으므로 별도 API 호출 불필요
      const projectsData = orgData.projects || [];

      setOrganization(orgData);
      setMembers(membersData);
      setProjects(projectsData);
    } catch (err) {
      console.error('[OrganizationDetail] 데이터 로드 오류:', err);
      setError(err.message || t('organization.error.dataLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMemberMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMemberMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleInviteMember = () => {
    setInviteData({ username: '', role: 'MEMBER' });
    setInviteError('');
    setInviteDialogOpen(true);
  };

  const handleInviteSubmit = async () => {
    if (!inviteData.username.trim()) {
      setInviteError(t('organization.form.usernameRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setInviteError('');
      
      await organizationService.inviteMember(id, inviteData);
      await loadOrganizationData();
      setInviteDialogOpen(false);
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      setSubmitting(true);
      // 수정: selectedMember.id 대신 selectedMember.user.id를 사용
      // 백엔드에서는 OrganizationUser ID가 아닌 User ID를 필요로 함
      await organizationService.removeMember(id, selectedMember.user.id);
      await loadOrganizationData();
      handleMemberMenuClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 조직 수정 관련 함수들
  const handleEditOrganization = () => {
    if (!organization) {
      setEditError(t('organization.error.infoLoadFailed'));
      return;
    }
    
    try {
      const editDataToSet = { 
        name: organization.name || '', 
        description: organization.description || '' 
      };
      
      setEditData(editDataToSet);
      setEditError('');
      setEditDialogOpen(true);
    } catch (error) {
      console.error('[OrganizationDetail] 조직 수정 다이얼로그 열기 오류:', error);
      setEditError(t('organization.error.editDialogFailed'));
    }
  };

  const handleEditSubmit = async () => {
    if (!editData.name.trim()) {
      setEditError(t('organization.form.nameRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setEditError('');

      await organizationService.updateOrganization(id, editData);
      await loadOrganizationData();
      setEditDialogOpen(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 소유권 이전 관련 함수들
  const handleTransferOwnership = (member) => {
    setTransferTargetMember(member);
    setTransferError('');
    setTransferDialogOpen(true);
    handleMemberMenuClose();
  };

  const handleTransferSubmit = async () => {
    if (!transferTargetMember) {
      setTransferError(t('organization.error.selectMember'));
      return;
    }

    try {
      setSubmitting(true);
      setTransferError('');

      await organizationService.transferOwnership(id, transferTargetMember.user.id);
      await loadOrganizationData();
      setTransferDialogOpen(false);
      setTransferTargetMember(null);
    } catch (err) {
      setTransferError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 프로젝트 생성 관련 함수들
  const handleCreateProject = () => {
    setProjectData({ code: '', name: '', description: '' });
    setProjectError('');
    setProjectDialogOpen(true);
  };

  const handleProjectSubmit = async () => {
    if (!projectData.code.trim()) {
      setProjectError(t('organization.form.projectCodeRequired'));
      return;
    }
    
    if (!projectData.name.trim()) {
      setProjectError(t('organization.form.projectNameRequired'));
      return;
    }

    try {
      setSubmitting(true);
      setProjectError('');
      
      await organizationService.createOrganizationProject(id, projectData);
      await loadOrganizationData();
      setProjectDialogOpen(false);
    } catch (err) {
      console.error('[조직 프로젝트 생성] 오류:', err);
      setProjectError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={() => navigate('/organizations')}>
          {t('organization.buttons.backToList')}
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!organization) {
    return (
      <Alert severity="warning">
        {t('organization.error.notFound')}
      </Alert>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/organizations')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1">
            {organization.name}
          </Typography>
          {organization.description && (
            <Typography variant="body1" color="text.secondary">
              {organization.description}
            </Typography>
          )}
        </Box>
        {canManageOrganization() && (
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={handleEditOrganization}
          >
            {t('organization.buttons.edit')}
          </Button>
        )}
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ProjectIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{projects.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('organization.dashboard.charts.projectDistribution.projects')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{members.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('organization.dashboard.charts.projectDistribution.members')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 탭 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t('organization.tabs.members')} />
          <Tab label={t('organization.tabs.projects')} />
        </Tabs>
      </Box>

      {/* 멤버 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{t('organization.tabs.members', '조직 멤버')}</Typography>
          {canManageOrganization() && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleInviteMember}
            >
              {t('organization.buttons.inviteMember')}
            </Button>
          )}
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('organization.table.user')}</TableCell>
                <TableCell>{t('organization.table.role')}</TableCell>
                <TableCell>{t('organization.table.joinDate')}</TableCell>
                <TableCell align="right">{t('organization.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                        {member.user.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {member.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{member.user.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={t(`organization.role.${member.roleInOrganization.toLowerCase()}`)}
                      color={getRoleChipColor(member.roleInOrganization)}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDateOnlySafe(member.createdAt)}
                  </TableCell>
                  <TableCell align="right">
                    {canManageOrganization() && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMemberMenuOpen(e, member)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 프로젝트 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{t('organization.tabs.projects')}</Typography>
          {canManageOrganization() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
            >
              {t('organization.buttons.createProject')}
            </Button>
          )}
        </Box>
        
        {projects.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary" gutterBottom>
              {t('organization.messages.noProjects')}
            </Typography>
            {canManageOrganization() && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                sx={{ mt: 2 }}
              >
                {t('organization.buttons.firstProject')}
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {projects.map((project) => (
              <Grid size={{ xs: 12, md: 6 }} key={project.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { 
                      boxShadow: 4,
                      backgroundColor: 'action.hover' 
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {project.description || t('organization.project.noDescription')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('organization.project.organizationLabel')}: {organization.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>


      {/* 멤버 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMemberMenuClose}
      >
        {(user?.role === 'ADMIN' || isCurrentUserOwner()) && selectedMember && selectedMember.roleInOrganization !== 'OWNER' && (
          <MenuItem onClick={() => handleTransferOwnership(selectedMember)}>
            {t('organization.buttons.transferOwnership', '소유권 이전')}
          </MenuItem>
        )}
        <MenuItem onClick={handleRemoveMember} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t('organization.buttons.removeMember')}
        </MenuItem>
      </Menu>

      {/* 멤버 초대 다이얼로그 */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('organization.dialog.invite.title')}</DialogTitle>
        <DialogContent>
          {inviteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {inviteError}
            </Alert>
          )}
          <TextField
            autoFocus
            label={t('organization.form.username')}
            fullWidth
            variant="outlined"
            value={inviteData.username}
            onChange={(e) => setInviteData(prev => ({ ...prev, username: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>{t('organization.form.role')}</InputLabel>
            <Select
              value={inviteData.role}
              onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
              label={t('organization.form.role')}
            >
              <MenuItem value="MEMBER">{t('organization.role.member')}</MenuItem>
              <MenuItem value="ADMIN">{t('organization.role.admin')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)} disabled={submitting}>
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={handleInviteSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : t('organization.buttons.invite')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 프로젝트 생성 다이얼로그 */}
      <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('organization.dialog.createProject.title')}</DialogTitle>
        <DialogContent>
          {projectError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {projectError}
            </Alert>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('organization.dialog.createProject.info', { organizationName: organization?.name })}
          </Alert>
          <TextField
            autoFocus
            label={t('organization.form.projectCode')}
            fullWidth
            variant="outlined"
            value={projectData.code}
            onChange={(e) => setProjectData(prev => ({ ...prev, code: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            required
            placeholder={t('organization.form.projectCodePlaceholder')}
            helperText={t('organization.form.projectCodeHelp')}
          />
          <TextField
            label={t('organization.form.projectName')}
            fullWidth
            variant="outlined"
            value={projectData.name}
            onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
            required
            placeholder={t('organization.form.projectNamePlaceholder')}
          />
          <TextField
            label={t('organization.form.projectDescription')}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={projectData.description}
            onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t('organization.form.projectDescriptionPlaceholder')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDialogOpen(false)} disabled={submitting}>
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={handleProjectSubmit}
            variant="contained"
            disabled={submitting || !projectData.code.trim() || !projectData.name.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : t('common.buttons.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 조직 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('organization.dialog.edit.title')}</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <TextField
            autoFocus
            label={t('organization.form.name')}
            fullWidth
            variant="outlined"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            required
            placeholder={t('organization.form.namePlaceholder')}
          />
          <TextField
            label={t('organization.form.description')}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t('organization.form.descriptionPlaceholder')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={submitting}>
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={submitting || !editData.name.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : t('common.buttons.edit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 소유권 이전 다이얼로그 */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('organization.dialog.transferOwnership.title', '소유권 이전')}</DialogTitle>
        <DialogContent>
          {transferError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {transferError}
            </Alert>
          )}
          <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
            {t('organization.dialog.transferOwnership.warning', '소유권을 이전하면 이 조직의 모든 관리 권한이 새로운 소유자에게 넘어갑니다. 이 작업은 되돌릴 수 없습니다.')}
          </Alert>
          {transferTargetMember && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('organization.dialog.transferOwnership.newOwner', '새로운 소유자')}:
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                  {transferTargetMember.user.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {transferTargetMember.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{transferTargetMember.user.username}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)} disabled={submitting}>
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={handleTransferSubmit}
            variant="contained"
            color="warning"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : t('organization.buttons.transfer', '이전하기')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationDetail;