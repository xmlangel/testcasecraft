// /src/components/TestCaseTree.js
import React, { useState } from 'react';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { Box, IconButton, Menu, MenuItem, Typography, TextField, Button } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { listToTree, isFolder } from '../utils/treeUtils';

const TestCaseTree = ({ onSelectTestCase, selectable = false, selectedIds = [], onSelectionChange }) => {
  const { state, addTestCase, updateTestCase, deleteTestCase, setActiveTestCase } = useAppContext();
  const { testCases } = state;
  
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemData, setNewItemData] = useState(null);
  const [renameData, setRenameData] = useState(null);
  
  // TreeView 데이터 준비
  const treeData = listToTree([...testCases], null);
  
  // 노드 확장 처리
  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };
  
  // 노드 선택 처리
  const handleSelect = (event, nodeId) => {
    setSelected(nodeId);
    const selectedTestCase = testCases.find(tc => tc.id === nodeId);
    
    if (selectable) {
      // 다중 선택 모드
      if (selectedIds.includes(nodeId)) {
        onSelectionChange(selectedIds.filter(id => id !== nodeId));
      } else {
        onSelectionChange([...selectedIds, nodeId]);
      }
    } else {
      // 단일 선택 모드
      setActiveTestCase(nodeId);
      if (onSelectTestCase) {
        onSelectTestCase(selectedTestCase);
      }
    }
  };
  
  // 컨텍스트 메뉴 열기
  const handleContextMenu = (event, nodeId) => {
    event.preventDefault();
    event.stopPropagation();
    setSelected(nodeId);
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, nodeId });
  };
  
  // 컨텍스트 메뉴 닫기
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  // 새 항목 추가 시작
  const handleAddItem = (type) => {
    setNewItemData({
      type,
      parentId: contextMenu.nodeId
    });
    handleCloseContextMenu();
  };
  
  // 새 항목 추가 취소
  const handleCancelAdd = () => {
    setNewItemData(null);
  };
  
  // 새 항목 추가 완료
  const handleConfirmAdd = () => {
    if (newItemData && newItemData.name && newItemData.name.trim()) {
      const id = `${newItemData.type === 'folder' ? 'folder' : 'test'}-${uuidv4()}`;
      const newItem = {
        id,
        name: newItemData.name.trim(),
        parentId: newItemData.parentId,
        type: newItemData.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      addTestCase(newItem);
      setExpanded([...expanded, newItemData.parentId]);
      setNewItemData(null);
    }
  };
  
  // 이름 변경 시작
  const handleRename = () => {
    const node = testCases.find(tc => tc.id === contextMenu.nodeId);
    setRenameData({
      id: node.id,
      name: node.name
    });
    handleCloseContextMenu();
  };
  
  // 이름 변경 취소
  const handleCancelRename = () => {
    setRenameData(null);
  };
  
  // 이름 변경 완료
  const handleConfirmRename = () => {
    if (renameData && renameData.name && renameData.name.trim()) {
      const testCase = testCases.find(tc => tc.id === renameData.id);
      updateTestCase({
        ...testCase,
        name: renameData.name.trim()
      });
      setRenameData(null);
    }
  };
  
  // 삭제 처리
  const handleDelete = () => {
    deleteTestCase(contextMenu.nodeId);
    handleCloseContextMenu();
  };
  
  // TreeItem 렌더링 함수
  const renderTree = (nodes) => {
    return nodes.map((node) => {
      const isSelected = selectable ? selectedIds.includes(node.id) : selected === node.id;
      const labelContent = renameData && renameData.id === node.id ? (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}>
          <TextField
            size="small"
            value={renameData.name}
            onChange={(e) => setRenameData({ ...renameData, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleConfirmRename()}
            autoFocus
            fullWidth
            onClick={(e) => e.stopPropagation()}
          />
          <IconButton size="small" onClick={handleConfirmRename}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancelRename}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
          }}
          onContextMenu={(e) => handleContextMenu(e, node.id)}
        >
          {isFolder(node) ? <FolderIcon color="primary" sx={{ mr: 1 }} /> : <DescriptionIcon sx={{ mr: 1 }} />}
          <Typography variant="body2">{node.name}</Typography>
          <Box sx={{ marginLeft: 'auto' }}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, node.id);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      );
      
      return (
        <TreeItem 
          key={node.id} 
          nodeId={node.id} 
          label={labelContent}
        >
          {/* 새 항목 추가 폼 */}
          {newItemData && newItemData.parentId === node.id && (
            <Box sx={{ ml: 4, mt: 1, display: 'flex', alignItems: 'center' }}>
              {newItemData.type === 'folder' ? <FolderIcon color="primary" sx={{ mr: 1 }} /> : <DescriptionIcon sx={{ mr: 1 }} />}
              <TextField
                size="small"
                placeholder={`${newItemData.type === 'folder' ? '폴더' : '테스트케이스'} 이름`}
                value={newItemData.name || ''}
                onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmAdd()}
                autoFocus
                fullWidth
              />
              <IconButton size="small" onClick={handleConfirmAdd}>
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancelAdd}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          
          {/* 자식 노드 렌더링 */}
          {Array.isArray(node.children) && node.children.length > 0 ? renderTree(node.children) : null}
        </TreeItem>
      );
    });
  };
  
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">테스트케이스 트리</Typography>
        <IconButton 
          onClick={(e) => {
            setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, nodeId: null });
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
      
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selectable ? [] : selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        sx={{ 
          height: '100%', 
          flexGrow: 1, 
          overflowY: 'auto',
          '& .MuiTreeItem-content': {
            padding: '4px 8px'
          }
        }}
      >
        {treeData.length > 0 ? (
          renderTree(treeData)
        ) : (
          <Typography variant="body2" sx={{ p: 2 }}>
            테스트케이스가 없습니다. 추가 버튼을 눌러 생성하세요.
          </Typography>
        )}
      </TreeView>
      
      {/* 컨텍스트 메뉴 */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.nodeId === null ? (
          <>
            <MenuItem onClick={() => handleAddItem('folder')}>
              <FolderIcon fontSize="small" sx={{ mr: 1 }} />
              최상위 폴더 추가
            </MenuItem>
            <MenuItem onClick={() => handleAddItem('testcase')}>
              <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
              최상위 테스트케이스 추가
            </MenuItem>
          </>
        ) : (
          <>
            {contextMenu && isFolder(testCases.find(tc => tc.id === contextMenu.nodeId)) && (
              <>
                <MenuItem onClick={() => handleAddItem('folder')}>
                  <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                  하위 폴더 추가
                </MenuItem>
                <MenuItem onClick={() => handleAddItem('testcase')}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                  하위 테스트케이스 추가
                </MenuItem>
                <MenuItem divider />
              </>
            )}
            <MenuItem onClick={handleRename}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              이름 변경
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              삭제
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default TestCaseTree;
