import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "../../context/ThemeContext.jsx";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, def) => (typeof def === "string" ? def : key) }),
}));

import ChatHeader from "./ChatHeader.jsx";

// ICT-509: 주 색 머리 띠 위의 모델 선택 상자는 밝은 바탕을 깔아 칩 글자가 읽히게 한다.
describe("ChatHeader 모델 선택 상자 대비", () => {
  it("선택 상자 바탕이 주 색 띠와 다른 밝은 색이다", () => {
    const theme = createAppTheme("light");
    render(
      <ThemeProvider theme={theme}>
        <ChatHeader
          isAdmin
          activeLlmConfigs={[
            { id: "c1", provider: "OPENWEBUI", modelName: "gemma4", isDefault: true },
          ]}
          selectedLlmConfigId="c1"
          onLlmConfigChange={vi.fn()}
          isFullScreen={false}
          onToggleFullScreen={vi.fn()}
          onRetry={vi.fn()}
          onClearChat={vi.fn()}
          messages={[]}
          isLoading={false}
          persistConversation={false}
        />
      </ThemeProvider>,
    );
    const select = screen.getByTestId("rag-llm-config-select");
    const bg = getComputedStyle(select).backgroundColor;
    expect(bg).toBe("rgb(248, 250, 252)"); // background.default #F8FAFC
    expect(screen.getByText("OPENWEBUI / gemma4")).toBeInTheDocument();
  });
});
