<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# React를 이용한 트리 형태의 테스트케이스 관리 툴 개발 가이드

트리 구조로 테스트케이스를 효과적으로 관리할 수 있는 테스트 관리 도구를 React로 단계별로 개발하는 방법을 상세히 설명합니다. 
이 도구는 테스트케이스 관리, 테스트 플랜 생성, 테스트 실행 및 결과 기록 기능을 모두 제공합니다.

## 1. 프로젝트 기본 구조 설정

우선 프로젝트의 폴더 및 파일 구조를 살펴보겠습니다. 이 구조는 기능별로 컴포넌트와 데이터 모델을 분리하여 관리하기 좋게 설계되었습니다.

```
/test-case-manager/
  ├── /public/
  │    ├── index.html
  │    └── favicon.ico
  ├── /src/
  │    ├── /components/
  │    │    ├── TestCaseTree.js
  │    │    ├── TestCaseForm.js
  │    │    ├── TestPlanList.js
  │    │    ├── TestPlanForm.js
  │    │    ├── TestExecutionList.js
  │    │    ├── TestExecutionForm.js
  │    │    └── TestResultForm.js
  │    ├── /models/
  │    │    ├── testCase.js
  │    │    ├── testPlan.js
  │    │    └── testExecution.js
  │    ├── /context/
  │    │    └── AppContext.js
  │    ├── /utils/
  │    │    └── treeUtils.js
  │    ├── App.js
  │    ├── index.js
  │    └── styles.css
  ├── package.json
  └── README.md
```

먼저 package.json 파일을 생성하여 필요한 의존성을 정의합니다.

```javascript
// package.json
{
  "name": "test-case-manager",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.9",
    "@mui/material": "^5.14.9",
    "@mui/x-tree-view": "^6.0.0",
    "react": "^18.2.0",
    "react-beautiful-dnd": "^13.1.1",
    "react-dom": "^18.2.0",
    "react-icons": "^4.11.0",
    "react-scripts": "5.0.1",
    "uuid": "^9.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      "&gt;0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```


## 2. 데이터 모델 정의

다음으로 애플리케이션에서 사용할 데이터 모델을 정의합니다.

### 테스트케이스 모델

```javascript
// /src/models/testCase.js
/**
 * 테스트케이스 데이터 모델
 * 폴더(테스트 그룹)와 테스트케이스를 동일한 구조로 관리
 */

// 기본 테스트케이스 객체 생성 함수
export const createTestCase = (id, name, parentId = null, type = 'testcase', description = '') =&gt; ({
  id,
  name,
  parentId,
  type, // 'folder' 또는 'testcase'
  description,
  steps: [],
  expectedResults: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// 테스트케이스 폴더(그룹) 생성 함수
export const createTestFolder = (id, name, parentId = null) =&gt; ({
  id,
  name,
  parentId,
  type: 'folder',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// 테스트 단계 객체 생성 함수
export const createTestStep = (stepNumber, description = '', expectedResult = '') =&gt; ({
  stepNumber,
  description,
  expectedResult
});

// 초기 테스트케이스 샘플 데이터
export const initialTestCases = [
  createTestFolder('folder-1', '로그인 테스트'),
  createTestCase('test-1', '유효한 자격 증명으로 로그인', 'folder-1'),
  createTestCase('test-2', '유효하지 않은 자격 증명으로 로그인', 'folder-1'),
  createTestFolder('folder-2', '사용자 관리'),
  createTestCase('test-3', '사용자 생성', 'folder-2'),
  createTestCase('test-4', '사용자 삭제', 'folder-2'),
];
```


### 테스트 플랜 모델

```javascript
// /src/models/testPlan.js
/**
 * 테스트 플랜 데이터 모델
 */

// 테스트 플랜 객체 생성 함수
export const createTestPlan = (id, name, description = '', testCaseIds = []) =&gt; ({
  id,
  name,
  description,
  testCaseIds, // 테스트 플랜에 포함된 테스트케이스 ID 배열
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// 초기 테스트 플랜 샘플 데이터
export const initialTestPlans = [
  createTestPlan('plan-1', '로그인 기능 테스트', '로그인 관련 모든 테스트케이스', ['test-1', 'test-2']),
  createTestPlan('plan-2', '사용자 관리 테스트', '사용자 CRUD 기능 테스트', ['test-3', 'test-4'])
];
```


### 테스트 실행 모델

```javascript
// /src/models/testExecution.js
/**
 * 테스트 실행 데이터 모델
 */

// 테스트 실행 상태 열거형
export const ExecutionStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

// 테스트 결과 열거형
export const TestResult = {
  NOT_RUN: 'NOT_RUN',
  PASS: 'PASS',
  FAIL: 'FAIL',
  BLOCKED: 'BLOCKED'
};

// 테스트 실행 객체 생성 함수
export const createTestExecution = (id, name, testPlanId, description = '') =&gt; ({
  id,
  name,
  testPlanId,
  description,
  status: ExecutionStatus.NOT_STARTED,
  startDate: null,
  endDate: null,
  results: {}, // { testCaseId: { result, notes } }
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// 테스트 결과 항목 생성 함수
export const createTestResult = (testCaseId, result = TestResult.NOT_RUN, notes = '') =&gt; ({
  testCaseId,
  result,
  notes,
  executedAt: result !== TestResult.NOT_RUN ? new Date().toISOString() : null
});

// 초기 테스트 실행 샘플 데이터
export const initialTestExecutions = [
  createTestExecution('exec-1', '로그인 테스트 실행 #1', 'plan-1', '첫 번째 로그인 테스트 실행')
];
```


## 3. 상태 관리 설정 (Context API)

애플리케이션의 상태를 관리하기 위한 Context API 설정입니다.

