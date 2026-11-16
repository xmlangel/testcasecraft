import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import FolderCaseList from "./FolderCaseList.jsx";

const longName =
  "결제 승인 이후 환불 요청을 다시 보냈을 때 중복 환불이 막히는지 확인한다";
const longId = "R039691-PAYMENT-REFUND-0001";
const longOwner = "qa-automation-account-01";

const folder = { id: "f1", type: "folder", name: "폴더" };
const items = [
  folder,
  {
    id: "c1",
    type: "testcase",
    name: longName,
    displayId: longId,
    createdBy: longOwner,
    description: "설명 ".repeat(40),
    parentId: "f1",
  },
];

describe("FolderCaseList 한 줄 표시·가로 스크롤 (ICT-495 cl-1)", () => {
  it.each([
    ["3단 compact", { compact: true }],
    ["좁은 칸 우선순위 숨김", { compact: true, hidePriority: true }],
    ["넓은 칸", {}],
  ])("%s: 이름·ID·소유자를 줄바꿈 없이 전부 그린다", (_label, props) => {
    render(<FolderCaseList folder={folder} items={items} {...props} />);

    const name = screen.getByTestId("folder-case-name-c1");
    expect(name).toHaveTextContent(longName);
    expect(name).toHaveStyle({ whiteSpace: "nowrap" });
    expect(name.textContent).not.toContain("…");

    const id = screen.getByTestId("folder-case-id-c1");
    expect(id).toHaveTextContent(longId);
    expect(id.firstChild).toHaveStyle({ whiteSpace: "nowrap" });
    expect(id.firstChild).not.toHaveStyle({ textOverflow: "ellipsis" });

    const owner = screen.getByTestId("folder-case-owner-c1");
    expect(owner).toHaveTextContent(longOwner);
    expect(owner.firstChild).toHaveStyle({ whiteSpace: "nowrap" });
    expect(owner.firstChild).not.toHaveStyle({ textOverflow: "ellipsis" });
  });

  it("표는 고정 배치를 쓰지 않고, 컨테이너에 가로 스크롤을 둔다", () => {
    render(<FolderCaseList folder={folder} items={items} compact />);
    expect(screen.getByTestId("folder-case-table")).toHaveStyle({
      tableLayout: "auto",
    });
    expect(screen.getByTestId("folder-case-table-container")).toHaveStyle({
      overflowX: "auto",
    });
  });
});
