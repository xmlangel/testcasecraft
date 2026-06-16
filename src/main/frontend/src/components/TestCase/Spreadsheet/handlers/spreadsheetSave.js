// src/components/TestCase/Spreadsheet/handlers/spreadsheetSave.js
//
// 스프레드시트 일괄 저장 오케스트레이션(순수 로직). 실제 백엔드 호출은 saveFn 으로
// 주입받아, 컴포넌트 의존(서비스/상태) 없이 단위 테스트가 가능하도록 분리한다.

import { sortFoldersByHierarchy } from "../utils/FolderManagement.js";

/** 배치 저장 결과 누산용 빈 객체 */
export const createEmptyBatchResult = () => ({
  savedTestCases: [],
  successCount: 0,
  failureCount: 0,
  errors: [],
  isSuccess: true,
});

/** source 배치 결과를 target 에 누적 병합 */
export const mergeBatchResult = (target, source) => {
  if (!source) return target;
  target.savedTestCases.push(...(source.savedTestCases || []));
  target.successCount += source.successCount || 0;
  target.failureCount += source.failureCount || 0;
  target.errors.push(...(source.errors || []));
  target.isSuccess = target.isSuccess && source.isSuccess !== false;
  return target;
};

/**
 * 폴더를 부모-자식 의존성 순서로(레이어드) 저장한다.
 *
 * 신규 폴더 간 부모 참조는 저장 후에야 ID 가 생기므로, "부모가 이미 알려진(기존/방금
 * 저장된) 폴더"부터 배치로 저장하고, 저장 결과의 새 ID 로 이름→ID 맵을 갱신하며 반복한다.
 * 더 이상 해소 불가하면(순환/오타) 남은 폴더를 한 번에 시도한다(maxLoops 가드).
 *
 * @param {Array} folders 저장할 폴더 엔티티 (parentFolderName/parentId 보유)
 * @param {Array} existingData 기존 데이터(이름→ID 초기 맵 구성용)
 * @param {(batch:Array)=>Promise<object>} saveFn 배치 저장 콜백 (batchResult 반환)
 * @returns {Promise<object>} 누적 배치 결과
 */
export const saveFoldersLayered = async (folders, existingData, saveFn) => {
  const result = createEmptyBatchResult();
  if (!folders || folders.length === 0) return result;

  const ordered = sortFoldersByHierarchy(folders, existingData || []);

  // 기존 폴더 이름→ID 맵
  const knownFolders = new Map();
  (existingData || []).forEach((item) => {
    if (item.type === "folder") knownFolders.set(item.name, item.id);
  });

  let remaining = [...ordered];
  let loopCount = 0;
  const maxLoops = 10; // 무한루프 방지

  while (remaining.length > 0 && loopCount < maxLoops) {
    loopCount++;
    const currentBatch = [];
    const nextRemaining = [];

    for (const folder of remaining) {
      const parentName = folder.parentFolderName;
      const hasParentName = parentName && parentName.trim() !== "";
      let resolvedParentId = folder.parentId;
      if (hasParentName && !resolvedParentId) {
        resolvedParentId = knownFolders.get(parentName);
      }
      const isRoot = !hasParentName;
      const isParentKnown = hasParentName && resolvedParentId;

      if (isRoot || isParentKnown) {
        if (resolvedParentId) folder.parentId = resolvedParentId;
        currentBatch.push(folder);
      } else {
        nextRemaining.push(folder);
      }
    }

    // 더 이상 의존성 해결 불가 → 남은 폴더 일괄 시도(루프 종료)
    if (currentBatch.length === 0) {
      currentBatch.push(...nextRemaining);
      nextRemaining.length = 0;
    }

    if (currentBatch.length > 0) {
      const batch = await saveFn(currentBatch);
      (batch?.savedTestCases || []).forEach((saved) => {
        knownFolders.set(saved.name, saved.id);
      });
      mergeBatchResult(result, batch);
    }

    remaining = nextRemaining;
  }

  return result;
};

/**
 * 테스트케이스의 parentFolderName 을 최신 폴더 ID(기존 + 방금 저장된 폴더)로 해소한다.
 *
 * @param {Array} testCases 테스트케이스 엔티티
 * @param {Array} existingData 기존 데이터
 * @param {Array} savedFolders 방금 저장돼 ID 가 생긴 폴더들
 * @returns {Array} parentId 가 갱신된 테스트케이스 배열
 */
export const resolveTestCaseParentIds = (
  testCases,
  existingData,
  savedFolders,
) => {
  const folderMap = new Map();
  [...(existingData || []), ...(savedFolders || [])].forEach((item) => {
    if (item.type === "folder") folderMap.set(item.name, item.id);
  });

  return (testCases || []).map((tc) => {
    if (tc.parentFolderName) {
      const newParentId = folderMap.get(tc.parentFolderName);
      if (newParentId) return { ...tc, parentId: newParentId };
    }
    return tc;
  });
};
