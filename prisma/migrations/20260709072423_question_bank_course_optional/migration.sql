-- DropForeignKey
ALTER TABLE `mcqquestion` DROP FOREIGN KEY `MCQQuestion_courseId_fkey`;

-- DropIndex
DROP INDEX `MCQQuestion_courseId_fkey` ON `mcqquestion`;

-- AlterTable
ALTER TABLE `mcqquestion` MODIFY `courseId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `MCQQuestion` ADD CONSTRAINT `MCQQuestion_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
