// src/components/TestResultFolderStatsView.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
  Breadcrumbs,
  Link,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ExpandMore,
  CheckCircle,
  Cancel,
  Block,
  PlayCircleFilled,
  AccountTree
} from '@mui/icons-material';
import { useI18n } from '../context/I18nContext';

/**
 * 폴더 트리 노드 렌더링 컴포넌트 (재귀)
 */
const FolderTreeNode = ({ node, depth, selectedPath, onSelect, expanded, onToggle }) => {
  const isSelected = selectedPath === node.fullPath;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.fullPath];

  // 성공률에 따른 색상 결정
  const getProgressColor = (rate) => {
    if (rate >= 80) return '#4caf50'; // Green
    if (rate >= 60) return '#2196f3'; // Blue
    if (rate >= 40) return '#ffeb3b'; // Yellow
    return '#f44336'; // Red
  };

  const getStatusIcon = (rate) => {
    if (rate >= 80) return <CheckCircle sx={{ color: '#4caf50', fontSize: '1rem' }} />;
    if (rate >= 60) return <CheckCircle sx={{ color: '#2196f3', fontSize: '1rem' }} />;
    if (rate >= 40) return <PlayCircleFilled sx={{ color: '#ffeb3b', fontSize: '1rem' }} />;
    return <Cancel sx={{ color: '#f44336', fontSize: '1rem' }} />;
  };

  return (
    <React.Fragment>
      <ListItemButton
        onClick={() => onSelect(node)}
        selected={isSelected}
        sx={{
          pl: depth * 2 + 1,
          py: 0.5,
          borderRadius: 1,
          mb: 0.5,
          '&.Mui-selected': {
            backgroundColor: 'action.selected',
            fontWeight: 'bold'
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.fullPath);
              }}
              sx={{ p: 0 }}
            >
              {isExpanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
          ) : (
            <Box sx={{ width: 24 }} />
          )}
          {isExpanded ? (
            <FolderOpen color="primary" fontSize="small" />
          ) : (
            <Folder color="primary" fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                {node.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {node.successRate.toFixed(0)}%
                </Typography>
                {getStatusIcon(node.successRate)}
              </Box>
            </Box>
          }
        />
      </ListItemButton>
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children.map((child) => (
              <FolderTreeNode
                key={child.fullPath}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
                expanded={expanded}
                onToggle={onToggle}
              />
            ))}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  );
};

/**
 * 폴더별 통계 뷰 메인 컴포넌트
 */