```javascript
// /src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialTestCases } from '../models/testCase';
import { initialTestPlans } from '../models/testPlan';
import { initialTestExecutions, ExecutionStatus, TestResult } from '../models/testExecution';

// 초기 상태 정의
const initialState = {
  testCases: initialTestCases,
  testPlans: initialTestPlans,
  testExecutions: initialTestExecutions,
  activeTestCase: null,
  activeTestPlan: null,
  activeTestExecution: null
};

// 액션 타입 정의
const ActionTypes = {
  // 테스트케이스 관련 액션
  ADD_TEST_CASE: 'ADD_TEST_CASE',
  UPDATE_TEST_CASE: 'UPDATE_TEST_CASE',
  DELETE_TEST_CASE: 'DELETE_TEST_CASE',
  SET_ACTIVE_TEST_CASE: 'SET_ACTIVE_TEST_CASE',
  
  // 테스트 플랜 관련 액션
  ADD_TEST_PLAN: 'ADD_TEST_PLAN',
  UPDATE_TEST_PLAN: 'UPDATE_TEST_PLAN',
  DELETE_TEST_PLAN: 'DELETE_TEST_PLAN',
  SET_ACTIVE_TEST_PLAN: 'SET_ACTIVE_TEST_PLAN',
  
  // 테스트 실행 관련 액션
  ADD_TEST_EXECUTION: 'ADD_TEST_EXECUTION',
  UPDATE_TEST_EXECUTION: 'UPDATE_TEST_EXECUTION',
  DELETE_TEST_EXECUTION: 'DELETE_TEST_EXECUTION',
  SET_ACTIVE_TEST_EXECUTION: 'SET_ACTIVE_TEST_EXECUTION',
  START_TEST_EXECUTION: 'START_TEST_EXECUTION',
  COMPLETE_TEST_EXECUTION: 'COMPLETE_TEST_EXECUTION',
  UPDATE_TEST_RESULT: 'UPDATE_TEST_RESULT'
};

// 리듀서 함수
const appReducer = (state, action) =&gt; {
  switch (action.type) {
    // 테스트케이스 관련 리듀서
    case ActionTypes.ADD_TEST_CASE:
      return {
        ...state,
        testCases: [...state.testCases, action.payload]
      };
    
    case ActionTypes.UPDATE_TEST_CASE:
      return {
        ...state,
        testCases: state.testCases.map(tc =&gt; 
          tc.id === action.payload.id ? { ...tc, ...action.payload, updatedAt: new Date().toISOString() } : tc
        )
      };
    
    case ActionTypes.DELETE_TEST_CASE:
      // ID로 테스트케이스 및 모든 하위 테스트케이스 삭제
      const idsToDelete = getDescendantIds(state.testCases, action.payload);
      return {
        ...state,
        testCases: state.testCases.filter(tc =&gt; !idsToDelete.includes(tc.id)),
        // 테스트 플랜에서도 해당 테스트케이스 ID 제거
        testPlans: state.testPlans.map(plan =&gt; ({
          ...plan,
          testCaseIds: plan.testCaseIds.filter(id =&gt; !idsToDelete.includes(id))
        }))
      };
    
    case ActionTypes.SET_ACTIVE_TEST_CASE:
      return {
        ...state,
        activeTestCase: action.payload
      };
    
    // 테스트 플랜 관련 리듀서
    case ActionTypes.ADD_TEST_PLAN:
      return {
        ...state,
        testPlans: [...state.testPlans, action.payload]
      };
    
    case ActionTypes.UPDATE_TEST_PLAN:
      return {
        ...state,
        testPlans: state.testPlans.map(plan =&gt; 
          plan.id === action.payload.id ? { ...plan, ...action.payload, updatedAt: new Date().toISOString() } : plan
        )
      };
    
    case ActionTypes.DELETE_TEST_PLAN:
      return {
        ...state,
        testPlans: state.testPlans.filter(plan =&gt; plan.id !== action.payload),
        // 해당 테스트 플랜을 참조하는 테스트 실행도 삭제
        testExecutions: state.testExecutions.filter(exec =&gt; exec.testPlanId !== action.payload)
      };
    
    case ActionTypes.SET_ACTIVE_TEST_PLAN:
      return {
        ...state,
        activeTestPlan: action.payload
      };
    
    // 테스트 실행 관련 리듀서
    case ActionTypes.ADD_TEST_EXECUTION:
      return {
        ...state,
        testExecutions: [...state.testExecutions, action.payload]
      };
    
    case ActionTypes.UPDATE_TEST_EXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =&gt; 
          exec.id === action.payload.id ? { ...exec, ...action.payload, updatedAt: new Date().toISOString() } : exec
        )
      };
    
    case ActionTypes.DELETE_TEST_EXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.filter(exec =&gt; exec.id !== action.payload)
      };
    
    case ActionTypes.SET_ACTIVE_TEST_EXECUTION:
      return {
        ...state,
        activeTestExecution: action.payload
      };
    
    case ActionTypes.START_TEST_EXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =&gt; 
          exec.id === action.payload ? 
          { 
            ...exec, 
            status: ExecutionStatus.IN_PROGRESS, 
            startDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } : exec
        )
      };
    
    case ActionTypes.COMPLETE_TEST_EXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =&gt; 
          exec.id === action.payload ? 
          { 
            ...exec, 
            status: ExecutionStatus.COMPLETED, 
            endDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } : exec
        )
      };
    
    case ActionTypes.UPDATE_TEST_RESULT:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =&gt; 
          exec.id === action.payload.executionId ? 
          { 
            ...exec, 
            results: {
              ...exec.results,
              [action.payload.testCaseId]: {
                result: action.payload.result,
                notes: action.payload.notes,
                executedAt: new Date().toISOString()
              }
            },
            updatedAt: new Date().toISOString()
          } : exec
        )
      };
    
    default:
      return state;
  }
};

// 하위 ID들을 찾는 도우미 함수
const getDescendantIds = (items, parentId) =&gt; {
  let result = [parentId];
  const children = items.filter(item =&gt; item.parentId === parentId);
  
  children.forEach(child =&gt; {
    result = [...result, ...getDescendantIds(items, child.id)];
  });
  
  return result;
};

// Context 생성
const AppContext = createContext();

// Context Provider 컴포넌트
export const AppProvider = ({ children }) =&gt; {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 로컬 스토리지에서 상태 불러오기
  useEffect(() =&gt; {
    const savedState = localStorage.getItem('testCaseManagerState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        Object.keys(parsedState).forEach(key =&gt; {
          if (key in initialState) {
            dispatch({ type: `LOAD_${key.toUpperCase()}`, payload: parsedState[key] });
          }
        });
      } catch (error) {
        console.error('Failed to parse saved state:', error);
      }
    }
  }, []);
  
  // 상태 변경 시 로컬 스토리지에 저장
  useEffect(() =&gt; {
    localStorage.setItem('testCaseManagerState', JSON.stringify(state));
  }, [state]);
  
  // 유용한 액션 생성자 함수들
  const value = {
    state,
    dispatch,
    // 테스트케이스 액션
    addTestCase: (testCase) =&gt; {
      const id = testCase.id || `test-${uuidv4()}`;
      dispatch({ 
        type: ActionTypes.ADD_TEST_CASE, 
        payload: { ...testCase, id } 
      });
      return id;
    },
    updateTestCase: (testCase) =&gt; {
      dispatch({ type: ActionTypes.UPDATE_TEST_CASE, payload: testCase });
    },
    deleteTestCase: (id) =&gt; {
      dispatch({ type: ActionTypes.DELETE_TEST_CASE, payload: id });
    },
    setActiveTestCase: (id) =&gt; {
      dispatch({ type: ActionTypes.SET_ACTIVE_TEST_CASE, payload: id });
    },
    
    // 테스트 플랜 액션
    addTestPlan: (testPlan) =&gt; {
      const id = testPlan.id || `plan-${uuidv4()}`;
      dispatch({ 
        type: ActionTypes.ADD_TEST_PLAN, 
        payload: { ...testPlan, id } 
      });
      return id;
    },
    updateTestPlan: (testPlan) =&gt; {
      dispatch({ type: ActionTypes.UPDATE_TEST_PLAN, payload: testPlan });
    },
    deleteTestPlan: (id) =&gt; {
      dispatch({ type: ActionTypes.DELETE_TEST_PLAN, payload: id });
    },
    setActiveTestPlan: (id) =&gt; {
      dispatch({ type: ActionTypes.SET_ACTIVE_TEST_PLAN, payload: id });
    },
    
    // 테스트 실행 액션
    addTestExecution: (testExecution) =&gt; {
      const id = testExecution.id || `exec-${uuidv4()}`;
      dispatch({ 
        type: ActionTypes.ADD_TEST_EXECUTION, 
        payload: { ...testExecution, id } 
      });
      return id;
    },
    updateTestExecution: (testExecution) =&gt; {
      dispatch({ type: ActionTypes.UPDATE_TEST_EXECUTION, payload: testExecution });
    },
    deleteTestExecution: (id) =&gt; {
      dispatch({ type: ActionTypes.DELETE_TEST_EXECUTION, payload: id });
    },
    setActiveTestExecution: (id) =&gt; {
      dispatch({ type: ActionTypes.SET_ACTIVE_TEST_EXECUTION, payload: id });
    },
    startTestExecution: (id) =&gt; {
      dispatch({ type: ActionTypes.START_TEST_EXECUTION, payload: id });
    },
    completeTestExecution: (id) =&gt; {
      dispatch({ type: ActionTypes.COMPLETE_TEST_EXECUTION, payload: id });
    },
    updateTestResult: (executionId, testCaseId, result, notes = '') =&gt; {
      dispatch({ 
        type: ActionTypes.UPDATE_TEST_RESULT, 
        payload: { executionId, testCaseId, result, notes } 
      });
    },
    
    // 유틸리티 함수
    getTestCase: (id) =&gt; state.testCases.find(tc =&gt; tc.id === id),
    getTestPlan: (id) =&gt; state.testPlans.find(plan =&gt; plan.id === id),
    getTestExecution: (id) =&gt; state.testExecutions.find(exec =&gt; exec.id === id),
    
    // 테스트 실행 진행률 계산
    calculateExecutionProgress: (executionId) =&gt; {
      const execution = state.testExecutions.find(exec =&gt; exec.id === executionId);
      if (!execution) return 0;
      
      const testPlan = state.testPlans.find(plan =&gt; plan.id === execution.testPlanId);
      if (!testPlan) return 0;
      
      const totalTests = testPlan.testCaseIds.length;
      if (totalTests === 0) return 0;
      
      const completedTests = Object.values(execution.results || {})
        .filter(result =&gt; result.result !== TestResult.NOT_RUN)
        .length;
      
      return Math.round((completedTests / totalTests) * 100);
    }
  };
  
  return (
    &lt;AppContext.Provider value={value}&gt;
      {children}
    &lt;/AppContext.Provider&gt;
  );
};

// 커스텀 훅
export const useAppContext = () =&gt; useContext(AppContext);

export default AppContext;
```


## 4. 유틸리티 함수 구현

트리 구조를 다루기 위한 유틸리티 함수를 구현합니다.

```javascript
// /src/utils/treeUtils.js
/**
 * 트리 구조 처리를 위한 유틸리티 함수들
 */

// 목록에서 트리 구조로 변환
export const listToTree = (items, parentId = null) =&gt; {
  return items
    .filter(item =&gt; item.parentId === parentId)
    .map(item =&gt; ({
      ...item,
      children: listToTree(items, item.id)
    }));
};

// ID를 기준으로 트리에서 아이템 찾기
export const findItemInTree = (tree, id) =&gt; {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findItemInTree(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// 폴더 아이템인지 체크
export const isFolder = (item) =&gt; {
  return item.type === 'folder';
};

// 아이템의 모든 하위 항목 ID 가져오기
export const getAllChildIds = (items, parentId) =&gt; {
  const result = [];
  const children = items.filter(item =&gt; item.parentId === parentId);
  
  children.forEach(child =&gt; {
    result.push(child.id);
    result.push(...getAllChildIds(items, child.id));
  });
  
  return result;
};

// 모든 폴더 ID 가져오기
export const getAllFolderIds = (items) =&gt; {
  return items
    .filter(item =&gt; item.type === 'folder')
    .map(item =&gt; item.id);
};

// 특정 ID의 모든 상위 폴더 ID 가져오기
export const getAncestorIds = (items, id) =&gt; {
  const result = [];
  let currentId = id;
  
  while (currentId) {
    const item = items.find(item =&gt; item.id === currentId);
    if (!item || !item.parentId) break;
    
    result.push(item.parentId);
    currentId = item.parentId;
  }
  
  return result;
};

// 간단한 트리 구조로 변환 (Material UI TreeView용)
export const prepareTreeData = (items, parentId = null) =&gt; {
  return items
    .filter(item =&gt; item.parentId === parentId)
    .map(item =&gt; ({
      id: item.id,
      name: item.name,
      type: item.type,
      children: prepareTreeData(items, item.id)
    }));
};

// 테스트 실행 진행상황 계산
export const calculateExecutionProgress = (execution, testPlan) =&gt; {
  if (!execution || !testPlan || !testPlan.testCaseIds.length) {
    return 0;
  }
  
  const totalTests = testPlan.testCaseIds.length;
  const results = execution.results || {};
  const completedTests = testPlan.testCaseIds.filter(id =&gt; 
    results[id] &amp;&amp; results[id].result !== 'NOT_RUN'
  ).length;
  
  return Math.round((completedTests / totalTests) * 100);
};
```


