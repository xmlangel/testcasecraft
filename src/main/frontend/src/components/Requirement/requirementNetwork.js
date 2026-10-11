// src/components/Requirement/requirementNetwork.js
//
// 관계도(네트워크) 데이터 만들기. 화면·라이브러리와 떨어진 순수 함수라 단위 테스트로 검증한다.
//
// 두 가지 보기
//   network: 요구사항·TC 노드, 요구사항 관계 선 + 요구사항–TC 연결 선
//   shared : 요구사항 노드만, 같은 TC 를 나눠 쓰는 요구사항끼리 선(두께 = 공유 TC 수)
// 선이 하나도 없는 요구사항은 그래프에서 빼고 isolated 로 따로 돌려준다(커버리지 빈 곳).

const reqNodeId = (id) => `r:${id}`;
const tcNodeId = (id) => `t:${id}`;

/**
 * @param {object} p
 * @param {Array} p.requirements  RequirementResponse 목록(linkedTestCaseIds·coverage 포함)
 * @param {Array} p.relations     {id, sourceId, targetId, type}
 * @param {Array} p.testCases     TC 요약(id, displayId, name)
 * @param {"network"|"shared"} p.mode
 * @param {boolean} p.showTestCases  network 보기에서 TC 노드를 그릴지
 * @param {Set<string>|null} p.requirementFilter  보일 요구사항 ID(문서 거르기). null 이면 전부
 * @param {object|null} p.resultById  TC ID → 결과(PASS·FAIL·BLOCKED·NOT_RUN)
 * @returns {{nodes: Array, edges: Array, isolated: Array}}
 */
export const buildRequirementNetwork = ({
  requirements,
  relations = [],
  testCases = [],
  mode = "network",
  showTestCases = true,
  requirementFilter = null,
  resultById = null,
}) => {
  const visible = requirements.filter(
    (r) => !requirementFilter || requirementFilter.has(r.id),
  );
  const visibleIds = new Set(visible.map((r) => r.id));
  const caseById = new Map(testCases.map((tc) => [tc.id, tc]));
  const edges = [];
  const tcNodes = new Map();

  if (mode === "shared") {
    // TC 하나를 나눠 쓰는 요구사항 쌍마다 공유 수를 센다
    const reqsByCase = new Map();
    visible.forEach((r) =>
      (r.linkedTestCaseIds || []).forEach((tcId) => {
        if (!reqsByCase.has(tcId)) reqsByCase.set(tcId, []);
        reqsByCase.get(tcId).push(r.id);
      }),
    );
    const weights = new Map();
    reqsByCase.forEach((reqIds) => {
      for (let i = 0; i < reqIds.length; i += 1) {
        for (let j = i + 1; j < reqIds.length; j += 1) {
          const [a, b] = [reqIds[i], reqIds[j]].sort();
          const key = `${a}|${b}`;
          weights.set(key, (weights.get(key) || 0) + 1);
        }
      }
    });
    weights.forEach((weight, key) => {
      const [a, b] = key.split("|");
      edges.push({
        id: `s:${key}`,
        source: reqNodeId(a),
        target: reqNodeId(b),
        kind: "SHARED",
        weight,
      });
    });
  } else {
    relations
      .filter(
        (rel) => visibleIds.has(rel.sourceId) && visibleIds.has(rel.targetId),
      )
      .forEach((rel) =>
        edges.push({
          id: `rel:${rel.id}`,
          source: reqNodeId(rel.sourceId),
          target: reqNodeId(rel.targetId),
          kind: rel.type,
          weight: 1,
        }),
      );
    if (showTestCases) {
      visible.forEach((r) =>
        (r.linkedTestCaseIds || []).forEach((tcId) => {
          if (!tcNodes.has(tcId)) {
            const tc = caseById.get(tcId);
            tcNodes.set(tcId, {
              id: tcNodeId(tcId),
              entityId: tcId,
              type: "testcase",
              label: tc?.displayId || tc?.name || tcId.slice(0, 8),
              title: tc?.name || tcId,
              result: resultById ? resultById[tcId] || "NOT_RUN" : null,
            });
          }
          edges.push({
            id: `l:${r.id}|${tcId}`,
            source: reqNodeId(r.id),
            target: tcNodeId(tcId),
            kind: "LINK",
            weight: 1,
          });
        }),
      );
    }
  }

  const connected = new Set();
  edges.forEach((e) => {
    connected.add(e.source);
    connected.add(e.target);
  });
  const reqNodes = visible.map((r) => ({
    id: reqNodeId(r.id),
    entityId: r.id,
    type: "requirement",
    // 노드 아래에 ID 와 제목을 두 줄로 보인다
    label: `${r.docId}\n${r.title}`,
    title: r.title,
    coverage: r.coverage,
  }));

  return {
    nodes: [
      ...reqNodes.filter((n) => connected.has(n.id)),
      ...tcNodes.values(),
    ],
    edges,
    isolated: visible.filter((r) => !connected.has(reqNodeId(r.id))),
  };
};
