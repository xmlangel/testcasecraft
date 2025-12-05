// src/components/TestCase/Spreadsheet/handlers/SpreadsheetExport.js

import * as XLSX from 'xlsx';
import { logError } from '../../../../utils/logger.js';
import { convertDataForExport } from '../utils/SpreadsheetUtils.js';

/**
 * CSV Export 함수
 * @param {Array} spreadsheetData - 스프레드시트 데이터
 * @param {Array} columnLabels - 컬럼 라벨
 * @returns {Object} - { success, message, error }
 */
export const exportToCSV = (spreadsheetData, columnLabels) => {
    try {
        const { headers, rows } = convertDataForExport(spreadsheetData, columnLabels);

        if (rows.length === 0) {
            return {
                success: false,
                message: '내보낼 데이터가 없습니다.',
                severity: 'warning'
            };
        }

        // CSV 형식으로 변환
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        // BOM 추가 (한글 깨짐 방지)
        const BOM = '\uFEFF';
        const csvWithBom = BOM + csvContent;

        // 다운로드
        const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `testcases_${timestamp}.csv`;

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            message: `CSV 파일이 다운로드되었습니다: ${filename}`,
            severity: 'success'
        };
    } catch (error) {
        logError('CSV Export 실패:', error);
        return {
            success: false,
            message: 'CSV 다운로드 중 오류가 발생했습니다: ' + error.message,
            severity: 'error',
            error
        };
    }
};

/**
 * Excel Export 함수
 * @param {Array} spreadsheetData - 스프레드시트 데이터
 * @param {Array} columnLabels - 컬럼 라벨
 * @returns {Object} - { success, message, error }
 */
export const exportToExcel = (spreadsheetData, columnLabels) => {
    try {
        const { headers, rows } = convertDataForExport(spreadsheetData, columnLabels);

        if (rows.length === 0) {
            return {
                success: false,
                message: '내보낼 데이터가 없습니다.',
                severity: 'warning'
            };
        }

        // 워크북 생성
        const workbook = XLSX.utils.book_new();

        // 워크시트 데이터 구성 (헤더 + 데이터)
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // 컬럼 너비 자동 조정
        const maxWidths = headers.map((header, colIndex) => {
            const headerLength = String(header).length;
            const maxCellLength = Math.max(
                ...rows.map(row => String(row[colIndex] || '').length)
            );
            return Math.min(Math.max(headerLength, maxCellLength, 10), 50);
        });

        worksheet['!cols'] = maxWidths.map(width => ({ wch: width }));

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TestCases');

        // 파일 다운로드
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `testcases_${timestamp}.xlsx`;

        XLSX.writeFile(workbook, filename);

        return {
            success: true,
            message: `Excel 파일이 다운로드되었습니다: ${filename}`,
            severity: 'success'
        };
    } catch (error) {
        logError('Excel Export 실패:', error);
        return {
            success: false,
            message: 'Excel 다운로드 중 오류가 발생했습니다: ' + error.message,
            severity: 'error',
            error
        };
    }
};