## 5. 테스트케이스 관련 컴포넌트 구현

먼저 테스트케이스 트리 컴포넌트를 구현합니다.

```javascript
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

const TestCaseTree = ({ onSelectTestCase, selectable = false, selectedIds = [], onSelectionChange }) =&gt; {
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
  const handleToggle = (event, nodeIds) =&gt; {
    setExpanded(nodeIds);
  };
  
  // 노드 선택 처리
  const handleSelect = (event, nodeId) =&gt; {
    setSelected(nodeId);
    const selectedTestCase = testCases.find(tc =&gt; tc.id === nodeId);
    
    if (selectable) {
      // 다중 선택 모드
      if (selectedIds.includes(nodeId)) {
        onSelectionChange(selectedIds.filter(id =&gt; id !== nodeId));
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
  const handleContextMenu = (event, nodeId) =&gt; {
    event.preventDefault();
    event.stopPropagation();
    setSelected(nodeId);
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY, nodeId });
  };
  
  // 컨텍스트 메뉴 닫기
  const handleCloseContextMenu = () =&gt; {
    setContextMenu(null);
  };
  
  // 새 항목 추가 시작
  const handleAddItem = (type) =&gt; {
    setNewItemData({
      type,
      parentId: contextMenu.nodeId
    });
    handleCloseContextMenu();
  };
  
  // 새 항목 추가 취소
  const handleCancelAdd = () =&gt; {
    setNewItemData(null);
  };
  
  // 새 항목 추가 완료
  const handleConfirmAdd = () =&gt; {
    if (newItemData &amp;&amp; newItemData.name &amp;&amp; newItemData.name.trim()) {
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
  const handleRename = () =&gt; {
    const node = testCases.find(tc =&gt; tc.id === contextMenu.nodeId);
    setRenameData({
      id: node.id,
      name: node.name
    });
    handleCloseContextMenu();
  };
  
  // 이름 변경 취소
  const handleCancelRename = () =&gt; {
    setRenameData(null);
  };
  
  // 이름 변경 완료
  const handleConfirmRename = () =&gt; {
    if (renameData &amp;&amp; renameData.name &amp;&amp; renameData.name.trim()) {
      const testCase = testCases.find(tc =&gt; tc.id === renameData.id);
      updateTestCase({
        ...testCase,
        name: renameData.name.trim()
      });
      setRenameData(null);
    }
  };
  
  // 삭제 처리
  const handleDelete = () =&gt; {
    deleteTestCase(contextMenu.nodeId);
    handleCloseContextMenu();
  };
  
  // TreeItem 렌더링 함수
  const renderTree = (nodes) =&gt; {
    return nodes.map((node) =&gt; {
      const isSelected = selectable ? selectedIds.includes(node.id) : selected === node.id;
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
          {isFolder(node) ? &lt;FolderIcon color="primary" sx={{ mr: 1 }} /&gt; : &lt;DescriptionIcon sx={{ mr: 1 }} /&gt;}
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
        &lt;TreeItem 
          key={node.id} 
          nodeId={node.id} 
          label={labelContent}
        &gt;
          {/* 새 항목 추가 폼 */}
          {newItemData &amp;&amp; newItemData.parentId === node.id &amp;&amp; (
            &lt;Box sx={{ ml: 4, mt: 1, display: 'flex', alignItems: 'center' }}&gt;
              {newItemData.type === 'folder' ? &lt;FolderIcon color="primary" sx={{ mr: 1 }} /&gt; : &lt;DescriptionIcon sx={{ mr: 1 }} /&gt;}
              &lt;TextField
                size="small"
                placeholder={`${newItemData.type === 'folder' ? '폴더' : '테스트케이스'} 이름`}
                value={newItemData.name || ''}
                onChange={(e) =&gt; setNewItemData({ ...newItemData, name: e.target.value })}
                onKeyPress={(e) =&gt; e.key === 'Enter' &amp;&amp; handleConfirmAdd()}
                autoFocus
                fullWidth
              /&gt;
              &lt;IconButton size="small" onClick={handleConfirmAdd}&gt;
                &lt;AddIcon fontSize="small" /&gt;
              &lt;/IconButton&gt;
              &lt;IconButton size="small" onClick={handleCancelAdd}&gt;
                &lt;DeleteIcon fontSize="small" /&gt;
              &lt;/IconButton&gt;
            &lt;/Box&gt;
          )}
          
          {/* 자식 노드 렌더링 */}
          {Array.isArray(node.children) &amp;&amp; node.children.length &gt; 0 ? renderTree(node.children) : null}
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
            setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, nodeId: null });
          }}
        &gt;
          &lt;AddIcon /&gt;
        &lt;/IconButton&gt;
      &lt;/Box&gt;
      
      &lt;TreeView
        defaultCollapseIcon={&lt;ExpandMoreIcon /&gt;}
        defaultExpandIcon={&lt;ChevronRightIcon /&gt;}
        expanded={expanded}
        selected={selectable ? [] : selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        sx={{ 
          height: '100%', 
          flexGrow: 1, 
          overflowY: 'auto',
          '&amp; .MuiTreeItem-content': {
            padding: '4px 8px'
          }
        }}
      &gt;
        {treeData.length &gt; 0 ? (
          renderTree(treeData)
        ) : (
          &lt;Typography variant="body2" sx={{ p: 2 }}&gt;
            테스트케이스가 없습니다. 추가 버튼을 눌러 생성하세요.
          &lt;/Typography&gt;
        )}
      &lt;/TreeView&gt;
      
      {/* 컨텍스트 메뉴 */}
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
          &lt;&gt;
            {contextMenu &amp;&amp; isFolder(testCases.find(tc =&gt; tc.id === contextMenu.nodeId)) &amp;&amp; (
              &lt;&gt;
                &lt;MenuItem onClick={() =&gt; handleAddItem('folder')}&gt;
                  &lt;FolderIcon fontSize="small" sx={{ mr: 1 }} /&gt;
                  하위 폴더 추가
                &lt;/MenuItem&gt;
                &lt;MenuItem onClick={() =&gt; handleAddItem('testcase')}&gt;
                  &lt;DescriptionIcon fontSize="small" sx={{ mr: 1 }} /&gt;
                  하위 테스트케이스 추가
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

다음으로 테스트케이스 상세 내용을 수정하기 위한 폼 컴포넌트를 구현합니다.

```javascript
// /src/components/TestCaseForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { createTestStep } from '../models/testCase';

