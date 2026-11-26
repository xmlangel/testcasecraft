import React from "react";
import { Box } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import { useI18n } from "../../context/I18nContext";
import EmptyState from "./EmptyState.jsx";

// 테스트케이스 화면의 빈 상태. 다른 화면과 같은 EmptyState 모양을 쓴다 (ICT-514).
const NoSelectionPlaceholder = () => {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "100%",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <EmptyState
        fill
        icon={TouchAppIcon}
        data-testid="testcase-empty-state"
        title={t(
          "testcase.message.noSelection",
          "폴더나 테스트 케이스를 선택해주세요.",
        )}
        description={t(
          "testcase.message.selectTreeItem",
          "좌측 트리에서 항목을 선택하면 상세 정보를 볼 수 있습니다.",
        )}
      />
    </Box>
  );
};

export default NoSelectionPlaceholder;
