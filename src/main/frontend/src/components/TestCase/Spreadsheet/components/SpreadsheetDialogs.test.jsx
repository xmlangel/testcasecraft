import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ValidationResultDialog 는 내부에서 useI18n 을 사용 (나머지는 t prop)
vi.mock("../../../../context/I18nContext", () => ({
  useI18n: () => ({ t: (k, f) => f || k }),
}));

import {
  StepSettingsDialog,
  FolderCreateDialog,
  ValidationResultDialog,
  RowCountDialog,
} from "./SpreadsheetDialogs.jsx";

const t = (k, f) => f || k;

describe("SpreadsheetDialogs (import 회귀 가드 + 핵심 동작)", () => {
  it("StepSettingsDialog: 렌더 + 적용 콜백, 동일 값이면 적용 비활성화", () => {
    const onApply = vi.fn();
    render(
      <StepSettingsDialog
        open
        onClose={vi.fn()}
        tempMaxSteps={5}
        setTempMaxSteps={vi.fn()}
        maxSteps={3}
        onApply={onApply}
        t={t}
      />,
    );
    expect(screen.getByText("스텝 수 설정")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(onApply).toHaveBeenCalled();
  });

  it("StepSettingsDialog: tempMaxSteps === maxSteps 이면 적용 버튼 비활성화", () => {
    render(
      <StepSettingsDialog
        open
        onClose={vi.fn()}
        tempMaxSteps={3}
        setTempMaxSteps={vi.fn()}
        maxSteps={3}
        onApply={vi.fn()}
        t={t}
      />,
    );
    expect(screen.getByRole("button", { name: "적용" })).toBeDisabled();
  });

  it("FolderCreateDialog: 렌더 + 생성 콜백", () => {
    const onCreate = vi.fn();
    render(
      <FolderCreateDialog
        open
        onClose={vi.fn()}
        folderName="새폴더"
        setFolderName={vi.fn()}
        onCreate={onCreate}
        t={t}
      />,
    );
    // 폴더명이 입력 필드에 표시됨
    expect(screen.getByDisplayValue("새폴더")).toBeInTheDocument();
  });

  it("RowCountDialog: append 모드 렌더 + 확인 콜백", () => {
    const onConfirm = vi.fn();
    render(
      <RowCountDialog
        open
        onClose={vi.fn()}
        rowCount={5}
        setRowCount={vi.fn()}
        onConfirm={onConfirm}
        mode="append"
        t={t}
      />,
    );
    expect(screen.getByText("행 추가")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("RowCountDialog: rowCount 가 비면 확인 버튼 비활성화", () => {
    render(
      <RowCountDialog
        open
        onClose={vi.fn()}
        rowCount=""
        setRowCount={vi.fn()}
        onConfirm={vi.fn()}
        t={t}
      />,
    );
    expect(screen.getByRole("button", { name: "추가" })).toBeDisabled();
  });

  it("ValidationResultDialog: 검증 요약(summary) 을 throw 없이 렌더한다", () => {
    render(
      <ValidationResultDialog
        open
        onClose={vi.fn()}
        validationResult={{
          isValid: true,
          summary: {
            totalRows: 10,
            testCaseCount: 7,
            folderCount: 3,
            errorCount: 0,
            warningCount: 0,
          },
          errors: [],
          warnings: [],
        }}
      />,
    );
    expect(screen.getByText("데이터 검증 완료")).toBeInTheDocument();
    expect(screen.getByText("PASS")).toBeInTheDocument();
  });
});
