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

  it("role=null(비로그인 상태 아님)이어도 인증된 사용자면 생성 버튼을 본다", async () => {
    // 백엔드 ProjectSecurityService.canCreateProject(organizationId=null)는
    // 독립 프로젝트 생성을 role 값과 무관하게 인증된 사용자 전원에게 허용한다.
    // "VIEWER"/"USER"는 애초에 User.role(ADMIN/MANAGER/TESTER/null)에 존재하지 않는 값이라
    // 시스템 role로 이 케이스를 검증하는 것 자체가 성립하지 않는다.
    appCtx.value = baseCtx({ user: { id: 2, role: null } });
    render(<ProjectManager onSelectProject={vi.fn()} />);
    expect(
      await screen.findByRole("button", { name: "새 프로젝트 생성" }),
    ).toBeInTheDocument();
  });

  it("user가 없으면(비로그인) 생성 버튼을 보지 못한다", async () => {
    appCtx.value = baseCtx({ user: null });
    render(<ProjectManager onSelectProject={vi.fn()} />);
    await screen.findByText("참여 중인 프로젝트가 없습니다");
    expect(
      screen.queryByRole("button", { name: "새 프로젝트 생성" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "프로젝트 생성" })).toBeNull();
  });
});
