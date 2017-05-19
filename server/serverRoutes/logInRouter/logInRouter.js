/*
 * File: logInRouter.js
 * Description: Processes all requests routed from the server made to /login
 */

var express  = require('express');
var router = express.Router();
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

// invoked for any requested passed to this router
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

// Log in authentication
router.post('/', function(req, res) {
  // Get connection to pool
  mysql_pool.getConnection(function(err, connection) {
    if (err) {
      connection.release();
      console.log('Error getting mysql_pool connection: ' + err);
      throw err;
    }
    //  Use connection to query log in credentials
    connection.query('SELECT User_.*, Application.AppStatus FROM User_ LEFT JOIN Application ON ' +
                     'User_.ASURITE_ID = Application.ASURITE_ID WHERE User_.ASURITE_ID = ?', [req.body.username], function(err2, rows){
      if(err2) {
        console.log('Error performing query: ' + err2);
        throw err2;
      } else if (!rows.length) {
        res.send({'error' : 1});  // Responds error 1 if incorrect username
      } else if (rows) {
        checkHash(req.body.password, rows[0].UserPassword, res, req, rows, sendRes);
      }
      connection.release();
    });
  });
});

// Test if user entered password matches hash
function checkHash(enteredPassword, storedPassword, response, request, rows, callback) {
  bcrypt.compare(enteredPassword, storedPassword, function(err, res) {
    callback(response, request, rows, res);
  });
}

function sendRes(response, req, rows, validation) {
  if (validation) {
    var token = jwt.sign({username:req.body.username}, 'sblapp123');
    response.send({'error' : 0, 'firstName' : rows[0].FirstName, 'lastName': rows[0].LastName, 'type': rows[0].UserRole, 
           'appStatus' : rows[0].AppStatus, lastLogin:rows[0].LoginTime.toUTCString(), 'token':token});
    updateLoginDate(req.body.username);  
  } else {
    response.send({'error' : 1}); // Responds error 1 if incorrect passoword
  }
}

// Update users last login date/time
function updateLoginDate (user) {
  var dateObj = new Date();
    mysql_pool.getConnection(function(err, connection) {
    if (err) {
      connection.release();
      console.log('Error getting mysql_pool connection: ' + err);
      throw err;
    }
    connection.query('UPDATE User_ SET LoginTime = ? Where ASURITE_ID = ?', [dateObj, user], function (err2) {
      if (err2) {
        console.log('Error performing query: ' + err2);
        throw err2;
      }
      connection.release();
    });
  }); 
}

module.exports = router;