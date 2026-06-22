// src/utils/pdf/pdfTextUtils.js
//
// PDF 내보내기에서 쓰는 순수 텍스트/포맷 헬퍼. (pdfExportUtils.js 에서 추출)
// React/jsPDF 의존이 없어 단위 테스트가 용이하다.

/**
 * 한글 텍스트 전처리 — 제어 문자 제거 + NFC 정규화.
 */
export const processKoreanText = (text) => {
  if (!text) return "";

  try {
    const stringText = String(text);
    // 제어 문자 제거하되 한글은 보존
    // eslint-disable-next-line no-control-regex
    const cleanText = stringText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    // UTF-8 인코딩을 위한 정규화
    return cleanText.normalize("NFC");
  } catch (error) {
    console.warn("한글 텍스트 처리 오류:", error, text);
    return String(text);
  }
};

/**
 * 한글 텍스트를 로마자로 변환 (PDF 폰트 폴백용).
 * 1) 용어 사전 직접 매핑 → 2) 남은 한글은 초/중/종성 음역 → 3) 공백 정리.
 */
export const convertKoreanToRoman = (text) => {
  const koreanMap = {
    // 기본 테스트 용어
    테스트: "Test",
    성공: "Passed",
    실패: "Failed",
    오류: "Error",
    스킵: "Skipped",
    실행: "Executed",
    결과: "Result",
    분석: "Analysis",
    요약: "Summary",

    // 통계 용어
    전체: "Total",
    성공률: "Success Rate",
    실행시간: "Execution Time",
    클래스: "Class",
    메시지: "Message",
    상태: "Status",
    시간: "Time",
    개수: "Count",
    비율: "Rate",

    // PDF 보고서 용어
    보고서: "Report",
    자동화: "Automated",
    생성: "Generated",
    실행자: "Executor",
    날짜: "Date",
    파일: "File",
    번호: "No.",
    이름: "Name",
    종류: "Type",

    // 상태 관련
    진행중: "In Progress",
    완료: "Completed",
    대기: "Waiting",
    중단: "Stopped",
    일시정지: "Paused",

    // 일반적인 단어
    없음: "None",
    알수없음: "Unknown",
    정보: "Info",
    경고: "Warning",
    주의: "Caution",
    확인: "Confirm",
    취소: "Cancel",

    // 숫자 관련 (한글 숫자)
    하나: "One",
    둘: "Two",
    셋: "Three",
    넷: "Four",
    다섯: "Five",

    // 시간 관련
    오전: "AM",
    오후: "PM",
    년: "",
    월: "",
    일: "",

    // 자주 사용되는 접미사
    에서: "at",
    으로: "to",
    의: "of",
    는: "",
    를: "",
    가: "",
    이: "",
    와: "and",
    과: "and",
  };

  let result = String(text);

  // 1단계: 직접 매핑
  for (const [korean, english] of Object.entries(koreanMap)) {
    if (result.includes(korean)) {
      result = result.replace(new RegExp(korean, "g"), english);
    }
  }

  // 2단계: 남은 한글 음역
  const remainingKorean = result.match(/[가-힣]/g);
  if (remainingKorean && remainingKorean.length > 0) {
    const koreanChars = result.match(/[가-힣]+/g) || [];
    for (const koreanWord of koreanChars) {
      const romanized = koreanWord.replace(/[가-힣]/g, (char) => {
        const code = char.charCodeAt(0) - 44032; // 한글 유니코드 시작점
        const initial = Math.floor(code / 588);
        const medial = Math.floor((code % 588) / 28);
        const final = code % 28;

        const initials = [
          "g",
          "kk",
          "n",
          "d",
          "tt",
          "r",
          "m",
          "b",
          "pp",
          "s",
          "ss",
          "",
          "j",
          "jj",
          "ch",
          "k",
          "t",
          "p",
          "h",
        ];
        const medials = [
          "a",
          "ae",
          "ya",
          "yae",
          "eo",
          "e",
          "yeo",
          "ye",
          "o",
          "wa",
          "wae",
          "oe",
          "yo",
          "u",
          "weo",
          "we",
          "wi",
          "yu",
          "eu",
          "yi",
          "i",
        ];
        const finals = [
          "",
          "g",
          "kk",
          "gs",
          "n",
          "nj",
          "nh",
          "d",
          "r",
          "rg",
          "rm",
          "rb",
          "rs",
          "rt",
          "rp",
          "rh",
          "m",
          "b",
          "bs",
          "s",
          "ss",
          "ng",
          "j",
          "ch",
          "k",
          "t",
          "p",
          "h",
        ];

        return (
          (initials[initial] || "") +
          (medials[medial] || "") +
          (finals[final] || "")
        );
      });
      result = result.replace(koreanWord, romanized);
    }
  }

  // 3단계: 정리
  result = result.replace(/\s+/g, " ").trim();
  return result;
};

/**
 * 날짜 값(배열 [y,M,d,h,m,s] 또는 일반 입력)을 로컬 문자열로 포맷.
 */
export const formatDateForPDF = (dateValue) => {
  try {
    if (!dateValue) return "Unknown";

    let date;
    if (Array.isArray(dateValue) && dateValue.length >= 6) {
      const [year, month, day, hour, minute, second] = dateValue;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString();
  } catch (error) {
    return "Date Error";
  }
};

/**
 * 실행 시간(초)을 ms/s/m s 형태로 포맷.
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(2);
  return `${minutes}m ${remainingSeconds}s`;
};
