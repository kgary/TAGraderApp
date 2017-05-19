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
    connectionLimit : 100,
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
                    var temp = [];
                    temp.push(data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11]);
                    row.push(temp)
                })
                .on('end', function(data) {
                    row.splice(0, 1);
                    for (var i = 0; i < row.length; i++) {
                        for (var j = 0; j < row[i].length; j++) {
                            if (row[i][j] == '') {
                                row[i][j] = null;
                            } else if (j === 3 || j === 4) {
                                row[i][j] = parseInt(row[i][j]);

                            } else if (j === row[i].length - 1) {
                                row[i][j] = parseInt(row[i][j]);
                            }
                        }
                        row[i].splice(11, 0, "Incomplete", 0, 0)
                        if (i === row.length - 1) {
                            connection.query('DELETE FROM Schedule_',  function(err2, rows) {
                                if(err2) {
                                    console.log('Error performing query: ' + err2);
                                    throw err2;
                                } else {
                                    connection.query('INSERT INTO Schedule_ (SessionIs, Location, Subject, CatalogNumber, CourseNumber, CourseTitle, Days, StartHours, EndHours, FirstName, LastName, AssignedStatus, TARequiredHours, GraderRequiredHours, EnrollmentNumPrev) VALUES ?', [row], function(err3) { 
                                        if(err3) {
                                            console.log('Error performing query: ' + err3);
                                            res.send({error : 1});
                                        } else {
                                            connection.query('DELETE FROM Student_Request', function(err4) { 
                                                if(err4) {
                                                    console.log('Error performing query: ' + err4);
                                                    throw err4;
                                                } else {
                                                    connection.query('DELETE FROM Placement', function(err5) { 
                                                        if(err5) {
                                                            console.log('Error performing query: ' + err5);
                                                            throw err5;
                                                        } else {
                                                            connection.query('DELETE FROM Enrollment', function(err6) { 
                                                                if(err6) {
                                                                    console.log('Error performing query: ' + err6);
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