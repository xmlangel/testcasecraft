// src/hooks/useProjectRole.js
import { useEffect, useState } from "react";
import apiService from "../services/apiService.js";

/**
 * 현재 로그인 사용자의 "프로젝트 내 역할"을 조회하는 훅.
 *
 * 시스템 role(User.role: ADMIN/MANAGER/TESTER/null)과 프로젝트 role
 * (ProjectUser.ProjectRole: PROJECT_MANAGER/LEAD_DEVELOPER/DEVELOPER/TESTER/
 * CONTRIBUTOR/VIEWER)은 서로 다른 값 집합이다. 편집 버튼 노출 여부 같은 UI 가드는
 * 반드시 프로젝트 role을 기준으로 판단해야 하며, 이 훅이 백엔드
 * `GET /api/projects/{projectId}/members`를 조회해 현재 사용자에 해당하는
 * 멤버 레코드를 찾아 역할을 반환한다.
 *
 * 시스템 ADMIN은 프로젝트 멤버가 아니어도 백엔드 canEditProject()/canAccessProject()가
 * 항상 우회를 허용하므로(ProjectSecurityService), 멤버 조회 없이 "ADMIN" 센티널을 반환한다.
 *
 * @param {string|null|undefined} projectId
 * @param {{id?: string, username?: string, role?: string}|null|undefined} user - AppContext의 인증 사용자
 * @returns {{ projectRole: string|null, loading: boolean }}
 */
export function useProjectRole(projectId, user) {
  const [projectRole, setProjectRole] = useState(null);
  const [loading, setLoading] = useState(Boolean(projectId));

  useEffect(() => {
    let cancelled = false;

    if (!projectId || !user) {
      setProjectRole(null);
      setLoading(false);
      return undefined;
    }

    if (user.role === "ADMIN") {
      setProjectRole("ADMIN");
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    (async () => {
      try {
        const response = await apiService.get(
          `/api/projects/${projectId}/members`,
        );
        const members = await response.json();
        const mine = members.find(
          (member) =>
            (user.id && member.user?.id === user.id) ||
            (user.username && member.user?.username === user.username),
        );
        if (!cancelled) {
          setProjectRole(mine?.roleInProject ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setProjectRole(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, user?.id, user?.username, user?.role]);

  return { projectRole, loading };
}

export default useProjectRole;
