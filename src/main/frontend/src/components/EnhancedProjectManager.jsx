// src/components/EnhancedProjectManager.jsx
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
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  SwapHoriz as TransferIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Launch as LaunchIcon,
  ListAlt as ListAltIcon,
  SmartToy as JunitIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { OrganizationService } from '../services/organizationService';
import junitResultService from '../services/junitResultService.js';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`project-tabpanel-${index}`}
    aria-labelledby={`project-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const EnhancedProjectManager = ({ onSelectProject }) => {
  const { api, projects, addProject, updateProject, deleteProject, fetchProjects } = useAppContext();
  
  const [tabValue, setTabValue] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 프로젝트 메뉴
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // 프로젝트 생성/수정 다이얼로그
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    organizationId: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 프로젝트 이전 다이얼로그
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTargetOrg, setTransferTargetOrg] = useState('');

  // 삭제 확인 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [forceDelete, setForceDelete] = useState(false);

  // JUnit 요약 통계 (ICT-211)
  const [junitSummaries, setJunitSummaries] = useState({});

  const organizationService = new OrganizationService(api);

  useEffect(() => {
    loadData();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [orgsData] = await Promise.all([
        organizationService.getOrganizations(),
        fetchProjects(),
      ]);
      
      setOrganizations(orgsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // JUnit 통계 로드 (ICT-211)
  useEffect(() => {
    const loadJunitSummaries = async () => {
      if (projects.length === 0) return;
      
      try {
        const projectIds = projects.map(p => p.id);
        const batchResult = await junitResultService.getBatchProjectJunitSummary(projectIds);
        
        if (batchResult.success) {
          setJunitSummaries(batchResult.summaries);
        } else {
          console.warn('JUnit 요약 통계 로드 실패, 기본값 사용');
          setJunitSummaries(batchResult.summaries || {});
        }
      } catch (err) {
        console.error('JUnit 요약 통계 로드 오류:', err);
        // 오류 발생 시 빈 객체로 설정
        setJunitSummaries({});
      }
    };

    loadJunitSummaries();
  }, [projects]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleNewProject = (organizationId = '') => {
    setEditingProject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      organizationId
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleEditProject = () => {
    setEditingProject(selectedProject);
    setFormData({
      name: selectedProject.name,
      code: selectedProject.code,
      description: selectedProject.description || '',
      organizationId: selectedProject.organization?.id || ''
    });
    setFormError('');
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleTransferProject = () => {
    setTransferTargetOrg(selectedProject.organization?.id || '');
    setTransferDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = (force = false) => {
    setDeletingProject(selectedProject);
    setForceDelete(force);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setFormData({ name: '', code: '', description: '', organizationId: '' });
    setFormError('');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setFormError('프로젝트 이름을 입력해주세요.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('프로젝트 코드를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const projectData = {
        ...formData,
        organizationId: formData.organizationId || null
      };

      if (editingProject) {
        await updateProject({ ...editingProject, ...projectData });
      } else {
        await addProject(projectData);
      }

      await loadData();
      handleDialogClose();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (!selectedProject) return;

    try {
      setSubmitting(true);
      
      // 프로젝트 이전 API 호출 (실제 구현에서는 별도 엔드포인트 필요)
      const transferData = {
        ...selectedProject,
        organizationId: transferTargetOrg || null
      };
      
      await updateProject(transferData);
      await loadData();
      setTransferDialogOpen(false);
      setTransferTargetOrg('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    try {
      setSubmitting(true);
      await deleteProject(deletingProject.id, forceDelete);
      await loadData();
      setDeleteDialogOpen(false);
      setDeletingProject(null);
      setForceDelete(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectsByOrganization = (orgId) => {
    // 실제 프로젝트 데이터만 사용 (더미 데이터 의존성 제거)
    const realProjects = projects.filter(project => {
      if (orgId) {
        // 조직별 프로젝트: organization 객체가 있고 ID가 일치하는 경우
        return project.organization?.id === orgId;
      } else {
        // 독립 프로젝트: organization 객체가 없거나 organizationId가 없는 경우
        return !project.organization && !project.organizationId;
      }
    });
    
    return realProjects;
  };

  const getOrganizationProjects = () => {
    const orgProjects = {};
    organizations.forEach(org => {
      orgProjects[org.id] = getProjectsByOrganization(org.id);
    });
    return orgProjects;
  };

  const getIndependentProjects = () => {
    return getProjectsByOrganization(null);
  };

  // JUnit 현황 렌더링 함수 (ICT-211)
  const renderJunitStatus = (project) => {
    const summary = junitSummaries[project.id];
    const count = summary?.hasResults ? summary.totalResults : 0;

    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        <JunitIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {count}
        </Typography>
      </Box>
    );
  };

  const ProjectCard = ({ project }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              {project.name}
            </Typography>
            <Chip
              size="small"
              label={project.code}
              variant="outlined"
              sx={{ mb: 1 }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, project)}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {project.organization ? (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <BusinessIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {project.organization.name}
            </Typography>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <PublicIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              독립 프로젝트
            </Typography>
          </Box>
        )}

        {project.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {project.description}
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Tooltip title="테스트케이스 수">
            <Box display="flex" alignItems="center" gap={0.5}>
              <ListAltIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {project.testCaseCount || 0}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="멤버 수">
            <Box display="flex" alignItems="center" gap={0.5}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {project.memberCount || 0}
              </Typography>
            </Box>
          </Tooltip>
          {/* ICT-211: 자동화 테스트 현황 표시 */}
          <Tooltip title="자동화 테스트 결과 수">
            {renderJunitStatus(project)}
          </Tooltip>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant="contained"
          fullWidth
          startIcon={<LaunchIcon />}
          onClick={() => onSelectProject(project.id)}
        >
          프로젝트 열기
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  const organizationProjects = getOrganizationProjects();
  const independentProjects = getIndependentProjects();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          프로젝트 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleNewProject()}
        >
          새 프로젝트 생성
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 탭 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="조직별 프로젝트" />
          <Tab label="독립 프로젝트" />
          <Tab label="전체 프로젝트" />
        </Tabs>
      </Box>

      {/* 조직별 프로젝트 탭 */}
      <TabPanel value={tabValue} index={0}>
        {organizations.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              소속 조직이 없습니다
            </Typography>
            <Typography variant="body2" color="text.disabled">
              조직에 가입하거나 새 조직을 생성해보세요.
            </Typography>
          </Box>
        ) : (
          organizations.map((org) => (
            <Box key={org.id} mb={4}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <BusinessIcon color="primary" />
                  <Typography variant="h5">{org.name}</Typography>
                  <Chip
                    size="small"
                    label={`${organizationProjects[org.id]?.length || 0}개 프로젝트`}
                    variant="outlined"
                  />
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleNewProject(org.id)}
                >
                  프로젝트 추가
                </Button>
              </Box>

              {organizationProjects[org.id]?.length === 0 ? (
                <Box textAlign="center" py={4} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2" color="text.secondary">
                    이 조직에는 아직 프로젝트가 없습니다.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {organizationProjects[org.id]?.map((project) => (
                    <Grid item xs={12} md={6} lg={4} key={project.id}>
                      <ProjectCard project={project} />
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {org.id !== organizations[organizations.length - 1].id && <Divider sx={{ mt: 4 }} />}
            </Box>
          ))
        )}
      </TabPanel>

      {/* 독립 프로젝트 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <PublicIcon color="primary" />
            <Typography variant="h5">독립 프로젝트</Typography>
            <Chip
              size="small"
              label={`${independentProjects.length}개 프로젝트`}
              variant="outlined"
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleNewProject()}
          >
            독립 프로젝트 생성
          </Button>
        </Box>

        {independentProjects.length === 0 ? (
          <Box textAlign="center" py={8}>
            <PublicIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              독립 프로젝트가 없습니다
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>
              조직에 속하지 않는 개인 프로젝트를 생성해보세요.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleNewProject()}
            >
              첫 번째 독립 프로젝트 생성
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {independentProjects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* 전체 프로젝트 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">전체 프로젝트</Typography>
          <Chip
            size="small"
            label={`총 ${projects.length}개 프로젝트`}
            variant="outlined"
          />
        </Box>

        {projects.length === 0 ? (
          <Box textAlign="center" py={8}>
            <GroupIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              프로젝트가 없습니다
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>
              첫 번째 프로젝트를 생성해보세요.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleNewProject()}
            >
              프로젝트 생성
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* 프로젝트 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditProject}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          수정
        </MenuItem>
        <MenuItem onClick={handleTransferProject}>
          <TransferIcon fontSize="small" sx={{ mr: 1 }} />
          조직 이전
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(false)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          삭제
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(true)} sx={{ color: 'error.dark' }}>
          <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }} />
          강제 삭제
        </MenuItem>
      </Menu>

      {/* 프로젝트 생성/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProject ? '프로젝트 수정' : '새 프로젝트 생성'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                label="프로젝트 이름"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="프로젝트 코드"
                fullWidth
                variant="outlined"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value)}
                required
                placeholder="예: PROJ001"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>소속 조직</InputLabel>
                <Select
                  value={formData.organizationId}
                  onChange={(e) => handleFormChange('organizationId', e.target.value)}
                  label="소속 조직"
                >
                  <MenuItem value="">
                    <em>독립 프로젝트 (조직 없음)</em>
                  </MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="설명"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="프로젝트에 대한 설명을 입력하세요..."
              />
            </Grid>
          </Grid>
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
            {submitting ? <CircularProgress size={20} /> : (editingProject ? '수정' : '생성')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 프로젝트 이전 다이얼로그 */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>프로젝트 조직 이전</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            '<strong>{selectedProject?.name}</strong>' 프로젝트를 다른 조직으로 이전하거나 독립 프로젝트로 만들 수 있습니다.
          </Typography>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel>대상 조직</InputLabel>
            <Select
              value={transferTargetOrg}
              onChange={(e) => setTransferTargetOrg(e.target.value)}
              label="대상 조직"
            >
              <MenuItem value="">
                <em>독립 프로젝트로 전환</em>
              </MenuItem>
              {organizations
                .filter(org => org.id !== selectedProject?.organization?.id)
                .map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)} disabled={submitting}>
            취소
          </Button>
          <Button
            onClick={handleTransferSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : '이전'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {forceDelete ? '프로젝트 강제 삭제 확인' : '프로젝트 삭제 확인'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            '<strong>{deletingProject?.name}</strong>' 프로젝트를 정말 {forceDelete ? '강제 삭제' : '삭제'}하시겠습니까?
          </Typography>
          {forceDelete ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                ⚠️ 강제 삭제 경고
              </Typography>
              <Typography variant="body2">
                연결된 모든 테스트 플랜, 테스트 케이스, 실행 이력이 함께 삭제됩니다!
                이 작업은 되돌릴 수 없습니다.
              </Typography>
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              이 작업은 되돌릴 수 없습니다. 프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.
            </Typography>
          )}
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
            {submitting ? <CircularProgress size={20} /> : (forceDelete ? '강제 삭제' : '삭제')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedProjectManager;