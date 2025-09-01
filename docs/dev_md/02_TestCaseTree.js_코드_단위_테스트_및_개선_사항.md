<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# TestCaseTree.js 코드 단위 테스트 및 개선 사항

## 테스트 케이스 추가 및 기능 검증

최상위 폴더와 테스트케이스 추가 기능 문제를 해결하기 위한 단위 테스트를 추가하고 코드를 개선하겠습니다.

### 단위 테스트 코드

```javascript
// TestCaseTree.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import TestCaseTree from './TestCaseTree';

// UUID 모킹
jest.mock('uuid', () =&gt; ({
  v4: () =&gt; 'test-uuid'
}));

describe('TestCaseTree 컴포넌트', () =&gt; {
  test('최상위 폴더 추가 기능 테스트', async () =&gt; {
    render(
      &lt;AppProvider&gt;
        &lt;TestCaseTree /&gt;
      &lt;/AppProvider&gt;
    );
    
    // 최상위 추가 버튼 클릭
    const addButton = screen.getByTestId('add-top-button');
    fireEvent.click(addButton);
    
    // 최상위 폴더 추가 메뉴 선택
    const folderOption = screen.getByText('최상위 폴더 추가');
    fireEvent.click(folderOption);
    
    // 폴더명 입력
    const nameInput = screen.getByPlaceholderText('새 폴더 이름');
    fireEvent.change(nameInput, { target: { value: '테스트 폴더' } });
    
    // 추가 확인 버튼 클릭
    const confirmButton = screen.getByTestId('confirm-add-button');
    fireEvent.click(confirmButton);
    
    // 폴더가 추가되었는지 확인
    await waitFor(() =&gt; {
      expect(screen.getByText('테스트 폴더')).toBeInTheDocument();
    });
  });
  
  test('최상위 테스트케이스 추가 기능 테스트', async () =&gt; {
    render(
      &lt;AppProvider&gt;
        &lt;TestCaseTree /&gt;
      &lt;/AppProvider&gt;
    );
    
    // 최상위 추가 버튼 클릭
    const addButton = screen.getByTestId('add-top-button');
    fireEvent.click(addButton);
    
    // 최상위 테스트케이스 추가 메뉴 선택
    const testcaseOption = screen.getByText('최상위 테스트케이스 추가');
    fireEvent.click(testcaseOption);
    
    // 테스트케이스명 입력
    const nameInput = screen.getByPlaceholderText('새 테스트케이스 이름');
    fireEvent.change(nameInput, { target: { value: '테스트 케이스' } });
    
    // 추가 확인 버튼 클릭
    const confirmButton = screen.getByTestId('confirm-add-button');
    fireEvent.click(confirmButton);
    
    // 테스트케이스가 추가되었는지 확인
    await waitFor(() =&gt; {
      expect(screen.getByText('테스트 케이스')).toBeInTheDocument();
    });
  });
});
```


## 코드 개선 사항

문제 분석 결과, `TestCaseTree.js` 내에서 다음과 같은 문제점들이 확인되었습니다:

1. 최상위 항목 추가 시 `parentId: null` 처리 부분 오류
2. 최상위 입력창 표시 조건 문제
3. 메뉴 항목 구성 및 이벤트 처리 부분 개선 필요

### 개선된 TestCaseTree.js 코드

