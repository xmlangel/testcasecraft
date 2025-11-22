import React from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';

const TestResultTags = ({
    tags,
    setTags,
    availableTags,
    isViewer,
    t
}) => {
    return (
        <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={tags}
            onChange={(event, newValue) => {
                setTags(newValue);
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
                            disabled={isViewer}
                        />
                    );
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label={t('testResult.form.tags', '태그')}
                    placeholder={t('testResult.form.tagsPlaceholder', '태그를 입력하고 Enter를 누르세요')}
                    helperText={t('testResult.helper.tags', '여러 태그를 입력할 수 있습니다')}
                    margin="normal"
                />
            )}
            disabled={isViewer}
            sx={{ mt: 2 }}
        />
    );
};

export default TestResultTags;
