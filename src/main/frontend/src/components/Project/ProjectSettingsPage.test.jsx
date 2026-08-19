import { describe, it, expect } from "vitest";
import { resolveProjectId } from "./ProjectSettingsPage.jsx";

/**
 * 이 화면은 전역 레이아웃(`/*` 라우트) 안에서 그려져 useParams 가 비어 있다.
 * 주소에서 프로젝트를 읽지 못하면 역할을 조회할 대상이 없어, 시스템 관리자에게도
 * "권한 없음" 이 뜬다. 실제로 그 회귀가 났으므로 세 경로를 모두 고정한다.
 */
describe("resolveProjectId", () => {
  it("라우트 파라미터가 있으면 그것을 쓴다", () => {
    expect(
      resolveProjectId("p-route", "/projects/p-path/settings", {
        id: "p-active",
      }),
    ).toBe("p-route");
  });

  it("파라미터가 없으면 주소에서 읽는다", () => {
    expect(
      resolveProjectId(undefined, "/projects/p-path/settings", {
        id: "p-active",
      }),
    ).toBe("p-path");
  });

  it("주소에서도 못 읽으면 선택된 프로젝트로 떨어진다", () => {
    expect(resolveProjectId(undefined, "/projects", { id: "p-active" })).toBe(
      "p-active",
    );
  });

  it("셋 다 없으면 null — 권한 없음이 아니라 판정 대상 없음이다", () => {
    expect(resolveProjectId(undefined, "/projects", null)).toBeNull();
    expect(resolveProjectId(undefined, undefined, undefined)).toBeNull();
  });
});
