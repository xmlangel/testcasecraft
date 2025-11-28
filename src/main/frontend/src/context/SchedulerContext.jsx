import React, { createContext, useContext, useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance.js';

const SchedulerContext = createContext();

/**
 * 스케줄러 관리 Context Provider
 */
export const SchedulerProvider = ({ children }) => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = '/api/admin/scheduler';

    /**
     * 모든 스케줄 설정 조회
     */
    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/configs`);
            setConfigs(response.data);
            return response.data;
        } catch (err) {
            console.error('스케줄 설정 조회 실패:', err);
            setError(err.response?.data?.message || '스케줄 설정 조회에 실패했습니다.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 특정 스케줄 설정 조회
     */
    const getConfig = useCallback(async (taskKey) => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/configs/${taskKey}`);
            return response.data;
        } catch (err) {
            console.error('스케줄 설정 조회 실패:', err);
            throw err;
        }
    }, []);

    /**
     * 스케줄 설정 업데이트
     */
    const updateConfig = useCallback(async (taskKey, updateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.put(`${API_BASE_URL}/configs/${taskKey}`, updateData);

            // 로컬 상태 업데이트
            setConfigs(prevConfigs =>
                prevConfigs.map(config =>
                    config.taskKey === taskKey ? response.data : config
                )
            );

            return response.data;
        } catch (err) {
            console.error('스케줄 설정 업데이트 실패:', err);
            const errorMessage = err.response?.data?.message || '스케줄 설정 업데이트에 실패했습니다.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 스케줄 활성화/비활성화 토글
     */
    const toggleEnabled = useCallback(async (taskKey) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.post(`${API_BASE_URL}/configs/${taskKey}/toggle`);

            // 로컬 상태 업데이트
            setConfigs(prevConfigs =>
                prevConfigs.map(config =>
                    config.taskKey === taskKey ? response.data : config
                )
            );

            return response.data;
        } catch (err) {
            console.error('스케줄 활성화/비활성화 실패:', err);
            setError(err.response?.data?.message || '스케줄 상태 변경에 실패했습니다.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 스케줄 즉시 실행
     */
    const executeNow = useCallback(async (taskKey) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.post(`${API_BASE_URL}/configs/${taskKey}/execute`);

            // 실행 후 설정 새로고침
            await fetchConfigs();

            return response.data;
        } catch (err) {
            console.error('스케줄 즉시 실행 실패:', err);
            setError(err.response?.data?.message || '스케줄 실행에 실패했습니다.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchConfigs]);

    const value = {
        configs,
        loading,
        error,
        fetchConfigs,
        getConfig,
        updateConfig,
        toggleEnabled,
        executeNow,
    };

    return (
        <SchedulerContext.Provider value={value}>
            {children}
        </SchedulerContext.Provider>
    );
};

/**
 * 스케줄러 Context Hook
 */
export const useScheduler = () => {
    const context = useContext(SchedulerContext);
    if (!context) {
        throw new Error('useScheduler must be used within a SchedulerProvider');
    }
    return context;
};

export default SchedulerContext;