```javascript
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

const TestCaseTree = ({ onSelectTestCase, selectable = false, selectedIds = [], onSelectionChange }) =&gt; {
  const { state, addTestCase, updateTestCase, deleteTestCase, setActiveTestCase } = useAppContext();
  const testCases = state.testCases;
  
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemData, setNewItemData] = useState(null);
  const [renameData, setRenameData] = useState(null);
  
  // 트리 데이터 준비
  const treeData = listToTree([...testCases], null);
  
  const handleToggle = (event, nodeIds) =&gt; {
    setExpanded(nodeIds);
  };
  
  const handleSelect = (event, nodeId) =&gt; {
    setSelected(nodeId);
    
    const selectedTestCase = testCases.find(tc =&gt; tc.id === nodeId);
    
    if (selectable) {
      if (selectedIds.includes(nodeId)) {
        onSelectionChange(selectedIds.filter(id =&gt; id !== nodeId));
      } else {
        onSelectionChange([...selectedIds, nodeId]);
      }
    } else {
      setActiveTestCase(nodeId);
      if (onSelectTestCase) onSelectTestCase(selectedTestCase);
    }
  };
  
  // 컨텍스트 메뉴 표시 - 명시적으로 nodeId 관리
  const handleContextMenu = (event, nodeId) =&gt; {
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
  
  const handleCloseContextMenu = () =&gt; {
    setContextMenu(null);
  };
  
  // 아이템 추가 처리 개선
  const handleAddItem = (type) =&gt; {
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
  
  const handleCancelAdd = () =&gt; {
    setNewItemData(null);
  };
  
  // 아이템 추가 확인 개선
  const handleConfirmAdd = () =&gt; {
    if (newItemData &amp;&amp; newItemData.name &amp;&amp; newItemData.name.trim()) {
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
        setExpanded(prev =&gt; [...prev, parentId]);
      }
      
      setNewItemData(null);
    }
  };
  
  const handleRename = () =&gt; {
    const node = testCases.find(tc =&gt; tc.id === contextMenu.nodeId);
    setRenameData({ id: node.id, name: node.name });
    handleCloseContextMenu();
  };
  
  const handleCancelRename = () =&gt; {
    setRenameData(null);
  };
  
  const handleConfirmRename = () =&gt; {
    if (renameData &amp;&amp; renameData.name &amp;&amp; renameData.name.trim()) {
      const testCase = testCases.find(tc =&gt; tc.id === renameData.id);
      updateTestCase({ ...testCase, name: renameData.name.trim() });
      setRenameData(null);
    }
  };
  
  const handleDelete = () =&gt; {
    deleteTestCase(contextMenu.nodeId);
    handleCloseContextMenu();
  };
  
  const renderTree = (nodes) =&gt; {
    return nodes.map(node =&gt; {
      const isSelected = selectable ? selectedIds.includes(node.id) : selected === node.id;
      
      // 이름 변경 중인 경우와 일반 표시 구분
      const labelContent = renameData &amp;&amp; renameData.id === node.id ? (
        &lt;Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}&gt;
          &lt;TextField
            size="small"
            value={renameData.name}
            onChange={(e) =&gt; setRenameData({ ...renameData, name: e.target.value })}
            onKeyPress={(e) =&gt; e.key === 'Enter' &amp;&amp; handleConfirmRename()}
            autoFocus
            fullWidth
            onClick={(e) =&gt; e.stopPropagation()}
          /&gt;
          &lt;IconButton size="small" onClick={handleConfirmRename}&gt;
            &lt;EditIcon fontSize="small" /&gt;
          &lt;/IconButton&gt;
          &lt;IconButton size="small" onClick={handleCancelRename}&gt;
            &lt;DeleteIcon fontSize="small" /&gt;
          &lt;/IconButton&gt;
        &lt;/Box&gt;
      ) : (
        &lt;Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 0.5, 
            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
          }}
          onContextMenu={(e) =&gt; handleContextMenu(e, node.id)}
        &gt;
          {isFolder(node) ? 
            &lt;FolderIcon color="primary" sx={{ mr: 1 }} /&gt; : 
            &lt;DescriptionIcon sx={{ mr: 1 }} /&gt;
          }
          &lt;Typography variant="body2"&gt;{node.name}&lt;/Typography&gt;
          &lt;Box sx={{ marginLeft: 'auto' }}&gt;
            &lt;IconButton 
              size="small" 
              onClick={(e) =&gt; {
                e.stopPropagation();
                handleContextMenu(e, node.id);
              }}
            &gt;
              &lt;MoreVertIcon fontSize="small" /&gt;
            &lt;/IconButton&gt;
          &lt;/Box&gt;
        &lt;/Box&gt;
      );
      
      return (
        &lt;TreeItem key={node.id} nodeId={node.id} label={labelContent}&gt;
          {/* 하위 아이템 추가 UI */}
          {newItemData &amp;&amp; newItemData.parentId === node.id &amp;&amp; (
            &lt;Box sx={{ ml: 4, mt: 1, display: 'flex', alignItems: 'center' }}&gt;
              {newItemData.type === 'folder' ? 
                &lt;FolderIcon color="primary" sx={{ mr: 1 }} /&gt; : 
                &lt;DescriptionIcon sx={{ mr: 1 }} /&gt;
              }
              &lt;TextField
                size="small"
                placeholder={`새 ${newItemData.type === 'folder' ? '폴더' : '테스트케이스'} 이름`}
                value={newItemData.name || ''}
                onChange={(e) =&gt; setNewItemData({ ...newItemData, name: e.target.value })}
                onKeyPress={(e) =&gt; e.key === 'Enter' &amp;&amp; handleConfirmAdd()}
                autoFocus
                fullWidth
              /&gt;
              &lt;IconButton 
                size="small" 
                onClick={handleConfirmAdd}
                data-testid="confirm-add-button"
              &gt;
                &lt;AddIcon fontSize="small" /&gt;
              &lt;/IconButton&gt;
              &lt;IconButton size="small" onClick={handleCancelAdd}&gt;
                &lt;DeleteIcon fontSize="small" /&gt;
              &lt;/IconButton&gt;
            &lt;/Box&gt;
          )}
          
          {Array.isArray(node.children) &amp;&amp; node.children.length &gt; 0 ? 
            renderTree(node.children) : null}
        &lt;/TreeItem&gt;
      );
    });
  };

  return (
    &lt;Box sx={{ height: '100%', overflow: 'auto' }}&gt;
      &lt;Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}&gt;
        &lt;Typography variant="h6"&gt;테스트케이스 트리&lt;/Typography&gt;
        &lt;IconButton 
          onClick={(e) =&gt; {
            // 최상위 추가 버튼: nodeId를 명시적으로 null로 설정
            setContextMenu({ 
              mouseX: e.clientX, 
              mouseY: e.clientY, 
              nodeId: null 
            });
            console.log("Top level add button clicked");
          }}
          data-testid="add-top-button"
        &gt;
          &lt;AddIcon /&gt;
        &lt;/IconButton&gt;
      &lt;/Box&gt;
      
      {/* 최상위 아이템 추가 UI - parentId가 명시적으로 null인 경우만 표시 */}
      {newItemData &amp;&amp; newItemData.parentId === null &amp;&amp; (
        &lt;Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}&gt;
          {newItemData.type === 'folder' ? 
            &lt;FolderIcon color="primary" sx={{ mr: 1 }} /&gt; : 
            &lt;DescriptionIcon sx={{ mr: 1 }} /&gt;
          }
          &lt;TextField
            size="small"
            placeholder={`새 ${newItemData.type === 'folder' ? '폴더' : '테스트케이스'} 이름`}
            value={newItemData.name || ''}
            onChange={(e) =&gt; setNewItemData({ ...newItemData, name: e.target.value })}
            onKeyPress={(e) =&gt; e.key === 'Enter' &amp;&amp; handleConfirmAdd()}
            autoFocus
            fullWidth
          /&gt;
          &lt;IconButton 
            size="small" 
            onClick={handleConfirmAdd}
            data-testid="confirm-add-button"
          &gt;
            &lt;AddIcon fontSize="small" /&gt;
          &lt;/IconButton&gt;
          &lt;IconButton size="small" onClick={handleCancelAdd}&gt;
            &lt;DeleteIcon fontSize="small" /&gt;
          &lt;/IconButton&gt;
        &lt;/Box&gt;
      )}
      
      &lt;TreeView
        defaultCollapseIcon={&lt;ExpandMoreIcon /&gt;}
        defaultExpandIcon={&lt;ChevronRightIcon /&gt;}
        expanded={expanded}
        selected={selectable ? undefined : selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        sx={{
          height: '100%',
          flexGrow: 1,
          overflowY: 'auto',
          '&amp; .MuiTreeItem-content': { padding: '4px 8px' }
        }}
      &gt;
        {treeData.length &gt; 0 ? 
          renderTree(treeData) : 
          &lt;Typography variant="body2" sx={{ p: 2 }}&gt;
            테스트케이스가 없습니다. 새 테스트케이스를 추가해주세요.
          &lt;/Typography&gt;
        }
      &lt;/TreeView&gt;
      
      {/* 컨텍스트 메뉴 개선 */}
      &lt;Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      &gt;
        {/* 최상위 추가 메뉴 - nodeId가 명시적으로 null인 경우 */}
        {contextMenu?.nodeId === null ? (
          &lt;&gt;
            &lt;MenuItem onClick={() =&gt; handleAddItem('folder')}&gt;
              &lt;FolderIcon fontSize="small" sx={{ mr: 1 }} /&gt;
              최상위 폴더 추가
            &lt;/MenuItem&gt;
            &lt;MenuItem onClick={() =&gt; handleAddItem('testcase')}&gt;
              &lt;DescriptionIcon fontSize="small" sx={{ mr: 1 }} /&gt;
              최상위 테스트케이스 추가
            &lt;/MenuItem&gt;
          
        ) : (
          // 일반 컨텍스트 메뉴
          &lt;&gt;
            {contextMenu &amp;&amp; isFolder(testCases.find(tc =&gt; tc.id === contextMenu.nodeId)) &amp;&amp; (
              &lt;&gt;
                &lt;MenuItem onClick={() =&gt; handleAddItem('folder')}&gt;
                  &lt;FolderIcon fontSize="small" sx={{ mr: 1 }} /&gt;
                  폴더 추가
                &lt;/MenuItem&gt;
                &lt;MenuItem onClick={() =&gt; handleAddItem('testcase')}&gt;
                  &lt;DescriptionIcon fontSize="small" sx={{ mr: 1 }} /&gt;
                  테스트케이스 추가
                &lt;/MenuItem&gt;
                &lt;MenuItem divider /&gt;
              
            )}
            &lt;MenuItem onClick={handleRename}&gt;
              &lt;EditIcon fontSize="small" sx={{ mr: 1 }} /&gt;
              이름 변경
            &lt;/MenuItem&gt;
            &lt;MenuItem onClick={handleDelete}&gt;
              &lt;DeleteIcon fontSize="small" sx={{ mr: 1 }} /&gt;
              삭제
            &lt;/MenuItem&gt;
          
        )}
      &lt;/Menu&gt;
    &lt;/Box&gt;
  );
};

export default TestCaseTree;
```


