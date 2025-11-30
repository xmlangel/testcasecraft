// src/components/RAG/DocumentListDialogs.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    Typography,
} from '@mui/material';
import DocumentUpload from './DocumentUpload.jsx';
import DocumentPreviewDialog from './DocumentPreviewDialog.jsx';
import DocumentChunks from './DocumentChunks.jsx';

/**
 * 문서 목록 다이얼로그 모음 컴포넌트
 * 삭제 확인, 업로드, 공통 문서 이동/요청, 미리보기, 청크 보기 다이얼로그를 포함합니다.
 */
function DocumentListDialogs({
    // 삭제 다이얼로그
    deleteDialogOpen,
    onDeleteCancel,
    onDeleteConfirm,
    // 업로드 다이얼로그
    uploadDialogOpen,
    onUploadClose,
    onUploadSuccess,
    projectId,
    // 공통 문서 이동 다이얼로그
    promoteDialogState,
    onPromoteClose,
    onPromoteReasonChange,
    onPromoteSubmit,
    promoteSubmitting,
    // 공통 문서 등록 요청 다이얼로그
    requestDialogState,
    onRequestClose,
    onRequestMessageChange,
    onRequestSubmit,
    requestSubmitting,
    // 미리보기 다이얼로그
    previewDialogState,
    onPreviewClose,
    fetchPreview,
    // 청크 보기 다이얼로그
    chunksDialogState,
    onChunksClose,
    onViewChunks = null,
    // 번역 함수
    t,
}) {
    return (
        <>
            {/* 삭제 확인 다이얼로그 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={onDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    {t('rag.document.deleteDialog.title', '문서 삭제 확인')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        {t('rag.document.deleteDialog.message', '이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDeleteCancel} color="primary">
                        {t('common.cancel', '취소')}
                    </Button>
                    <Button onClick={onDeleteConfirm} color="error" variant="contained" autoFocus>
                        {t('common.delete', '삭제')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 공통 문서 이동 다이얼로그 */}
            <Dialog
                open={promoteDialogState.open}
                onClose={onPromoteClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('rag.document.global.promoteTitle', '공통 문서로 이동')}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {t('rag.document.global.promoteDescription', '선택한 문서를 모든 프로젝트에서 참조할 수 있는 공통 RAG 문서로 이동합니다.')}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {promoteDialogState.document?.fileName}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label={t('rag.document.global.promoteReason', '이동 사유 (선택)')}
                        value={promoteDialogState.reason}
                        onChange={onPromoteReasonChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onPromoteClose}>
                        {t('common.cancel', '취소')}
                    </Button>
                    <Button
                        onClick={onPromoteSubmit}
                        variant="contained"
                        color="primary"
                        disabled={promoteSubmitting}
                    >
                        {promoteSubmitting ? t('common.processing', '처리 중...') : t('rag.document.global.promoteAction', '공통 문서로 이동')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 공통 문서 등록 요청 다이얼로그 */}
            <Dialog
                open={requestDialogState.open}
                onClose={onRequestClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('rag.document.global.requestTitle', '공통 문서 등록 요청')}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {t('rag.document.global.requestDescription', '관리자에게 이 문서를 공통 RAG 문서로 등록해달라고 요청합니다.')}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {requestDialogState.document?.fileName}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label={t('rag.document.global.requestMessage', '추가 메시지 (선택)')}
                        value={requestDialogState.message}
                        onChange={onRequestMessageChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onRequestClose}>
                        {t('common.cancel', '취소')}
                    </Button>
                    <Button
                        onClick={onRequestSubmit}
                        variant="contained"
                        color="primary"
                        disabled={requestSubmitting}
                    >
                        {requestSubmitting ? t('common.processing', '처리 중...') : t('rag.document.global.requestAction', '공통 문서 등록 요청')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 업로드 다이얼로그 */}
            <Dialog
                open={uploadDialogOpen}
                onClose={onUploadClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>{t('rag.upload.title', '문서 업로드')}</DialogTitle>
                <DialogContent dividers>
                    <DocumentUpload
                        projectId={projectId}
                        onUploadSuccess={onUploadSuccess}
                        embedded
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onUploadClose}>
                        {t('common.close', '닫기')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 미리보기 다이얼로그 */}
            <DocumentPreviewDialog
                open={previewDialogState.open}
                document={previewDialogState.document}
                onClose={onPreviewClose}
                fetchPreview={fetchPreview}
            />

            {/* 청크 보기 다이얼로그 */}
            {!onViewChunks && chunksDialogState.document && (
                <DocumentChunks
                    open={chunksDialogState.open}
                    onClose={onChunksClose}
                    documentId={chunksDialogState.document.id}
                    documentName={chunksDialogState.document.fileName}
                />
            )}
        </>
    );
}

DocumentListDialogs.propTypes = {
    deleteDialogOpen: PropTypes.bool.isRequired,
    onDeleteCancel: PropTypes.func.isRequired,
    onDeleteConfirm: PropTypes.func.isRequired,
    uploadDialogOpen: PropTypes.bool.isRequired,
    onUploadClose: PropTypes.func.isRequired,
    onUploadSuccess: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    promoteDialogState: PropTypes.shape({
        open: PropTypes.bool.isRequired,
        document: PropTypes.object,
        reason: PropTypes.string,
    }).isRequired,
    onPromoteClose: PropTypes.func.isRequired,
    onPromoteReasonChange: PropTypes.func.isRequired,
    onPromoteSubmit: PropTypes.func.isRequired,
    promoteSubmitting: PropTypes.bool.isRequired,
    requestDialogState: PropTypes.shape({
        open: PropTypes.bool.isRequired,
        document: PropTypes.object,
        message: PropTypes.string,
    }).isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onRequestMessageChange: PropTypes.func.isRequired,
    onRequestSubmit: PropTypes.func.isRequired,
    requestSubmitting: PropTypes.bool.isRequired,
    previewDialogState: PropTypes.shape({
        open: PropTypes.bool.isRequired,
        document: PropTypes.object,
    }).isRequired,
    onPreviewClose: PropTypes.func.isRequired,
    fetchPreview: PropTypes.func.isRequired,
    chunksDialogState: PropTypes.shape({
        open: PropTypes.bool.isRequired,
        document: PropTypes.object,
    }).isRequired,
    onChunksClose: PropTypes.func.isRequired,
    onViewChunks: PropTypes.func,
    t: PropTypes.func.isRequired,
};

export default DocumentListDialogs;
