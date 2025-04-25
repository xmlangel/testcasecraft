import React, { useState } from 'react';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { 
  Box, IconButton, Menu, MenuItem, Typography, TextField
} from '@mui/material';
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
  const testCases = state.testCases;
  
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemData, setNewItemData] = useState(null);
  const [renameData, setRenameData] = useState(null);
  
  // 트리 데이터 준비
  const treeData = listToTree([...testCases], null);
  
  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };
  
  const handleSelect = (event, nodeId) => {
    setSelected(nodeId);
    
    const selectedTestCase = testCases.find(tc => tc.id === nodeId);
    
    if (selectable) {
      if (selectedIds.includes(nodeId)) {
        onSelectionChange(selectedIds.filter(id => id !== nodeId));
      } else {
        onSelectionChange([...selectedIds, nodeId]);
      }
    } else {
      setActiveTestCase(nodeId);
      if (onSelectTestCase) onSelectTestCase(selectedTestCase);
    }
  };
  
  // 컨텍스트 메뉴 표시 - 명시적으로 nodeId 관리
  const handleContextMenu = (event, nodeId) => {
    event.preventDefault();
    event.stopPropagation();
    setSelected(nodeId);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      nodeId
    });
    console.log("Context menu opened for nodeId:", nodeId);
  };
  
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  // 아이템 추가 처리 개선
  const handleAddItem = (type) => {
    // nodeId가 null인 경우 명시적으로 확인 (최상위 추가)
    const parentId = contextMenu?.nodeId === null ? null : contextMenu?.nodeId;
    console.log(`Adding ${type} with parentId:`, parentId);
    
    setNewItemData({ 
      type, 
      parentId,
      name: ''
    });
    handleCloseContextMenu();
  };
  
  const handleCancelAdd = () => {
    setNewItemData(null);
  };
  
  // 아이템 추가 확인 개선
  const handleConfirmAdd = () => {
    if (newItemData && newItemData.name && newItemData.name.trim()) {
      const id = newItemData.type === 'folder' ? `folder-${uuidv4()}` : `test-${uuidv4()}`;
      
      // 명시적으로 parentId 처리
      const parentId = newItemData.parentId === null ? null : newItemData.parentId;
      
      const newItem = {
        id,
        name: newItemData.name.trim(),
        parentId,
        type: newItemData.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log("Adding new item:", newItem);
      addTestCase(newItem);
      
      // parentId가 null이 아닌 경우에만 expanded에 추가
      if (parentId) {
        setExpanded(prev => [...prev, parentId]);
      }
      
      setNewItemData(null);
    }
  };
  
  const handleRename = () => {
    const node = testCases.find(tc => tc.id === contextMenu.nodeId);
    setRenameData({ id: node.id, name: node.name });
    handleCloseContextMenu();
  };
  
  const handleCancelRename = () => {
    setRenameData(null);
  };
  
  const handleConfirmRename = () => {
    if (renameData && renameData.name && renameData.name.trim()) {
      const testCase = testCases.find(tc => tc.id === renameData.id);
      updateTestCase({ ...testCase, name: renameData.name.trim() });
      setRenameData(null);
    }
  };
  
  const handleDelete = () => {
    deleteTestCase(contextMenu.nodeId);
    handleCloseContextMenu();
  };
  
  const renderTree = (nodes) => {
    return nodes.map(node => {
      const isSelected = selectable ? selectedIds.includes(node.id) : selected === node.id;
      
      // 이름 변경 중인 경우와 일반 표시 구분
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
          {isFolder(node) ? 
            <FolderIcon color="primary" sx={{ mr: 1 }} /> : 
            <DescriptionIcon sx={{ mr: 1 }} />
          }
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
        <TreeItem key={node.id} nodeId={node.id} label={labelContent}>
          {/* 하위 아이템 추가 UI */}
          {newItemData && newItemData.parentId === node.id && (
            <Box sx={{ ml: 4, mt: 1, display: 'flex', alignItems: 'center' }}>
              {newItemData.type === 'folder' ? 
                <FolderIcon color="primary" sx={{ mr: 1 }} /> : 
                <DescriptionIcon sx={{ mr: 1 }} />
              }
              <TextField
                size="small"
                placeholder={`새 ${newItemData.type === 'folder' ? '폴더' : '테스트케이스'} 이름`}
                value={newItemData.name || ''}
                onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirmAdd()}
                autoFocus
                fullWidth
              />
              <IconButton 
                size="small" 
                onClick={handleConfirmAdd}
                data-testid="confirm-add-button"
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancelAdd}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          
          {Array.isArray(node.children) && node.children.length > 0 ? 
            renderTree(node.children) : null}
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
            // 최상위 추가 버튼: nodeId를 명시적으로 null로 설정
            setContextMenu({ 
              mouseX: e.clientX, 
              mouseY: e.clientY, 
              nodeId: null 
            });
            console.log("Top level add button clicked");
          }}
          data-testid="add-top-button"
        >
          <AddIcon />
        </IconButton>
      </Box>
      
      {/* 최상위 아이템 추가 UI - parentId가 명시적으로 null인 경우만 표시 */}
      {newItemData && newItemData.parentId === null && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          {newItemData.type === 'folder' ? 
            <FolderIcon color="primary" sx={{ mr: 1 }} /> : 
            <DescriptionIcon sx={{ mr: 1 }} />
          }
          <TextField
            size="small"
            placeholder={`새 ${newItemData.type === 'folder' ? '폴더' : '테스트케이스'} 이름`}
            value={newItemData.name || ''}
            onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleConfirmAdd()}
            autoFocus
            fullWidth
          />
          <IconButton 
            size="small" 
            onClick={handleConfirmAdd}
            data-testid="confirm-add-button"
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancelAdd}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selectable ? undefined : selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        sx={{
          height: '100%',
          flexGrow: 1,
          overflowY: 'auto',
          '& .MuiTreeItem-content': { padding: '4px 8px' }
        }}
      >
        {treeData.length > 0 ? 
          renderTree(treeData) : 
          <Typography variant="body2" sx={{ p: 2 }}>
            테스트케이스가 없습니다. 새 테스트케이스를 추가해주세요.
          </Typography>
        }
      </TreeView>
      
      {/* 컨텍스트 메뉴 개선 */}
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
        {/* 최상위 추가 메뉴 - nodeId가 명시적으로 null인 경우 */}
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
          // 일반 컨텍스트 메뉴
          <>
            {contextMenu && isFolder(testCases.find(tc => tc.id === contextMenu.nodeId)) && (
              <>
                <MenuItem onClick={() => handleAddItem('folder')}>
                  <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                  폴더 추가
                </MenuItem>
                <MenuItem onClick={() => handleAddItem('testcase')}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                  테스트케이스 추가
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
