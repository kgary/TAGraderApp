/*
 * File: employmentRouter.js
 * Description: Processes all requests routed from the server made to /employment
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
        connection.query('SELECT * FROM Application WHERE ASURITE_ID = ?', [req.user.username], function(err2, rows) { 
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
                connection.query('UPDATE Application SET ? WHERE ASURITE_ID = ?', [req.body, req.user.username], function(err4) {
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

// Returns data to populate application page if user already saved employment information
router.get('/', function(req, res) {
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query('SELECT Application.TimeCommitment, Application.isInternationalStudent, Application.SpeakTest, Application.isTA, Application.isGrader, Application.CurrentEmployer, Application.WorkHours, Application.isWorkedASU, Attachment.ResumeName FROM Application LEFT JOIN Attachment ON Application.ASURITE_ID = Attachment.ASURITE_ID WHERE Application.ASURITE_ID = ?', [req.user.username], function(err2, rows) {
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (!rows.length) {
                res.sendStatus(200);
            } else if (rows[0]) {
                res.send({'TimeCommitment' : rows[0].TimeCommitment,'isInternationalStudent' : rows[0].isInternationalStudent, 'SpeakTest' : rows[0].SpeakTest,  'isTA' : rows[0].isTA, 'isGrader' : rows[0].isGrader, 'CurrentEmployer' : rows[0].CurrentEmployer, 'WorkHours' : rows[0].WorkHours, 'isWorkedASU' : rows[0].isWorkedASU, 'resume' : rows[0].ResumeName});
            } 
            connection.release();
        });
    });
});

module.exports = router;