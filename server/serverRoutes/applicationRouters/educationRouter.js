/*
 * File: educationRouter.js
 * Description: Processes all requests routed from the server made to /education
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
    password        : 'sblpass1',
    database        : 'sblDB'
});

// Checks if user already has this information saved then Saves/Updates user entered information into application
router.post('/', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query('SELECT * FROM Application WHERE ASURITE_ID = ?', [req.body.ASURITE_ID], function(err2, rows) { 
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                connection.query('INSERT INTO Application SET ?', [req.body], function(err3) {
                    if(err3) {
                        console.log('Error performing query: ' + err3);
                        throw err3;
                    } else {
                        res.sendStatus(200);
                    }
                });
            } else if (rows[0]) {
                connection.query('UPDATE Application SET ? WHERE ASURITE_ID = ?', [req.body, req.body.ASURITE_ID], function(err4) {
                    if(err4) {
                        console.log('Error performing query: ' + err4);
                        throw err4;
                    } else {
                        res.sendStatus(200);
                    }
                }); 
            }
            connection.release();
        });
    });
});

// Returns data to populate application page if user already saved education information
router.get('/', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query('SELECT Application.EducationLevel, Application.GPA, Application.DegreeProgram, Application.isAcademicProbation, Application.isFourPlusOne, Application.isFullTime, Application.FirstSession, Application.GraduationDate, Attachment.IposName, Attachment.TranscriptName FROM Application LEFT JOIN Attachment ON Application.ASURITE_ID = Attachment.ASURITE_ID WHERE Application.ASURITE_ID = ?', [req.user.username], function(err2, rows) {
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                res.send({'EducationLevel' : rows[0].EducationLevel, 'GPA' : rows[0].GPA, 'DegreeProgram' : rows[0].DegreeProgram, 'isAcademicProbation' : rows[0].isAcademicProbation, 
                          'isFourPlusOne' : rows[0].isFourPlusOne, 'isFullTime' : rows[0].isFullTime, 'FirstSession' : rows[0].FirstSession, 'GraduationDatel' : rows[0].GraduationDate, 'ipos' : rows[0].IposName, 'transcript' : rows[0].TranscriptName});
            } 
            connection.release();
        });
    });
});

module.exports = router;