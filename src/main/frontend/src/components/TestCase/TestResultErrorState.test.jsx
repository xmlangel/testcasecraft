import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TestResultErrorState from "./TestResultErrorState.jsx";

const t = (key, fallback) => fallback || key;

describe("TestResultErrorState", () => {
  it("에러 메시지와 재시도/새로고침 버튼을 렌더링한다", () => {
    render(<TestResultErrorState error="서버 오류" onRetry={vi.fn()} t={t} />);
    expect(screen.getByText("서버 오류")).toBeInTheDocument();
    expect(screen.getByText("새로고침")).toBeInTheDocument();
    expect(screen.getByText("다시 시도")).toBeInTheDocument();
  });

  it("다시 시도 클릭 시 onRetry 를 호출한다", () => {
    const onRetry = vi.fn();
    render(<TestResultErrorState error="x" onRetry={onRetry} t={t} />);
    fireEvent.click(screen.getByText("다시 시도"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
