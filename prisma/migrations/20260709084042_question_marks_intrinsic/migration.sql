/*
  Warnings:

  - You are about to drop the `examsubjectmarks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `examsubjectmarks` DROP FOREIGN KEY `ExamSubjectMarks_examId_fkey`;

-- DropForeignKey
ALTER TABLE `examsubjectmarks` DROP FOREIGN KEY `ExamSubjectMarks_subjectId_fkey`;

-- AlterTable
ALTER TABLE `mcqquestion` ADD COLUMN `marks` DOUBLE NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE `examsubjectmarks`;
