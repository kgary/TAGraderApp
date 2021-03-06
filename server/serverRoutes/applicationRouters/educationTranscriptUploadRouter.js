/*
 * File: educationTranscriptUploadRouter.js
 * Description: Processes all requests routed from the server made to /transcriptUpload
 */

var express  = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require("fs");
var multer  = require('multer');

// Invoked for any request passed to this router
router.use(function(req, res, next) {
    next();
});

// Set up storage of user transcript attachment in file system
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        var uploadPath = '../userUploads/';
        var attachmentsPath = '../userUploads/attachments/';
        var userPath = '../userUploads/attachments/' + req.user.username;
        var transcriptPath = '../userUploads/attachments/' + req.user.username + '/transcript';
        ensureExists(uploadPath, attachmentsPath, userPath, transcriptPath, 0744, file.originalname, function(err) {
            if (err) {
                console.log(err)
            }
            else {
                cb(null, transcriptPath);   
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

// Save transcript attachment information in database
router.post('/', function(req, res) {
    var uploadTime = new Date();
    if (req.files) {
        mysql_pool.getConnection(function(err, connection) {
            if (err) {
                connection.release();
                console.log('Error getting mysql_pool connection: ' + err);
                throw err;
            } else {
                connection.query('SELECT TranscriptName FROM Attachment WHERE ASURITE_ID = ?', [req.user.username], function(err2, rows) {
                    if(err2) {
                        console.log('Error performing query: ' + err2);
                        throw err2;
                    } else if (!rows.length) {
                        connection.query('INSERT INTO Attachment (TranscriptName, TranscriptUploadDate, ASURITE_ID) VALUES (?, ?, ?)', [req.files[0].originalname, uploadTime, req.user.username], function(err3) { 
                            if(err3) {
                                console.log('Error performing query: ' + err3);
                                throw err3;
                            }
                        });
                    } else {
                        connection.query('UPDATE Attachment SET TranscriptName = ?, TranscriptUploadDate = ? WHERE ASURITE_ID = ?', [req.files[0].originalname, uploadTime, req.user.username], function(err4) { 
                            if(err4) {
                                console.log('Error performing query: ' + err4);
                                throw err4;
                            }
                        });
                    }
                });
            }
        connection.release();
        });
    }
    res.sendStatus(200);
});

// Ensure file path exists. If not create it, If it does exist delete old files
function ensureExists(uploadPath, attachmentsPath, userPath, transcriptPath, mask, file, cb) {
    if (typeof mask == 'function') {
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(uploadPath, mask, function(err) {
        if (err && err.code != 'EEXIST') {
            cb(err); 
        } else if (!err || err && err.code == 'EEXIST') {
            fs.mkdir(attachmentsPath, mask, function(err) {
                if (err && err.code != 'EEXIST') {
                    cb(err);
                } else if (!err || err && err.code == 'EEXIST') {
                    fs.mkdir(userPath, mask, function(err) {
                        if (err && err.code != 'EEXIST') {
                            cb(err);   
                        } else if (!err || err && err.code == 'EEXIST') {
                            fs.mkdir(transcriptPath, mask, function(err) {
                                if (err && err.code != 'EEXIST') {
                                    cb(err);   
                                } else if (!err || err && err.code == 'EEXIST') {
                                    fs.readdir(transcriptPath, function(err, files) {
                                        if (err) {
                                            console.log(err);
                                        } else if (files.length > 0) {
                                            for (var i = 0; i < files.length; i++) {
                                                if (files[i] != file) {
                                                    var filePath = transcriptPath + '/' + files[i];
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
            });
        } 
    });
}

module.exports = router;