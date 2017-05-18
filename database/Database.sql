-- Database Tables

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- -----------------------------------------------------
-- User Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS User_ (
  ASURITE_ID VARCHAR(45) NOT NULL,
  FirstName VARCHAR(45) NOT NULL,
  MiddleName VARCHAR(45),
  LastName VARCHAR(45) NOT NULL,
  UserEmail VARCHAR(45) NOT NULL,
  UserPassword VARCHAR(200) NOT NULL,
  UserRole VARCHAR(45) NOT NULL,
  RegTime TIMESTAMP NULL,
  isActive TINYINT(1) NOT NULL,
  LoginTime TIMESTAMP NULL,
  PRIMARY KEY (ASURITE_ID)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Student Evaluation Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Student_Evaluation (
  EvaluationID INT NOT NULL AUTO_INCREMENT,
  DateCreated TIMESTAMP,
  QOneScore INT NOT NULL,
  QOneComments TEXT DEFAULT NULL,
  QTwoScore INT NOT NULL,
  QTwoComments TEXT DEFAULT NULL,
  QThreeScore INT NOT NULL,
  QThreeComments TEXT DEFAULT NULL,
  QFourScore INT NOT NULL,
  QFourComments TEXT DEFAULT NULL,
  ASURITE_ID VARCHAR(45) NOT NULL,
  InstructorName VARCHAR(45) NOT NULL,
  PRIMARY KEY (EvaluationID)
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Schedule Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Schedule_ (
  ScheduleID INT NOT NULL AUTO_INCREMENT,
  SessionIs VARCHAR(1),
  Location VARCHAR(45),
  Subject VARCHAR(3),
  CatalogNumber INT,
  CourseNumber INT UNSIGNED,
  CourseTitle VARCHAR(200),
  Days VARCHAR(45),
  StartHours TIME,
  EndHours TIME,
  FirstName VARCHAR(45),
  LastName VARCHAR(45),
  AssignedStatus ENUM ('Complete', 'Incomplete'),
  TARequiredHours INT,
  GraderRequiredHours INT,
  EnrollmentNumPrev INT,
  PRIMARY KEY (ScheduleID)
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Student Request Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Student_Request (
  RequestID INT NOT NULL AUTO_INCREMENT,
  DateCreated TIMESTAMP,
  ScheduleID INT NOT NULL,
  Rank1 VARCHAR(45),
  Rank2 VARCHAR(45),
  PRIMARY KEY (RequestID),
  CONSTRAINT student_request_fk_1 FOREIGN KEY (ScheduleID) 
  REFERENCES Schedule_ (ScheduleID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Placement Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Placement (
  PlaceID INT NOT NULL AUTO_INCREMENT,
  TA VARCHAR(45),
  TAStatus ENUM ('Temporary', 'Pending', 'Confirmed'),
  TATwo VARCHAR(45),
  TATwoStatus ENUM ('Temporary', 'Pending', 'Confirmed'),
  GraderOne VARCHAR(45),
  GraderOneStatus ENUM ('Temporary', 'Pending', 'Confirmed'),
  GraderTwo VARCHAR(45),
  GraderTwoStatus ENUM ('Temporary', 'Pending', 'Confirmed'),
  TAHours INT,
  TATwoHours INT,
  GraderOneHours INT,
  GraderTwoHours INT,
  ScheduleID INT NOT NULL,
  PRIMARY KEY (PlaceID),
  CONSTRAINT placement_fk FOREIGN KEY (ScheduleID) 
  REFERENCES Schedule_ (ScheduleID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Enrollment Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Enrollment (
 EnrollmentID INT NOT NULL AUTO_INCREMENT,
 EnrollmentNumCurrent INT,
 DateEntered Date,
 ScheduleID INT NOT NULL, 
 PRIMARY KEY (EnrollmentID),
 CONSTRAINT enrollment_fk FOREIGN KEY (ScheduleID)
 REFERENCES Schedule_ (ScheduleID)
 ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Application Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Application (
  AppID INT NOT NULL AUTO_INCREMENT,
  PhoneNumber VARCHAR(12) DEFAULT NULL,
  MobileNumber VARCHAR(12) DEFAULT NULL,
  AddressOne VARCHAR(45) DEFAULT NULL,
  AddressTwo VARCHAR(45) DEFAULT NULL,
  AddressCountry VARCHAR(45) DEFAULT NULL,
  AddressCity VARCHAR(45) DEFAULT NULL,
  AddressState VARCHAR(45) DEFAULT NULL,
  AddressZip INT DEFAULT NULL,
  EducationLevel VARCHAR(45) DEFAULT NULL,
  GPA DECIMAL(4,2) DEFAULT NULL,
  DegreeProgram VARCHAR(45) DEFAULT NULL,
  isAcademicProbation TINYINT(1) DEFAULT NULL,
  isFourPlusOne TINYINT(1) DEFAULT NULL,
  isInternationalStudent TINYINT(1) DEFAULT NULL,
  SpeakTest INT DEFAULT NULL,
  FirstSession DATE DEFAULT NULL,
  isFullTime TINYINT(1) DEFAULT NULL,
  GraduationDate VARCHAR(20) DEFAULT NULL,
  TimeCommitment INT DEFAULT NULL,
  isTA TINYINT(1) DEFAULT NULL,
  isGrader TINYINT(1) DEFAULT NULL,
  CurrentEmployer VARCHAR(45) DEFAULT NULL,
  WorkHours INT DEFAULT NULL,
  isWorkedASU TINYINT(1) DEFAULT NULL,
  AppStatus ENUM ('new', 'incomplete', 'complete') DEFAULT 'new',
  DateCreated TIMESTAMP NULL,
  DateSubmitted TIMESTAMP NULL,
  ModifiedDate TIMESTAMP NULL,
  isContactComplete TINYINT(1) DEFAULT NULL,
  isEducationComplete TINYINT(1) DEFAULT NULL,
  isEmploymentComplete TINYINT(1) DEFAULT NULL,
  isAvailabilityComplete TINYINT(1) DEFAULT NULL,
  isLanguagesComplete TINYINT(1) DEFAULT NULL,
  isCoursesComplete TINYINT(1) DEFAULT NULL,
  ASURITE_ID VARCHAR(45) NOT NULL,
  PRIMARY KEY (AppID),
  CONSTRAINT application_fk FOREIGN KEY (ASURITE_ID) 
  REFERENCES User_ (ASURITE_ID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Calendar Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Calendar (
  CalendarID INT NOT NULL AUTO_INCREMENT,
  CalendarDay ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'),
  StartHour TIME,
  StopHour TIME,
  ASURITE_ID VARCHAR(45) NOT NULL,
  PRIMARY KEY (CalendarID),
  CONSTRAINT calendar_fk FOREIGN KEY (ASURITE_ID) 
  REFERENCES Application (ASURITE_ID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Attachment Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Attachment (
  AttachmentID INT NOT NULL AUTO_INCREMENT,
  IposName VARCHAR(45) DEFAULT NULL,
  TranscriptName VARCHAR(45) DEFAULT NULL,
  ResumeName VARCHAR(45) DEFAULT NULL,
  IposUploadDate TIMESTAMP NULL,
  TranscriptUploadDate TIMESTAMP NULL,
  ResumeUploadDate TIMESTAMP NULL,
  ASURITE_ID VARCHAR(45) NOT NULL,
  PRIMARY KEY (AttachmentID),
  CONSTRAINT attachment_fk FOREIGN KEY (ASURITE_ID) 
  REFERENCES Application (ASURITE_ID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Languages Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Languages (
  LanguagesID INT NOT NULL AUTO_INCREMENT,
  isLanguage ENUM ('C', 'C++', 'CSS', 'HTML', 'Java', 'JavaScript', 'JSON', 'Python',
  'SQL', 'Swift', 'Verilog', 'XML') DEFAULT NULL,
  LanguageLevel ENUM ('Expert', 'Proficient', 'Novice') DEFAULT NULL,
  OtherLanguage VARCHAR(45) DEFAULT NULL,
  OtherLevel ENUM ('Expert', 'Proficient', 'Novice') DEFAULT NULL,
  ASURITE_ID VARCHAR(45) NOT NULL,
  PRIMARY KEY (LanguagesID),
  CONSTRAINT languages_fk FOREIGN KEY (ASURITE_ID) 
  REFERENCES Application (ASURITE_ID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- IDEs Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS IDEs (
  IDEid INT NOT NULL AUTO_INCREMENT,
  isIDE ENUM ('Android Studio', 'Brackets', 'IntelliJ', 'NetBeans', 'Xcode') DEFAULT NULL,
  OtherIDE VARCHAR(45) DEFAULT NULL,
  ASURITE_ID VARCHAR(45) NOT NULL,
  PRIMARY KEY (IDEid),
  CONSTRAINT ides_fk FOREIGN KEY (ASURITE_ID) 
  REFERENCES Application (ASURITE_ID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Collaborative Tools Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Collaborative_Tools (
  ToolID INT NOT NULL AUTO_INCREMENT,
  isTool ENUM ('GitHub', 'Taiga', 'Slack') DEFAULT NULL,
  OtherTool VARCHAR(45) DEFAULT NULL,
  ASURITE_ID VARCHAR(45) NOT NULL,
  PRIMARY KEY (ToolID),
  CONSTRAINT collaborative_tools_fk FOREIGN KEY (ASURITE_ID) 
  REFERENCES Application (ASURITE_ID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Course Competencies Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Course_Competencies (
  CompetenciesID INT NOT NULL AUTO_INCREMENT,
  isCourse VARCHAR (45) DEFAULT NULL,
  isPrefer TINYINT(1) DEFAULT NULL,
  isQualified TINYINT(1) DEFAULT NULL,
  isPreviouslyTA TINYINT(1) DEFAULT NULL,
  isPreviouslyGrader TINYINT(1) DEFAULT NULL,
  OtherCourse VARCHAR(200) DEFAULT NULL,
  isOtherPrefer TINYINT(1) DEFAULT NULL,
  isOtherQualified TINYINT(1) DEFAULT NULL,
  isOtherPreviouslyTA TINYINT(1) DEFAULT NULL,
  isOtherPreviouslyGrader TINYINT(1) DEFAULT NULL,
  ASURITE_ID VARCHAR(45) NOT NULL,
  PRIMARY KEY (CompetenciesID),
  CONSTRAINT course_compentencies_fk FOREIGN KEY (ASURITE_ID) 
  REFERENCES Application (ASURITE_ID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Courses Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Courses (
  CourseID INT NOT NULL AUTO_INCREMENT,
  CourseSection VARCHAR (45) NOT NULL,
  CourseName VARCHAR (200) NOT NULL,
  PRIMARY KEY (CourseID)
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Deadline Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Deadline (
  DeadlineID INT NOT NULL AUTO_INCREMENT,
  CurrentSemester ENUM ('Fall', 'Spring', 'Summer') NOT NULL,
  DeadlineDate DATE NOT NULL,
  PRIMARY KEY (DeadlineID)
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- -----------------------------------------------------
-- Feedback Table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Feedback (
  FeedbackID INT NOT NULL AUTO_INCREMENT,
  FeedbackText VARCHAR(500) DEFAULT NULL,
  hasComplied TINYINT(1) DEFAULT NULL,
  AppID INT NOT NULL,
  PRIMARY KEY (FeedbackID),
  CONSTRAINT feedback_fk FOREIGN KEY (AppID)
  REFERENCES Application (AppID)
  ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

ALTER TABLE Application MODIFY COLUMN DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP;