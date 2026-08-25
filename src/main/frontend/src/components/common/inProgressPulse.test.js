import { describe, it, expect } from "vitest";
import {
  IN_PROGRESS_CHIP_SX,
  IN_PROGRESS_CHIP_WITH_ICON_SX,
  isInProgressStatus,
} from "./inProgressPulse.js";

// 목록에서 진행 중인 실행·플랜만 움직인다. 끝난 것까지 움직이면 무엇이 도는지
// 다시 구별할 수 없어, 판정 함수가 진행 중만 참을 주는 것이 이 기능의 전부다.
describe("isInProgressStatus", () => {
  it("진행 중 표기 두 가지를 모두 알아본다", () => {
    expect(isInProgressStatus("IN_PROGRESS")).toBe(true);
    expect(isInProgressStatus("INPROGRESS")).toBe(true);
  });

  it("소문자와 공백·하이픈이 섞여도 알아본다", () => {
    expect(isInProgressStatus("in_progress")).toBe(true);
    expect(isInProgressStatus("in progress")).toBe(true);
    expect(isInProgressStatus("in-progress")).toBe(true);
  });

  it("끝난 것과 시작하지 않은 것은 움직이지 않는다", () => {
    for (const status of [
      "COMPLETED",
      "NOT_STARTED",
      "NOTSTARTED",
      "ABORTED",
      "CANCELLED",
      "",
      null,
      undefined,
    ]) {
      expect(isInProgressStatus(status)).toBe(false);
    }
  });
});

describe("진행 중 칩 sx", () => {
  it("움직임을 넣는다", () => {
    expect(IN_PROGRESS_CHIP_SX.animation).toContain("infinite");
  });

  it("동작 최소화 설정에서는 멈춘다", () => {
    expect(
      IN_PROGRESS_CHIP_SX["@media (prefers-reduced-motion: reduce)"].animation,
    ).toBe("none");
  });

  it("아이콘까지 도는 변형은 칩과 아이콘을 함께 다룬다", () => {
    expect(IN_PROGRESS_CHIP_WITH_ICON_SX.animation).toContain("infinite");
    expect(
      IN_PROGRESS_CHIP_WITH_ICON_SX["& .MuiChip-icon"].animation,
    ).toContain("infinite");
    const reduced =
      IN_PROGRESS_CHIP_WITH_ICON_SX["@media (prefers-reduced-motion: reduce)"];
    expect(reduced.animation).toBe("none");
    expect(reduced["& .MuiChip-icon"].animation).toBe("none");
  });
});
