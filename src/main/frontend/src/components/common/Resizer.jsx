// src/components/common/Resizer.jsx
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

/**
 * 좌우 칸 사이의 폭 조절 막대.
 * 누른 채 끌면 onDrag(가로 이동량 px) 를 부른다. 폭 제한은 부르는 쪽이 정한다.
 * App.jsx 트리 칸에서 쓰던 것을 케이스 목록·상세 3단 분할(ICT-491)과 함께 쓰려고 옮겼다.
 */
const Resizer = ({ onDrag, testId = "resizer" }) => {
  const dragging = useRef(false);
  const onDragRef = useRef(onDrag);
  onDragRef.current = onDrag;

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging.current) return;
      onDragRef.current(e.movementX);
    };
    const handleMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    // 끄는 동안 글자가 선택되지 않게 한다
    document.body.style.userSelect = "none";
  };

  return (
    <Box
      role="separator"
      aria-orientation="vertical"
      sx={{
        width: "6px",
        cursor: "col-resize",
        bgcolor: "divider",
        borderRadius: 1,
        flexShrink: 0,
        zIndex: 2,
        "&:hover": { bgcolor: "action.selected" },
      }}
      onMouseDown={handleMouseDown}
      data-testid={testId}
    />
  );
};

Resizer.propTypes = {
  onDrag: PropTypes.func.isRequired,
  testId: PropTypes.string,
};

export default Resizer;
