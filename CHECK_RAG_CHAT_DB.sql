-- ========================================
-- RAG 채팅 데이터 검증 SQL 스크립트
-- ========================================
-- 실행 방법:
-- psql -h localhost -p 5434 -U testcase_user -d testcase_management -f CHECK_RAG_CHAT_DB.sql
-- Password: testcase_password
-- ========================================

\echo '======================================'
\echo '1. 전체 스레드 목록 조회'
\echo '======================================'
SELECT
    id,
    title,
    archived,
    created_by,
    created_at,
    updated_at
FROM rag_chat_threads
WHERE project_id = 'f52e64e9-dc7b-45e3-9222-dc27d1797dcb'
ORDER BY created_at DESC;

\echo ''
\echo '======================================'
\echo '2. 현재 스레드 상세 정보'
\echo '======================================'
SELECT
    id,
    title,
    description,
    archived,
    created_by,
    updated_by,
    created_at,
    updated_at
FROM rag_chat_threads
WHERE id = '5602576c-b69d-4a02-9758-8f973b9774bc';

\echo ''
\echo '======================================'
\echo '3. 현재 스레드의 메시지 개수'
\echo '======================================'
SELECT
    COUNT(*) AS total_messages,
    COUNT(CASE WHEN role = 'user' THEN 1 END) AS user_messages,
    COUNT(CASE WHEN role = 'assistant' THEN 1 END) AS assistant_messages
FROM rag_chat_messages
WHERE thread_id = '5602576c-b69d-4a02-9758-8f973b9774bc';

\echo ''
\echo '======================================'
\echo '4. 현재 스레드의 모든 메시지 (요약)'
\echo '======================================'
SELECT
    id,
    role,
    LEFT(content, 80) AS content_preview,
    llm_provider,
    llm_model,
    tokens_used,
    created_at,
    created_by
FROM rag_chat_messages
WHERE thread_id = '5602576c-b69d-4a02-9758-8f973b9774bc'
ORDER BY created_at ASC;

\echo ''
\echo '======================================'
\echo '5. 최근 메시지 전체 내용 (최근 5개)'
\echo '======================================'
SELECT
    id,
    role,
    content,
    created_at
FROM rag_chat_messages
WHERE thread_id = '5602576c-b69d-4a02-9758-8f973b9774bc'
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '======================================'
\echo '6. 스레드별 메시지 통계'
\echo '======================================'
SELECT
    t.id AS thread_id,
    t.title,
    COUNT(m.id) AS message_count,
    MIN(m.created_at) AS first_message_at,
    MAX(m.created_at) AS last_message_at
FROM rag_chat_threads t
LEFT JOIN rag_chat_messages m ON m.thread_id = t.id
WHERE t.project_id = 'f52e64e9-dc7b-45e3-9222-dc27d1797dcb'
GROUP BY t.id, t.title
ORDER BY last_message_at DESC;

\echo ''
\echo '======================================'
\echo '7. 임베딩 상태 확인'
\echo '======================================'
SELECT
    embedding_status,
    COUNT(*) AS count
FROM rag_chat_messages
WHERE thread_id = '5602576c-b69d-4a02-9758-8f973b9774bc'
GROUP BY embedding_status;

\echo ''
\echo '======================================'
\echo '8. 전체 RAG 채팅 통계'
\echo '======================================'
SELECT
    (SELECT COUNT(*) FROM rag_chat_threads
     WHERE project_id = 'f52e64e9-dc7b-45e3-9222-dc27d1797dcb') AS total_threads,
    (SELECT COUNT(*) FROM rag_chat_messages m
     JOIN rag_chat_threads t ON m.thread_id = t.id
     WHERE t.project_id = 'f52e64e9-dc7b-45e3-9222-dc27d1797dcb') AS total_messages,
    (SELECT COUNT(*) FROM rag_chat_categories
     WHERE project_id = 'f52e64e9-dc7b-45e3-9222-dc27d1797dcb') AS total_categories;
