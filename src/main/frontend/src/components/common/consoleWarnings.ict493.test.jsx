import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { createTheme } from "@mui/material/styles";
import MarkdownViewer from "./MarkdownViewer.jsx";
import RichMarkdownEditor from "../TestCase/RichMarkdownEditor.jsx";

// ICT-493: 케이스 화면 콘솔에 나던 경고 두 가지가 다시 나지 않는지 확인한다.
// - 함수 컴포넌트(ScrollHint)에 ref 를 넘겼다는 경고
// - Emotion 의 :first-child SSR 경고
const theme = createTheme();
const t = (key, fallback) => fallback || key;

const messages = (spy) =>
  spy.mock.calls.map((args) => args.map(String).join(" "));

const captureConsole = () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  return () => [...messages(error), ...messages(warn)];
};

describe("콘솔 경고 (ICT-493)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("MarkdownViewer 는 ScrollHint 에 ref 를 넘기지 않는다", () => {
    const logged = captureConsole();

    render(<MarkdownViewer content={"첫째 문단\n\n둘째 문단"} />);

    expect(logged().filter((m) => m.includes("cannot be given refs"))).toEqual(
      [],
    );
  });

  it("RichMarkdownEditor 는 ref 경고와 :first-child 경고를 내지 않는다", () => {
    const logged = captureConsole();

    render(
      <RichMarkdownEditor
        label="설명"
        value={"# 제목\n\n첫 문단"}
        height={200}
        theme={theme}
        t={t}
        onChange={() => {}}
        testid="ict493"
      />,
    );

    const hits = logged().filter(
      (m) => m.includes("cannot be given refs") || m.includes(":first-child"),
    );
    expect(hits).toEqual([]);
  });
});
