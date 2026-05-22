const items = [
  { id: "1", name: "Folder 1", type: "folder", parentId: null },
  { id: "2", name: "Test 1", type: "testcase", parentId: "1" },
  { id: "3", name: "Orphan Test", type: "testcase", parentId: "999" },
];

console.log("Original Items:");
console.log(items);

// 1. 고아 노드 처리 로직
const orphanFolderId = "orphaned-items-folder";
const allNodesExist = new Set(items.map((item) => item.id));

let processedItems = items.map((item) => {
  // parentId는 있지만 전체 목록에 그 parentId를 가진 항목이 없는 경우
  if (
    item.parentId &&
    item.parentId !== "null" &&
    item.parentId !== "undefined" &&
    !allNodesExist.has(item.parentId)
  ) {
    return { ...item, parentId: orphanFolderId };
  }
  return item;
});

// 고아 노드가 하나라도 있다면 가상 폴더 추가
const hasOrphans = processedItems.some(
  (item) => item.parentId === orphanFolderId,
);
if (hasOrphans && !processedItems.some((item) => item.id === orphanFolderId)) {
  processedItems.unshift({
    id: orphanFolderId,
    name: "[미할당 항목]",
    type: "folder",
    parentId: null,
    description: "상위 폴더를 찾을 수 없는 항목들입니다.",
  });
}

console.log("\nProcessed Items:");
console.log(processedItems);

// 2. listToTree 시뮬레이션
const listToTree = (items, parentId = null) =>
  items
    .filter((item) =>
      parentId === null
        ? item.parentId === null ||
          item.parentId === "null" ||
          item.parentId === "undefined"
        : item.parentId === parentId,
    )
    .map((item) => ({
      ...item,
      children: listToTree(items, item.id),
    }));

console.log("\nTree Result:");
console.log(JSON.stringify(listToTree(processedItems), null, 2));
