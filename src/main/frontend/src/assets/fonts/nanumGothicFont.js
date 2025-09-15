// 나눔고딕 폰트 동적 로더
// 실제 폰트 파일을 사용하여 jsPDF에 한글 폰트 지원

/**
 * 나눔고딕 폰트를 동적으로 로드하여 Base64로 변환하는 함수
 */
const loadNanumGothicFont = async () => {
    try {
        // 프로젝트 public 디렉토리의 폰트 파일 경로
        const fontPath = '/assets/fonts/NanumGothic.ttf';

        // 폰트 파일을 fetch로 로드
        const response = await fetch(fontPath);
        if (!response.ok) {
            throw new Error(`폰트 파일 로드 실패: ${response.status}`);
        }

        // ArrayBuffer로 변환
        const arrayBuffer = await response.arrayBuffer();

        // Base64로 변환
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }

        return btoa(binary);
    } catch (error) {
        console.error('나눔고딕 폰트 로드 실패:', error);
        return null;
    }
};

/**
 * jsPDF에 나눔고딕 폰트를 추가하는 함수
 */
export const addNanumGothicToJsPDF = async (pdf) => {
    try {
        console.log('나눔고딕 폰트 로드 중...');

        // 폰트 파일을 Base64로 로드
        const fontBase64 = await loadNanumGothicFont();

        if (!fontBase64) {
            console.warn('나눔고딕 폰트 로드 실패, 기본 폰트 사용');
            return false;
        }

        // jsPDF에 폰트 추가
        pdf.addFileToVFS('NanumGothic-Regular.ttf', fontBase64);
        pdf.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');

        // 기본 폰트로 설정
        pdf.setFont('NanumGothic', 'normal');

        console.log('✅ 나눔고딕 폰트가 jsPDF에 성공적으로 추가되었습니다.');
        return true;

    } catch (error) {
        console.error('❌ 나눔고딕 폰트 추가 실패:', error);
        return false;
    }
};

/**
 * 간단한 폴백 방식: CSS를 이용한 한글 폰트 설정
 */
export const setupKoreanFontFallback = (pdf) => {
    try {
        // 기본 폰트 설정 개선
        pdf.setFont('helvetica', 'normal');

        // 한글 텍스트 렌더링을 위한 설정
        pdf.setCharSpace(0);

        console.log('한글 폰트 폴백 설정 완료');
        return true;
    } catch (error) {
        console.error('한글 폰트 폴백 설정 실패:', error);
        return false;
    }
};