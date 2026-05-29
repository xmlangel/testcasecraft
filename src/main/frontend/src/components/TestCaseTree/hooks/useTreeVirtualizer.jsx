// src/components/TestCaseTree/hooks/useTreeVirtualizer.jsx
import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { flattenTree } from "../../../utils/treeUtils.jsx";

/**
 * 트리 가상화(Virtualization) 관련 로직을 담당하는 커스텀 훅
 * - flatData 계산 (placeholder 포함)
 * - useVirtualizer 설정
 */
export const useTreeVirtualizer = ({
  treeData,
  expanded,
  newItemData,
  orderMap,
}) => {
  const parentRef = useRef(null);

  // 가상화를 위한 평탄화 데이터 (placeholder 노드 포함)
  const flatData = useMemo(() => {
    const flat = flattenTree(treeData, expanded, orderMap);

    if (newItemData) {
      const parentId = newItemData.parentId;
      if (parentId === null) {
        // 루트 추가: 맨 앞에 삽입
        flat.unshift({
          id: "new-item-placeholder",
          type: "placeholder",
          depth: 0,
          parentId: null,
        });
      } else {
        // 하위 추가: 부모 노드 바로 다음(또는 자식들 다음)에 삽입
        const parentIndex = flat.findIndex((n) => n.id === parentId);
        if (parentIndex !== -1) {
          const parentDepth = flat[parentIndex].depth;
          let insertIndex = parentIndex + 1;
          for (let i = parentIndex + 1; i < flat.length; i++) {
            if (flat[i].depth > parentDepth) {
              insertIndex = i + 1;
            } else {
              break;
            }
          }
          flat.splice(insertIndex, 0, {
            id: "new-item-placeholder",
            type: "placeholder",
            depth: parentDepth + 1,
            parentId,
          });
        }
      }
    }

    return flat;
  }, [treeData, expanded, newItemData, orderMap]);

  const virtualizer = useVirtualizer({
    count: flatData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  return { flatData, virtualizer, parentRef };
};
