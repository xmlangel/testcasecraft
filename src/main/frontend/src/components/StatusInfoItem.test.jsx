import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusInfoItem from "./StatusInfoItem.jsx";

// ICT-513: 실행 요약 카드의 「상태:」「시작일시:」「종료일시:」 라벨이
// 「상 / 태:」처럼 두 줄로 깨지지 않아야 한다.
describe("StatusInfoItem compact", () => {
  it("라벨과 값을 줄바꿈하지 않는다", () => {
    render(
      <StatusInfoItem label="시작일시" value="2026. 05. 21. 18:13" compact />,
    );
    expect(screen.getByText("시작일시:")).toHaveStyle({ whiteSpace: "nowrap" });
    expect(screen.getByText("2026. 05. 21. 18:13")).toHaveStyle({
      whiteSpace: "nowrap",
    });
  });
});
