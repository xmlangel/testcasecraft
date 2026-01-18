// src/context/TestContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { initialTestExecutions, ExecutionStatus } from '../models/testExecution.jsx';
import { calculateExecutionProgress as calcProgress } from '../utils/progressUtils.jsx';
import { debugLog } from '../utils/logger.js';

const TestContext = createContext();

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

export const TestProvider = ({ children }) => {
    const { api, getApiBaseUrl } = useAuth();
    const { activeProject } = useProject();

    const [testCases, setTestCases] = useState([]);
    const [testPlans, setTestPlans] = useState([]);
    const [testExecutions, setTestExecutions] = useState(initialTestExecutions);

    const [activeTestCase, setActiveTestCase] = useState(null);
    const [activeTestPlan, setActiveTestPlan] = useState(null);
    const [activeTestExecution, setActiveTestExecution] = useState(null);

    const [testCasesLoading, setTestCasesLoading] = useState(false);
    const [testPlansLoading, setTestPlansLoading] = useState(false);

    // Promise Refs to prevent duplicate fetches
    const testCasesPromiseRef = useRef({});
    const testPlansPromiseRef = useRef({});
    const testExecutionsPromiseRef = useRef({});

    // --- Test Cases ---

    const fetchProjectTestCases = useCallback(async (projectId) => {
        if (!projectId) return;

        if (testCasesPromiseRef.current[projectId]) {
            return testCasesPromiseRef.current[projectId];
        }

        const promise = (async () => {
            try {
                setTestCasesLoading(true);
                debugLog('TestContext', 'fetchProjectTestCases 시작 - 프로젝트 ID:', projectId);
                const baseUrl = await getApiBaseUrl();
                const res = await api(`${baseUrl}/api/testcases/project/${projectId}`);
                if (!res.ok) throw new Error('Failed to fetch test cases');
                const data = await res.json();
                debugLog('TestContext', 'fetchProjectTestCases 완료 - 프로젝트 ID:', projectId, ', 테스트케이스 수:', data.length);
                setTestCases(data);
                return data;
            } catch (error) {
                console.error('fetchProjectTestCases Error:', error);
                throw error;
            } finally {
                setTestCasesLoading(false);
                delete testCasesPromiseRef.current[projectId];
            }
        })();

        testCasesPromiseRef.current[projectId] = promise;
        return promise;
    }, [api, getApiBaseUrl]);

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
            setTestCases(prev => [...prev, saved]);
            return saved;
        } catch (error) {
            console.error("Error saving test case", error);
            throw error;
        }
    };

    const updateTestCase = async (testCase) => {
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
                const errorData = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(errorData.message || errorData.error || `Failed to update test case (${res.status})`);
            }
            const updated = await res.json();
            const payload = (updated && updated.data && updated.data.id) ? updated.data : testCase;

            setTestCases(prev => prev.map(tc =>
                (tc.id === payload.id) ? { ...tc, ...payload, updatedAt: new Date().toISOString() } : tc
            ));
        } catch (error) {
            console.error("Error updating test case:", error);
            // Optimistic update fallback or just ignore? Original code dispatched anyway on error?
            // Original code: dispatch({ type: ActionTypes.UPDATE_TESTCASE, payload: testCase }); in catch block
            setTestCases(prev => prev.map(tc =>
                (tc.id === testCase.id) ? { ...tc, ...testCase, updatedAt: new Date().toISOString() } : tc
            ));
        }
    };

    const updateTestCaseLocal = (testCase) => {
        if (!testCase || !testCase.id) return;
        const updatedTestCase = {
            ...testCase,
            updatedAt: new Date().toISOString(),
            _version: Date.now()
        };
        setTestCases(prev => prev.map(tc =>
            (tc.id === updatedTestCase.id) ? updatedTestCase : tc
        ));
    };

    const deleteTestCase = async (id) => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/testcases/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                if (res.status === 404) {
                    console.warn('[TestContext] 테스트케이스가 이미 삭제되었거나 존재하지 않습니다:', id);
                } else {
                    let errorMsg = 'Failed to delete test case';
                    try { errorMsg = (await res.json()).message || errorMsg; } catch { }
                    throw new Error(errorMsg);
                }
            }

            const idsToDelete = getDescendantIds(testCases, id);
            setTestCases(prev => prev.filter(tc => !idsToDelete.includes(tc.id)));

            // Update test plans to remove deleted test cases
            setTestPlans(prev => prev.map(plan => ({
                ...plan,
                testCaseIds: plan.testCaseIds ? plan.testCaseIds.filter(tid => !idsToDelete.includes(tid)) : []
            })));

        } catch (error) {
            console.error('Error deleting test case:', error);
            throw error;
        }
    };

    // --- Test Plans ---

    const fetchTestPlans = useCallback(async (projectId) => {
        if (!projectId) return;
        if (testPlansPromiseRef.current[projectId]) return testPlansPromiseRef.current[projectId];

        const promise = (async () => {
            try {
                setTestPlansLoading(true);
                const baseUrl = await getApiBaseUrl();
                const res = await api(`${baseUrl}/api/test-plans/project/${projectId}`);
                if (!res.ok) throw new Error('테스트 플랜 조회 실패');
                const data = await res.json();
                setTestPlans(data);
                return data;
            } catch (error) {
                console.error('테스트 플랜 조회 오류:', error);
                setTestPlans([]);
                throw error;
            } finally {
                setTestPlansLoading(false);
                delete testPlansPromiseRef.current[projectId];
            }
        })();

        testPlansPromiseRef.current[projectId] = promise;
        return promise;
    }, [api, getApiBaseUrl]);

    const addTestPlan = async (testPlan) => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/test-plans`, {
                method: 'POST',
                body: JSON.stringify(testPlan)
            });
            if (!res.ok) throw new Error('테스트 플랜 생성 실패');
            const saved = await res.json();
            setTestPlans(prev => [...prev, saved]);
            return saved.id;
        } catch (error) {
            console.error('테스트 플랜 생성 오류:', error);
            throw error;
        }
    };

    const updateTestPlan = async (testPlan) => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/test-plans/${testPlan.id}`, {
                method: "PUT",
                body: JSON.stringify(testPlan),
            });
            if (!res.ok) throw new Error("Failed to update test plan");
            const updated = await res.json();
            setTestPlans(prev => prev.map(p =>
                p.id === updated.id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p
            ));
        } catch (error) {
            console.error("Error updating test plan:", error);
            setTestPlans(prev => prev.map(p =>
                p.id === testPlan.id ? { ...p, ...testPlan, updatedAt: new Date().toISOString() } : p
            ));
        }
    };

    const deleteTestPlan = async (id) => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/test-plans/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete test plan');

            setTestPlans(prev => prev.filter(plan => plan.id !== id));
            setTestExecutions(prev => prev.filter(exec => exec.testPlanId !== id));
        } catch (error) {
            console.error('Error deleting test plan:', error);
            throw error;
        }
    };

    // --- Test Executions ---

    const fetchTestExecutions = useCallback(async (projectId) => {
        if (!projectId) return;
        if (testExecutionsPromiseRef.current[projectId]) return testExecutionsPromiseRef.current[projectId];

        const promise = (async () => {
            try {
                const baseUrl = await getApiBaseUrl();
                const res = await api(`${baseUrl}/api/test-executions/by-project/${projectId}`);
                if (!res.ok) throw new Error('테스트 실행 조회 실패');
                const data = await res.json();
                setTestExecutions(data);
                return data;
            } catch (error) {
                console.error('테스트 실행 조회 오류:', error);
                setTestExecutions([]);
                throw error;
            } finally {
                delete testExecutionsPromiseRef.current[projectId];
            }
        })();

        testExecutionsPromiseRef.current[projectId] = promise;
        return promise;
    }, [api, getApiBaseUrl]);

    const addTestExecution = (testExecution) => {
        // Note: Original addTestExecution in AppContext seemed to dispatch locally if called via 'addTestExecution' wrapper
        // But 'addOrUpdateTestExecution' called API.
        // Replicating 'addTestExecution' wrapper logic from AppContext:
        const id = testExecution.id || `exec-${uuidv4()}`;
        setTestExecutions(prev => [...prev, { ...testExecution, id }]);
        return id;
    };

    const addOrUpdateTestExecution = async (execution) => {
        const payload = { ...execution };
        let res, saved;
        const baseUrl = await getApiBaseUrl();
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
            throw new Error(errData.message || '저장 실패');
        }
        saved = await res.json();

        if (execution.id) {
            setTestExecutions(prev => prev.map(exec =>
                exec.id === saved.id ? { ...exec, ...saved, updatedAt: new Date().toISOString() } : exec
            ));
        } else {
            setTestExecutions(prev => [...prev, saved]);
        }
        return saved;
    };

    const updateTestExecution = (testExecution) => {
        setTestExecutions(prev => prev.map(exec =>
            exec.id === testExecution.id ? { ...exec, ...testExecution, updatedAt: new Date().toISOString() } : exec
        ));
    };

    const deleteTestExecution = (id) => {
        setTestExecutions(prev => prev.filter(exec => exec.id !== id));
    };

    const startTestExecution = async (id) => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/test-executions/${id}/start`, { method: 'POST' });
            if (!res.ok) throw new Error('실행 시작 실패');
            const updated = await res.json();

            setTestExecutions(prev => prev.map(exec =>
                exec.id === updated.id ? { ...exec, ...updated, status: ExecutionStatus.INPROGRESS, startDate: new Date().toISOString(), updatedAt: new Date().toISOString() } : exec
            ));
            return updated;
        } catch (err) {
            console.error('Error starting test execution:', err);
            throw err;
        }
    };

    const completeTestExecution = async (id) => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/test-executions/${id}/complete`, { method: 'POST' });
            if (!res.ok) throw new Error('실행 완료 실패');
            const updated = await res.json();

            setTestExecutions(prev => prev.map(exec =>
                exec.id === updated.id ? { ...exec, ...updated, status: ExecutionStatus.COMPLETED, endDate: new Date().toISOString(), updatedAt: new Date().toISOString() } : exec
            ));
            return updated;
        } catch (err) {
            console.error('Error completing test execution:', err);
            throw err;
        }
    };

    const restartTestExecution = async (id) => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/test-executions/${id}/restart`, { method: 'POST' });
            if (!res.ok) throw new Error('재실행 실패');
            const updated = await res.json();

            setTestExecutions(prev => prev.map(exec =>
                exec.id === updated.id ? { ...exec, ...updated, updatedAt: new Date().toISOString() } : exec
            ));
            return updated;
        } catch (err) {
            console.error('Error restarting test execution:', err);
            throw err;
        }
    };

    const updateTestResult = (executionId, testCaseId, result, notes) => {
        setTestExecutions(prev => prev.map(exec => {
            if (exec.id !== executionId) return exec;
            return {
                ...exec,
                results: {
                    ...exec.results,
                    [testCaseId]: {
                        result,
                        notes,
                        executedAt: new Date().toISOString()
                    }
                },
                updatedAt: new Date().toISOString()
            };
        }));
    };

    const fetchTestExecutionsByTestCase = async (testCaseId) => {
        try {
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/test-executions/by-testcase/${testCaseId}`);
            if (!res.ok) throw new Error("이전 실행 결과를 불러오지 못했습니다.");
            return await res.json();
        } catch (error) {
            console.error("Error fetching executions by testcase:", error);
            return [];
        }
    };

    const calculateExecutionProgress = (executionId) => {
        const execution = testExecutions.find(exec => exec.id === executionId);
        if (!execution) return 0;
        const testPlan = testPlans.find(plan => plan.id === execution.testPlanId);
        return calcProgress(execution, testPlan);
    };

    // --- Dashboard APIs ---
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


    // --- Effects ---

    useEffect(() => {
        if (activeProject && activeProject.id) {
            fetchProjectTestCases(activeProject.id);
            fetchTestPlans(activeProject.id);
            fetchTestExecutions(activeProject.id);
        } else {
            setTestCases([]);
            setTestPlans([]);
            setTestExecutions([]);
        }
    }, [activeProject, fetchProjectTestCases, fetchTestPlans, fetchTestExecutions]);


    const value = {
        testCases,
        testPlans,
        testExecutions,
        activeTestCase,
        activeTestPlan,
        activeTestExecution,
        testCasesLoading,
        testPlansLoading,

        fetchProjectTestCases,
        addTestCase,
        updateTestCase,
        updateTestCaseLocal,
        deleteTestCase,
        setActiveTestCase,
        getTestCase: (id) => testCases.find(tc => tc.id === id),

        fetchTestPlans,
        addTestPlan,
        updateTestPlan,
        deleteTestPlan,
        setActiveTestPlan,
        getTestPlan: (id) => testPlans.find(plan => plan.id === id),

        fetchTestExecutions,
        addTestExecution,
        addOrUpdateTestExecution,
        updateTestExecution,
        deleteTestExecution,
        startTestExecution,
        completeTestExecution,
        restartTestExecution,
        updateTestResult,
        setActiveTestExecution,
        getTestExecution: (id) => testExecutions.find(exec => exec.id === id),
        fetchTestExecutionsByTestCase,
        calculateExecutionProgress,

        fetchRecentTestResults,
        fetchRecentTestResultsByProject,
        fetchRecentTestResultsByTestPlan,
        fetchOpenTestRunAssigneeResults,
        fetchOpenTestRunAssigneeResultsByProject
    };

    return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};

export const useTest = () => {
    const context = useContext(TestContext);
    if (!context) {
        throw new Error('useTest must be used within a TestProvider');
    }
    return context;
};

export default TestContext;
