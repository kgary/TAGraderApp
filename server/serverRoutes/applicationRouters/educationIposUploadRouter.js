/*
 * File: educationIposUploadRouter.js
 * Description: Processes all requests routed from the server made to /iposUpload
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

// Set up storage of user ipos attachment in file system
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        var uploadPath = '../userUploads/';
        var attachmentsPath = '../userUploads/attachments/';
        var userPath = '../userUploads/attachments/' + req.user.username;
        var iposPath = '../userUploads/attachments/' + req.user.username + '/ipos';
        ensureExists(uploadPath, attachmentsPath, userPath, iposPath, 0744, file.originalname, function(err) {
            if (err) {
                console.log(err)
            }
            else {
                cb(null, iposPath);   
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

// Save ipos attachment information in database
router.post('/', function(req, res) {
    var uploadTime = new Date();
    if (req.files) {
        mysql_pool.getConnection(function(err, connection) {
            if (err) {
                connection.release();
                console.log('Error getting mysql_pool connection: ' + err);
                throw err;
            } else {
                connection.query('SELECT IposName FROM Attachment WHERE ASURITE_ID = ?', [req.user.username], function(err2, rows) {
                    if(err2) {
                        console.log('Error performing query: ' + err2);
                        throw err2;
                    } else if (!rows.length) {
                        connection.query('INSERT INTO Attachment (IposName, IposUploadDate, ASURITE_ID) VALUES (?, ?, ?)', [req.files[0].originalname, uploadTime, req.user.username], function(err3) { 
                            if(err3) {
                                console.log('Error performing query: ' + err3);
                                throw err3;
                            }
                        });
                    } else {
                        connection.query('UPDATE Attachment SET IposName = ?, IposUploadDate = ? WHERE ASURITE_ID = ?', [req.files[0].originalname, uploadTime, req.user.username], function(err4) { 
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
function ensureExists(uploadPath, attachmentsPath, userPath, iposPath, mask, file, cb) {
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
                            fs.mkdir(iposPath, mask, function(err) {
                                if (err && err.code != 'EEXIST') {
                                    cb(err);   
                                } else if (!err || err && err.code == 'EEXIST') {
                                    fs.readdir(iposPath, function(err, files) {
                                        if (err) {
                                            console.log(err);
                                        } else if (files.length > 0) {
                                            for (var i = 0; i < files.length; i++) {
                                                if (files[i] != file) {
                                                    var filePath = iposPath + '/' + files[i];
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