// Vitest 전역 셋업 — Testing Library jest-dom matcher 등록 + 각 테스트 후 정리
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
