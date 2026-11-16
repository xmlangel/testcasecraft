// src/hooks/useEscapeToClose.js
import { useEffect, useRef } from "react";

// 대화상자·메뉴·목록 상자가 열려 있으면 Esc 는 그쪽이 먼저 쓴다.
const POPUP_SELECTOR =
  ".MuiModal-root, .MuiPopover-root, .MuiPopper-root, [role='dialog'], [role='listbox'], [role='menu']";

/**
 * active 인 동안 Esc 를 누르면 onClose 를 부른다(ICT-492 겹친 칸 닫기).
 * 다른 곳에서 이미 처리한 Esc 와, 떠 있는 대화상자·메뉴가 있을 때의 Esc 는 넘긴다.
 */
const useEscapeToClose = (active, onClose) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector(POPUP_SELECTOR)) return;
      onCloseRef.current?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active]);
};

export default useEscapeToClose;
