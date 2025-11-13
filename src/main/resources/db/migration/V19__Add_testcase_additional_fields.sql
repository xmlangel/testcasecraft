-- V19__Add_testcase_additional_fields.sql
-- Adds additional metadata columns for test cases and their versions.

ALTER TABLE IF EXISTS testcases
    ADD COLUMN IF NOT EXISTS post_condition TEXT;

ALTER TABLE IF EXISTS testcases
    ADD COLUMN IF NOT EXISTS is_automated BOOLEAN;

ALTER TABLE IF EXISTS testcases
    ADD COLUMN IF NOT EXISTS execution_type VARCHAR(50);

ALTER TABLE IF EXISTS testcases
    ADD COLUMN IF NOT EXISTS test_technique TEXT;


ALTER TABLE IF EXISTS testcase_versions
    ADD COLUMN IF NOT EXISTS post_condition TEXT;

ALTER TABLE IF EXISTS testcase_versions
    ADD COLUMN IF NOT EXISTS is_automated BOOLEAN;

ALTER TABLE IF EXISTS testcase_versions
    ADD COLUMN IF NOT EXISTS execution_type VARCHAR(50);

ALTER TABLE IF EXISTS testcase_versions
    ADD COLUMN IF NOT EXISTS test_technique TEXT;
