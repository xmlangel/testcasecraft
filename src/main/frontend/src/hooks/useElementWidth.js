// src/hooks/useElementWidth.js
import { useCallback, useRef, useState } from "react";

/**
 * 요소의 현재 가로 폭(px)을 돌려준다. 창 크기나 옆 칸 폭이 바뀌면 다시 잰다.
 * ResizeObserver 가 없는 환경(jsdom 시험 등)에서는 0 을 돌려준다.
 * 반환값: [ref 콜백, 폭]
 *
 * 정리는 ref 콜백이 null 로 불릴 때(언마운트) 한다. useEffect 정리 함수로 끊으면 개발 모드
 * StrictMode 가 effect 를 한 번 정리했다 다시 돌릴 때 observer 만 끊기고 ref 는 다시 불리지 않아
 * 폭이 0 에 머문다(ICT-491 fx-2 에서 확인).
 */
const useElementWidth = () => {
  const [width, setWidth] = useState(0);
  const observerRef = useRef(null);

  const ref = useCallback((node) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0]?.contentRect?.width || 0);
      setWidth((prev) => (prev === next ? prev : next));
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return [ref, width];
};

export default useElementWidth;
