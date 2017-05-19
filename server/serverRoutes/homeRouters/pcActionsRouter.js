/*
 * File: pcActionsRouter.js
 * Description: Processes requests routed from the server made to /getPCActions. Returns call to action items for the program chair home page.
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

router.post('/', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query("SELECT Location, Subject, CatalogNumber, CourseNumber FROM Schedule_ WHERE AssignedStatus = 'Incomplete'", function(err1, rows) {
            var hasActions = 0;
            var incompleteClasses = [];
            for (var i = 0; i < rows.length; i++) {
                incompleteClasses.push(rows[i]);    
            }
            if (rows.length > 0) {
                hasActions = 1;
            }
            connection.query("SELECT DISTINCT Placement.TA, Placement.TAStatus, Placement.TATwo, Placement.TATwoStatus, Placement.GraderOne, Placement.GraderOneStatus, Placement.GraderTwo, Placement.GraderTwoStatus, Placement.TAHours, Placement.TATwoHours, Placement.GraderOneHours, Placement.GraderTwoHours, Placement.ScheduleID as 'PlacementScheduleID', Schedule_.Location, Schedule_.Subject, Schedule_.CatalogNumber, Schedule_.CourseNumber, Schedule_.TARequiredHours, Schedule_.GraderRequiredHours, Schedule_.ScheduleID as 'ScheduleScheduleID' FROM Placement LEFT JOIN Schedule_ ON Placement.ScheduleID = Schedule_.ScheduleID", function(err2, placementData) {
                connection.query("SELECT ScheduleID, Location, Subject, CatalogNumber, CourseNumber From Schedule_", function(err6, scheduleIDs) {
                    var placements = {};
                    placements = courseTAandGraderChecks(placementData, scheduleIDs);
                    if (placements.missingTA.length > 0 || placements.missingGrader.length > 0 || placements.needTAConfirmation.length > 0 || placements.needGraderConfirmation.length > 0 || placements.needTAHours.length > 0 || placements.needGraderHours.length > 0) {
                        hasActions = 1;
                    }
                    connection.query("SELECT DateCreated FROM Application WHERE DateCreated > ? AND AppStatus != 'new'", [new Date(req.body.lastLogin)], function(err3, apps) { 
                        connection.query("SELECT AppStatus FROM Application WHERE AppStatus = 'incomplete'", function(err4, incompleteCount) {
                            connection.query("SELECT AppStatus FROM Application WHERE AppStatus = 'complete'", function(err5, completeCount) {
                                connection.query("SELECT DeadlineDate FROM Deadline", function(err6, deadlineDate) {
                                   connection.query("SELECT Application.ASURITE_ID, CONCAT(User_.FirstName, ' ', User_.LastName) AS StudentName FROM Application LEFT JOIN Feedback ON Application.AppID = Feedback.AppID LEFT JOIN User_ ON User_.ASURITE_ID = Application.ASURITE_ID WHERE Feedback.hasComplied = 1", function(err7, compliedStudents) {
                                       res.send({hasActions:hasActions, incompleteClasses:incompleteClasses, placements:placements, newApps:apps.length, incompleteApps:incompleteCount.length, completeApps:completeCount.length, deadline:deadlineDate[0].DeadlineDate, compliedStudents:compliedStudents}); 
                                   }); 
                                });
                            });
                        });
                    });
                });
            });
        });        
        connection.release();
    });
    function courseTAandGraderChecks(data, scheduleIDs) {
        var placementIDs = [];
        var coursesMissingPlacements = [];
        var coursesMissingTA = [];
        var coursesMissingGrader = [];
        var coursesNeedTAHours = [];
        var coursesNeedGraderHours = [];
        var coursesNeedTAConfirmation = [];
        var coursesNeedGraderConfirmation = [];
        var firstTAHours;
        var secondTAHours;
        var firstGraderHours;
        var secondGraderHours;
        var hasPlacement;
        
        // searches for course schedules with no placements
        for (var i = 0; i < data.length; i++) {
            placementIDs.push(data[i].PlacementScheduleID);
        }
        for (var i = 0; i < scheduleIDs.length; i++) {
            if (placementIDs.indexOf(scheduleIDs[i].ScheduleID) === -1) {
                coursesMissingPlacements.push({Location:scheduleIDs[i].Location, Subject:scheduleIDs[i].Subject, CatalogNumber:scheduleIDs[i].CatalogNumber, CourseNumber:scheduleIDs[i].CourseNumber});
            }
        }
        // check each entry of schedule and placement with the same schedule id
        for (var i = 0; i < data.length; i++) {
            firstTAHours = 0;
            secondTAHours = 0;
            firstGraderHours = 0;
            secondGraderHours = 0;
            // checks if each course is missing a TA assignment
            // if no TA in place and required TA hours are > 0
            if (data[i].TA === null && data[i].TATwo === null && data[i].TARequiredHours > 0) {
                coursesMissingTA.push({Location:data[i].Location, Subject:data[i].Subject, CatalogNumber:data[i].CatalogNumber, CourseNumber:data[i].CourseNumber});
            }
            // checks if each course is missing a Grader assignment
            // if no Grader in place and required Grader hours are > 0
            if (data[i].GraderOne === null && data[i].GraderTwo === null && data[i].GraderRequiredHours > 0) {
                coursesMissingGrader.push({Location:data[i].Location, Subject:data[i].Subject, CatalogNumber:data[i].CatalogNumber, CourseNumber:data[i].CourseNumber});
            }
            // checks if each course is not meeting the required TA hours
            if (data[i].TARequiredHours !== null) {
                if (data[i].TAHours !== null) {
                    firstTAHours = data[i].TAHours;
                } 
                if (data[i].TATwoHours !== null) {
                    secondTAHours = data[i].TATwoHours;
                }
                var assignedTAHours = firstTAHours + secondTAHours;
                if (assignedTAHours < data[i].TARequiredHours) {
                    coursesNeedTAHours.push({Location:data[i].Location, Subject:data[i].Subject, CatalogNumber:data[i].CatalogNumber, CourseNumber:data[i].CourseNumber});
                }
            }
            // checks if each course is not meeting the required Grader hours
            if (data[i].GraderRequiredHours !== null) {
                if (data[i].GraderOneHours !== null) {
                    firstGraderHours = data[i].GraderOneHours;
                } 
                if (data[i].GraderTwoHours !== null) {
                    secondGraderHours = data[i].GraderTwoHours;
                }
                var assignedGraderHours = firstGraderHours + secondGraderHours;
                if (assignedGraderHours < data[i].GraderRequiredHours) {
                    coursesNeedGraderHours.push({Location:data[i].Location, Subject:data[i].Subject, CatalogNumber:data[i].CatalogNumber, CourseNumber:data[i].CourseNumber});
                }
            }
            // checks if each course has a TA not confirmed            
            if ((data[i].TA !== null && data[i].TAStatus !== 'Confirmed') || (data[i].TATwo !== null && data[i].TATwoStatus !== 'Confirmed')) {
                coursesNeedTAConfirmation.push({Location:data[i].Location, Subject:data[i].Subject, CatalogNumber:data[i].CatalogNumber, CourseNumber:data[i].CourseNumber});
            }
            // checks if each course has a Grader not confirmed            
            if ((data[i].GraderOne !== null && data[i].GraderOneStatus !== 'Confirmed') || (data[i].GraderTwo !== null && data[i].GraderTwoStatus !== 'Confirmed')) {
                coursesNeedGraderConfirmation.push({Location:data[i].Location, Subject:data[i].Subject, CatalogNumber:data[i].CatalogNumber, CourseNumber:data[i].CourseNumber});
            }
        }
        return {missingPlacements:coursesMissingPlacements, missingTA:coursesMissingTA, missingGrader:coursesMissingGrader, needTAHours:coursesNeedTAHours, needGraderHours:coursesNeedGraderHours, needTAConfirmation:coursesNeedTAConfirmation, needGraderConfirmation:coursesNeedGraderConfirmation};
    }
});   
module.exports = router;