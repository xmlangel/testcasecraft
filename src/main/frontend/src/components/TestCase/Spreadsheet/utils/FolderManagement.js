// src/components/TestCase/Spreadsheet/utils/FolderManagement.js

import { debugLog } from '../../../../utils/logger.js';

/**
 * 폴더명으로 폴더 ID를 찾는 헬퍼 함수 (ICT-343: 상위폴더 지정 기능)
 * ICT-XXX: 폴더명 또는 숫자(ID)로 폴더를 찾는 통합 함수
 * @param {string|number} folderNameOrId - 폴더명 또는 ID
 * @param {Array} allData - 전체 데이터 배열
 * @returns {string|null} - 폴더 ID 또는 null
 */
export const findFolderIdByName = (folderNameOrId, allData) => {
    if (!folderNameOrId || (typeof folderNameOrId === 'string' && !folderNameOrId.trim())) return null;

    const searchValue = typeof folderNameOrId === 'string' ? folderNameOrId.trim() : String(folderNameOrId);

    // 1순위: 숫자인 경우 displayId, sequentialId, displayOrder로 검색
    if (/^\d+$/.test(searchValue)) {
        const numericValue = parseInt(searchValue, 10);

        // displayId로 검색 (예: "1")
        let folder = allData.find(item =>
            item.type === 'folder' &&
            (item.displayId === searchValue || item.sequentialId === numericValue)
        );

        // displayOrder로 검색 (폴더가 없는 경우 마지막 시도)
        if (!folder) {
            folder = allData.find(item =>
                item.type === 'folder' &&
                item.displayOrder === numericValue
            );
        }

        if (folder) {
            return folder.id;
        }
    }

    // 2순위: 폴더명으로 검색 (기존 로직)
    const folder = allData.find(item =>
        item.type === 'folder' &&
        item.name === searchValue
    );

    return folder ? folder.id : null;
};

/**
 * 폴더를 계층 구조 순서로 정렬 (부모 폴더가 자식 폴더보다 먼저 오도록)
 * @param {Array} folders - 폴더 배열
 * @param {Array} existingData - 기존 데이터 배열
 * @returns {Array} - 정렬된 폴더 배열
 */
export const sortFoldersByHierarchy = (folders, existingData) => {
    if (!Array.isArray(folders) || folders.length === 0) {
        return [];
    }

    const sorted = [];
    const visited = new Set();
    const processing = new Set(); // 순환 참조 감지용

    const addFolderWithParents = (folder, depth = 0) => {
        // 무한 루프 방지: 최대 깊이 제한
        if (depth > 10) {
            debugLog('Spreadsheet', '⚠️ 폴더 계층 깊이 초과:', folder.name);
            return;
        }

        // 이미 방문했거나 처리 중이면 스킵
        if (visited.has(folder.name)) return;
        if (processing.has(folder.name)) {
            debugLog('Spreadsheet', '⚠️ 순환 참조 감지:', folder.name);
            return;
        }

        // 처리 중 표시
        processing.add(folder.name);

        // 부모 폴더명이 있으면 부모를 먼저 추가
        if (folder.parentFolderName && folder.parentFolderName.trim()) {
            // 새로 추가되는 폴더들 중에서 부모 찾기
            const parentFolder = folders.find(f => f.name === folder.parentFolderName);
            if (parentFolder && !visited.has(parentFolder.name)) {
                addFolderWithParents(parentFolder, depth + 1);
            } else if (existingData && Array.isArray(existingData)) {
                // 기존 데이터에서 부모 찾기
                const existingParent = existingData.find(item =>
                    item.type === 'folder' && item.name === folder.parentFolderName
                );
                if (existingParent && !visited.has(existingParent.name)) {
                    // 기존 부모는 이미 저장되어 있으므로 visited에만 추가
                    visited.add(existingParent.name);
                }
            }
        }

        // 처리 완료
        processing.delete(folder.name);
        visited.add(folder.name);
        sorted.push(folder);
    };

    // 최상위 폴더부터 처리 (parentFolderName이 없거나 빈 문자열)
    const rootFolders = folders.filter(f => !f.parentFolderName || f.parentFolderName.trim() === '');
    rootFolders.forEach(folder => addFolderWithParents(folder, 0));

    // 나머지 폴더 처리
    const remainingFolders = folders.filter(f => f.parentFolderName && f.parentFolderName.trim() !== '');
    remainingFolders.forEach(folder => addFolderWithParents(folder, 0));

    debugLog('Spreadsheet', '📂 정렬 완료:', sorted.length, '개 폴더');
    return sorted;
};
