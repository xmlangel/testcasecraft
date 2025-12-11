// src/context/ProjectContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { projectHelpers } from '../models/demoProjectData.js';

const USE_DEMO_DATA = import.meta.env.VITE_USE_DEMO_DATA === 'true';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const { api, user, loadingUser, getApiBaseUrl } = useAuth();

    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    const [projectsLoading, setProjectsLoading] = useState(true);

    const projectsPromiseRef = useRef(null); // 프로젝트 목록 조회 중복 방지

    const fetchProjects = useCallback(async () => {
        // 1. 이미 조회 중이면 기존 Promise 반환
        if (projectsPromiseRef.current) {
            return projectsPromiseRef.current;
        }

        const promise = (async () => {
            try {
                setProjectsLoading(true);
                if (USE_DEMO_DATA) {
                    // 더미 데이터 반환 (실제 네트워크 호출 시뮬레이션)
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const data = projectHelpers.getAllProjects();
                    setProjects(data);
                    return data;
                }

                const baseUrl = await getApiBaseUrl();
                const res = await api(`${baseUrl}/api/projects`);
                if (!res.ok) {
                    if (res.status === 401) {
                        // handleLogout은 AuthContext에서 처리됨, 여기선 에러만 throw
                        throw new Error("로그인이 필요합니다. 다시 로그인 해주세요.");
                    }
                    throw new Error("프로젝트 목록을 불러오지 못했습니다.");
                }
                const projectsData = await res.json();

                // 2. Organization 정보 조회 최적화 (중복 조회 방지)
                const uniqueOrgIds = [...new Set(projectsData
                    .filter(p => p.organizationId)
                    .map(p => p.organizationId)
                )];

                // Organization 정보 병렬 조회
                const orgMap = new Map();
                if (uniqueOrgIds.length > 0) {
                    await Promise.all(uniqueOrgIds.map(async (orgId) => {
                        try {
                            const orgRes = await api(`${baseUrl}/api/organizations/${orgId}`);
                            if (orgRes.ok) {
                                const orgData = await orgRes.json();
                                orgMap.set(orgId, {
                                    id: orgData.id,
                                    name: orgData.name,
                                    description: orgData.description
                                });
                            }
                        } catch (error) {
                            console.warn(`조직 정보 조회 실패 (ID: ${orgId}):`, error);
                        }
                    }));
                }

                // 3. 프로젝트 객체에 Organization 정보 매핑
                const enrichedProjects = projectsData.map(project => {
                    if (project.organizationId && orgMap.has(project.organizationId)) {
                        return {
                            ...project,
                            organization: orgMap.get(project.organizationId)
                        };
                    }
                    return project;
                });

                setProjects(enrichedProjects);
                return enrichedProjects;
            } catch (err) {
                setProjectsLoading(false);
                throw err;
            } finally {
                setProjectsLoading(false);
                projectsPromiseRef.current = null;
            }
        })();

        projectsPromiseRef.current = promise;
        return promise;
    }, [api, getApiBaseUrl]);

    // 사용자 로그인 후 프로젝트 목록 자동 로드
    useEffect(() => {
        if (user && !loadingUser) {
            fetchProjects().catch((error) => {
                console.error('[ProjectContext] 프로젝트 페치 실패:', error);
            });
        }
    }, [user, loadingUser, fetchProjects]);


    const addProject = async (project) => {
        if (USE_DEMO_DATA) {
            const tempId = project.id || `project-${uuidv4()}`;
            const payload = { ...project, id: tempId };
            await new Promise(resolve => setTimeout(resolve, 200));
            setProjects(prev => [...prev, payload]);
            return tempId;
        }

        try {
            const { id, ...projectData } = project;
            const baseUrl = await getApiBaseUrl();
            const res = await api(`${baseUrl}/api/projects`, {
                method: 'POST',
                body: JSON.stringify(projectData),
            });
            if (!res.ok) {
                throw new Error('Failed to save project');
            }
            const saved = await res.json();
            setProjects(prev => [...prev, saved]);
            return saved.id;
        } catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    };

    const updateProject = async (project) => {
        if (USE_DEMO_DATA) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setProjects(prev => prev.map(p =>
                p.id === project.id ? { ...p, ...project, updatedAt: new Date().toISOString() } : p
            ));
            return;
        }

        try {
            const baseUrl = await getApiBaseUrl();
            const apiUrl = `${baseUrl}/api/projects/${project.id}`;

            const res = await api(apiUrl, {
                method: 'PUT',
                body: JSON.stringify(project),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to update project: ${res.status} ${errorText}`);
            }

            const updated = await res.json();
            setProjects(prev => prev.map(p =>
                p.id === updated.id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p
            ));
        } catch (error) {
            console.error('프로젝트 업데이트 오류:', error);
            throw error;
        }
    };

    const deleteProject = async (id, force = false) => {
        if (USE_DEMO_DATA) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setProjects(prev => prev.filter(p => p.id !== id));
            if (activeProject && activeProject.id === id) {
                setActiveProject(null);
            }
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
                } catch { }
                throw new Error(errorMsg);
            }

            setProjects(prev => prev.filter(p => p.id !== id));
            if (activeProject && activeProject.id === id) {
                setActiveProject(null);
            }
        } catch (error) {
            console.error('Error deleting project:', error);

            let errorMessage = error.message;
            if (errorMessage.includes('rag_chat_threads') && (errorMessage.includes('foreign key') || errorMessage.includes('constraint'))) {
                errorMessage = '이 프로젝트에는 RAG 채팅 기록이 남아있어 삭제할 수 없습니다. 강제 삭제를 시도하거나, 채팅 기록을 먼저 정리해주세요.';
            } else if (errorMessage.includes('violates foreign key constraint')) {
                errorMessage = '프로젝트에 연관된 데이터가 남아있어 삭제할 수 없습니다. 강제 삭제를 시도해보세요.';
            }

            throw new Error(errorMessage);
        }
    };

    const getProject = (id) => projects.find(p => p.id === id);

    const value = {
        projects,
        activeProject,
        projectsLoading,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        setActiveProject,
        getProject
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};

export default ProjectContext;
