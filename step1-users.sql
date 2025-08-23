-- Step 1: 사용자 데이터 초기화
SELECT '🔧 Step 1: 사용자 데이터 초기화' as step;

-- 기본 사용자 생성/업데이트 (현재 상태와 호환)
MERGE INTO users (id, username, password, name, email, role, created_at, updated_at) 
KEY(username) VALUES 
-- 관리자 계정 (현재 시스템에서 실제 사용 중)
('admin-user-id-2025', 'admin', '$2a$10$N.DpplxV2.MMjfLDdyBdSOHzhqjkn.2Z0FJi2AeN/ACrEhZFbtk.2', '관리자', 'admin@testcase.com', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 테스터 계정  
('tester-user-id-2025', 'tester', '$2a$10$Tqbh/b7LGdA6iGXa6bpMce4IqkG6pJz4k.PnMq7yV8DMZX0sjr6vO', '테스터', 'tester@testcase.com', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 일반 개발자 계정
('developer-user-id-2025', 'developer', '$2a$10$Y.HHb9Z9D0g4PdkSbCn5qOqBgFOuY9aI8YdPsj1.I4Pj9xKkJ7S4G', '개발자', 'developer@testcase.com', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT '✅ 사용자 데이터 초기화 완료' as result;
SELECT username, name, role FROM users ORDER BY username;