// src/components/common/PageTitle.jsx

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { PAGE_TITLE } from "../../styles/layoutConstants";

/**
 * 화면 제목 한 줄 — 앞 아이콘 + 제목 + (선택) 제목 옆 부속물.
 *
 * 좌측 메뉴·가로 탭의 항목 아이콘과 같은 아이콘을 제목 앞에 두어, 지금 어느
 * 화면인지 메뉴와 본문이 같은 기호로 말하게 한다. 규격은 PAGE_TITLE 한 곳에서
 * 정의하므로 화면마다 크기·굵기를 다시 적지 않는다.
 *
 * @param {object} props
 * @param {React.ElementType} [props.icon]  제목 앞 아이콘 컴포넌트
 * @param {React.ReactNode} props.title     제목 텍스트
 * @param {React.ReactNode} [props.children] 제목 옆에 붙는 칩·버튼
 * @param {object} [props.sx]               줄 여백 등 개별 조정
 */
const PageTitle = ({ icon: Icon, title, children, sx, ...rest }) => (
  <Box sx={{ ...PAGE_TITLE.row, ...sx }} {...rest}>
    {Icon && <Icon color="primary" sx={PAGE_TITLE.icon} />}
    <Typography variant="h5" component="h1" sx={PAGE_TITLE.text}>
      {title}
    </Typography>
    {children}
  </Box>
);

PageTitle.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  sx: PropTypes.object,
};

export default PageTitle;
