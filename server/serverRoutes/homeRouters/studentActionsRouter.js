/*
 * File: studentActionsRouter.js
 * Description: Processes requests routed from the server made to /getStudentActions. Returns missing missing items from a student's application.
 */

var express  = require('express');
var router = express.Router();
var mysql = require('mysql');

// Invoked for any request passed to this router
router.use(function(req, res, next) {
    next();
});

//  Create mysql connection pool
var mysql_pool  = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'sblDB'
});

router.post('/getStudentActions', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query('SELECT AppStatus FROM Application WHERE ASURITE_ID = ?', [req.body.user], function(err2, rows) {
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            }
            var deadline = 'SELECT CurrentSemester, DeadlineDate FROM Deadline';
            connection.query(deadline, function(err11, deadlineRow) {
                var deadlineInfo = {deadlineSemester:deadlineRow[0].CurrentSemester, deadlineDate:deadlineRow[0].DeadlineDate};     
                if (rows[0].AppStatus === 'new') {                
                    res.send({hasAppActions:0, onProbation:0, deadlineSemester:deadlineRow[0].CurrentSemester, deadlineDate:deadlineRow[0].DeadlineDate});          
                } else {
                    var missingPages = [];               
                    var contactQuery = 'SELECT PhoneNumber, MobileNumber, AddressOne, AddressCountry, AddressCity, AddressState, AddressZip FROM Application WHERE ASURITE_ID = ?';
                    var educationQuery = 'SELECT EducationLevel, GPA, DegreeProgram, isAcademicProbation, isFourPlusOne, FirstSession, GraduationDate FROM Application WHERE ASURITE_ID = ?';
                    var employmentQuery = 'SELECT TimeCommitment, isTA, isGrader, CurrentEmployer, WorkHours, isInternationalStudent, SpeakTest FROM Application WHERE ASURITE_ID = ?';
                    var languageQuery = 'SELECT LanguagesID FROM Languages WHERE ASURITE_ID =  ?';
                    var ideQuery = 'SELECT IDEid FROM IDEs WHERE ASURITE_ID = ?';
                    var toolQuery = 'SELECT ToolID FROM Collaborative_Tools WHERE ASURITE_ID = ?';
                    connection.query('SELECT isContactComplete, isEducationComplete, isEmploymentComplete, isAvailabilityComplete, isLanguagesComplete, isCoursesComplete FROM Application WHERE ASURITE_ID = ?', [req.body.user], function(err3, top) {
                        if (err3) {
                            throw err3;
                        } else {
                            // makes function calls to check page fields and returns missing items and probation status
                            contactCheck(function(data) {
                                if (!!data) {
                                    missingPages.push(data);
                                }
                                educationCheck(function(data) {
                                    if (!!data) {
                                        missingPages.push(data);
                                    }
                                    employmentCheck(function(data) {
                                        if (!!data) {                                      
                                            missingPages.push(data);
                                        }
                                        availabilityCheck(function(data) {
                                            if (!!data) {                                      
                                                missingPages.push(data);
                                            }
                                            languagesCheck(function(data) {
                                                if (!!data) {                                      
                                                    missingPages.push(data);
                                                }
                                                coursesCheck(function(data) {
                                                    if (!!data) {                                      
                                                        missingPages.push(data);
                                                    }
                                                    connection.query('SELECT isAcademicProbation FROM Application WHERE ASURITE_ID = ?', [req.body.user], function(err4, rows) {
                                                        if (err4) {
                                                            throw err4;
                                                        }
                                                        if (!rows[0].isAcademicProbation) {
                                                            rows[0].isAcademicProbation = 0;
                                                        }
                                                        if (!missingPages || missingPages.length > 0) {
                                                            res.send({hasAppActions:1, appActions:missingPages, pageStatuses:top , onProbation:rows[0].isAcademicProbation, deadlineSemester:deadlineRow[0].CurrentSemester, deadlineDate:deadlineRow[0].DeadlineDate});
                                                        } else {
                                                            res.send({hasAppActions:2, onProbation:rows[0].isAcademicProbation,deadlineSemester:deadlineRow[0].CurrentSemester, deadlineDate:deadlineRow[0].DeadlineDate});
                                                        }                                                   
                                                    });                                               
                                                });
                                            });
                                        });
                                    });
                                });
                            });                        

                            // checks if contact page is complete and if not, check missing fields
                            function contactCheck(callback) {
                                if (top[0].isContactComplete === 0 || top[0].isContactComplete === null) { 
                                    connection.query(contactQuery, [req.body.user], function(err4, rows) {
                                        if (err4) {
                                            throw err4;
                                        }                                                                    
                                        callback({page:'Contact', missingItems:checkContactInfo(rows[0])});
                                    });
                                } else {
                                    callback(false);
                                }
                            }

                            // checks if education page is complete and if not, check missing fields
                            function educationCheck(callback) {
                                if (top[0].isEducationComplete === 0 || top[0].isEducationComplete === null) {
                                    connection.query(educationQuery, [req.body.user], function(err5, rows) {
                                        if (err5) {
                                            throw err5;
                                        }     
                                        callback({page:'Education', missingItems:checkEducationInfo(rows[0])});
                                    });
                                } else {
                                    callback(false);
                                }
                            }

                            // checks if employment page is complete and if not, check missing fields
                            function employmentCheck(callback) {
                                if (top[0].isEmploymentComplete === 0 || top[0].isEmploymentComplete === null) {
                                    connection.query(employmentQuery, [req.body.user], function(err6, rows) {
                                        if (err6) {
                                            throw err6;
                                        }                                                                    
                                        callback({page:'Employment', missingItems:checkEmploymentInfo(rows[0])});
                                    });
                                } else {
                                    callback(false);
                                }
                            }

                            // checks if availability page is complete and if not, checks missing fields
                            function availabilityCheck(callback) {
                                if (top[0].isAvailabilityComplete === 0 || top[0].isAvailabilityComplete === null) {
                                    callback({page:'Availability', missingItems:['Select at least one time block']});
                                } else {
                                    callback(false);
                                }
                            }

                            // checks if languages page is complete and if not, checks missing fields
                            function languagesCheck(callback) {
                                var langItems = [];
                                if (top[0].isLanguagesComplete === 0 || top[0].isLanguagesComplete === null) {
                                    connection.query(languageQuery, [req.body.user], function(err7, rows) {
                                        if (err7) {
                                            throw err7;
                                        }
                                        if (rows.length === 0) {
                                            langItems.push('Select or add at least one language');
                                        }
                                        connection.query(ideQuery, [req.body.user], function(err8, rows) {
                                            if (err8) {
                                                throw err8;
                                            }
                                            if (rows.length === 0) {
                                                langItems.push('Select or add at least one IDE');
                                            }
                                            connection.query(toolQuery, [req.body.user], function(err9, rows) {
                                                if (err9) {
                                                    throw err9;
                                                }
                                                if (rows.length === 0) {
                                                    langItems.push('Select or add at least one tool');
                                                }
                                                callback({page:'Languages', missingItems:langItems});
                                            });
                                        });
                                    });           
                                } else {
                                    callback(false);
                                }
                            }

                            // checks if courses page is complete and if not, checks missing fields
                            function coursesCheck(callback) {
                                if (top[0].isCoursesComplete === 0 || top[0].isCoursesComplete === null) {
                                    callback({page:'Courses', missingItems:['Select or add at least one course']});
                                } else {
                                    callback(false);
                                }
                            }
                        } // end else   
                        // checks for missing items for Contact Info page
                        function checkContactInfo(row) {
                            var items = [];
                            if (!row.PhoneNumber) {
                                items.push('Phone Number');
                            }
                            if (!row.MobileNumber) {
                                items.push('Mobile Number');
                            }
                            if (!row.AddressOne) {
                                items.push('First Line of Address');
                            }
                            if (!row.AddressCountry) {
                                items.push('Country');
                            }
                            if (!row.AddressCity) {
                                items.push('City');
                            }
                            if (!row.AddressState) {
                                items.push('State');
                            }
                            if (!row.AddressZip) {
                                items.push('Zip Code');
                            }
                            return items;
                        }

                        // checks missing items for Education page
                        function checkEducationInfo(row) {
                            var items = [];
                            if (!row.EducationLevel) {
                                items.push('Your Degree Program');
                            }
                            if ((row.EducationLevel == 'M.S. Other' || row.EducationLevel == 'Ph.D Other') && !row.DegreeProgram) {
                                items.push('Name of your Degree Program');
                            }
                            if (!row.FirstSession) {
                                items.push('Date your started ASU');
                            }
                            if (!row.GPA) {
                                items.push('GPA');
                            }
                            if (!row.GraduationDate) {
                                items.push('Your expected Graduation Date');
                            }
                            return items;
                        }

                        // checks missing items for Languages page
                        function checkLanguagesInfo(lrows, irows, trows) {
                            var items = [];
                            if (lrows.length == 0) {
                                items.push('Select or add at least one language');
                            }
                            if (irows.length == 0) {
                                items.push('Select or add at least one IDE');
                            }
                            if (trows.length == 0) {
                                items.push('Select or add at least one tool');
                            }
                            return items;
                        }

                        // checks missing items for the Employment page
                        function checkEmploymentInfo(row) {
                            var items =[];
                            if (!row.TimeCommitment) {
                                items.push('Please select the hours you are seeking');
                            }
                            if ((!row.isTA && !row.isGrader) || (row.isTA == 0 && row.isGrader == 0)) {
                                items.push('Select the position you are seeking');
                            }
                            if (row.isInternationalStudent == 1 && row.SpeakTest == null) {
                                items.push('Enter your Speak Test score');
                            }
                            if (row.CurrentEmployer && !row.WorkHours) {
                                items.push('Enter the number of hours you work at your current employer');
                            }
                            if (row.WorkHours && !row.CurrentEmployer) {
                                items.push('You have entered current employer work hours, but you have not entered your current employer');
                            }
                            return items;
                        }

                        // checks deadline
                        function checkDeadline() {
                            connection.query(deadline, function(err10, rows) {
                                if (err10) {
                                    throw err10;
                                }
                                if (rows.length == 0) {
                                    return null;
                                }
                                else {
                                return ({CurrentSemester:rows[0].CurrentSemester, DeadlineDate:rows[0].DeadlineDate});
                                }    
                            });
                        }
                    });                       
                } 
                connection.release();
            });
        });
    });
});
// get any feedback left on the student's application by the PC
router.post('/getApplicationFeedback', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT Feedback.FeedbackText, Feedback.hasComplied FROM Feedback LEFT JOIN Application ON Feedback.AppID = Application.AppID WHERE ASURITE_ID = ?", [req.body.user], function(err2, rows) {
            if(err2) {
                    console.log('Error performing query: ' + err2);
                    throw err2;
            } 
            if (rows[0]) {
                connection.release();
                res.send({feedback:rows[0].FeedbackText, hasComplied:rows[0].hasComplied});
            } else {
                connection.release();
                res.send({feedback:'No feedback from Program Chair'});
            }
        });
    });
});
// saves the hasComplied flag for student application feedback
router.post('/saveFeedbackHasComplied', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("UPDATE Feedback LEFT JOIN Application ON Feedback.AppID = Application.AppID SET Feedback.hasComplied = ? WHERE ASURITE_ID = ?", [req.body.hasComplied, req.body.id], function(err2, rows) {
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } 
            connection.release();
            res.sendStatus(200);
        });
    });
});
module.exports = router;