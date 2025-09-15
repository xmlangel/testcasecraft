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
import { getRoleDisplayName, getRoleChipColor } from '../utils/roleUtils';
import { formatDateOnlySafe } from '../utils/dateUtils';

import TabPanel from './common/TabPanel';

const OrganizationDetail = ({ organizationId }) => {
  const navigate = useNavigate();
  const { api, user } = useAppContext();
  
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
        throw new Error('조직 ID가 제공되지 않았습니다.');
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
      setError(err.message || '데이터 로드 중 오류가 발생했습니다.');
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
      setInviteError('사용자명을 입력해주세요.');
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
      setEditError('조직 정보를 불러올 수 없습니다.');
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
      setEditError('조직 수정 다이얼로그를 열 수 없습니다.');
    }
  };

  const handleEditSubmit = async () => {
    if (!editData.name.trim()) {
      setEditError('조직 이름을 입력해주세요.');
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

  // 프로젝트 생성 관련 함수들
  const handleCreateProject = () => {
    setProjectData({ code: '', name: '', description: '' });
    setProjectError('');
    setProjectDialogOpen(true);
  };

  const handleProjectSubmit = async () => {
    if (!projectData.code.trim()) {
      setProjectError('프로젝트 코드를 입력해주세요.');
      return;
    }
    
    if (!projectData.name.trim()) {
      setProjectError('프로젝트 이름을 입력해주세요.');
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
          조직 목록으로
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!organization) {
    return (
      <Alert severity="warning">
        조직을 찾을 수 없습니다.
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
            조직 수정
          </Button>
        )}
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ProjectIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{projects.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    프로젝트
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{members.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    멤버
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
          <Tab label="멤버" />
          <Tab label="프로젝트" />
        </Tabs>
      </Box>

      {/* 멤버 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">조직 멤버</Typography>
          {canManageOrganization() && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleInviteMember}
            >
              멤버 초대
            </Button>
          )}
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>사용자</TableCell>
                <TableCell>역할</TableCell>
                <TableCell>가입일</TableCell>
                <TableCell align="right">작업</TableCell>
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
                      label={getRoleDisplayName(member.roleInOrganization)}
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
          <Typography variant="h6">조직 프로젝트</Typography>
          {canManageOrganization() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
            >
              프로젝트 생성
            </Button>
          )}
        </Box>
        
        {projects.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary" gutterBottom>
              이 조직에는 아직 프로젝트가 없습니다.
            </Typography>
            {canManageOrganization() && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                sx={{ mt: 2 }}
              >
                첫 번째 프로젝트 생성
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} key={project.id}>
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
                      {project.description || '설명 없음'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      조직: {organization.name}
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
        <MenuItem onClick={handleRemoveMember} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          멤버 제거
        </MenuItem>
      </Menu>

      {/* 멤버 초대 다이얼로그 */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>멤버 초대</DialogTitle>
        <DialogContent>
          {inviteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {inviteError}
            </Alert>
          )}
          <TextField
            autoFocus
            label="사용자명"
            fullWidth
            variant="outlined"
            value={inviteData.username}
            onChange={(e) => setInviteData(prev => ({ ...prev, username: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>역할</InputLabel>
            <Select
              value={inviteData.role}
              onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
              label="역할"
            >
              <MenuItem value="MEMBER">멤버</MenuItem>
              <MenuItem value="ADMIN">관리자</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)} disabled={submitting}>
            취소
          </Button>
          <Button
            onClick={handleInviteSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : '초대'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 프로젝트 생성 다이얼로그 */}
      <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>조직별 프로젝트 생성</DialogTitle>
        <DialogContent>
          {projectError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {projectError}
            </Alert>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            이 프로젝트는 <strong>{organization?.name}</strong> 조직에 속하게 됩니다.
          </Alert>
          <TextField
            autoFocus
            label="프로젝트 코드"
            fullWidth
            variant="outlined"
            value={projectData.code}
            onChange={(e) => setProjectData(prev => ({ ...prev, code: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            required
            placeholder="예: WEB_APP_TEST"
            helperText="영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능"
          />
          <TextField
            label="프로젝트 이름"
            fullWidth
            variant="outlined"
            value={projectData.name}
            onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
            required
            placeholder="예: 웹 애플리케이션 테스트"
          />
          <TextField
            label="프로젝트 설명"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={projectData.description}
            onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDialogOpen(false)} disabled={submitting}>
            취소
          </Button>
          <Button
            onClick={handleProjectSubmit}
            variant="contained"
            disabled={submitting || !projectData.code.trim() || !projectData.name.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 조직 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>조직 정보 수정</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <TextField
            autoFocus
            label="조직 이름"
            fullWidth
            variant="outlined"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            required
            placeholder="조직의 이름을 입력하세요"
          />
          <TextField
            label="조직 설명"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="조직에 대한 간단한 설명을 입력하세요 (선택사항)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={submitting}>
            취소
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={submitting || !editData.name.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : '수정'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationDetail;