import { describe, it, expect } from "vitest";
import { toElements } from "./GraphCanvas";

describe("GraphCanvas.toElements", () => {
  describe("기본 변환", () => {
    it("nodes와 edges를 cytoscape elements로 변환", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
            properties: { name: "Login test" },
          },
          {
            id: "n2",
            label: "StepNode",
            properties: { action: "Click login button" },
          },
        ],
        edges: [{ id: "e1", source: "n1", target: "n2", label: "STARTS_AT" }],
      };

      const elements = toElements(graph);

      expect(elements).toHaveLength(3); // 2 nodes + 1 edge
      expect(elements[0]).toEqual({
        data: {
          id: "n1",
          label: "TestCase",
          caption: "Login test",
          properties: { name: "Login test" },
        },
      });
      expect(elements[1]).toEqual({
        data: {
          id: "n2",
          label: "StepNode",
          caption: "Click login button",
          properties: { action: "Click login button" },
        },
      });
      expect(elements[2]).toEqual({
        data: { id: "e1", source: "n1", target: "n2", label: "STARTS_AT" },
      });
    });

    it("null graph는 빈 배열", () => {
      const elements = toElements(null);
      expect(elements).toEqual([]);
    });

    it("nodes/edges 생략 시 빈 배열", () => {
      const elements = toElements({});
      expect(elements).toEqual([]);
    });
  });

  describe("caption 우선순위", () => {
    it("name이 있으면 name 사용", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
            properties: {
              name: "Test Name",
              signature: "Test Signature",
            },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("Test Name");
    });

    it("name 없으면 signature 사용", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
            properties: {
              signature: "Test Signature",
              action: "Test Action",
            },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("Test Signature");
    });

    it("name, signature 없으면 action 사용", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "StepNode",
            properties: {
              action: "Click button",
              text: "Button text",
            },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("Click button");
    });

    it("name, signature, action 없으면 text 사용", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "Node",
            properties: {
              text: "Node text",
              result: "PASS",
            },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("Node text");
    });

    it("name, signature, action, text 없으면 result 사용", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestResult",
            properties: {
              result: "PASS",
              id: "result-123",
            },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("PASS");
    });

    it("모든 properties 없으면 node.id 사용", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "Node",
            properties: { id: "prop-id" },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("prop-id");
    });

    it("properties 없으면 label 사용", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("TestCase");
    });
  });

  describe("caption 40자 절단", () => {
    it("40자 초과 시 절단", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
            properties: {
              name: "This is a very long test case name that exceeds forty characters",
            },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe(
        "This is a very long test case name that ",
      );
      expect(elements[0].data.caption).toHaveLength(40);
    });

    it("40자 이하 시 그대로 유지", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
            properties: { name: "Short name" },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("Short name");
    });

    it("정확히 40자는 그대로", () => {
      const name = "a".repeat(40);
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
            properties: { name },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe(name);
    });
  });

  describe("고아 간선 필터 (orphan edge filtering)", () => {
    it("source/target이 nodes에 모두 있으면 포함", () => {
      const graph = {
        nodes: [
          { id: "n1", label: "A", properties: {} },
          { id: "n2", label: "B", properties: {} },
        ],
        edges: [{ id: "e1", source: "n1", target: "n2", label: "NEXT" }],
      };

      const elements = toElements(graph);
      expect(elements).toHaveLength(3); // 2 nodes + 1 edge
      expect(elements[2].data.id).toBe("e1");
    });

    it("source가 nodes에 없으면 제외 (orphan edge)", () => {
      const graph = {
        nodes: [{ id: "n2", label: "B", properties: {} }],
        edges: [{ id: "e1", source: "n1", target: "n2", label: "NEXT" }],
      };

      const elements = toElements(graph);
      expect(elements).toHaveLength(1); // 1 node만 (edge 제외)
    });

    it("target이 nodes에 없으면 제외 (orphan edge)", () => {
      const graph = {
        nodes: [{ id: "n1", label: "A", properties: {} }],
        edges: [{ id: "e1", source: "n1", target: "n2", label: "NEXT" }],
      };

      const elements = toElements(graph);
      expect(elements).toHaveLength(1); // 1 node만 (edge 제외)
    });

    it("source/target 모두 없으면 제외", () => {
      const graph = {
        nodes: [{ id: "n3", label: "C", properties: {} }],
        edges: [{ id: "e1", source: "n1", target: "n2", label: "NEXT" }],
      };

      const elements = toElements(graph);
      expect(elements).toHaveLength(1); // 1 node만 (edge 제외)
    });

    it("여러 간선 중 일부만 고아인 경우 필터", () => {
      const graph = {
        nodes: [
          { id: "n1", label: "A", properties: {} },
          { id: "n2", label: "B", properties: {} },
        ],
        edges: [
          { id: "e1", source: "n1", target: "n2", label: "NEXT" },
          { id: "e2", source: "n1", target: "n3", label: "ORPHAN" },
          { id: "e3", source: "n2", target: "n1", label: "BACK" },
        ],
      };

      const elements = toElements(graph);
      expect(elements).toHaveLength(4); // 2 nodes + 2 valid edges (e1, e3)
      expect(elements.map((e) => e.data.id)).toContain("e1");
      expect(elements.map((e) => e.data.id)).toContain("e3");
      expect(elements.map((e) => e.data.id)).not.toContain("e2");
    });
  });

  describe("properties 처리", () => {
    it("properties 없으면 빈 객체로 처리", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.properties).toEqual({});
    });

    it("properties 유지", () => {
      const props = { name: "Test", color: "red", count: 5 };
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
            properties: props,
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.properties).toEqual(props);
    });
  });

  describe("엣지 케이스", () => {
    it("빈 nodes 배열", () => {
      const graph = {
        nodes: [],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements).toEqual([]);
    });

    it("빈 edges 배열", () => {
      const graph = {
        nodes: [{ id: "n1", label: "A", properties: {} }],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements).toHaveLength(1);
    });

    it("number caption은 string으로 변환", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "Node",
            properties: { name: 123 },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toBe("123");
    });

    it("복잡한 객체 caption은 toString 결과", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "Node",
            properties: { name: { complex: "object" } },
          },
        ],
        edges: [],
      };

      const elements = toElements(graph);
      expect(elements[0].data.caption).toContain("[object");
    });
  });
});
