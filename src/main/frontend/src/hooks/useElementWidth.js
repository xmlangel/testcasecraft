// src/hooks/useElementWidth.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 요소의 현재 가로 폭(px)을 돌려준다. 창 크기나 옆 칸 폭이 바뀌면 다시 잰다.
 * ResizeObserver 가 없는 환경(jsdom 시험 등)에서는 0 을 돌려준다.
 * 반환값: [ref 콜백, 폭]
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

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, width];
};

export default useElementWidth;
