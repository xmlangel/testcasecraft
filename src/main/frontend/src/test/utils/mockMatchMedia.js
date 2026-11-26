// 화면 폭 흉내 — jsdom 에는 window.matchMedia 가 없어 MUI useMediaQuery 가 늘 false 다.
// 폭(px)을 받아 "(max-width:Npx)" · "(min-width:Npx)" 쿼리를 그 폭으로 판정한다.
// 반환한 함수를 부르면 원래 상태로 되돌린다.
import { vi } from "vitest";

const evaluate = (query, width) => {
  const parts = query.match(/\((max|min)-width:\s*([\d.]+)px\)/g) || [];
  if (parts.length === 0) return false;
  return parts.every((part) => {
    const [, kind, value] = part.match(/\((max|min)-width:\s*([\d.]+)px\)/);
    const px = Number(value);
    return kind === "max" ? width <= px : width >= px;
  });
};

export function mockViewportWidth(width) {
  const original = window.matchMedia;
  window.matchMedia = vi.fn((query) => ({
    matches: evaluate(query, width),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  return () => {
    if (original === undefined) {
      delete window.matchMedia;
    } else {
      window.matchMedia = original;
    }
  };
}
