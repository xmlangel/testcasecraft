// src/components/TestCase/ColumnOrderDialog.jsx
// ICT-275: 컬럼 순서 변경 다이얼로그

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext';

const ColumnOrderDialog = ({ 
  open, 
  onClose, 
  columns, 
  columnOrder, 
  columnVisibility, 
  onOrderChange 
}) => {
  const { t } = useI18n();
  const [localOrder, setLocalOrder] = useState([]);

  // 다이얼로그가 열릴 때 현재 순서로 초기화
  useEffect(() => {
    if (open && columnOrder) {
      setLocalOrder([...columnOrder]);
    }
  }, [open, columnOrder]);

  // 컬럼 이름 매핑
  const getColumnDisplayName = (fieldName) => {
    const column = columns.find(col => col.field === fieldName);
    return column ? column.headerName : fieldName;
  };

  // 위로 이동
  const moveUp = (index) => {
    if (index > 0) {
      const newOrder = [...localOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setLocalOrder(newOrder);
    }
  };

  // 아래로 이동
  const moveDown = (index) => {
    if (index < localOrder.length - 1) {
      const newOrder = [...localOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setLocalOrder(newOrder);
    }
  };

  // 저장 및 닫기
  const handleSave = () => {
    onOrderChange(localOrder);
    onClose();
  };

  // 취소
  const handleCancel = () => {
    setLocalOrder([...columnOrder]); // 원래 순서로 복원
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: '400px' }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DragIcon color="action" />
          <Typography variant="h6">{t('testResult.orderDialog.title', '컬럼 순서 변경')}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('testResult.orderDialog.description', '위/아래 화살표 버튼을 사용하여 컬럼 순서를 변경하세요')}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 0 }}>
        <List sx={{ width: '100%' }}>
          {localOrder.map((fieldName, index) => {
            const isVisible = columnVisibility[fieldName] !== false;
            
            return (
              <ListItem 
                key={fieldName}
                sx={{ 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                  backgroundColor: isVisible ? 'transparent' : 'rgba(0, 0, 0, 0.04)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  minWidth: 0,
                  flex: 1 
                }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      minWidth: '30px',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    {index + 1}
                  </Typography>
                  
                  <ListItemText
                    primary={getColumnDisplayName(fieldName)}
                    secondary={fieldName}
                    slotProps={{
                      primary: {
                        sx: { 
                          fontWeight: isVisible ? 500 : 400,
                          color: isVisible ? 'text.primary' : 'text.disabled'
                        }
                      },

                      secondary: {
                        sx: { 
                          fontSize: '0.75rem',
                          color: isVisible ? 'text.secondary' : 'text.disabled'
                        }
                      }
                    }} />
                  
                  <Chip 
                    label={isVisible ? t('testResult.orderDialog.visible', '표시') : t('testResult.orderDialog.hidden', '숨김')} 
                    size="small"
                    color={isVisible ? 'primary' : 'default'}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <IconButton
                      size="small"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      sx={{ 
                        p: 0.5,
                        '&:disabled': { 
                          color: 'action.disabled' 
                        }
                      }}
                    >
                      <ArrowUpIcon fontSize="small" />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => moveDown(index)}
                      disabled={index === localOrder.length - 1}
                      sx={{ 
                        p: 0.5,
                        '&:disabled': { 
                          color: 'action.disabled' 
                        }
                      }}
                    >
                      <ArrowDownIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          {t('testResult.orderDialog.cancel', '취소')}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
        >
          {t('testResult.orderDialog.apply', '순서 적용')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnOrderDialog;