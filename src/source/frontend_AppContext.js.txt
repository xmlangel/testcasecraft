// src/context/AppContext.js

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { initialTestPlans } from "../models/testPlan";
import { initialTestExecutions, ExecutionStatus, TestResult } from "../models/testExecution";

// testCases는 빈 배열로 시작 (mock 데이터 사용 X)
const initialState = {
  testCases: [],
  testPlans: initialTestPlans,
  testExecutions: initialTestExecutions,
  activeTestCase: null,
  activeTestPlan: null,
  activeTestExecution: null,
};

const ActionTypes = {
  ADD_TESTCASE: "ADD_TESTCASE",
  UPDATE_TESTCASE: "UPDATE_TESTCASE",
  DELETE_TESTCASE: "DELETE_TESTCASE",
  SET_ACTIVE_TESTCASE: "SET_ACTIVE_TESTCASE",
  ADD_TESTPLAN: "ADD_TESTPLAN",
  UPDATE_TESTPLAN: "UPDATE_TESTPLAN",
  DELETE_TESTPLAN: "DELETE_TESTPLAN",
  SET_ACTIVE_TESTPLAN: "SET_ACTIVE_TESTPLAN",
  ADD_TESTEXECUTION: "ADD_TESTEXECUTION",
  UPDATE_TESTEXECUTION: "UPDATE_TESTEXECUTION",
  DELETE_TESTEXECUTION: "DELETE_TESTEXECUTION",
  SET_ACTIVE_TESTEXECUTION: "SET_ACTIVE_TESTEXECUTION",
  START_TESTEXECUTION: "START_TESTEXECUTION",
  COMPLETE_TESTEXECUTION: "COMPLETE_TESTEXECUTION",
  UPDATE_TESTRESULT: "UPDATE_TESTRESULT",
  SET_TESTCASES: "SET_TESTCASES",
};

const getDescendantIds = (items, parentId) => {
  const result = new Set([parentId]);
  const stack = [parentId];
  while (stack.length) {
    const current = stack.pop();
    items
      .filter((item) => item.parentId === current)
      .forEach((child) => {
        if (!result.has(child.id)) {
          result.add(child.id);
          stack.push(child.id);
        }
      });
  }
  return Array.from(result);
};

