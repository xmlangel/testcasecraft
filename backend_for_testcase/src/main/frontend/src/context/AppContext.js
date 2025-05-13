// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialTestExecutions, ExecutionStatus, TestResult } from '../models/testExecution';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://qaspecialist.shop';

const initialState = {
  projects: [],
  activeProject: null,
  testCases: [],
  testPlans: [],
  testPlansLoading: false,
  testExecutions: initialTestExecutions,
  activeTestCase: null,
  activeTestPlan: null,
  activeTestExecution: null,
};

const ActionTypes = {
  SET_PROJECTS: 'SET_PROJECTS',
  SET_ACTIVE_PROJECT: 'SET_ACTIVE_PROJECT',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  ADD_TESTCASE: 'ADD_TESTCASE',
  UPDATE_TESTCASE: 'UPDATE_TESTCASE',
  DELETE_TESTCASE: 'DELETE_TESTCASE',
  SET_ACTIVE_TESTCASE: 'SET_ACTIVE_TESTCASE',
  ADD_TESTPLAN: 'ADD_TESTPLAN',
  UPDATE_TESTPLAN: 'UPDATE_TESTPLAN',
  DELETE_TESTPLAN: 'DELETE_TESTPLAN',
  SET_ACTIVE_TESTPLAN: 'SET_ACTIVE_TESTPLAN',
  ADD_TESTEXECUTION: 'ADD_TESTEXECUTION',
  UPDATE_TESTEXECUTION: 'UPDATE_TESTEXECUTION',
  DELETE_TESTEXECUTION: 'DELETE_TESTEXECUTION',
  SET_ACTIVE_TESTEXECUTION: 'SET_ACTIVE_TESTEXECUTION',
  START_TESTEXECUTION: 'START_TESTEXECUTION',
  COMPLETE_TESTEXECUTION: 'COMPLETE_TESTEXECUTION',
  UPDATE_TESTRESULT: 'UPDATE_TESTRESULT',
  SET_TESTCASES: 'SET_TESTCASES',
  SET_TEST_PLANS: 'SET_TEST_PLANS',
  SET_TESTPLANS_LOADING: 'SET_TESTPLANS_LOADING',
};

