#!/usr/bin/env python3
"""ShopFlow seed - Step 9: 요구사항 문서·요구사항·TC 연결·관계 (멱등, ko 전용).

매뉴얼의 요구사항 장(커버리지·리포트·관계도)을 그대로 따라 할 수 있게 판정이 고루 나오도록 짰다.
TP02(장바구니 & 결제) 실행 결과와 맞물려 리포트 탭에서 실패·통과·미실행·플랜에 없음이 모두 나온다.

  커버리지: 충족 · 부분(REQ-CART-005) · 미연결(REQ-CART-006) · 제외(REQ-PAY-005)
  관계    : 상위·하위, 의존, 관련 (문서를 넘는 관계 1건 포함)
"""

from __future__ import annotations

import sys

from _lib import LOCALE, get, load_state, post, save_state

SPECS = [
    # (docId, 제목, 상위 docId, 범위)
    ("SRS-SHOP", "ShopFlow 요구사항 명세", None, "ShopFlow 쇼핑몰 v2.0 출시 범위의 요구사항을 모은 문서입니다."),
    ("SRS-CART", "장바구니 요구사항", "SRS-SHOP", "상품 담기부터 결제 직전까지 장바구니 동작을 다룹니다."),
    ("SRS-PAY", "결제 요구사항", "SRS-SHOP", "결제 승인, 간편결제, 환불을 다룹니다."),
]

CART = "F05 장바구니 :: 장바구니 - "
PAY = "F06 결제·페이먼트 :: "

REQUIREMENTS = [
    # (docId, 문서, 제목, 유형, 상태, 필요 TC 수, 연결 케이스, 범위)
    ("REQ-CART-001", "SRS-CART", "장바구니에 상품을 담을 수 있어야 한다", "FEATURE", "VALID", 2,
     [CART + "상품 담기", CART + "재고 부족 시 담기 거부"],
     "- 상품 상세에서 **[장바구니 담기]** 로 담는다\n- 재고가 부족하면 담지 않고 안내한다"),
    ("REQ-CART-002", "SRS-CART", "담은 상품의 수량을 바꾸고 지울 수 있어야 한다", "FEATURE", "IMPLEMENTED", 2,
     [CART + "수량 +/- 변경", CART + "항목 삭제"],
     "수량은 1 이상 재고 이하로만 바꿀 수 있다."),
    ("REQ-CART-003", "SRS-CART", "비회원 장바구니를 로그인 후 회원 장바구니와 합친다", "USE_CASE", "VALID", 1,
     [CART + "게스트→로그인 머지"],
     "같은 상품이 양쪽에 있으면 수량을 더한다."),
    ("REQ-CART-004", "SRS-CART", "장바구니에는 상품을 50종까지 담을 수 있다", "CONSTRAINT", "VALID", 1,
     [CART + "최대 50종 제한"],
     "51번째 상품을 담으면 안내 문구를 보이고 담지 않는다."),
    ("REQ-CART-005", "SRS-CART", "여러 탭에서 같은 장바구니가 보여야 한다", "NON_FUNCTIONAL", "REVIEW", 2,
     [CART + "다중 탭 동기화"],
     "한 탭에서 바꾼 내용이 다른 탭에 5초 안에 반영된다."),
    ("REQ-CART-006", "SRS-CART", "담은 상품의 가격이 바뀌면 알려야 한다", "FEATURE", "DRAFT", 1,
     [],
     "아직 알림 방식(배지·토스트)을 정하지 않았다."),
    ("REQ-PAY-001", "SRS-PAY", "신용카드로 결제를 승인할 수 있어야 한다", "FEATURE", "VALID", 1,
     [PAY + "결제 - 신용카드 정상 승인", PAY + "결제 - 12개월 할부 선택"],
     "일시불과 할부(2~12개월)를 지원한다."),
    ("REQ-PAY-002", "SRS-PAY", "카카오페이로 간편결제할 수 있어야 한다", "FEATURE", "VALID", 1,
     [PAY + "결제 - 카카오페이 간편결제"],
     "결제 창은 새 창이 아니라 같은 화면 위에 연다."),
    ("REQ-PAY-003", "SRS-PAY", "결제를 전액 또는 일부 환불할 수 있어야 한다", "FEATURE", "VALID", 2,
     [PAY + "환불 - 전액 환불 처리", PAY + "환불 - 부분 환불 처리"],
     "부분 환불은 상품 단위로 한다."),
    ("REQ-PAY-004", "SRS-PAY", "결제 대행사 응답이 늦으면 다시 확인한다", "SYSTEM_FUNCTION", "IMPLEMENTED", 1,
     [PAY + "결제 - PG webhook 재시도", PAY + "결제 - 신용카드 정상 승인"],
     "응답이 없으면 1분 간격으로 세 번까지 결과를 다시 확인한다."),
    ("REQ-PAY-005", "SRS-PAY", "결제 화면은 PCI DSS 기준을 따른다", "CONSTRAINT", "NOT_TESTABLE", 1,
     [],
     "외부 인증 심사로 확인하는 항목이라 테스트 케이스로 확인하지 않는다."),
]

