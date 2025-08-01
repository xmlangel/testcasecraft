import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class DebugPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // admin 비밀번호 인코딩 테스트
        String password = "admin";
        String encoded = encoder.encode(password);
        
        System.out.println("Original: " + password);
        System.out.println("Encoded: " + encoded);
        System.out.println("Matches: " + encoder.matches(password, encoded));
        
        // 기존에 저장된 해시와도 테스트
        String[] testHashes = {
            "$2a$10$test1", "$2a$10$test2", "$2b$10$test3"
        };
        
        for (String hash : testHashes) {
            try {
                System.out.println("Testing hash: " + hash.substring(0, 20) + "...");
                System.out.println("Matches: " + encoder.matches(password, hash));
            } catch (Exception e) {
                System.out.println("Error with hash: " + e.getMessage());
            }
        }
    }
}