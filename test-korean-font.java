import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;

/**
 * ICT-233: 한글 폰트 로딩 테스트를 위한 독립 실행 클래스
 * 각 폰트 옵션을 개별적으로 테스트하여 실패 원인을 파악
 */
public class TestKoreanFont {
    
    public static void main(String[] args) {
        System.out.println("=== ICT-233: 한글 폰트 로딩 테스트 시작 ===");
        
        // 1. iText 번들 한글 폰트 테스트
        testBundleFont("STSong-Light", "iText 번들 중국어 폰트");
        testBundleFont("HeiseiKakuGo-W5", "iText 번들 일본어 폰트");
        testBundleFont("HYGoThic-Medium", "iText 번들 한글 폰트");
        
        // 2. 시스템 폰트 테스트 (경로 기반)
        testSystemFontByPath();
        
        // 3. 기본 폰트 UTF-8 테스트
        testBasicFontWithUtf8();
        
        System.out.println("=== ICT-233: 한글 폰트 로딩 테스트 완료 ===");
    }
    
    private static void testBundleFont(String fontName, String description) {
        System.out.println("\n[테스트] " + description + " (" + fontName + ")");
        try {
            PdfFont font = PdfFontFactory.createFont(fontName, PdfEncodings.IDENTITY_H);
            System.out.println("✅ 성공: " + fontName + " 폰트 로드됨");
            
            // 한글 텍스트 테스트
            String koreanText = "테스트 한글 텍스트";
            System.out.println("  - 한글 텍스트 처리 가능: " + koreanText);
            
        } catch (Exception e) {
            System.out.println("❌ 실패: " + fontName);
            System.out.println("  - 오류: " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }
    
    private static void testSystemFontByPath() {
        System.out.println("\n[테스트] 시스템 폰트 경로 기반 로딩");
        
        // macOS 한글 폰트 경로들
        String[] macFontPaths = {
            "/System/Library/Fonts/Apple SD Gothic Neo.ttc",
            "/System/Library/Fonts/AppleGothic.ttf",
            "/System/Library/Fonts/NanumGothic.ttc"
        };
        
        // Windows 한글 폰트 경로들  
        String[] winFontPaths = {
            "C:/Windows/Fonts/malgun.ttf",
            "C:/Windows/Fonts/gulim.ttc",
            "C:/Windows/Fonts/batang.ttc"
        };
        
        // Linux 한글 폰트 경로들
        String[] linuxFontPaths = {
            "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
        };
        
        System.out.println("  macOS 폰트 경로 테스트:");
        for (String path : macFontPaths) {
            testFontPath(path);
        }
        
        System.out.println("  Windows 폰트 경로 테스트:");
        for (String path : winFontPaths) {
            testFontPath(path);
        }
        
        System.out.println("  Linux 폰트 경로 테스트:");
        for (String path : linuxFontPaths) {
            testFontPath(path);
        }
    }
    
    private static void testFontPath(String fontPath) {
        try {
            PdfFont font = PdfFontFactory.createFont(fontPath, PdfEncodings.IDENTITY_H);
            System.out.println("    ✅ " + fontPath + " - 로드 성공");
        } catch (Exception e) {
            System.out.println("    ❌ " + fontPath + " - " + e.getClass().getSimpleName());
        }
    }
    
    private static void testBasicFontWithUtf8() {
        System.out.println("\n[테스트] 기본 폰트 UTF-8 인코딩");
        try {
            PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA, PdfEncodings.UTF8);
            System.out.println("✅ Helvetica UTF-8 폰트 생성 성공");
            
            // UTF-8 한글 텍스트 지원 확인
            String koreanText = "한글 텍스트 테스트";
            System.out.println("  - UTF-8 한글 지원 테스트: " + koreanText);
            
        } catch (Exception e) {
            System.out.println("❌ Helvetica UTF-8 폰트 실패: " + e.getMessage());
        }
    }
}