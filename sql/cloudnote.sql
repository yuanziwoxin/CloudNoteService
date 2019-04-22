/**
  create database cloudnote
*/
CREATE DATABASE IF NOT EXISTS `cloudnote`  DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE cloudnote;
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `note`
-- ----------------------------
DROP TABLE IF EXISTS `note`;
CREATE TABLE `note` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`user_id` varchar(50),
	`name` varchar(255),
	`txaddress` varchar(255) DEFAULT NULL,
	PRIMARY KEY(`id`)
) ENGINE = INNODB DEFAULT CHARSET = utf8;