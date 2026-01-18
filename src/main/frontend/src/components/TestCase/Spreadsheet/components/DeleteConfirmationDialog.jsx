import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    DialogContentText,
    Alert,
    Chip
} from '@mui/material';
import {
    Warning as WarningIcon,
    Delete as DeleteIcon,
    Folder as FolderIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { useI18n } from '../../../../context/I18nContext';

/**
 * 삭제 확인 다이얼로그 (페이지네이션 포함)
 */
export const DeleteConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    items = [], // { id, displayId, name, type } 배열
    title = '삭제 확인',
    description = '다음 항목들을 삭제하시겠습니까?'
}) => {
    const { t } = useI18n();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // 다이얼로그가 열릴 때 페이지 초기화
    React.useEffect(() => {
        if (open) {
            setPage(0);
        }
    }, [open]);

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, items.length - page * rowsPerPage);

    // 폴더가 포함되어 있는지 확인
    const hasFolder = items.some(item => item.type === 'folder');

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            disableRestoreFocus
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    <Typography variant="h6">{title}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <DialogContentText sx={{ mb: 2 }}>
                    {description}
                </DialogContentText>

                {hasFolder && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {t('testcase.dialog.delete.folderWarning', '폴더를 삭제하면 하위 테스트 케이스도 모두 삭제됩니다.')}
                    </Alert>
                )}

                {items.length > 0 ? (
                    <Box component={Paper} variant="outlined">
                        <TableContainer sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="15%">Type</TableCell>
                                        <TableCell width="25%">ID</TableCell>
                                        <TableCell width="60%">Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(rowsPerPage > 0
                                        ? items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : items
                                    ).map((item, index) => (
                                        <TableRow key={item.id || index}>
                                            <TableCell>
                                                {item.type === 'folder' ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <FolderIcon fontSize="small" color="action" />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {t('testcase.type.folder', 'Folder')}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <DescriptionIcon fontSize="small" color="action" />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {t('testcase.type.testcase', 'Test Case')}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.displayId || '(No ID)'}</TableCell>
                                            <TableCell>{item.name || '(No Name)'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {emptyRows > 0 && (
                                        <TableRow style={{ height: 33 * emptyRows }}>
                                            <TableCell colSpan={3} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={items.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage={t('common.pagination.rowsPerPage', '페이지당 행:')}
                        />
                    </Box>
                ) : (
                    <Alert severity="info">
                        선택된 항목이 없습니다.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    {t('common.button.cancel', '취소')}
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    autoFocus
                >
                    {t('common.button.delete', '삭제')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeleteConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    items: PropTypes.array,
    title: PropTypes.string,
    description: PropTypes.string
};
