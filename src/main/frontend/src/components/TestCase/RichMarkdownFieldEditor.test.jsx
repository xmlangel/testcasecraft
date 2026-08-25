import React, { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { createTheme } from "@mui/material/styles";
import RichMarkdownFieldEditor from "./RichMarkdownFieldEditor.jsx";

const theme = createTheme();
const t = (key, fallback) => fallback || key;

const Harness = ({ initial = "", onChangeSpy, isViewer = false }) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <RichMarkdownFieldEditor
        label="설명"
        value={value}
        placeholder="폴더 설명"
        height={200}
        isViewer={isViewer}
        theme={theme}
        t={t}
        onChange={(next) => {
          setValue(next);
          onChangeSpy?.(next);
        }}
        testid="folder-desc"
      />
      <pre data-testid="value-mirror">{value}</pre>
    </>
  );
};

/*
 * jsdom 은 elementFromPoint 와 getClientRects 를 구현하지 않는다. ProseMirror 는
 * 마우스 입력을 좌표로 위치를 찾고 DOM 변화를 관찰해 문서에 반영하므로, 포커스·타이핑·
 * 툴바 클릭·표 삽입처럼 실제 입력이 끼는 동작은 이 환경에서 검증할 수 없다
 * (elementFromPoint is not a function / readDOMChange 예외). 그래서 여기서는 렌더
 * 결과와 권한, 외부 값 동기화만 확인하고, 입력 동작은 실제 브라우저에서 확인했다.
 */
describe("RichMarkdownFieldEditor", () => {
  it("마크다운 값을 서식으로 렌더한다", () => {
    render(
      <Harness
        initial={
          "## 제목\n\n- [x] 완료\n\n| 항목 | 값 |\n| --- | --- |\n| 표 | ok |\n"
        }
      />,
    );
    const surface = screen.getByTestId("folder-desc");
    expect(within(surface).getByText("제목").tagName).toBe("H2");
    expect(surface.querySelectorAll("table").length).toBe(1);
    expect(surface.querySelectorAll("th").length).toBe(2);
    expect(surface.querySelectorAll('input[type="checkbox"]').length).toBe(1);
  });

  it("툴바 버튼을 편집 가능 상태에서 모두 노출한다", () => {
    render(<Harness />);
    for (const key of [
      "bold",
      "italic",
      "code",
      "heading",
      "quote",
      "bulletList",
      "orderedList",
      "taskList",
      "table",
    ]) {
      expect(screen.getByTestId(`rich-md-${key}`)).toBeTruthy();
    }
  });

  it("뷰어 권한이면 편집할 수 없고 툴바가 없다", () => {
    render(<Harness initial="읽기 전용" isViewer />);
    expect(
      screen.getByTestId("folder-desc").getAttribute("contenteditable"),
    ).toBe("false");
    expect(screen.queryByTestId("rich-md-bold")).toBeNull();
  });

  it("외부에서 값이 바뀌면 본문에 반영한다", () => {
    const { rerender } = render(
      <RichMarkdownFieldEditor
        label="설명"
        value="처음 값"
        theme={theme}
        t={t}
        onChange={() => {}}
        testid="ext"
        height={120}
      />,
    );
    expect(screen.getByTestId("ext").textContent).toContain("처음 값");
    rerender(
      <RichMarkdownFieldEditor
        label="설명"
        value="바뀐 값"
        theme={theme}
        t={t}
        onChange={() => {}}
        testid="ext"
        height={120}
      />,
    );
    expect(screen.getByTestId("ext").textContent).toContain("바뀐 값");
  });
});
