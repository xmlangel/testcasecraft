import { useEffect } from "react";
import {
  isTextEntryElement,
  isActivatableElement,
} from "../utils/isTextEntryElement.js";

/**
 * 결과 입력 화면의 키보드 단축키를 화면 전체(window)에 건다.
 *
 * 단축키가 화면 전체에 걸려 있으므로 포커스가 어디 있느냐로 동작이 갈린다. 그 갈림을 한곳에
 * 모아 둔다 — 컴포넌트마다 조건을 다시 조합하면 예외 하나가 빠지고, 그러면 태그를 적다가
 * 판정이 저장되거나 태그 삭제 버튼을 Enter 로 눌렀는데 저장이 된다.
 *
 * @param {object} params
 * @param {boolean} params.enabled 단축키를 걸지 여부 (닫힌 화면·읽기 전용이면 false)
 * @param {Record<string, string>} params.keyResultMap 대문자 키 → 판정값
 * @param {(verdict: string) => void} params.onVerdict 판정 단축키를 눌렀을 때
 * @param {() => void} params.onSave Enter 를 눌렀을 때
 */
export function useResultShortcuts({
  enabled,
  keyResultMap,
  onVerdict,
  onSave,
}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // 글자를 치는 중에는 단축키가 물러난다 — 태그·JIRA 이슈 키를 적다가 N·P·F·B 가
      // 판정 단축키로 먹혀 입력이 사라지고 결과까지 저장되던 문제
      if (isTextEntryElement(document.activeElement)) return;

      // 키를 누른 채로 두면 keydown 이 자동 반복된다. 이때 저장은 건너뛰되 기본 동작 차단은
      // 유지한다 — 차단까지 건너뛰면 반복분이 버튼 클릭·폼 제출로 새어 이중 저장이 된다.
      const verdict = keyResultMap[e.key.toUpperCase()];
      if (verdict) {
        e.preventDefault();
        if (e.repeat) return;

        onVerdict(verdict);
        return;
      }

      if (e.key === "Enter") {
        // 버튼·링크 위에서는 물러난다. 태그 삭제나 닫기를 Enter 로 누른 것이 저장이 되면
        // 안 되고, 저장 버튼도 여기 해당해서 클릭 기본 동작과 이중으로 저장되지 않는다.
        if (isActivatableElement(document.activeElement)) return;

        e.preventDefault();
        if (e.repeat) return;

        onSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, keyResultMap, onVerdict, onSave]);
}

export default useResultShortcuts;
