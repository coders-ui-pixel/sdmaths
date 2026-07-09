-- AlterTable
ALTER TABLE `payment` MODIFY `proofUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `phone` VARCHAR(191) NULL;
