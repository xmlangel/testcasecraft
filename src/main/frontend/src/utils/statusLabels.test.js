import { describe, it, expect } from "vitest";
import {
  getCharterStatusLabel,
  getExecutionStatusLabel,
  getPriorityLabel,
} from "./statusLabels";

/**
 * ICT-511: 상태·우선순위 enum 이 화면에 영문 대문자로 그대로 나오지 않게 한다.
 * 번역 함수가 주는 문구를 쓰고, 번역이 없으면 한국어 기본값을 쓴다.
 */
const koT = (_key, fallback) => fallback;
const enT = (key) =>
  ({
    "testExecution.status.inProgress": "In Progress",
    "exploratory.charter.status.active": "Active",
    "testCase.priority.high": "High",
  })[key];

describe("상태 라벨 매핑 (ICT-511)", () => {
  it.each([
    ["INPROGRESS", "진행 중"],
    ["IN_PROGRESS", "진행 중"],
    ["inprogress", "진행 중"],
    ["NOTSTARTED", "시작 전"],
    ["COMPLETED", "완료"],
  ])("실행 상태 %s → %s", (status, expected) => {
    expect(getExecutionStatusLabel(status, koT)).toBe(expected);
  });

  it("실행 상태는 번역 키로 현지화한다", () => {
    expect(getExecutionStatusLabel("INPROGRESS", enT)).toBe("In Progress");
  });

  it("차터 상태 ACTIVE·ARCHIVED 를 현지화한다", () => {
    expect(getCharterStatusLabel("ACTIVE", koT)).toBe("활성");
    expect(getCharterStatusLabel("ARCHIVED", koT)).toBe("보관됨");
    expect(getCharterStatusLabel("ACTIVE", enT)).toBe("Active");
  });

  it("우선순위 HIGH·MEDIUM·LOW 를 현지화한다", () => {
    expect(getPriorityLabel("HIGH", koT)).toBe("높음");
    expect(getPriorityLabel("MEDIUM", koT)).toBe("보통");
    expect(getPriorityLabel("LOW", koT)).toBe("낮음");
    expect(getPriorityLabel("HIGH", enT)).toBe("High");
  });

  it("번역 함수가 없어도 한국어 기본값을 쓴다", () => {
    expect(getExecutionStatusLabel("INPROGRESS")).toBe("진행 중");
  });

  it("모르는 값은 원래 값을, 빈 값은 빈 문자열을 돌려준다", () => {
    expect(getExecutionStatusLabel("PAUSED", koT)).toBe("PAUSED");
    expect(getPriorityLabel(null, koT)).toBe("");
    expect(getCharterStatusLabel(undefined, koT)).toBe("");
  });
});
