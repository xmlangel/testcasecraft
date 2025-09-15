// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialTestExecutions, ExecutionStatus } from '../models/testExecution.jsx';
import { calculateExecutionProgress } from '../utils/progressUtils.jsx';
import { projectHelpers } from '../models/demoProjectData';
import { API_CONFIG, getDynamicApiUrl, resetRuntimeConfig } from '../utils/apiConstants.js';

let API_BASE_URL = API_CONFIG.BASE_URL;
let dynamicApiUrlPromise = null;

// 동적 API URL 가져오기 (캐싱 포함)
const getApiBaseUrl = async () => {
  if (!dynamicApiUrlPromise) {
    dynamicApiUrlPromise = getDynamicApiUrl().catch(error => {
      console.warn('동적 API URL 로드 실패, 현재 origin 사용:', error);
      const fallbackUrl = window.location.origin;
      console.log('Fallback URL:', fallbackUrl);
      return fallbackUrl;
    });
  }
  
  let url = await dynamicApiUrlPromise;
  
  // 빈 문자열이나 undefined인 경우 현재 origin 우선 사용
  if (!url || url.trim() === '') {
    url = window.location.origin;
    console.log('Empty URL, using origin:', url);
  }
  
  // localhost가 포함되어 있고 현재 페이지가 다른 도메인인 경우 강제로 현재 origin 사용
  if (url.includes('localhost') && !window.location.origin.includes('localhost')) {
    console.warn('localhost URL detected on remote server, using current origin');
    url = window.location.origin;
  }
  
  if (url !== API_BASE_URL) {
    API_BASE_URL = url;
    console.log('AppContext - 동적 API URL 적용:', API_BASE_URL);
  }
  return url;
};
const USE_DEMO_DATA = process.env.REACT_APP_USE_DEMO_DATA === 'true';

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
  jiraServerUrl: null, // JIRA 설정이 필요함
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
  SET_TEST_EXECUTIONS: 'SET_TEST_EXECUTIONS',
  SET_JIRA_SERVER_URL: 'SET_JIRA_SERVER_URL',
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
          (tc && tc.id && action.payload && action.payload.id && tc.id === action.payload.id)
            ? { ...tc, ...action.payload, updatedAt: new Date().toISOString() }
            : tc
        ).filter(tc => tc && tc.id), // undefined나 id가 없는 항목 제거
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
    case ActionTypes.SET_TEST_EXECUTIONS:
      return { ...state, testExecutions: action.payload };
    case ActionTypes.SET_JIRA_SERVER_URL:
      return { ...state, jiraServerUrl: action.payload };
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
    // 동적 API URL을 사용하여 완전한 URL 생성
    const baseUrl = await getApiBaseUrl();
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    let accessToken = localStorage.getItem('accessToken');
    
    const fetchOptions = {
      ...options,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    };

    // Content-Type이 명시적으로 설정되지 않은 경우에만 기본값 적용
    if (!options.headers || !('Content-Type' in options.headers)) {
      fetchOptions.headers['Content-Type'] = 'application/json';
    }

    // Content-Type이 undefined로 설정된 경우 완전히 제거
    if (fetchOptions.headers['Content-Type'] === undefined) {
      delete fetchOptions.headers['Content-Type'];
    }

    let response = await fetch(fullUrl, fetchOptions);

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        handleLogout();
        throw new Error('Session expired. Please login again.');
      }

      try {
        const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
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
        response = await fetch(fullUrl, fetchOptions);

      } catch (error) {
        handleLogout();
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }, [handleLogout]);


  const fetchUserInfo = useCallback(async () => {
    const baseUrl = await getApiBaseUrl();
    const res = await api(`${baseUrl}/api/auth/me`);
    if (!res.ok) throw new Error("Failed to fetch user info");
    return await res.json();
  }, [api]);

  const handleLoginSuccess = useCallback(async (loginResult) => {
    console.log('handleLoginSuccess called with:', loginResult);
    console.log('Setting accessToken:', loginResult.accessToken);
    console.log('Setting refreshToken:', loginResult.refreshToken);
    
    localStorage.setItem("accessToken", loginResult.accessToken);
    localStorage.setItem("refreshToken", loginResult.refreshToken);
    
    // 저장 후 확인
    console.log('Stored accessToken:', localStorage.getItem("accessToken"));
    console.log('Stored refreshToken:', localStorage.getItem("refreshToken"));
    
    // 로그인 응답에 사용자 정보가 포함되어 있으므로 추가 API 호출 불필요
    if (loginResult.user) {
      console.log('Setting user from login result:', loginResult.user);
      setUser({ ...loginResult.user, token: loginResult.accessToken });
    } else {
      // 만약 로그인 응답에 사용자 정보가 없다면 API로 조회
      try {
        console.log('Fetching user info after login...');
        const userInfo = await fetchUserInfo();
        console.log('Fetched user info:', userInfo);
        setUser({ ...userInfo, token: loginResult.accessToken });
      } catch (error) {
        console.error('Failed to fetch user info after login:', error);
        handleLogout();
      }
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
      try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        console.log('AutoLogin: Access token exists:', !!accessToken);
        console.log('AutoLogin: Refresh token exists:', !!refreshToken);
        console.log('AutoLogin: Access token value:', accessToken?.substring(0, 20) + '...');

        // 토큰이 없으면 바로 로딩 종료
        if (!accessToken && !refreshToken) {
          console.log('AutoLogin: No tokens available');
          setLoadingUser(false);
          return;
        }

        // 데모 토큰 체크 및 제거
        if (accessToken === 'demo-access-token' || refreshToken === 'demo-refresh-token') {
          console.log('AutoLogin: Found demo tokens, clearing localStorage');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setLoadingUser(false);
          return;
        }

        // Access Token으로 먼저 시도
        if (accessToken) {
          try {
            console.log('AutoLogin: Trying with access token...');
            const userInfo = await fetchUserInfo();
            console.log('AutoLogin: Success with access token');
            setUser({ ...userInfo, token: accessToken });
            setLoadingUser(false);
            return;
          } catch (error) {
            console.log('AutoLogin: Access token failed:', error.message);
            // Access token이 실패하면 제거
            localStorage.removeItem('accessToken');
          }
        }

        // Refresh Token으로 시도 (access token이 없거나 실패한 경우)
        if (refreshToken) {
          try {
            console.log('AutoLogin: Trying with refresh token...');
            const baseUrl = await getApiBaseUrl();
            const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            console.log('AutoLogin: Refresh response status:', refreshResponse.status);

            if (refreshResponse.ok) {
              const { accessToken: newAccessToken } = await refreshResponse.json();
              console.log('AutoLogin: Refresh token success, got new access token');
              localStorage.setItem('accessToken', newAccessToken);
              
              try {
                const userInfo = await fetchUserInfo();
                console.log('AutoLogin: User info fetched successfully');
                setUser({ ...userInfo, token: newAccessToken });
              } catch (fetchError) {
                console.error('AutoLogin: Failed to fetch user info after refresh:', fetchError);
                handleLogout();
              }
            } else {
              const errorText = await refreshResponse.text();
              console.log('AutoLogin: Refresh token invalid, status:', refreshResponse.status, 'response:', errorText);
              handleLogout();
            }
          } catch (e) {
            console.error('AutoLogin: Refresh token request failed:', e);
            handleLogout();
          }
        } else {
          console.log('AutoLogin: No refresh token available');
          handleLogout();
        }
      } catch (error) {
        console.error('AutoLogin: Unexpected error:', error);
        handleLogout();
      } finally {
        setLoadingUser(false);
      }
    };

    autoLogin();
  }, [fetchUserInfo, handleLogout]);

  // JIRA 서버 URL 가져오기
  const fetchJiraServerUrl = useCallback(async () => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/jira/server-url`);
      if (res.ok) {
        const data = await res.json();
        if (data.serverUrl) {
          dispatch({ type: ActionTypes.SET_JIRA_SERVER_URL, payload: data.serverUrl });
          console.log('JIRA 서버 URL 로드됨:', data.serverUrl);
        } else {
          console.warn('JIRA 서버 URL이 설정되지 않았습니다.');
          dispatch({ type: ActionTypes.SET_JIRA_SERVER_URL, payload: null });
        }
      } else if (res.status === 404) {
        // URL이 설정되지 않은 경우
        console.warn('JIRA 서버 URL이 설정되지 않았습니다.');
        dispatch({ type: ActionTypes.SET_JIRA_SERVER_URL, payload: null });
      } else {
        console.warn('JIRA 서버 URL을 가져올 수 없습니다.');
        dispatch({ type: ActionTypes.SET_JIRA_SERVER_URL, payload: null });
      }
    } catch (error) {
      console.warn('JIRA 서버 URL 조회 중 오류:', error);
      dispatch({ type: ActionTypes.SET_JIRA_SERVER_URL, payload: null });
    }
  }, [api]);

  // 사용자 로그인 후 JIRA 서버 URL 초기화
  useEffect(() => {
    if (user && !loadingUser && !state.jiraServerUrl) {
      fetchJiraServerUrl();
    }
  }, [user, loadingUser, state.jiraServerUrl, fetchJiraServerUrl]);

  // fetchProjects 함수를 useEffect 위에서 정의
  const fetchProjects = useCallback(async () => {
    try {
      if (USE_DEMO_DATA) {
        // 더미 데이터 반환 (실제 네트워크 호출 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 300));
        const data = projectHelpers.getAllProjects();
        dispatch({ type: ActionTypes.SET_PROJECTS, payload: data });
        return data;
      }

      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/projects`);
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          window.location.reload();
          throw new Error("로그인이 필요합니다. 다시 로그인 해주세요.");
        }
        throw new Error("프로젝트 목록을 불러오지 못했습니다.");
      }
      const projectsData = await res.json();
      console.log('[AppContext] Fetched projects data:', projectsData);
      
      // organizationId가 있는 경우 organization 객체로 변환
      const enrichedProjects = await Promise.all(
        projectsData.map(async (project) => {
          if (project.organizationId) {
            try {
              // 조직 정보 조회
              const baseUrl = await getApiBaseUrl();
              const orgRes = await api(`${baseUrl}/api/organizations/${project.organizationId}`);
              if (orgRes.ok) {
                const orgData = await orgRes.json();
                return {
                  ...project,
                  organization: {
                    id: orgData.id,
                    name: orgData.name,
                    description: orgData.description
                  }
                };
              }
            } catch (error) {
              console.warn(`조직 정보 조회 실패 (ID: ${project.organizationId}):`, error);
            }
          }
          // organizationId가 없거나 조회 실패 시 그대로 반환
          return project;
        })
      );
      
      dispatch({ type: ActionTypes.SET_PROJECTS, payload: enrichedProjects });
      console.log('[AppContext] 프로젝트 설정 완료:', enrichedProjects.length);
      return enrichedProjects;
    } catch (err) {
      throw err;
    }
  }, [api, handleLogout]);

  useEffect(() => {
    if (user && !loadingUser) {
      fetchProjects().catch((error) => {
        console.error('[AppContext] 프로젝트 페치 실패:', error);
      });
    }
  }, [user, loadingUser, fetchProjects]);

  useEffect(() => {
    const fetchTestPlans = async (projectId) => {
      try {
        dispatch({ type: ActionTypes.SET_TESTPLANS_LOADING, payload: true });
        const baseUrl = await getApiBaseUrl();
        const res = await api(`${baseUrl}/api/test-plans/project/${projectId}`);
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

    const fetchTestExecutions = async (projectId) => {
      try {
        const baseUrl = await getApiBaseUrl();
        const res = await api(`${baseUrl}/api/test-executions/by-project/${projectId}`);
        if (!res.ok) throw new Error('테스트 실행 조회 실패');
        const data = await res.json();
        dispatch({ type: ActionTypes.SET_TEST_EXECUTIONS, payload: data });
      } catch (error) {
        console.error('테스트 실행 조회 오류:', error);
        dispatch({ type: ActionTypes.SET_TEST_EXECUTIONS, payload: [] });
      }
    };

    if (state.activeProject && state.activeProject.id) {
      fetchTestPlans(state.activeProject.id);
      fetchTestExecutions(state.activeProject.id);
    } else {
      dispatch({ type: ActionTypes.SET_TEST_PLANS, payload: [] });
      dispatch({ type: ActionTypes.SET_TEST_EXECUTIONS, payload: [] });
    }
  }, [state.activeProject, api]);

  const fetchProjectTestCases = useCallback(async (projectId) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/testcases/project/${projectId}`);
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
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/testcases`, {
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

  // 서버 API 호출과 함께 상태 업데이트
  const updateTestCase = async (testCase) => {
    // 데이터 유효성 검사
    if (!testCase || !testCase.id) {
      console.error("Error updating test case: Invalid testCase data", testCase);
      return;
    }
    
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/testcases/${testCase.id}`, {
        method: "PUT",
        body: JSON.stringify(testCase),
      });
      if (!res.ok) {
        throw new Error("Failed to update test case");
      }
      const updated = await res.json();
      // 응답 데이터 유효성 검사
      if (updated && updated.data && updated.data.id) {
        dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: updated.data });
      } else {
        dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: testCase });
      }
    } catch (error) {
      console.error("Error updating test case:", error);
      dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: testCase });
    }
  };

  // 버전 복원 등 로컬 상태만 업데이트 (서버 호출 없음)
  const updateTestCaseLocal = (testCase) => {
    // 데이터 유효성 검사
    if (!testCase || !testCase.id) {
      console.error("Error updating test case locally: Invalid testCase data", testCase);
      return;
    }
    
    console.log("🔄 로컬 상태 업데이트 시작:", testCase.name);
    console.log("🔄 업데이트할 데이터:", testCase);
    
    // 객체 참조를 새로 생성하여 React 리렌더링 강제
    const updatedTestCase = {
      ...testCase,
      updatedAt: new Date().toISOString(), // 강제로 업데이트 시간 변경
      _version: Date.now() // 강제 리렌더링을 위한 버전 필드
    };
    
    dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: updatedTestCase });
    console.log("✅ 로컬 상태 업데이트 완료:", updatedTestCase.name);
  };

  const deleteTestCase = async (id) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/testcases/${id}`, {
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
    if (USE_DEMO_DATA) {
      // 더미 모드에서는 로컬 상태만 업데이트 (임시 ID 생성)
      const tempId = project.id || `project-${uuidv4()}`;
      const payload = { ...project, id: tempId };
      await new Promise(resolve => setTimeout(resolve, 200));
      dispatch({ type: ActionTypes.ADD_PROJECT, payload });
      return tempId;
    }
    
    try {
      // 새 프로젝트 생성 시에는 ID를 전송하지 않음 (백엔드에서 자동 생성)
      const { id, ...projectData } = project; // ID 필드 제거
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/projects`, {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      if (!res.ok) {
        throw new Error('Failed to save project');
      }
      const saved = await res.json();
      // 백엔드에서 생성된 실제 ID를 사용하여 상태 업데이트
      dispatch({ type: ActionTypes.ADD_PROJECT, payload: saved });
      return saved.id;
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const updateProject = async (project) => {
    if (USE_DEMO_DATA) {
      // 더미 모드에서는 로컬 상태만 업데이트
      await new Promise(resolve => setTimeout(resolve, 200));
      dispatch({ type: ActionTypes.UPDATE_PROJECT, payload: project });
      return;
    }
    
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/projects/${project.id}`, {
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
    if (USE_DEMO_DATA) {
      // 더미 모드에서는 로컬 상태만 업데이트
      await new Promise(resolve => setTimeout(resolve, 200));
      dispatch({ type: ActionTypes.DELETE_PROJECT, payload: id });
      return;
    }
    
    try {
      const baseUrl = await getApiBaseUrl();
      const url = force 
        ? `${baseUrl}/api/projects/${id}?force=true`
        : `${baseUrl}/api/projects/${id}`;
      
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
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/test-plans/project/${projectId}`);
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
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/test-plans`, {
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
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/test-plans/${id}`, {
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
    if (USE_DEMO_DATA) {
      // 더미 로그인 (실제 네트워크 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 간단한 더미 로그인 검증
      if (username === 'admin' && password === 'admin') {
        return {
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token',
          user: {
            id: 'user1',
            username: 'admin',
            name: '관리자',
            email: 'admin@demo.com',
            role: 'ADMIN'
          }
        };
      } else if (username === 'tester' && password === 'tester') {
        return {
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token',
          user: {
            id: 'user2',
            username: 'tester',
            name: '테스터',
            email: 'tester@demo.com',
            role: 'TESTER'
          }
        };
      } else {
        throw new Error("아이디 또는 비밀번호가 올바르지 않습니다. (admin/admin 또는 tester/tester 사용)");
      }
    }

    // 🔄 로그인 전 설정 강제 로드 - 방안 1 적용
    console.log('🚀 로그인 시도 - 설정 강제 재로드 시작');
    resetRuntimeConfig(); // 캐시 초기화
    
    const baseUrl = await getDynamicApiUrl(); // 강제로 다시 로드
    console.log('🔗 로그인에 사용할 API URL:', baseUrl);
    
    const loginUrl = `${baseUrl}/api/auth/login`;
    console.log('📡 로그인 요청 URL:', loginUrl);
    
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    console.log('📊 로그인 응답 상태:', res.status, res.statusText);
    
    if (!res.ok) {
      const msg = await res.text();
      console.error('❌ 로그인 실패:', msg);
      throw new Error(msg || "아이디 또는 비밀번호가 올바르지 않습니다.");
    }
    
    const result = await res.json();
    console.log('✅ 로그인 성공:', { ...result, accessToken: '[HIDDEN]', refreshToken: '[HIDDEN]' });
    return result;
  };

  const register = async ({ username, password, name, email }) => {
    const baseUrl = await getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/auth/register`, {
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
    const baseUrl = await getApiBaseUrl();
    const res = await api(`${baseUrl}/api/auth/me`, {
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
      const baseUrl = await getApiBaseUrl();
      const res = await api(
        `${baseUrl}/api/test-plans/${testPlan.id}`,
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
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/test-executions/${id}/start`, {
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
        const baseUrl = await getApiBaseUrl();
        const res = await api(`${baseUrl}/api/test-executions/${id}/complete`, {
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

  const restartTestExecution = async (id) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/test-executions/${id}/restart`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('재실행 실패');
      const updated = await res.json();
      dispatch({ type: ActionTypes.UPDATE_TESTEXECUTION, payload: updated });
      return updated;
    } catch (err) {
      console.error('Error restarting test execution:', err);
      throw err;
    }
  };

  const addOrUpdateTestExecution = async (execution) => {
    const payload = { ...execution };
    let res, saved;
    const baseUrl = await getApiBaseUrl(); // baseUrl을 함수 시작 부분에서 정의
    if (execution.id) {
      res = await api(`${baseUrl}/api/test-executions/${execution.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await api(`${baseUrl}/api/test-executions`, {
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
      const baseUrl = await getApiBaseUrl();
      const res = await api(
        `${baseUrl}/api/test-executions/by-testcase/${testCaseId}`
      );
      if (!res.ok) throw new Error("이전 실행 결과를 불러오지 못했습니다.");
      return await res.json();
    } catch (error) {
      console.error("Error fetching executions by testcase:", error);
      return [];
    }
  };

  // 대시보드 API 함수들
  const fetchRecentTestResults = async (limit = 10) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/dashboard/recent-test-results?limit=${limit}`);
      if (!res.ok) throw new Error('최근 테스트 결과를 불러오지 못했습니다.');
      return await res.json();
    } catch (error) {
      console.error('Error fetching recent test results:', error);
      throw error;
    }
  };

  const fetchRecentTestResultsByProject = async (projectId, limit = 10) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/dashboard/projects/${projectId}/recent-test-results?limit=${limit}`);
      if (!res.ok) throw new Error('프로젝트별 최근 테스트 결과를 불러오지 못했습니다.');
      return await res.json();
    } catch (error) {
      console.error('Error fetching recent test results by project:', error);
      throw error;
    }
  };

  const fetchRecentTestResultsByTestPlan = async (testPlanId, limit = 10) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/dashboard/test-plans/${testPlanId}/recent-test-results?limit=${limit}`);
      if (!res.ok) throw new Error('테스트 플랜별 최근 테스트 결과를 불러오지 못했습니다.');
      return await res.json();
    } catch (error) {
      console.error('Error fetching recent test results by test plan:', error);
      throw error;
    }
  };

  // 오픈 테스트런 담당자별 결과 조회
  const fetchOpenTestRunAssigneeResults = async (limit = 20) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/dashboard/open-test-runs/assignee-results?limit=${limit}`);
      if (!res.ok) throw new Error('오픈 테스트런 담당자별 결과를 불러오지 못했습니다.');
      return await res.json();
    } catch (error) {
      console.error('Error fetching open test run assignee results:', error);
      throw error;
    }
  };

  // 프로젝트별 오픈 테스트런 담당자별 결과 조회
  const fetchOpenTestRunAssigneeResultsByProject = async (projectId, limit = 20) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const res = await api(`${baseUrl}/api/dashboard/projects/${projectId}/open-test-runs/assignee-results?limit=${limit}`);
      if (!res.ok) throw new Error('프로젝트별 오픈 테스트런 담당자별 결과를 불러오지 못했습니다.');
      return await res.json();
    } catch (error) {
      console.error('Error fetching open test run assignee results by project:', error);
      throw error;
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
    updateTestCaseLocal,
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
    restartTestExecution,
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
    // 대시보드 API 함수들
    fetchRecentTestResults,
    fetchRecentTestResultsByProject,
    fetchRecentTestResultsByTestPlan,
    fetchOpenTestRunAssigneeResults,
    fetchOpenTestRunAssigneeResultsByProject,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export default AppContext;
