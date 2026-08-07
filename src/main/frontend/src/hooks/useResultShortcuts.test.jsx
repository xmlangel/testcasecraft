import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, fireEvent } from "@testing-library/react";
import useResultShortcuts from "./useResultShortcuts.js";

/**
 * 결과 입력 화면의 키보드 계약을 고정한다.
 *
 * 포커스가 어디 있느냐로 동작이 갈리는 것이 이 훅의 전부다. 갈림이 틀리면 태그를 적다가
 * 판정이 저장되거나(입력 가로채기), 태그 삭제 버튼을 Enter 로 눌렀는데 저장이 되거나
 * (활성화 가로채기), 체크박스에서 Enter 가 아무 일도 하지 않는다.
 */

const KEY_RESULT_MAP = {
  N: "NOTRUN",
  P: "PASS",
  F: "FAIL",
  B: "BLOCKED",
};

describe("useResultShortcuts", () => {
  let onVerdict;
  let onSave;
  let focusTargets;

  const mount = (overrides = {}) =>
    renderHook(() =>
      useResultShortcuts({
        enabled: true,
        keyResultMap: KEY_RESULT_MAP,
        onVerdict,
        onSave,
        ...overrides,
      }),
    );

  /** 포커스를 실제로 옮긴다 — 이 훅은 document.activeElement 를 보고 판단한다. */
  const focusOn = (html) => {
    const holder = document.createElement("div");
    holder.innerHTML = html;
    const target = holder.firstElementChild;
    document.body.appendChild(target);
    focusTargets.push(target);
    target.focus();
    return target;
  };

  beforeEach(() => {
    onVerdict = vi.fn();
    onSave = vi.fn();
    focusTargets = [];
  });

  afterEach(() => {
    focusTargets.forEach((el) => el.remove());
    document.body.innerHTML = "";
  });

  it("입력칸 밖에서는 판정 단축키가 동작한다", () => {
    mount();

    fireEvent.keyDown(window, { key: "p" });
    expect(onVerdict).toHaveBeenCalledWith("PASS");

    fireEvent.keyDown(window, { key: "F" });
    expect(onVerdict).toHaveBeenCalledWith("FAIL");

    fireEvent.keyDown(window, { key: "n" });
    expect(onVerdict).toHaveBeenCalledWith("NOTRUN");

    fireEvent.keyDown(window, { key: "b" });
    expect(onVerdict).toHaveBeenCalledWith("BLOCKED");
  });

  it("태그 칸에 포커스가 있으면 판정 단축키가 물러난다", () => {
    mount();
    focusOn('<input type="text" aria-label="태그" />');

    ["p", "f", "n", "b"].forEach((key) => fireEvent.keyDown(window, { key }));

    expect(onVerdict).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("JIRA 이슈 키 칸에서도 판정 단축키가 물러난다", () => {
    mount();
    focusOn('<input type="text" aria-label="JIRA 이슈 키" />');

    fireEvent.keyDown(window, { key: "b" });

    expect(onVerdict).not.toHaveBeenCalled();
  });

  it("펼친 자동완성 목록 안에서도 물러난다 — 항목을 찾으려 치는 글자다", () => {
    mount();
    // MUI 는 열린 목록의 항목에 tabindex 를 붙여 포커스를 옮긴다
    focusOn('<li role="option" tabindex="-1">PASS 관련 태그</li>');

    fireEvent.keyDown(window, { key: "p" });

    expect(onVerdict).not.toHaveBeenCalled();
  });

  it("메모(여러 줄 입력)에서도 물러난다", () => {
    mount();
    focusOn("<textarea></textarea>");

    fireEvent.keyDown(window, { key: "f" });

    expect(onVerdict).not.toHaveBeenCalled();
  });

  it("입력칸의 Enter 는 저장으로 가지 않는다 — 태그 확정·자동완성 선택의 몫이다", () => {
    mount();
    focusOn('<input type="text" />');

    fireEvent.keyDown(window, { key: "Enter" });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("버튼 위의 Enter 도 저장으로 가지 않는다 — 그 버튼의 몫이다", () => {
    mount();
    focusOn("<button>태그 삭제</button>");

    fireEvent.keyDown(window, { key: "Enter" });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("체크박스 위의 Enter 는 저장으로 간다 — Enter 로 토글되지 않아 무반응이 되면 안 된다", () => {
    mount();
    focusOn('<input type="checkbox" />');

    // 기본 동작도 막는다 — 폼 제출까지 태우면 이중 저장이 된다
    const notPrevented = fireEvent.keyDown(window, { key: "Enter" });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(notPrevented).toBe(false);
  });

  it("키를 누른 채로 두어도 저장은 한 번만 — 자동 반복은 무시한다", () => {
    mount();

    fireEvent.keyDown(window, { key: "p" });
    fireEvent.keyDown(window, { key: "p", repeat: true });
    fireEvent.keyDown(window, { key: "p", repeat: true });
    fireEvent.keyDown(window, { key: "Enter", repeat: true });

    expect(onVerdict).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("자동 반복분도 기본 동작은 막는다 — 차단까지 건너뛰면 버튼 클릭·폼 제출로 샌다", () => {
    mount();

    expect(fireEvent.keyDown(window, { key: "p", repeat: true })).toBe(false);
    expect(fireEvent.keyDown(window, { key: "Enter", repeat: true })).toBe(
      false,
    );
  });

  it("입력칸 밖의 Enter 는 저장으로 간다", () => {
    mount();

    fireEvent.keyDown(window, { key: "Enter" });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("조합키가 눌린 단축키는 무시한다", () => {
    mount();

    fireEvent.keyDown(window, { key: "p", ctrlKey: true });
    fireEvent.keyDown(window, { key: "p", metaKey: true });
    fireEvent.keyDown(window, { key: "p", altKey: true });
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });

    expect(onVerdict).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("매핑에 없는 키는 아무 일도 하지 않는다", () => {
    mount();

    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onVerdict).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("enabled 가 false 면 단축키를 걸지 않는다 — 닫힌 화면·읽기 전용", () => {
    mount({ enabled: false });

    fireEvent.keyDown(window, { key: "p" });
    fireEvent.keyDown(window, { key: "Enter" });

    expect(onVerdict).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("화면을 벗어나면 리스너를 걷어낸다", () => {
    const { unmount } = mount();
    unmount();

    fireEvent.keyDown(window, { key: "p" });

    expect(onVerdict).not.toHaveBeenCalled();
  });

  it("판정 단축키는 기본 동작을 막는다 — 글자가 다른 곳에 들어가지 않도록", () => {
    mount();

    const notPrevented = fireEvent.keyDown(window, { key: "p" });

    expect(notPrevented).toBe(false);
  });
});
