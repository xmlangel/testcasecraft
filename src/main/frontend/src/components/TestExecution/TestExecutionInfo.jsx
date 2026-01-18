import React from 'react';
import PropTypes from "prop-types";
import {
    Box, TextField, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Checkbox, Typography, Autocomplete, Chip, Grid
} from "@mui/material";
import { useTranslation } from '../../context/I18nContext.jsx';

const TestExecutionInfo = ({
    execution,
    handleChange,
    testPlans,
    handlePlanChange,
    availableTags,
    setExecution,
    canEditBasicInfo,
    startImmediately,
    setStartImmediately,
    executionId
}) => {
    const { t } = useTranslation();

    return (
        <>
            <Grid container spacing={1}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        id="execution-name-input"
                        label={t('testExecution.form.executionName')}
                        value={execution?.name || ""}
                        onChange={handleChange("name")}
                        fullWidth
                        margin="dense"
                        size="small"
                        variant="outlined"
                        required
                        disabled={!canEditBasicInfo}
                        slotProps={{
                            htmlInput: { "aria-label": t('testExecution.form.executionName') }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth margin="dense" size="small" disabled={!canEditBasicInfo}>
                        <InputLabel id="test-plan-label">{t('testExecution.form.testPlan')}</InputLabel>
                        <Select
                            id="test-plan-select"
                            labelId="test-plan-label"
                            value={(() => {
                                const planId = execution?.testPlanId || "";
                                if (!planId || testPlans.length === 0) return "";
                                const planExists = testPlans.some(plan => plan.id === planId);
                                return planExists ? planId : "";
                            })()}
                            onChange={handlePlanChange}
                            label={t('testExecution.form.testPlan')}
                            aria-label={t('testExecution.form.testPlan')}
                        >
                            <MenuItem value="">
                                <em>{t('common.select')}</em>
                            </MenuItem>
                            {testPlans.map((plan) => (
                                <MenuItem key={plan.id} value={plan.id}>
                                    {plan.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                        multiple
                        freeSolo
                        options={availableTags}
                        value={execution?.tags || []}
                        onChange={(event, newValue) => {
                            setExecution(prev => ({ ...prev, tags: newValue }));
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                    <Chip
                                        key={key}
                                        variant="outlined"
                                        label={option}
                                        size="small"
                                        {...tagProps}
                                        disabled={!canEditBasicInfo}
                                    />
                                );
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label={t('testExecution.form.tags', '태그')}
                                placeholder={t('testExecution.form.tagsPlaceholder', '태그를 입력하고 Enter를 누르세요')}
                                margin="dense"
                                size="small"
                            />
                        )}
                        disabled={!canEditBasicInfo}
                    />
                </Grid>
            </Grid>
            <TextField
                id="execution-description-input"
                label={t('testExecution.form.description')}
                value={execution?.description || ""}
                onChange={handleChange("description")}
                fullWidth
                margin="dense"
                size="small"
                variant="outlined"
                multiline
                rows={1}
                disabled={!canEditBasicInfo}
                slotProps={{
                    htmlInput: { "aria-label": t('testExecution.form.description') }
                }}
            />
            {/* 즉시 실행 시작 옵션 - 새로운 실행 생성시에만 표시 */}
            {!executionId && canEditBasicInfo && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={startImmediately}
                            onChange={(e) => setStartImmediately(e.target.checked)}
                            color="primary"
                            size="small"
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }} color="text.primary">
                                {t('testExecution.form.startImmediatelyLabel')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('testExecution.form.startImmediatelyDescription')}
                            </Typography>
                        </Box>
                    }
                    sx={{ mt: 0.5, mb: 0.5 }}
                />
            )}
        </>
    );
};

TestExecutionInfo.propTypes = {
    execution: PropTypes.object,
    handleChange: PropTypes.func.isRequired,
    testPlans: PropTypes.array.isRequired,
    handlePlanChange: PropTypes.func.isRequired,
    availableTags: PropTypes.array,
    setExecution: PropTypes.func.isRequired,
    canEditBasicInfo: PropTypes.bool,
    startImmediately: PropTypes.bool,
    setStartImmediately: PropTypes.func,
    executionId: PropTypes.string,
};

export default TestExecutionInfo;
