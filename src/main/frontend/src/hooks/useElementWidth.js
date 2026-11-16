// src/hooks/useElementWidth.js
import { useCallback, useRef, useState } from "react";

// 요소의 콘텐츠 폭(안쪽 여백·테두리 제외). ResizeObserver 의 contentRect.width 와 같은 값이다.
const measureContentWidth = (node) => {
  const width = node.getBoundingClientRect?.().width || 0;
  if (!width || typeof window.getComputedStyle !== "function") {
    return Math.round(width);
  }
  const style = window.getComputedStyle(node);
  const inset =
    (parseFloat(style.paddingLeft) || 0) +
    (parseFloat(style.paddingRight) || 0) +
    (parseFloat(style.borderLeftWidth) || 0) +
    (parseFloat(style.borderRightWidth) || 0);
  return Math.max(0, Math.round(width - inset));
};

/**
 * 요소의 현재 가로 폭(px)을 돌려준다. 창 크기나 옆 칸 폭이 바뀌면 다시 잰다.
 * 반환값: [ref 콜백, 폭]
 *
 * 붙는 순간 한 번 직접 잰다. ResizeObserver 알림은 브라우저가 화면을 그릴 때만 오기 때문에,
 * 가려진 창이나 뒤쪽 탭에서 연 화면은 알림이 오지 않아 폭이 0 에 머물고 상세 칸이 기본 폭(640)으로
 * 그려졌다(ICT-494 tl-4, 2000px 창에서 목록 924 · 상세 640). 창 resize 이벤트에도 다시 잰다.
 *
 * 정리는 ref 콜백이 null 로 불릴 때(언마운트) 한다. useEffect 정리 함수로 끊으면 개발 모드
 * StrictMode 가 effect 를 한 번 정리했다 다시 돌릴 때 observer 만 끊기고 ref 는 다시 불리지 않아
 * 폭이 0 에 머문다(ICT-491 fx-2 에서 확인).
 */
const useElementWidth = () => {
  const [width, setWidth] = useState(0);
  const cleanupRef = useRef(null);

  const ref = useCallback((node) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!node) return;

    const update = (next) => setWidth((prev) => (prev === next ? prev : next));
    update(measureContentWidth(node));

    const onWindowResize = () => update(measureContentWidth(node));
    window.addEventListener("resize", onWindowResize);

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver((entries) => {
        update(Math.round(entries[0]?.contentRect?.width || 0));
      });
      observer.observe(node);
    }

    cleanupRef.current = () => {
      observer?.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return [ref, width];
};

export default useElementWidth;
