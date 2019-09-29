-- MySQL Script generated by MySQL Workbench
-- Sat Sep 14 18:21:31 2019
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema site_backend
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `site_backend` ;

-- -----------------------------------------------------
-- Schema site_backend
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `site_backend` DEFAULT CHARACTER SET latin1 ;
USE `site_backend` ;

-- -----------------------------------------------------
-- Table `site_backend`.`tbl_users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `site_backend`.`tbl_users` ;

CREATE TABLE IF NOT EXISTS `site_backend`.`tbl_users` (
  `User_ID` INT(11) NOT NULL AUTO_INCREMENT,
  `Username` VARCHAR(30) NOT NULL,
  `Hashed_Password` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `Name` VARCHAR(45) NOT NULL,
  `Session_ID` VARCHAR(100),
  PRIMARY KEY (`User_ID`),
  UNIQUE INDEX `SECONDARY` (`Username` ASC),
  UNIQUE INDEX `TERTIARY` (`Email` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `site_backend`.`tbl_messages`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `site_backend`.`tbl_messages` ;

CREATE TABLE IF NOT EXISTS `site_backend`.`tbl_messages` (
  `Message_ID` INT(11) NOT NULL AUTO_INCREMENT,
  `Sender_ID` INT(11) NOT NULL,
  `Recipient_ID` INT(11) NOT NULL,
  `Sent` DATETIME NOT NULL,
  `Body` TEXT NOT NULL,
  PRIMARY KEY (`Message_ID`),
  UNIQUE INDEX `SECONDARY` (`Sender_ID` ASC, `Recipient_ID` ASC, `Sent` ASC),
  INDEX `fk_Recipient_User_idx` (`Recipient_ID` ASC),
  CONSTRAINT `fk_Recipient_User`
    FOREIGN KEY (`Recipient_ID`)
    REFERENCES `site_backend`.`tbl_users` (`User_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Sender_User`
    FOREIGN KEY (`Sender_ID`)
    REFERENCES `site_backend`.`tbl_users` (`User_ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = latin1;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
