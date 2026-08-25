import { keyframes } from "@mui/material";

/**
 * 진행 중인 실행·플랜을 목록에서 알아보게 하는 움직임.
 *
 * 목록에서 상태 칩은 색만 달랐다. 끝난 것과 도는 것이 같은 자리에 나란히 있으면
 * 색만으로는 어느 것이 지금 도는지 훑어서 알기 어렵다. 그래서 진행 중인 것만 숨쉬듯
 * 움직이게 한다. 끝난 것과 시작하지 않은 것은 그대로 둔다. 다 움직이면 무엇이
 * 진행 중인지 다시 구별할 수 없다.
 *
 * 동작 최소화를 설정한 사용자에게는 움직임을 멈춘다.
 */
// 색만 다르면 끝난 것(초록)에 눈이 먼저 가고 도는 것은 묻힌다. 그래서 크기와
// 밝기를 함께 흔든다. 밝기는 색을 몰라도 되는 방식이라 테마를 가리지 않는다.
const breathe = keyframes`
  0%, 100% { transform: scale(1);    filter: brightness(1); }
  50%      { transform: scale(1.07); filter: brightness(1.35); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

/** 상태 칩에 그대로 얹는 sx. 진행 중이 아닌 상태에는 쓰지 않는다. */
export const IN_PROGRESS_CHIP_SX = {
  fontWeight: 700,
  animation: `${breathe} 1.25s ease-in-out infinite`,
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
};

/** 칩 안의 아이콘까지 돌리고 싶을 때. 아이콘이 없는 칩에는 영향이 없다. */
export const IN_PROGRESS_CHIP_WITH_ICON_SX = {
  ...IN_PROGRESS_CHIP_SX,
  "& .MuiChip-icon": {
    animation: `${spin} 1.4s linear infinite`,
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    "& .MuiChip-icon": { animation: "none" },
  },
};

/** 상태 값이 진행 중인가. 서버가 두 표기를 함께 쓴다(IN_PROGRESS, INPROGRESS). */
export const isInProgressStatus = (status) =>
  ["IN_PROGRESS", "INPROGRESS"].includes(
    String(status || "")
      .toUpperCase()
      .replace(/[\s-]/g, "_"),
  );
