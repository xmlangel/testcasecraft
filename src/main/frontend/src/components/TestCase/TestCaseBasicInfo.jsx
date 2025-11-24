// src/components/TestCase/TestCaseBasicInfo.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Autocomplete,
    Chip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import MarkdownFieldEditor from './MarkdownFieldEditor.jsx';

/**
 * Priority 값을 정규화 (Medium → MEDIUM, High → HIGH, Low → LOW)
 */
const normalizePriority = (priority) => {
    if (!priority) return 'MEDIUM';
    const upper = priority.toUpperCase();
    if (['HIGH', 'MEDIUM', 'LOW'].includes(upper)) {
        return upper;
    }
    return 'MEDIUM';
};

/**
 * 테스트케이스 기본 정보 아코디언 컴포넌트
 */
const TestCaseBasicInfo = ({
    testCase,
    errors,
    availableTags,
    linkedDocuments,
    ragDocuments,
    testCaseInfoOpen,
    setTestCaseInfoOpen,
    isViewer,
    t,
    theme,
    onChange,
    onTestCaseChange,
    onTagChange,
    onLinkedDocumentsChange,
    onMarkdownPaste,
}) => {
    return (
        <Accordion expanded={testCaseInfoOpen} onChange={() => setTestCaseInfoOpen(v => !v)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">{t('testcase.info.title', '테스트케이스 정보')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <TextField
                    label={t('testcase.form.name', '이름')}
                    value={testCase.name || ''}
                    onChange={onChange('name')}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    error={!!errors.name}
                    placeholder={t('testcase.form.testcaseName', '테스트케이스 이름')}
                    helperText={errors.name}
                    disabled={isViewer}
                />

                <MarkdownFieldEditor
                    label={t('testcase.form.description', '설명')}
                    value={testCase.description || ''}
                    placeholder={t('testcase.form.testcaseDescription', '테스트케이스 설명')}
                    height={300}
                    isViewer={isViewer}
                    theme={theme}
                    t={t}
                    onChange={(value) => onTestCaseChange('description', value)}
                    onPaste={(event) => onMarkdownPaste(event, { type: 'field', field: 'description' })}
                />

                <MarkdownFieldEditor
                    label={t('testcase.form.preCondition', '사전 조건')}
                    value={testCase.preCondition || ''}
                    placeholder={t('testcase.form.preConditionPlaceholder', '사전 조건')}
                    height={250}
                    isViewer={isViewer}
                    theme={theme}
                    t={t}
                    onChange={(value) => onTestCaseChange('preCondition', value)}
                    onPaste={(event) => onMarkdownPaste(event, { type: 'field', field: 'preCondition' })}
                />

                <MarkdownFieldEditor
                    label={t('testcase.form.postCondition', '사후 조건')}
                    value={testCase.postCondition || ''}
                    placeholder={t('testcase.form.postConditionPlaceholder', '테스트 종료 후 기대 상태를 입력하세요.')}
                    height={250}
                    isViewer={isViewer}
                    theme={theme}
                    t={t}
                    onChange={(value) => onTestCaseChange('postCondition', value)}
                    onPaste={(event) => onMarkdownPaste(event, { type: 'field', field: 'postCondition' })}
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={Boolean(testCase.isAutomated)}
                            onChange={(event) => {
                                if (isViewer) return;
                                const { checked } = event.target;
                                onTestCaseChange('isAutomated', checked, true);
                            }}
                            color="primary"
                            disabled={isViewer}
                        />
                    }
                    sx={{ mt: 2 }}
                    label={t('testcase.form.isAutomated', '자동화 여부')}
                />

                <FormControl fullWidth margin="normal" disabled={isViewer}>
                    <InputLabel id="execution-type-select-label">{t('testcase.form.executionType', 'Manual/Automation')}</InputLabel>
                    <Select
                        labelId="execution-type-select-label"
                        value={testCase.executionType || (testCase.isAutomated ? 'Automation' : 'Manual')}
                        label={t('testcase.form.executionType', 'Manual/Automation')}
                        onChange={(event) => {
                            onTestCaseChange('executionType', event.target.value, false);
                        }}
                    >
                        <MenuItem value="Manual">{t('testcase.executionType.manual', 'Manual')}</MenuItem>
                        <MenuItem value="Automation">{t('testcase.executionType.automation', 'Automation')}</MenuItem>
                        <MenuItem value="Hybrid">{t('testcase.executionType.hybrid', 'Hybrid')}</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label={t('testcase.form.testTechnique', '테스트 기법')}
                    value={testCase.testTechnique || ''}
                    onChange={onChange('testTechnique')}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    disabled={isViewer}
                    placeholder={t('testcase.form.testTechniquePlaceholder', '예: 경계값 분석, 의사결정 테이블 등')}
                />

                <FormControl fullWidth margin="normal" disabled={isViewer}>
                    <InputLabel id="priority-select-label">{t('testcase.form.priority', '우선순위')}</InputLabel>
                    <Select
                        labelId="priority-select-label"
                        value={normalizePriority(testCase.priority)}
                        label={t('testcase.form.priority', '우선순위')}
                        onChange={onChange('priority')}
                    >
                        <MenuItem value="HIGH">{t('testcase.priority.high', '높음')}</MenuItem>
                        <MenuItem value="MEDIUM">{t('testcase.priority.medium', '보통')}</MenuItem>
                        <MenuItem value="LOW">{t('testcase.priority.low', '낮음')}</MenuItem>
                    </Select>
                </FormControl>

                <Autocomplete
                    multiple
                    freeSolo
                    options={availableTags}
                    value={testCase.tags || []}
                    onChange={(event, newValue) => onTagChange(newValue)}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <Chip
                                    key={key}
                                    variant="outlined"
                                    label={option}
                                    {...tagProps}
                                    disabled={isViewer}
                                />
                            );
                        })
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={t('testcase.form.tags', '태그')}
                            placeholder={t('testcase.form.tagsPlaceholder', '태그를 입력하고 Enter를 누르세요')}
                            helperText={t('testcase.helper.tags', '여러 태그를 입력할 수 있습니다')}
                            margin="normal"
                        />
                    )}
                    disabled={isViewer}
                />

                <Autocomplete
                    multiple
                    options={ragDocuments}
                    value={linkedDocuments}
                    onChange={(event, newValue) => onLinkedDocumentsChange(newValue)}
                    getOptionLabel={(option) => option.fileName || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                            <li key={option.id} {...optionProps}>
                                {option.fileName}
                            </li>
                        );
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <Chip
                                    key={option.id || index}
                                    variant="outlined"
                                    label={option.fileName}
                                    {...tagProps}
                                    disabled={isViewer}
                                />
                            );
                        })
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={t('testcase.form.linkedDocuments', '연결된 RAG 문서')}
                            placeholder={t('testcase.form.linkedDocumentsPlaceholder', 'RAG 문서를 선택하세요')}
                            helperText={t('testcase.helper.linkedDocuments', 'RAG 문서를 연결하면 AI가 참고할 수 있습니다')}
                            margin="normal"
                        />
                    )}
                    disabled={isViewer}
                />
            </AccordionDetails>
        </Accordion>
    );
};

TestCaseBasicInfo.propTypes = {
    testCase: PropTypes.object.isRequired,
    errors: PropTypes.object,
    availableTags: PropTypes.array,
    linkedDocuments: PropTypes.array,
    ragDocuments: PropTypes.array,
    testCaseInfoOpen: PropTypes.bool.isRequired,
    setTestCaseInfoOpen: PropTypes.func.isRequired,
    isViewer: PropTypes.bool,
    t: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onTestCaseChange: PropTypes.func.isRequired,
    onTagChange: PropTypes.func.isRequired,
    onLinkedDocumentsChange: PropTypes.func.isRequired,
    onMarkdownPaste: PropTypes.func.isRequired,
};

export default TestCaseBasicInfo;
