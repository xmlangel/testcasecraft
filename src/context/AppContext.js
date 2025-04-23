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
const appReducer = (state, action) => {
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
        testCases: state.testCases.map(tc => 
          tc.id === action.payload.id ? { ...tc, ...action.payload, updatedAt: new Date().toISOString() } : tc
        )
      };
    
    case ActionTypes.DELETE_TEST_CASE:
      // ID로 테스트케이스 및 모든 하위 테스트케이스 삭제
      const idsToDelete = getDescendantIds(state.testCases, action.payload);
      return {
        ...state,
        testCases: state.testCases.filter(tc => !idsToDelete.includes(tc.id)),
        // 테스트 플랜에서도 해당 테스트케이스 ID 제거
        testPlans: state.testPlans.map(plan => ({
          ...plan,
          testCaseIds: plan.testCaseIds.filter(id => !idsToDelete.includes(id))
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
        testPlans: state.testPlans.map(plan => 
          plan.id === action.payload.id ? { ...plan, ...action.payload, updatedAt: new Date().toISOString() } : plan
        )
      };
    
    case ActionTypes.DELETE_TEST_PLAN:
      return {
        ...state,
        testPlans: state.testPlans.filter(plan => plan.id !== action.payload),
        // 해당 테스트 플랜을 참조하는 테스트 실행도 삭제
        testExecutions: state.testExecutions.filter(exec => exec.testPlanId !== action.payload)
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
        testExecutions: state.testExecutions.map(exec => 
          exec.id === action.payload.id ? { ...exec, ...action.payload, updatedAt: new Date().toISOString() } : exec
        )
      };
    
    case ActionTypes.DELETE_TEST_EXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.filter(exec => exec.id !== action.payload)
      };
    
    case ActionTypes.SET_ACTIVE_TEST_EXECUTION:
      return {
        ...state,
        activeTestExecution: action.payload
      };
    
    case ActionTypes.START_TEST_EXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec => 
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
        testExecutions: state.testExecutions.map(exec => 
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
        testExecutions: state.testExecutions.map(exec => 
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
const getDescendantIds = (items, parentId) => {
  let result = [parentId];
  const children = items.filter(item => item.parentId === parentId);
  
  children.forEach(child => {
    result = [...result, ...getDescendantIds(items, child.id)];
  });
  
  return result;
};

// Context 생성
const AppContext = createContext();

// Context Provider 컴포넌트
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 로컬 스토리지에서 상태 불러오기
  useEffect(() => {
    const savedState = localStorage.getItem('testCaseManagerState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        Object.keys(parsedState).forEach(key => {
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
  useEffect(() => {
    localStorage.setItem('testCaseManagerState', JSON.stringify(state));
  }, [state]);
  
  // 유용한 액션 생성자 함수들
  const value = {
    state,
    dispatch,
    // 테스트케이스 액션
    addTestCase: (testCase) => {
      const id = testCase.id || `test-${uuidv4()}`;
      dispatch({ 
        type: ActionTypes.ADD_TEST_CASE, 
        payload: { ...testCase, id } 
      });
      return id;
    },
    updateTestCase: (testCase) => {
      dispatch({ type: ActionTypes.UPDATE_TEST_CASE, payload: testCase });
    },
    deleteTestCase: (id) => {
      dispatch({ type: ActionTypes.DELETE_TEST_CASE, payload: id });
    },
    setActiveTestCase: (id) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TEST_CASE, payload: id });
    },
    
    // 테스트 플랜 액션
    addTestPlan: (testPlan) => {
      const id = testPlan.id || `plan-${uuidv4()}`;
      dispatch({ 
        type: ActionTypes.ADD_TEST_PLAN, 
        payload: { ...testPlan, id } 
      });
      return id;
    },
    updateTestPlan: (testPlan) => {
      dispatch({ type: ActionTypes.UPDATE_TEST_PLAN, payload: testPlan });
    },
    deleteTestPlan: (id) => {
      dispatch({ type: ActionTypes.DELETE_TEST_PLAN, payload: id });
    },
    setActiveTestPlan: (id) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TEST_PLAN, payload: id });
    },
    
    // 테스트 실행 액션
    addTestExecution: (testExecution) => {
      const id = testExecution.id || `exec-${uuidv4()}`;
      dispatch({ 
        type: ActionTypes.ADD_TEST_EXECUTION, 
        payload: { ...testExecution, id } 
      });
      return id;
    },
    updateTestExecution: (testExecution) => {
      dispatch({ type: ActionTypes.UPDATE_TEST_EXECUTION, payload: testExecution });
    },
    deleteTestExecution: (id) => {
      dispatch({ type: ActionTypes.DELETE_TEST_EXECUTION, payload: id });
    },
    setActiveTestExecution: (id) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TEST_EXECUTION, payload: id });
    },
    startTestExecution: (id) => {
      dispatch({ type: ActionTypes.START_TEST_EXECUTION, payload: id });
    },
    completeTestExecution: (id) => {
      dispatch({ type: ActionTypes.COMPLETE_TEST_EXECUTION, payload: id });
    },
    updateTestResult: (executionId, testCaseId, result, notes = '') => {
      dispatch({ 
        type: ActionTypes.UPDATE_TEST_RESULT, 
        payload: { executionId, testCaseId, result, notes } 
      });
    },
    
    // 유틸리티 함수
    getTestCase: (id) => state.testCases.find(tc => tc.id === id),
    getTestPlan: (id) => state.testPlans.find(plan => plan.id === id),
    getTestExecution: (id) => state.testExecutions.find(exec => exec.id === id),
    
    // 테스트 실행 진행률 계산
    calculateExecutionProgress: (executionId) => {
      const execution = state.testExecutions.find(exec => exec.id === executionId);
      if (!execution) return 0;
      
      const testPlan = state.testPlans.find(plan => plan.id === execution.testPlanId);
      if (!testPlan) return 0;
      
      const totalTests = testPlan.testCaseIds.length;
      if (totalTests === 0) return 0;
      
      const completedTests = Object.values(execution.results || {})
        .filter(result => result.result !== TestResult.NOT_RUN)
        .length;
      
      return Math.round((completedTests / totalTests) * 100);
    }
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// 커스텀 훅
export const useAppContext = () => useContext(AppContext);

export default AppContext;
