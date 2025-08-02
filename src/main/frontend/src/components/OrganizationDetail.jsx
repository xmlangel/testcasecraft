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
  Group as GroupIcon,
  Business as BusinessIcon,
  Assignment as ProjectIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { OrganizationService } from '../services/organizationService';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`org-tabpanel-${index}`}
    aria-labelledby={`org-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const OrganizationDetail = ({ organizationId }) => {
  const navigate = useNavigate();
  const { api } = useAppContext();
  
  // props에서 받은 organizationId를 사용, fallback으로 useParams 사용
  const { id: paramId } = useParams();
  const id = organizationId || paramId;
  
  console.log('[OrganizationDetail] 컴포넌트 렌더링 시작');
  console.log('[OrganizationDetail] organizationId (props):', organizationId);
  console.log('[OrganizationDetail] paramId (useParams):', paramId);
  console.log('[OrganizationDetail] 최종 사용할 id:', id);
  
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
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
  const [projectData, setProjectData] = useState({ name: '', description: '' });
  const [projectError, setProjectError] = useState('');

  const organizationService = new OrganizationService(api);

  useEffect(() => {
    console.log('[OrganizationDetail] useEffect 실행, id:', id);
    if (id) {
      console.log('[OrganizationDetail] ID가 존재하므로 데이터 로드 시작');
      loadOrganizationData();
    } else {
      console.log('[OrganizationDetail] ID가 없어서 데이터 로드 건너뜀');
    }
  }, [id]);  // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrganizationData = async () => {
    try {
      console.log('[OrganizationDetail] 조직 데이터 로드 시작, ID:', id);
      setLoading(true);
      setError('');
      
      if (!id) {
        throw new Error('조직 ID가 제공되지 않았습니다.');
      }

      console.log('[OrganizationDetail] Step 1: 조직 정보 조회 시작');
      const orgData = await organizationService.getOrganization(id);
      console.log('[OrganizationDetail] Step 1 완료:', orgData);

      console.log('[OrganizationDetail] Step 2: 조직 멤버 조회 시작');
      const membersData = await organizationService.getOrganizationMembers(id);
      console.log('[OrganizationDetail] Step 2 완료:', membersData);

      console.log('[OrganizationDetail] Step 3: 조직 그룹 조회 시작');
      const groupsData = await organizationService.getOrganizationGroups(id);
      console.log('[OrganizationDetail] Step 3 완료:', groupsData);

      // 조직 데이터에 이미 프로젝트가 포함되어 있으므로 별도 API 호출 불필요
      const projectsData = orgData.projects || [];

      console.log('[OrganizationDetail] 조직 상세 데이터 로드 완료:', {
        organizationId: id,
        organization: orgData,
        members: membersData,
        projects: projectsData,
        groups: groupsData
      });

      setOrganization(orgData);
      setMembers(membersData);
      setProjects(projectsData);
      setGroups(groupsData);
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
      await organizationService.removeMember(id, selectedMember.id);
      await loadOrganizationData();
      handleMemberMenuClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 프로젝트 생성 관련 함수들
  const handleCreateProject = () => {
    setProjectData({ name: '', description: '' });
    setProjectError('');
    setProjectDialogOpen(true);
  };

  const handleProjectSubmit = async () => {
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
      setProjectError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'OWNER': return '소유자';
      case 'ADMIN': return '관리자';
      case 'MEMBER': return '멤버';
      default: return role;
    }
  };

  const getRoleChipColor = (role) => {
    switch (role) {
      case 'OWNER': return 'error';
      case 'ADMIN': return 'warning';
      case 'MEMBER': return 'default';
      default: return 'default';
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
        <Button variant="outlined" startIcon={<EditIcon />}>
          조직 수정
        </Button>
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
                <GroupIcon color="primary" sx={{ mr: 2 }} />
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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{groups.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    그룹
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
          <Tab label="그룹" />
        </Tabs>
      </Box>

      {/* 멤버 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">조직 멤버</Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleInviteMember}
          >
            멤버 초대
          </Button>
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
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMemberMenuOpen(e, member)}
                    >
                      <MoreVertIcon />
                    </IconButton>
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
          >
            프로젝트 생성
          </Button>
        </Box>
        
        {projects.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary" gutterBottom>
              이 조직에는 아직 프로젝트가 없습니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
              sx={{ mt: 2 }}
            >
              첫 번째 프로젝트 생성
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} key={project.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
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

      {/* 그룹 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" mb={2}>조직 그룹</Typography>
        {groups.length === 0 ? (
          <Typography color="text.secondary">
            이 조직에는 아직 그룹이 없습니다.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {groups.map((group) => (
              <Grid item xs={12} md={6} key={group.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {group.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {group.description}
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
            label="프로젝트 이름"
            fullWidth
            variant="outlined"
            value={projectData.name}
            onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
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
            disabled={submitting || !projectData.name.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : '생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationDetail;