import { describe, it, expect, vi } from "vitest";
import {
  getGraphStatus,
  getProjectStructure,
  getNeighborhood,
  syncGraph,
} from "./graphApi";

const ok = (data) => ({ ok: true, status: 200, json: async () => data });

describe("graphApi", () => {
  describe("getGraphStatus", () => {
    it("hits /api/graph/status and returns json", async () => {
      const mockApi = vi
        .fn()
        .mockResolvedValue(ok({ enabled: true, available: true }));
      const result = await getGraphStatus(mockApi);
      expect(mockApi).toHaveBeenCalledWith("/api/graph/status");
      expect(result).toEqual({ enabled: true, available: true });
    });

    it("throws with server message on error", async () => {
      const mockApi = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "boom" }),
      });
      await expect(getGraphStatus(mockApi)).rejects.toThrow("boom");
    });
  });

  describe("getProjectStructure", () => {
    it("encodes projectId in the structure path", async () => {
      const mockApi = vi.fn().mockResolvedValue(ok({ nodes: [], edges: [] }));
      await getProjectStructure(mockApi, "proj/123");
      expect(mockApi).toHaveBeenCalledWith(
        "/api/graph/project/proj%2F123/structure",
      );
    });
  });

  describe("getNeighborhood", () => {
    it("encodes ids and passes depth", async () => {
      const mockApi = vi.fn().mockResolvedValue(ok({ nodes: [], edges: [] }));
      await getNeighborhood(mockApi, "proj-1", "inst-2", 3);
      expect(mockApi).toHaveBeenCalledWith(
        "/api/graph/instance/inst-2/neighborhood?projectId=proj-1&depth=3",
      );
    });

    it("defaults depth to 1", async () => {
      const mockApi = vi.fn().mockResolvedValue(ok({ nodes: [], edges: [] }));
      await getNeighborhood(mockApi, "proj", "inst");
      expect(mockApi).toHaveBeenCalledWith(
        "/api/graph/instance/inst/neighborhood?projectId=proj&depth=1",
      );
    });
  });

  describe("syncGraph", () => {
    it("POSTs to /api/graph/sync with projectId", async () => {
      const mockApi = vi.fn().mockResolvedValue(ok({ testCases: 3 }));
      await syncGraph(mockApi, "p1");
      expect(mockApi).toHaveBeenCalledWith("/api/graph/sync?projectId=p1", {
        method: "POST",
      });
    });
  });
});