RELATIONS = [
    # (출발 docId, 종류, 대상 docId)  PARENT_OF: 출발이 상위
    ("REQ-CART-001", "PARENT_OF", "REQ-CART-004"),
    ("REQ-CART-003", "DEPENDS_ON", "REQ-CART-001"),
    ("REQ-PAY-001", "PARENT_OF", "REQ-PAY-004"),
    ("REQ-PAY-003", "DEPENDS_ON", "REQ-PAY-001"),
    ("REQ-PAY-001", "RELATED_TO", "REQ-PAY-002"),
    ("REQ-CART-001", "RELATED_TO", "REQ-PAY-001"),
]


def ok(status: int, resp, what: str):
    if status not in (200, 201):
        print(f"  [{LOCALE}] ✗ {what}: HTTP {status} {str(resp)[:200]}")
        sys.exit(1)
    return resp


def main() -> None:
    if LOCALE != "ko":
        print(f"  [{LOCALE}] skip: 요구사항 샘플은 ko 셋에만 있다")
        return
    pid = load_state("project")["projectId"]
    cases = load_state("cases") or {}
    if not cases:
        print(f"FAIL [{LOCALE}]: state/cases.json 없음", file=sys.stderr)
        sys.exit(1)

    _, specs_now = get(f"/api/projects/{pid}/requirement-specs")
    spec_ids = {s["docId"]: s["id"] for s in (specs_now or [])}
    for doc_id, title, parent, scope in SPECS:
        if doc_id in spec_ids:
            print(f"  [{LOCALE}] spec {doc_id} (reuse)")
            continue
        body = {"projectId": pid, "parentId": spec_ids.get(parent) if parent else None,
                "docId": doc_id, "title": title, "scope": scope}
        spec_ids[doc_id] = ok(*post("/api/requirement-specs", body), f"spec {doc_id}")["id"]
        print(f"  [{LOCALE}] + spec {doc_id}")

    _, reqs_now = get(f"/api/projects/{pid}/requirements")
    req_ids = {r["docId"]: r["id"] for r in (reqs_now or [])}
    linked = {r["docId"]: set(r.get("linkedTestCaseIds") or []) for r in (reqs_now or [])}
    for doc_id, spec, title, rtype, status, expected, case_keys, scope in REQUIREMENTS:
        if doc_id not in req_ids:
            body = {"projectId": pid, "specId": spec_ids[spec], "docId": doc_id, "title": title,
                    "scope": scope, "status": status, "type": rtype, "expectedCoverage": expected}
            req_ids[doc_id] = ok(*post("/api/requirements", body), f"req {doc_id}")["id"]
            print(f"  [{LOCALE}] + req {doc_id}")
        missing = [k for k in case_keys if k not in cases]
        if missing:
            print(f"  [{LOCALE}] ✗ {doc_id}: 케이스 없음 {missing}")
            sys.exit(1)
        ids = [cases[k]["id"] for k in case_keys if cases[k]["id"] not in linked.get(doc_id, set())]
        if ids:
            ok(*post(f"/api/requirements/{req_ids[doc_id]}/test-cases", {"ids": ids}), f"link {doc_id}")
            print(f"  [{LOCALE}]   link {doc_id} +{len(ids)}")

    _, rels_now = get(f"/api/projects/{pid}/requirement-relations")
    have = {(r["sourceId"], r["type"], r["targetId"]) for r in (rels_now or [])}
    for src, rtype, dst in RELATIONS:
        key = (req_ids[src], rtype, req_ids[dst])
        if key in have:
            continue
        body = {"targetId": req_ids[dst], "type": rtype}
        ok(*post(f"/api/requirements/{req_ids[src]}/relations", body), f"rel {src}->{dst}")
        print(f"  [{LOCALE}]   rel {src} {rtype} {dst}")

    save_state("requirements", {"specs": spec_ids, "requirements": req_ids})
    print(f"\n[{LOCALE}] DONE: specs={len(spec_ids)} requirements={len(req_ids)} relations={len(RELATIONS)}")


if __name__ == "__main__":
    main()
