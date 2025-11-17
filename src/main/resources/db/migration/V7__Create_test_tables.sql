-- Test Cases 테이블 생성
CREATE TABLE IF NOT EXISTS testcases (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    pre_condition TEXT,
    parent_id VARCHAR(36),
    expected_results TEXT,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- 외래키 제약조건
    CONSTRAINT fk_testcases_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    
    -- 유니크 제약조건
    CONSTRAINT uk_testcases_project_name_parent_type UNIQUE (project_id, name, parent_id, type),
    CONSTRAINT uk_testcases_parent_display_order UNIQUE (parent_id, display_order),
    
    -- 체크 제약조건
    CONSTRAINT chk_testcases_type CHECK (type IN ('testcase', 'folder', 'systemFolder') OR type IS NULL)
);

-- Test Case Steps 테이블 생성 (ElementCollection)
CREATE TABLE IF NOT EXISTS testcasesteps (
    testcase_id VARCHAR(36) NOT NULL,
    step_number INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    expected_result TEXT,
    step_order INTEGER NOT NULL,
    
    -- 외래키 제약조건
    CONSTRAINT fk_testcasesteps_testcase FOREIGN KEY (testcase_id) REFERENCES testcases(id) ON DELETE CASCADE,
    
    -- 기본키
    PRIMARY KEY (testcase_id, step_order)
);

-- Test Plans 테이블 생성
CREATE TABLE IF NOT EXISTS test_plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    project_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- 외래키 제약조건
    CONSTRAINT fk_test_plans_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Test Plan Cases 테이블 생성 (ElementCollection)
CREATE TABLE IF NOT EXISTS test_plan_cases (
    test_plan_id VARCHAR(36) NOT NULL,
    test_case_id VARCHAR(36) NOT NULL,
    
    -- 외래키 제약조건
    CONSTRAINT fk_test_plan_cases_plan FOREIGN KEY (test_plan_id) REFERENCES test_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_test_plan_cases_testcase FOREIGN KEY (test_case_id) REFERENCES testcases(id) ON DELETE CASCADE,
    
    -- 기본키
    PRIMARY KEY (test_plan_id, test_case_id)
);

-- Test Executions 테이블 생성
CREATE TABLE IF NOT EXISTS test_executions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    test_plan_id VARCHAR(36),
    project_id VARCHAR(36) NOT NULL,
    description TEXT,
    status VARCHAR(20),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- 외래키 제약조건
    CONSTRAINT fk_test_executions_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_test_executions_plan FOREIGN KEY (test_plan_id) REFERENCES test_plans(id) ON DELETE SET NULL,
    
    -- 체크 제약조건
    CONSTRAINT chk_test_executions_status CHECK (status IN ('NOTSTARTED', 'INPROGRESS', 'COMPLETED') OR status IS NULL)
);

-- Test Results 테이블 생성
CREATE TABLE IF NOT EXISTS test_results (
    id VARCHAR(36) PRIMARY KEY,
    test_execution_id VARCHAR(36),
    test_case_id VARCHAR(36),
    result VARCHAR(20),
    notes TEXT,
    executed_at TIMESTAMP,
    executed_by VARCHAR(36),
    
    -- 외래키 제약조건
    CONSTRAINT fk_test_results_execution FOREIGN KEY (test_execution_id) REFERENCES test_executions(id) ON DELETE CASCADE,
    CONSTRAINT fk_test_results_testcase FOREIGN KEY (test_case_id) REFERENCES testcases(id) ON DELETE CASCADE,
    CONSTRAINT fk_test_results_user FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- 체크 제약조건
    CONSTRAINT chk_test_results_result CHECK (result IN ('NOT_RUN', 'PASS', 'FAIL', 'BLOCKED') OR result IS NULL)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_testcases_project_id ON testcases(project_id);
CREATE INDEX IF NOT EXISTS idx_testcases_parent_id ON testcases(parent_id);
CREATE INDEX IF NOT EXISTS idx_testcases_type ON testcases(type);
CREATE INDEX IF NOT EXISTS idx_test_plans_project_id ON test_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_project_id ON test_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_plan_id ON test_executions(test_plan_id);
CREATE INDEX IF NOT EXISTS idx_test_results_execution_id ON test_results(test_execution_id);
CREATE INDEX IF NOT EXISTS idx_test_results_testcase_id ON test_results(test_case_id);