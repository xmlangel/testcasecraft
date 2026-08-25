import React from "react";
import PropTypes from "prop-types";
import { Box, alpha, keyframes } from "@mui/material";

/**
 * 스크롤 영역에서 가려진 내용이 있음을 알리는 표시.
 *
 * `position: sticky` 로 그린다. 스크롤 주체가 이 컴포넌트를 담은 요소일 때도, 그
 * 위쪽 조상일 때도(뷰어 호출부 다수가 감싸는 Box 에 maxHeight 를 준다) 같은 방식으로
 * 붙기 때문이다. 절대 위치로 그리면 스크롤 주체가 조상일 때 위치를 잡지 못한다.
 *
 * 감싸는 sticky 상자의 높이는 0 이고 안쪽만 절대 위치로 그리므로 본문 레이아웃을
 * 밀지 않는다. 음수 마진으로 올리는 방식은 마진이 먹지 않아 표시가 스크롤 상자 밖으로
 * 잘려 나갔다(실측: 칩 1020~1040, 상자 하단 1014).
 *
 * 모양은 누를 수 있는 버튼처럼 보이지 않게 한다. 테두리와 그림자를 두른 칩으로
 * 그렸더니 클릭할 것처럼 읽혔다. 지금은 글줄을 닮은 가로 막대 셋이 가려진 쪽으로
 * 흘러가며 사라지게 해, 내용이 그 방향으로 계속 이어진다는 것만 보이게 한다.
 * 클릭과 글 선택을 막지 않도록 pointer-events 를 끊는다.
 *
 * 동작 최소화를 설정한 사용자에게는 흐름을 멈추고 막대만 남긴다.
 */
const flowDown = keyframes`
  0%   { transform: translateY(-6px); opacity: 0; }
  35%  { opacity: 1; }
  100% { transform: translateY(6px); opacity: 0; }
`;

const flowUp = keyframes`
  0%   { transform: translateY(6px); opacity: 0; }
  35%  { opacity: 1; }
  100% { transform: translateY(-6px); opacity: 0; }
`;

// 글줄처럼 보이도록 길이를 달리한 막대 셋. 뒤로 갈수록 짧고 늦게 흐른다.
const BARS = [
  { width: 34, delay: "0s" },
  { width: 24, delay: "0.18s" },
  { width: 14, delay: "0.36s" },
];

const ScrollHint = ({ overflowing, atTop, atBottom, position }) => {
  if (!overflowing) return null;
  const isBottom = position === "bottom";
  const hidden = isBottom ? atBottom : atTop;
  const flow = isBottom ? flowDown : flowUp;
  const bars = isBottom ? BARS : [...BARS].reverse();

  return (
    <Box
      aria-hidden
      data-testid={`scroll-hint-${position}`}
      sx={{
        position: "sticky",
        [isBottom ? "bottom" : "top"]: 0,
        height: 0,
        zIndex: 2,
        pointerEvents: "none",
        opacity: hidden ? 0 : 1,
        transition: "opacity 140ms ease",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          [isBottom ? "bottom" : "top"]: 0,
          height: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isBottom ? "flex-end" : "flex-start",
          gap: "3px",
          pb: isBottom ? "4px" : 0,
          pt: isBottom ? 0 : "4px",
          background: (theme) =>
            `linear-gradient(to ${isBottom ? "top" : "bottom"}, ${
              theme.palette.background.paper
            } 10%, ${alpha(theme.palette.primary.main, 0.16)} 55%, transparent)`,
        }}
      >
        {bars.map((bar) => (
          <Box
            key={`${bar.width}-${bar.delay}`}
            sx={{
              width: bar.width,
              height: 3,
              borderRadius: 999,
              backgroundColor: "primary.main",
              animation: `${flow} 1.5s ease-in-out ${bar.delay} infinite`,
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
                opacity: 0.75,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

ScrollHint.propTypes = {
  overflowing: PropTypes.bool,
  atTop: PropTypes.bool,
  atBottom: PropTypes.bool,
  position: PropTypes.oneOf(["top", "bottom"]).isRequired,
};

export default ScrollHint;
