// GraphView — 그래프 보기 화면.
// 코어 온톨로지(11 엔티티 / 15 관계)를 Ontology-Playground 스타일 디자이너로 보여준다.
// 기존 관계그래프/오류클러스터/케이스이웃 탭·저작 편집기 UI 는 코어 온톨로지 재작성으로 제거됨.

import React from "react";
import OntologyDesigner from "./ontology/OntologyDesigner";

const GraphView = () => <OntologyDesigner />;

export default GraphView;
