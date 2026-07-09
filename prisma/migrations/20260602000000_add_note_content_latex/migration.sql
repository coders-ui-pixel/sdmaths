-- Add optional inline LaTeX content field to Note model
ALTER TABLE `Note` ADD COLUMN `content` LONGTEXT NULL;
