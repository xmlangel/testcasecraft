// src/components/TestCaseTree/components/BatchDeleteDialog.jsx

import React from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Box,
    CircularProgress,
} from "@mui/material";
import { useI18n } from "../../../context/I18nContext.jsx";

/**
 * 일괄 삭제 확인 다이얼로그 컴포넌트
 * @param {boolean} open - 다이얼로그 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {function} onConfirm - 확인 핸들러
 * @param {number} checkedCount - 선택된 항목 개수
 * @param {boolean} deleting - 삭제 진행 중 여부
 */
const BatchDeleteDialog = ({ open, onClose, onConfirm, checkedCount, deleting }) => {
    const { t } = useI18n();

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('testcase.tree.dialog.batchDelete.title', '선택 삭제')}</DialogTitle>
            <DialogContent>
                {deleting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <DialogContentText>
                            {t('testcase.tree.dialog.deleting', '삭제 중입니다...')}
                        </DialogContentText>
                    </Box>
                ) : (
                    <DialogContentText>
                        {t('testcase.tree.dialog.batchDelete.message', '{count}개 항목(하위 포함)을 삭제하시겠습니까?', { count: checkedCount })}
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={deleting}>
                    {t('testcase.tree.button.cancel', '취소')}
                </Button>
                <Button onClick={onConfirm} color="error" autoFocus variant="contained" disabled={deleting}>
                    {t('testcase.tree.button.delete', '삭제')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BatchDeleteDialog;
