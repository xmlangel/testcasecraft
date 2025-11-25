// src/components/TestCaseTree/components/DeleteDialog.jsx

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
    Typography,
} from "@mui/material";
import { useI18n } from "../../../context/I18nContext.jsx";

/**
 * 삭제 확인 다이얼로그 컴포넌트
 * @param {boolean} open - 다이얼로그 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {function} onConfirm - 확인 핸들러
 * @param {boolean} deleting - 삭제 진행 중 여부
 */
const DeleteDialog = ({ open, onClose, onConfirm, deleting }) => {
    const { t } = useI18n();

    return (
        <Dialog
            open={open}
            onClose={deleting ? null : onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {t('testcase.tree.dialog.deleteConfirm.title', '삭제 확인')}
            </DialogTitle>
            <DialogContent>
                {deleting ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <DialogContentText>
                            {t('testcase.tree.dialog.deleting', '삭제 중입니다...')}
                        </DialogContentText>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            {t('testcase.tree.dialog.deletingMessage', '하위 항목과 첨부파일을 포함하여 삭제하고 있습니다. 잠시만 기다려주세요.')}
                        </Typography>
                    </Box>
                ) : (
                    <DialogContentText id="alert-dialog-description">
                        {t('testcase.tree.dialog.deleteConfirm.message', '정말로 삭제하시겠습니까? (하위 항목 포함)')}
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={deleting}>
                    {t('testcase.tree.button.cancel', '취소')}
                </Button>
                <Button onClick={onConfirm} autoFocus color="error" disabled={deleting}>
                    {t('testcase.tree.button.delete', '삭제')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;
