// 나눔고딕 폰트 동적 로더
// 실제 폰트 파일을 사용하여 jsPDF에 한글 폰트 지원

let cachedFontBase64 = null;

const fetchFontAsBase64 = async () => {
    if (cachedFontBase64) {
        return cachedFontBase64;
    }

    const fontPaths = [
        '/assets/fonts/NanumGothic-Regular.ttf',
        '/assets/fonts/NanumGothic.ttf',
        './assets/fonts/NanumGothic-Regular.ttf',
        './assets/fonts/NanumGothic.ttf',
        'assets/fonts/NanumGothic-Regular.ttf',
        'assets/fonts/NanumGothic.ttf'
    ];

    for (const fontPath of fontPaths) {
        try {
            const response = await fetch(fontPath);
            if (!response.ok) {
                continue;
            }
            const arrayBuffer = await response.arrayBuffer();
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                continue;
            }
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8Array.byteLength; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            cachedFontBase64 = btoa(binary);
            return cachedFontBase64;
        } catch (error) {
            console.warn(`❌ 폰트 경로 시도 실패: ${fontPath}`, error);
        }
    }

    console.warn('⚠️ 나눔고딕 폰트를 어떤 경로에서도 찾을 수 없습니다.');
    return null;
};

/**
 * jsPDF에 나눔고딕 폰트를 추가하는 함수 (다중 경로 시도)
 */
export const addNanumGothicToJsPDF = async (pdf) => {
    try {
        const fontBase64 = await fetchFontAsBase64();

        if (!fontBase64) {
            console.warn('⚠️ 나눔고딕 폰트를 로드하지 못했습니다.');
            return false;
        }

        pdf.addFileToVFS('NanumGothic-Regular.ttf', fontBase64);
        pdf.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal', 'Identity-H');
        pdf.setFont('NanumGothic', 'normal');
        pdf.setFontSize(12);
        if (typeof pdf.setCharSpace === 'function') {
            pdf.setCharSpace(0);
        }
        return true;
    } catch (error) {
        console.error('❌ 나눔고딕 폰트 추가 실패:', error);
        return false;
    }
};

/**
 * 강화된 폴백 방식: 여러 폰트 옵션 시도
 */
export const setupKoreanFontFallback = (pdf) => {
    try {
        

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
            
        } catch (settingError) {
            console.warn('⚠️ 폰트 설정 일부 실패:', settingError);
        }

        // 한글 텍스트 테스트
        try {
            const testKorean = '한글 테스트';
            

            // 실제로는 텍스트를 그리지 않고 인코딩만 테스트
            const encoded = pdf.internal.getFont().encoding;
            if (encoded) {
                
            }

        } catch (testError) {
            console.warn('⚠️ 폴백 한글 테스트 실패:', testError);
        }

        
        return true;

    } catch (error) {
        console.error('❌ 한글 폰트 폴백 설정 실패:', error);
        return false;
    }
};
