// src/components/UserManagement/UserList.jsx
/**
 * 사용자 목록 컴포넌트
 * 
 * 시스템 관리자를 위한 종합적인 사용자 관리 인터페이스를 제공합니다.
 * 검색, 필터링, 정렬, 페이징 기능과 함께 사용자 상세 정보 조회,
 * 활성화/비활성화, 역할 변경 등의 관리 기능을 포함합니다.
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Toolbar,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminIcon,
  Work as WorkIcon,
  BugReport as BugReportIcon,
  AccountCircle as UserIcon,
  Visibility as ViewIcon,
  VerifiedUser as VerifiedIcon,
  Email as EmailIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import { useUserManagement } from '../../hooks/useUserManagement.js';
import { useAppContext } from '../../context/AppContext.jsx';
import UserDetailDialog from './UserDetailDialog.jsx';
import LoadingSpinner from '../atoms/LoadingSpinner/LoadingSpinner.jsx';
import ErrorMessage from '../atoms/ErrorMessage/ErrorMessage.jsx';
import { formatDateOnlySafe } from '../../utils/dateUtils';
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
 * 사용자 목록 컴포넌트
 */
const UserList = () => {
  const { t } = useI18n();
  const { api } = useAppContext();

  // 사용자 관리 훅
  const {
    users,
    pagination,
    statistics,
    loading,
    error,
    searchParams,
    hasUsers,
    hasNextPage,
    hasPrevPage,
    setKeyword,
    setRoleFilter,
    setActiveFilter,
    changePage,
    changePageSize,
    changeSort,
    selectUser,
    activateUser,
    deactivateUser,
    changeUserRole,
    exportUsers,
    refresh,
    resetSearch,
    getRoleColor,
    getRoleLabel,
    getStatusColor,
    getStatusLabel,
    USER_ROLES
  } = useUserManagement();

  // 로컬 상태
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuUser, setActionMenuUser] = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.keyword);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  /**
   * 인증 이메일 발송
   */
  const handleSendVerificationEmail = useCallback(async (userId) => {
    handleActionMenuClose();
    setSendingEmail(true);

    try {
      const response = await api(`/api/admin/users/${userId}/send-verification-email`, {
        method: 'POST'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSnackbar({
          open: true,
          message: t('userList.email.sent', '인증 이메일이 발송되었습니다.'),
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || t('userList.email.failed', '이메일 발송에 실패했습니다.'),
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to send verification email:', error);
      setSnackbar({
        open: true,
        message: t('userList.email.error', '이메일 발송 중 오류가 발생했습니다.'),
        severity: 'error'
      });
    } finally {
      setSendingEmail(false);
    }
  }, [api, t]);

  /**
   * 스낵바 닫기
   */
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar({ ...snackbar, open: false });
  }, [snackbar]);

  /**
   * 검색 실행
   */
  const handleSearch = useCallback(() => {
    setKeyword(searchInput);
  }, [searchInput, setKeyword]);

  /**
   * 검색 키 다운 이벤트
   */
  const handleSearchKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  /**
   * 사용자 상세 다이얼로그 열기
   */
  const handleViewUser = useCallback(async (userId) => {
    // 액션 메뉴가 열려있다면 먼저 닫기 (접근성 개선)
    if (actionMenuAnchor) {
      setActionMenuAnchor(null);
      setActionMenuUser(null);
    }
    setSelectedUserId(userId);
    await selectUser(userId);
    setDetailDialogOpen(true);
  }, [selectUser, actionMenuAnchor]);

  /**
   * 사용자 상세 다이얼로그 닫기
   */
  const handleCloseDialog = useCallback(() => {
    setDetailDialogOpen(false);
    setSelectedUserId(null);
  }, []);

  /**
   * 액션 메뉴 열기
   */
  const handleActionMenuOpen = useCallback((event, user) => {
    setActionMenuAnchor(event.currentTarget);
    setActionMenuUser(user);
  }, []);

  /**
   * 액션 메뉴 닫기
   */
  const handleActionMenuClose = useCallback(() => {
    setActionMenuAnchor(null);
    setActionMenuUser(null);
  }, []);

  /**
   * 사용자 활성화/비활성화 토글
   */
  const handleToggleUserStatus = useCallback(async (user) => {
    const action = user.isActive ? deactivateUser : activateUser;
    const result = await action(user.id);

    if (!result.success) {
      console.error(result.error);
    }

    handleActionMenuClose();
  }, [activateUser, deactivateUser]);

  /**
   * 데이터 내보내기
   */
  const handleExport = useCallback(async () => {
    const result = await exportUsers();
    if (!result.success) {
      console.error(result.error);
    }
  }, [exportUsers]);

  /**
   * 테이블 정렬 변경
   */
  const handleSort = useCallback((field) => {
    const direction = searchParams.sort === field && searchParams.direction === 'desc' ? 'asc' : 'desc';
    changeSort(field, direction);
  }, [searchParams.sort, searchParams.direction, changeSort]);

  /**
   * 페이지 변경
   */
  const handlePageChange = useCallback((event, newPage) => {
    changePage(newPage);
  }, [changePage]);

  /**
   * 페이지 크기 변경
   */
  const handlePageSizeChange = useCallback((event) => {
    changePageSize(parseInt(event.target.value, 10));
  }, [changePageSize]);

  /**
   * 역할 아이콘 렌더링
   */
  const renderRoleIcon = useCallback((role) => {
    const IconComponent = ROLE_ICONS[role] || UserIcon;
    return <IconComponent sx={{ fontSize: 16, mr: 0.5 }} />;
  }, []);

  /**
   * 로딩 상태 렌더링
   */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message={t('userList.loading', '사용자 목록을 불러오는 중...')} />
      </Box>
    );
  }

  /**
   * 에러 상태 렌더링
   */
  if (error) {
    return (
      <Box p={3}>
        <ErrorMessage
          message={error}
          onRetry={refresh}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* 통계 카드 */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('userList.stats.totalUsers', '전체 사용자')}
                </Typography>
                <Typography variant="h4" component="h2">
                  {statistics.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('userList.stats.activeUsers', '활성 사용자')}
                </Typography>
                <Typography variant="h4" component="h2" color="success.main">
                  {statistics.activeUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('userList.stats.inactiveUsers', '비활성 사용자')}
                </Typography>
                <Typography variant="h4" component="h2" color="error.main">
                  {statistics.inactiveUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('userList.stats.recentRegistrations', '최근 가입')}
                </Typography>
                <Typography variant="h4" component="h2" color="primary.main">
                  {statistics.recentRegistrations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* 메인 컨텐츠 */}
      <Paper>
        {/* 툴바 */}
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('userList.title', '사용자 관리')}
          </Typography>

          {/* 검색 */}
          <TextField
            size="small"
            placeholder={t('userList.search.placeholder', '이름, 사용자명, 이메일 검색...')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            sx={{ width: 250, mr: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }
            }}
          />

          {/* 역할 필터 */}
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>{t('userList.filter.role', '역할')}</InputLabel>
            <Select
              value={searchParams.role}
              label={t('userList.filter.role', '역할')}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">{t('userList.filter.all', '전체')}</MenuItem>
              {Object.entries(USER_ROLES).map(([value, role]) => (
                <MenuItem key={value} value={value}>
                  {renderRoleIcon(value)}
                  {t(role.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 활성 상태 필터 */}
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>{t('userList.filter.status', '상태')}</InputLabel>
            <Select
              value={searchParams.isActive === null ? '' : searchParams.isActive.toString()}
              label={t('userList.filter.status', '상태')}
              onChange={(e) => {
                const value = e.target.value;
                setActiveFilter(value === '' ? null : value === 'true');
              }}
            >
              <MenuItem value="">{t('userList.filter.all', '전체')}</MenuItem>
              <MenuItem value="true">{t('userList.filter.active', '활성')}</MenuItem>
              <MenuItem value="false">{t('userList.filter.inactive', '비활성')}</MenuItem>
            </Select>
          </FormControl>

          {/* 액션 버튼들 */}
          <Tooltip title={t('userList.button.refresh', '새로고침')}>
            <IconButton onClick={refresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('userList.button.export', '데이터 내보내기')}>
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            size="small"
            onClick={resetSearch}
            sx={{ ml: 1 }}
          >
            {t('userList.button.reset', '초기화')}
          </Button>
        </Toolbar>

        {/* 테이블 */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={() => handleSort('username')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {t('userList.table.username', '사용자명')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('name')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {t('userList.table.name', '이름')}
                </TableCell>
                <TableCell>{t('userList.table.email', '이메일')}</TableCell>
                <TableCell>{t('userList.table.emailVerified', '이메일 인증')}</TableCell>
                <TableCell>{t('userList.table.role', '역할')}</TableCell>
                <TableCell>{t('userList.table.status', '상태')}</TableCell>
                <TableCell
                  onClick={() => handleSort('createdAt')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {t('userList.table.createdAt', '가입일')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('lastLoginAt')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {t('userList.table.lastLogin', '최종 로그인')}
                </TableCell>
                <TableCell>{t('userList.table.actions', '작업')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasUsers ? (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                        {user.username}
                      </Box>
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Chip
                          icon={<VerifiedIcon />}
                          label={t('userList.email.verified', '인증됨')}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<WarningIcon />}
                          label={t('userList.email.notVerified', '미인증')}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={renderRoleIcon(user.role)}
                        label={getRoleLabel(user.role)}
                        size="small"
                        sx={{
                          bgcolor: getRoleColor(user.role) + '20',
                          color: getRoleColor(user.role),
                          '& .MuiChip-icon': {
                            color: getRoleColor(user.role)
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(user.isActive)}
                        size="small"
                        color={user.isActive ? 'success' : 'error'}
                        variant={user.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDateOnlySafe(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt
                        ? formatDateOnlySafe(user.lastLoginAt)
                        : t('userList.status.none', '없음')
                      }
                    </TableCell>
                    <TableCell>
                      <Tooltip title={t('userList.action.view', '상세 보기')}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('userList.action.moreActions', '더 많은 작업')}>
                        <IconButton
                          id="user-action-button"
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, user)}
                          aria-controls={Boolean(actionMenuAnchor) ? 'user-action-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={Boolean(actionMenuAnchor) ? 'true' : undefined}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {t('userList.empty.message', '검색 조건에 맞는 사용자가 없습니다.')}
                    </Typography>
                    {searchParams.keyword || searchParams.role || searchParams.isActive !== null ? (
                      <Button onClick={resetSearch} sx={{ mt: 1 }}>
                        {t('userList.empty.resetButton', '검색 조건 초기화')}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {hasUsers && (
          <TablePagination
            component="div"
            count={pagination.totalElements}
            page={pagination.page}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.size}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage={t('userList.pagination.rowsPerPage', '페이지당 행 수:')}
            labelDisplayedRows={({ from, to, count }) =>
              t('userList.pagination.displayedRows', '{from}-{to} / {count} 중')
                .replace('{from}', from)
                .replace('{to}', to)
                .replace('{count}', count !== -1 ? count : to)
            }
          />
        )}
      </Paper>
      {/* 액션 메뉴 */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        id="user-action-menu"
        slotProps={{
          list: {
            'aria-labelledby': 'user-action-button',
          }
        }}
      >
        <MenuItem onClick={() => handleViewUser(actionMenuUser?.id)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('userList.action.view', '상세 보기')}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleToggleUserStatus(actionMenuUser)}>
          <ListItemIcon>
            {actionMenuUser?.isActive ? (
              <BlockIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {actionMenuUser?.isActive ? t('userList.action.deactivate', '비활성화') : t('userList.action.activate', '활성화')}
          </ListItemText>
        </MenuItem>

        {!actionMenuUser?.emailVerified && (
          <>
            <Divider />
            <MenuItem
              onClick={() => handleSendVerificationEmail(actionMenuUser?.id)}
              disabled={sendingEmail}
            >
              <ListItemIcon>
                <EmailIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {t('userList.action.sendVerificationEmail', '인증 이메일 발송')}
              </ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      {/* 사용자 상세 다이얼로그 */}
      <UserDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        userId={selectedUserId}
        onUserUpdated={refresh}
        aria-labelledby="user-detail-dialog-title"
        aria-describedby="user-detail-dialog-description"
      />
      {/* 스낵바 알림 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserList;