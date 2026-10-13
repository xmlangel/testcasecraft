import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RequirementDialog } from "./RequirementDialogs.jsx";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));

vi.mock("../TestCase/MarkdownFieldEditor.jsx", () => ({
  default: () => null,
}));

const specs = [
  { id: "s1", docId: "R-ONTS-001", title: "결제", parentId: null },
  { id: "s2", docId: "R-ONTS-002", title: "배송", parentId: null },
];

const docIdInput = () => screen.getByTestId("requirement-doc-id");

const renderDialog = (props) =>
  render(
    <RequirementDialog
      open
      specs={specs}
      onClose={() => {}}
      onSubmit={() => {}}
      {...props}
    />,
  );

describe("RequirementDialog 자동 번호", () => {
  it("새 요구사항은 선택한 문서의 다음 번호로 채운다", async () => {
    const suggestDocId = vi.fn().mockResolvedValue("R-ONTS-001-004");
    renderDialog({ initial: { specId: "s1" }, suggestDocId });

    await waitFor(() => expect(docIdInput().value).toBe("R-ONTS-001-004"));
    expect(suggestDocId).toHaveBeenCalledWith("s1");
  });

  const chooseSpec = async (label) => {
    fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
    fireEvent.click(await screen.findByRole("option", { name: label }));
  };

  it("고치지 않은 번호는 문서를 바꾸면 그 문서의 번호로 바뀐다", async () => {
    const suggestDocId = vi.fn((specId) =>
      Promise.resolve(specId === "s1" ? "R-ONTS-001-004" : "R-ONTS-002-001"),
    );
    renderDialog({ initial: { specId: "s1" }, suggestDocId });
    await waitFor(() => expect(docIdInput().value).toBe("R-ONTS-001-004"));

    await chooseSpec("R-ONTS-002 · 배송");

    await waitFor(() => expect(docIdInput().value).toBe("R-ONTS-002-001"));
  });

  it("직접 고친 ID 는 문서를 바꿔도 덮어쓰지 않는다", async () => {
    const suggestDocId = vi.fn((specId) =>
      Promise.resolve(specId === "s1" ? "R-ONTS-001-004" : "R-ONTS-002-001"),
    );
    renderDialog({ initial: { specId: "s1" }, suggestDocId });
    await waitFor(() => expect(docIdInput().value).toBe("R-ONTS-001-004"));

    fireEvent.change(docIdInput(), { target: { value: "CUSTOM-1" } });
    await chooseSpec("R-ONTS-002 · 배송");

    await waitFor(() => expect(suggestDocId).toHaveBeenCalledWith("s2"));
    expect(docIdInput().value).toBe("CUSTOM-1");
  });

  it("수정할 때는 번호를 받아 오지 않는다", async () => {
    const suggestDocId = vi.fn();
    renderDialog({
      initial: { id: "r1", specId: "s1", docId: "R-ONTS-001-002" },
      suggestDocId,
    });

    expect(docIdInput().value).toBe("R-ONTS-001-002");
    expect(suggestDocId).not.toHaveBeenCalled();
  });
});
