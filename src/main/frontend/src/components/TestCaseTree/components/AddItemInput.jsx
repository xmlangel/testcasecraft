// src/components/TestCaseTree/components/AddItemInput.jsx

import React from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import {
    Folder as FolderIcon,
    Description as DescriptionIcon,
    Add as AddIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { useI18n } from "../../../context/I18nContext.jsx";

/**
 * 새 항목 추가 입력 폼 컴포넌트
 * @param {Object} itemData - 추가할 항목 데이터 { type, name, parentId, projectId }
 * @param {function} onConfirm - 확인 핸들러
 * @param {function} onCancel - 취소 핸들러
 * @param {function} onChange - 이름 변경 핸들러
 * @param {boolean} isRoot - 루트 레벨 추가 여부
 */
const AddItemInput = ({ itemData, onConfirm, onCancel, onChange, isRoot = false }) => {
    const { t } = useI18n();

    if (!itemData) return null;

    const handleKeyPress = (e) => {
        if (e.key === "Enter") onConfirm();
    };

    if (isRoot) {
        return (
            <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="caption" color="text.secondary">
                    {t('testcase.tree.root', '루트')}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {itemData.type === "folder" ? (
                        <FolderIcon color="primary" sx={{ mr: 1 }} />
                    ) : (
                        <DescriptionIcon sx={{ mr: 1 }} />
                    )}
                    <TextField
                        size="small"
                        placeholder={itemData.type}
                        value={itemData.name}
                        onChange={onChange}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        fullWidth
                    />
                    <IconButton
                        size="small"
                        onClick={onConfirm}
                        data-testid="confirm-add-button"
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onCancel}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ mb: 1, display: "flex", alignItems: "center", ml: 3 }}>
            {itemData.type === "folder" ? (
                <FolderIcon color="primary" sx={{ mr: 1 }} />
            ) : (
                <DescriptionIcon sx={{ mr: 1 }} />
            )}
            <TextField
                size="small"
                placeholder={itemData.type}
                value={itemData.name}
                onChange={onChange}
                onKeyPress={handleKeyPress}
                autoFocus
                fullWidth
            />
            <IconButton size="small" onClick={onConfirm}>
                <AddIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onCancel}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default AddItemInput;