const TestCaseForm = ({ testCaseId }) =&gt; {
  const { state, updateTestCase } = useAppContext();
  const { testCases } = state;
  
  const [testCase, setTestCase] = useState(null);
  
  // 초기 테스트케이스 데이터 로드
  useEffect(() =&gt; {
    if (testCaseId) {
      const tc = testCases.find(tc =&gt; tc.id === testCaseId);
      if (tc) {
        setTestCase({
          ...tc,
          steps: tc.steps || []
        });
      }
    }
  }, [testCaseId, testCases]);
  
  // 테스트케이스가 없으면 표시하지 않음
  if (!testCase || testCase.type !== 'testcase') {
    return (
      &lt;Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}&gt;
        &lt;Typography variant="body1" color="text.secondary"&gt;
          왼쪽 트리에서 테스트케이스를 선택하세요.
        &lt;/Typography&gt;
      &lt;/Card&gt;
    );
  }
  
  // 테스트케이스 정보 업데이트 핸들러
  const handleChange = (field) =&gt; (event) =&gt; {
    setTestCase({
      ...testCase,
      [field]: event.target.value
    });
  };
  
  // 테스트 단계 추가 핸들러
  const handleAddStep = () =&gt; {
    const newStepNumber = testCase.steps.length &gt; 0 
      ? Math.max(...testCase.steps.map(step =&gt; step.stepNumber)) + 1 
      : 1;
    
    setTestCase({
      ...testCase,
      steps: [
        ...testCase.steps,
        createTestStep(newStepNumber)
      ]
    });
  };
  
  // 테스트 단계 삭제 핸들러
  const handleDeleteStep = (stepNumber) =&gt; {
    setTestCase({
      ...testCase,
      steps: testCase.steps.filter(step =&gt; step.stepNumber !== stepNumber)
    });
  };
  
  // 테스트 단계 업데이트 핸들러
  const handleStepChange = (stepNumber, field) =&gt; (event) =&gt; {
    setTestCase({
      ...testCase,
      steps: testCase.steps.map(step =&gt; 
        step.stepNumber === stepNumber 
          ? { ...step, [field]: event.target.value } 
          : step
      )
    });
  };
  
  // 테스트케이스 저장 핸들러
  const handleSave = () =&gt; {
    updateTestCase(testCase);
  };
  
  return (
    &lt;Card sx={{ minHeight: 400 }}&gt;
      &lt;CardContent&gt;
        &lt;Typography variant="h6" gutterBottom&gt;
          테스트케이스 상세
        &lt;/Typography&gt;
        
        &lt;TextField
          label="테스트케이스 이름"
          value={testCase.name}
          onChange={handleChange('name')}
          fullWidth
          margin="normal"
          variant="outlined"
        /&gt;
        
        &lt;TextField
          label="설명"
          value={testCase.description || ''}
          onChange={handleChange('description')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        /&gt;
        
        &lt;Box sx={{ mt: 3, mb: 2 }}&gt;
          &lt;Typography variant="subtitle1" gutterBottom&gt;
            테스트 단계
          &lt;/Typography&gt;
          
          &lt;TableContainer component={Paper} variant="outlined"&gt;
            &lt;Table size="small"&gt;
              &lt;TableHead&gt;
                &lt;TableRow&gt;
                  &lt;TableCell width="10%"&gt;No.&lt;/TableCell&gt;
                  &lt;TableCell width="45%"&gt;단계 설명&lt;/TableCell&gt;
                  &lt;TableCell width="35%"&gt;기대 결과&lt;/TableCell&gt;
                  &lt;TableCell width="10%" align="center"&gt;동작&lt;/TableCell&gt;
                &lt;/TableRow&gt;
              &lt;/TableHead&gt;
              &lt;TableBody&gt;
                {testCase.steps.length === 0 ? (
                  &lt;TableRow&gt;
                    &lt;TableCell colSpan={4} align="center"&gt;
                      &lt;Typography variant="body2" color="text.secondary"&gt;
                        테스트 단계가 없습니다. 추가 버튼을 눌러 단계를 추가하세요.
                      &lt;/Typography&gt;
                    &lt;/TableCell&gt;
                  &lt;/TableRow&gt;
                ) : (
                  testCase.steps
                    .sort((a, b) =&gt; a.stepNumber - b.stepNumber)
                    .map(step =&gt; (
                      &lt;TableRow key={step.stepNumber}&gt;
                        &lt;TableCell&gt;{step.stepNumber}&lt;/TableCell&gt;
                        &lt;TableCell&gt;
                          &lt;TextField
                            value={step.description}
                            onChange={handleStepChange(step.stepNumber, 'description')}
                            fullWidth
                            size="small"
                            placeholder="단계 설명"
                            multiline
                            minRows={1}
                            maxRows={3}
                          /&gt;
                        &lt;/TableCell&gt;
                        &lt;TableCell&gt;
                          &lt;TextField
                            value={step.expectedResult}
                            onChange={handleStepChange(step.stepNumber, 'expectedResult')}
                            fullWidth
                            size="small"
                            placeholder="기대 결과"
                            multiline
                            minRows={1}
                            maxRows={3}
                          /&gt;
                        &lt;/TableCell&gt;
                        &lt;TableCell align="center"&gt;
                          &lt;IconButton 
                            size="small" 
                            color="error"
                            onClick={() =&gt; handleDeleteStep(step.stepNumber)}
                          &gt;
                            &lt;DeleteIcon fontSize="small" /&gt;
                          &lt;/IconButton&gt;
                        &lt;/TableCell&gt;
                      &lt;/TableRow&gt;
                    ))
                )}
              &lt;/TableBody&gt;
            &lt;/Table&gt;
          &lt;/TableContainer&gt;
          
          &lt;Button
            startIcon={&lt;AddIcon /&gt;}
            onClick={handleAddStep}
            sx={{ mt: 1 }}
            size="small"
          &gt;
            단계 추가
          &lt;/Button&gt;
        &lt;/Box&gt;
        
        &lt;TextField
          label="기대 결과 (전체)"
          value={testCase.expectedResults || ''}
          onChange={handleChange('expectedResults')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        /&gt;
      &lt;/CardContent&gt;
      
      &lt;CardActions&gt;
        &lt;Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
        &gt;
          저장
        &lt;/Button&gt;
      &lt;/CardActions&gt;
    &lt;/Card&gt;
  );
};

export default TestCaseForm;
```


## 6. 테스트 플랜 관련 컴포넌트 구현

테스트 플랜 목록을 보여주는 컴포넌트를 구현합니다.

```javascript
// /src/components/TestPlanList.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const TestPlanList = ({ onNewTestPlan, onEditTestPlan, onStartExecution }) =&gt; {
  const { state, deleteTestPlan } = useAppContext();
  const { testPlans, testCases } = state;
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  
  // 삭제 다이얼로그 열기
  const handleOpenDeleteDialog = (testPlanId) =&gt; {
    setPlanToDelete(testPlanId);
    setDeleteDialogOpen(true);
  };
  
  // 삭제 다이얼로그 닫기
  const handleCloseDeleteDialog = () =&gt; {
    setDeleteDialogOpen(false);
    setPlanToDelete(null);
  };
  
  // 테스트 플랜 삭제 확인
  const handleConfirmDelete = () =&gt; {
    if (planToDelete) {
      deleteTestPlan(planToDelete);
    }
    handleCloseDeleteDialog();
  };
  
  // 테스트케이스 수 계산
  const getTestCaseCount = (testPlan) =&gt; {
    return testPlan.testCaseIds.length;
  };
  
  return (
    &lt;Card sx={{ height: '100%' }}&gt;
      &lt;CardContent&gt;
        &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}&gt;
          &lt;Typography variant="h6"&gt;테스트 플랜&lt;/Typography&gt;
          &lt;Button
            variant="contained"
            size="small"
            startIcon={&lt;AddIcon /&gt;}
            onClick={onNewTestPlan}
          &gt;
            새 테스트 플랜
          &lt;/Button&gt;
        &lt;/Box&gt;
        
        {testPlans.length === 0 ? (
          &lt;Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}&gt;
            테스트 플랜이 없습니다. 새 테스트 플랜을 생성하세요.
          &lt;/Typography&gt;
        ) : (
          &lt;List sx={{ width: '100%' }}&gt;
            {testPlans.map((plan, index) =&gt; (
              &lt;React.Fragment key={plan.id}&gt;
                {index &gt; 0 &amp;&amp; &lt;Divider component="li" /&gt;}
                &lt;ListItem alignItems="flex-start"&gt;
                  &lt;ListItemText
                    primary={plan.name}
                    secondary={
                      &lt;&gt;
                        &lt;Typography variant="body2" color="text.primary" component="span"&gt;
                          테스트케이스: {getTestCaseCount(plan)}개
                        &lt;/Typography&gt;
                        <br>
                        {plan.description &amp;&amp; plan.description.length &gt; 60 
                          ? `${plan.description.substring(0, 60)}...` 
                          : plan.description}
                      
                    }
                  /&gt;
                  &lt;ListItemSecondaryAction&gt;
                    &lt;IconButton 
                      edge="end" 
                      aria-label="실행"
                      onClick={() =&gt; onStartExecution(plan.id)}
                    &gt;
                      &lt;PlayArrowIcon /&gt;
                    &lt;/IconButton&gt;
                    &lt;IconButton 
                      edge="end" 
                      aria-label="수정"
                      onClick={() =&gt; onEditTestPlan(plan.id)}
                    &gt;
                      &lt;EditIcon /&gt;
                    &lt;/IconButton&gt;
                    &lt;IconButton 
                      edge="end" 
                      aria-label="삭제"
                      onClick={() =&gt; handleOpenDeleteDialog(plan.id)}
                    &gt;
                      &lt;DeleteIcon /&gt;
                    &lt;/IconButton&gt;
                  &lt;/ListItemSecondaryAction&gt;
                &lt;/ListItem&gt;
              &lt;/React.Fragment&gt;
            ))}
          &lt;/List&gt;
        )}
      &lt;/CardContent&gt;
      
      {/* 삭제 확인 다이얼로그 */}
      &lt;Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      &gt;
        &lt;DialogTitle&gt;테스트 플랜 삭제&lt;/DialogTitle&gt;
        &lt;DialogContent&gt;
          &lt;DialogContentText&gt;
            이 테스트 플랜을 삭제하면 관련된 모든 테스트 실행 데이터도 함께 삭제됩니다.
            삭제하시겠습니까?
          &lt;/DialogContentText&gt;
        &lt;/DialogContent&gt;
        &lt;DialogActions&gt;
          &lt;Button onClick={handleCloseDeleteDialog}&gt;취소&lt;/Button&gt;
          &lt;Button onClick={handleConfirmDelete} color="error" autoFocus&gt;
            삭제
          &lt;/Button&gt;
        &lt;/DialogActions&gt;
      &lt;/Dialog&gt;
    &lt;/Card&gt;
  );
};

export default TestPlanList;
```

테스트 플랜을 만들고 수정하는 폼 컴포넌트를 구현합니다.

```javascript
// /src/components/TestPlanForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  Checkbox,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { createTestPlan } from '../models/testPlan';
import TestCaseTree from './TestCaseTree';

