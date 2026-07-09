-- Add new MCQExam flags
ALTER TABLE `MCQExam`
  ADD COLUMN `isFree` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `isFeaturedOnHome` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `negativeMarking` BOOLEAN NOT NULL DEFAULT false;

-- Add courseId to MCQQuestion as nullable first, so we can backfill existing rows
ALTER TABLE `MCQQuestion` ADD COLUMN `courseId` VARCHAR(191) NULL;

-- Backfill courseId from each question's current exam's linked course
UPDATE `MCQQuestion` q
  INNER JOIN `_CourseExams` ce ON ce.`B` = q.`examId`
  SET q.`courseId` = ce.`A`;

-- Create the new implicit many-to-many join table before dropping the old FK
CREATE TABLE `_ExamQuestions` (
  `A` VARCHAR(191) NOT NULL,
  `B` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `_ExamQuestions_AB_unique`(`A`, `B`),
  INDEX `_ExamQuestions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate existing 1:1 examId links into the new many-to-many join table
INSERT INTO `_ExamQuestions` (`A`, `B`)
  SELECT `examId`, `id` FROM `MCQQuestion`;

ALTER TABLE `_ExamQuestions`
  ADD CONSTRAINT `_ExamQuestions_A_fkey` FOREIGN KEY (`A`) REFERENCES `MCQExam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `_ExamQuestions_B_fkey` FOREIGN KEY (`B`) REFERENCES `MCQQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old direct exam link now that it's captured in the join table
ALTER TABLE `MCQQuestion` DROP FOREIGN KEY `MCQQuestion_examId_fkey`;
ALTER TABLE `MCQQuestion` DROP COLUMN `examId`;

-- courseId is now required
ALTER TABLE `MCQQuestion` MODIFY COLUMN `courseId` VARCHAR(191) NOT NULL;
ALTER TABLE `MCQQuestion` ADD CONSTRAINT `MCQQuestion_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Negative marking produces fractional scores
ALTER TABLE `MCQResult` MODIFY COLUMN `score` DOUBLE NOT NULL;
