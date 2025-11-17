-- V15__Create_rag_chat_tables.sql
-- AI 대화 스레드 및 메시지 저장을 위한 테이블 생성

CREATE TABLE IF NOT EXISTS rag_chat_threads (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_rag_chat_thread_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_rag_chat_thread_project
    ON rag_chat_threads(project_id);
CREATE INDEX IF NOT EXISTS idx_rag_chat_thread_created_at
    ON rag_chat_threads(created_at);

CREATE TABLE IF NOT EXISTS rag_chat_categories (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    CONSTRAINT fk_rag_chat_category_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT uk_rag_chat_category_project_name UNIQUE (project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_rag_chat_category_project
    ON rag_chat_categories(project_id);

CREATE TABLE IF NOT EXISTS rag_chat_thread_categories (
    thread_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (thread_id, category_id),
    CONSTRAINT fk_rag_chat_thread_categories_thread FOREIGN KEY (thread_id) REFERENCES rag_chat_threads(id) ON DELETE CASCADE,
    CONSTRAINT fk_rag_chat_thread_categories_category FOREIGN KEY (category_id) REFERENCES rag_chat_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rag_chat_thr_cat_thread
    ON rag_chat_thread_categories(thread_id);
CREATE INDEX IF NOT EXISTS idx_rag_chat_thr_cat_category
    ON rag_chat_thread_categories(category_id);

CREATE TABLE IF NOT EXISTS rag_chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    thread_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    parent_message_id VARCHAR(36),
    context_snapshot TEXT,
    metadata_json TEXT,
    llm_provider VARCHAR(50),
    llm_model VARCHAR(100),
    tokens_used INTEGER,
    temperature DOUBLE PRECISION,
    embedding_message_id VARCHAR(36),
    embedding_status VARCHAR(30),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    edited_at TIMESTAMP WITHOUT TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100),
    edited_by VARCHAR(100),
    error_message TEXT,
    CONSTRAINT fk_rag_chat_message_thread FOREIGN KEY (thread_id) REFERENCES rag_chat_threads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rag_chat_message_thread
    ON rag_chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_rag_chat_message_role
    ON rag_chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_rag_chat_message_created_at
    ON rag_chat_messages(created_at);
