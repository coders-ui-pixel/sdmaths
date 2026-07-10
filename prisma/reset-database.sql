-- Wipes all tables in this database so deploy-manual.sql can be run cleanly from scratch.
-- Safe only because this is a brand-new database with no real data yet.
SET FOREIGN_KEY_CHECKS = 0;
SET GROUP_CONCAT_MAX_LEN = 32768;
SET @tables = NULL;
SELECT GROUP_CONCAT('`', table_name, '`') INTO @tables
  FROM information_schema.tables
  WHERE table_schema = DATABASE();
SET @tables = IFNULL(@tables, 'no_tables_found');
SET @drop_sql = CONCAT('DROP TABLE IF EXISTS ', @tables);
PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET FOREIGN_KEY_CHECKS = 1;
