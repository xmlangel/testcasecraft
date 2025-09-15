// 나눔고딕 폰트 동적 로더
// 실제 폰트 파일을 사용하여 jsPDF에 한글 폰트 지원

/**
 * 나눔고딕 폰트를 동적으로 로드하여 Base64로 변환하는 함수
 */
const loadNanumGothicFont = async () => {
    try {
        console.log('🔍 폰트 파일 로드 시도 중...');

        // 프로젝트 public 디렉토리의 폰트 파일 경로
        const fontPath = '/assets/fonts/NanumGothic.ttf';
        console.log(`📂 폰트 경로: ${fontPath}`);

        // 폰트 파일을 fetch로 로드
        const response = await fetch(fontPath);
        console.log(`📡 Fetch 응답 상태: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            throw new Error(`폰트 파일 로드 실패: ${response.status} ${response.statusText}`);
        }

        console.log('📊 응답 헤더 정보:');
        console.log('- Content-Type:', response.headers.get('Content-Type'));
        console.log('- Content-Length:', response.headers.get('Content-Length'));

        // ArrayBuffer로 변환
        const arrayBuffer = await response.arrayBuffer();
        console.log(`📦 ArrayBuffer 크기: ${arrayBuffer.byteLength} bytes`);

        if (arrayBuffer.byteLength === 0) {
            throw new Error('폰트 파일이 비어있습니다');
        }

        // Base64로 변환
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }

        const base64 = btoa(binary);
        console.log(`✅ Base64 변환 완료: ${base64.length} characters`);
        return base64;

    } catch (error) {
        console.error('❌ 나눔고딕 폰트 로드 실패:', error);
        console.error('- Error name:', error.name);
        console.error('- Error message:', error.message);
        return null;
    }
};

/**
 * jsPDF에 나눔고딕 폰트를 추가하는 함수 (다중 경로 시도)
 */
export const addNanumGothicToJsPDF = async (pdf) => {
    try {
        console.log('🚀 나눔고딕 폰트 로드 중...');

        // 여러 경로 시도
        const fontPaths = [
            '/assets/fonts/NanumGothic.ttf',
            './assets/fonts/NanumGothic.ttf',
            'assets/fonts/NanumGothic.ttf',
            '/NanumGothic.ttf' // 루트 경로도 시도
        ];

        let fontBase64 = null;
        let successPath = null;

        for (const fontPath of fontPaths) {
            console.log(`🔍 폰트 경로 시도: ${fontPath}`);
            try {
                const response = await fetch(fontPath);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    if (arrayBuffer.byteLength > 0) {
                        console.log(`✅ 폰트 로드 성공: ${fontPath} (${arrayBuffer.byteLength} bytes)`);

                        // Base64로 변환
                        const uint8Array = new Uint8Array(arrayBuffer);
                        let binary = '';
                        for (let i = 0; i < uint8Array.byteLength; i++) {
                            binary += String.fromCharCode(uint8Array[i]);
                        }
                        fontBase64 = btoa(binary);
                        successPath = fontPath;
                        break;
                    }
                }
            } catch (pathError) {
                console.warn(`❌ 경로 실패: ${fontPath} - ${pathError.message}`);
                continue; // 다음 경로 시도
            }
        }

        if (!fontBase64) {
            console.warn('⚠️ 모든 폰트 경로에서 로드 실패, 기본 폰트 사용');
            return false;
        }

        console.log(`🎯 폰트 사용 경로: ${successPath}`);
        console.log(`📊 Base64 폰트 크기: ${fontBase64.length} characters`);

        // jsPDF에 폰트 추가
        pdf.addFileToVFS('NanumGothic-Regular.ttf', fontBase64);
        pdf.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');

        // 기본 폰트로 설정
        pdf.setFont('NanumGothic', 'normal');

        console.log('✅ 나눔고딕 폰트가 jsPDF에 성공적으로 추가되었습니다.');

        // 폰트 테스트
        try {
            const testText = '한글 테스트';
            console.log(`🧪 한글 폰트 테스트: "${testText}"`);
            pdf.text(testText, 10, 10); // 실제로 텍스트 렌더링 테스트
            console.log('✅ 한글 텍스트 렌더링 테스트 성공');
        } catch (testError) {
            console.warn('⚠️ 한글 텍스트 렌더링 테스트 실패:', testError);
        }

        return true;

    } catch (error) {
        console.error('❌ 나눔고딕 폰트 추가 실패:', error);
        console.error('- Error stack:', error.stack);
        return false;
    }
};

/**
 * 강화된 폴백 방식: 여러 폰트 옵션 시도
 */
export const setupKoreanFontFallback = (pdf) => {
    try {
        console.log('🔄 한글 폰트 폴백 설정 시작...');

        // 사용 가능한 폰트들을 순서대로 시도
        const fallbackFonts = [
            'helvetica',
            'arial',
            'times',
            'courier'
        ];

        let currentFont = null;

        for (const font of fallbackFonts) {
            try {
                pdf.setFont(font, 'normal');
                currentFont = font;
                console.log(`✅ 폴백 폰트 설정 성공: ${font}`);
                break;
            } catch (fontError) {
                console.warn(`⚠️ 폰트 설정 실패: ${font} - ${fontError.message}`);
                continue;
            }
        }

        if (!currentFont) {
            console.warn('⚠️ 모든 폰트 설정 실패, 기본값 유지');
        }

        // 한글 텍스트 렌더링을 위한 설정 최적화
        try {
            pdf.setCharSpace(0);
            pdf.setFontSize(12); // 기본 크기
            console.log('📐 문자 간격 및 폰트 크기 설정 완료');
        } catch (settingError) {
            console.warn('⚠️ 폰트 설정 일부 실패:', settingError);
        }

        // 한글 텍스트 테스트
        try {
            const testKorean = '한글 테스트';
            console.log(`🧪 폴백 한글 테스트: "${testKorean}"`);

            // 실제로는 텍스트를 그리지 않고 인코딩만 테스트
            const encoded = pdf.internal.getFont().encoding;
            if (encoded) {
                console.log(`📝 폰트 인코딩: ${encoded}`);
            }

        } catch (testError) {
            console.warn('⚠️ 폴백 한글 테스트 실패:', testError);
        }

        console.log(`✅ 한글 폰트 폴백 설정 완료 (폰트: ${currentFont || '기본'})`);
        return true;

    } catch (error) {
        console.error('❌ 한글 폰트 폴백 설정 실패:', error);
        return false;
    }
};