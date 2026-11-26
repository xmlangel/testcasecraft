import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { APP_TITLE, buildDocumentTitle } from "./documentTitle";
import useDocumentTitle from "../hooks/useDocumentTitle";

/** ICT-511: 탭 제목을 "<화면 이름> · Testcase Craft" 로 맞춘다. */
describe("브라우저 탭 제목 (ICT-511)", () => {
  it("화면 이름이 있으면 '<화면 이름> · Testcase Craft'", () => {
    expect(buildDocumentTitle("테스트케이스")).toBe(
      "테스트케이스 · Testcase Craft",
    );
  });

  it("화면 이름이 없으면 제품명만", () => {
    expect(buildDocumentTitle(null)).toBe(APP_TITLE);
    expect(buildDocumentTitle("  ")).toBe(APP_TITLE);
    expect(APP_TITLE).toBe("Testcase Craft");
  });

  it("훅이 document.title 을 바꾸고, 화면이 사라지면 제품명으로 돌린다", () => {
    const Screen = ({ name }) => {
      useDocumentTitle(name);
      return null;
    };
    const { rerender, unmount } = render(<Screen name="대시보드" />);
    expect(document.title).toBe("대시보드 · Testcase Craft");
    rerender(<Screen name="테스트실행" />);
    expect(document.title).toBe("테스트실행 · Testcase Craft");
    unmount();
    expect(document.title).toBe("Testcase Craft");
  });
});
