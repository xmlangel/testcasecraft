// src/components/TestCaseTree/utils/treeOperations.js

/**
 * 트리 연산 관련 유틸리티 함수들
 */

/**
 * 주어진 부모 ID의 모든 하위 노드 ID를 재귀적으로 가져옴 (순환 참조 방지 포함)
 * @param {Array} items - 트리 항목 배열
 * @param {string} parentId - 부모 노드 ID
 * @returns {Array} 모든 하위 노드 ID 배열
 */
export function getAllChildIds(items, parentId) {
    // 안전장치: 유효성 검사
    if (!Array.isArray(items)) {
        console.error('[TestCaseTree] getAllChildIds: items가 배열이 아닙니다:', typeof items);
        return [];
    }

    if (!parentId) {
        console.warn('[TestCaseTree] getAllChildIds: parentId가 제공되지 않았습니다');
        return [];
    }

    const result = [];
    const stack = [parentId];
    const visited = new Set(); // 순환 참조 방지
    const MAX_ITERATIONS = 1000; // 무한 루프 방지
    let iterations = 0;

    while (stack.length > 0) {
        iterations++;

        // 무한 루프 방지
        if (iterations > MAX_ITERATIONS) {
            console.error('[TestCaseTree] getAllChildIds: 최대 반복 횟수 초과 (순환 참조 가능성)');
            break;
        }

        const current = stack.pop();

        // 이미 방문한 노드는 스킵 (순환 참조 방지)
        if (visited.has(current)) {
            continue;
        }
        visited.add(current);

        const children = items.filter((item) => item?.parentId === current);

        for (const child of children) {
            if (child?.id && !visited.has(child.id)) {
                result.push(child.id);
                stack.push(child.id);
            }
        }
    }

    return result;
}

/**
 * 항목들을 displayOrder로 정렬
 * @param {Array} items - 정렬할 항목 배열
 * @returns {Array} 정렬된 항목 배열
 */
export function sortByDisplayOrder(items) {
    return items.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

/**
 * 노드의 모든 하위 테스트케이스 개수를 재귀적으로 계산
 * @param {Object} node - 트리 노드
 * @returns {number} 하위 테스트케이스 개수
 */
export function countTestCasesRecursive(node) {
    if (!node.children || node.children.length === 0) return 0;
    let count = 0;
    node.children.forEach((child) => {
        if (child.type === "testcase") count += 1;
        else if (child.type === "folder") count += countTestCasesRecursive(child);
    });
    return count;
}
