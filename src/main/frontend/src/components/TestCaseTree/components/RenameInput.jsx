// src/components/TestCaseTree/components/RenameInput.jsx

import React from "react";
import { Box, IconButton, TextField } from "@mui/material";
import {
    Edit as EditIcon,
    Close as CloseIcon,
} from "@mui/icons-material";

/**
 * 이름 변경 입력 폼 컴포넌트
 * @param {Object} renameData - { id, name }
 * @param {function} onConfirm - 확인 핸들러
 * @param {function} onCancel - 취소 핸들러
 * @param {function} onChange - 이름 변경 핸들러
 */
const RenameInput = ({ renameData, onConfirm, onCancel, onChange }) => {
    if (!renameData) return null;

    const handleKeyPress = (e) => {
        if (e.key === "Enter") onConfirm();
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", p: 0.5 }}>
            <TextField
                size="small"
                value={renameData.name}
                onChange={onChange}
                onKeyPress={handleKeyPress}
                autoFocus
                fullWidth
                onClick={(e) => e.stopPropagation()}
            />
            <IconButton size="small" onClick={onConfirm}>
                <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onCancel}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default RenameInput;
