/*
 * File: administrativeRouter.js
 * Description: Processes all requests routed from the server made to /adminstrative
 */

var express  = require('express');
var router = express.Router();
//var mysql = require('mysql');
var fs = require('fs');
var bcrypt = require('bcrypt');

// Invoked for any request passed to this router
router.use(function(req, res, next) {
    next();
});

//  Create mysql connection pool
// var mysql_pool  = mysql.createPool({
//     connectionLimit : 5,
//     host            : 'localhost',
//     user            : 'root',
//     password        : 'root',
//     database        : 'sblDB'
// });

var mysql_pool = require('../DBConfig.js');

// Get all Students in Database
router.post('/applicationNames', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT concat(FirstName, ' ', LastName) Name, AppStatus, Application.ASURITE_ID From User_ INNER JOIN Application ON User_.ASURITE_ID = Application.ASURITE_ID WHERE UserRole = 'student'", [req.body.course], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var Students = [];
                for (var i = 0; i < rows.length; i++) {
                     var FullName = {
                    'Name'       : rows[i].Name,
                    'AppStatus'  : rows[i].AppStatus,
                    'ASURITE_ID' : rows[i].ASURITE_ID};
                    Students.push(FullName);
                }
                var response = JSON.stringify(Students);
                res.send(response);
            }
        });
    });
});

// Get Student Applications
router.post('/applications', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT concat(FirstName, ' ', LastName) Name, isQualified, isPrefer, isPreviouslyTA, isPreviouslyGrader, GPA, Application.ASURITE_ID From User_ INNER JOIN Course_Competencies ON User_.ASURITE_ID = Course_Competencies.ASURITE_ID INNER JOIN Application ON User_.ASURITE_ID = Application.ASURITE_ID WHERE isCourse = ? AND (isAcademicProbation = 0 OR isAcademicProbation IS NULL) AND AppStatus = 'complete' AND (SpeakTest >= 26 OR SpeakTest IS NULL) AND ((isQualified = 1 OR isPrefer = 1) OR (isPreviouslyGrader = 1 OR isPreviouslyTA = 1)) ORDER BY isQualified DESC, isPrefer DESC, isPreviouslyTA DESC, isPreviouslyGrader DESC, GPA DESC", [req.body.course], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var StudentNames = [];
                for (var i = 0; i < rows.length; i++) {
                     var Student = {
                    'Name'       : rows[i].Name,
                    'ASURITE_ID' : rows[i].ASURITE_ID,
                    'isQualified'        : rows[i].isQualified,
                    'isPrefer'           : rows[i].isPrefer,
                    'isPreviouslyTA'     : rows[i].isPreviouslyTA,
                    'isPreviouslyGrader' : rows[i].isPreviouslyGrader,
                    'GPA'                : rows[i].GPA};
                    StudentNames.push(Student);
                }
                var response = JSON.stringify(StudentNames);
                res.send(response);
            }
        });
    });
});

// Student Contact Info
router.post('/contactInfo', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT concat(FirstName, ' ', LastName) Name, UserEmail, PhoneNumber, MobileNumber, AddressOne, AddressTwo, AddressCountry, AddressCity, AddressState, AddressZip FROM Application INNER JOIN User_ ON Application.ASURITE_ID = User_.ASURITE_ID WHERE Application.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var ContactInfo = {
                    'Name'           : rows[0].Name,
                    'UserEmail'      : rows[0].UserEmail,
                    'PhoneNumber'    : rows[0].PhoneNumber,
                    'MobileNumber'   : rows[0].MobileNumber,
                    'AddressOne'     : rows[0].AddressOne,
                    'AddressTwo'     : rows[0].AddressTwo,
                    'AddressCountry' : rows[0].AddressCountry,
                    'AddressCity'    : rows[0].AddressCity,
                    'AddressState'   : rows[0].AddressState,
                    'AddressZip'     : rows[0].AddressZip};

                var response = JSON.stringify(ContactInfo);
                res.send(response);
            }
        });
    });
});

