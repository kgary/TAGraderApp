/*
 * File: classScheduleUploadRouter.js
 * Description: Processes all requests routed from the server made to /classScheduleUploadRouter
 */

var express  = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require("fs");
var multer  = require('multer');

var csv = require('fast-csv');
var SessionIs = -1;
var location = -1;
var subject = -1;
var catalogNumber = -1;
var courseNumber = -1;
var courseTitle = -1;
var days = -1;
var startHours = -1;
var endHours = -1;
var firstName = -1;
var lastName = -1;
var isColumnSet = false;

// Invoked for any request passed to this router
router.use(function(req, res, next) {
    next();
});

// Set up storage of PC shedule storage in file system
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        var uploadPath = '../userUploads/';
        var schedulePath = '../userUploads/schedule/';
        ensureExists(uploadPath, schedulePath, 0744, file.originalname, function(err) {
            if (err) {
                console.log(err)
            }
            else {
                cb(null, schedulePath);
            }
        });
    },
    filename : function (req, file, cb) {
        cb(null, file.originalname)
    }
});

router.use(multer({storage : storage}).any());

//  Create mysql connection pool
var mysql_pool  = mysql.createPool({
    connectionLimit : 5,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'sblDB'
});

// Save attachment information into database
router.post('/', function(req, res) {
    var row = [];
    var inputFile='../userUploads/schedule/' + req.files[0].originalname;

    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        } else {
            fs.createReadStream(inputFile)
                .pipe(csv())
                .on('error', function() {
                    fs.readdir('../userUploads/schedule/', function(err, files) {
                        if (err) {
                            console.log(err);
                        } else if (files.length > 0) {
                            for (var i = 0; i < files.length; i++) {
                                var filePath = '../userUploads/schedule/' + files[i];
                                fs.unlink(filePath);
                            }
                        }
                    });
                    res.send({error : 1});
                })
                .on('data', function(data) {
                  console.log("FOUND DATA: " + data);
                    var temp = [];
                    if(!isColumnSet)
                    {
                      for(var i=0; i<data.length; i++)
                      {
                        var columnName = data[i].toLowerCase();
                        if(columnName === 'Session'.toLowerCase())
                        {
                          SessionIs = i;
                        }
                        else if(columnName === 'Facility Id'.toLowerCase())
                        {
                          location = i;
                        }
                        else if(columnName === 'Subject'.toLowerCase())
                        {
                          subject = i;
                        }
                        else if(columnName === 'Catalog Nbr'.toLowerCase())
                        {
                          catalogNumber = i;
                        }
                        else if(columnName === 'Class Nbr'.toLowerCase())
                        {
                          courseNumber = i;
                        }
                        else if(columnName === 'Course Title'.toLowerCase())
                        {
                          courseTitle = i;
                        }
                        else if(columnName === 'Days'.toLowerCase())
                        {
                          days = i;
                        }
                        else if(columnName === 'Start Time'.toLowerCase())
                        {
                          startHours = i;
                        }
                        else if(columnName === 'End Time'.toLowerCase())
                        {
                          endHours = i;
                        }
                        else if(columnName === 'Inst First Nm'.toLowerCase())
                        {
                          firstName = i;
                        }
                        else if(columnName === 'Inst Last Nm'.toLowerCase())
                        {
                          lastName = i;
                        }
                      }

                      isColumnSet = true;
                    }

                    for(var i=0; i<data.length; i++)
                    {
                      data[i].trim();
                      if(data[i].length == 0 && (i != courseNumber && i != catalogNumber))
                      {
                        data[i] = '-';
                      }
                      else if(data[i].length == 0 && (i == courseNumber || i == catalogNumber))
                      {
                        data[i] = 0;
                      }

                      if(!isNaN(data[i]))
                      {
                        data[i] = parseInt(data[i]);
                      }


                      if((data[i] != null) && (data[i] != "") && (i == startHours || i == endHours)) //parsing the time correctly and converting to mysql time format.
                      {
                        correctTime = data[i];
                        if((lastIndex = correctTime.search("am")) != -1 || (lastIndex = correctTime.search("AM")) != -1 || (lastIndex = correctTime.search("pm")) != -1  || (lastIndex = correctTime.search("PM")) != -1)
                        {
                            var time = data[i].split(":");
                            if(time[0].length == 1 && time[0] <= 9)
                            {
                                time[0] = '0' + time[0];
                                lastIndex = lastIndex + 1;
                            }

                           correctTime = time.join(":");

                           parsedTime = correctTime.substring(0,lastIndex);

                           data[i] = parsedTime;
                        }
                    }
                  }
                    temp.push(data[0], data[12], data[1], data[2], data[5], data[6], data[11], data[9], data[10], data[14], data[13]);
                    row.push(temp);
                })
                .on('end', function(data) {
                      row.splice(0, 1);
                      for (var i = 0; i < row.length; i++) {
                        // for (var j = 0; j < row[i].length; j++) {
                        //   //console.log(j+"::"+row[i][j]);
                        //     if (row[i][j] == "") {
                        //         row[i][j] = null;
                        //     } else if (j === 3 || j === 4) {
                        //         row[i][j] = parseInt(row[i][j]);
                        //
                        //     } else if(j==) {
                        //
                        //     } else if (j === row[i].length - 1) {
                        //         //row[i][j] = parseInt(row[i][j]);
                        //     }
                        // }

                        row[i].splice(11,0,"Incomplete", 0, 0, 0);

                        if (i === row.length - 1) {
                            connection.query('DELETE FROM Schedule_',  function(err2, rows) {
console.log("PREPARING QUERY: " + rows);
                                if(err2) {
                                    console.log('Error performing query DELETE FROM Schedule_: ' + err2);
                                    throw err2;
                                } else {
                                    connection.query('INSERT INTO Schedule_ (SessionIs, Location, Subject, CatalogNumber, CourseNumber, CourseTitle, Days, StartHours, EndHours, FirstName, LastName, AssignedStatus, TARequiredHours, GraderRequiredHours, EnrollmentNumPrev) VALUES ?', [row], function(err3) {
                                        if(err3) {
                                            console.log('Error performing query INSERT INTO Schedule_: ' + [row] + ' error: ' + err3);
                                            res.send({error : 1});
                                        } else {
                                            connection.query('DELETE FROM Student_Request', function(err4) {
                                                if(err4) {
                                                    console.log('Error performing query DELETE FROM Student_Request: ' + err4);
                                                    throw err4;
                                                } else {
                                                    connection.query('DELETE FROM Placement', function(err5) {
                                                        if(err5) {
                                                            console.log('Error performing query DELETE FROM Placement: ' + err5);
                                                            throw err5;
                                                        } else {
                                                            connection.query('DELETE FROM Enrollment', function(err6) {
                                                                if(err6) {
                                                                    console.log('Error performing query DELETE FROM Enrollment: ' + err6);
                                                                    throw err6;
                                                                } else {
                                                                    res.sendStatus(200);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }

                });

        }
        connection.release();
    });
});

// Ensure file path exists. If not create it, If it does exist delete old files
function ensureExists(uploadPath, schedulePath, mask, file, cb) {
    if (typeof mask == 'function') {
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(uploadPath, mask, function(err) {
        if (err && err.code != 'EEXIST') {
            cb(err);
        } else if (!err || err && err.code == 'EEXIST') {
            fs.mkdir(schedulePath, mask, function(err) {
                if (err && err.code != 'EEXIST') {
                    cb(err);
                } else if (!err || err && err.code == 'EEXIST') {
                    fs.readdir(schedulePath, function(err, files) {
                        if (err) {
                            console.log(err);
                        } else if (files.length > 0) {
                            for (var i = 0; i < files.length; i++) {
                                if (files[i] != file) {
                                    var filePath = schedulePath + '/' + files[i];
                                    fs.unlink(filePath);
                                }
                            }
                        }
                    });
                    cb(null);
                }
            });
        }
    });
}

module.exports = router;
