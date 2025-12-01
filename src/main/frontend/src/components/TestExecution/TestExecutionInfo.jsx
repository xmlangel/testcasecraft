import React from 'react';
import PropTypes from "prop-types";
import {
    Box, TextField, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Checkbox, Typography, Autocomplete, Chip
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
            <TextField
                id="execution-name-input"
                label={t('testExecution.form.executionName')}
                value={execution?.name || ""}
                onChange={handleChange("name")}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                disabled={!canEditBasicInfo}
                inputProps={{ "aria-label": t('testExecution.form.executionName') }}
            />
            <FormControl fullWidth margin="normal" disabled={!canEditBasicInfo}>
                <InputLabel id="test-plan-label">{t('testExecution.form.testPlan')}</InputLabel>
                <Select
                    id="test-plan-select"
                    labelId="test-plan-label"
                    value={(() => {
                        const planId = execution?.testPlanId || "";
                        // testPlans가 로드되지 않았거나 해당 ID가 존재하지 않으면 빈 값 반환
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
            <TextField
                id="execution-description-input"
                label={t('testExecution.form.description')}
                value={execution?.description || ""}
                onChange={handleChange("description")}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={3}
                disabled={!canEditBasicInfo}
                inputProps={{ "aria-label": t('testExecution.form.description') }}
            />

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
                        helperText={t('testExecution.helper.tags', '여러 태그를 입력할 수 있습니다')}
                        margin="normal"
                    />
                )}
                disabled={!canEditBasicInfo}
            />

            {/* 즉시 실행 시작 옵션 - 새로운 실행 생성시에만 표시 */}
            {!executionId && canEditBasicInfo && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={startImmediately}
                            onChange={(e) => setStartImmediately(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                {t('testExecution.form.startImmediatelyLabel')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('testExecution.form.startImmediatelyDescription')}
                            </Typography>
                        </Box>
                    }
                    sx={{ mt: 1, mb: 1, alignItems: "flex-start" }}
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
