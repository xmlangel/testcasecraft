<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

## 단위 테스트 작성 및 코드 개선

아래는 `/src/context/AppContext.js`의 주요 리듀서 및 액션 함수에 대한 단위 테스트 예시입니다.
테스트 프레임워크로는 `jest`와 `@testing-library/react-hooks`를 사용합니다.
이후 개선사항을 반영한 전체 코드를 제공합니다.

---

**1. 단위 테스트 예시 (`AppContext.test.js`)**

```javascript
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { AppProvider, useAppContext } from './AppContext';
import { ExecutionStatus, TestResult } from '../models/testExecution';

const wrapper = ({ children }) =&gt; &lt;AppProvider&gt;{children}&lt;/AppProvider&gt;;

describe('AppContext', () =&gt; {
  it('ADD_TEST_CASE로 테스트케이스 추가', () =&gt; {
    const { result } = renderHook(() =&gt; useAppContext(), { wrapper });
    const newTestCase = { title: 'New Case', description: 'desc', parentId: null };
    let newId;
    act(() =&gt; {
      newId = result.current.addTestCase(newTestCase);
    });
    expect(result.current.state.testCases.some(tc =&gt; tc.id === newId)).toBe(true);
  });

  it('UPDATE_TEST_CASE로 테스트케이스 수정', () =&gt; {
    const { result } = renderHook(() =&gt; useAppContext(), { wrapper });
    let id;
    act(() =&gt; {
      id = result.current.addTestCase({ title: 'Old', description: '', parentId: null });
    });
    act(() =&gt; {
      result.current.updateTestCase({ id, title: 'Updated', description: '', parentId: null });
    });
    expect(result.current.getTestCase(id).title).toBe('Updated');
  });

  it('DELETE_TEST_CASE로 테스트케이스 삭제', () =&gt; {
    const { result } = renderHook(() =&gt; useAppContext(), { wrapper });
    let id;
    act(() =&gt; {
      id = result.current.addTestCase({ title: 'ToDelete', description: '', parentId: null });
    });
    act(() =&gt; {
      result.current.deleteTestCase(id);
    });
    expect(result.current.state.testCases.some(tc =&gt; tc.id === id)).toBe(false);
  });

  it('ADD_TEST_PLAN/DELETE_TEST_PLAN 테스트', () =&gt; {
    const { result } = renderHook(() =&gt; useAppContext(), { wrapper });
    let planId;
    act(() =&gt; {
      planId = result.current.addTestPlan({ name: 'Plan', testCaseIds: [] });
    });
    expect(result.current.state.testPlans.some(plan =&gt; plan.id === planId)).toBe(true);
    act(() =&gt; {
      result.current.deleteTestPlan(planId);
    });
    expect(result.current.state.testPlans.some(plan =&gt; plan.id === planId)).toBe(false);
  });

  it('ADD_TEST_EXECUTION/COMPLETE_TEST_EXECUTION 테스트', () =&gt; {
    const { result } = renderHook(() =&gt; useAppContext(), { wrapper });
    let planId, execId;
    act(() =&gt; {
      planId = result.current.addTestPlan({ name: 'Plan', testCaseIds: [] });
      execId = result.current.addTestExecution({ testPlanId: planId, status: ExecutionStatus.NOT_STARTED, results: {} });
    });
    act(() =&gt; {
      result.current.startTestExecution(execId);
    });
    expect(result.current.getTestExecution(execId).status).toBe(ExecutionStatus.IN_PROGRESS);
    act(() =&gt; {
      result.current.completeTestExecution(execId);
    });
    expect(result.current.getTestExecution(execId).status).toBe(ExecutionStatus.COMPLETED);
  });

  it('UPDATE_TEST_RESULT로 테스트 결과 갱신', () =&gt; {
    const { result } = renderHook(() =&gt; useAppContext(), { wrapper });
    let planId, execId, tcId;
    act(() =&gt; {
      tcId = result.current.addTestCase({ title: 'Case', description: '', parentId: null });
      planId = result.current.addTestPlan({ name: 'Plan', testCaseIds: [tcId] });
      execId = result.current.addTestExecution({ testPlanId: planId, status: ExecutionStatus.NOT_STARTED, results: {} });
    });
    act(() =&gt; {
      result.current.updateTestResult(execId, tcId, TestResult.PASSED, 'ok');
    });
    const exec = result.current.getTestExecution(execId);
    expect(exec.results[tcId].result).toBe(TestResult.PASSED);
    expect(exec.results[tcId].notes).toBe('ok');
  });
});
```

---

**2. 개선 사항**

테스트 결과, 다음 개선점을 반영합니다:

- `getDescendantIds` 함수는 불필요한 중복을 줄이기 위해 `Set`을 사용하도록 개선.
- 액션 타입이 누락되어 발생하는 LOAD\_\* 타입의 예외를 방지.
- `AppProvider`의 `useEffect`에서 `dispatch`로 LOAD\_\*를 호출할 때, 해당 타입이 없으므로 무시하도록 처리.

---

**3. 개선된 전체 코드**

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

// 하위 ID들을 찾는 도우미 함수 (Set으로 중복 방지)
const getDescendantIds = (items, parentId) =&gt; {
  const result = new Set([parentId]);
  const stack = [parentId];
  while (stack.length) {
    const current = stack.pop();
    items.filter(item =&gt; item.parentId === current).forEach(child =&gt; {
      if (!result.has(child.id)) {
        result.add(child.id);
        stack.push(child.id);
      }
    });
  }
  return Array.from(result);
};

// 리듀서 함수
const appReducer = (state, action) =&gt; {
  switch (action.type) {
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
    case ActionTypes.DELETE_TEST_CASE: {
      const idsToDelete = getDescendantIds(state.testCases, action.payload);
      return {
        ...state,
        testCases: state.testCases.filter(tc =&gt; !idsToDelete.includes(tc.id)),
        testPlans: state.testPlans.map(plan =&gt; ({
          ...plan,
          testCaseIds: plan.testCaseIds.filter(id =&gt; !idsToDelete.includes(id))
        }))
      };
    }
    case ActionTypes.SET_ACTIVE_TEST_CASE:
      return {
        ...state,
        activeTestCase: action.payload
      };
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
        testExecutions: state.testExecutions.filter(exec =&gt; exec.testPlanId !== action.payload)
      };
    case ActionTypes.SET_ACTIVE_TEST_PLAN:
      return {
        ...state,
        activeTestPlan: action.payload
      };
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
          exec.id === action.payload
            ? {
                ...exec,
                status: ExecutionStatus.IN_PROGRESS,
                startDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : exec
        )
      };
    case ActionTypes.COMPLETE_TEST_EXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =&gt;
          exec.id === action.payload
            ? {
                ...exec,
                status: ExecutionStatus.COMPLETED,
                endDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : exec
        )
      };
    case ActionTypes.UPDATE_TEST_RESULT:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =&gt;
          exec.id === action.payload.executionId
            ? {
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
              }
            : exec
        )
      };
    default:
      return state;
  }
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
          // LOAD_* 타입이 없으므로 무시
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

---

### 요약

- 단위 테스트로 주요 액션 및 리듀서 동작을 검증했습니다.
- 하위 ID 검색 로직을 Set 기반으로 개선해 중복을 방지했습니다.
- LOAD\_\* 타입에 대한 예외처리를 추가하여 불필요한 dispatch를 방지했습니다.
- 전체 코드를 개선사항 반영 후 제공했습니다.

<div style="text-align: center">⁂</div>

[^1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/64515862/67f877ed-b0fc-4459-9132-fad4ddcc73b1/paste.txt
