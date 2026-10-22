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
const orgsMock = { value: [] };
vi.mock("../services/organizationService", () => ({
  OrganizationService: class {
    async getOrganizations() {
      return orgsMock.value;
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
    orgsMock.value = [];
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

const orgProject = (id, org) => ({
  id,
  name: `project-${id}`,
  code: `P${id}`,
  organizationId: org.id,
  organization: org,
  testCaseCount: 0,
  memberCount: 1,
});

describe("ProjectManager (조직 멤버가 아닌 사용자)", () => {
  const orgA = { id: "org-a", name: "조직 A", description: "" };
  const orgB = { id: "org-b", name: "조직 B", description: "" };

  beforeEach(() => {
    orgsMock.value = [];
  });

  const ctxWith = (projects) =>
    baseCtx({
      api: vi.fn().mockResolvedValue({ ok: false, json: async () => [] }),
      projects,
      user: { id: 3, role: "TESTER" },
    });

  it("조직 목록이 비어도 초대된 조직 프로젝트를 그리고 화면이 죽지 않는다", async () => {
    // 조직 멤버가 아니면 조직 목록 API가 빈 배열을 준다. 그 조직의 프로젝트에만
    // 초대된 사용자에게 하얀 화면이 뜨던 회귀를 막는다.
    appCtx.value = ctxWith([orgProject("1", orgB)]);
    render(<ProjectManager onSelectProject={vi.fn()} />);
    expect(
      await screen.findByRole("heading", { name: "조직 B" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("project-1").length).toBeGreaterThan(0);
  });

  it("다른 조직의 멤버여도 초대된 조직의 프로젝트가 조직별 목록에서 빠지지 않는다", async () => {
    orgsMock.value = [orgA];
    appCtx.value = ctxWith([orgProject("1", orgA), orgProject("2", orgB)]);
    render(<ProjectManager onSelectProject={vi.fn()} />);
    expect(
      await screen.findByRole("heading", { name: "조직 A" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "조직 B" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("project-2").length).toBeGreaterThan(0);
  });
});
