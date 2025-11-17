-- V10: 그룹 멤버 역할 확장
-- 기존 group_members 테이블의 역할 제약조건을 확장하여 'CO_LEADER' 역할 추가

-- 기존 체크 제약조건 삭제
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS chk_group_members_role;

-- 새로운 체크 제약조건 추가 (CO_LEADER 역할 포함)
ALTER TABLE group_members ADD CONSTRAINT chk_group_members_role 
CHECK (role_in_group IN (
    'LEADER',
    'CO_LEADER',
    'MEMBER'
));

-- 기존 데이터 무결성 보장을 위한 UPDATE
-- 기존의 'LEADER', 'MEMBER' 역할은 그대로 유지되고 'CO_LEADER'가 추가됨
-- 기존 데이터는 변경하지 않음

-- 성능 최적화를 위한 복합 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_group_members_group_role ON group_members(group_id, role_in_group);
CREATE INDEX IF NOT EXISTS idx_group_members_user_role ON group_members(user_id, role_in_group);