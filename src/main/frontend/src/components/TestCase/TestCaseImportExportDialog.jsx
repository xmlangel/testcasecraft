// src/components/TestCase/TestCaseImportExportDialog.jsx

import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Alert,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  CloudDownload as CloudDownloadIcon,
  Close as CloseIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import {
  downloadSampleFile,
  validateImportFile,
  importTestCases,
  importFromGoogleSheet,
  exportTestCasesAs,
  exportToGoogleSheet,
  getMyGoogleConfig,
  updateLastUsedGoogleSheet,
} from "../../services/importExportApi.js";
import { useI18n } from "../../context/I18nContext.jsx";
import { useAppContext } from "../../context/AppContext.jsx";

/** Google Sheets URL에서 Spreadsheet ID 추출 */
const extractSpreadsheetId = (input) => {
  if (!input) return "";
  // 1. 이미 ID 형태인 경우 (알파벳, 숫자, _, - 조합)
  if (/^[a-zA-Z0-9-_]+$/.test(input) && input.length > 20) {
    return input;
  }
  // 2. URL 형태인 경우
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input;
};

export default function TestCaseImportExportDialog({
  open,
  onClose,
  projectId,
  onImportComplete,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useI18n();
  const { openUserProfile } = useAppContext();

  // 상수 정의 (다국어 지원을 위해 컴포넌트 내부로 이동)
  const IMPORT_FORMATS = [
    { value: "csv", label: "CSV", accept: ".csv", sampleExt: "csv" },
    {
      value: "excel",
      label: t("common.excel", "Excel (.xlsx)"),
      accept: ".xlsx,.xls",
      sampleExt: "xlsx",
    },
    {
      value: "google-sheets",
      label: t("common.googleSheets", "Google Sheets"),
      accept: null,
      sampleExt: null,
    },
  ];

  const EXPORT_FORMATS = [
    { value: "csv", label: "CSV (importable)" },
    { value: "excel", label: "Excel (importable)" },
    { value: "json", label: "JSON (importable)" },
    {
      value: "google-sheets",
      label: t("common.googleSheets", "Google Sheets"),
    },
  ];

  // Google 설정 상태
  const [googleConfig, setGoogleConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  // Import 상태
  const [importFormat, setImportFormat] = useState("csv");
  const [selectedFile, setSelectedFile] = useState(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [googleSheetName, setGoogleSheetName] = useState("TestCases");
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  // Export 상태
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportSheetUrl, setExportSheetUrl] = useState("");
  const [exportSheetName, setExportSheetName] = useState("TestCases");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);

  const resetImport = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setImportResult(null);
    setImportError(null);
    // last-used 정보를 유지하기 위해 googleSheetUrl은 초기화하지 않음
  };

  const handleClose = () => {
    resetImport();
    setExportMessage(null);
    onClose();
  };

  // Google 설정 로드
  React.useEffect(() => {
    if (open) {
      loadGoogleConfig();
    }
  }, [open]);

  const loadGoogleConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const config = await getMyGoogleConfig();
      setGoogleConfig(config);
      if (config) {
        if (config.lastImportSpreadsheetId) {
          setGoogleSheetUrl(config.lastImportSpreadsheetId);
        }
        if (config.lastImportSheetName) {
          setGoogleSheetName(config.lastImportSheetName);
        }
        if (config.lastExportSpreadsheetId) {
          setExportSheetUrl(config.lastExportSpreadsheetId);
        }
        if (config.lastExportSheetName) {
          setExportSheetName(config.lastExportSheetName);
        }
      }
    } catch (error) {
      console.error("Failed to load Google config:", error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleGoToSettings = () => {
    onClose();
    // 사용자 프로필의 Google Sheets 설정 탭(index 4) 열기
    openUserProfile(4);
  };

  // ---- Import 핸들러 ----

  const handleImportFormatChange = (e) => {
    setImportFormat(e.target.value);
    resetImport();
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setValidationResult(null);
    setImportResult(null);
    setImportError(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleValidate = async () => {
    if (!selectedFile) return;
    setIsValidating(true);
    setValidationResult(null);
    setImportError(null);
    try {
      const result = await validateImportFile(
        selectedFile,
        importFormat,
        projectId,
      );
      setValidationResult(result);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (importFormat === "google-sheets") {
      if (!googleSheetUrl) return;
      setIsImporting(true);
      setImportError(null);
      try {
        const result = await importFromGoogleSheet(
          googleSheetUrl,
          googleSheetName,
          projectId,
        );
        const count = Array.isArray(result)
          ? result.length
          : result.importedCount || 0;
        setImportResult({ importedCount: count });
        if (onImportComplete) onImportComplete();

        // 마지막 사용 정보 저장 (Import 타입) - ID만 추출하여 저장
        const spreadsheetId = extractSpreadsheetId(googleSheetUrl);
        updateLastUsedGoogleSheet("import", spreadsheetId, googleSheetName);
      } catch (err) {
        setImportError(err.message);
      } finally {
        setIsImporting(false);
      }
      return;
    }

    if (!selectedFile) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const result = await importTestCases(
        selectedFile,
        importFormat,
        projectId,
      );
      setImportResult(result);
      if (onImportComplete) onImportComplete();
    } catch (err) {
      setImportError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSampleDownload = async () => {
    if (!importFormat || importFormat === "google-sheets") return;
    const result = await downloadSampleFile(importFormat);
    if (!result.success) {
      setImportError(result.message);
    }
  };

  // ---- Export 핸들러 ----

  const handleExport = async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      if (exportFormat === "google-sheets") {
        if (!exportSheetUrl) {
          setExportMessage({
            type: "error",
            text: t(
              "testcase.io.google.url.required",
              "Google Sheets URL을 입력하세요",
            ),
          });
          return;
        }
        await exportToGoogleSheet(projectId, exportSheetUrl, exportSheetName);
        setExportMessage({
          type: "success",
          text: t(
            "testcase.io.export.success.google",
            "Google Sheets에 내보내기 완료!",
          ),
        });

        // 마지막 사용 정보 저장 (Export 타입) - ID만 추출하여 저장
        const spreadsheetId = extractSpreadsheetId(exportSheetUrl);
        updateLastUsedGoogleSheet("export", spreadsheetId, exportSheetName);
      } else {
        const result = await exportTestCasesAs(projectId, exportFormat);
        if (result.success) {
          setExportMessage({
            type: "success",
            text: t(
              "testcase.io.export.success.file",
              "파일 다운로드가 시작되었습니다.",
            ),
          });
        } else {
          setExportMessage({ type: "error", text: result.message });
        }
      }
    } catch (err) {
      setExportMessage({ type: "error", text: err.message });
    } finally {
      setIsExporting(false);
    }
  };

  // ---- 현재 형식의 accept 속성 ----
  const currentFormat = IMPORT_FORMATS.find((f) => f.value === importFormat);
  const canImport =
    importFormat === "google-sheets"
      ? googleSheetUrl.trim().length > 0
      : selectedFile !== null;
  const validRows = validationResult ? validationResult.validRows : 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600} component="span">
          {t("testcase.io.title", "테스트케이스 Import / Export")}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label={t("testcase.io.tab.import", "📥 가져오기 (Import)")} />
          <Tab label={t("testcase.io.tab.export", "📤 내보내기 (Export)")} />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 3, minHeight: 420 }}>
        {/* ==================== IMPORT TAB ==================== */}
        {activeTab === 0 && (
          <Box>
            {/* 1. 형식 선택 */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                {t("testcase.io.import.format.label", "1. 형식 선택")}
              </FormLabel>
              <RadioGroup
                row
                value={importFormat}
                onChange={handleImportFormatChange}
              >
                {IMPORT_FORMATS.map((f) => (
                  <FormControlLabel
                    key={f.value}
                    value={f.value}
                    control={<Radio />}
                    label={f.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* 2. 샘플 다운로드 */}
            {importFormat !== "google-sheets" && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  {t("testcase.io.import.sample.label", "2. 샘플 파일")}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CloudDownloadIcon />}
                  onClick={handleSampleDownload}
                >
                  {t(
                    "testcase.io.import.sample.download",
                    `sample_testcases.${currentFormat?.sampleExt} 다운로드`,
                    {
                      filename: `sample_testcases.${currentFormat?.sampleExt}`,
                    },
                  )}
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 2 }}
                >
                  {t(
                    "testcase.io.import.sample.desc",
                    "샘플을 참고하여 데이터를 입력한 후 업로드하세요",
                  )}
                </Typography>
              </Box>
            )}

            {/* 3. 파일 업로드 또는 Google Sheets URL */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                {importFormat !== "google-sheets"
                  ? t("testcase.io.import.upload.label", "3. 파일 업로드")
                  : t(
                      "testcase.io.google.connect.label",
                      "2. Google Sheets 연결",
                    )}
              </Typography>

              {importFormat === "google-sheets" &&
                !isLoadingConfig &&
                !googleConfig && (
                  <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={handleGoToSettings}
                      >
                        {t("common.settings", "설정으로 이동")}
                      </Button>
                    }
                  >
                    {t(
                      "google.import.connection_required",
                      "Google Sheets 연동 설정이 필요합니다. 서비스 계정 JSON 키를 먼저 등록해 주세요.",
                    )}
                  </Alert>
                )}

              {importFormat === "google-sheets" ? (
                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    label={t(
                      "testcase.io.google.url.label",
                      "Google Sheets URL 또는 ID",
                    )}
                    placeholder={t(
                      "testcase.io.google.url.placeholder",
                      "https://docs.google.com/spreadsheets/d/...",
                    )}
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <LinkIcon sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                    sx={{ mb: 1.5 }}
                  />
                  <TextField
                    size="small"
                    label={t("testcase.io.google.sheet.label", "시트 이름")}
                    value={googleSheetName}
                    onChange={(e) => setGoogleSheetName(e.target.value)}
                    sx={{ width: 200 }}
                  />
                </Box>
              ) : (
                <Box
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "2px dashed",
                    borderColor: isDragging
                      ? "primary.main"
                      : selectedFile
                        ? "success.main"
                        : "divider",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: isDragging
                      ? "action.hover"
                      : selectedFile
                        ? "success.50"
                        : "background.default",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept={currentFormat?.accept}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                  {selectedFile ? (
                    <Box>
                      <CheckCircleIcon color="success" sx={{ mb: 1 }} />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                      >
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <FileUploadIcon
                        color="action"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography variant="body2">
                        {t(
                          "testcase.io.import.dropzone.prompt",
                          "파일을 여기에 드래그하거나 클릭하여 선택",
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "testcase.io.import.dropzone.accept",
                          `지원 형식: ${currentFormat?.accept}`,
                          { formats: currentFormat?.accept },
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* 4. 검증 결과 */}
            {importFormat !== "google-sheets" &&
              selectedFile &&
              !importResult && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {t(
                        "testcase.io.import.validation.label",
                        "4. 데이터 검증",
                      )}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleValidate}
                      disabled={isValidating}
                    >
                      {isValidating
                        ? t(
                            "testcase.io.import.validation.status",
                            "검증 중...",
                          )
                        : t(
                            "testcase.io.import.validation.button",
                            "🔍 검증하기",
                          )}
                    </Button>
                  </Box>
                  {isValidating && <LinearProgress sx={{ mb: 1 }} />}
                  {validationResult && (
                    <ValidationResultPanel result={validationResult} />
                  )}
                </Box>
              )}

            {/* 오류 메시지 */}
            {importError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setImportError(null)}
              >
                {importError}
              </Alert>
            )}

            {/* Import 완료 결과 */}
            {importResult && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {t(
                    "testcase.io.import.success",
                    `✅ Import 완료: ${importResult.importedCount}개 테스트케이스가 추가되었습니다.`,
                    { count: importResult.importedCount },
                  )}
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* ==================== EXPORT TAB ==================== */}
        {activeTab === 1 && (
          <Box>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                {t("testcase.io.export.format.label", "1. 내보내기 형식 선택")}
              </FormLabel>
              <RadioGroup
                row
                value={exportFormat}
                onChange={(e) => {
                  setExportFormat(e.target.value);
                  setExportMessage(null);
                }}
              >
                {EXPORT_FORMATS.map((f) => (
                  <FormControlLabel
                    key={f.value}
                    value={f.value}
                    control={<Radio />}
                    label={f.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {exportFormat === "google-sheets" && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  {t(
                    "testcase.io.export.google.label",
                    "2. Google Sheets 설정",
                  )}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label={t(
                    "testcase.io.google.url.label",
                    "Google Sheets URL 또는 ID",
                  )}
                  placeholder={t(
                    "testcase.io.google.url.placeholder",
                    "https://docs.google.com/spreadsheets/d/...",
                  )}
                  value={exportSheetUrl}
                  onChange={(e) => setExportSheetUrl(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <LinkIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  size="small"
                  label={t("testcase.io.google.sheet.label", "시트 이름")}
                  value={exportSheetName}
                  onChange={(e) => setExportSheetName(e.target.value)}
                  sx={{ width: 200 }}
                />
              </Box>
            )}

            {exportFormat === "google-sheets" &&
              !isLoadingConfig &&
              !googleConfig && (
                <Alert
                  severity="warning"
                  sx={{ mb: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={handleGoToSettings}
                    >
                      {t("common.settings", "설정으로 이동")}
                    </Button>
                  }
                >
                  {t(
                    "google.export.connection_required",
                    "Google Sheets 연동 설정이 필요합니다. 서비스 계정 JSON 키를 먼저 등록해 주세요.",
                  )}
                </Alert>
              )}

            <Box
              sx={{
                p: 2,
                bgcolor: "info.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "info.200",
                mb: 2,
              }}
            >
              <Typography variant="body2" color="info.dark">
                {t(
                  "testcase.io.export.tip",
                  "💡 내보낸 파일은 다시 Import 가능한 형식으로 생성됩니다. (라운드트립 호환)",
                )}
              </Typography>
            </Box>

            {exportMessage && (
              <Alert
                severity={exportMessage.type}
                sx={{ mb: 2 }}
                onClose={() => setExportMessage(null)}
              >
                {exportMessage.text}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          {t("common.close", "닫기")}
        </Button>
        {activeTab === 0 && !importResult && (
          <Button
            variant="contained"
            startIcon={<FileUploadIcon />}
            onClick={handleImport}
            disabled={!canImport || isImporting}
          >
            {isImporting
              ? t("testcase.io.status.importing", "가져오는 중...")
              : validRows > 0
                ? t(
                    "testcase.io.button.import.count",
                    `가져오기 실행 (${validRows}개)`,
                    { count: validRows },
                  )
                : t("testcase.io.button.import", "가져오기 실행")}
          </Button>
        )}
        {activeTab === 0 && importResult && (
          <Button variant="outlined" onClick={resetImport}>
            {t("testcase.io.button.reimport", "다시 가져오기")}
          </Button>
        )}
        {activeTab === 1 && (
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting
              ? t("testcase.io.status.exporting", "내보내는 중...")
              : t("testcase.io.button.export", "내보내기")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/** 검증 결과 패널 */
function ValidationResultPanel({ result }) {
  const { totalRows, validRows, invalidRows, errors, previewData } = result;
  const { t } = useI18n();

  return (
    <Box>
      {/* 요약 칩 */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Chip
          label={t("testcase.io.validation.totalRows", `총 ${totalRows}행`, {
            count: totalRows,
          })}
          size="small"
        />
        <Chip
          label={t(
            "testcase.io.validation.validRows",
            `✅ 유효 ${validRows}행`,
            { count: validRows },
          )}
          color="success"
          size="small"
        />
        {invalidRows > 0 && (
          <Chip
            label={t(
              "testcase.io.validation.invalidRows",
              `❌ 오류 ${invalidRows}행`,
              { count: invalidRows },
            )}
            color="error"
            size="small"
          />
        )}
      </Box>

      {/* 오류 목록 */}
      {errors && errors.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="error"
            sx={{ mb: 1, display: "block" }}
          >
            {t("testcase.io.validation.errorList", "오류 목록")}
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 160 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>
                    {t("common.spreadsheet.row", "행")}
                  </TableCell>
                  <TableCell sx={{ width: 80 }}>
                    {t("common.field", "필드")}
                  </TableCell>
                  <TableCell>
                    {t("testcase.io.validation.errorMessage", "오류 메시지")}
                  </TableCell>
                  <TableCell>{t("common.value", "값")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {errors.map((err, i) => (
                  <TableRow key={i}>
                    <TableCell>{err.row}</TableCell>
                    <TableCell>{err.field}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="error">
                        {err.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {err.value || `(${t("common.emptyValue", "빈 값")})`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* 미리보기 테이블 */}
      {previewData && previewData.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ mb: 1, display: "block" }}
          >
            {t("testcase.io.validation.preview", "미리보기 (최대 20행)")}
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 200 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 30 }}></TableCell>
                  <TableCell>{t("common.name", "이름")}</TableCell>
                  <TableCell sx={{ width: 80 }}>
                    {t("common.type", "유형")}
                  </TableCell>
                  <TableCell>
                    {t("testcase.tree.parentFolder", "상위 폴더")}
                  </TableCell>
                  <TableCell sx={{ width: 80 }}>
                    {t("testcase.spreadsheet.column.priority", "우선순위")}
                  </TableCell>
                  <TableCell sx={{ width: 60 }}>
                    {t("testcase.io.validation.steps", "스텝")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((row, i) => (
                  <TableRow
                    key={i}
                    sx={{ bgcolor: row.valid ? "inherit" : "error.50" }}
                  >
                    <TableCell>
                      {row.valid ? (
                        <CheckCircleIcon
                          sx={{ fontSize: 14 }}
                          color="success"
                        />
                      ) : (
                        <ErrorIcon sx={{ fontSize: 14 }} color="error" />
                      )}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.type}
                        size="small"
                        variant="outlined"
                        color={row.type === "folder" ? "default" : "primary"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {row.parentPath || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.priority || "-"}</TableCell>
                    <TableCell>{row.stepsCount || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

TestCaseImportExportDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.string.isRequired,
  onImportComplete: PropTypes.func,
};

ValidationResultPanel.propTypes = {
  result: PropTypes.shape({
    totalRows: PropTypes.number,
    validRows: PropTypes.number,
    invalidRows: PropTypes.number,
    errors: PropTypes.array,
    previewData: PropTypes.array,
  }).isRequired,
};
