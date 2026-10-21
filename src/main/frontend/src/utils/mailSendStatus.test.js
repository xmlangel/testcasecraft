import { describe, expect, it, vi } from "vitest";
import {
  MAIL_SEND_STATUS,
  describeMailSendResult,
  waitForMailSendResult,
} from "./mailSendStatus.js";

const json = (body, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });
const t = (_key, fallback) => fallback;
const noWait = () => Promise.resolve();

describe("waitForMailSendResult", () => {
  it("PENDING 이 끝날 때까지 조회하고 실패 원인을 돌려준다", async () => {
    const fetchFn = vi
      .fn()
      .mockReturnValueOnce(json({ status: "PENDING" }))
      .mockReturnValueOnce(json({ status: "FAILED", errorCode: "TIMEOUT" }));

    const result = await waitForMailSendResult("req 1", fetchFn, { wait: noWait });

    expect(result).toEqual({ status: "FAILED", errorCode: "TIMEOUT" });
    expect(fetchFn).toHaveBeenCalledWith("/api/email-verification/send-status/req%201");
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("조회 오류는 넘기고 다시 조회한다", async () => {
    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockReturnValueOnce(json({}, false))
      .mockReturnValueOnce(json({ status: "SENT" }));

    const result = await waitForMailSendResult("r", fetchFn, { wait: noWait });

    expect(result).toEqual({ status: "SENT", errorCode: null });
  });

  it("시간 안에 결과가 없으면 UNKNOWN 을 돌려준다", async () => {
    const fetchFn = vi.fn(() => json({ status: "PENDING" }));

    const result = await waitForMailSendResult("r", fetchFn, {
      intervalMs: 1000,
      timeoutMs: 3000,
      wait: noWait,
    });

    expect(result.status).toBe(MAIL_SEND_STATUS.UNKNOWN);
    expect(fetchFn).toHaveBeenCalledTimes(4);
  });
});

describe("describeMailSendResult", () => {
  it("결과마다 심각도를 고른다", () => {
    expect(describeMailSendResult(t, { status: "SENT" }).severity).toBe("success");
    expect(describeMailSendResult(t, { status: "FAILED", errorCode: "AUTH_FAILED" })).toEqual({
      severity: "error",
      message: expect.stringContaining("로그인에 실패"),
    });
    expect(describeMailSendResult(t, { status: "UNKNOWN" }).severity).toBe("warning");
  });

  it("모르는 원인 코드는 일반 실패 문구로 보여 준다", () => {
    const { severity, message } = describeMailSendResult(t, {
      status: "FAILED",
      errorCode: "SOMETHING_NEW",
    });
    expect(severity).toBe("error");
    expect(message).toContain("발송에 실패");
  });
});
