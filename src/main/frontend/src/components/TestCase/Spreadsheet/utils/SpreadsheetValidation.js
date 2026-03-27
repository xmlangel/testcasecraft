// src/components/TestCase/Spreadsheet/utils/SpreadsheetValidation.js

import { validationLogger } from "../../../../utils/logger.js";
import {
  isFolderRow,
  extractFolderName,
  extractParentFolder,
} from "./SpreadsheetUtils.js";
import { findFolderIdByName } from "./FolderManagement.js";

/**
 * ICT-344: 스프레드시트 데이터에 검증 결과 스타일링 적용 (최적화 버전)
 * @param {Array} rows - 스프레드시트 행 데이터
 * @param {Object} validationResult - 검증 결과 객체
 * @param {Array} columnLabels - 컬럼 라벨 배열
 * @param {Object} theme - MUI 테마 객체
 * @returns {Array} - 스타일이 적용된 행 데이터
 */
export const applyValidationStyling = (
  rows,
  validationResult,
  columnLabels,
  theme,
) => {
  if (!validationResult || !Array.isArray(rows)) {
    return rows;
  }

  // 검증 결과가 없으면 원본 반환 (빠른 리턴)
  if (
    validationResult.errors.length === 0 &&
    validationResult.warnings.length === 0
  ) {
    return rows;
  }

  const styledRows = rows.map((row, index) => {
    const rowNumber = index + 1;

    // 해당 행에 오류나 경고가 있는지 확인
    const rowErrors = validationResult.errors.filter(
      (error) => error.row === rowNumber,
    );
    const rowWarnings = validationResult.warnings.filter(
      (warning) => warning.row === rowNumber,
    );

    if (rowErrors.length === 0 && rowWarnings.length === 0) {
      return row; // 오류/경고가 없으면 원본 반환
    }

    // 행에 스타일을 적용한 새로운 배열 생성
    const styledRow = row.map((cell, cellIndex) => {
      const columnName = columnLabels[cellIndex];

      // 해당 셀에 대한 오류/경고 찾기
      const cellErrors = rowErrors.filter(
        (error) =>
          error.column === columnName ||
          error.column === "전체" ||
          error.column === "스텝",
      );
      const cellWarnings = rowWarnings.filter(
        (warning) =>
          warning.column === columnName ||
          warning.column === "전체" ||
          warning.column === "스텝",
      );

      if (cellErrors.length === 0 && cellWarnings.length === 0) {
        return cell; // 해당 셀에 문제없으면 원본 반환
      }

      // 스타일 적용 (오류 우선, 없으면 경고) - 다크모드 대응
      const hasError = cellErrors.length > 0;
      const hasWarning = cellWarnings.length > 0;

      let backgroundColor = "";
      let borderColor = "";
      let tooltipText = "";

      const isDarkMode = theme.palette.mode === "dark";

      if (hasError) {
        // 다크모드: 어두운 빨강 계열, 라이트모드: 밝은 빨강 계열
        backgroundColor = isDarkMode ? "rgba(244, 67, 54, 0.15)" : "#ffebee";
        borderColor = isDarkMode ? "#f44336" : "#ef5350";
        tooltipText = cellErrors.map((e) => e.message).join("\n");
      } else if (hasWarning) {
        // 다크모드: 어두운 주황 계열, 라이트모드: 밝은 주황 계열
        backgroundColor = isDarkMode ? "rgba(255, 152, 0, 0.15)" : "#fff3e0";
        borderColor = isDarkMode ? "#ff9800" : "#ffa726";
        tooltipText = cellWarnings.map((w) => w.message).join("\n");
      }

      return {
        ...cell,
        style: {
          backgroundColor,
          border: `1px solid ${borderColor}`,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
          ...cell.style,
        },
        title: tooltipText, // 툴팁으로 오류 메시지 표시
      };
    });

    return styledRow;
  });

  return styledRows;
};

/**
 * ICT-344: 포괄적인 데이터 검증 시스템
 * @param {Array} rows - 검증할 행 데이터
 * @param {Object} options - 검증 옵션
 * @param {number} options.maxSteps - 최대 스텝 수
 * @param {Array} options.data - 전체 데이터 (상위폴더 검증용)
 * @param {Function} options.t - i18n 번역 함수
 * @returns {Object} - 검증 결과 객체 { isValid, errors, warnings, summary }
 */
