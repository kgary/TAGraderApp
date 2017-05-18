-- Initial Data

-- -----------------------------------------------------
-- User Table
-- -----------------------------------------------------
INSERT INTO User_ (ASURITE_ID, FirstName, MiddleName, LastName, UserEmail, UserPassword, 
UserRole, RegTime, isActive, LoginTime) VALUES
('kgary', 'Kevin', NULL, 'Gary', 'kgary@email.asu.edu', 
'$2a$10$3O4KY/eSuVsrxDlrepXXrePJprc.JpesVNW7ECA030ICdeextfncO', 'program chair', 
'2017-04-24 00:00:01', 1, '2017-04-24 00:00:01'),
('emallen', 'Betsy', NULL, 'Allen', 'emallen@asu.edu', 
'$2a$10$9LtwRA2P4sGhkhQOMsbjbOQ0uO90T357d0IbT0fTYpHRWBkxNi5xe', 'administrative', 
'2017-04-24 00:00:01', 1, '2017-04-24 00:00:01');

-- -----------------------------------------------------
-- Course Table
-- -----------------------------------------------------
INSERT INTO Courses (CourseID, CourseSection, CourseName) VALUES
(1, 'FSE 100', 'Introduction to Engineering'),
(2, 'ASU 101', 'The ASU Experience'),
(3, 'CSE 110', 'Principles of Programming'),
(4, 'CSE 205', 'Object-Oriented Programming and Data Structures'),
(5, 'SER 215', 'Software Enterprise: Personal Process'),
(6, 'SER 216', 'Software Enterprise: Testing and Quality'),
(7, 'SER 222', 'Design and Analysis of Data Structures and Algorithms'),
(8, 'CSE 230', 'Computer Organization and Assembly Language Programming'),
(9, 'SER 232', 'Computer Systems Fundamentals I'),
(10, 'CSE 240', 'Introduction to Programming Languages'),
(11, 'SER 321', 'Software Systems'),
(12, 'SER 322', 'Database Management'),
(13, 'SER 334', 'Operating Systems and Networks'),
(14, 'SER 401', 'Computing Capstone Project I'),
(15, 'SER 402', 'Computing Capstone Project II'),
(16, 'SER 415', 'Software Enterprise: Inception and Elaboration'),
(17, 'SER 416', 'Software Enterprise: Project and Process Management'),
(18, 'SER 421', 'Web-Based Applications and Mobile Systems'),
(19, 'SER 422', 'Web Application Programming'),
(20, 'SER 423', 'Mobile Systems'),
(21, 'SER 431', 'Advanced Graphics'),
(22, 'SER 432', 'Game Engine Architecture'),
(23, 'SER 450', 'Computer Architecture'),
(24, 'SER 456', 'Embedded Interfaces: Sensors and Actuators'),
(25, 'SER 486', 'Embedded C Programming'),
(26, 'SER 501', 'Advanced Data Structures and Algorithms'),
(27, 'SER 502', 'Emerging Languages and Programming Paradigms'),
(28, 'SER 515', 'Software Enterprise: Inception and Elaboration'),
(29, 'SER 516', 'Software Enterprise: Project and Process Management'),
(30, 'SER 517', 'Software Factory I'),
(31, 'SER 518', 'Software Factory II');   


-- -----------------------------------------------------
-- Deadline Table
-- -----------------------------------------------------
INSERT INTO Deadline (DeadlineID, CurrentSemester, DeadlineDate) VALUES
(1, 'Fall', '2017-08-01');