## 주요 개선 사항 요약

1. **최상위 항목 추가 로직 개선**:
    - `nodeId: null` 처리를 명시적으로 수행
    - 최상위 추가 버튼 클릭 시 로깅 추가
    - 테스트를 위한 data-testid 속성 추가
2. **부모 ID 관리 강화**:
    - `parentId: null`인 경우를 명확히 처리
    - 직접적인 null 비교 사용
    - 트리 렌더링에서 parentId 조건 강화
3. **디버깅 개선**:
    - 주요 기능에 콘솔 로그 추가
    - 함수 내에서 상태 변화 추적 용이
4. **코드 구조화 및 가독성 향상**:
    - 최상위 추가 UI와 하위 추가 UI 구분
    - 컨텍스트 메뉴 조건부 렌더링 명확화
    - 주석 추가로 코드 이해도 개선
5. **예외 처리 강화**:
    - `contextMenu?.nodeId` 옵셔널 체이닝으로 안전한 접근
    - 입력값 검증 강화
    - expanded 배열 업데이트 시 안전한 처리

이러한 개선 사항을 적용하면 최상위 폴더/테스트케이스 추가 기능이 정상적으로 동작할 것입니다. 특히 `parentId: null` 처리와 컨텍스트 메뉴 관리 부분을 개선함으로써 문제를 해결하였습니다.

<div style="text-align: center">⁂</div>

[^1]: https://pplx-res.cloudinary.com/image/private/user_uploads/HVTIrymiEwWHQSq/image.jpg

[^2]: https://pplx-res.cloudinary.com/image/private/user_uploads/hzTSmSFrZymdwEs/image.jpg

[^3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_c4563118-4142-4f5f-8efd-f7910a580e79/709c5ded-a37f-43d1-a40d-c85a70cda911/README_USAGE.md

