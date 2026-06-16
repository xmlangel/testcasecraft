import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import KoreanAwareDataEditor from "./KoreanAwareDataEditor.jsx";

// react-spreadsheet 의 DataEditor 대체 컴포넌트. 한글 IME 조합 중 부모로의 onChange
// 전파를 막아 리렌더로 인한 조합 중단을 방지하는 것이 핵심 동작이다.
const getInput = (container) =>
  container.querySelector("input.Spreadsheet__data-editor");

describe("KoreanAwareDataEditor (IME 인지 셀 에디터)", () => {
  let onChange;
  let onCommit;
  const cell = { value: "", row: 0, column: 6 };

  beforeEach(() => {
    onChange = vi.fn();
    onCommit = vi.fn();
  });

  it("조합이 아닌 입력(영문/숫자)은 즉시 onChange 로 전파한다", () => {
    const { container } = render(
      <KoreanAwareDataEditor cell={cell} onChange={onChange} />,
    );
    const input = getInput(container);
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ ...cell, value: "abc" });
  });

  it("한글 조합 중에는 onChange 를 전파하지 않고, 조합 종료 시 최종값으로 한 번 전파한다", () => {
    const { container } = render(
      <KoreanAwareDataEditor cell={cell} onChange={onChange} />,
    );
    const input = getInput(container);

    // 조합 시작 → 중간 입력은 전파 안 함
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "가" } });
    expect(onChange).not.toHaveBeenCalled();

    // 조합 종료 → 최종값으로 1회 전파
    fireEvent.compositionEnd(input, { target: { value: "가" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ ...cell, value: "가" });
  });

  it("blur 시 onCommit 이 최신값으로 호출된다 (onCommit 우선)", () => {
    const { container } = render(
      <KoreanAwareDataEditor
        cell={cell}
        onChange={onChange}
        onCommit={onCommit}
      />,
    );
    const input = getInput(container);
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith({ ...cell, value: "hello" });
  });

  it("onCommit 이 없으면 blur 시 onChange 로 폴백한다", () => {
    const { container } = render(
      <KoreanAwareDataEditor cell={cell} onChange={onChange} />,
    );
    const input = getInput(container);
    fireEvent.change(input, { target: { value: "x" } });
    onChange.mockClear();
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith({ ...cell, value: "x" });
  });

  it("조합 중 Enter 는 스프레드시트로 전파되지 않는다(이동 차단)", () => {
    const onKeyDown = vi.fn();
    const { container } = render(
      <KoreanAwareDataEditor
        cell={cell}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />,
    );
    const input = getInput(container);
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter" });
    // 조합 중 Enter 는 onKeyDown(이동) 으로 전달되지 않아야 함
    expect(onKeyDown).not.toHaveBeenCalled();
  });
});
