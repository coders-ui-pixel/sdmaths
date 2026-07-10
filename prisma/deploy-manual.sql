-- Auto-generated: applies all Prisma migrations directly via SQL, then records them
-- in _prisma_migrations so future `prisma migrate deploy` runs recognize them as applied.
-- Safe to run once against a fresh database that matches this schema history.

CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
    `id` VARCHAR(36) NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `finished_at` DATETIME(3) NULL,
    `migration_name` VARCHAR(255) NOT NULL,
    `logs` TEXT NULL,
    `rolled_back_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4;


-- ===== Migration: 20260523063611_migrateey =====
-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `role` ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `hasMcqs` BOOLEAN NOT NULL DEFAULT true,
    `hasVideos` BOOLEAN NOT NULL DEFAULT true,
    `hasLiveClasses` BOOLEAN NOT NULL DEFAULT false,
    `hasNotes` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Course_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Playlist` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lesson` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `videoUrl` VARCHAR(191) NULL,
    `content` LONGTEXT NULL,
    `isFreeSample` BOOLEAN NOT NULL DEFAULT false,
    `isFeaturedSample` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL,
    `playlistId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MCQExam` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MCQQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `options` JSON NOT NULL,
    `correctOption` INTEGER NOT NULL,
    `explanation` TEXT NULL,
    `explanationVideoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MCQResult` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `total` INTEGER NOT NULL,
    `answers` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MCQResult_userId_examId_key`(`userId`, `examId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportantQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `videoAnswerUrl` VARCHAR(191) NULL,
    `textAnswer` TEXT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Note` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentId` VARCHAR(191) NULL,
    `proofUrl` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `userId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branding` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global',
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'School of Mathematics',
    `logoUrl` VARCHAR(191) NULL,
    `faviconUrl` VARCHAR(191) NULL,
    `paymentQrUrl` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `facebookUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `youtubeUrl` VARCHAR(191) NULL,
    `telegramUrl` VARCHAR(191) NULL,
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#3b82f6',
    `secondaryColor` VARCHAR(191) NOT NULL DEFAULT '#1e40af',
    `heroHeadline` VARCHAR(191) NOT NULL DEFAULT 'Learn Math',
    `heroHighlight` VARCHAR(191) NOT NULL DEFAULT 'Like A Pro',
    `heroSubtitle` TEXT NOT NULL,
    `aboutImageUrl` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Progress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT true,
    `watchTime` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Progress_userId_lessonId_key`(`userId`, `lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeaturedVideo` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `videoUrl` VARCHAR(191) NOT NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `authorName` VARCHAR(191) NOT NULL DEFAULT 'Admin',
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CourseExams` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CourseExams_AB_unique`(`A`, `B`),
    INDEX `_CourseExams_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CoursePlaylists` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CoursePlaylists_AB_unique`(`A`, `B`),
    INDEX `_CoursePlaylists_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_playlistId_fkey` FOREIGN KEY (`playlistId`) REFERENCES `Playlist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MCQQuestion` ADD CONSTRAINT `MCQQuestion_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `MCQExam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MCQResult` ADD CONSTRAINT `MCQResult_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `MCQExam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MCQResult` ADD CONSTRAINT `MCQResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportantQuestion` ADD CONSTRAINT `ImportantQuestion_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Progress` ADD CONSTRAINT `Progress_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Progress` ADD CONSTRAINT `Progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CourseExams` ADD CONSTRAINT `_CourseExams_A_fkey` FOREIGN KEY (`A`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CourseExams` ADD CONSTRAINT `_CourseExams_B_fkey` FOREIGN KEY (`B`) REFERENCES `MCQExam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CoursePlaylists` ADD CONSTRAINT `_CoursePlaylists_A_fkey` FOREIGN KEY (`A`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CoursePlaylists` ADD CONSTRAINT `_CoursePlaylists_B_fkey` FOREIGN KEY (`B`) REFERENCES `Playlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('9d546987-8c38-475f-8944-1d7e9c0fe20c', '7819a7548ebbb0abc36c056242e3ee6cd46a9c111af540d5cbdd43c6cc280368', NOW(3), '20260523063611_migrateey', 1);

-- ===== Migration: 20260524162508_add_isvvi =====
-- AlterTable
ALTER TABLE `ImportantQuestion` ADD COLUMN `isVvi` BOOLEAN NOT NULL DEFAULT false;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('8e8b1e4f-d1c5-4725-8fa4-c40f2f3d258b', '7de8ba74041ea7b1729c4dc438feb02a8e33306c094fb132028fd366eb8e1eed', NOW(3), '20260524162508_add_isvvi', 1);

-- ===== Migration: 20260524164456_add_isvvii =====
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `discountLimit` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `PasswordResetRequest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('cacef053-f277-4d31-a4fa-894b61e870d2', 'fe9d085c7c92e179975f9508f05f290e13df10e9ad235e811d1b08c6d112bcc4', NOW(3), '20260524164456_add_isvvii', 1);

-- ===== Migration: 20260602000000_add_note_content_latex =====
-- Add optional inline LaTeX content field to Note model
ALTER TABLE `Note` ADD COLUMN `content` LONGTEXT NULL;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('b9ff0147-e3d7-4f8b-a35a-9ae1c7860272', 'fc3611da3c48b478009760b3ded9153b192adf6429e82dabc6cb5285c6558eb9', NOW(3), '20260602000000_add_note_content_latex', 1);

-- ===== Migration: 20260708161113_add_phone_and_optional_proof =====
-- AlterTable
ALTER TABLE `payment` MODIFY `proofUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `phone` VARCHAR(191) NULL;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('074b3a1d-7fda-4470-94f1-401e3380bbab', '9a5960dd47ed5e5b577df21e7cad4b437485e7d009e2e47bbbe8698eb46cbbaf', NOW(3), '20260708161113_add_phone_and_optional_proof', 1);

-- ===== Migration: 20260708163247_default_sitename_som =====
-- AlterTable
ALTER TABLE `branding` MODIFY `siteName` VARCHAR(191) NOT NULL DEFAULT 'SOM';
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('84074961-c778-4ea8-9027-877845288816', 'cfcb4a17fc913245b384049c1719817d25fb29bd7f6de85687093e0b04f18117', NOW(3), '20260708163247_default_sitename_som', 1);

-- ===== Migration: 20260708181406_mcq_question_bank_and_negative_marking =====
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
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('975727d0-bf11-4f62-a823-2d397d7db97a', 'a009d532a3baac00a827d3830e1cef0a63b27596bf5a8de02f09835b02425d76', NOW(3), '20260708181406_mcq_question_bank_and_negative_marking', 1);

-- ===== Migration: 20260709024844_course_payment_qr =====
-- AlterTable
ALTER TABLE `course` ADD COLUMN `paymentQrUrl` VARCHAR(191) NULL;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('83694560-8a6d-4dfd-a4ab-0774638b26bd', 'bd1a0c30588e8cb457e10785a972c3bb2d146219ba6a8a6d5d173d99d4b98ffe', NOW(3), '20260709024844_course_payment_qr', 1);

-- ===== Migration: 20260709031629_subjects_live_exams_syllabus_popup =====
-- AlterTable
ALTER TABLE `mcqexam` ADD COLUMN `endTime` DATETIME(3) NULL,
    ADD COLUMN `examType` ENUM('PRACTICE', 'LIVE') NOT NULL DEFAULT 'PRACTICE',
    ADD COLUMN `startTime` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `mcqquestion` ADD COLUMN `subjectId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Subject` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Subject_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Syllabus` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PopupNotice` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `linkUrl` VARCHAR(191) NULL,
    `linkLabel` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MCQQuestion` ADD CONSTRAINT `MCQQuestion_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('142256ec-3a16-4489-8edd-c9fae65d8cb9', '3e9cc6791a2cc176a3b3f09e0ead7df00daee870ca3439d5eb3ff0e7598561a5', NOW(3), '20260709031629_subjects_live_exams_syllabus_popup', 1);

-- ===== Migration: 20260709071122_exam_subject_marks =====
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
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('8caeb87c-32d8-4636-9da0-196ed14149e4', '9abf5a7e71167f19e978f55f5a8d850d3f067958316e7e493bb589820e68d5e5', NOW(3), '20260709071122_exam_subject_marks', 1);

-- ===== Migration: 20260709072423_question_bank_course_optional =====
-- DropForeignKey
ALTER TABLE `mcqquestion` DROP FOREIGN KEY `MCQQuestion_courseId_fkey`;

-- DropIndex
DROP INDEX `MCQQuestion_courseId_fkey` ON `mcqquestion`;

-- AlterTable
ALTER TABLE `mcqquestion` MODIFY `courseId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `MCQQuestion` ADD CONSTRAINT `MCQQuestion_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('37d1ae29-df69-4b56-8d84-58f47306a7fe', '5f308ff229c8cea95f58cd921fe26f8aa0ce7e235a3b50487e46b6942b05b82c', NOW(3), '20260709072423_question_bank_course_optional', 1);

-- ===== Migration: 20260709084042_question_marks_intrinsic =====
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
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('f55749e5-06d6-4b44-9c9e-555b8abd3a43', 'bbd2308ca512254da5208ff3c6aa067894239e910e84aa7f905ea083c5103e2e', NOW(3), '20260709084042_question_marks_intrinsic', 1);

-- ===== Migration: 20260709112948_notes_multi_course_content_based =====
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
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('cfa3b5d9-3c0a-463b-a22e-c23ac5325e55', 'ced93105087a469108b6915a8bb2a1ea0875711f799b1d1bc7f01228fb24fc03', NOW(3), '20260709112948_notes_multi_course_content_based', 1);

-- ===== Migration: 20260709123815_notes_optional_content_pdf_support =====
-- AlterTable
ALTER TABLE `note` MODIFY `content` LONGTEXT NULL;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`)
VALUES ('b20acd4b-2e13-448a-8143-5062abd640a8', 'e20b15b65343da3516c6e05eb9269e4f3f7f32de09e0f4383799ec13d8b66679', NOW(3), '20260709123815_notes_optional_content_pdf_support', 1);