const TestPlanForm = ({ testPlanId, onCancel, onSave }) =&gt; {
  const { state, addTestPlan, updateTestPlan, getTestCase } = useAppContext();
  const { testCases, testPlans } = state;
  
  const [formOpen, setFormOpen] = useState(true);
  const [testPlan, setTestPlan] = useState(
    testPlanId 
      ? testPlans.find(plan =&gt; plan.id === testPlanId) 
      : createTestPlan(`plan-${uuidv4()}`, '')
  );
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState([]);
  
  // 초기 선택된 테스트케이스 설정
  useEffect(() =&gt; {
    if (testPlanId) {
      const plan = testPlans.find(p =&gt; p.id === testPlanId);
      if (plan) {
        setTestPlan(plan);
        setSelectedTestCaseIds(plan.testCaseIds || []);
      }
    }
  }, [testPlanId, testPlans]);
  
  // 폼 필드 변경 핸들러
  const handleChange = (field) =&gt; (event) =&gt; {
    setTestPlan({
      ...testPlan,
      [field]: event.target.value
    });
  };
  
  // 테스트케이스 선택 변경 핸들러
  const handleSelectionChange = (selectedIds) =&gt; {
    setSelectedTestCaseIds(selectedIds);
  };
  
  // 테스트 플랜 저장 핸들러
  const handleSave = () =&gt; {
    const updatedTestPlan = {
      ...testPlan,
      testCaseIds: selectedTestCaseIds,
      updatedAt: new Date().toISOString()
    };
    
    if (testPlanId) {
      updateTestPlan(updatedTestPlan);
    } else {
      addTestPlan(updatedTestPlan);
    }
    
    setFormOpen(false);
    if (onSave) {
      onSave();
    }
  };
  
  // 취소 핸들러
  const handleCancel = () =&gt; {
    setFormOpen(false);
    if (onCancel) {
      onCancel();
    }
  };
  
  if (!formOpen) {
    return null;
  }
  
  return (
    &lt;Dialog
      open={formOpen}
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
    &gt;
      &lt;DialogTitle&gt;
        {testPlanId ? '테스트 플랜 수정' : '새 테스트 플랜 생성'}
      &lt;/DialogTitle&gt;
      
      &lt;DialogContent&gt;
        &lt;TextField
          label="테스트 플랜 이름"
          value={testPlan.name}
          onChange={handleChange('name')}
          fullWidth
          margin="normal"
          variant="outlined"
          required
        /&gt;
        
        &lt;TextField
          label="설명"
          value={testPlan.description || ''}
          onChange={handleChange('description')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        /&gt;
        
        &lt;Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}&gt;
          테스트케이스 선택
        &lt;/Typography&gt;
        
        &lt;Grid container spacing={2} sx={{ minHeight: 400 }}&gt;
          &lt;Grid item xs={6}&gt;
            &lt;Paper variant="outlined" sx={{ height: '100%', p: 2 }}&gt;
              &lt;TestCaseTree 
                selectable={true}
                selectedIds={selectedTestCaseIds}
                onSelectionChange={handleSelectionChange}
              /&gt;
            &lt;/Paper&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={6}&gt;
            &lt;Paper variant="outlined" sx={{ height: '100%', p: 2 }}&gt;
              &lt;Typography variant="subtitle2" gutterBottom&gt;
                선택된 테스트케이스 ({selectedTestCaseIds.length})
              &lt;/Typography&gt;
              
              &lt;List sx={{ overflow: 'auto', maxHeight: 400 }}&gt;
                {selectedTestCaseIds.length === 0 ? (
                  &lt;ListItem&gt;
                    &lt;ListItemText
                      primary="선택된 테스트케이스가 없습니다."
                      secondary="왼쪽 트리에서 테스트케이스를 선택하세요."
                    /&gt;
                  &lt;/ListItem&gt;
                ) : (
                  selectedTestCaseIds.map(id =&gt; {
                    const testCase = getTestCase(id);
                    if (!testCase) return null;
                    return (
                      &lt;ListItem key={id}&gt;
                        &lt;ListItemIcon&gt;
                          &lt;Checkbox
                            edge="start"
                            checked={true}
                            onChange={() =&gt; {
                              setSelectedTestCaseIds(selectedTestCaseIds.filter(tcId =&gt; tcId !== id));
                            }}
                          /&gt;
                        &lt;/ListItemIcon&gt;
                        &lt;ListItemText
                          primary={testCase.name}
                          secondary={testCase.description ? 
                            (testCase.description.length &gt; 50 ? 
                              `${testCase.description.substring(0, 50)}...` : 
                              testCase.description) : 
                            null
                          }
                        /&gt;
                      &lt;/ListItem&gt;
                    );
                  })
                )}
              &lt;/List&gt;
            &lt;/Paper&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
      &lt;/DialogContent&gt;
      
      &lt;DialogActions&gt;
        &lt;Button onClick={handleCancel}&gt;취소&lt;/Button&gt;
        &lt;Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!testPlan.name || selectedTestCaseIds.length === 0}
        &gt;
          저장
        &lt;/Button&gt;
      &lt;/DialogActions&gt;
    &lt;/Dialog&gt;
  );
};

export default TestPlanForm;
```


## 7. 테스트 실행 관련 컴포넌트 구현

테스트 실행 목록을 보여주는 컴포넌트를 구현합니다.

```javascript
// /src/components/TestExecutionList.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { ExecutionStatus } from '../models/testExecution';

const TestExecutionList = ({ onNewExecution, onEditExecution, onViewExecution }) =&gt; {
  const { state, deleteTestExecution, getTestPlan } = useAppContext();
  const { testExecutions } = state;
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);
  
  // 삭제 다이얼로그 열기
  const handleOpenDeleteDialog = (executionId) =&gt; {
    setExecutionToDelete(executionId);
    setDeleteDialogOpen(true);
  };
  
  // 삭제 다이얼로그 닫기
  const handleCloseDeleteDialog = () =&gt; {
    setDeleteDialogOpen(false);
    setExecutionToDelete(null);
  };
  
  // 테스트 실행 삭제 확인
  const handleConfirmDelete = () =&gt; {
    if (executionToDelete) {
      deleteTestExecution(executionToDelete);
    }
    handleCloseDeleteDialog();
  };
  
  // 테스트 진행률 계산
  const calculateProgress = (execution) =&gt; {
    const testPlan = getTestPlan(execution.testPlanId);
    if (!testPlan || !testPlan.testCaseIds.length) return 0;
    
    const totalTests = testPlan.testCaseIds.length;
    const results = execution.results || {};
    const completedTests = Object.keys(results).length;
    
    return Math.round((completedTests / totalTests) * 100);
  };
  
  // 상태에 따른 칩 렌더링
  const renderStatusChip = (status) =&gt; {
    switch (status) {
      case ExecutionStatus.NOT_STARTED:
        return &lt;Chip size="small" icon={&lt;ScheduleIcon /&gt;} label="대기중" color="default" /&gt;;
      case ExecutionStatus.IN_PROGRESS:
        return &lt;Chip size="small" icon={&lt;PlayArrowIcon /&gt;} label="진행중" color="primary" /&gt;;
      case ExecutionStatus.COMPLETED:
        return &lt;Chip size="small" icon={&lt;CheckCircleIcon /&gt;} label="완료" color="success" /&gt;;
      default:
        return null;
    }
  };
  
  return (
    &lt;Card sx={{ height: '100%' }}&gt;
      &lt;CardContent&gt;
        &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}&gt;
          &lt;Typography variant="h6"&gt;테스트 실행&lt;/Typography&gt;
          &lt;Button
            variant="contained"
            size="small"
            startIcon={&lt;AddIcon /&gt;}
            onClick={onNewExecution}
          &gt;
            새 테스트 실행
          &lt;/Button&gt;
        &lt;/Box&gt;
        
        {testExecutions.length === 0 ? (
          &lt;Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}&gt;
            테스트 실행이 없습니다. 새 테스트 실행을 생성하세요.
          &lt;/Typography&gt;
        ) : (
          &lt;List sx={{ width: '100%' }}&gt;
            {testExecutions.map((execution, index) =&gt; {
              const testPlan = getTestPlan(execution.testPlanId);
              const progress = calculateProgress(execution);
              
              return (
                &lt;React.Fragment key={execution.id}&gt;
                  {index &gt; 0 &amp;&amp; &lt;Divider component="li" /&gt;}
                  &lt;ListItem 
                    alignItems="flex-start"
                    button
                    onClick={() =&gt; onViewExecution(execution.id)}
                  &gt;
                    &lt;ListItemText
                      primary={
                        &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
                          &lt;Typography variant="body1" component="span" sx={{ mr: 1 }}&gt;
                            {execution.name}
                          &lt;/Typography&gt;
                          {renderStatusChip(execution.status)}
                        &lt;/Box&gt;
                      }
                      secondary={
                        &lt;&gt;
                          &lt;Typography variant="body2" color="text.primary" component="span"&gt;
                            테스트 플랜: {testPlan ? testPlan.name : '삭제됨'}
                          &lt;/Typography&gt;
                          <br>
                          &lt;Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}&gt;
                            &lt;LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ flexGrow: 1, mr: 1 }} 
                            /&gt;
                            &lt;Typography variant="body2"&gt;{progress}%&lt;/Typography&gt;
                          &lt;/Box&gt;
                        
                      }
                    /&gt;
                    &lt;ListItemSecondaryAction&gt;
                      &lt;IconButton 
                        edge="end" 
                        aria-label="수정"
                        onClick={(e) =&gt; {
                          e.stopPropagation();
                          onEditExecution(execution.id);
                        }}
                      &gt;
                        &lt;EditIcon /&gt;
                      &lt;/IconButton&gt;
                      &lt;IconButton 
                        edge="end" 
                        aria-label="삭제"
                        onClick={(e) =&gt; {
                          e.stopPropagation();
                          handleOpenDeleteDialog(execution.id);
                        }}
                      &gt;
                        &lt;DeleteIcon /&gt;
                      &lt;/IconButton&gt;
                    &lt;/ListItemSecondaryAction&gt;
                  &lt;/ListItem&gt;
                &lt;/React.Fragment&gt;
              );
            })}
          &lt;/List&gt;
        )}
      &lt;/CardContent&gt;
      
      {/* 삭제 확인 다이얼로그 */}
      &lt;Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      &gt;
        &lt;DialogTitle&gt;테스트 실행 삭제&lt;/DialogTitle&gt;
        &lt;DialogContent&gt;
          &lt;DialogContentText&gt;
            이 테스트 실행을 삭제하면 모든 테스트 결과 데이터가 함께 삭제됩니다.
            삭제하시겠습니까?
          &lt;/DialogContentText&gt;
        &lt;/DialogContent&gt;
        &lt;DialogActions&gt;
          &lt;Button onClick={handleCloseDeleteDialog}&gt;취소&lt;/Button&gt;
          &lt;Button onClick={handleConfirmDelete} color="error" autoFocus&gt;
            삭제
          &lt;/Button&gt;
        &lt;/DialogActions&gt;
      &lt;/Dialog&gt;
    &lt;/Card&gt;
  );
};

