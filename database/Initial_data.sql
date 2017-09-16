-- Initial Data

-- -----------------------------------------------------
-- User Table
-- -----------------------------------------------------
/*INSERT INTO User_ (ASURITE_ID, FirstName, MiddleName, LastName, UserEmail, UserPassword,
UserRole, RegTime, isActive, LoginTime) VALUES
('kgary', 'Kevin', NULL, 'Gary', 'kgary@email.asu.edu',
'$2a$10$3O4KY/eSuVsrxDlrepXXrePJprc.JpesVNW7ECA030ICdeextfncO', 'program chair',
'2017-04-24 00:00:01', 1, '2017-04-24 00:00:01'),
('emallen', 'Betsy', NULL, 'Allen', 'emallen@asu.edu',
'$2a$10$9LtwRA2P4sGhkhQOMsbjbOQ0uO90T357d0IbT0fTYpHRWBkxNi5xe', 'administrative',
'2017-04-24 00:00:01', 1, '2017-04-24 00:00:01');*/

-- -----------------------------------------------------
-- Course Table
-- -----------------------------------------------------
INSERT INTO Courses (CourseID, CourseSection, CourseName) VALUES
(1, 'FSE 100(c)', 'Introduction to Engineering'),
(2, 'ASU 101(c)', 'The ASU Experience'),
(3, 'CSE 110(c)', 'Principles of Programming'),
(4, 'CSE 205(c)', 'Object-Oriented Programming and Data Structures'),
(5, 'SER 215(c)', 'Software Enterprise: Personal Process'),
(6, 'SER 216(c)', 'Software Enterprise: Testing and Quality'),
(7, 'SER 222(c)', 'Design and Analysis of Data Structures and Algorithms'),
(8, 'CSE 230(c)', 'Computer Organization and Assembly Language Programming'),
(9, 'SER 232(c)', 'Computer Systems Fundamentals I'),
(10, 'CSE 240(c)', 'Introduction to Programming Languages'),
(11, 'SER 321', 'Software Systems'),
(12, 'SER 322(c)', 'Database Management'),
(13, 'SER 334(c)', 'Operating Systems and Networks'),
(14, 'SER 401(c)', 'Computing Capstone Project I'),
(15, 'SER 402(c)', 'Computing Capstone Project II'),
(16, 'SER 415(c)', 'Software Enterprise: Inception and Elaboration'),
(17, 'SER 416(c)', 'Software Enterprise: Project and Process Management'),
(18, 'SER 421(c)', 'Web-Based Applications and Mobile Systems'),
(19, 'SER 422(c)', 'Web Application Programming'),
(20, 'SER 423(c)', 'Mobile Systems'),
(21, 'SER 431()', 'Advanced Graphics'),
(22, 'SER 432(c)', 'Game Engine Architecture'),
(23, 'SER 450(c)', 'Computer Architecture'),
(24, 'SER 456(c)', 'Embedded Interfaces: Sensors and Actuators'),
(25, 'SER 486(c)', 'Embedded C Programming'),
(26, 'SER 501(c)', 'Advanced Data Structures and Algorithms'),
(27, 'SER 502(c)', 'Emerging Languages and Programming Paradigms'),
(28, 'SER 515(c)', 'Software Enterprise: Inception and Elaboration'),
(29, 'SER 516(c)', 'Software Enterprise: Project and Process Management'),
(30, 'SER 517(c)', 'Software Factory I'),
(31, 'SER 518(c)', 'Software Factory II');


-- -----------------------------------------------------
-- Deadline Table
-- -----------------------------------------------------
/*INSERT INTO Deadline (DeadlineID, CurrentSemester, DeadlineDate) VALUES
(1, 'Fall', '2017-08-01');*/
