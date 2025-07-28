// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialTestExecutions, ExecutionStatus, TestResult } from '../models/testExecution.jsx';
import { calculateExecutionProgress } from '../utils/progressUtils.jsx';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

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

  // --- 인증 및 사용자 상태 관리 ---
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  const api = useCallback(async (url, options = {}) => {
    let accessToken = localStorage.getItem('accessToken');
    
    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };

    let response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        handleLogout();
        throw new Error('Session expired. Please login again.');
      }

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token.');
        }

        const { accessToken: newAccessToken } = await refreshResponse.json();
        localStorage.setItem('accessToken', newAccessToken);
        
        // Retry the original request with the new token
        fetchOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, fetchOptions);

      } catch (error) {
        handleLogout();
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }, [handleLogout]);


  const fetchUserInfo = useCallback(async () => {
    const res = await api(`${API_BASE_URL}/api/auth/me`);
    if (!res.ok) throw new Error("Failed to fetch user info");
    return await res.json();
  }, [api]);

  const handleLoginSuccess = useCallback(async (loginResult) => {
    localStorage.setItem("accessToken", loginResult.accessToken);
    localStorage.setItem("refreshToken", loginResult.refreshToken);
    try {
      const userInfo = await fetchUserInfo();
      setUser({ ...userInfo, token: loginResult.accessToken });
    } catch {
      handleLogout();
    }
    setLoadingUser(false);
  }, [fetchUserInfo, handleLogout]);

  const handleUserUpdated = useCallback((updated) => {
    setUser(prev => ({ ...prev, ...updated }));
  }, []);

  useEffect(() => {
    const oldToken = localStorage.getItem('jwtToken');
    if (oldToken) {
      localStorage.removeItem('jwtToken');
    }
    const autoLogin = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken) {
        try {
          const userInfo = await fetchUserInfo();
          setUser({ ...userInfo, token: accessToken });
        } catch (error) {
          // Access token might be expired, try to refresh
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });

              if (refreshResponse.ok) {
                const { accessToken: newAccessToken } = await refreshResponse.json();
                localStorage.setItem('accessToken', newAccessToken);
                const userInfo = await fetchUserInfo();
                setUser({ ...userInfo, token: newAccessToken });
              } else {
                handleLogout();
              }
            } catch (e) {
              handleLogout();
            }
          } else {
            handleLogout();
          }
        }
      } else if (refreshToken) {
         try {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const { accessToken: newAccessToken } = await refreshResponse.json();
              localStorage.setItem('accessToken', newAccessToken);
              const userInfo = await fetchUserInfo();
              setUser({ ...userInfo, token: newAccessToken });
            } else {
              handleLogout();
            }
          } catch (e) {
            handleLogout();
          }
      }
      setLoadingUser(false);
    };

    autoLogin();
  }, [fetchUserInfo, handleLogout]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api(`${API_BASE_URL}/api/projects`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        dispatch({ type: ActionTypes.SET_PROJECTS, payload: data });
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    if (user && !loadingUser) {
      fetchProjects();
    }
  }, [user, loadingUser, api]);

  useEffect(() => {
    const fetchTestPlans = async (projectId) => {
      try {
        dispatch({ type: ActionTypes.SET_TESTPLANS_LOADING, payload: true });
        const res = await api(`${API_BASE_URL}/api/test-plans/project/${projectId}`);
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
  }, [state.activeProject, api]);

  const fetchProjectTestCases = useCallback(async (projectId) => {
    try {
      const res = await api(`${API_BASE_URL}/api/testcases/project/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch test cases');
      const data = await res.json();
      dispatch({ type: ActionTypes.SET_TESTCASES, payload: data });
    } catch (error) {
      console.error('Error fetching test cases:', error);
    }
  }, [api]);

  // activeProject가 변경될 때 testCases도 자동으로 로드
  useEffect(() => {
    if (state.activeProject && state.activeProject.id) {
      fetchProjectTestCases(state.activeProject.id);
    } else {
      dispatch({ type: ActionTypes.SET_TESTCASES, payload: [] });
    }
  }, [state.activeProject, fetchProjectTestCases]);

  useEffect(() => {
    localStorage.setItem('testCaseManagerState', JSON.stringify(state));
  }, [state]);

  const addTestCase = async (testCase) => {
    try {
      const res = await api(`${API_BASE_URL}/api/testcases`, {
        method: "POST",
        body: JSON.stringify(testCase),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save test case');
      }
      const saved = await res.json();
      dispatch({ type: ActionTypes.ADD_TESTCASE, payload: saved });
      return saved.id;
    } catch (error) {
      console.error("Error saving test case", error);
      throw error;
    }
  };

  const updateTestCase = async (testCase) => {
    try {
      const res = await api(`${API_BASE_URL}/api/testcases/${testCase.id}`, {
        method: "PUT",
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
      const res = await api(`${API_BASE_URL}/api/testcases/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        let errorMsg = 'Failed to delete test case';
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      dispatch({ type: ActionTypes.DELETE_TESTCASE, payload: id });
    } catch (error) {
      console.error('Error deleting test case:', error);
      throw error;
    }
  };

  const addProject = async (project) => {
    const tempId = project.id || `project-${uuidv4()}`;
    const payload = { ...project, id: tempId };
    try {
      const res = await api(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
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
      const res = await api(`${API_BASE_URL}/api/projects/${project.id}`, {
        method: 'PUT',
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

  const deleteProject = async (id, force = false) => {
    try {
      const url = force 
        ? `${API_BASE_URL}/api/projects/${id}?force=true`
        : `${API_BASE_URL}/api/projects/${id}`;
      
      const res = await api(url, {
        method: 'DELETE',
      });
      if (!res.ok) {
        let errorMsg = 'Failed to delete project';
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      dispatch({ type: ActionTypes.DELETE_PROJECT, payload: id });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const fetchTestPlans = async (projectId) => {
    try {
      dispatch({ type: ActionTypes.SET_TESTPLANS_LOADING, payload: true });
      const res = await api(`${API_BASE_URL}/api/test-plans/project/${projectId}`);
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
      const res = await api(`${API_BASE_URL}/api/test-plans`, {
        method: 'POST',
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
      const res = await api(`${API_BASE_URL}/api/test-plans/${id}`, {
        method: 'DELETE',
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
    return res.json();
  };

  const fetchProjects = async () => {
    try {
      const res = await api(`${API_BASE_URL}/api/projects`);
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
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
    const res = await api(`${API_BASE_URL}/api/auth/me`, {
      method: "PUT",
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "정보 변경에 실패했습니다.");
    }
    return res.json();
  };

  const setActiveProject = (project) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_PROJECT, payload: project });
  };

  const setActiveTestPlan = (testPlan) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_TESTPLAN, payload: testPlan });
  };

  const updateTestPlan = async (testPlan) => {
    try {
      const res = await api(
        `${API_BASE_URL}/api/test-plans/${testPlan.id}`,
        {
          method: "PUT",
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
      const res = await api(`${API_BASE_URL}/api/test-executions/${id}/start`, {
        method: 'POST',
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

  const completeTestExecution = async (id) => {
      try {
        const res = await api(`${API_BASE_URL}/api/test-executions/${id}/complete`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('실행 완료 실패');
        const updated = await res.json();
        dispatch({ type: ActionTypes.UPDATE_TESTEXECUTION, payload: updated });
        return updated;
      } catch (err) {
        console.error('Error completing test execution:', err);
        throw err;
      }
    };

  const addOrUpdateTestExecution = async (execution) => {
    const payload = { ...execution };
    let res, saved;
    if (execution.id) {
      res = await api(`${API_BASE_URL}/api/test-executions/${execution.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await api(`${API_BASE_URL}/api/test-executions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    if (!res.ok) {
      const errData = await res.json();
      let errorMessage = errData.message || '저장 실패';
      if (errData.details && errData.details.result) {
        errorMessage += `
- ${errData.details.result}`;
      }
      throw new Error(errorMessage);
    }
    saved = await res.json();
    dispatch({ type: execution.id ? ActionTypes.UPDATE_TESTEXECUTION : ActionTypes.ADD_TESTEXECUTION, payload: saved });
    return saved;
  };

  const fetchTestExecutionsByTestCase = async (testCaseId) => {
    try {
      const res = await api(
        `${API_BASE_URL}/api/test-executions/by-testcase/${testCaseId}`
      );
      if (!res.ok) throw new Error("이전 실행 결과를 불러오지 못했습니다.");
      return await res.json();
    } catch (error) {
      console.error("Error fetching executions by testcase:", error);
      return [];
    }
  };

  const value = {
    ...state,
    user,
    loadingUser,
    api,
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
    fetchProjectTestCases,
    addOrUpdateTestExecution,
    fetchTestExecutionsByTestCase,
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
    completeTestExecution,
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
       return calculateExecutionProgress(execution, testPlan);
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
