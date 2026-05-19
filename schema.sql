-- MySQL Database Schema (Generated from Prisma)
-- Compatible with phpMyAdmin

-- Enum values are typically stored as VARCHAR or ENUM types in MySQL

-- Create Group Table
CREATE TABLE `Group` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `name` VARCHAR(255) UNIQUE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `adminId` INT,
  CONSTRAINT `Group_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Post Table
CREATE TABLE `Post` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `title` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `userId` INT NOT NULL,
  `adminId` INT,
  CONSTRAINT `Post_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Post_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create PostImage Table
CREATE TABLE `PostImage` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `imageUrl` VARCHAR(255) NOT NULL,
  `postId` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `PostImage_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Comment Table
CREATE TABLE `Comment` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `content` LONGTEXT NOT NULL,
  `postId` INT NOT NULL,
  `userId` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create User Table
CREATE TABLE `User` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `firstName` VARCHAR(255) NOT NULL,
  `lastName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `userName` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `avatarSrc` VARCHAR(255),
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bio` LONGTEXT,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `verified_at` TIMESTAMP NULL,
  `verification_token` VARCHAR(255),
  `verification_token_expiry` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create UserGroup Table
CREATE TABLE `UserGroup` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `userId` INT NOT NULL,
  `groupId` INT NOT NULL,
  UNIQUE KEY `UserGroup_userId_groupId_key` (`userId`, `groupId`),
  CONSTRAINT `UserGroup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `UserGroup_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Like Table (post_likes)
CREATE TABLE `post_likes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `userId` INT NOT NULL,
  `post_Id` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  CONSTRAINT `post_likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_likes_post_Id_fkey` FOREIGN KEY (`post_Id`) REFERENCES `Post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Bookmark Table (post_bookmark)
CREATE TABLE `post_bookmark` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `userId` INT NOT NULL,
  `post_Id` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  CONSTRAINT `post_bookmark_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_bookmark_post_Id_fkey` FOREIGN KEY (`post_Id`) REFERENCES `Post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create GroupPost Table
CREATE TABLE `GroupPost` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `groupId` INT NOT NULL,
  `message` LONGTEXT DEFAULT '',
  `userId` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `GroupPost_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group` (`id`) ON DELETE CASCADE,
  CONSTRAINT `GroupPost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Payment Table
CREATE TABLE `Payment` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `userId` INT UNIQUE NOT NULL,
  `reference` VARCHAR(255) UNIQUE NOT NULL,
  `amount` DOUBLE NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
  `channel` VARCHAR(255),
  `currency` VARCHAR(255),
  `subscriptionType` VARCHAR(255),
  `interval` ENUM('ANNUAL', 'MONTHLY') DEFAULT 'MONTHLY',
  `paidAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `metadata` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `authorization_code` VARCHAR(255),
  CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create joinedGroup Table
CREATE TABLE `joinedGroup` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `userId` INT NOT NULL,
  `joinedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `groupId` INT NOT NULL,
  UNIQUE KEY `joinedGroup_userId_groupId_key` (`userId`, `groupId`),
  CONSTRAINT `joinedGroup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `joinedGroup_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Admin Table
CREATE TABLE `Admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `firstName` VARCHAR(255) NOT NULL,
  `lastName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create PasswordToken Table
CREATE TABLE `PasswordToken` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `token` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expiredAt` TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Conversation Table
CREATE TABLE `Conversation` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `type` ENUM('DM', 'GROUP') DEFAULT 'DM',
  `name` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ConversationMember Table
CREATE TABLE `ConversationMember` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `conversationId` INT NOT NULL,
  `userId` INT NOT NULL,
  `isAdmin` BOOLEAN DEFAULT FALSE,
  `joinedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `ConversationMember_conversationId_userId_key` (`conversationId`, `userId`),
  CONSTRAINT `ConversationMember_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ConversationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Message Table
CREATE TABLE `Message` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref` VARCHAR(36) UNIQUE NOT NULL DEFAULT UUID(),
  `body` LONGTEXT NOT NULL,
  `conversationId` INT NOT NULL,
  `senderId` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
