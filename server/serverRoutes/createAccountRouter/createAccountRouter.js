/*
 * File: createAccountRouter.js
 * Description: Processes all requests routed from the server made to /createAccount
 */

var express  = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
const saltRounds = 10;

// invoked for any requested passed to this router
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

// Checks if user already exists, if so alerts user, if not saves account
router.post('/', function(req, res) {
  bcrypt.hash(req.body.UserPassword, saltRounds, function(err, hash) {
    req.body.UserPassword = hash;
    if (req.body.UserPassword === hash) {
      mysql_pool.getConnection(function(err, connection) {
        if (err) {
          connection.release();
          console.log('Error getting mysql_pool connection: ' + err);
          throw err;
        }
        connection.query('SELECT * FROM User_ WHERE ASURITE_ID = ?', [req.body.ASURITE_ID], function(err2, rows) {
          if(err2) {
            console.log('Error performing query: ' + err2);
            throw err2;
          } else if (!rows.length) {
            connection.query('INSERT INTO User_ SET ?', [req.body], function(err2) {
                connection.query('INSERT INTO Application (ASURITE_ID) VALUES (?)', [req.body.ASURITE_ID], function(err3, rows) {
                    if (err3) {
                        console.log('Error performing query: ' + err3);
                        throw err3;
                    }
                });
              if(err2) {
                console.log('Error performing query: ' + err2);
                throw err2;
              } else {     
                res.send({'error' : 0});
              }
            });
          } else if (rows) {
            res.send({'error' : 1});
          }
          connection.release();
        });
      });
    }
  });
});

module.exports = router;