function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_TESTCASES:
      return { ...state, testCases: action.payload };

    case ActionTypes.ADD_TESTCASE:
      return { ...state, testCases: [...state.testCases, action.payload] };

    case ActionTypes.UPDATE_TESTCASE:
      return {
        ...state,
        testCases: state.testCases.map((tc) =>
          tc.id === action.payload.id
            ? { ...tc, ...action.payload, updatedAt: new Date().toISOString() }
            : tc
        ),
      };

    case ActionTypes.DELETE_TESTCASE: {
      const idsToDelete = getDescendantIds(state.testCases, action.payload);
      return {
        ...state,
        testCases: state.testCases.filter((tc) => !idsToDelete.includes(tc.id)),
        testPlans: state.testPlans.map((plan) => ({
          ...plan,
          testCaseIds: plan.testCaseIds.filter((id) => !idsToDelete.includes(id)),
        })),
      };
    }

    case ActionTypes.SET_ACTIVE_TESTCASE:
      return { ...state, activeTestCase: action.payload };

    case ActionTypes.ADD_TESTPLAN:
      return { ...state, testPlans: [...state.testPlans, action.payload] };

    case ActionTypes.UPDATE_TESTPLAN:
      return {
        ...state,
        testPlans: state.testPlans.map((plan) =>
          plan.id === action.payload.id
            ? { ...plan, ...action.payload, updatedAt: new Date().toISOString() }
            : plan
        ),
      };

    case ActionTypes.DELETE_TESTPLAN:
      return {
        ...state,
        testPlans: state.testPlans.filter((plan) => plan.id !== action.payload),
        testExecutions: state.testExecutions.filter(
          (exec) => exec.testPlanId !== action.payload
        ),
      };

    case ActionTypes.SET_ACTIVE_TESTPLAN:
      return { ...state, activeTestPlan: action.payload };

    case ActionTypes.ADD_TESTEXECUTION:
      return { ...state, testExecutions: [...state.testExecutions, action.payload] };

    case ActionTypes.UPDATE_TESTEXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map((exec) =>
          exec.id === action.payload.id
            ? { ...exec, ...action.payload, updatedAt: new Date().toISOString() }
            : exec
        ),
      };

    case ActionTypes.DELETE_TESTEXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.filter((exec) => exec.id !== action.payload),
      };

    case ActionTypes.SET_ACTIVE_TESTEXECUTION:
      return { ...state, activeTestExecution: action.payload };

    case ActionTypes.START_TESTEXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map((exec) =>
          exec.id === action.payload
            ? {
                ...exec,
                status: ExecutionStatus.INPROGRESS,
                startDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : exec
        ),
      };

    case ActionTypes.COMPLETE_TESTEXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map((exec) =>
          exec.id === action.payload
            ? {
                ...exec,
                status: ExecutionStatus.COMPLETED,
                endDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : exec
        ),
      };

    case ActionTypes.UPDATE_TESTRESULT:
      return {
        ...state,
        testExecutions: state.testExecutions.map((exec) =>
          exec.id === action.payload.executionId
            ? {
                ...exec,
                results: {
                  ...exec.results,
                  [action.payload.testCaseId]: {
                    result: action.payload.result,
                    notes: action.payload.notes,
                    executedAt: new Date().toISOString(),
                  },
                },
                updatedAt: new Date().toISOString(),
              }
            : exec
        ),
      };

    default:
      return state;
  }
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 테스트케이스 DB에서 불러오기
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/testcases');
        if (!res.ok) throw new Error('Failed to fetch test cases');
        const data = await res.json();
        dispatch({ type: ActionTypes.SET_TESTCASES, payload: data });
      } catch (error) {
        console.error('테스트케이스 불러오기 실패:', error);
      }
    };
    fetchTestCases();
  }, []);

  // localStorage 연동(기존 코드 유지)
  useEffect(() => {
    localStorage.setItem("testCaseManagerState", JSON.stringify(state));
  }, [state]);

  const addTestCase = async (testCase) => {
    const tempId = testCase.id || (testCase.type === "folder" ? `folder-${uuidv4()}` : `test-${uuidv4()}`);
    const payload = { ...testCase, id: tempId };

    try {
      const res = await fetch("http://localhost:8080/api/testcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save test case");
      const saved = await res.json();
      dispatch({ type: ActionTypes.ADD_TESTCASE, payload: { ...payload, id: saved.id } });
      return saved.id;
    } catch (error) {
      console.error("테스트케이스 저장 실패:", error);
      dispatch({ type: ActionTypes.ADD_TESTCASE, payload });
      return tempId;
    }
  };

  const value = {
    ...state,
    dispatch,
    addTestCase,
    updateTestCase: async (testCase) => {
      try {
        const res = await fetch(`http://localhost:8080/api/testcases/${testCase.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testCase),
        });
        if (!res.ok) throw new Error("Failed to update test case");
        const updated = await res.json();
        dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: updated });
      } catch (error) {
        console.error("테스트케이스 업데이트 실패:", error);
        dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: testCase });
      }
    },
    deleteTestCase: (id) => {
      dispatch({ type: ActionTypes.DELETE_TESTCASE, payload: id });
    },
    setActiveTestCase: (id) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TESTCASE, payload: id });
    },
    addTestPlan: (testPlan) => {
      const id = testPlan.id || `plan-${uuidv4()}`;
      dispatch({ type: ActionTypes.ADD_TESTPLAN, payload: { ...testPlan, id } });
      return id;
    },
    updateTestPlan: (testPlan) => {
      dispatch({ type: ActionTypes.UPDATE_TESTPLAN, payload: testPlan });
    },
    deleteTestPlan: (id) => {
      dispatch({ type: ActionTypes.DELETE_TESTPLAN, payload: id });
    },
    setActiveTestPlan: (id) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TESTPLAN, payload: id });
    },
    addTestExecution: (testExecution) => {
      const id = testExecution.id || `exec-${uuidv4()}`;
      dispatch({ type: ActionTypes.ADD_TESTEXECUTION, payload: { ...testExecution, id } });
      return id;
    },
    updateTestExecution: (testExecution) => {
      dispatch({ type: ActionTypes.UPDATE_TESTEXECUTION, payload: testExecution });
    },
    deleteTestExecution: (id) => {
      dispatch({ type: ActionTypes.DELETE_TESTEXECUTION, payload: id });
    },
    setActiveTestExecution: (id) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TESTEXECUTION, payload: id });
    },
    startTestExecution: (id) => {
      dispatch({ type: ActionTypes.START_TESTEXECUTION, payload: id });
    },
    completeTestExecution: (id) => {
      dispatch({ type: ActionTypes.COMPLETE_TESTEXECUTION, payload: id });
    },
    updateTestResult: (executionId, testCaseId, result, notes) => {
      dispatch({
        type: ActionTypes.UPDATE_TESTRESULT,
        payload: { executionId, testCaseId, result, notes },
      });
    },
    getTestCase: (id) => state.testCases.find((tc) => tc.id === id),
    getTestPlan: (id) => state.testPlans.find((plan) => plan.id === id),
    getTestExecution: (id) => state.testExecutions.find((exec) => exec.id === id),
    calculateExecutionProgress: (executionId) => {
      const execution = state.testExecutions.find((exec) => exec.id === executionId);
      if (!execution) return 0;
      const testPlan = state.testPlans.find((plan) => plan.id === execution.testPlanId);
      if (!testPlan) return 0;
      const totalTests = testPlan.testCaseIds.length;
      if (totalTests === 0) return 0;
      const completedTests = Object.values(execution.results || {}).filter(
        (result) => result.result && result.result !== TestResult.NOTRUN
      ).length;
      return Math.round((completedTests / totalTests) * 100);
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
export default AppContext;
