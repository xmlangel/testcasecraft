import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// 컨텍스트·서비스 모킹 — 빈 상태 렌더와 권한 분기만 검증
const appCtx = { value: null };
vi.mock("../context/AppContext", () => ({
  useAppContext: () => appCtx.value,
}));
vi.mock("../context/I18nContext", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));
vi.mock("../services/organizationService", () => ({
  OrganizationService: class {
    async getOrganizations() {
      return [];
    }
  },
}));
vi.mock("../services/junitResultService.js", () => ({
  default: {
    getBatchProjectJunitSummary: async () => ({
      success: true,
      summaries: {},
    }),
  },
}));

import ProjectManager from "./ProjectManager.jsx";

const baseCtx = (overrides = {}) => ({
  api: vi.fn(),
  projects: [],
  projectsLoading: false,
  addProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  fetchProjects: vi.fn().mockResolvedValue([]),
  user: { id: 1, role: "ADMIN" },
  ...overrides,
});

describe("ProjectManager (빈 상태/권한)", () => {
  beforeEach(() => {
    appCtx.value = baseCtx();
  });

  it("프로젝트가 없으면 안내 문구를 보여준다", async () => {
    render(<ProjectManager onSelectProject={vi.fn()} />);
    expect(
      await screen.findByText("참여 중인 프로젝트가 없습니다"),
    ).toBeInTheDocument();
  });

  it("생성 권한이 있으면(ADMIN) 새 프로젝트 생성 버튼을 노출한다", async () => {
    appCtx.value = baseCtx({ user: { id: 1, role: "ADMIN" } });
    render(<ProjectManager onSelectProject={vi.fn()} />);
    expect(
      await screen.findByRole("button", { name: "새 프로젝트 생성" }),
    ).toBeInTheDocument();
  });

  it("VIEWER 는 생성 버튼(헤더·빈 상태 모두)을 보지 못한다", async () => {
    appCtx.value = baseCtx({ user: { id: 2, role: "VIEWER" } });
    render(<ProjectManager onSelectProject={vi.fn()} />);
    // 빈 상태 문구가 뜰 때까지 대기 후 버튼 부재 확인
    await screen.findByText("참여 중인 프로젝트가 없습니다");
    expect(
      screen.queryByRole("button", { name: "새 프로젝트 생성" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "프로젝트 생성" })).toBeNull();
  });
});