// Student Application Table
router.post('/applicationTable', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT EducationLevel, DegreeProgram, isFourPlusOne, GPA, isInternationalStudent, SpeakTest, DATE_FORMAT(FirstSession, '%m/%d/%Y') AS FirstSession, GraduationDate, TimeCommitment, isTA, isGrader, CurrentEmployer, WorkHours, isWorkedASU FROM Application INNER JOIN User_ ON Application.ASURITE_ID = User_.ASURITE_ID WHERE Application.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var AppInfo = {
                    'EducationLevel'          : rows[0].EducationLevel,
                    'DegreeProgram'           : rows[0].DegreeProgram,
                    'isFourPlusOne'           : rows[0].isFourPlusOne,
                    'GPA'                     : rows[0].GPA,
                    'isInternationalStudent'  : rows[0].isInternationalStudent,
                    'SpeakTest'               : rows[0].SpeakTest,
                    'FirstSession'            : rows[0].FirstSession,
                    'GraduationDate'          : rows[0].GraduationDate,
                    'TimeCommitment'          : rows[0].TimeCommitment,
                    'isTA'                    : rows[0].isTA,
                    'isGrader'                : rows[0].isGrader,
                    'CurrentEmployer'         : rows[0].CurrentEmployer,
                    'WorkHours'               : rows[0].WorkHours,
                    'isWorkedASU'             : rows[0].isWorkedASU};

                var response = JSON.stringify(AppInfo);
                res.send(response);
            }
        });
    });
});

// Student Languages Table
router.post('/languagesTable', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT isLanguage, LanguageLevel, OtherLanguage, OtherLevel FROM Languages INNER JOIN User_ ON Languages.ASURITE_ID = User_.ASURITE_ID WHERE Languages.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var LanguageInfo = [];
                for (var i = 0; i < rows.length; i++) {
                    var Languages  = {
                    'isLanguage'    : rows[i].isLanguage,
                    'LanguageLevel' : rows[i].LanguageLevel,
                    'OtherLanguage' : rows[i].OtherLanguage,
                    'OtherLevel'    : rows[i].OtherLevel};
                    LanguageInfo.push(Languages);
                }
                var response = JSON.stringify(LanguageInfo);
                res.send(response);
            }
        });
    });
});

// Student IDE Table
router.post('/ideTable', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT isIDE, OtherIDE FROM IDEs INNER JOIN User_ ON IDEs.ASURITE_ID = User_.ASURITE_ID WHERE IDEs.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var IDEInfo = [];
                for (var i = 0; i < rows.length; i++) {
                    var IDEs  = {
                    'isIDE'    : rows[i].isIDE,
                    'OtherIDE' : rows[i].OtherIDE};
                    IDEInfo.push(IDEs);
                }
                var response = JSON.stringify(IDEInfo);
                res.send(response);
            }
        });
    });
});

// Student Collaborative Tools Table
router.post('/toolsTable', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT isTool, OtherTool FROM Collaborative_Tools INNER JOIN User_ ON Collaborative_Tools.ASURITE_ID = User_.ASURITE_ID WHERE Collaborative_Tools.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var ToolInfo = [];
                for (var i = 0; i < rows.length; i++) {
                    var Tools  = {
                    'isTool'    : rows[i].isTool,
                    'OtherTool' : rows[i].OtherTool};
                    ToolInfo.push(Tools);
                }
                var response = JSON.stringify(ToolInfo);
                res.send(response);
            }
        });
    });
});

