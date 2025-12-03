// src/components/TestCase/TestCaseFormMetadata.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

/**
 * 테스트케이스 메타데이터 아코디언 컴포넌트 (ID, Parent 정보)
 */
const TestCaseFormMetadata = ({
    testCase,
    projectId,
    infoOpen,
    setInfoOpen,
    isViewer,
    t,
    onChange,
}) => {
    return (
        <Accordion expanded={infoOpen} onChange={() => setInfoOpen(v => !v)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">ID, Parent</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <TextField
                    label="Project ID"
                    value={projectId}
                    fullWidth
                    disabled
                    margin="normal"
                    variant="outlined"
                    slotProps={{
                        input: { readOnly: true }
                    }}
                />
                <TextField
                    label="ID"
                    disabled
                    value={testCase?.id ? testCase.id : ''}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    slotProps={{
                        input: { readOnly: true }
                    }}
                />
                <TextField
                    label="Parent ID"
                    value={testCase?.parentId || ''}
                    onChange={onChange('parentId')}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    placeholder="null"
                    disabled={isViewer}
                />
                <TextField
                    label="Parent"
                    value={testCase?.parentName || ''}
                    fullWidth
                    disabled
                    margin="normal"
                    variant="outlined"
                />
                <TextField
                    label={t('testcase.form.displayOrder', '순서')}
                    value={testCase.displayOrder || ''}
                    onChange={onChange('displayOrder')}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    placeholder=""
                    disabled={isViewer}
                />
                <TextField
                    label={t('testcase.form.createdBy', '작성자')}
                    value={testCase?.createdBy || ''}
                    fullWidth
                    disabled
                    margin="normal"
                    variant="outlined"
                    slotProps={{
                        input: { readOnly: true }
                    }}
                />
                <TextField
                    label={t('testcase.form.updatedBy', '수정자')}
                    value={testCase?.updatedBy || ''}
                    fullWidth
                    disabled
                    margin="normal"
                    variant="outlined"
                    slotProps={{
                        input: { readOnly: true }
                    }}
                />
            </AccordionDetails>
        </Accordion>
    );
};

TestCaseFormMetadata.propTypes = {
    testCase: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    infoOpen: PropTypes.bool.isRequired,
    setInfoOpen: PropTypes.func.isRequired,
    isViewer: PropTypes.bool,
    t: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TestCaseFormMetadata;