const TestResultFolderStatsView = ({ 
  reportData, 
  statistics, 
  loading, 
  projectName,
  maxDepth = 10 
}) => {
  const { t } = useI18n();
  const theme = useTheme();
  
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [expanded, setExpanded] = useState({ 'Root': true });

  // 데이터 트리 구조화
  const folderTree = useMemo(() => {
    // Page 객체 대응 (content 필드가 데이터를 담고 있음)
    const data = Array.isArray(reportData) ? reportData : (reportData?.content || []);
    if (!data || data.length === 0) return null;

    const root = {
      name: t('testResult.folder.root', '전체'),
      fullPath: 'Root',
      children: [],
      pass: 0,
      fail: 0,
      blocked: 0,
      not_run: 0,
      total: 0,
      execution_count: 0
    };

    const treeMap = { 'Root': root };

    data.forEach(item => {
      const folderPath = item.folderPath || '';
      const parts = folderPath.split(/[\/>]/).map(p => p.trim()).filter(p => p);
      
      let currentPath = 'Root';
      let currentNode = root;

      // 트리 생성 및 통계 합산 (모든 부모 폴더에 합산)
      const updateStats = (node) => {
        node.total++;
        node.execution_count += (item.executionCount || 1);
        const result = item.result || 'NOT_RUN';
        if (result === 'PASS') node.pass++;
        else if (result === 'FAIL') node.fail++;
        else if (result === 'BLOCKED') node.blocked++;
        else node.not_run++;
      };

      updateStats(root);

      parts.forEach((part, index) => {
        if (index >= maxDepth) return;
        
        const parentPath = currentPath;
        currentPath = `${parentPath} > ${part}`;

        if (!treeMap[currentPath]) {
          const newNode = {
            name: part,
            fullPath: currentPath,
            parentPath: parentPath,
            children: [],
            pass: 0,
            fail: 0,
            blocked: 0,
            not_run: 0,
            total: 0,
            execution_count: 0
          };
          treeMap[currentPath] = newNode;
          treeMap[parentPath].children.push(newNode);
        }
        
        currentNode = treeMap[currentPath];
        updateStats(currentNode);
      });
    });

    // 성공률 계산 (재귀)
    const calculateRates = (node) => {
      node.successRate = node.total > 0 ? (node.pass / node.total) * 100 : 0;
      node.children.forEach(calculateRates);
      // 이름순 정렬
      node.children.sort((a, b) => a.name.localeCompare(b.name));
    };

    calculateRates(root);
    return root;
  }, [reportData, maxDepth, t]);

  // 초기 로드 시 Root 선택
  useEffect(() => {
    if (folderTree && !selectedFolder) {
      setSelectedFolder(folderTree);
    }
  }, [folderTree, selectedFolder]);

  const handleToggle = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleSelectFolder = (node) => {
    setSelectedFolder(node);
  };

  if (loading && !folderTree) {
    return <LinearProgress />;
  }

  if (!folderTree) {
    return loading ? <LinearProgress /> : null;
  }

  // 상세 통계 계산
  const stats = selectedFolder || folderTree;
  const passRate = stats.total > 0 ? (stats.pass / stats.total) * 100 : 0;
  const failRate = stats.total > 0 ? (stats.fail / stats.total) * 100 : 0;
  const blockedRate = stats.total > 0 ? (stats.blocked / stats.total) * 100 : 0;
  const notRunRate = stats.total > 0 ? (stats.not_run / stats.total) * 100 : 0;

  // 커스텀 프로그레스바 렌더링 (■■■■■□□□□□)
  const renderVisualProgress = (rate) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round(rate / 10);
    let str = '';
    for (let i = 0; i < totalBlocks; i++) {
      str += i < filledBlocks ? '■' : '□';
    }
    return (
      <Box sx={{ 
        fontFamily: 'monospace', 
        fontSize: '1.2rem', 
        letterSpacing: 2, 
        color: 'primary.main',
        backgroundColor: 'action.hover',
        p: 1,
        borderRadius: 1,
        display: 'inline-block'
      }}>
        {str} {rate.toFixed(0)}%
      </Box>
    );
  };

  return (
    <Box>
      {/* 통계 헤더: 전체 성공률 */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            [{projectName || 'Project'}] {t('testResult.folder.totalSuccessRate', '전체 성공률')} {folderTree.successRate.toFixed(1)}%
          </Typography>
          <AccountTree />
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {/* 좌측: 폴더 트리 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: '600px', overflowY: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              📁 {t('testResult.folder.depthView', '폴더 트리 (Depth View)')}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              <FolderTreeNode
                node={folderTree}
                depth={0}
                selectedPath={selectedFolder?.fullPath}
                onSelect={handleSelectFolder}
                expanded={expanded}
                onToggle={handleToggle}
              />
            </List>
          </Paper>
        </Grid>

        {/* 우측: 상세 통계 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: '600px' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                📊 {t('testResult.folder.detailStats', '상세 통계 (선택된 폴더)')}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                [{t('testResult.folder.name', '폴더명')}: {stats.name}]
              </Typography>
            </Box>

            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                {t('testResult.folder.successRate', '성공률')}: {stats.successRate.toFixed(1)}%
              </Typography>
              {renderVisualProgress(stats.successRate)}
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('testResult.folder.totalCases', '전체 케이스')}
                  </Typography>
                  <Typography variant="h5">{stats.total}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('testResult.folder.executionCount', '수행 횟수')}
                  </Typography>
                  <Typography variant="h5">{stats.execution_count}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <List sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
              <ListItem sx={{ py: 1 }}>
                <ListItemIcon><CheckCircle sx={{ color: 'success.main' }} /></ListItemIcon>
                <ListItemText primary={t('testResult.status.pass', '성공')} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.pass} ({passRate.toFixed(0)}%)
                </Typography>
              </ListItem>
              <ListItem sx={{ py: 1 }}>
                <ListItemIcon><Cancel sx={{ color: 'error.main' }} /></ListItemIcon>
                <ListItemText primary={t('testResult.status.fail', '실패')} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.fail} ({failRate.toFixed(0)}%)
                </Typography>
              </ListItem>
              <ListItem sx={{ py: 1 }}>
                <ListItemIcon><Block sx={{ color: 'warning.main' }} /></ListItemIcon>
                <ListItemText primary={t('testResult.status.blocked', '차단')} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.blocked} ({blockedRate.toFixed(0)}%)
                </Typography>
              </ListItem>
              <ListItem sx={{ py: 1 }}>
                <ListItemIcon><PlayCircleFilled sx={{ color: 'text.disabled' }} /></ListItemIcon>
                <ListItemText primary={t('testResult.status.notRun', '미실행')} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.not_run} ({notRunRate.toFixed(0)}%)
                </Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TestResultFolderStatsView;