export const validateSpreadsheetData = (rows, options) => {
  try {
    const { maxSteps = 3, data = [], t } = options;

    // maxSteps 안전 처리
    const safeMaxSteps =
      Number.isFinite(maxSteps) && maxSteps >= 1 && maxSteps <= 10
        ? maxSteps
        : 3;

    const errors = [];
    const warnings = [];
    const folderNames = new Set();
    const testCaseNames = new Map(); // 테스트케이스 중복 검증용 (key: name|parent|type, value: id)

    if (!Array.isArray(rows)) {
      validationLogger.error("rows가 배열이 아닙니다:", typeof rows, rows);
      return {
        isValid: false,
        errors: [
          {
            type: "invalid_data",
            message: "검증할 데이터가 올바르지 않습니다.",
          },
        ],
        warnings: [],
        summary: {
          totalRows: 0,
          errorCount: 1,
          warningCount: 0,
          folderCount: 0,
          testCaseCount: 0,
        },
      };
    }

    // 빈 행 제거 및 기본 데이터 수집
    const validRows = [];

    rows.forEach((row, index) => {
      try {
        if (!Array.isArray(row)) {
          validationLogger.warn(
            `검증 - 행 ${index}이 배열이 아닙니다:`,
            typeof row,
            row,
          );
          return;
        }

        const hasContent = row.some(
          (cell) => typeof cell?.value === "string" && cell.value.trim(),
        );

        if (hasContent) {
          validRows.push({ row, originalIndex: index });
        }
      } catch (error) {
        validationLogger.error(`행 ${index} 필터링 중 오류:`, error);
      }
    });

    // 1단계: 기본 구조 검증 및 폴더 수집
    validRows.forEach(({ row, originalIndex }) => {
      try {
        const rowNumber = originalIndex + 1;
        const isFolder = isFolderRow(row, t);
        const name = extractFolderName(row);
        const parentFolderName = extractParentFolder(row);

        // 필수 필드 검증 (이름)
        if (!name || !name.trim()) {
          errors.push({
            type: "required_field",
            row: rowNumber,
            column: t(
              "testcase.spreadsheet.validation.columnName.name",
              "이름",
            ),
            message: t(
              "testcase.spreadsheet.validation.error.nameRequired",
              "{row}번 행: 이름은 필수 입력 항목입니다.",
              { row: rowNumber },
            ),
            severity: "error",
          });
        }

        // 폴더명 중복 검증
        if (isFolder && name) {
          if (folderNames.has(name)) {
            errors.push({
              type: "duplicate_folder",
              row: rowNumber,
              column: t(
                "testcase.spreadsheet.validation.columnName.name",
                "이름",
              ),
              message: t(
                "testcase.spreadsheet.validation.error.duplicateFolder",
                '{row}번 행: 폴더명 "{name}"이 중복됩니다. 폴더명은 고유해야 합니다.',
                { row: rowNumber, name },
              ),
              severity: "error",
            });
          } else {
            folderNames.add(name);
          }
        }

        // 테스트케이스 중복 검증
        if (!isFolder && name) {
          const testCaseId = row[0]?.value; // 첫 번째 컬럼이 ID
          const duplicateKey = `${name}|${parentFolderName || "root"}|testcase`;

          if (testCaseNames.has(duplicateKey)) {
            const existingEntry = testCaseNames.get(duplicateKey);
            if (existingEntry !== testCaseId) {
              errors.push({
                type: "duplicate_testcase",
                row: rowNumber,
                column: t(
                  "testcase.spreadsheet.validation.columnName.name",
                  "이름",
                ),
                message: t(
                  "testcase.spreadsheet.validation.error.duplicateTestCase",
                  '{row}번 행: 테스트케이스명 "{name}"이 같은 폴더에서 중복됩니다. 같은 폴더 내에서 테스트케이스명은 고유해야 합니다.',
                  { row: rowNumber, name },
                ),
                severity: "error",
              });
            }
          } else {
            testCaseNames.set(duplicateKey, testCaseId);
          }
        }

        // 타입 검증
        const typeValue = row[4]?.value;
        if (typeValue && typeof typeValue === "string") {
          const normalizedType = typeValue.trim().toLowerCase();
          // ICT-UserReq: 필수 항목이 아닌 경우 경고 표시 안함
          /*
                    if (normalizedType && !['폴더', 'folder', '📁', '테스트케이스', 'testcase', 'test case'].includes(normalizedType)) {
                        warnings.push({
                            type: 'invalid_type',
                            row: rowNumber,
                            column: t('testcase.spreadsheet.validation.columnName.type', '타입'),
                            message: t('testcase.spreadsheet.validation.warning.invalidType', '{row}번 행: 타입 "{type}"이 표준 형식이 아닙니다. \'폴더\' 또는 \'테스트케이스\'를 사용하세요.', { row: rowNumber, type: typeValue }),
                            severity: 'warning'
                        });
                    }
                    */
        }
      } catch (error) {
        validationLogger.error(`1단계 - 행 검증 중 오류:`, error);
        errors.push({
          type: "processing_error",
          row: originalIndex + 1,
          column: "전체",
          message: `${originalIndex + 1}번 행 처리 중 오류: ${error.message}`,
          severity: "error",
        });
      }
    });

    // 2단계: 상위폴더 관계 검증
    validRows.forEach(({ row, originalIndex }) => {
      try {
        const rowNumber = originalIndex + 1;
        const isFolder = isFolderRow(row, t);
        const name = extractFolderName(row);
        const parentFolderName = extractParentFolder(row);

        if (parentFolderName) {
          // 순환 참조 검증
          if (parentFolderName === name) {
            errors.push({
              type: "circular_reference",
              row: rowNumber,
              column: t(
                "testcase.spreadsheet.validation.columnName.parentFolder",
                "상위폴더",
              ),
              message: t(
                "testcase.spreadsheet.validation.error.circularReference",
                '{row}번 행: "{name}"이 자기 자신을 상위폴더로 지정했습니다.',
                { row: rowNumber, name },
              ),
              severity: "error",
              suggestion: t(
                "testcase.spreadsheet.validation.suggestion.changeParent",
                "다른 폴더를 상위폴더로 지정하거나 상위폴더 필드를 비워두세요.",
              ),
            });
          }
          // 존재하지 않는 상위폴더 검증
          else if (!folderNames.has(parentFolderName)) {
            const existingFolderId = findFolderIdByName(parentFolderName, data);

            if (!existingFolderId) {
              errors.push({
                type: "missing_parent_folder",
                row: rowNumber,
                column: t(
                  "testcase.spreadsheet.validation.columnName.parentFolder",
                  "상위폴더",
                ),
                message: t(
                  "testcase.spreadsheet.validation.error.missingParentFolder",
                  '{row}번 행: 상위폴더 "{parent}"을 찾을 수 없습니다.',
                  { row: rowNumber, parent: parentFolderName },
                ),
                severity: "error",
                suggestion: t(
                  "testcase.spreadsheet.validation.suggestion.createParentFolder",
                  '"{parent}" 폴더를 먼저 생성하거나 올바른 폴더명/ID를 입력하세요.',
                  { parent: parentFolderName },
                ),
              });
            }
          }

          // 테스트케이스가 폴더를 상위폴더로 지정하는지 검증
          if (
            !isFolder &&
            parentFolderName &&
            !folderNames.has(parentFolderName)
          ) {
            const existingFolderId = findFolderIdByName(parentFolderName, data);
            if (existingFolderId) {
              const existingItem = data?.find(
                (item) => item.id === existingFolderId,
              );
              if (existingItem && existingItem.type !== "folder") {
                // ICT-UserReq: 필수 항목이 아닌 경우 경고 표시 안함
                /*
                                warnings.push({
                                    type: 'invalid_parent_type',
                                    row: rowNumber,
                                    column: t('testcase.spreadsheet.validation.columnName.parentFolder', '상위폴더'),
                                    message: t('testcase.spreadsheet.validation.warning.invalidParentType', '{row}번 행: "{parent}"은 폴더가 아닙니다.', { row: rowNumber, parent: parentFolderName }),
                                    severity: 'warning'
                                });
                                */
              }
            }
          }
        }
      } catch (error) {
        validationLogger.error(`2단계 - 상위폴더 검증 중 오류:`, error);
        errors.push({
          type: "processing_error",
          row: originalIndex + 1,
          column: "상위폴더",
          message: `${originalIndex + 1}번 행 상위폴더 검증 중 오류: ${
            error.message
          }`,
          severity: "error",
        });
      }
    });

    // 3단계: 테스트케이스별 스텝 검증
    validRows.forEach(({ row, originalIndex }) => {
      try {
        const rowNumber = originalIndex + 1;
        const isFolder = isFolderRow(row, t);

        if (!isFolder) {
          let hasSteps = false;
          for (let i = 0; i < safeMaxSteps; i++) {
            const stepDescIndex = 15 + i * 2;
            const stepExpectedIndex = 15 + i * 2 + 1;

            if (
              stepDescIndex >= row.length ||
              stepExpectedIndex >= row.length
            ) {
              continue;
            }

            const stepDesc = row[stepDescIndex]?.value;
            const stepExpected = row[stepExpectedIndex]?.value;

            if (stepDesc && typeof stepDesc === "string" && stepDesc.trim()) {
              hasSteps = true;

              if (
                !stepExpected ||
                (typeof stepExpected === "string" && !stepExpected.trim())
              ) {
                // ICT-UserReq: 필수 항목이 아닌 경우 경고 표시 안함
                /*
                                warnings.push({
                                    type: 'missing_expected_result',
                                    row: rowNumber,
                                    column: t('testcase.spreadsheet.validation.columnName.expected', 'Expected {number}', { number: i + 1 }),
                                    message: t('testcase.spreadsheet.validation.warning.missingExpectedResult', '{row}번 행: Step {step}의 예상 결과가 비어있습니다.', { row: rowNumber, step: i + 1 }),
                                    severity: 'warning',
                                    suggestion: t('testcase.spreadsheet.validation.suggestion.addExpectedResult', '각 스텝에 대한 예상 결과를 입력하면 테스트의 명확성이 향상됩니다.')
                                });
                                */
              }
            }
          }

          if (!hasSteps) {
            // ICT-UserReq: 필수 항목이 아닌 경우 경고 표시 안함
            /*
                        warnings.push({
                            type: 'no_steps',
                            row: rowNumber,
                            column: t('testcase.spreadsheet.validation.columnName.step', 'Step {number}', { number: 1 }),
                            message: t('testcase.spreadsheet.validation.warning.noSteps', '{row}번 행: 테스트케이스에 실행 단계가 정의되지 않았습니다.', { row: rowNumber }),
                            severity: 'warning',
                            suggestion: t('testcase.spreadsheet.validation.suggestion.addSteps', '최소 하나 이상의 테스트 단계를 추가하세요.')
                        });
                        */
          }
        }
      } catch (error) {
        validationLogger.error(`3단계 - 스텝 검증 중 오류:`, error);
        errors.push({
          type: "processing_error",
          row: originalIndex + 1,
          column: "스텝",
          message: `${originalIndex + 1}번 행 스텝 검증 중 오류: ${
            error.message
          }`,
          severity: "error",
        });
      }
    });

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRows: validRows.length,
        errorCount: errors.length,
        warningCount: warnings.length,
        folderCount: folderNames.size,
        testCaseCount: validRows.filter(({ row }) => !isFolderRow(row, t))
          .length,
      },
    };

    return result;
  } catch (error) {
    validationLogger.error("validateSpreadsheetData 전체 오류:", error);
    return {
      isValid: false,
      errors: [
        {
          type: "validation_error",
          message: `데이터 검증 중 오류: ${error.message}`,
        },
      ],
      warnings: [],
      summary: {
        totalRows: 0,
        errorCount: 1,
        warningCount: 0,
        folderCount: 0,
        testCaseCount: 0,
      },
    };
  }
};
