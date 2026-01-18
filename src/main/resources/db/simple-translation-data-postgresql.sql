-- ==========================================
-- PostgreSQL 호환 간단한 번역 데이터 SQL 스크립트
-- 실제 엔티티 스키마에 맞춘 버전
-- ==========================================

-- 언어 데이터 (Language 엔티티에 맞춤)
INSERT INTO languages (id, code, name, native_name, is_active, is_default, sort_order, created_at, updated_at) VALUES
(gen_random_uuid(), 'ko', 'Korean', '한국어', true, true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'en', 'English', 'English', true, false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    native_name = EXCLUDED.native_name,
    updated_at = CURRENT_TIMESTAMP;

-- 번역 키 데이터 (TranslationKey 엔티티에 맞춤)
INSERT INTO translation_keys (id, key_name, category, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'login.title', 'login', '로그인 페이지 제목', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'login.username', 'login', '사용자명 입력', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'login.password', 'login', '비밀번호 입력', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'login.button', 'login', '로그인 버튼', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'dashboard.title', 'dashboard', '대시보드 제목', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'project.title', 'project', '프로젝트 관리', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'common.button.save', 'common', '저장', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'common.button.cancel', 'common', '취소', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (key_name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- 번역 데이터는 관계형이므로 복잡함
-- Java 코드의 Initializer를 사용하는 것이 더 적합함

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '기본 언어 및 번역 키 데이터 삽입 완료';
    RAISE NOTICE 'Translation 데이터는 Java Initializer를 사용하세요';
END $$;