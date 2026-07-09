/*
  Warnings:

  - You are about to drop the column `courseId` on the `note` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `note` table. All the data in the column will be lost.
  - Made the column `content` on table `note` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `note` DROP FOREIGN KEY `Note_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `note` DROP FOREIGN KEY `Note_lessonId_fkey`;

-- DropIndex
DROP INDEX `Note_courseId_fkey` ON `note`;

-- DropIndex
DROP INDEX `Note_lessonId_fkey` ON `note`;

-- AlterTable
ALTER TABLE `note` DROP COLUMN `courseId`,
    DROP COLUMN `lessonId`,
    MODIFY `fileUrl` VARCHAR(191) NULL,
    MODIFY `content` LONGTEXT NOT NULL;

-- CreateTable
CREATE TABLE `_CourseNotes` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CourseNotes_AB_unique`(`A`, `B`),
    INDEX `_CourseNotes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CourseNotes` ADD CONSTRAINT `_CourseNotes_A_fkey` FOREIGN KEY (`A`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CourseNotes` ADD CONSTRAINT `_CourseNotes_B_fkey` FOREIGN KEY (`B`) REFERENCES `Note`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
