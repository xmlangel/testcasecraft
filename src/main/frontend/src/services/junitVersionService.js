// src/services/junitVersionService.js

/**
 * ICT-204: JUnit 파일 버전 관리 서비스
 * 원본 파일 보존, 버전 제어, 백업 및 복구 기능
 */

import { getDynamicApiUrl } from '../utils/apiConstants';

class JunitVersionService {
    constructor() {
        this.baseURL = null;
    }

    async getBaseURL() {
        if (!this.baseURL) {
            const apiUrl = await getDynamicApiUrl();
            this.baseURL = `${apiUrl}/api/junit-versions`;
        }
        return this.baseURL;
    }

    /**
     * 인증 헤더 생성
     */
    getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /**
     * 파일 버전 생성
     * @param {string} testResultId - 테스트 결과 ID
     * @param {string} originalFilePath - 원본 파일 경로
     * @param {string} description - 버전 설명
     * @returns {Promise<Object>} 생성된 버전 정보
     */
    async createVersion(testResultId, originalFilePath, description = '') {
        try {
            const baseURL = await this.getBaseURL();
            const response = await fetch(
                `${baseURL}/${testResultId}/versions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.getAuthHeaders()
                    },
                    body: JSON.stringify({
                        originalFilePath,
                        description
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    version: data.version,
                    message: data.message
                };
            } else {
                throw new Error(data.error || '버전 생성 실패');
            }
        } catch (error) {
            console.error('파일 버전 생성 실패:', error);
            throw new Error(
                error.message || 
                '버전 생성 중 오류가 발생했습니다.'
            );
        }
    }

    /**
     * 버전 히스토리 조회
     * @param {string} testResultId - 테스트 결과 ID
     * @returns {Promise<Object>} 버전 히스토리
     */
    async getVersionHistory(testResultId) {
        try {
            const baseURL = await this.getBaseURL();
            const response = await fetch(
                `${baseURL}/${testResultId}/history`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            // 응답 상태 확인
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = '히스토리 조회 실패';
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    // JSON 파싱 실패 시 HTTP 상태 메시지 사용
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                
                throw new Error(errorMessage);
            }

            // 응답 텍스트 확인 후 JSON 파싱
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '') {
                throw new Error('서버에서 빈 응답을 반환했습니다.');
            }

            const data = JSON.parse(responseText);

            if (data.success) {
                return {
                    success: true,
                    history: data.history,
                    versionCount: data.versionCount
                };
            } else {
                throw new Error(data.error || '히스토리 조회 실패');
            }
        } catch (error) {
            console.error('버전 히스토리 조회 실패:', error);
            throw new Error(
                error.message || 
                '히스토리 조회 중 오류가 발생했습니다.'
            );
        }
    }

    /**
     * 특정 버전으로 복원
     * @param {string} testResultId - 테스트 결과 ID
     * @param {number} versionNumber - 버전 번호
     * @param {string} targetPath - 복원 대상 경로
     * @returns {Promise<Object>} 복원 결과
     */
    async restoreVersion(testResultId, versionNumber, targetPath) {
        try {
            const baseURL = await this.getBaseURL();
            const response = await fetch(
                `${baseURL}/${testResultId}/restore/${versionNumber}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.getAuthHeaders()
                    },
                    body: JSON.stringify({
                        targetPath
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    restoreResult: data.restoreResult,
                    message: data.message
                };
            } else {
                throw new Error(data.error || '버전 복원 실패');
            }
        } catch (error) {
            console.error('버전 복원 실패:', error);
            throw new Error(
                error.message || 
                '버전 복원 중 오류가 발생했습니다.'
            );
        }
    }

