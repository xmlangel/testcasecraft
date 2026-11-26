// src/components/TestCase/TestCaseWorkspaceFrame.jsx
//
// 테스트케이스 화면의 트리 + 상세 칸 틀. App.jsx 에 있던 마크업을 옮겼다.
// ICT-510: 768px 미만에서는 트리 옆에 상세 칸이 좁게 끼어 문구가 한 글자씩 세로로 쌓였다.
// 그 폭에서는 1단으로 바꿔 트리를 위에, 상세를 아래에 전체 폭으로 둔다. 768px 이상은 이전 2단 그대로다.

import React from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Paper, useMediaQuery } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import Resizer from "../common/Resizer.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { SINGLE_PANE_QUERY } from "../../styles/responsive.js";

// 1단에서 트리 칸이 차지하는 높이. 나머지는 상세 칸이 쓴다.
const SINGLE_PANE_TREE_HEIGHT = "40%";
const SINGLE_PANE_TREE_MIN_HEIGHT = 200;

/** 768px 미만이면 true. App 이 트리 예약 폭을 정할 때도 같은 기준을 쓴다. */
export const useSinglePaneLayout = () => useMediaQuery(SINGLE_PANE_QUERY);

function TestCaseWorkspaceFrame({
  frameRef,
  height,
  treeVisible,
  treeShown,
  treeWidth,
  treeMinWidth,
  treeMaxWidth,
  onTreeToggle,
  onResizerDrag,
  tree,
  detail,
}) {
  const { t } = useI18n();
  const singlePane = useSinglePaneLayout();

  return (
    <Box
      ref={frameRef}
      data-testid="testcase-workspace-frame"
      data-layout={singlePane ? "single" : "split"}
      sx={{
        display: "flex",
        flexDirection: singlePane ? "column" : "row",
        height,
      }}
    >
      {/* 트리 토글 버튼 - ICT-315 */}
      {!treeVisible && (
        <Box
          sx={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            backgroundColor: "background.paper",
            boxShadow: 2,
            borderRadius: 1,
          }}
        >
          <IconButton
            onClick={onTreeToggle}
            size="small"
            sx={{
              color: "primary.main",
              "&:hover": { backgroundColor: "action.hover" },
            }}
            title={t("testcase.tree.tooltip.open")}
            data-testid="testcase-tree-open"
          >
            {singlePane ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
      )}

      {/* 트리 영역 */}
      {treeShown && (
        <>
          <Paper
            data-testid="testcase-tree-pane"
            sx={
              singlePane
                ? {
                    width: "100%",
                    height: SINGLE_PANE_TREE_HEIGHT,
                    minHeight: SINGLE_PANE_TREE_MIN_HEIGHT,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    position: "relative",
                  }
                : {
                    width: treeWidth,
                    minWidth: treeMinWidth,
                    maxWidth: treeMaxWidth,
                    height: "100%",
                    transition: "width 0.3s ease-in-out",
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    position: "relative",
                  }
            }
            elevation={3}
          >
            {/* 트리 닫기 버튼 */}
            <Box
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                zIndex: 5,
              }}
            >
              <IconButton
                onClick={onTreeToggle}
                size="small"
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    color: "primary.main",
                  },
                }}
                title={t("testcase.tree.tooltip.close")}
                data-testid="testcase-tree-close"
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>

            {tree}
          </Paper>
          {/* 1단에서는 좌우 폭 조절이 의미가 없어 막대를 그리지 않는다 */}
          {!singlePane && <Resizer onDrag={onResizerDrag} />}
        </>
      )}

      {/* 입력폼/스프레드시트 영역 — 페이지 프레임 안에서 내부 스크롤 */}
      <Box
        data-testid="testcase-detail-pane"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          ml: treeShown && !singlePane ? 1 : 0,
          mt: treeShown && singlePane ? 1 : 0,
          transition: "margin-left 0.3s ease-in-out",
          height: singlePane ? "auto" : "100%",
          overflowY: "auto",
        }}
      >
        {detail}
      </Box>
    </Box>
  );
}

TestCaseWorkspaceFrame.propTypes = {
  frameRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  height: PropTypes.string.isRequired,
  treeVisible: PropTypes.bool.isRequired,
  treeShown: PropTypes.bool.isRequired,
  treeWidth: PropTypes.number.isRequired,
  treeMinWidth: PropTypes.number,
  treeMaxWidth: PropTypes.number,
  onTreeToggle: PropTypes.func.isRequired,
  onResizerDrag: PropTypes.func.isRequired,
  tree: PropTypes.node,
  detail: PropTypes.node,
};

export default TestCaseWorkspaceFrame;