export default TestExecutionList;
```

테스트 실행을 만들고 관리하는 폼 컴포넌트를 구현합니다.

```javascript
// /src/components/TestExecutionForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  LinearProgress,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { 
  createTestExecution, 
  ExecutionStatus, 
  TestResult 
} from '../models/testExecution';
import TestResultForm from './TestResultForm';

const TestExecutionForm = ({ executionId, onCancel, onSave }) =&gt; {
  const { 
    state, 
    addTestExecution, 
    updateTestExecution, 
    startTestExecution, 
    completeTestExecution,
    updateTestResult,
    getTestCase,
    getTestPlan
  } = useAppContext();
  const { testPlans, testExecutions, testCases } = state;
  
  const [formOpen, setFormOpen] = useState(true);
  const [execution, setExecution] = useState(
    executionId 
      ? testExecutions.find(exec =&gt; exec.id === executionId) 
      : createTestExecution(`exec-${uuidv4()}`, '', '', '')
  );
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  
  // 초기 테스트 실행 및 플랜 설정
  useEffect(() =&gt; {
    if (executionId) {
      const exec = testExecutions.find(e =&gt; e.id === executionId);
      if (exec) {
        setExecution(exec);
        const plan = testPlans.find(p =&gt; p.id === exec.testPlanId);
        setSelectedPlan(plan);
      }
    }
  }, [executionId, testExecutions, testPlans]);
  
  // 테스트 플랜 변경 시 호출
  const handlePlanChange = (event) =&gt; {
    const planId = event.target.value;
    const plan = testPlans.find(p =&gt; p.id === planId);
    setSelectedPlan(plan);
    setExecution({
      ...execution,
      testPlanId: planId,
      results: {}
    });
  };
  
  // 폼 필드 변경 핸들러
  const handleChange = (field) =&gt; (event) =&gt; {
    setExecution({
      ...execution,
      [field]: event.target.value
    });
  };
  
  // 테스트 실행 시작 핸들러
  const handleStartExecution = () =&gt; {
    if (execution.id &amp;&amp; execution.status === ExecutionStatus.NOT_STARTED) {
      startTestExecution(execution.id);
      setExecution({
        ...execution,
        status: ExecutionStatus.IN_PROGRESS,
        startDate: new Date().toISOString()
      });
    }
  };
  
  // 테스트 실행 완료 핸들러
  const handleCompleteExecution = () =&gt; {
    if (execution.id &amp;&amp; execution.status === ExecutionStatus.IN_PROGRESS) {
      completeTestExecution(execution.id);
      setExecution({
        ...execution,
        status: ExecutionStatus.COMPLETED,
        endDate: new Date().toISOString()
      });
    }
  };
  
  // 결과 입력 폼 열기
  const handleOpenResultForm = (testCaseId) =&gt; {
    setSelectedTestCaseId(testCaseId);
    setIsResultFormOpen(true);
  };
  
  // 결과 입력 폼 닫기
  const handleCloseResultForm = () =&gt; {
    setIsResultFormOpen(false);
    setSelectedTestCaseId(null);
  };
  
  // 테스트 결과 저장
  const handleSaveResult = (result, notes) =&gt; {
    if (execution.id &amp;&amp; selectedTestCaseId) {
      updateTestResult(execution.id, selectedTestCaseId, result, notes);
      
      setExecution({
        ...execution,
        results: {
          ...execution.results,
          [selectedTestCaseId]: {
            result,
            notes,
            executedAt: new Date().toISOString()
          }
        }
      });
    }
    handleCloseResultForm();
  };
  
  // 테스트 실행 저장 핸들러
  const handleSave = () =&gt; {
    const updatedExecution = {
      ...execution,
      updatedAt: new Date().toISOString()
    };
    
    if (executionId) {
      updateTestExecution(updatedExecution);
    } else {
      addTestExecution(updatedExecution);
    }
    
    setFormOpen(false);
    if (onSave) {
      onSave(updatedExecution.id);
    }
  };
  
  // 취소 핸들러
  const handleCancel = () =&gt; {
    setFormOpen(false);
    if (onCancel) {
      onCancel();
    }
  };
  
  // 테스트 결과 상태에 따른 아이콘 렌더링
  const renderResultIcon = (result) =&gt; {
    switch (result) {
      case TestResult.PASS:
        return &lt;CheckIcon fontSize="small" color="success" /&gt;;
      case TestResult.FAIL:
        return &lt;ClearIcon fontSize="small" color="error" /&gt;;
      case TestResult.BLOCKED:
        return &lt;StopIcon fontSize="small" color="warning" /&gt;;
      default:
        return &lt;HourglassEmptyIcon fontSize="small" color="disabled" /&gt;;
    }
  };
  
  // 진행률 계산
  const calculateProgress = () =&gt; {
    if (!selectedPlan || !selectedPlan.testCaseIds.length) return 0;
    
    const totalTests = selectedPlan.testCaseIds.length;
    const results = execution.results || {};
    const completedTests = Object.keys(results).filter(
      id =&gt; results[id].result !== TestResult.NOT_RUN
    ).length;
    
    return Math.round((completedTests / totalTests) * 100);
  };
  
  if (!formOpen) {
    return null;
  }
  
  const canEditBasicInfo = execution.status === ExecutionStatus.NOT_STARTED;
  const canStartExecution = execution.status === ExecutionStatus.NOT_STARTED &amp;&amp; execution.testPlanId;
  const canCompleteExecution = execution.status === ExecutionStatus.IN_PROGRESS;
  const canEnterResults = execution.status === ExecutionStatus.IN_PROGRESS;
  
  return (
    &lt;Dialog
      open={formOpen}
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
    &gt;
      &lt;DialogTitle&gt;
        {executionId ? '테스트 실행 상세' : '새 테스트 실행 생성'}
      &lt;/DialogTitle&gt;
      
      &lt;DialogContent&gt;
        &lt;Grid container spacing={2}&gt;
          &lt;Grid item xs={12} md={6}&gt;
            &lt;TextField
              label="테스트 실행 이름"
              value={execution.name || ''}
              onChange={handleChange('name')}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              disabled={!canEditBasicInfo}
            /&gt;
            
            &lt;FormControl fullWidth margin="normal" disabled={!canEditBasicInfo}&gt;
              &lt;InputLabel id="test-plan-select-label"&gt;테스트 플랜&lt;/InputLabel&gt;
              &lt;Select
                labelId="test-plan-select-label"
                value={execution.testPlanId || ''}
                onChange={handlePlanChange}
                label="테스트 플랜"
              &gt;
                &lt;MenuItem value=""&gt;
                  <em>선택하세요</em>
                &lt;/MenuItem&gt;
                {testPlans.map((plan) =&gt; (
                  &lt;MenuItem key={plan.id} value={plan.id}&gt;
                    {plan.name}
                  &lt;/MenuItem&gt;
                ))}
              &lt;/Select&gt;
            &lt;/FormControl&gt;
            
            &lt;TextField
              label="설명"
              value={execution.description || ''}
              onChange={handleChange('description')}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              disabled={!canEditBasicInfo}
            /&gt;
          &lt;/Grid&gt;
          
          &lt;Grid item xs={12} md={6}&gt;
            &lt;Card variant="outlined" sx={{ p: 2, height: '100%' }}&gt;
              &lt;Typography variant="subtitle1" gutterBottom&gt;
                상태 정보
              &lt;/Typography&gt;
              
              &lt;Box sx={{ mb: 2 }}&gt;
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}&gt;
                  &lt;Typography variant="body2"&gt;상태:&lt;/Typography&gt;
                  &lt;Chip 
                    size="small" 
                    label={execution.status} 
                    color={
                      execution.status === ExecutionStatus.COMPLETED 
                        ? 'success' 
                        : execution.status === ExecutionStatus.IN_PROGRESS 
                          ? 'primary' 
                          : 'default'
                    }
                  /&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}&gt;
                  &lt;Typography variant="body2"&gt;시작 일시:&lt;/Typography&gt;
                  &lt;Typography variant="body2"&gt;
                    {execution.startDate 
                      ? new Date(execution.startDate).toLocaleString() 
                      : '-'}
                  &lt;/Typography&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}&gt;
                  &lt;Typography variant="body2"&gt;종료 일시:&lt;/Typography&gt;
                  &lt;Typography variant="body2"&gt;
                    {execution.endDate 
                      ? new Date(execution.endDate).toLocaleString() 
                      : '-'}
                  &lt;/Typography&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ mt: 2 }}&gt;
                  &lt;Typography variant="body2" gutterBottom&gt;
                    진행률: {calculateProgress()}%
                  &lt;/Typography&gt;
                  &lt;LinearProgress 
                    variant="determinate" 
                    value={calculateProgress()} 
                    sx={{ height: 10, borderRadius: 5 }} 
                  /&gt;
                &lt;/Box&gt;
              &lt;/Box&gt;
              
              &lt;Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}&gt;
                &lt;Button
                  variant="contained"
                  color="primary"
                  startIcon={&lt;PlayArrowIcon /&gt;}
                  onClick={handleStartExecution}
                  disabled={!canStartExecution}
                &gt;
                  테스트 시작
                &lt;/Button&gt;
                
                &lt;Button
                  variant="contained"
                  color="success"
                  startIcon={&lt;CheckIcon /&gt;}
                  onClick={handleCompleteExecution}
                  disabled={!canCompleteExecution}
                &gt;
                  테스트 완료
                &lt;/Button&gt;
              &lt;/Box&gt;
            &lt;/Card&gt;
          &lt;/Grid&gt;
        &lt;/Grid&gt;
        
        &lt;Divider sx={{ my: 3 }} /&gt;
        
        &lt;Typography variant="subtitle1" gutterBottom&gt;
          테스트케이스 및 결과
        &lt;/Typography&gt;
        
        {selectedPlan ? (
          &lt;TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}&gt;
            &lt;Table size="small"&gt;
              &lt;TableHead&gt;
                &lt;TableRow&gt;
                  &lt;TableCell width="5%"&gt;No.&lt;/TableCell&gt;
                  &lt;TableCell width="40%"&gt;테스트케이스&lt;/TableCell&gt;
                  &lt;TableCell width="20%"&gt;결과&lt;/TableCell&gt;
                  &lt;TableCell width="25%"&gt;메모&lt;/TableCell&gt;
                  &lt;TableCell width="10%" align="center"&gt;동작&lt;/TableCell&gt;
                &lt;/TableRow&gt;
              &lt;/TableHead&gt;
              &lt;TableBody&gt;
                {selectedPlan.testCaseIds.length === 0 ? (
                  &lt;TableRow&gt;
                    &lt;TableCell colSpan={5} align="center"&gt;
                      &lt;Typography variant="body2" color="text.secondary"&gt;
                        이 테스트 플랜에는 테스트케이스가 없습니다.
                      &lt;/Typography&gt;
                    &lt;/TableCell&gt;
                  &lt;/TableRow&gt;
                ) : (
                  selectedPlan.testCaseIds.map((testCaseId, index) =&gt; {
                    const testCase = getTestCase(testCaseId);
                    if (!testCase) return null;
                    
                    const result = execution.results &amp;&amp; execution.results[testCaseId]
                      ? execution.results[testCaseId]
                      : { result: TestResult.NOT_RUN, notes: '' };
                    
                    return (
                      &lt;TableRow key={testCaseId}&gt;
                        &lt;TableCell&gt;{index + 1}&lt;/TableCell&gt;
                        &lt;TableCell&gt;{testCase.name}&lt;/TableCell&gt;
                        &lt;TableCell&gt;
                          &lt;Box sx={{ display: 'flex', alignItems: 'center' }}&gt;
                            {renderResultIcon(result.result)}
                            &lt;Typography variant="body2" sx={{ ml: 1 }}&gt;
                              {result.result}
                            &lt;/Typography&gt;
                          &lt;/Box&gt;
                        &lt;/TableCell&gt;
                        &lt;TableCell&gt;
                          &lt;Typography variant="body2" sx={{ maxHeight: 40, overflow: 'hidden' }}&gt;
                            {result.notes || '-'}
                          &lt;/Typography&gt;
                        &lt;/TableCell&gt;
                        &lt;TableCell align="center"&gt;
                          &lt;IconButton 
                            size="small" 
                            color="primary"
                            onClick={() =&gt; handleOpenResultForm(testCaseId)}
                            disabled={!canEnterResults}
                          &gt;
                            {renderResultIcon(result.result)}
                          &lt;/IconButton&gt;
                        &lt;/TableCell&gt;
                      &lt;/TableRow&gt;
                    );
                  })
                )}
              &lt;/TableBody&gt;
            &lt;/Table&gt;
          &lt;/TableContainer&gt;
        ) : (
          &lt;Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}&gt;
            테스트 플랜을 선택하세요.
          &lt;/Typography&gt;
        )}
      &lt;/DialogContent&gt;
      
      &lt;DialogActions&gt;
        &lt;Button onClick={handleCancel}&gt;닫기&lt;/Button&gt;
        {execution.status === ExecutionStatus.NOT_STARTED &amp;&amp; (
          &lt;Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={!execution.name || !execution.testPlanId}
          &gt;
            저장
          &lt;/Button&gt;
        )}
      &lt;/DialogActions&gt;
      
      {/* 테스트 결과 입력 폼 */}
      {isResultFormOpen &amp;&amp; selectedTestCaseId &amp;&amp; (
        &lt;TestResultForm 
          open={isResultFormOpen}
          testCaseId={selectedTestCaseId}
          executionId={execution.id}
          currentResult={
            execution.results &amp;&amp; execution.results[selectedTestCaseId]
              ? execution.results[selectedTestCaseId]
              : { result: TestResult.NOT_RUN, notes: '' }
          }
          onClose={handleCloseResultForm}
          onSave={handleSaveResult}
        /&gt;
      )}
    &lt;/Dialog&gt;
  );
};

