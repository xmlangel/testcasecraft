// src/components/common/ScreenIdBadge.jsx
//
// 화면 우측 하단에 화면 ID(S0~S11)를 작게 띄운다.
//
// 기획 문서(`docs/screen_spec/`)의 화면 구분과 같은 ID다. 보고 있는 화면이 어느 문서에
// 해당하는지 눈으로 바로 확인할 수 있어야 QA·기획이 문서를 찾아 헤매지 않는다.
// 화면을 가리지 않는 것이 조건이므로 식별만 되는 최소 크기로 둔다.
// 좌측 하단은 서버 시간 표시가 쓰므로 우측에 놓는다.
//
// 마우스를 올렸을 때 나오는 화면 이름은 사용자의 언어 설정을 따른다.

import React from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useI18n } from "../../context/I18nContext.jsx";
import { resolveScreenId, SCREENS } from "../../constants/screenIds.js";

const ScreenIdBadge = () => {
  const { pathname, search } = useLocation();
  const { t } = useI18n();
  const id = resolveScreenId(pathname, search);

  // 규칙에 없는 주소에서는 아무것도 그리지 않는다. 틀린 ID를 보여주는 것보다 낫다.
  if (!id) return null;

  const name = t(`screenId.${id}`, SCREENS[id].name);

  return (
    <Box
      component="span"
      data-testid="screen-id-badge"
      title={t("screenId.tooltip", "화면 {id} · {name}")
        .replace("{id}", id)
        .replace("{name}", name)}
      aria-hidden="true"
      sx={{
        position: "fixed",
        right: 6,
        bottom: 4,
        zIndex: 1000,
        fontSize: 10,
        lineHeight: 1,
        fontFamily: "ui-monospace, Menlo, Consolas, monospace",
        letterSpacing: "0.02em",
        color: "text.disabled",
        opacity: 0.45,
        userSelect: "text",
        transition: "opacity 0.15s",
        "&:hover": { opacity: 0.9 },
      }}
    >
      {id}
    </Box>
  );
};

export default ScreenIdBadge;
