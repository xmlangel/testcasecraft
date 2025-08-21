-- ICT-265: 대량 테스트 데이터 생성
-- 테스트케이스 100개+, 테스트플랜 15개+, 테스트실행 12개+, 테스트결과 1200개+

SELECT 'ICT-265 대량 테스트 데이터 생성 시작' as message;

-- 1. 테스트케이스 100개 생성
SELECT 'Creating 100 TestCases' as info;

INSERT INTO testcases (id, name, type, description, priority, status, project_id, created_at, updated_at, display_order, execution_time)
VALUES 
('ict265-tc-001', 'ICT265-TC-001', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #1 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 32),
('ict265-tc-002', 'ICT265-TC-002', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #2 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 34),
('ict265-tc-003', 'ICT265-TC-003', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #3 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 36),
('ict265-tc-004', 'ICT265-TC-004', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #4 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 38),
('ict265-tc-005', 'ICT265-TC-005', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #5 - 중복 데이터 검증용', 'HIGH', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 40),
('ict265-tc-006', 'ICT265-TC-006', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #6 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 42),
('ict265-tc-007', 'ICT265-TC-007', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #7 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 44),
('ict265-tc-008', 'ICT265-TC-008', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #8 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 46),
('ict265-tc-009', 'ICT265-TC-009', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #9 - 중복 데이터 검증용', 'HIGH', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 48),
('ict265-tc-010', 'ICT265-TC-010', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #10 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 50),
('ict265-tc-011', 'ICT265-TC-011', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #11 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 52),
('ict265-tc-012', 'ICT265-TC-012', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #12 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 54),
('ict265-tc-013', 'ICT265-TC-013', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #13 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 56),
('ict265-tc-014', 'ICT265-TC-014', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #14 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 14, 58),
('ict265-tc-015', 'ICT265-TC-015', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #15 - 중복 데이터 검증용', 'LOW', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 15, 60),
('ict265-tc-016', 'ICT265-TC-016', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #16 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 16, 62),
('ict265-tc-017', 'ICT265-TC-017', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #17 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 17, 64),
('ict265-tc-018', 'ICT265-TC-018', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #18 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 18, 66),
('ict265-tc-019', 'ICT265-TC-019', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #19 - 중복 데이터 검증용', 'LOW', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 19, 68),
('ict265-tc-020', 'ICT265-TC-020', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #20 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 20, 70),
('ict265-tc-021', 'ICT265-TC-021', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #21 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 21, 72),
('ict265-tc-022', 'ICT265-TC-022', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #22 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 22, 74),
('ict265-tc-023', 'ICT265-TC-023', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #23 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 23, 76),
('ict265-tc-024', 'ICT265-TC-024', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #24 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 24, 78),
('ict265-tc-025', 'ICT265-TC-025', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #25 - 중복 데이터 검증용', 'HIGH', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 25, 80),
('ict265-tc-026', 'ICT265-TC-026', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #26 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 26, 82),
('ict265-tc-027', 'ICT265-TC-027', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #27 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 27, 84),
('ict265-tc-028', 'ICT265-TC-028', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #28 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 28, 86),
('ict265-tc-029', 'ICT265-TC-029', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #29 - 중복 데이터 검증용', 'HIGH', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 29, 88),
('ict265-tc-030', 'ICT265-TC-030', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #30 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 30, 90),
('ict265-tc-031', 'ICT265-TC-031', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #31 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 31, 92),
('ict265-tc-032', 'ICT265-TC-032', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #32 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 32, 94),
('ict265-tc-033', 'ICT265-TC-033', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #33 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 33, 96),
('ict265-tc-034', 'ICT265-TC-034', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #34 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 34, 98),
('ict265-tc-035', 'ICT265-TC-035', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #35 - 중복 데이터 검증용', 'LOW', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 35, 100),
('ict265-tc-036', 'ICT265-TC-036', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #36 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 36, 102),
('ict265-tc-037', 'ICT265-TC-037', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #37 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 37, 104),
('ict265-tc-038', 'ICT265-TC-038', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #38 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 38, 106),
('ict265-tc-039', 'ICT265-TC-039', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #39 - 중복 데이터 검증용', 'LOW', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 39, 108),
('ict265-tc-040', 'ICT265-TC-040', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #40 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 40, 110),
('ict265-tc-041', 'ICT265-TC-041', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #41 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 41, 112),
('ict265-tc-042', 'ICT265-TC-042', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #42 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 42, 114),
('ict265-tc-043', 'ICT265-TC-043', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #43 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 43, 116),
('ict265-tc-044', 'ICT265-TC-044', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #44 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 44, 118),
('ict265-tc-045', 'ICT265-TC-045', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #45 - 중복 데이터 검증용', 'HIGH', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 45, 120),
('ict265-tc-046', 'ICT265-TC-046', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #46 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 46, 122),
('ict265-tc-047', 'ICT265-TC-047', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #47 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 47, 124),
('ict265-tc-048', 'ICT265-TC-048', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #48 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 48, 126),
('ict265-tc-049', 'ICT265-TC-049', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #49 - 중복 데이터 검증용', 'HIGH', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 49, 128),
('ict265-tc-050', 'ICT265-TC-050', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #50 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 50, 130),
('ict265-tc-051', 'ICT265-TC-051', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #51 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 51, 132),
('ict265-tc-052', 'ICT265-TC-052', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #52 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 52, 134),
('ict265-tc-053', 'ICT265-TC-053', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #53 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 53, 136),
('ict265-tc-054', 'ICT265-TC-054', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #54 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 54, 138),
('ict265-tc-055', 'ICT265-TC-055', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #55 - 중복 데이터 검증용', 'LOW', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 55, 140),
('ict265-tc-056', 'ICT265-TC-056', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #56 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 56, 142),
('ict265-tc-057', 'ICT265-TC-057', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #57 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 57, 144),
('ict265-tc-058', 'ICT265-TC-058', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #58 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 58, 146),
('ict265-tc-059', 'ICT265-TC-059', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #59 - 중복 데이터 검증용', 'LOW', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 59, 148),
('ict265-tc-060', 'ICT265-TC-060', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #60 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 60, 150),
('ict265-tc-061', 'ICT265-TC-061', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #61 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 61, 152),
('ict265-tc-062', 'ICT265-TC-062', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #62 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 62, 154),
('ict265-tc-063', 'ICT265-TC-063', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #63 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 63, 156),
('ict265-tc-064', 'ICT265-TC-064', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #64 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 64, 158),
('ict265-tc-065', 'ICT265-TC-065', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #65 - 중복 데이터 검증용', 'HIGH', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 65, 160),
('ict265-tc-066', 'ICT265-TC-066', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #66 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 66, 162),
('ict265-tc-067', 'ICT265-TC-067', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #67 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 67, 164),
('ict265-tc-068', 'ICT265-TC-068', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #68 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 68, 166),
('ict265-tc-069', 'ICT265-TC-069', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #69 - 중복 데이터 검증용', 'HIGH', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 69, 168),
('ict265-tc-070', 'ICT265-TC-070', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #70 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 70, 170),
('ict265-tc-071', 'ICT265-TC-071', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #71 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 71, 172),
('ict265-tc-072', 'ICT265-TC-072', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #72 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 72, 174),
('ict265-tc-073', 'ICT265-TC-073', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #73 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 73, 176),
('ict265-tc-074', 'ICT265-TC-074', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #74 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 74, 178),
('ict265-tc-075', 'ICT265-TC-075', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #75 - 중복 데이터 검증용', 'LOW', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 75, 180),
('ict265-tc-076', 'ICT265-TC-076', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #76 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 76, 182),
('ict265-tc-077', 'ICT265-TC-077', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #77 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 77, 184),
('ict265-tc-078', 'ICT265-TC-078', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #78 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 78, 186),
('ict265-tc-079', 'ICT265-TC-079', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #79 - 중복 데이터 검증용', 'LOW', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 79, 188),
('ict265-tc-080', 'ICT265-TC-080', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #80 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 80, 190),
('ict265-tc-081', 'ICT265-TC-081', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #81 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 81, 192),
('ict265-tc-082', 'ICT265-TC-082', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #82 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 82, 194),
('ict265-tc-083', 'ICT265-TC-083', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #83 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 83, 196),
('ict265-tc-084', 'ICT265-TC-084', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #84 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 84, 198),
('ict265-tc-085', 'ICT265-TC-085', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #85 - 중복 데이터 검증용', 'HIGH', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 85, 200),
('ict265-tc-086', 'ICT265-TC-086', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #86 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 86, 202),
('ict265-tc-087', 'ICT265-TC-087', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #87 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 87, 204),
('ict265-tc-088', 'ICT265-TC-088', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #88 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 88, 206),
('ict265-tc-089', 'ICT265-TC-089', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #89 - 중복 데이터 검증용', 'HIGH', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 89, 208),
('ict265-tc-090', 'ICT265-TC-090', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #90 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 90, 210),
('ict265-tc-091', 'ICT265-TC-091', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #91 - 중복 데이터 검증용', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 91, 212),
('ict265-tc-092', 'ICT265-TC-092', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #92 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 92, 214),
('ict265-tc-093', 'ICT265-TC-093', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #93 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 93, 216),
('ict265-tc-094', 'ICT265-TC-094', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #94 - 중복 데이터 검증용', 'MEDIUM', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 94, 218),
('ict265-tc-095', 'ICT265-TC-095', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #95 - 중복 데이터 검증용', 'LOW', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 95, 220),
('ict265-tc-096', 'ICT265-TC-096', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #96 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 96, 222),
('ict265-tc-097', 'ICT265-TC-097', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #97 - 중복 데이터 검증용', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 97, 224),
('ict265-tc-098', 'ICT265-TC-098', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #98 - 중복 데이터 검증용', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 98, 226),
('ict265-tc-099', 'ICT265-TC-099', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #99 - 중복 데이터 검증용', 'LOW', 'INACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 99, 228),
('ict265-tc-100', 'ICT265-TC-100', 'MANUAL', 'ICT-265 대량 테스트를 위한 테스트케이스 #100 - 중복 데이터 검증용', 'MEDIUM', 'DRAFT', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 100, 230)
;

-- 2. 테스트플랜 15개 생성
SELECT 'Creating 15 TestPlans' as info;

INSERT INTO test_plans (id, name, description, project_id, status, created_at, updated_at) 
VALUES 
('ict265-plan-001', 'ICT265-플랜-001-기본기능', 'ICT-265 기본 기능 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-002', 'ICT265-플랜-002-성능', 'ICT-265 성능 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-003', 'ICT265-플랜-003-보안', 'ICT-265 보안 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-004', 'ICT265-플랜-004-UI', 'ICT-265 UI 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-005', 'ICT265-플랜-005-통합', 'ICT-265 통합 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-006', 'ICT265-플랜-006-회귀', 'ICT-265 회귀 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-007', 'ICT265-플랜-007-스트레스', 'ICT-265 스트레스 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-008', 'ICT265-플랜-008-호환성', 'ICT-265 호환성 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-009', 'ICT265-플랜-009-사용성', 'ICT-265 사용성 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-010', 'ICT265-플랜-010-배포', 'ICT-265 배포 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-011', 'ICT265-플랜-011-전체회귀', 'ICT-265 전체 회귀 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-012', 'ICT265-플랜-012-고우선순위', 'ICT-265 HIGH 우선순위 테스트', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-013', 'ICT265-플랜-013-스모크', 'ICT-265 스모크 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-014', 'ICT265-플랜-014-릴리즈', 'ICT-265 릴리즈 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-015', 'ICT265-플랜-015-핫픽스', 'ICT-265 핫픽스 테스트 플랜', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. 테스트실행 12개 생성
SELECT 'Creating 12 TestExecutions' as info;

INSERT INTO test_executions (id, name, description, project_id, test_plan_id, status, created_at, updated_at, scheduled_start_time)
VALUES 
('ict265-exec-001', 'ICT265-실행-001', 'ICT-265 기본 기능 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-001', 'COMPLETED', DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP)),
('ict265-exec-002', 'ICT265-실행-002', 'ICT-265 성능 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-002', 'COMPLETED', DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP)),
('ict265-exec-003', 'ICT265-실행-003', 'ICT-265 보안 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-003', 'COMPLETED', DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP)),
('ict265-exec-004', 'ICT265-실행-004', 'ICT-265 UI 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-004', 'INPROGRESS', DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP)),
('ict265-exec-005', 'ICT265-실행-005', 'ICT-265 통합 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-005', 'INPROGRESS', DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP)),
('ict265-exec-006', 'ICT265-실행-006', 'ICT-265 회귀 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-006', 'INPROGRESS', DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP)),
('ict265-exec-007', 'ICT265-실행-007', 'ICT-265 스트레스 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-007', 'PAUSED', DATEADD('DAY', -4, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP)),
('ict265-exec-008', 'ICT265-실행-008', 'ICT-265 호환성 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-008', 'INPROGRESS', DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP)),
('ict265-exec-009', 'ICT265-실행-009', 'ICT-265 사용성 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-009', 'INPROGRESS', DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP)),
('ict265-exec-010', 'ICT265-실행-010', 'ICT-265 배포 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-010', 'INPROGRESS', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
('ict265-exec-011', 'ICT265-실행-011', 'ICT-265 전체 회귀 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-011', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-exec-012', 'ICT265-실행-012', 'ICT-265 핫픽스 테스트 실행', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ict265-plan-015', 'SCHEDULED', DATEADD('DAY', 1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, DATEADD('DAY', 1, CURRENT_TIMESTAMP));

SELECT 'TestCases, TestPlans, TestExecutions 생성 완료' as message;

-- 4. 테스트 결과 1200개+ 생성 (중복 데이터 포함)
SELECT 'Creating 1200+ TestResults with Duplicates' as info;

-- 각 테스트 실행별로 100개씩 결과 생성 (12개 실행 * 100개 = 1200개 기본)
-- 추가로 중복 데이터 포함하여 총 1500개+ 생성

-- 실행 1: ict265-exec-001 - 기본 기능 테스트 (완료)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec001-', ROW_NUMBER() OVER()),
    'ict265-exec-001',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 30 + 1) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'PASS'  
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'FAIL'
        ELSE 'BLOCKED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 15), DATEADD('DAY', -10, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 기본기능 테스트 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((30 + (ROW_NUMBER() OVER() % 120)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

-- 실행 2: ict265-exec-002 - 성능 테스트 (완료)  
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec002-', ROW_NUMBER() OVER()),
    'ict265-exec-002',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 25 + 11) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 3 = 2 THEN 'FAIL'
        ELSE 'SKIPPED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 20), DATEADD('DAY', -9, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 성능 테스트 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((45 + (ROW_NUMBER() OVER() % 180)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

-- 실행 3: ict265-exec-003 - 보안 테스트 (완료)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec003-', ROW_NUMBER() OVER()),
    'ict265-exec-003',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 20 + 21) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 5 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 5 = 2 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 5 = 3 THEN 'FAIL'
        WHEN ROW_NUMBER() OVER() % 5 = 4 THEN 'BLOCKED'
        ELSE 'SKIPPED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 10), DATEADD('DAY', -8, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 보안 테스트 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((60 + (ROW_NUMBER() OVER() % 240)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

-- 실행 4: ict265-exec-004 - UI 테스트 (진행중)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec004-', ROW_NUMBER() OVER()),
    'ict265-exec-004',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 15 + 31) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 6 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 6 = 2 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 6 = 3 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 6 = 4 THEN 'FAIL'
        WHEN ROW_NUMBER() OVER() % 6 = 5 THEN 'BLOCKED'
        ELSE 'SKIPPED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 5), DATEADD('DAY', -7, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 UI 테스트 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((25 + (ROW_NUMBER() OVER() % 90)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

-- 실행 5: ict265-exec-005 - 통합 테스트 (진행중)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec005-', ROW_NUMBER() OVER()),
    'ict265-exec-005',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 20 + 41) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'FAIL'
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'BLOCKED'
        ELSE 'SKIPPED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 8), DATEADD('DAY', -6, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 통합 테스트 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((40 + (ROW_NUMBER() OVER() % 160)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

-- 실행 6~12: 나머지 실행들 (각각 100개씩)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec006-', ROW_NUMBER() OVER()),
    'ict265-exec-006',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 30 + 51) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 3 = 2 THEN 'FAIL'
        ELSE 'BLOCKED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 12), DATEADD('DAY', -5, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 회귀 테스트 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((35 + (ROW_NUMBER() OVER() % 100)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

-- 추가 실행들 (exec-007 ~ exec-012) - 각각 100개씩 더 생성

INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec007-', ROW_NUMBER() OVER()),
    'ict265-exec-007',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 25 + 61) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'PASS'  
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'FAIL'
        ELSE 'BLOCKED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 7), DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 테스트 실행 7 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((30 + (ROW_NUMBER() OVER() % 150)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec008-', ROW_NUMBER() OVER()),
    'ict265-exec-008',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 25 + 71) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'PASS'  
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'FAIL'
        ELSE 'BLOCKED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 7), DATEADD('DAY', 0, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 테스트 실행 8 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((30 + (ROW_NUMBER() OVER() % 150)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec009-', ROW_NUMBER() OVER()),
    'ict265-exec-009',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 25 + 81) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'PASS'  
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'FAIL'
        ELSE 'BLOCKED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 7), DATEADD('DAY', 1, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 테스트 실행 9 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((30 + (ROW_NUMBER() OVER() % 150)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec010-', ROW_NUMBER() OVER()),
    'ict265-exec-010',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 25 + 91) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'PASS'  
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'FAIL'
        ELSE 'BLOCKED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 7), DATEADD('DAY', 2, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 테스트 실행 10 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((30 + (ROW_NUMBER() OVER() % 150)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec011-', ROW_NUMBER() OVER()),
    'ict265-exec-011',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 25 + 101) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'PASS'  
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'FAIL'
        ELSE 'BLOCKED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 7), DATEADD('DAY', 3, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 테스트 실행 11 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((30 + (ROW_NUMBER() OVER() % 150)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('result-exec012-', ROW_NUMBER() OVER()),
    'ict265-exec-012',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 25 + 111) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'PASS'  
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'FAIL'
        ELSE 'BLOCKED'
    END,
    DATEADD('MINUTE', -((ROW_NUMBER() OVER() - 1) * 7), DATEADD('DAY', 4, CURRENT_TIMESTAMP)),
    CONCAT('ICT-265 테스트 실행 12 결과 #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((30 + (ROW_NUMBER() OVER() % 150)) AS INT)
FROM (SELECT TOP 100 1 as dummy FROM testcases UNION ALL SELECT 1 FROM test_plans UNION ALL SELECT 1 FROM test_executions) t;

-- 5. 중복 데이터 생성 (ICT-265 검증용)
SELECT 'Creating Duplicate Data for ICT-265 Testing' as info;

-- 같은 execution_id + test_case_id 조합에 대해 다른 시간대의 결과 생성 (중복)
-- ict265-exec-001에 대해 중복 데이터 추가 (30개 테스트케이스에 대해)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('duplicate-exec001-', ROW_NUMBER() OVER()),
    'ict265-exec-001',
    CONCAT('ict265-tc-', LPAD(CAST((ROW_NUMBER() OVER()) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'FAIL'
        WHEN ROW_NUMBER() OVER() % 3 = 2 THEN 'PASS'
        ELSE 'BLOCKED'
    END,
    DATEADD('HOUR', -3, DATEADD('DAY', -10, CURRENT_TIMESTAMP)), -- 3시간 전 (중간 시점)
    CONCAT('ICT-265 중복 테스트 결과 (제거 대상) #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((25 + (ROW_NUMBER() OVER() % 80)) AS INT)
FROM (SELECT TOP 30 1 as dummy FROM testcases) t;

-- 최신 실행 결과 추가 (이것들이 최종 결과로 남아야 함)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('latest-exec001-', ROW_NUMBER() OVER()),
    'ict265-exec-001',
    CONCAT('ict265-tc-', LPAD(CAST((ROW_NUMBER() OVER()) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 2 = 1 THEN 'PASS'
        ELSE 'FAIL'
    END,
    DATEADD('HOUR', 2, DATEADD('DAY', -10, CURRENT_TIMESTAMP)), -- 2시간 후 (최신)
    CONCAT('ICT-265 최신 테스트 결과 (최종 유지) #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((40 + (ROW_NUMBER() OVER() % 100)) AS INT)
FROM (SELECT TOP 25 1 as dummy FROM testcases) t;

-- ict265-exec-005에 대해서도 중복 데이터 생성
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at, execution_time)
SELECT 
    CONCAT('duplicate-exec005-', ROW_NUMBER() OVER()),
    'ict265-exec-005',
    CONCAT('ict265-tc-', LPAD(CAST(((ROW_NUMBER() OVER() - 1) % 20 + 41) AS VARCHAR), 3, '0')),
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'BLOCKED'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'SKIPPED'
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'PASS'
        ELSE 'FAIL'
    END,
    DATEADD('HOUR', -2, DATEADD('DAY', -6, CURRENT_TIMESTAMP)), -- 2시간 전 (중복)
    CONCAT('ICT-265 exec-005 중복 결과 (제거 대상) #', ROW_NUMBER() OVER()),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CAST((35 + (ROW_NUMBER() OVER() % 90)) AS INT)
FROM (SELECT TOP 40 1 as dummy FROM testcases) t;

-- 6. 최종 데이터 생성 완료 및 통계 확인
SELECT '=== ICT-265 대량 테스트 데이터 생성 완료 ===' as final_message;

-- 생성된 데이터 통계
SELECT 'Generated Data Statistics' as info;

SELECT 
    'TestCases' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN name LIKE 'ICT265-%' THEN 1 END) as ict265_count
FROM testcases 
WHERE project_id = '9de93d4e-24e7-4237-9f75-23c1522991a3'

UNION ALL

SELECT 
    'TestPlans' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN name LIKE 'ICT265-%' THEN 1 END) as ict265_count
FROM test_plans 
WHERE project_id = '9de93d4e-24e7-4237-9f75-23c1522991a3'

UNION ALL

SELECT 
    'TestExecutions' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN name LIKE 'ICT265-%' THEN 1 END) as ict265_count
FROM test_executions 
WHERE project_id = '9de93d4e-24e7-4237-9f75-23c1522991a3'

UNION ALL

SELECT 
    'TestResults' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN test_execution_id LIKE 'ict265-%' THEN 1 END) as ict265_count
FROM test_results tr
JOIN test_executions te ON tr.test_execution_id = te.id
WHERE te.project_id = '9de93d4e-24e7-4237-9f75-23c1522991a3';

-- 7. 중복 데이터 분석
SELECT 'Duplicate Data Analysis' as analysis_type;

SELECT 
    test_execution_id,
    test_case_id,
    COUNT(*) as duplicate_count,
    MIN(executed_at) as earliest_execution,
    MAX(executed_at) as latest_execution,
    STRING_AGG(result, ',') as all_results
FROM test_results 
WHERE test_execution_id LIKE 'ict265-exec-%'
GROUP BY test_execution_id, test_case_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 10;

-- 8. ICT-265 중복 제거 검증용 쿼리
SELECT 'ICT-265 Deduplication Verification' as verification_type;

-- 중복 제거 전 총 개수
SELECT 'Before Deduplication' as phase, COUNT(*) as result_count
FROM test_results tr
JOIN test_executions te ON tr.test_execution_id = te.id
WHERE te.project_id = '9de93d4e-24e7-4237-9f75-23c1522991a3'
  AND te.name LIKE 'ICT265-%';

-- 중복 제거 후 개수 (최신 executed_at 기준)
WITH latest_results AS (
    SELECT 
        tr.test_execution_id,
        tr.test_case_id,
        tr.result,
        tr.executed_at,
        ROW_NUMBER() OVER (
            PARTITION BY tr.test_execution_id, tr.test_case_id 
            ORDER BY tr.executed_at DESC
        ) as rn
    FROM test_results tr
    JOIN test_executions te ON tr.test_execution_id = te.id
    WHERE te.project_id = '9de93d4e-24e7-4237-9f75-23c1522991a3'
      AND te.name LIKE 'ICT265-%'
)
SELECT 'After Deduplication' as phase, COUNT(*) as result_count
FROM latest_results 
WHERE rn = 1;

-- 9. 프로젝트별 통계 (ICT-265 대시보드 API 테스트용)
SELECT 'Dashboard API Test Data Ready' as api_test_info;

SELECT 
    '9de93d4e-24e7-4237-9f75-23c1522991a3' as project_id,
    'ICT-265 테스트 데이터 준비 완료' as status,
    COUNT(DISTINCT tc.id) as total_testcases,
    COUNT(DISTINCT tp.id) as total_testplans,
    COUNT(DISTINCT te.id) as total_executions,
    COUNT(tr.id) as total_results,
    COUNT(tr.id) - COUNT(DISTINCT CONCAT(tr.test_execution_id, '|', tr.test_case_id)) as duplicate_results
FROM testcases tc
LEFT JOIN test_plans tp ON tc.project_id = tp.project_id
LEFT JOIN test_executions te ON tc.project_id = te.project_id
LEFT JOIN test_results tr ON te.id = tr.test_execution_id
WHERE tc.project_id = '9de93d4e-24e7-4237-9f75-23c1522991a3'
  AND tc.name LIKE 'ICT265-%';

SELECT 'ICT-265 대량 테스트 데이터 생성 스크립트 완료' as completion_message;
