-- src/test/resources/data/init-test-data.sql
DELETE FROM projects WHERE code LIKE 'AUTO_%';
INSERT INTO projects(id, code, name, description, display_order, created_at, updated_at)
VALUES('d6ebdea6-3da0-4f8b-9493-4b5e6fab55d9', 'PRJ003', '신규 프로젝트', '설명', 1, NOW(), NOW());