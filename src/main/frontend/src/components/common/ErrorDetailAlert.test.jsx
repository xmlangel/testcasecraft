import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));

import ErrorDetailAlert from "./ErrorDetailAlert.jsx";

const LONG_ERROR =
  'OpenRouter API 호출 실패 (상태코드: 429 TOO_MANY_REQUESTS): [호출 주소: https://openrouter.ai/api/v1/chat/completions] {"error":{"message":"Provider returned error","code":429}}';

describe("ErrorDetailAlert", () => {
  it("긴 오류는 요약만 보이고 전문은 숨긴다", () => {
    render(<ErrorDetailAlert message={LONG_ERROR} />);

    expect(
      screen.getByText(
        "OpenRouter API 호출 실패 (상태코드: 429 TOO_MANY_REQUESTS)",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Provider returned error/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /자세히/ })).toBeInTheDocument();
  });

  it("자세히를 누르면 전문이 나오고 다시 누르면 접힌다", async () => {
    const user = userEvent.setup();
    render(<ErrorDetailAlert message={LONG_ERROR} />);

    await user.click(screen.getByRole("button", { name: /자세히/ }));
    expect(screen.getByText(/Provider returned error/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /접기/ }));
    // Collapse 는 애니메이션이 끝난 뒤 DOM 에서 빠진다.
    await waitFor(() =>
      expect(
        screen.queryByText(/Provider returned error/),
      ).not.toBeInTheDocument(),
    );
  });

  it("짧은 오류에는 자세히 버튼을 띄우지 않는다", () => {
    render(
      <ErrorDetailAlert message="유사도 검색 실패: Connection prematurely closed BEFORE response" />,
    );

    expect(
      screen.getByText(
        "유사도 검색 실패: Connection prematurely closed BEFORE response",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /자세히/ }),
    ).not.toBeInTheDocument();
  });

  it("메시지가 비고 자식도 없으면 아무것도 그리지 않는다", () => {
    const { container } = render(<ErrorDetailAlert message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("펼친 뒤 전문을 복사할 수 있다", async () => {
    // userEvent.setup() 이 navigator.clipboard 를 자체 구현으로 갈아끼우므로
    // 그 뒤에 우리 mock 을 심어야 한다.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ErrorDetailAlert message={LONG_ERROR} />);

    await user.click(screen.getByRole("button", { name: /자세히/ }));
    await user.click(screen.getByRole("button", { name: /전문 복사/ }));

    expect(writeText).toHaveBeenCalledWith(LONG_ERROR);
  });
});
