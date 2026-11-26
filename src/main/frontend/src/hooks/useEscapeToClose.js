// src/hooks/useEscapeToClose.js
import { useEffect, useRef } from "react";

// 대화상자·메뉴·목록 상자가 열려 있으면 Esc 는 그쪽이 먼저 쓴다.
// 툴팁은 Esc 를 쓰지 않으므로 넘기지 않는다. 마우스가 편집기 버튼 위에 머물러 「Bold」 툴팁이 떠 있으면
// 겹친 칸이 Esc 로 닫히지 않았다(ICT-492 ly-2, 1440px 실행 화면).
const POPUP_SELECTOR =
  ".MuiModal-root, .MuiPopover-root, .MuiPopper-root:not(.MuiTooltip-popper), [role='dialog'], [role='listbox'], [role='menu']";

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