// Student Course Competencies Table
router.post('/coursesTable', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT isCourse, isPrefer, isQualified, isPreviouslyTA, isPreviouslyGrader, OtherCourse, isOtherPrefer, isOtherQualified, isOtherPreviouslyTA, isOtherPreviouslyGrader FROM Course_Competencies INNER JOIN User_ ON Course_Competencies.ASURITE_ID = User_.ASURITE_ID WHERE Course_Competencies.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var CourseInfo = [];
                for (var i = 0; i < rows.length; i++) {
                    var Courses  = {
                    'isCourse'                : rows[i].isCourse,
                    'isPrefer'                : rows[i].isPrefer,
                    'isQualified'             : rows[i].isQualified,
                    'isPreviouslyTA'          : rows[i].isPreviouslyTA,
                    'isPreviouslyGrader'      : rows[i].isPreviouslyGrader,
                    'OtherCourse'             : rows[i].OtherCourse,
                    'isOtherPrefer'           : rows[i].isOtherPrefer,
                    'isOtherQualified'        : rows[i].isOtherQualified,
                    'isOtherPreviouslyTA'     : rows[i].isOtherPreviouslyTA,
                    'isOtherPreviouslyGrader' : rows[i].isOtherPreviouslyGrader};
                    CourseInfo.push(Courses);
                }
                var response = JSON.stringify(CourseInfo);
                res.send(response);
            }
        });
    });
});

// Student Calendar Table
router.post('/calendarTable', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT CalendarDay, TIME_FORMAT(StartHour, '%h:%i %p') AS StartHour, TIME_FORMAT(StopHour, '%h:%i %p') AS StopHour FROM Calendar INNER JOIN User_ ON Calendar.ASURITE_ID = User_.ASURITE_ID WHERE Calendar.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var CalendarInfo = [];
                for (var i = 0; i < rows.length; i++) {
                    var Calendar  = {
                    'CalendarDay' : rows[i].CalendarDay,
                    'StartHour'   : rows[i].StartHour,
                    'StopHour'    : rows[i].StopHour};
                    CalendarInfo.push(Calendar);
                }
                var response = JSON.stringify(CalendarInfo);
                res.send(response);
            }
        });
    });
});

// Student Attachment Table
router.post('/attachmentTable', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT IposName, TranscriptName, ResumeName, DATE_FORMAT(IposUploadDate, '%m/%d/%Y') AS IposUploadDate, DATE_FORMAT(TranscriptUploadDate, '%m/%d/%Y') AS TranscriptUploadDate, DATE_FORMAT(ResumeUploadDate, '%m/%d/%Y') AS ResumeUploadDate, Attachment.ASURITE_ID FROM Attachment INNER JOIN User_ ON Attachment.ASURITE_ID = User_.ASURITE_ID WHERE Attachment.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                    var AttachmentInfo  = {
                    'ResumeName'           : rows[0].ResumeName,
                    'ResumeUploadDate'     : rows[0].ResumeUploadDate,
                    'TranscriptName'       : rows[0].TranscriptName,
                    'TranscriptUploadDate' : rows[0].TranscriptUploadDate,
                    'IposName'             : rows[0].IposName,
                    'IposUploadDate'       : rows[0].IposUploadDate,
                    'ASURITE_ID'           : rows[0].ASURITE_ID};

                var response = JSON.stringify(AttachmentInfo);
                res.send(response);
            }
        });
    });
});

// View Student's Resume
router.post('/resume', function(req, res) {
    var Resume = '../userUploads/attachments/' + req.body.ID + '/resume/' + req.body.fileName;
    fs.readFile(Resume, function (err, data) {
        res.contentType('application/pdf');
        res.send(data);
    });
});

// View Student's Transcript
router.post('/transcript', function(req, res) {
    var Transcript = '../userUploads/attachments/' + req.body.ID + '/transcript/' + req.body.fileName;
    fs.readFile(Transcript, function (err, data) {
        res.contentType('application/pdf');
        res.send(data);
    });
});

// View Student's iPOS
router.post('/ipos', function(req, res) {
    var Ipos = '../userUploads/attachments/' + req.body.ID + '/ipos/' + req.body.fileName;
    fs.readFile(Ipos, function (err, data) {
        res.contentType('application/pdf');
        res.send(data);
    });
});

