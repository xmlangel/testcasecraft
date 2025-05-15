// src/components/TestCaseResultsTable.js
import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Box, Pagination
} from '@mui/material';
import { Check as CheckIcon, Clear as ClearIcon, Stop as StopIcon, HourglassEmpty as HourglassEmptyIcon } from '@mui/icons-material';
import { TestResult } from '../models/testExecution';

const PAGE_SIZE = 10;

const TestCaseResultsTable = ({
  selectedPlan,
  execution,
  getTestCase,
  canEnterResults,
  onOpenResultForm,
  page,
  setPage
}) => {
  const results = execution?.results || [];
  if (!selectedPlan)
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
        테스트 플랜을 먼저 선택하세요.
      </Typography>
    );
  const testCaseIds = selectedPlan.testCaseIds || [];
  const total = testCaseIds.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pagedTestCaseIds = testCaseIds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="테스트케이스 결과 테이블">
          <TableHead>
            <TableRow>
              <TableCell width="5%">No.</TableCell>
              <TableCell width="40%">테스트케이스</TableCell>
              <TableCell width="25%">결과</TableCell>
              <TableCell width="20%">비고</TableCell>
              <TableCell width="10%" align="center">입력</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {total === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    테스트케이스가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedTestCaseIds.map((testCaseId, idx) => {
                const testCase = getTestCase(testCaseId);
                const resultEntry = results.find(r => r.testCaseId === testCaseId) || {};
                const result = resultEntry.result || TestResult.NOTRUN;
                const notes = resultEntry.notes || '';
                return testCase ? (
                  <TableRow key={testCaseId}>
                    <TableCell>{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                    <TableCell>{testCase.name}</TableCell>
                    <TableCell>
                      <ResultCell result={result} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {execution?.id && (
                        <IconButton
                          size="small"
                          onClick={() => onOpenResultForm(testCaseId)}
                          disabled={!canEnterResults}
                          aria-label={`${testCase.name} 결과 입력`}
                        >
                          <ResultIcon result={result} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ) : null;
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {total > PAGE_SIZE && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
            size="small"
          />
        </Box>
      )}
    </Box>
  );
};

const ResultIcon = ({ result }) => {
  const iconMap = {
    [TestResult.PASS]: <CheckIcon color="success" />,
    [TestResult.FAIL]: <ClearIcon color="error" />,
    [TestResult.BLOCKED]: <StopIcon color="warning" />,
    [TestResult.NOTRUN]: <HourglassEmptyIcon color="disabled" />
  };
  return iconMap[result] || null;
};

const ResultCell = ({ result }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <ResultIcon result={result} />
    <Typography variant="body2">
      {result ? result.replace(/_/g, '') : 'NOTRUN'}
    </Typography>
  </Box>
);

TestCaseResultsTable.propTypes = {
  selectedPlan: PropTypes.object,
  execution: PropTypes.object.isRequired,
  getTestCase: PropTypes.func.isRequired,
  canEnterResults: PropTypes.bool.isRequired,
  onOpenResultForm: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired
};
ResultIcon.propTypes = { result: PropTypes.string };
ResultCell.propTypes = { result: PropTypes.string };

export default TestCaseResultsTable;