const getDescendantIds = (items, parentId) => {
  const result = new Set([parentId]);
  const stack = [parentId];
  while (stack.length) {
    const current = stack.pop();
    items
      .filter(item => item.parentId === current)
      .forEach(child => {
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
    case ActionTypes.SET_PROJECTS:
      return { ...state, projects: action.payload };
    case ActionTypes.SET_ACTIVE_PROJECT:
      return { ...state, activeProject: action.payload };
    case ActionTypes.ADD_PROJECT:
      return { ...state, projects: [...state.projects, action.payload] };
    case ActionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload, updatedAt: new Date().toISOString() }
            : project
        )
      };
    case ActionTypes.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        activeProject: state.activeProject && state.activeProject.id === action.payload ? null : state.activeProject
      };
    case ActionTypes.SET_TESTCASES:
      return { ...state, testCases: action.payload };
    case ActionTypes.ADD_TESTCASE:
      return { ...state, testCases: [...state.testCases, action.payload] };
    case ActionTypes.UPDATE_TESTCASE:
      return {
        ...state,
        testCases: state.testCases.map(tc =>
          tc.id === action.payload.id
            ? { ...tc, ...action.payload, updatedAt: new Date().toISOString() }
            : tc
        ),
      };
    case ActionTypes.DELETE_TESTCASE:
      const idsToDelete = getDescendantIds(state.testCases, action.payload);
      return {
        ...state,
        testCases: state.testCases.filter(tc => !idsToDelete.includes(tc.id)),
        testPlans: state.testPlans.map(plan => ({
          ...plan,
          testCaseIds: plan.testCaseIds.filter(id => !idsToDelete.includes(id)),
        })),
      };
    case ActionTypes.SET_ACTIVE_TESTCASE:
      return { ...state, activeTestCase: action.payload };
    case ActionTypes.ADD_TESTPLAN:
      return { ...state, testPlans: [...state.testPlans, action.payload] };
    case ActionTypes.UPDATE_TESTPLAN:
      return {
        ...state,
        testPlans: state.testPlans.map(plan =>
          plan.id === action.payload.id
            ? { ...plan, ...action.payload, updatedAt: new Date().toISOString() }
            : plan
        ),
      };
    case ActionTypes.DELETE_TESTPLAN:
      return {
        ...state,
        testPlans: state.testPlans.filter(plan => plan.id !== action.payload),
        testExecutions: state.testExecutions.filter(exec => exec.testPlanId !== action.payload),
      };
    case ActionTypes.SET_ACTIVE_TESTPLAN:
      return { ...state, activeTestPlan: action.payload };
    case ActionTypes.ADD_TESTEXECUTION:
      return { ...state, testExecutions: [...state.testExecutions, action.payload] };
    case ActionTypes.UPDATE_TESTEXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =>
          exec.id === action.payload.id
            ? { ...exec, ...action.payload, updatedAt: new Date().toISOString() }
            : exec
        ),
      };
    case ActionTypes.DELETE_TESTEXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.filter(exec => exec.id !== action.payload),
      };
    case ActionTypes.SET_ACTIVE_TESTEXECUTION:
      return { ...state, activeTestExecution: action.payload };
    case ActionTypes.START_TESTEXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =>
          exec.id === action.payload
            ? {
                ...exec,
                status: ExecutionStatus.INPROGRESS,
                startDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : exec
        ),
      };
    case ActionTypes.COMPLETE_TESTEXECUTION:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =>
          exec.id === action.payload
            ? {
                ...exec,
                status: ExecutionStatus.COMPLETED,
                endDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : exec
        ),
      };
    case ActionTypes.UPDATE_TESTRESULT:
      return {
        ...state,
        testExecutions: state.testExecutions.map(exec =>
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
        ),
      };
    case ActionTypes.SET_TEST_PLANS:
      return { ...state, testPlans: action.payload };
    case ActionTypes.SET_TESTPLANS_LOADING:
      return { ...state, testPlansLoading: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // --- 인증 및 사용자 상태 관리 추가 ---
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 사용자 정보 가져오기
  const fetchUserInfo = useCallback(async (token) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch user info");
    return await res.json();
  }, []);

  // 로그인 성공 처리
  const handleLoginSuccess = useCallback(async (loginResult) => {
    localStorage.setItem("jwtToken", loginResult.token);
    try {
      const userInfo = await fetchUserInfo(loginResult.token);
      setUser({ ...userInfo, token: loginResult.token });
    } catch {
      setUser(null);
      localStorage.removeItem("jwtToken");
    }
    setLoadingUser(false);
  }, [fetchUserInfo]);

  // 로그아웃
  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("jwtToken");
  }, []);

  // 사용자 정보 갱신
  const handleUserUpdated = useCallback((updated) => {
    setUser(prev => ({ ...prev, ...updated }));
  }, []);

  // 앱 시작 시 자동 로그인 처리
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setLoadingUser(false);
      return;
    }
    fetchUserInfo(token)
      .then(userInfo => {
        setUser({ ...userInfo, token });
        setLoadingUser(false);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("jwtToken");
        setLoadingUser(false);
      });
  }, [fetchUserInfo]);

  // --- 기존 프로젝트/테스트케이스/플랜/실행 관리 로직 ---
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(`${API_BASE_URL}/api/testcases`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch test cases');
        }
        const data = await res.json();
        dispatch({ type: ActionTypes.SET_TESTCASES, payload: data });
      } catch (error) {
        console.error('Error fetching test cases:', error);
      }
    };

    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(`${API_BASE_URL}/api/projects`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        dispatch({ type: ActionTypes.SET_PROJECTS, payload: data });
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    if (!user || loadingUser) return; // 로그인 전에는 호출하지 않음
    fetchTestCases();
    fetchProjects();
  }, [user, loadingUser]);

  useEffect(() => {
    const fetchTestPlans = async (projectId) => {
      try {
        dispatch({ type: ActionTypes.SET_TESTPLANS_LOADING, payload: true });
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_BASE_URL}/api/test-plans/project/${projectId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        if (!res.ok) throw new Error('테스트 플랜 조회 실패');
        const data = await res.json();
        dispatch({ type: ActionTypes.SET_TEST_PLANS, payload: data });
      } catch (error) {
        console.error('테스트 플랜 조회 오류:', error);
        dispatch({ type: ActionTypes.SET_TEST_PLANS, payload: [] });
      } finally {
        dispatch({ type: ActionTypes.SET_TESTPLANS_LOADING, payload: false });
      }
    };

    if (state.activeProject && state.activeProject.id) {
      fetchTestPlans(state.activeProject.id);
    } else {
      dispatch({ type: ActionTypes.SET_TEST_PLANS, payload: [] });
    }
  }, [state.activeProject]);

  useEffect(() => {
    localStorage.setItem('testCaseManagerState', JSON.stringify(state));
  }, [state]);

  // --- 이하 기존 CRUD/유틸 함수들 ---
  const addTestCase = async (testCase) => {
    const tempId = testCase.id || (testCase.type === 'folder' ? `folder-${uuidv4()}` : `test-${uuidv4()}`);
    const payload = { ...testCase, id: tempId };
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/testcases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to save test case');
      }
      const saved = await res.json();
      dispatch({ type: ActionTypes.ADD_TESTCASE, payload: { ...payload, id: saved.id } });
      return saved.id;
    } catch (error) {
      console.error('Error saving test case:', error);
      dispatch({ type: ActionTypes.ADD_TESTCASE, payload });
      return tempId;
    }
  };

  const updateTestCase = async (testCase) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/testcases/${testCase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(testCase),
      });
      if (!res.ok) {
        throw new Error("Failed to update test case");
      }
      const updated = await res.json();
      dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: updated });
    } catch (error) {
      console.error("Error updating test case:", error);
      dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: testCase });
    }
  };

  const deleteTestCase = async (id) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/testcases/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to delete test case');
      }
      dispatch({ type: ActionTypes.DELETE_TESTCASE, payload: id });
    } catch (error) {
      console.error('Error deleting test case:', error);
      dispatch({ type: ActionTypes.DELETE_TESTCASE, payload: id });
    }
  };

  const addProject = async (project) => {
    const tempId = project.id || `project-${uuidv4()}`;
    const payload = { ...project, id: tempId };
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to save project');
      }
      const saved = await res.json();
      dispatch({ type: ActionTypes.ADD_PROJECT, payload: { ...payload, id: saved.id } });
      return saved.id;
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const updateProject = async (project) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(project),
      });
      if (!res.ok) {
        throw new Error('Failed to update project');
      }
      const updated = await res.json();
      dispatch({ type: ActionTypes.UPDATE_PROJECT, payload: updated });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to delete project');
      }
      dispatch({ type: ActionTypes.DELETE_PROJECT, payload: id });
    } catch (error) {
      console.error('Error deleting project:', error);
      dispatch({ type: ActionTypes.DELETE_PROJECT, payload: id });
    }
  };

  const fetchTestPlans = async (projectId) => {
    try {
      dispatch({ type: ActionTypes.SET_TESTPLANS_LOADING, payload: true });
      const token = localStorage.getItem('jwtToken');
      const res = await fetch(`${API_BASE_URL}/api/test-plans/project/${projectId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      if (!res.ok) throw new Error('테스트 플랜 조회 실패');
      const data = await res.json();
      dispatch({ type: ActionTypes.SET_TEST_PLANS, payload: data });
    } catch (error) {
      console.error('테스트 플랜 조회 오류:', error);
      dispatch({ type: ActionTypes.SET_TEST_PLANS, payload: [] });
    } finally {
      dispatch({ type: ActionTypes.SET_TESTPLANS_LOADING, payload: false });
    }
  };

  const addTestPlan = async (testPlan) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const res = await fetch(`${API_BASE_URL}/api/test-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify(testPlan)
      });
      if (!res.ok) throw new Error('테스트 플랜 생성 실패');
      const saved = await res.json();
      dispatch({ type: ActionTypes.ADD_TESTPLAN, payload: saved });
      return saved.id;
    } catch (error) {
      console.error('테스트 플랜 생성 오류:', error);
      throw error;
    }
  };

  const deleteTestPlan = async (id) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/test-plans/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to delete test plan');
      }
      dispatch({ type: ActionTypes.DELETE_TESTPLAN, payload: id });
    } catch (error) {
      console.error('Error deleting test plan:', error);
      throw error;
    }
  };

  const login = async ({ username, password }) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "아이디 또는 비밀번호가 올바르지 않습니다.");
    }
    return res.json(); // { token: ... }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("jwtToken");
          window.location.reload();
          throw new Error("로그인이 필요합니다. 다시 로그인 해주세요.");
        }
        throw new Error("프로젝트 목록을 불러오지 못했습니다.");
      }
      const data = await res.json();
      dispatch({ type: ActionTypes.SET_PROJECTS, payload: data });
      return data;
    } catch (err) {
      throw err;
    }
  };

  const register = async ({ username, password, name, email }) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name, email }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "회원가입에 실패했습니다.");
    }
    return res.json();
  };

  const updateUserProfile = async ({ name, email }) => {
    const token = localStorage.getItem("jwtToken");
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "정보 변경에 실패했습니다.");
    }
    return res.json();
  };

  const setActiveProject = (id) => {
    const project = id ? state.projects.find(p => p.id === id) : null;
    dispatch({ type: ActionTypes.SET_ACTIVE_PROJECT, payload: project });
  };

  const updateTestPlan = async (testPlan) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `${API_BASE_URL}/api/test-plans/${testPlan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(testPlan),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to update test plan");
      }
      const updated = await res.json();
      dispatch({ type: ActionTypes.UPDATE_TESTPLAN, payload: updated });
    } catch (error) {
      console.error("Error updating test plan:", error);
      dispatch({ type: ActionTypes.UPDATE_TESTPLAN, payload: testPlan });
    }
  };

  const startTestExecution = async (id) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const res = await fetch(`${API_BASE_URL}/api/test-executions/${id}/start`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      if (!res.ok) throw new Error('실행 시작 실패');
      const updated = await res.json();
      dispatch({ type: ActionTypes.UPDATE_TESTEXECUTION, payload: updated });
      return updated;
    } catch (err) {
      console.error('Error starting test execution:', err);
      throw err;
    }
  };

  // --- Context value ---
  const value = {
    ...state,
    user,
    loadingUser,
    login,
    register,
    updateUserProfile,
    handleLoginSuccess,
    handleLogout,
    handleUserUpdated,
    dispatch,
    addProject,
    updateProject,
    deleteProject,
    setActiveProject,
    getProject: (id) => state.projects.find(p => p.id === id),
    addTestCase,
    deleteTestPlan,
    updateTestCase,
    deleteTestCase,
    fetchProjects,
    setActiveTestCase: (id) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TESTCASE, payload: id });
    },
    addTestPlan,
    updateTestPlan,
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
    startTestExecution,
    completeTestExecution: (id) => {
      dispatch({ type: ActionTypes.COMPLETE_TESTEXECUTION, payload: id });
    },
    updateTestResult: (executionId, testCaseId, result, notes) => {
      dispatch({
        type: ActionTypes.UPDATE_TESTRESULT,
        payload: { executionId, testCaseId, result, notes }
      });
    },
    getTestCase: (id) => state.testCases.find(tc => tc.id === id),
    getTestPlan: (id) => state.testPlans.find(plan => plan.id === id),
    getTestExecution: (id) => state.testExecutions.find(exec => exec.id === id),
    calculateExecutionProgress: (executionId) => {
      const execution = state.testExecutions.find(exec => exec.id === executionId);
      if (!execution) return 0;
      const testPlan = state.testPlans.find(plan => plan.id === execution.testPlanId);
      if (!testPlan) return 0;
      const totalTests = testPlan.testCaseIds.length;
      if (totalTests === 0) return 0;
      const completedTests = Object.values(execution.results || {})
        .filter(result => result.result && result.result !== TestResult.NOTRUN)
        .length;
      return Math.round((completedTests / totalTests) * 100);
    },
    fetchTestPlans,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export default AppContext;