    /**
     * 버전 간 차이점 비교
     * @param {string} testResultId - 테스트 결과 ID
     * @param {number} version1 - 첫 번째 버전
     * @param {number} version2 - 두 번째 버전
     * @returns {Promise<Object>} 비교 결과
     */
    async compareVersions(testResultId, version1, version2) {
        try {
            const baseURL = await this.getBaseURL();
            const url = new URL(`${baseURL}/${testResultId}/compare`);
            url.searchParams.set('version1', version1);
            url.searchParams.set('version2', version2);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    comparison: data.comparison
                };
            } else {
                throw new Error(data.error || '버전 비교 실패');
            }
        } catch (error) {
            console.error('버전 비교 실패:', error);
            throw new Error(
                error.message || 
                '버전 비교 중 오류가 발생했습니다.'
            );
        }
    }

    /**
     * 백업 생성
     * @param {string} testResultId - 테스트 결과 ID
     * @param {number} versionNumber - 백업할 버전 번호 (-1: 최신)
     * @returns {Promise<Object>} 백업 결과
     */
    async createBackup(testResultId, versionNumber = -1) {
        try {
            const baseURL = await this.getBaseURL();
            const url = new URL(`${baseURL}/${testResultId}/backup`);
            if (versionNumber !== -1) {
                url.searchParams.set('versionNumber', versionNumber);
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    backup: data.backup,
                    message: data.message
                };
            } else {
                throw new Error(data.error || '백업 생성 실패');
            }
        } catch (error) {
            console.error('백업 생성 실패:', error);
            throw new Error(
                error.message || 
                '백업 생성 중 오류가 발생했습니다.'
            );
        }
    }

    /**
     * 스토리지 통계 조회 (관리자 전용)
     * @returns {Promise<Object>} 스토리지 통계
     */
    async getStorageStatistics() {
        try {
            const baseURL = await this.getBaseURL();
            const response = await fetch(
                `${baseURL}/storage/statistics`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            // 응답 상태 확인
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = '통계 조회 실패';
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    // JSON 파싱 실패 시 HTTP 상태 메시지 사용
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                
                throw new Error(errorMessage);
            }

            // 응답 텍스트 확인 후 JSON 파싱
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '') {
                throw new Error('서버에서 빈 응답을 반환했습니다.');
            }

            const data = JSON.parse(responseText);

            if (data.success) {
                return {
                    success: true,
                    statistics: data.statistics
                };
            } else {
                throw new Error(data.error || '통계 조회 실패');
            }
        } catch (error) {
            console.error('스토리지 통계 조회 실패:', error);
            throw new Error(
                error.message || 
                '통계 조회 중 오류가 발생했습니다.'
            );
        }
    }

    /**
     * 파일 크기 포맷팅
     * @param {number} bytes - 바이트 크기
     * @returns {string} 포맷된 크기
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 시간 차이 포맷팅
     * @param {number} minutes - 분 단위 시간 차이
     * @returns {string} 포맷된 시간
     */
    formatTimeDifference(minutes) {
        if (minutes === 0) return '동시';
        if (minutes < 60) return `${minutes}분`;
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours < 24) {
            return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
        }
        
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        return remainingHours > 0 ? `${days}일 ${remainingHours}시간` : `${days}일`;
    }

    /**
     * 버전 상태 정보
     * @param {Object} version - 버전 객체
     * @returns {Object} 상태 정보
     */
    getVersionStatusInfo(version) {
        const now = new Date();
        const createdAt = new Date(version.createdAt);
        const ageInHours = (now - createdAt) / (1000 * 60 * 60);
        
        let status = 'stable';
        let color = 'success';
        let label = '안정';
        
        if (ageInHours < 24) {
            status = 'new';
            color = 'primary';
            label = '새로움';
        } else if (ageInHours < 168) { // 7 days
            status = 'recent';
            color = 'info';
            label = '최근';
        } else if (ageInHours > 720) { // 30 days
            status = 'old';
            color = 'default';
            label = '오래됨';
        }
        
        return {
            status,
            color,
            label,
            ageInHours: Math.round(ageInHours)
        };
    }

    /**
     * 백업 권장 여부 확인
     * @param {Object} history - 버전 히스토리
     * @returns {Object} 백업 권장 정보
     */
    shouldRecommendBackup(history) {
        if (!history || !history.versions || history.versions.length === 0) {
            return { recommend: false, reason: '버전이 없습니다.' };
        }
        
        const latestVersion = history.versions[history.versions.length - 1];
        const now = new Date();
        const lastUpdate = new Date(latestVersion.createdAt);
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
        
        // 24시간 이상 지나고 백업이 없으면 권장
        if (hoursSinceUpdate > 24) {
            return { 
                recommend: true, 
                reason: `마지막 업데이트로부터 ${Math.round(hoursSinceUpdate)}시간이 지났습니다.`,
                urgency: hoursSinceUpdate > 168 ? 'high' : 'medium' // 7일 이상이면 높음
            };
        }
        
        // 버전이 5개 이상이면 백업 권장
        if (history.versions.length >= 5) {
            return { 
                recommend: true, 
                reason: `${history.versions.length}개의 버전이 누적되었습니다.`,
                urgency: 'medium'
            };
        }
        
        return { recommend: false, reason: '아직 백업이 필요하지 않습니다.' };
    }

    /**
     * 버전 관리 최적화 제안
     * @param {Object} statistics - 스토리지 통계
     * @returns {Array} 최적화 제안 목록
     */
    getOptimizationSuggestions(statistics) {
        const suggestions = [];
        
        if (!statistics) return suggestions;
        
        // 총 스토리지가 1GB 이상이면 압축 권장
        if (statistics.totalStorageSize > 1024 * 1024 * 1024 && !statistics.compressionEnabled) {
            suggestions.push({
                type: 'compression',
                priority: 'high',
                title: '압축 기능 활성화',
                description: '스토리지 사용량을 50-70% 줄일 수 있습니다.',
                action: '설정에서 압축 기능을 활성화하세요.'
            });
        }
        
        // 백업이 비활성화되어 있으면 활성화 권장
        if (!statistics.autoBackupEnabled) {
            suggestions.push({
                type: 'backup',
                priority: 'medium',
                title: '자동 백업 활성화',
                description: '데이터 손실을 방지할 수 있습니다.',
                action: '자동 백업 기능을 활성화하세요.'
            });
        }
        
        // 백업 파일 수가 버전 파일 수의 2배를 넘으면 정리 권장
        if (statistics.backupFileCount > statistics.versionFileCount * 2) {
            suggestions.push({
                type: 'cleanup',
                priority: 'low',
                title: '백업 파일 정리',
                description: '불필요한 백업 파일이 누적되었습니다.',
                action: '오래된 백업 파일을 정리하세요.'
            });
        }
        
        return suggestions;
    }

    /**
     * 에러 핸들링
     * @param {Error} error - 발생한 에러
     * @returns {string} 사용자 친화적 에러 메시지
     */
    handleError(error) {
        if (error.name === 'TypeError') {
            return '네트워크 연결을 확인해주세요.';
        }
        
        return error.message || '알 수 없는 오류가 발생했습니다.';
    }
}

// 싱글톤 인스턴스 생성
const junitVersionService = new JunitVersionService();

export default junitVersionService;