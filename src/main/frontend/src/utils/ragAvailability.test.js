import { describe, it, expect } from "vitest";
import {
  RAG_STATE,
  resolveRagState,
  canWriteVectors,
  canQuery,
} from "./ragAvailability.js";

describe("resolveRagState", () => {
  it("둘 다 켜져 있으면 전부 가능", () => {
    expect(
      resolveRagState({ ragEnabled: true, vectorWriteEnabled: true }),
    ).toBe(RAG_STATE.FULL);
  });

  it("색인만 꺼지면 질문은 된다", () => {
    expect(
      resolveRagState({ ragEnabled: true, vectorWriteEnabled: false }),
    ).toBe(RAG_STATE.QUERY_ONLY);
  });

  it("RAG 가 꺼지면 색인 설정과 무관하게 전부 막힌다", () => {
    // 색인이 켜져 있어도 질문 경로가 먼저 막히므로 DISABLED 다.
    expect(
      resolveRagState({ ragEnabled: false, vectorWriteEnabled: true }),
    ).toBe(RAG_STATE.DISABLED);
    expect(
      resolveRagState({ ragEnabled: false, vectorWriteEnabled: false }),
    ).toBe(RAG_STATE.DISABLED);
  });

  it("값이 없으면 켜진 것으로 본다", () => {
    // 서버가 값을 두지 않았을 때의 기본값과 같아야 한다.
    expect(resolveRagState({})).toBe(RAG_STATE.FULL);
    expect(resolveRagState(null)).toBe(RAG_STATE.FULL);
    expect(resolveRagState(undefined)).toBe(RAG_STATE.FULL);
  });
});

describe("canWriteVectors", () => {
  it("전부 켜졌을 때만 참", () => {
    expect(
      canWriteVectors({ ragEnabled: true, vectorWriteEnabled: true }),
    ).toBe(true);
    expect(
      canWriteVectors({ ragEnabled: true, vectorWriteEnabled: false }),
    ).toBe(false);
    expect(
      canWriteVectors({ ragEnabled: false, vectorWriteEnabled: true }),
    ).toBe(false);
  });
});

describe("canQuery", () => {
  it("RAG 가 켜져 있으면 색인이 꺼져도 참", () => {
    expect(canQuery({ ragEnabled: true, vectorWriteEnabled: false })).toBe(
      true,
    );
    expect(canQuery({ ragEnabled: true, vectorWriteEnabled: true })).toBe(true);
  });

  it("RAG 가 꺼지면 거짓", () => {
    expect(canQuery({ ragEnabled: false, vectorWriteEnabled: true })).toBe(
      false,
    );
  });
});
