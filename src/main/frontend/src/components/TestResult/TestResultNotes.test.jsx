import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TestResultNotes from "./TestResultNotes.jsx";

const t = (key, fallback) => fallback || key;

const renderNotes = (props = {}) =>
  render(
    <TestResultNotes
      notes="QA 메모 내용"
      setNotes={vi.fn()}
      isViewer={false}
      t={t}
      darkMode={false}
      {...props}
    />,
  );

describe("TestResultNotes", () => {
  it("비고 라벨과 글자 수 카운터를 렌더링한다", () => {
    renderNotes();
    expect(screen.getByText("비고")).toBeInTheDocument();
    // "12/10,000" 형태의 카운터
    expect(screen.getByText(/\/10,000/)).toBeInTheDocument();
  });

  it("노트 내용이 있으면 복사 버튼을 노출한다", () => {
    renderNotes();
    expect(
      screen.getByRole("button", { name: "노트 복사" }),
    ).toBeInTheDocument();
  });

  it("노트가 비어 있으면 복사 버튼을 노출하지 않는다", () => {
    renderNotes({ notes: "" });
    expect(screen.queryByRole("button", { name: "노트 복사" })).toBeNull();
  });
});
