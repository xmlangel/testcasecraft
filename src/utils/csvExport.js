// utils/csvExport.js
const headers = [
    "id",
    "name",
    "description",
    "type",
    "parentId",
    "createdAt",
    "updatedAt",
  ];
  
  // 객체 배열을 CSV 문자열로 변환
  export function testCasesToCSV(testCases) {
    const rows = testCases.map((tc) =>
      [
        tc.id,
        `"${(tc.name || "").replace(/"/g, '""')}"`,
        `"${(tc.description || "").replace(/"/g, '""')}"`,
        tc.type,
        tc.parentId || "",
        tc.createdAt,
        tc.updatedAt,
      ].join(",")
    );
    return [headers.join(","), ...rows].join("\r\n");
  }
  
  // CSV 문자열을 파일로 다운로드
  export function downloadCSV(csvString, filename = "testcases.csv") {
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  