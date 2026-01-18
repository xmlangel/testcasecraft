// src/components/ProjectManager.jsx
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
  Collapse,
  Avatar,
  AvatarGroup,
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
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
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

const ProjectManager = ({ onSelectProject }) => {
  const { api, projects, projectsLoading, addProject, updateProject, deleteProject, fetchProjects, user } = useAppContext();
  const { t } = useI18n();

  const [tabValue, setTabValue] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 프로젝트 메뉴
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
  const [transferProject, setTransferProject] = useState(null); // 이전할 프로젝트 별도 저장

  // 삭제 확인 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [forceDelete, setForceDelete] = useState(false);

  // JUnit 요약 통계 (ICT-211)
  const [junitSummaries, setJunitSummaries] = useState({});

  // 프로젝트 멤버 정보
  const [projectMembers, setProjectMembers] = useState({});
  const [loadingMembers, setLoadingMembers] = useState({});

  const organizationService = new OrganizationService(api);

  // 권한 확인 함수
  const hasProjectCreationAccess = (user) => {
    // 모든 인증된 사용자는 독립 프로젝트를 생성할 수 있음
    return user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'TESTER' || user?.role === 'USER';
  };

  useEffect(() => {
    loadData();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // 프로젝트 멤버 로드 (조직 프로젝트는 조직 멤버를 가져옴)
  const loadProjectMembers = async (projectId) => {
    if (loadingMembers[projectId] || projectMembers[projectId]) {
      return; // 이미 로드 중이거나 로드된 경우 스킵
    }

    try {
      setLoadingMembers(prev => ({ ...prev, [projectId]: true }));
      const baseUrl = (await api.getApiBaseUrl) ? await api.getApiBaseUrl() : 'http://localhost:8080';

      // 해당 프로젝트 정보 가져오기
      const project = projects.find(p => p.id === projectId);

      let response;
      if (project?.organization?.id) {
        // 조직 프로젝트인 경우: 조직 멤버 API 호출
        response = await api(`${baseUrl}/api/organizations/${project.organization.id}/members`);
      } else {
        // 독립 프로젝트인 경우: 프로젝트 멤버 API 호출
        response = await api(`${baseUrl}/api/projects/${projectId}/members`);
      }

      if (!response.ok) {
        throw new Error('멤버 목록 조회 실패');
      }

      const members = await response.json();
      setProjectMembers(prev => ({ ...prev, [projectId]: members }));
    } catch (err) {
      console.error('프로젝트 멤버 로드 오류:', err);
      setProjectMembers(prev => ({ ...prev, [projectId]: [] }));
    } finally {
      setLoadingMembers(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // ICT-288 수정: 조직 API 실패 시에도 프로젝트 데이터 활용
      let orgsData = [];
      try {
        orgsData = await organizationService.getOrganizations();
      } catch (orgErr) {
        console.warn('ICT-288: 조직 목록 API 접근 실패, 프로젝트 데이터에서 조직 정보 추출:', orgErr.message);
        // 조직 API 실패 시 빈 배열로 초기화 (프로젝트 데이터에서 조직 정보 추출할 예정)
      }

      // 이미 로딩 중이거나 데이터가 있고 로딩 상태가 false인 경우 불필요한 호출 방지
      // 하지만 명시적 refresh 요청 등을 고려하여 호출할 수도 있음.
      // 여기서는 Context가 이미 로딩 중이면 기다리거나, 아니면 호출
      if (!projectsLoading) {
        await fetchProjects();
      }

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
    // anchorPosition 방식으로 변경하여 anchorEl 오류 방지
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchorEl({
      top: rect.bottom,
      left: rect.right,
    });
    setSelectedProject(project);
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    // 메뉴를 닫기 시작
    setMenuOpen(false);
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

    // 이전할 프로젝트를 별도 state에 저장 (메뉴 닫힘으로 인한 selectedProject 초기화 방지)
    setTransferProject(selectedProject);
    // 현재 조직은 옵션에서 제외되므로 빈 문자열로 초기화
    setTransferTargetOrg('');
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
      setFormError(t('project.form.nameRequired', '프로젝트 이름을 입력해주세요.'));
      return;
    }
    if (!formData.code.trim()) {
      setFormError(t('project.form.codeRequired', '프로젝트 코드를 입력해주세요.'));
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

    if (!transferProject) {
      return;
    }

    try {
      setSubmitting(true);

      // 프로젝트 이전을 위한 데이터 준비 (DTO 형태로 정확히 전달)
      const transferData = {
        id: transferProject.id,
        code: transferProject.code,
        name: transferProject.name,
        description: transferProject.description,
        organizationId: transferTargetOrg || null // 조직 이전: organizationId 변경
      };


      await updateProject(transferData);
      await loadData();
      setTransferDialogOpen(false);
      setTransferTargetOrg('');
      setTransferProject(null);

    } catch (err) {
      console.error('❌ 조직이전 실패:', err);
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
      // organizationId가 있는 경우 해당 ID로 비교
      // organization 객체 존재 여부와 상관없이 ID로만 판단하여 데이터 일관성 확보
      if (orgId) {
        return project.organizationId === orgId;
      } else {
        // 독립 프로젝트: organizationId가 없는 경우 (null, undefined, 빈 문자열)
        return !project.organizationId;
      }
    });

    return realProjects;
  };

  const getOrganizationProjects = () => {
    const orgProjects = {};

    // ICT-288 수정: 조직 API 실패 시 프로젝트 데이터에서 조직 정보 추출
    const availableOrganizations = organizations.length > 0 ? organizations : extractOrganizationsFromProjects();

    availableOrganizations.forEach(org => {
      orgProjects[org.id] = getProjectsByOrganization(org.id);
    });
    return orgProjects;
  };

  // ICT-288 추가: 조직 목록을 매개변수로 받는 버전
  const getOrganizationProjectsWithOrgs = (orgs) => {
    const orgProjects = {};
    orgs.forEach(org => {
      orgProjects[org.id] = getProjectsByOrganization(org.id);
    });
    return orgProjects;
  };

  // ICT-288 추가: 프로젝트 데이터에서 조직 정보 추출
  const extractOrganizationsFromProjects = () => {
    const orgMap = new Map();

    projects.forEach(project => {
      if (project.organization) {
        orgMap.set(project.organization.id, {
          id: project.organization.id,
          name: project.organization.name,
          description: project.organization.description || ''
        });
      }
    });

    return Array.from(orgMap.values());
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

  const ProjectCard = ({ project }) => {
    const [showMembers, setShowMembers] = useState(false);
    const members = projectMembers[project.id] || [];
    const isLoadingMembers = loadingMembers[project.id];

    useEffect(() => {
      // 조직 프로젝트인 경우에만 자동으로 멤버 로드
      if (project.organization && !projectMembers[project.id] && !isLoadingMembers) {
        loadProjectMembers(project.id);
      }
    }, [project.id, project.organization]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggleMembers = () => {
      if (!projectMembers[project.id] && !isLoadingMembers) {
        loadProjectMembers(project.id);
      }
      setShowMembers(!showMembers);
    };

    // 사용자 이름의 첫 글자를 가져오는 함수
    const getInitials = (name) => {
      if (!name) return '?';
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    return (
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
                {t('project.types.independent', '독립 프로젝트')}
              </Typography>
            </Box>
          )}

          {project.description && (
            <Typography variant="body2" color="text.secondary" sx={{
              marginBottom: "16px"
            }}>
              {project.description}
            </Typography>
          )}

          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Tooltip title={t('project.tooltips.testCaseCount', '테스트케이스 수')}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <ListAltIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {project.testCaseCount || 0}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title={t('project.tooltips.memberCount', '멤버 수')}>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ cursor: project.organization ? 'pointer' : 'default' }}
                onClick={project.organization ? handleToggleMembers : undefined}
              >
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {project.memberCount || 0}
                </Typography>
                {project.organization && (
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      transform: showMembers ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s'
                    }}
                  />
                )}
              </Box>
            </Tooltip>
            {/* ICT-211: 자동화 테스트 현황 표시 */}
            <Tooltip title={t('project.tooltips.automationTestCount', '자동화 테스트 결과 수')}>
              {renderJunitStatus(project)}
            </Tooltip>
          </Box>

          {/* 멤버 목록 표시 (조직 프로젝트만) */}
          {project.organization && (
            <Collapse in={showMembers}>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('project.members.title', '프로젝트 멤버')}
                </Typography>
                {isLoadingMembers ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={20} />
                  </Box>
                ) : members.length > 0 ? (
                  <Box display="flex" flexDirection="column" gap={1} mt={1}>
                    {members.slice(0, 5).map((member) => {
                      // OrganizationUser와 ProjectUser 모두 처리
                      const role = member.roleInOrganization || member.roleInProject || member.role || 'MEMBER';
                      return (
                        <Box key={member.id} display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {getInitials(member.user?.username || member.username)}
                          </Avatar>
                          <Typography variant="body2">
                            {member.user?.username || member.username}
                          </Typography>
                          <Chip
                            size="small"
                            label={role}
                            sx={{ ml: 'auto', fontSize: '0.7rem', height: 20 }}
                          />
                        </Box>
                      );
                    })}
                    {members.length > 5 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        {t('project.members.more', '외 {count}명', { count: members.length - 5 })}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('project.members.noMembers', '멤버가 없습니다')}
                  </Typography>
                )}
              </Box>
            </Collapse>
          )}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            variant="contained"
            fullWidth
            startIcon={<LaunchIcon />}
            onClick={() => onSelectProject(project.id)}
          >
            {t('project.buttons.openProject', '프로젝트 열기')}
          </Button>
        </CardActions>
      </Card>
    );
  };

  // 글로벌 로딩 상태와 로컬 로딩 상태 통합
  const isGlobalLoading = projectsLoading || loading;

  // Rendered more hooks error fix: Move conditional return after hooks

  // ICT-288 수정: 조직 정보 추출을 여기서 수행
  const availableOrganizations = organizations.length > 0 ? organizations : extractOrganizationsFromProjects();
  const organizationProjects = getOrganizationProjectsWithOrgs(availableOrganizations);
  const independentProjects = getIndependentProjects();

  // 조직별 프로젝트가 있는지 확인
  const hasOrganizationProjects = Object.values(organizationProjects).some(projects => projects.length > 0);

  // 탭 표시 여부 결정
  const showOrgTab = hasOrganizationProjects;
  const showIndependentTab = independentProjects.length > 0;
  const showAllTab = projects.length > 0;

  // 표시할 탭 목록 생성 (순서 유지)
  const tabs = [];
  let tabIndexMap = {}; // 원래 인덱스 → 표시 인덱스 매핑
  let displayIndex = 0;

  if (showOrgTab) {
    tabs.push({ label: t('project.tabs.byOrganization', '조직별 프로젝트'), originalIndex: 0 });
    tabIndexMap[0] = displayIndex++;
  }
  if (showIndependentTab) {
    tabs.push({ label: t('project.tabs.independent', '독립 프로젝트'), originalIndex: 1 });
    tabIndexMap[1] = displayIndex++;
  }
  if (showAllTab) {
    tabs.push({ label: t('project.tabs.all', '전체 프로젝트'), originalIndex: 2 });
    tabIndexMap[2] = displayIndex++;
  }

  // 현재 선택된 탭이 표시되지 않는 경우, 첫 번째 표시 탭으로 자동 전환
  const currentTabVisible = Object.keys(tabIndexMap).map(Number).includes(tabValue);
  const activeTabValue = currentTabVisible ? tabIndexMap[tabValue] : 0;

  // 탭 가시성 변경 시 유효한 탭으로 자동 전환
  useEffect(() => {
    if (!loading && !projectsLoading && tabs.length > 0) {
      const isCurrentValid = tabs.some(tab => tab.originalIndex === tabValue);
      if (!isCurrentValid) {
        setTabValue(tabs[0].originalIndex);
      }
    }
  }, [loading, projectsLoading, showOrgTab, showIndependentTab, showAllTab, tabValue]); // tabs는 매번 재생성되므로 의존성에서 제외하고 flags 사용

  if (isGlobalLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('project.title', '프로젝트 관리')}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {hasProjectCreationAccess(user) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleNewProject()}
            >
              {t('project.buttons.createNew', '새 프로젝트 생성')}
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 탭 - 조건부 렌더링 */}
      {tabs.length > 0 ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTabValue}
              onChange={(event, newValue) => {
                // 표시 인덱스 → 원래 인덱스로 역변환
                const originalIndex = tabs[newValue].originalIndex;
                handleTabChange(event, originalIndex);
              }}
            >
              {tabs.map((tab, index) => (
                <Tab key={tab.originalIndex} label={tab.label} />
              ))}
            </Tabs>
          </Box>
        </>
      ) : (
        <Box textAlign="center" py={8}>
          <GroupIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('project.messages.noParticipatingProjects', '참여 중인 프로젝트가 없습니다')}
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={2}>
            {t('project.messages.needInvitation', '프로젝트가 없는 사용자는 프로젝트에 초대가 되어야 이용이 가능합니다.')}
          </Typography>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium', mb: 3 }}>
            {t('project.messages.requestInvitation', '시스템관리자에게 프로젝트 초대를 요청하세요.')}
          </Typography>
          {hasProjectCreationAccess(user) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleNewProject()}
            >
              {t('project.buttons.createProject', '프로젝트 생성')}
            </Button>
          )}
        </Box>
      )}

      {/* 조직별 프로젝트 탭 - 조건부 렌더링 */}
      {showOrgTab && (
        <TabPanel value={tabValue} index={0}>
          {(() => {
            // ICT-288 수정: 로딩 중일 때는 로딩 상태 표시
            if (isGlobalLoading) {
              return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              );
            }

            // ICT-288 수정: 외부에서 계산된 availableOrganizations 사용 (중복 계산 방지)

            // 조직별 프로젝트가 있는 조직들만 필터링
            const orgsWithProjects = availableOrganizations.filter(org =>
              organizationProjects[org.id]?.length > 0
            );

            // ICT-288 수정: 조건 로직 개선 - 실제 조직별 프로젝트 존재 여부로 판단
            const hasOrganizationalProjects = projects.some(project => project.organization);
            const hasOrgsWithProjects = orgsWithProjects.length > 0;

            // 데이터가 모두 로딩되었지만 조직별 프로젝트가 없는 경우에만 메시지 표시
            if (!isGlobalLoading && (!hasOrganizationalProjects || !hasOrgsWithProjects)) {
              return (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('project.messages.noOrganizationProjects', '조직별 프로젝트가 없습니다')}
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    {t('project.messages.addOrganizationProjectsHint', '조직에 프로젝트를 추가하거나 새 조직 프로젝트를 생성해보세요.')}
                  </Typography>
                </Box>
              );
            }

            return availableOrganizations.map((org) => (
              <Box key={org.id} mb={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <BusinessIcon color="primary" />
                    <Typography variant="h5">{org.name}</Typography>
                    <Chip
                      size="small"
                      label={t('project.stats.projectCount', '{count}개 프로젝트', { count: organizationProjects[org.id]?.length || 0 })}
                      variant="outlined"
                    />
                  </Box>
                  {hasProjectCreationAccess(user) && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleNewProject(org.id)}
                    >
                      {t('project.buttons.addProject', '프로젝트 추가')}
                    </Button>
                  )}
                </Box>

                {organizationProjects[org.id]?.length === 0 ? (
                  <Box textAlign="center" py={4} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary">
                      {t('project.messages.noProjectsInOrganization', '이 조직에는 아직 프로젝트가 없습니다.')}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {organizationProjects[org.id]?.map((project) => (
                      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                        <ProjectCard project={project} />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {org.id !== organizations[organizations.length - 1].id && <Divider sx={{ mt: 4 }} />}
              </Box>
            ));
          })()}
        </TabPanel>
      )}

      {/* 독립 프로젝트 탭 - 조건부 렌더링 */}
      {showIndependentTab && (
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <PublicIcon color="primary" />
              <Typography variant="h5">{t('project.tabs.independent', '독립 프로젝트')}</Typography>
              <Chip
                size="small"
                label={t('project.stats.projectCount', '{count}개 프로젝트', { count: independentProjects.length })}
                variant="outlined"
              />
            </Box>
            {hasProjectCreationAccess(user) && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleNewProject()}
              >
                {t('project.buttons.createIndependent', '독립 프로젝트 생성')}
              </Button>
            )}
          </Box>

          {independentProjects.length === 0 ? (
            <Box textAlign="center" py={8}>
              <PublicIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('project.messages.noIndependentProjects', '독립 프로젝트가 없습니다')}
              </Typography>
              <Typography variant="body2" color="text.disabled" mb={3}>
                {t('project.messages.createIndependentProjectHint', '조직에 속하지 않는 개인 프로젝트를 생성해보세요.')}
              </Typography>
              {hasProjectCreationAccess(user) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleNewProject()}
                >
                  {t('project.buttons.createFirstIndependent', '첫 번째 독립 프로젝트 생성')}
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {independentProjects.map((project) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <ProjectCard project={project} />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      )}

      {/* 전체 프로젝트 탭 - 조건부 렌더링 */}
      {showAllTab && (
        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">{t('project.tabs.all', '전체 프로젝트')}</Typography>
            <Chip
              size="small"
              label={t('project.stats.totalProjectCount', '총 {count}개 프로젝트', { count: projects.length })}
              variant="outlined"
            />
          </Box>

          {projects.length === 0 ? (
            <Box textAlign="center" py={8}>
              <GroupIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('project.messages.noParticipatingProjects', '참여 중인 프로젝트가 없습니다')}
              </Typography>
              <Typography variant="body2" color="text.disabled" mb={2}>
                {t('project.messages.needInvitation', '프로젝트가 없는 사용자는 프로젝트에 초대가 되어야 이용이 가능합니다.')}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium', mb: 3 }}>
                {t('project.messages.requestInvitation', '시스템관리자에게 프로젝트 초대를 요청하세요.')}
              </Typography>
              {hasProjectCreationAccess(user) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleNewProject()}
                >
                  {t('project.buttons.createProject', '프로젝트 생성')}
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <ProjectCard project={project} />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      )}

      {/* 프로젝트 메뉴 - anchorPosition 방식으로 렌더링 */}
      {anchorEl && selectedProject && (
        <Menu
          open={menuOpen}
          onClose={handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={anchorEl}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              elevation: 3,
            }
          }}
          TransitionProps={{
            onExited: () => {
              // 메뉴 닫힘 애니메이션이 완료된 후에만 상태 정리
              setAnchorEl(null);
              setSelectedProject(null);
            }
          }}
        >
          <MenuItem onClick={handleEditProject}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            {t('common.buttons.edit', '수정')}
          </MenuItem>
          <MenuItem onClick={handleTransferProject}>
            <TransferIcon fontSize="small" sx={{ mr: 1 }} />
            {t('project.menu.transfer', '조직 이전')}
          </MenuItem>
          <MenuItem onClick={() => handleDeleteClick(false)} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            {t('common.buttons.delete', '삭제')}
          </MenuItem>
          <MenuItem onClick={() => handleDeleteClick(true)} sx={{ color: 'error.dark' }}>
            <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }} />
            {t('project.menu.forceDelete', '강제 삭제')}
          </MenuItem>
        </Menu>
      )}

      {/* 프로젝트 생성/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth disableRestoreFocus>
        <DialogTitle>
          {editingProject ? t('project.dialog.editTitle', '프로젝트 수정') : t('project.dialog.createTitle', '새 프로젝트 생성')}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                autoFocus
                label={t('project.form.name', '프로젝트 이름')}
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('project.form.code', '프로젝트 코드')}
                fullWidth
                variant="outlined"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value)}
                required
                placeholder={t('project.form.codePlaceholder', '예: PROJ001')}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>{t('project.form.organization', '소속 조직')}</InputLabel>
                <Select
                  value={formData.organizationId}
                  onChange={(e) => handleFormChange('organizationId', e.target.value)}
                  label={t('project.form.organization', '소속 조직')}
                >
                  <MenuItem value="">
                    <em>{t('project.form.noOrganization', '독립 프로젝트 (조직 없음)')}</em>
                  </MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t('project.form.description', '설명')}
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder={t('project.form.descriptionPlaceholder', '프로젝트에 대한 설명을 입력하세요...')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={submitting}>
            {t('common.buttons.cancel', '취소')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : (editingProject ? t('common.buttons.update', '수정') : t('common.buttons.create', '생성'))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 프로젝트 이전 다이얼로그 */}
      <Dialog open={transferDialogOpen} onClose={() => { setTransferDialogOpen(false); setTransferProject(null); }} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle>{t('project.dialog.transferTitle', '프로젝트 조직 이전')}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            '
            <Box component="span" sx={{ fontWeight: 'bold' }}>
              {transferProject?.name}
            </Box>
            ' 프로젝트를 다른 조직으로 이전하거나 독립 프로젝트로 만들 수 있습니다.
          </Typography>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel>{t('project.form.targetOrganization', '대상 조직')}</InputLabel>
            <Select
              value={transferTargetOrg}
              onChange={(e) => setTransferTargetOrg(e.target.value)}
              label={t('project.form.targetOrganization', '대상 조직')}
            >
              <MenuItem value="">
                <em>{t('project.form.convertToIndependent', '독립 프로젝트로 전환')}</em>
              </MenuItem>
              {organizations
                .filter(org => org.id !== transferProject?.organization?.id)
                .map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setTransferDialogOpen(false); setTransferProject(null); }} disabled={submitting}>
            {t('common.buttons.cancel', '취소')}
          </Button>
          <Button
            onClick={handleTransferSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : t('project.buttons.transfer', '이전')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} disableRestoreFocus>
        <DialogTitle>
          {forceDelete ? t('project.dialog.forceDeleteTitle', '프로젝트 강제 삭제 확인') : t('project.dialog.deleteTitle', '프로젝트 삭제 확인')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {forceDelete ? (
              <>
                '
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {deletingProject?.name}
                </Box>
                ' 프로젝트를 정말 강제 삭제하시겠습니까?
              </>
            ) : (
              <>
                '
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {deletingProject?.name}
                </Box>
                ' 프로젝트를 정말 삭제하시겠습니까?
              </>
            )}
          </Typography>
          {forceDelete ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                {t('project.dialog.forceDeleteWarningTitle', '⚠️ 삭제')}
              </Typography>
              <Typography variant="body2">
                {t('project.dialog.forceDeleteWarningMessage', '연결된 모든 테스트 플랜, 테스트 케이스, 실행 이력이 함께 삭제됩니다! 이 작업은 되돌릴 수 없습니다.')}
              </Typography>
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('project.dialog.deleteWarningMessage1', '이 작업은 되돌릴 수 없습니다.')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('project.dialog.deleteWarningMessage2', '프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.')}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            {t('common.buttons.cancel', '취소')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : (forceDelete ? t('project.buttons.forceDelete', '강제 삭제') : t('common.buttons.delete', '삭제'))}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ProjectManager;