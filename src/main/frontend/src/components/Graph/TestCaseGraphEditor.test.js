import { describe, it, expect } from "vitest";
import { graphToSteps } from "./TestCaseGraphEditor";

describe("TestCaseGraphEditor.graphToSteps", () => {
  describe("기본 변환", () => {
    it("StepNode를 steps 배열로 변환", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: {
              order: 1,
              action: "Click button",
              expected: "Dialog opens",
            },
          },
          {
            id: "s2",
            label: "StepNode",
            properties: {
              order: 2,
              action: "Enter text",
              expected: "Text appears",
            },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps).toHaveLength(2);
      expect(steps[0]).toEqual({
        order: 1,
        description: "Click button",
        expectedResult: "Dialog opens",
        branches: [],
      });
      expect(steps[1]).toEqual({
        order: 2,
        description: "Enter text",
        expectedResult: "Text appears",
        branches: [],
      });
    });

    it("null graph는 빈 배열", () => {
      const steps = graphToSteps(null);
      expect(steps).toEqual([]);
    });

    it("빈 nodes는 빈 배열", () => {
      const steps = graphToSteps({ nodes: [] });
      expect(steps).toEqual([]);
    });

    it("nodes 생략 시 빈 배열", () => {
      const steps = graphToSteps({});
      expect(steps).toEqual([]);
    });
  });

  describe("StepNode 필터링", () => {
    it("StepNode만 선택", () => {
      const graph = {
        nodes: [
          {
            id: "root",
            label: "GraphTestCase",
            properties: { name: "Test" },
          },
          {
            id: "s1",
            label: "StepNode",
            properties: {
              order: 1,
              action: "Step 1",
              expected: "OK",
            },
          },
          {
            id: "pre",
            label: "Precondition",
            properties: { action: "Setup" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toBe("Step 1");
    });

    it("GraphTestCase는 무시", () => {
      const graph = {
        nodes: [
          {
            id: "root",
            label: "GraphTestCase",
            properties: { name: "Test", order: 0 },
          },
        ],
      };

      const steps = graphToSteps(graph);
      expect(steps).toEqual([]);
    });

    it("Precondition는 무시", () => {
      const graph = {
        nodes: [
          {
            id: "pre",
            label: "Precondition",
            properties: { action: "Setup", order: 0 },
          },
        ],
      };

      const steps = graphToSteps(graph);
      expect(steps).toEqual([]);
    });

    it("다양한 라벨 무시", () => {
      const graph = {
        nodes: [
          {
            id: "n1",
            label: "TestCase",
            properties: { action: "Test", order: 1 },
          },
          {
            id: "n2",
            label: "Decision",
            properties: { action: "Check", order: 2 },
          },
          {
            id: "s1",
            label: "StepNode",
            properties: { action: "Step", order: 3, expected: "OK" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps).toHaveLength(1);
      expect(steps[0].description).toBe("Step");
    });
  });

  describe("order 정렬", () => {
    it("order 역순 입력을 정렬", () => {
      const graph = {
        nodes: [
          {
            id: "s3",
            label: "StepNode",
            properties: { order: 3, action: "Step 3", expected: "R3" },
          },
          {
            id: "s1",
            label: "StepNode",
            properties: { order: 1, action: "Step 1", expected: "R1" },
          },
          {
            id: "s2",
            label: "StepNode",
            properties: { order: 2, action: "Step 2", expected: "R2" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps.map((s) => s.description)).toEqual([
        "Step 1",
        "Step 2",
        "Step 3",
      ]);
    });

    it("같은 order는 입력 순 유지", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: 1, action: "First", expected: "R1" },
          },
          {
            id: "s2",
            label: "StepNode",
            properties: { order: 1, action: "Second", expected: "R2" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps.map((s) => s.description)).toEqual(["First", "Second"]);
    });

    it("음수 order 처리", () => {
      const graph = {
        nodes: [
          {
            id: "s2",
            label: "StepNode",
            properties: { order: 2, action: "Step 2", expected: "R2" },
          },
          {
            id: "s-1",
            label: "StepNode",
            properties: { order: -1, action: "Step -1", expected: "R-1" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps.map((s) => s.order)).toEqual([-1, 2]);
      expect(steps[0].description).toBe("Step -1");
    });
  });

  describe("properties 매핑", () => {
    it("action → description 매핑", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: 1, action: "Click button" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0].description).toBe("Click button");
    });

    it("expected → expectedResult 매핑", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: 1, expected: "Button disabled" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0].expectedResult).toBe("Button disabled");
    });

    it("action 생략 시 빈 문자열", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: 1, expected: "OK" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0].description).toBe("");
    });

    it("expected 생략 시 빈 문자열", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: 1, action: "Click" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0].expectedResult).toBe("");
    });

    it("action과 expected 모두 생략", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: 1 },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0]).toEqual({
        order: 1,
        description: "",
        expectedResult: "",
        branches: [],
      });
    });
  });

  describe("order 값 처리", () => {
    it("order 누락 시 0 처리", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { action: "Step 1", expected: "R1" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0].order).toBe(0);
    });

    it("order null은 0 처리", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: null, action: "Step 1", expected: "R1" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0].order).toBe(0);
    });

    it("order undefined는 0 처리", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: undefined, action: "Step 1", expected: "R1" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0].order).toBe(0);
    });

    it("order를 숫자로 변환", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: "5", action: "Step 5", expected: "R5" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0].order).toBe(5);
    });

    it("order 무효 문자열은 NaN → 정렬 유지", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: { order: "abc", action: "Step 1", expected: "R1" },
          },
          {
            id: "s2",
            label: "StepNode",
            properties: { order: 1, action: "Step 2", expected: "R2" },
          },
        ],
      };

      const steps = graphToSteps(graph);

      // Number("abc") = NaN이므로 sort 비교 (NaN - 1 = NaN) 에서
      // 비교 값이 NaN일 때는 순서 유지 (안정정렬)
      expect(steps[0].description).toBe("Step 1"); // 입력 순 유지
      expect(steps[1].description).toBe("Step 2");
    });

    it("properties null", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
            properties: null,
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0]).toEqual({
        order: 0,
        description: "",
        expectedResult: "",
        branches: [],
      });
    });

    it("properties undefined", () => {
      const graph = {
        nodes: [
          {
            id: "s1",
            label: "StepNode",
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps[0]).toEqual({
        order: 0,
        description: "",
        expectedResult: "",
        branches: [],
      });
    });
  });

  describe("복합 시나리오", () => {
    it("실제 그래프 응답 패턴", () => {
      const graph = {
        nodes: [
          {
            id: "root",
            label: "GraphTestCase",
            properties: { name: "Login Flow" },
          },
          {
            id: "pre1",
            label: "Precondition",
            properties: { text: "Browser open" },
          },
          {
            id: "s1",
            label: "StepNode",
            properties: { order: 1, action: "Enter username", expected: "OK" },
          },
          {
            id: "s2",
            label: "StepNode",
            properties: { order: 2, action: "Enter password", expected: "OK" },
          },
          {
            id: "s3",
            label: "StepNode",
            properties: {
              order: 3,
              action: "Click login",
              expected: "Home page",
            },
          },
        ],
      };

      const steps = graphToSteps(graph);

      expect(steps).toHaveLength(3);
      expect(steps.map((s) => s.description)).toEqual([
        "Enter username",
        "Enter password",
        "Click login",
      ]);
      expect(steps.map((s) => s.expectedResult)).toEqual([
        "OK",
        "OK",
        "Home page",
      ]);
    });

    it("대량의 step 처리", () => {
      const nodes = Array.from({ length: 100 }, (_, i) => ({
        id: `s${i}`,
        label: "StepNode",
        properties: {
          order: i + 1,
          action: `Step ${i + 1}`,
          expected: `Result ${i + 1}`,
        },
      }));

      const graph = { nodes };

      const steps = graphToSteps(graph);

      expect(steps).toHaveLength(100);
      expect(steps[0].order).toBe(1);
      expect(steps[99].order).toBe(100);
      expect(steps[50].description).toBe("Step 51");
    });
  });
});