// Student Evaluation Table
router.post('/evaluationTable', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT DATE_FORMAT(DateCreated, '%m/%d/%Y') AS DateCreated, InstructorName, QOneScore, QOneComments, QTwoScore, QTwoComments, QThreeScore, QThreeComments, QFourScore, QFourComments FROM Student_Evaluation WHERE Student_Evaluation.ASURITE_ID = ?", [req.body.studentId], function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var EvalInfo = [];
                for (var i = 0; i < rows.length; i++) {
                    var Evals  = {
                    'DateCreated'    : rows[i].DateCreated,
                    'InstructorName' : rows[i].InstructorName,
                    'QOneScore'      : rows[i].QOneScore,
                    'QOneComments'   : rows[i].QOneComments,
                    'QTwoScore'      : rows[i].QTwoScore,
                    'QTwoComments'   : rows[i].QTwoComments,
                    'QThreeScore'    : rows[i].QThreeScore,
                    'QThreeComments' : rows[i].QThreeComments,
                    'QFourScore'     : rows[i].QFourScore,
                    'QFourComments'  : rows[i].QFourComments};
                    EvalInfo.push(Evals);
                }
                var response = JSON.stringify(EvalInfo);
                res.send(response);
            }
        });
    });
});

// Gets Courses from Courses Table
router.get('/courses', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT CourseSection FROM Courses", function(err2, rows) {
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                var CourseInfo = [];
                for (var i = 0; i < rows.length; i++) {
                    var Courses  = {
                    'CourseSection' : rows[i].CourseSection};
                    CourseInfo.push(Courses);
                }
                var sortByProperty = function (property) {
                    return function (x, y) {
                        return ((x[property].substring(4,7) === y[property].substring(4,7)) ? 0 : ((x[property].substring(4,7) > y[property].substring(4,7)) ? 1 : -1));
                    };
                };
                CourseInfo.sort(sortByProperty('CourseSection'));
                var response = JSON.stringify(CourseInfo);
                res.send(response);
            }
        });
    });
});

// Gets current password from database
router.post('/adminSetUserPassword', function(req, res) {
    // Get connection to pool
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query('SELECT UserPassword FROM User_ WHERE ASURITE_ID = ?', [req.body.ASURITE_ID], function(err2, rows){
          connection.release();
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (rows[0]) {
                if (req.body.CurrentPassword) {
                    checkHash(req.body.CurrentPassword, rows[0].UserPassword, res, req, rows, changePassword);
                } else {
                    changePassword(res, req, true);
                }
            } else {
                res.send({'error' : 1}); // Responds error 1 if user not found
            }
        });
    });
});

// Test if user entered current password matches hash
function checkHash(enteredPassword, storedPassword, response, request, rows, callback) {
    bcrypt.compare(enteredPassword, storedPassword, function(err, res) {
        callback(response, request, res);
    });
}

function changePassword(response, req, validation) {
    if (validation) {
        bcrypt.hash(req.body.NewPassword, 10, function(err, hash) {
            req.body.NewPassword = hash;
            if (req.body.NewPassword === hash) {
                mysql_pool.getConnection(function(err, connection) {
                    if (err) {
                        connection.release();
                        console.log('Error getting mysql_pool connection: ' + err);
                        throw err;
                    }
                    connection.query('UPDATE User_ SET UserPassword = ? WHERE ASURITE_ID = ?', [req.body.NewPassword, req.body.ASURITE_ID], function(err2, rows) {
                      connection.release();
                        if(err2) {
                            console.log('Error performing query: ' + err2);
                            throw err2;
                        } else {
                            response.sendStatus(200);
                        }
                    });
                });
            }
        });

    } else {
        response.send({'error' : 2}); // Responds error 2 if incorrect input of current password
    }
}

module.exports = router;