export default TestExecutionForm;
```


## 8. 테스트 결과 입력 컴포넌트 구현

테스트 실행 결과를 기입할 수 있는 모달 폼을 구현합니다.

```javascript
// /src/components/TestResultForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { useAppContext } from '../context/AppContext';
import { TestResult } from '../models/testExecution';

const TestResultForm = ({ 
  open, 
  testCaseId, 
  executionId, 
  currentResult = { result: TestResult.NOT_RUN, notes: '' }, 
  onClose, 
  onSave 
}) =&gt; {
  const { getTestCase } = useAppContext();
  
  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(currentResult.result);
  const [notes, setNotes] = useState(currentResult.notes || '');
  
  // 테스트케이스 정보 로드
  useEffect(() =&gt; {
    if (testCaseId) {
      const tc = getTestCase(testCaseId);
      if (tc) {
        setTestCase(tc);
      }
    }
  }, [testCaseId, getTestCase]);
  
  // 테스트 결과 변경 핸들러
  const handleResultChange = (event) =&gt; {
    setResult(event.target.value);
  };
  
  // 메모 변경 핸들러
  const handleNotesChange = (event) =&gt; {
    setNotes(event.target.value);
  };
  
  // 저장 핸들러
  const handleSave = () =&gt; {
    onSave(result, notes);
  };
  
  if (!testCase) {
    return null;
  }
  
  return (
    &lt;Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    &gt;
      &lt;DialogTitle&gt;테스트 결과 입력&lt;/DialogTitle&gt;
      
      &lt;DialogContent&gt;
        &lt;Box sx={{ mb: 3 }}&gt;
          &lt;Typography variant="subtitle1" gutterBottom&gt;
            테스트케이스: {testCase.name}
          &lt;/Typography&gt;
          &lt;Typography variant="body2" color="text.secondary"&gt;
            {testCase.description}
          &lt;/Typography&gt;
        &lt;/Box&gt;
        
        &lt;Divider sx={{ my: 2 }} /&gt;
        
        &lt;Box sx={{ mt: 3 }}&gt;
          &lt;FormControl component="fieldset" sx={{ mb: 3 }}&gt;
            &lt;FormLabel component="legend"&gt;테스트 결과&lt;/FormLabel&gt;
            &lt;RadioGroup 
              row
              name="test-result" 
              value={result} 
              onChange={handleResultChange}
            &gt;
              &lt;FormControlLabel value={TestResult.PASS} control={&lt;Radio /&gt;} label="통과(PASS)" /&gt;
              &lt;FormControlLabel value={TestResult.FAIL} control={&lt;Radio /&gt;} label="실패(FAIL)" /&gt;
              &lt;FormControlLabel value={TestResult.BLOCKED} control={&lt;Radio /&gt;} label="차단됨(BLOCKED)" /&gt;
              &lt;FormControlLabel value={TestResult.NOT_RUN} control={&lt;Radio /&gt;} label="미실행(NOT RUN)" /&gt;
            &lt;/RadioGroup&gt;
          &lt;/FormControl&gt;
          
          &lt;TextField
            label="메모 및 특이사항"
            value={notes}
            onChange={handleNotesChange}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
          /&gt;
        &lt;/Box&gt;
        
        {testCase.steps &amp;&amp; testCase.steps.length &gt; 0 &amp;&amp; (
          &lt;Box sx={{ mt: 3 }}&gt;
            &lt;Typography variant="subtitle2" gutterBottom&gt;
              테스트 단계 (참고용)
            &lt;/Typography&gt;
            {testCase.steps.map((step, index) =&gt; (
              &lt;Box key={index} sx={{ mt: 1 }}&gt;
                &lt;Typography variant="body2" fontWeight="bold"&gt;
                  단계 {step.stepNumber}: {step.description}
                &lt;/Typography&gt;
                &lt;Typography variant="body2" color="text.secondary"&gt;
                  기대 결과: {step.expectedResult || '(없음)'}
                &lt;/Typography&gt;
              &lt;/Box&gt;
            ))}
          &lt;/Box&gt;
        )}
      &lt;/DialogContent&gt;
      
      &lt;DialogActions&gt;
        &lt;Button onClick={onClose}&gt;취소&lt;/Button&gt;
        &lt;Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
        &gt;
          저장
        &lt;/Button&gt;
      &lt;/DialogActions&gt;
    &lt;/Dialog&gt;
  );
};

