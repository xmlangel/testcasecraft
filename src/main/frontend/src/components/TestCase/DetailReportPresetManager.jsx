// src/components/TestCase/DetailReportPresetManager.jsx
// ICT-224: 필터 프리셋 관리 컴포넌트

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon
} from '@mui/icons-material';

/**
 * 필터 프리셋 관리 컴포넌트
 * - 현재 필터 설정을 프리셋으로 저장
 * - 저장된 프리셋 목록 조회 및 적용
 * - 프리셋 이름 변경 및 삭제
 * - 기본 프리셋 제공
 */
const DetailReportPresetManager = ({
  currentFilters,
  onApplyPreset,
  onSavePreset,
  projectId
}) => {
  const { t } = useI18n();

  // 상태 관리
  const [presets, setPresets] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [error, setError] = useState(null);

  // 기본 프리셋 정의
  const defaultPresets = [
    {
      id: 'all',
      name: '전체 결과',
      isDefault: true,
      filters: {
        searchText: '',
        testCaseName: '',
        folderPath: '',
        executorName: '',
        result: [],
        jiraStatus: [],
        startDate: null,
        endDate: null,
        hasNotes: null,
        hasJiraIssue: null,
        isRecent: false
      },
      description: '모든 테스트 결과 표시'
    },
    {
      id: 'failed_only',
      name: '실패 케이스만',
      isDefault: true,
      filters: {
        searchText: '',
        testCaseName: '',
        folderPath: '',
        executorName: '',
        result: ['FAIL'],
        jiraStatus: [],
        startDate: null,
        endDate: null,
        hasNotes: null,
        hasJiraIssue: null,
        isRecent: false
      },
      description: '실패한 테스트 케이스만 표시'
    },
    {
      id: 'recent_week',
      name: '최근 7일',
      isDefault: true,
      filters: {
        searchText: '',
        testCaseName: '',
        folderPath: '',
        executorName: '',
        result: [],
        jiraStatus: [],
        startDate: null,
        endDate: null,
        hasNotes: null,
        hasJiraIssue: null,
        isRecent: true
      },
      description: '최근 7일간의 테스트 결과'
    },
    {
      id: 'with_jira',
      name: 'JIRA 연동',
      isDefault: true,
      filters: {
        searchText: '',
        testCaseName: '',
        folderPath: '',
        executorName: '',
        result: [],
        jiraStatus: [],
        startDate: null,
        endDate: null,
        hasNotes: null,
        hasJiraIssue: true,
        isRecent: false
      },
      description: 'JIRA 이슈가 연결된 테스트 케이스'
    }
  ];

  // 로컬 스토리지 키 생성
  const getStorageKey = () => `testresult_presets_${projectId}`;

  // 컴포넌트 마운트 시 프리셋 로드
  useEffect(() => {
    loadPresets();
  }, [projectId]);

  // 프리셋 로드
  const loadPresets = () => {
    try {
      const storageKey = getStorageKey();
      const savedPresets = localStorage.getItem(storageKey);
      const userPresets = savedPresets ? JSON.parse(savedPresets) : [];

      // 기본 프리셋과 사용자 프리셋 합치기
      setPresets([...defaultPresets, ...userPresets]);
    } catch (error) {
      console.error('프리셋 로드 실패:', error);
      setError('프리셋을 불러오는 중 오류가 발생했습니다.');
      setPresets(defaultPresets);
    }
  };

  // 프리셋 저장
  const savePresets = (newPresets) => {
    try {
      const storageKey = getStorageKey();
      const userPresets = newPresets.filter(preset => !preset.isDefault);
      localStorage.setItem(storageKey, JSON.stringify(userPresets));
      setPresets(newPresets);
    } catch (error) {
      console.error('프리셋 저장 실패:', error);
      setError('프리셋 저장 중 오류가 발생했습니다.');
    }
  };

  // 새 프리셋 저장
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      setError('프리셋 이름을 입력해주세요.');
      return;
    }

    // 중복 이름 확인
    const existingPreset = presets.find(p => p.name === presetName.trim());
    if (existingPreset) {
      setError('이미 존재하는 프리셋 이름입니다.');
      return;
    }

    const newPreset = {
      id: `user_${Date.now()}`,
      name: presetName.trim(),
      isDefault: false,
      filters: { ...currentFilters },
      description: '사용자 정의 프리셋',
      createdAt: new Date().toISOString()
    };

    const newPresets = [...presets, newPreset];
    savePresets(newPresets);

    // 콜백 호출
    if (onSavePreset) {
      onSavePreset(newPreset);
    }

    // 다이얼로그 닫기
    setSaveDialogOpen(false);
    setPresetName('');
    setError(null);
  };

  // 프리셋 적용
  const handleApplyPreset = (preset) => {
    if (onApplyPreset) {
      onApplyPreset(preset.filters, preset.name);
    }
    setAnchorEl(null);
  };

  // 프리셋 삭제
  const handleDeletePreset = (presetId) => {
    if (defaultPresets.find(p => p.id === presetId)) {
      setError('기본 프리셋은 삭제할 수 없습니다.');
      return;
    }

    const newPresets = presets.filter(p => p.id !== presetId);
    savePresets(newPresets);
    setAnchorEl(null);
  };

  // 프리셋 이름 수정
  const handleEditPreset = () => {
    if (!presetName.trim()) {
      setError('프리셋 이름을 입력해주세요.');
      return;
    }

    // 중복 이름 확인 (자기 자신 제외)
    const existingPreset = presets.find(p => p.name === presetName.trim() && p.id !== editingPreset.id);
    if (existingPreset) {
      setError('이미 존재하는 프리셋 이름입니다.');
      return;
    }

    const newPresets = presets.map(p =>
      p.id === editingPreset.id
        ? { ...p, name: presetName.trim() }
        : p
    );

    savePresets(newPresets);
    setEditDialogOpen(false);
    setEditingPreset(null);
    setPresetName('');
    setError(null);
  };

  // 메뉴 열기
  const handleMenuOpen = (event, preset) => {
    setAnchorEl(event.currentTarget);
    setSelectedPreset(preset);
  };

  // 메뉴 닫기
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPreset(null);
  };

  // 편집 다이얼로그 열기
  const openEditDialog = (preset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  return (
    <Box>
      {/* 프리셋 관리 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderOpenIcon color="primary" />
          필터 프리셋
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
          size="small"
        >
          현재 필터 저장
        </Button>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 프리셋 목록 */}
      <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
        <List dense>
          {presets.map((preset, index) => (
            <React.Fragment key={preset.id}>
              <ListItem
                button
                onClick={() => handleApplyPreset(preset)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {preset.isDefault ? (
                        <StarIcon color="primary" fontSize="small" />
                      ) : (
                        <StarBorderIcon color="action" fontSize="small" />
                      )}
                      <Typography variant="body2" fontWeight="medium">
                        {preset.name}
                      </Typography>
                      {preset.isDefault && (
                        <Chip label="기본" size="small" variant="outlined" color="primary" />
                      )}
                    </Box>
                  }
                  secondary={preset.description}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleMenuOpen(e, preset)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < presets.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* 컨텍스트 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleApplyPreset(selectedPreset)}>
          <FolderOpenIcon sx={{ mr: 1 }} fontSize="small" />
          적용
        </MenuItem>
        {selectedPreset && !selectedPreset.isDefault && (
          <>
            <MenuItem onClick={() => openEditDialog(selectedPreset)}>
              <EditIcon sx={{ mr: 1 }} fontSize="small" />
              이름 수정
            </MenuItem>
            <MenuItem
              onClick={() => handleDeletePreset(selectedPreset.id)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
              삭제
            </MenuItem>
          </>
        )}
      </Menu>

      {/* 프리셋 저장 다이얼로그 */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>필터 프리셋 저장</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="프리셋 이름"
            fullWidth
            variant="outlined"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder={t('preset.name.placeholder', '예: 내 테스트 케이스')}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            현재 설정된 필터 조건이 프리셋으로 저장됩니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>{t('common.cancel', '취소')}</Button>
          <Button onClick={handleSavePreset} variant="contained">{t('common.save', '저장')}</Button>
        </DialogActions>
      </Dialog>

      {/* 프리셋 편집 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>프리셋 이름 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="프리셋 이름"
            fullWidth
            variant="outlined"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common.cancel', '취소')}</Button>
          <Button onClick={handleEditPreset} variant="contained">{t('common.save', '수정')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetailReportPresetManager;