// src/components/RAG/DocumentListTabs.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from '@mui/material';

/**
 * 문서 목록 탭 컴포넌트
 * 일반 문서와 테스트케이스 문서를 탭으로 분류합니다.
 */
function DocumentListTabs({
    tabValue,
    onTabChange,
    regularCount,
    testCaseCount,
    isAdmin,
    t,
}) {
    return (
        <Tabs
            value={isAdmin ? tabValue : 0}
            onChange={isAdmin ? onTabChange : undefined}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
            <Tab
                label={`${t('rag.document.list.regularDocuments', '업로드된 문서')} (${regularCount})`}
            />
            {isAdmin && (
                <Tab
                    label={`${t('rag.document.list.testCaseDocuments', '테스트케이스 문서')} (${testCaseCount})`}
                />
            )}
        </Tabs>
    );
}

DocumentListTabs.propTypes = {
    tabValue: PropTypes.number.isRequired,
    onTabChange: PropTypes.func.isRequired,
    regularCount: PropTypes.number.isRequired,
    testCaseCount: PropTypes.number.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
};

export default DocumentListTabs;
