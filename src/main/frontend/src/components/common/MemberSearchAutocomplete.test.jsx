import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import MemberSearchAutocomplete from "./MemberSearchAutocomplete.jsx";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));

const USERS = [
  { id: "u1", username: "kim", name: "김광명", email: "kim@example.com" },
  { id: "u2", username: "kimx", name: "김하나", email: "hana@example.com" },
];

/**
 * 사용자명을 손으로 적던 자리를 대신하는 검색 입력.
 * 두 글자 미만에서 서버를 부르면 사실상 전체 목록 조회가 되고,
 * 부모가 매 렌더 새 검색 함수를 넘길 때 다시 조회하면 입력이 멈추지 않는다.
 */
describe("MemberSearchAutocomplete", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  const setup = (search, props = {}) =>
    render(
      <MemberSearchAutocomplete
        value={null}
        onChange={vi.fn()}
        search={search}
        {...props}
      />,
    );

  // MUI Autocomplete 는 포커스가 없으면 입력값을 곧바로 되돌린다(선택값이 null 이라서).
  // 실제 사용자는 눌러서 포커스한 뒤 치므로 테스트도 그 순서를 지킨다.
  const type = (text) => {
    const input = screen.getByTestId("member-search-input");
    input.focus();
    fireEvent.change(input, { target: { value: text } });
  };

  it("두 글자 미만이면 서버를 부르지 않는다", async () => {
    const search = vi.fn().mockResolvedValue(USERS);
    setup(search);
    type("k");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(search).not.toHaveBeenCalled();
  });

  it("두 글자부터 한 번만 부르고 결과를 보여 준다", async () => {
    const search = vi.fn().mockResolvedValue(USERS);
    setup(search);
    type("ki");
    type("kim");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // 타이핑 중간값으로는 부르지 않는다 — 마지막 입력 하나만 조회한다
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith("kim");
    await waitFor(() => expect(screen.getByText("kimx")).toBeInTheDocument());
  });

  it("검색이 실패해도 목록만 비우고 화면은 살아 있다", async () => {
    const search = vi.fn().mockRejectedValue(new Error("boom"));
    setup(search);
    type("kim");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("member-search-input")).toBeInTheDocument();
  });
});
