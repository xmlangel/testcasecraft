import React from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TestResult } from '../../models/testExecution.jsx';
import { RESULT_COLORS } from '../../constants/statusColors';

const TestResultSelector = ({
    result,
    onChange,
    isViewer,
    t,
    minWidth = '150px',
    padding = '16px 24px',
    fontSize = '1.15rem'
}) => {
    return (
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }} disabled={isViewer}>
            <FormLabel
                component="legend"
                sx={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    mb: 2.5,
                    color: (theme) => theme.palette.text.primary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}
            >
                {t('testResult.form.testResult', '테스트 결과')}
            </FormLabel>
            <RadioGroup
                row
                name="test-result"
                value={result || ''}
                onChange={onChange}
                sx={{
                    gap: 2.5,
                    '& .MuiFormControlLabel-root': {
                        margin: 0,
                        flex: '1 1 auto',
                        minWidth: minWidth
                    }
                }}
            >
                {Object.values(TestResult).map((value) => {
                    const isSelected = result === value;
                    const getColorConfig = () => {
                        const color = RESULT_COLORS[value] || RESULT_COLORS.NOTRUN;
                        return {
                            bg: isSelected ? color : (theme) => alpha(color, 0.1),
                            border: isSelected ? color : alpha(color, 0.5),
                            text: isSelected ? '#fff' : color,
                            hoverBg: (theme) => alpha(color, 0.2)
                        };
                    };

                    const colors = getColorConfig();

                    return (
                        <FormControlLabel
                            key={value}
                            value={value}
                            control={
                                <Radio
                                    sx={{
                                        display: 'none'
                                    }}
                                />
                            }
                            label={value.replace('_', ' ')}
                            disabled={isViewer}
                            sx={{
                                border: `4px solid ${colors.border}`,
                                borderRadius: 3,
                                padding,
                                backgroundColor: colors.bg,
                                color: colors.text,
                                fontWeight: isSelected ? 700 : 600,
                                fontSize,
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: isViewer ? 'not-allowed' : 'pointer',
                                opacity: isViewer ? 0.5 : 1,
                                boxShadow: isSelected
                                    ? `0 8px 24px ${colors.border}60, 0 0 0 3px ${colors.border}20`
                                    : `0 2px 8px ${colors.border}20`,
                                transform: isSelected ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
                                '&:hover': {
                                    backgroundColor: isViewer ? colors.bg : colors.hoverBg,
                                    transform: isViewer ? 'scale(1)' : 'scale(1.05) translateY(-2px)',
                                    boxShadow: isViewer ? `0 2px 8px ${colors.border}20` : `0 8px 16px ${colors.border}40`,
                                    borderColor: colors.border
                                },
                                '& .MuiFormControlLabel-label': {
                                    width: '100%',
                                    textAlign: 'center',
                                    fontSize,
                                    fontWeight: isSelected ? 700 : 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }
                            }}
                        />
                    );
                })}
            </RadioGroup>
        </FormControl>
    );
};

export default TestResultSelector;
