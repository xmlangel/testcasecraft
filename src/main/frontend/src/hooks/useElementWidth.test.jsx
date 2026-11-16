import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useElementWidth from "./useElementWidth.js";

/**
 * 케이스 화면 3단 분할은 이 훅이 돌려준 폭으로 상세 칸 폭을 정한다. 폭이 0 이면 아직 재지 못한
 * 것으로 보고 상세 칸을 기본 폭(640)으로 그린다.
 *
 * ResizeObserver 알림은 브라우저가 화면을 그릴 때만 온다. 가려진 창이나 뒤쪽 탭에서 연 화면은
 * 알림이 오지 않아 2000px 창에서 목록 924 · 상세 640 으로 그려졌다(ICT-494 tl-4).
 * 알림이 전혀 오지 않아도 붙는 순간의 실제 폭을 돌려줘야 한다.
 */

const makeNode = (width, style = {}) => {
  const node = document.createElement("div");
  node.getBoundingClientRect = () => ({ width });
  Object.assign(node.style, style);
  return node;
};

// 알림을 한 번도 보내지 않는 ResizeObserver(가려진 창과 같은 상태)
class SilentResizeObserver {
  static instances = [];
  constructor(callback) {
    this.callback = callback;
    this.disconnected = false;
    SilentResizeObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
}

describe("useElementWidth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    SilentResizeObserver.instances = [];
  });

  it("ResizeObserver 알림이 오지 않아도 붙는 순간의 폭을 돌려준다", () => {
    vi.stubGlobal("ResizeObserver", SilentResizeObserver);
    const { result } = renderHook(() => useElementWidth());

    act(() => result.current[0](makeNode(1570)));

    expect(result.current[1]).toBe(1570);
  });

  it("안쪽 여백과 테두리를 빼고 잰다(ResizeObserver contentRect 와 같은 기준)", () => {
    vi.stubGlobal("ResizeObserver", SilentResizeObserver);
    const { result } = renderHook(() => useElementWidth());

    act(() =>
      result.current[0](
        makeNode(1570, {
          paddingLeft: "12px",
          paddingRight: "8px",
          borderLeftWidth: "1px",
          borderRightWidth: "1px",
          borderStyle: "solid",
        }),
      ),
    );

    expect(result.current[1]).toBe(1548);
  });

  it("ResizeObserver 가 없는 환경에서도 직접 잰 폭을 쓴다", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const { result } = renderHook(() => useElementWidth());

    act(() => result.current[0](makeNode(1442)));

    expect(result.current[1]).toBe(1442);
  });

  it("창 resize 이벤트가 오면 다시 잰다", () => {
    vi.stubGlobal("ResizeObserver", SilentResizeObserver);
    const { result } = renderHook(() => useElementWidth());
    let width = 1200;
    const node = makeNode(0);
    node.getBoundingClientRect = () => ({ width });

    act(() => result.current[0](node));
    expect(result.current[1]).toBe(1200);

    width = 1570;
    act(() => window.dispatchEvent(new Event("resize")));
    expect(result.current[1]).toBe(1570);
  });

  it("ResizeObserver 알림이 오면 그 폭을 따른다", () => {
    vi.stubGlobal("ResizeObserver", SilentResizeObserver);
    const { result } = renderHook(() => useElementWidth());

    act(() => result.current[0](makeNode(900)));
    act(() =>
      SilentResizeObserver.instances[0].callback([
        { contentRect: { width: 1102.4 } },
      ]),
    );

    expect(result.current[1]).toBe(1102);
  });

  it("떼어 내면 observer 와 resize 구독을 모두 끊는다", () => {
    vi.stubGlobal("ResizeObserver", SilentResizeObserver);
    const { result } = renderHook(() => useElementWidth());
    let width = 800;
    const node = makeNode(0);
    node.getBoundingClientRect = () => ({ width });

    act(() => result.current[0](node));
    act(() => result.current[0](null));
    expect(SilentResizeObserver.instances[0].disconnected).toBe(true);

    width = 1600;
    act(() => window.dispatchEvent(new Event("resize")));
    expect(result.current[1]).toBe(800);
  });
});