export default TestResultForm;
```


## 9. 메인 애플리케이션 컴포넌트 구현

마지막으로 모든 컴포넌트를 통합하는 메인 App 컴포넌트를 구현합니다.

```javascript
// /src/App.js
import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  CssBaseline,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FormatListBulleted as TestCaseIcon,
  Assignment as TestPlanIcon,
  PlayCircle as ExecutionIcon
} from '@mui/icons-material';
import { AppProvider } from './context/AppContext';
import TestCaseTree from './components/TestCaseTree';
import TestCaseForm from './components/TestCaseForm';
import TestPlanList from './components/TestPlanList';
import TestPlanForm from './components/TestPlanForm';
import TestExecutionList from './components/TestExecutionList';
import TestExecutionForm from './components/TestExecutionForm';

const App = () =&gt; {
  const [tabIndex, setTabIndex] = useState(0);
  const [activeTestCaseId, setActiveTestCaseId] = useState(null);
  
  const [showTestPlanForm, setShowTestPlanForm] = useState(false);
  const [editingTestPlanId, setEditingTestPlanId] = useState(null);
  
  const [showTestExecutionForm, setShowTestExecutionForm] = useState(false);
  const [editingTestExecutionId, setEditingTestExecutionId] = useState(null);
  
  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) =&gt; {
    setTabIndex(newValue);
  };
  
  // 테스트케이스 선택 핸들러
  const handleSelectTestCase = (testCase) =&gt; {
    if (testCase) {
      setActiveTestCaseId(testCase.id);
    } else {
      setActiveTestCaseId(null);
    }
  };
  
  // 테스트 플랜 생성 모달 열기
  const handleNewTestPlan = () =&gt; {
    setEditingTestPlanId(null);
    setShowTestPlanForm(true);
  };
  
  // 테스트 플랜 수정 모달 열기
  const handleEditTestPlan = (testPlanId) =&gt; {
    setEditingTestPlanId(testPlanId);
    setShowTestPlanForm(true);
  };
  
  // 테스트 플랜 모달 닫기
  const handleCloseTestPlanForm = () =&gt; {
    setShowTestPlanForm(false);
    setEditingTestPlanId(null);
  };
  
  // 테스트 실행 생성 모달 열기
  const handleNewTestExecution = () =&gt; {
    setEditingTestExecutionId(null);
    setShowTestExecutionForm(true);
  };
  
  // 테스트 실행 보기/수정 모달 열기
  const handleViewTestExecution = (testExecutionId) =&gt; {
    setEditingTestExecutionId(testExecutionId);
    setShowTestExecutionForm(true);
  };
  
  // 테스트 플랜에서 테스트 실행 시작
  const handleStartExecutionFromPlan = (testPlanId) =&gt; {
    setTabIndex(2); // 테스트 실행 탭으로 이동
    setEditingTestExecutionId(null);
    setShowTestExecutionForm(true);
    // 선택된 플랜 정보는 TestExecutionForm 내부에서 처리할 예정
  };
  
  // 테스트 실행 모달 닫기
  const handleCloseTestExecutionForm = () =&gt; {
    setShowTestExecutionForm(false);
    setEditingTestExecutionId(null);
  };
  
  return (
    &lt;AppProvider&gt;
      &lt;CssBaseline /&gt;
      &lt;AppBar position="static"&gt;
        &lt;Toolbar&gt;
          &lt;Typography variant="h6" component="div" sx={{ flexGrow: 1 }}&gt;
            테스트케이스 관리 도구
          &lt;/Typography&gt;
        &lt;/Toolbar&gt;
      &lt;/AppBar&gt;
      
      &lt;Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}&gt;
        &lt;Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}&gt;
          &lt;Tab icon={&lt;TestCaseIcon /&gt;} label="테스트케이스" /&gt;
          &lt;Tab icon={&lt;TestPlanIcon /&gt;} label="테스트 플랜" /&gt;
          &lt;Tab icon={&lt;ExecutionIcon /&gt;} label="테스트 실행" /&gt;
        &lt;/Tabs&gt;
        
        {/* 테스트케이스 관리 탭 */}
        {tabIndex === 0 &amp;&amp; (
          &lt;Grid container spacing={3}&gt;
            &lt;Grid item xs={12} md={4}&gt;
              &lt;Paper sx={{ p: 2, height: 'calc(100vh - 180px)' }}&gt;
                &lt;TestCaseTree onSelectTestCase={handleSelectTestCase} /&gt;
              &lt;/Paper&gt;
            &lt;/Grid&gt;
            &lt;Grid item xs={12} md={8}&gt;
              &lt;TestCaseForm testCaseId={activeTestCaseId} /&gt;
            &lt;/Grid&gt;
          &lt;/Grid&gt;
        )}
        
        {/* 테스트 플랜 관리 탭 */}
        {tabIndex === 1 &amp;&amp; (
          &lt;Paper sx={{ p: 2, minHeight: 'calc(100vh - 180px)' }}&gt;
            &lt;TestPlanList 
              onNewTestPlan={handleNewTestPlan}
              onEditTestPlan={handleEditTestPlan}
              onStartExecution={handleStartExecutionFromPlan}
            /&gt;
            
            {showTestPlanForm &amp;&amp; (
              &lt;TestPlanForm 
                testPlanId={editingTestPlanId}
                onCancel={handleCloseTestPlanForm}
                onSave={handleCloseTestPlanForm}
              /&gt;
            )}
          &lt;/Paper&gt;
        )}
        
        {/* 테스트 실행 관리 탭 */}
        {tabIndex === 2 &amp;&amp; (
          &lt;Paper sx={{ p: 2, minHeight: 'calc(100vh - 180px)' }}&gt;
            &lt;TestExecutionList 
              onNewExecution={handleNewTestExecution}
              onEditExecution={handleViewTestExecution}
              onViewExecution={handleViewTestExecution}
            /&gt;
            
            {showTestExecutionForm &amp;&amp; (
              &lt;TestExecutionForm
                executionId={editingTestExecutionId}
                onCancel={handleCloseTestExecutionForm}
                onSave={handleCloseTestExecutionForm}
              /&gt;
            )}
          &lt;/Paper&gt;
        )}
      &lt;/Container&gt;
    &lt;/AppProvider&gt;
  );
};

export default App;
```

마지막으로 애플리케이션 진입점 파일을 작성합니다.

```javascript
// /src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  &lt;React.StrictMode&gt;
    &lt;App /&gt;
  &lt;/React.StrictMode&gt;
);
```

그리고 기본 스타일시트 파일도 작성합니다.

```css
/* /src/styles.css */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```


## 결론

이렇게 React를 이용한 트리 형태의 테스트케이스 관리 툴 개발을 완료했습니다. 이 툴은 다음과 같은 주요 기능을 제공합니다:

1. 테스트케이스를 트리 구조로 관리 (폴더 및 테스트케이스)
2. 테스트케이스 CRUD 기능 (추가, 삭제, 수정)
3. 테스트 플랜 생성 및 관리
4. 테스트 실행 생성 및 관리
5. 테스트 결과 기입 (pass/fail) 및 진행률 추적

개발한 프로젝트는 Context API를 사용한 상태 관리와 Material UI 컴포넌트를 활용하여 사용자 친화적인 인터페이스를 구현했습니다. 또한 로컬 스토리지를 통해 상태를 저장함으로써 새로고침 후에도 데이터가 유지되도록 했습니다.

이 프로젝트를 더 발전시키기 위해 추가할 수 있는 기능으로는 데이터 내보내기/가져오기, 테스트케이스 요구사항 연결, 테스트케이스 클론, 사용자 관리, 결함 추적 등이 있습니다.

## 나의 테스트 결과

새로운 테스트 케이스 추가 삭제 안됨.
새로운 테스트 케이스 폴더 추가 안됨.
<div style="text-align: center">⁂</div>


