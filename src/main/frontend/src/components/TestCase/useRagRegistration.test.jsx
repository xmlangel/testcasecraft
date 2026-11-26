import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const ragCtx = { isRagEnabled: true };
vi.mock("../../context/RAGContext.jsx", () => ({ useRAG: () => ragCtx }));

import useRagRegistration from "./useRagRegistration.js";

const ok = (body) => ({ ok: true, json: async () => body });

describe("useRagRegistration (ICT-494 tl-2)", () => {
  beforeEach(() => {
    ragCtx.isRagEnabled = true;
  });

  it("상태를 모르면 조회해서 미등록을 알린다", async () => {
    const api = vi.fn().mockResolvedValue(ok({ vectorized: false }));
    const { result } = renderHook(() =>
      useRagRegistration({ testCaseId: "tc1", isLlmAvailable: true, api }),
    );
    await waitFor(() => expect(result.current.status).toBe("notVectorized"));
    expect(api).toHaveBeenCalledWith("/api/rag/testcases/tc1/status");
  });

  it("등록하면 vectorized 로 바뀌고 onVectorized 를 부른다", async () => {
    const api = vi.fn().mockResolvedValue(ok({}));
    const onVectorized = vi.fn();
    const { result } = renderHook(() =>
      useRagRegistration({
        testCaseId: "tc1",
        ragVectorized: false,
        isLlmAvailable: true,
        onVectorized,
        api,
      }),
    );
    expect(result.current.status).toBe("notVectorized");
    await act(async () => {
      await result.current.register();
    });
    expect(api).toHaveBeenCalledWith("/api/rag/testcases/tc1/vectorize", {
      method: "POST",
    });
    expect(result.current.status).toBe("vectorized");
    expect(onVectorized).toHaveBeenCalledWith(true);
  });

  it("LLM·RAG 가 꺼져 있거나 새 케이스·폴더면 hidden 이고 조회하지 않는다", () => {
    const api = vi.fn();
    const cases = [
      { testCaseId: "tc1", isLlmAvailable: false },
      { testCaseId: null, isLlmAvailable: true },
      { testCaseId: "tc1", isLlmAvailable: true, isFolder: true },
    ];
    for (const props of cases) {
      const { result } = renderHook(() =>
        useRagRegistration({ ...props, api }),
      );
      expect(result.current.status).toBe("hidden");
    }
    ragCtx.isRagEnabled = false;
    const { result } = renderHook(() =>
      useRagRegistration({ testCaseId: "tc1", isLlmAvailable: true, api }),
    );
    expect(result.current.status).toBe("hidden");
    expect(api).not.toHaveBeenCalled();
  });
});
