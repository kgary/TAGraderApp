-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: localhost    Database: sblDB
-- ------------------------------------------------------
-- Server version	5.7.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Application`
--

DROP TABLE IF EXISTS `Application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Application` (
  `AppID` int(11) NOT NULL AUTO_INCREMENT,
  `PhoneNumber` varchar(12) DEFAULT NULL,
  `MobileNumber` varchar(12) DEFAULT NULL,
  `AddressOne` varchar(45) DEFAULT NULL,
  `AddressTwo` varchar(45) DEFAULT NULL,
  `AddressCountry` varchar(45) DEFAULT NULL,
  `AddressCity` varchar(45) DEFAULT NULL,
  `AddressState` varchar(45) DEFAULT NULL,
  `AddressZip` int(11) DEFAULT NULL,
  `EducationLevel` varchar(45) DEFAULT NULL,
  `GPA` decimal(4,2) DEFAULT NULL,
  `DegreeProgram` varchar(45) DEFAULT NULL,
  `isAcademicProbation` tinyint(1) DEFAULT NULL,
  `isFourPlusOne` tinyint(1) DEFAULT NULL,
  `isInternationalStudent` tinyint(1) DEFAULT NULL,
  `SpeakTest` int(11) DEFAULT NULL,
  `FirstSession` date DEFAULT NULL,
  `isFullTime` tinyint(1) DEFAULT NULL,
  `GraduationDate` varchar(20) DEFAULT NULL,
  `TimeCommitment` int(11) DEFAULT NULL,
  `isTA` tinyint(1) DEFAULT NULL,
  `isGrader` tinyint(1) DEFAULT NULL,
  `CurrentEmployer` varchar(45) DEFAULT NULL,
  `WorkHours` int(11) DEFAULT NULL,
  `isWorkedASU` tinyint(1) DEFAULT NULL,
  `AppStatus` enum('new','incomplete','complete') DEFAULT 'new',
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `DateSubmitted` timestamp NULL DEFAULT NULL,
  `ModifiedDate` timestamp NULL DEFAULT NULL,
  `isContactComplete` tinyint(1) DEFAULT NULL,
  `isEducationComplete` tinyint(1) DEFAULT NULL,
  `isEmploymentComplete` tinyint(1) DEFAULT NULL,
  `isAvailabilityComplete` tinyint(1) DEFAULT NULL,
  `isLanguagesComplete` tinyint(1) DEFAULT NULL,
  `isCoursesComplete` tinyint(1) DEFAULT NULL,
  `ASURITE_ID` varchar(45) NOT NULL,
  `rating` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`AppID`),
  KEY `application_fk` (`ASURITE_ID`),
  CONSTRAINT `application_fk` FOREIGN KEY (`ASURITE_ID`) REFERENCES `User_` (`ASURITE_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Attachment`
--

DROP TABLE IF EXISTS `Attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Attachment` (
  `AttachmentID` int(11) NOT NULL AUTO_INCREMENT,
  `IposName` varchar(45) DEFAULT NULL,
  `TranscriptName` varchar(45) DEFAULT NULL,
  `ResumeName` varchar(45) DEFAULT NULL,
  `IposUploadDate` timestamp NULL DEFAULT NULL,
  `TranscriptUploadDate` timestamp NULL DEFAULT NULL,
  `ResumeUploadDate` timestamp NULL DEFAULT NULL,
  `ASURITE_ID` varchar(45) NOT NULL,
  PRIMARY KEY (`AttachmentID`),
  KEY `attachment_fk` (`ASURITE_ID`),
  CONSTRAINT `attachment_fk` FOREIGN KEY (`ASURITE_ID`) REFERENCES `Application` (`ASURITE_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Calendar`
--

DROP TABLE IF EXISTS `Calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Calendar` (
  `CalendarID` int(11) NOT NULL AUTO_INCREMENT,
  `CalendarDay` enum('Monday','Tuesday','Wednesday','Thursday','Friday') DEFAULT NULL,
  `StartHour` time DEFAULT NULL,
  `StopHour` time DEFAULT NULL,
  `ASURITE_ID` varchar(45) NOT NULL,
  PRIMARY KEY (`CalendarID`),
  KEY `calendar_fk` (`ASURITE_ID`),
  CONSTRAINT `calendar_fk` FOREIGN KEY (`ASURITE_ID`) REFERENCES `Application` (`ASURITE_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=163 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Collaborative_Tools`
--

DROP TABLE IF EXISTS `Collaborative_Tools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Collaborative_Tools` (
  `ToolID` int(11) NOT NULL AUTO_INCREMENT,
  `isTool` enum('GitHub','Taiga','Slack') DEFAULT NULL,
  `OtherTool` varchar(45) DEFAULT NULL,
  `ASURITE_ID` varchar(45) NOT NULL,
  PRIMARY KEY (`ToolID`),
  KEY `collaborative_tools_fk` (`ASURITE_ID`),
  CONSTRAINT `collaborative_tools_fk` FOREIGN KEY (`ASURITE_ID`) REFERENCES `Application` (`ASURITE_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Course_Competencies`
--

DROP TABLE IF EXISTS `Course_Competencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Course_Competencies` (
  `CompetenciesID` int(11) NOT NULL AUTO_INCREMENT,
  `isCourse` varchar(45) DEFAULT NULL,
  `isPrefer` tinyint(1) DEFAULT NULL,
  `isQualified` tinyint(1) DEFAULT NULL,
  `isPreviouslyTA` tinyint(1) DEFAULT NULL,
  `isPreviouslyGrader` tinyint(1) DEFAULT NULL,
  `OtherCourse` varchar(200) DEFAULT NULL,
  `isOtherPrefer` tinyint(1) DEFAULT NULL,
  `isOtherQualified` tinyint(1) DEFAULT NULL,
  `isOtherPreviouslyTA` tinyint(1) DEFAULT NULL,
  `isOtherPreviouslyGrader` tinyint(1) DEFAULT NULL,
  `ASURITE_ID` varchar(45) NOT NULL,
  PRIMARY KEY (`CompetenciesID`),
  KEY `course_compentencies_fk` (`ASURITE_ID`),
  CONSTRAINT `course_compentencies_fk` FOREIGN KEY (`ASURITE_ID`) REFERENCES `Application` (`ASURITE_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Courses`
--

DROP TABLE IF EXISTS `Courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Courses` (
  `CourseID` int(11) NOT NULL AUTO_INCREMENT,
  `CourseSection` varchar(45) NOT NULL,
  `CourseName` varchar(200) NOT NULL,
  PRIMARY KEY (`CourseID`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Deadline`
