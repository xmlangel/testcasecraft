import { describe, it, expect, vi } from "vitest";
import {
  getGraphStatus,
  getProjectStructure,
  getFailureClusters,
  getNeighborhood,
  convertToGraph,
  revertToBasic,
  getGraphSteps,
  updateGraphSteps,
} from "./graphApi";

describe("graphApi", () => {
  describe("응답 처리", () => {
    it("200 JSON 응답을 파싱한다", async () => {
      const mockApi = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const result = await getGraphStatus(mockApi);
      expect(result).toEqual({ status: "ok" });
    });

    it("204 응답은 null 반환", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(null, { status: 204 }));

      const result = await getGraphStatus(mockApi);
      expect(result).toBeNull();
    });

    it("4xx 에러는 message 추출해 throw", async () => {
      const mockApi = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Not found" }), {
          status: 404,
        }),
      );

      try {
        await getGraphStatus(mockApi);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e.message).toBe("Not found");
        expect(e.status).toBe(404);
      }
    });

    it("4xx 에러 response JSON 실패 시 status 포함 메시지", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response("Server error", { status: 500 }));

      try {
        await getGraphStatus(mockApi);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e.message).toBe("요청 실패 (500)");
        expect(e.status).toBe(500);
      }
    });
  });

  describe("getGraphStatus", () => {
    it("올바른 URL 호출", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await getGraphStatus(mockApi);
      expect(mockApi).toHaveBeenCalledWith("/api/graph/status");
    });
  });

  describe("getProjectStructure", () => {
    it("projectId 인코딩 + 올바른 URL", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await getProjectStructure(mockApi, "proj/123");
      expect(mockApi).toHaveBeenCalledWith(
        `/api/graph/project/proj%2F123/structure`,
      );
    });
  });

  describe("getFailureClusters", () => {
    it("projectId 쿼리 파라미터로 인코딩", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await getFailureClusters(mockApi, "proj?id");
      expect(mockApi).toHaveBeenCalledWith(
        `/api/graph/failures?projectId=proj%3Fid`,
      );
    });
  });

  describe("getNeighborhood", () => {
    it("testCaseId + depth 파라미터", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await getNeighborhood(mockApi, "proj-1", "case-2", 3);
      expect(mockApi).toHaveBeenCalledWith(
        `/api/graph/testcase/case-2/neighborhood?projectId=proj-1&depth=3`,
      );
    });

    it("depth 기본값 1", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await getNeighborhood(mockApi, "proj", "case");
      expect(mockApi).toHaveBeenCalledWith(
        `/api/graph/testcase/case/neighborhood?projectId=proj&depth=1`,
      );
    });
  });

  describe("convertToGraph", () => {
    it("POST 메서드 + URL 인코딩", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await convertToGraph(mockApi, "proj/1", "case/2");
      expect(mockApi).toHaveBeenCalledWith(
        `/api/graph/testcase/case%2F2/convert?projectId=proj%2F1`,
        { method: "POST" },
      );
    });
  });

  describe("revertToBasic", () => {
    it("POST 메서드 + URL 인코딩", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await revertToBasic(mockApi, "proj", "case");
      expect(mockApi).toHaveBeenCalledWith(
        `/api/graph/testcase/case/revert?projectId=proj`,
        { method: "POST" },
      );
    });
  });

  describe("getGraphSteps", () => {
    it("올바른 URL + 쿼리 파라미터", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      await getGraphSteps(mockApi, "p1", "c1");
      expect(mockApi).toHaveBeenCalledWith(
        `/api/graph/testcase/c1/steps?projectId=p1`,
      );
    });
  });

  describe("updateGraphSteps", () => {
    it("PUT 메서드 + JSON body", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const steps = [
        { description: "Step 1", expectedResult: "OK" },
        { description: "Step 2", expectedResult: "PASS" },
      ];

      await updateGraphSteps(mockApi, "p1", "c1", steps);
      expect(mockApi).toHaveBeenCalledWith(
        `/api/graph/testcase/c1/steps?projectId=p1`,
        {
          method: "PUT",
          body: JSON.stringify(steps),
        },
      );
    });
  });
});
