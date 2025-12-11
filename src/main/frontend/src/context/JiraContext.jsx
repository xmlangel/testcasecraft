// src/context/JiraContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getDynamicApiUrl } from '../utils/apiConstants';

let globalJiraUrlPromise = null;

const USE_DEMO_DATA = import.meta.env.VITE_USE_DEMO_DATA === 'true';

const JiraContext = createContext();

export const JiraProvider = ({ children }) => {
    const { api, user, loadingUser, getApiBaseUrl } = useAuth();
    const [jiraServerUrl, setJiraServerUrl] = useState(null);

    // JIRA URL 조회 여부 상태 (무한 루프 방지용)
    const [jiraUrlChecked, setJiraUrlChecked] = useState(false);

    // JIRA 서버 URL 가져오기
    const fetchJiraServerUrl = useCallback(async () => {
        if (USE_DEMO_DATA) {
            // 데모 모드에서는 백엔드 JIRA 연동을 호출하지 않음
            setJiraServerUrl(null);
            return null;
        }

        // 이미 조회 중이면 해당 Promise 반환 (StrictMode/중복 호출 방지)
        if (globalJiraUrlPromise) return globalJiraUrlPromise;

        const promise = (async () => {
            try {
                const baseUrl = await getApiBaseUrl();
                const res = await api(`${baseUrl}/api/jira/server-url`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.serverUrl) {
                        setJiraServerUrl(data.serverUrl);
                    } else {
                        console.warn('JIRA 서버 URL이 설정되지 않았습니다.');
                        setJiraServerUrl(null);
                    }
                } else if (res.status === 404) {
                    // URL이 설정되지 않은 경우
                    console.warn('JIRA 서버 URL이 설정되지 않았습니다.');
                    setJiraServerUrl(null);
                } else {
                    console.warn('JIRA 서버 URL을 가져올 수 없습니다.');
                    setJiraServerUrl(null);
                }
            } catch (error) {
                console.warn('JIRA 서버 URL 조회 중 오류:', error);
                setJiraServerUrl(null);
            } finally {
                setJiraUrlChecked(true); // 조회 완료 표시 (성공/실패 무관)
                globalJiraUrlPromise = null;
            }
        })();

        globalJiraUrlPromise = promise;
        return promise;
    }, [api, getApiBaseUrl]);

    // 사용자 로그인 후 JIRA 서버 URL 초기화
    useEffect(() => {
        // 이미 조회 완료했거나 조회 중이면 스킵
        if (user && !loadingUser && !jiraUrlChecked && !globalJiraUrlPromise) {
            fetchJiraServerUrl();
        } else if (!user && jiraUrlChecked) {
            // 로그아웃 시 상태 초기화
            setJiraUrlChecked(false);
            setJiraServerUrl(null);
        }
    }, [user, loadingUser, jiraUrlChecked, fetchJiraServerUrl]);

    const value = {
        jiraServerUrl,
        fetchJiraServerUrl
    };

    return <JiraContext.Provider value={value}>{children}</JiraContext.Provider>;
};

export const useJira = () => {
    const context = useContext(JiraContext);
    if (!context) {
        throw new Error('useJira must be used within a JiraProvider');
    }
    return context;
};

export default JiraContext;