--

DROP TABLE IF EXISTS `Deadline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Deadline` (
  `DeadlineID` int(11) NOT NULL AUTO_INCREMENT,
  `CurrentSemester` enum('Fall','Spring','Summer') NOT NULL,
  `DeadlineDate` date NOT NULL,
  PRIMARY KEY (`DeadlineID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Enrollment`
--

DROP TABLE IF EXISTS `Enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Enrollment` (
  `EnrollmentID` int(11) NOT NULL AUTO_INCREMENT,
  `EnrollmentNumCurrent` int(11) DEFAULT NULL,
  `DateEntered` date DEFAULT NULL,
  `ScheduleID` int(11) NOT NULL,
  PRIMARY KEY (`EnrollmentID`),
  KEY `enrollment_fk` (`ScheduleID`),
  CONSTRAINT `enrollment_fk` FOREIGN KEY (`ScheduleID`) REFERENCES `Schedule_` (`ScheduleID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Feedback`
--

DROP TABLE IF EXISTS `Feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Feedback` (
  `FeedbackID` int(11) NOT NULL AUTO_INCREMENT,
  `FeedbackText` varchar(500) DEFAULT NULL,
  `hasComplied` tinyint(1) DEFAULT NULL,
  `AppID` int(11) NOT NULL,
  PRIMARY KEY (`FeedbackID`),
  KEY `feedback_fk` (`AppID`),
  CONSTRAINT `feedback_fk` FOREIGN KEY (`AppID`) REFERENCES `Application` (`AppID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `IDEs`
--

DROP TABLE IF EXISTS `IDEs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `IDEs` (
  `IDEid` int(11) NOT NULL AUTO_INCREMENT,
  `isIDE` enum('Android Studio','Brackets','IntelliJ','NetBeans','Xcode') DEFAULT NULL,
  `OtherIDE` varchar(45) DEFAULT NULL,
  `ASURITE_ID` varchar(45) NOT NULL,
  PRIMARY KEY (`IDEid`),
  KEY `ides_fk` (`ASURITE_ID`),
  CONSTRAINT `ides_fk` FOREIGN KEY (`ASURITE_ID`) REFERENCES `Application` (`ASURITE_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Languages`
--

DROP TABLE IF EXISTS `Languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Languages` (
  `LanguagesID` int(11) NOT NULL AUTO_INCREMENT,
  `isLanguage` enum('C','C++','CSS','HTML','Java','JavaScript','JSON','Python','SQL','Swift','Verilog','XML') DEFAULT NULL,
  `LanguageLevel` enum('Expert','Proficient','Novice') DEFAULT NULL,
  `OtherLanguage` varchar(45) DEFAULT NULL,
  `OtherLevel` enum('Expert','Proficient','Novice') DEFAULT NULL,
  `ASURITE_ID` varchar(45) NOT NULL,
  PRIMARY KEY (`LanguagesID`),
  KEY `languages_fk` (`ASURITE_ID`),
  CONSTRAINT `languages_fk` FOREIGN KEY (`ASURITE_ID`) REFERENCES `Application` (`ASURITE_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Placement`
--

DROP TABLE IF EXISTS `Placement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Placement` (
  `PlaceID` int(11) NOT NULL AUTO_INCREMENT,
  `TA` varchar(45) DEFAULT NULL,
  `TAStatus` enum('Temporary','Pending','Confirmed') DEFAULT NULL,
  `TATwo` varchar(45) DEFAULT NULL,
  `TATwoStatus` enum('Temporary','Pending','Confirmed') DEFAULT NULL,
  `GraderOne` varchar(45) DEFAULT NULL,
  `GraderOneStatus` enum('Temporary','Pending','Confirmed') DEFAULT NULL,
  `GraderTwo` varchar(45) DEFAULT NULL,
  `GraderTwoStatus` enum('Temporary','Pending','Confirmed') DEFAULT NULL,
  `TAHours` int(11) DEFAULT NULL,
  `TATwoHours` int(11) DEFAULT NULL,
  `GraderOneHours` int(11) DEFAULT NULL,
  `GraderTwoHours` int(11) DEFAULT NULL,
  `ScheduleID` int(11) NOT NULL,
  PRIMARY KEY (`PlaceID`),
  KEY `placement_fk` (`ScheduleID`),
  CONSTRAINT `placement_fk` FOREIGN KEY (`ScheduleID`) REFERENCES `Schedule_` (`ScheduleID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Student_Evaluation`
--

DROP TABLE IF EXISTS `Student_Evaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Student_Evaluation` (
  `EvaluationID` int(11) NOT NULL AUTO_INCREMENT,
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `QOneScore` int(11) NOT NULL,
  `QOneComments` text,
  `QTwoScore` int(11) NOT NULL,
  `QTwoComments` text,
  `QThreeScore` int(11) NOT NULL,
  `QThreeComments` text,
  `QFourScore` int(11) NOT NULL,
  `QFourComments` text,
  `ASURITE_ID` varchar(45) NOT NULL,
  `InstructorName` varchar(45) NOT NULL,
  PRIMARY KEY (`EvaluationID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Student_Request`
--

DROP TABLE IF EXISTS `Student_Request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Student_Request` (
  `RequestID` int(11) NOT NULL AUTO_INCREMENT,
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ScheduleID` int(11) NOT NULL,
  `Rank1` varchar(45) DEFAULT NULL,
  `Rank2` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`RequestID`),
  KEY `student_request_fk_1` (`ScheduleID`),
  CONSTRAINT `student_request_fk_1` FOREIGN KEY (`ScheduleID`) REFERENCES `Schedule_` (`ScheduleID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `schedule_`
--

DROP TABLE IF EXISTS `schedule_`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedule_` (
  `ScheduleID` int(11) NOT NULL AUTO_INCREMENT,
  `SessionIs` varchar(1) DEFAULT NULL,
  `Location` varchar(45) DEFAULT NULL,
  `Subject` varchar(3) DEFAULT NULL,
  `CatalogNumber` varchar(11) DEFAULT NULL,
  `CourseNumber` int(10) unsigned DEFAULT NULL,
  `CourseTitle` varchar(200) DEFAULT NULL,
  `Days` varchar(45) DEFAULT NULL,
  `StartHours` time DEFAULT NULL,
  `EndHours` time DEFAULT NULL,
  `FirstName` varchar(45) DEFAULT NULL,
  `LastName` varchar(45) DEFAULT NULL,
  `AssignedStatus` enum('Complete','Incomplete') DEFAULT NULL,
  `TARequiredHours` int(11) DEFAULT NULL,
  `GraderRequiredHours` int(11) DEFAULT NULL,
  `EnrollmentNumPrev` int(11) DEFAULT NULL,
  PRIMARY KEY (`ScheduleID`)
) ENGINE=InnoDB AUTO_INCREMENT=377 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_`
--

DROP TABLE IF EXISTS `user_`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_` (
  `ASURITE_ID` varchar(45) NOT NULL,
  `FirstName` varchar(45) NOT NULL,
  `MiddleName` varchar(45) DEFAULT NULL,
  `LastName` varchar(45) NOT NULL,
  `UserEmail` varchar(45) NOT NULL,
  `UserPassword` varchar(200) NOT NULL,
  `UserRole` varchar(45) NOT NULL,
  `RegTime` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  `LoginTime` timestamp NULL DEFAULT NULL,
  `securityquestion` varchar(70) DEFAULT NULL,
  `securityquestion2` varchar(70) DEFAULT NULL,
  `securityquestionanswer` varchar(70) DEFAULT NULL,
  `securityquestionanswer2` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`ASURITE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-27 20:36:17
