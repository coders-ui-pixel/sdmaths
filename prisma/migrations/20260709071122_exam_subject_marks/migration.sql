-- CreateTable
CREATE TABLE `ExamSubjectMarks` (
    `id` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `marks` DOUBLE NOT NULL DEFAULT 1,

    UNIQUE INDEX `ExamSubjectMarks_examId_subjectId_key`(`examId`, `subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExamSubjectMarks` ADD CONSTRAINT `ExamSubjectMarks_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `MCQExam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamSubjectMarks` ADD CONSTRAINT `ExamSubjectMarks_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
