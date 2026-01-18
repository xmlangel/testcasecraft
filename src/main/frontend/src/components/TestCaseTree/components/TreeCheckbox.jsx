// src/components/TestCaseTree/components/TreeCheckbox.jsx

import React from "react";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useI18n } from "../../../context/I18nContext.jsx";

/**
 * 전체 선택 체크박스 컴포넌트
 * @param {boolean} checked - 체크 상태
 * @param {boolean} indeterminate - 중간 상태 (일부만 선택됨)
 * @param {function} onChange - 체크 변경 핸들러
 * @param {number} totalTestCaseCount - 전체 테스트케이스 개수
 * @param {number} totalFolderCount - 전체 폴더 개수
 */
const TreeCheckbox = ({
    checked,
    indeterminate,
    onChange,
    totalTestCaseCount,
    totalFolderCount,
}) => {
    const { t } = useI18n();

    return (
        <Box sx={{ px: 2, pb: 1 }}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={checked}
                        indeterminate={indeterminate}
                        onChange={onChange}
                        size="small"
                    />
                }
                label={
                    <Box component="span" sx={{ fontSize: 14, display: 'flex', alignItems: 'center' }}>
                        {t('testcase.tree.selectAll', '전체 선택')}
                        {totalTestCaseCount > 0 && (
                            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                ({t('testcase.tree.count.testcase', 'TC: {count}', { count: totalTestCaseCount })},
                                {t('testcase.tree.count.folder', 'Folder: {count}', { count: totalFolderCount })})
                            </Typography>
                        )}
                    </Box>
                }
            />
        </Box>
    );
};

export default TreeCheckbox;
