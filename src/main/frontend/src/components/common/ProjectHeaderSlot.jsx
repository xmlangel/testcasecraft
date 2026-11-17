// src/components/common/ProjectHeaderSlot.jsx
// ICT-496: 화면별 도구(예: 케이스 화면의 자동/1단/2단/3단 전환)를 프로젝트 머리 줄
// (북마크·설정 아이콘 줄)에 끼워 넣는다. 머리 줄이 없으면 fallback 자리에 그대로 그린다.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

export const PROJECT_HEADER_SLOT_ID = "project-header-actions-slot";

const ProjectHeaderSlot = ({ children, fallback = null }) => {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    setTarget(document.getElementById(PROJECT_HEADER_SLOT_ID));
  }, []);

  if (target) return createPortal(children, target);
  return fallback;
};

ProjectHeaderSlot.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
};

export default ProjectHeaderSlot;
