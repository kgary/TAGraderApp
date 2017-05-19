/*
 * File: studentRouter.js
 * Description: Processes all requests routed from the server made to student
 */

var express  = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');

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

// Gets current password from database
router.post('/', function(req, res) {
    // Get connection to pool
    mysql_pool.getConnection(function(err, connection) {
        if (err) {
            connection.release();
            console.log('Error getting mysql_pool connection: ' + err);
            throw err;
        }
        connection.query('SELECT UserPassword FROM User_ WHERE ASURITE_ID = ?', [req.body.ASURITE_ID], function(err2, rows){
            if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
            } else if (rows[0].UserPassword) {
                checkHash(req.body.CurrentPassword, rows[0].UserPassword, res, req, rows, changePassword);    
            } else {
                res.send({'error' : 1}); // Responds error 1 if user not found
            }
            connection.release();
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
                        if(err2) {
                            console.log('Error performing query: ' + err2);
                            throw err2;
                        } else {
                            response.sendStatus(200); 
                        }
                        connection.release();
                    });
                });
            }
        });

    } else {
        response.send({'error' : 2}); // Responds error 2 if incorrect input of current password
    }
}

module.exports = router;