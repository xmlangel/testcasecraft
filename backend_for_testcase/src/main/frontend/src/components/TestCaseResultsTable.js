// src/components/TestCaseResultsTable.js

import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Box,
  Pagination,
  Button,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Stop as StopIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";

const PAGE_SIZE = 10;

const RESULT_ICON_MAP = {
  PASS: <CheckIcon color="success" fontSize="small" />,
  FAIL: <ClearIcon color="error" fontSize="small" />,
  BLOCKED: <StopIcon color="warning" fontSize="small" />,
  NOTRUN: <HourglassEmptyIcon color="disabled" fontSize="small" />,
  NOT_RUN: <HourglassEmptyIcon color="disabled" fontSize="small" />,
};

function ResultCell({ result }) {
  console.log("ResultCell result:", result);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
      {RESULT_ICON_MAP[result] || RESULT_ICON_MAP.NOTRUN}
      <Typography variant="body2">{result || "NOTRUN"}</Typography>
    </Box>
  );
}

ResultCell.propTypes = {
  result: PropTypes.string,
};

function TreeRow({
  node,
  level,
  expandedFolders,
  onToggle,
  results,
  canEnterResults,
  onOpenResultForm,
  maxRowHeight,
}) {
  const isFolder = node.type === "folder";
  const resultEntry = results.find((r) => r.testCaseId === node.id);
  const result = resultEntry ? resultEntry.result : "NOTRUN";
  const notes = resultEntry ? resultEntry.notes : "";

  return (
    <>
      <TableRow hover sx={{ height: maxRowHeight }}>
        <TableCell sx={{ pl: 2 + level * 24, width: 40, verticalAlign: "top" }}>
          {isFolder ? (
            <IconButton size="small" onClick={() => onToggle(node.id)}>
              {expandedFolders.includes(node.id) ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          ) : (
            <Box sx={{ width: 32, display: "inline-block" }} />
          )}
          {isFolder ? (
            <FolderIcon fontSize="small" sx={{ ml: 1, verticalAlign: "middle" }} />
          ) : (
            <FileIcon fontSize="small" sx={{ ml: 1, verticalAlign: "middle" }} />
          )}
        </TableCell>
        <TableCell sx={{ verticalAlign: "top" }}>
          <Typography
            variant="body2"
            fontWeight={isFolder ? 700 : 400}
            sx={{ whiteSpace: "pre-line" }}
          >
            {node.name}
          </Typography>
        </TableCell>
        <TableCell align="center" sx={{ verticalAlign: "top" }}>
          {!isFolder && <ResultCell result={result} />}
        </TableCell>
        <TableCell sx={{ verticalAlign: "top" }}>
          {!isFolder && (
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", wordBreak: "break-all" }}>
              {notes || "-"}
            </Typography>
          )}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            verticalAlign: "bottom",
            pr: 2,
            height: 1,
            position: "relative",
            minWidth: 120,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          {!isFolder && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => onOpenResultForm(node.id)}
              disabled={!canEnterResults}
              aria-label={`${node.name} 결과입력`}
              sx={{
                border: "1px solid #1976d2",
                borderRadius: 1,
                px: 1.5,
                py: 0.5,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "0.93rem",
              }}
            >
              {RESULT_ICON_MAP[result] || RESULT_ICON_MAP.NOTRUN}
              <span style={{ marginLeft: 4 }}>결과입력</span>
            </Button>
          )}
        </TableCell>
      </TableRow>
      {isFolder &&
        expandedFolders.includes(node.id) &&
        node.children?.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            level={level + 1}
            expandedFolders={expandedFolders}
            onToggle={onToggle}
            results={results}
            canEnterResults={canEnterResults}
            onOpenResultForm={onOpenResultForm}
            maxRowHeight={maxRowHeight}
          />
        ))}
    </>
  );
}

TreeRow.propTypes = {
  node: PropTypes.object.isRequired,
  level: PropTypes.number.isRequired,
  expandedFolders: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  canEnterResults: PropTypes.bool.isRequired,
  onOpenResultForm: PropTypes.func.isRequired,
  maxRowHeight: PropTypes.number.isRequired,
};

function getMaxRowHeight(nodes, results) {
  let max = 56;
  function traverse(node, level = 0) {
    if (node.type !== "folder") {
      const resultEntry = results.find((r) => r.testCaseId === node.id);
      const notes = resultEntry ? resultEntry.notes : "";
      const lines = notes ? Math.ceil(notes.length / 30) : 1;
      const height = lines * 24 + 16;
      if (height > max) max = height;
    }
    if (node.children)
      node.children.forEach((child) => traverse(child, level + 1));
  }
  nodes.forEach((node) => traverse(node));
  return max;
}

export default function TestCaseResultsTable({
  treeData,
  execution,
  canEnterResults,
  onOpenResultForm,
  page,
  setPage,
  expandedFolders,
  onToggleFolder,
}) {
  const results = execution?.results || [];
  const total = treeData.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pagedTree = treeData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const maxRowHeight = getMaxRowHeight(pagedTree, results);

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="테스트케이스 결과 테이블">
          <TableHead>
            <TableRow>
              <TableCell width={40}></TableCell>
              <TableCell width={240}>테스트케이스1111</TableCell>
              <TableCell width={120} align="center">
                결과
              </TableCell>
              <TableCell width={220}>메모</TableCell>
              <TableCell width={120} align="right">
                동작
              </TableCell>
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
              pagedTree.map((node) => (
                <TreeRow
                  key={node.id}
                  node={node}
                  level={0}
                  expandedFolders={expandedFolders}
                  onToggle={onToggleFolder}
                  results={results}
                  canEnterResults={canEnterResults}
                  onOpenResultForm={onOpenResultForm}
                  maxRowHeight={maxRowHeight}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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
}

TestCaseResultsTable.propTypes = {
  treeData: PropTypes.array.isRequired,
  execution: PropTypes.object.isRequired,
  canEnterResults: PropTypes.bool.isRequired,
  onOpenResultForm: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  expandedFolders: PropTypes.array.isRequired,
  onToggleFolder: PropTypes.func.isRequired,
};
