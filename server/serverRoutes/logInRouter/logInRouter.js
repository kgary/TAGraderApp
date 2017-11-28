/*
 * File: logInRouter.js
 * Description: Processes all requests routed from the server made to /login
 */

var express  = require('express');
var router = express.Router();
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
const saltRounds = 10;

// invoked for any requested passed to this router
router.use(function(req, res, next) {
  next();
});

//  Create mysql connection pool
var mysql_pool  = mysql.createPool({
    connectionLimit : 5,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'sblDB'
});

var sendMail = require('gmail-send')({
    user : 'noreplyasuser@gmail.com',
    pass : 'Password#01',
    to : 'test@gmail.com',
    subject : 'Password Reset Link',
    text : 'http://swent1linux.asu.edu:8030/passwordreset'
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

//Getting the recovery security questions.
router.post('/recoverPassword', function(req, res) {
  console.log("recover password received for "+req.body.ASURITE_ID);
      mysql_pool.getConnection(function(err, connection) {
        if (err) {
          connection.release();
          console.log('Error getting mysql_pool connection: ' + err);
          throw err;
        }
        //securityquestion , securityquestion2
        connection.query('SELECT * FROM User_ WHERE ASURITE_ID = ?', [req.body.ASURITE_ID], function(err2, rows) {
          if(err2) {
            console.log('Error performing query: ' + err2);
            throw err2;
          } else if (rows.length > 0) {

            if(rows[0].securityquestion != null && rows[0].securityquestion2 != null)
            {
              console.log("###### security Question is :: "+ rows[0].securityquestion);
              console.log("###### security answer is :: "+ rows[0].securityquestionanswer);
              res.send({'error' : 0,'isSecurityQuestion' : 1,'securityquestion': rows[0].securityquestion , 'securityquestion2':rows[0].securityquestion2,'securityanswer':rows[0].securityquestionanswer,'securityanswer2':rows[0].securityquestionanswer2});
            }
            else
            {
              console.log("Going to send email");
              console.log("email::"+rows[0].UserEmail);
              var body = "Please click on the link to reset your TA Grader Application password\nhttp://swent1linux.asu.edu:8030/#!/passwordreset?access_token="+generateToken(req.body.ASURITE_ID);
          		sendMail({
          		to : rows[0].UserEmail,
          		text : body
            },function (err, resp) {
                  if(err)
                  {
                    console.log("Gmail error :"+err);
                    res.send({'error' : 1, "validated" : 0 , "message" : "Unexpected Error while password recovery, Please contact kgary@asu.edu"});
                  }
                  else if(resp)
                  {
                    console.log("Gmail response:"+resp);
                    res.send({'error' : 0, 'validated' : 1, 'message' : 'Please check your registered email (ASU email) for password reset link'});
                  }
            		});
            }
          } else {
            res.send({'error' : 1,"message" : "Unexpected Error while password recovery, Please contact kgary@asu.edu"});
          }
          connection.release();
        });
      });
});

//Checking if the entered security password is correct or not.
router.post('/retrievePassword', function(req, res) {
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
      } else if (rows.length > 0) {
        if(rows[0].securityquestionanswer === req.body.security_answer1 && rows[0].securityquestionanswer2 === req.body.security_answer2)
        {
          console.log("Email::"+rows[0].UserEmail);
          var body = "Please click on the link to reset your TA Grader Application password\nhttp://swent1linux.asu.edu:8030/#!/passwordreset?access_token="+generateToken(req.body.ASURITE_ID);
          sendMail({
          to : rows[0].UserEmail,
          text : body
        },function (err, resp) {
              if(err)
              {
                console.log("Gmail error :"+err);
                res.send({'error' : 1, "message" : "Unexpected Error while password recovery, Please contact kgary@asu.edu"});
              }
              else if(resp)
              {
                console.log("Gmail response:"+resp);
                res.send({'error' : 0, "verified" : 1, 'message' : 'Please check your registred email (ASU email) for password reset link'});
              }
            });
        }
        else {
          res.send({'error' : 0, "verified" : 0, "message" : "Incorrect responses for security question"});
        }

        console.log("###### security Question is :: "+ rows[0].securityquestion);
        console.log("###### security answer is :: "+ rows[0].securityquestionanswer);
        //res.send({'error' : 0,'securityquestion': rows[0].securityquestion , 'securityquestion2':rows[0].securityquestion2,'securityanswer':rows[0].securityquestionanswer,'securityanswer2':rows[0].securityquestionanswer2});

      } else {
        res.send({'error' : 1, "message" : "Unexpected Error while password recovery, Please contact kgary@asu.edu"});
      }
      connection.release();
    });
  });
});

router.get('/password-reset', function(req, res) {

  var payload = jwt.decode(req.query.access_token, 'sblapp123');
  console.log(payload.username);
  res.send({'error' : 0,'username':payload.username});
});

router.post('/changePassword', function(req, res) {
  bcrypt.hash(req.body.newPassword, saltRounds, function(err, hash) {
    req.body.newPassword = hash;
    if (req.body.newPassword === hash) {
      console.log("gonna reset password");
        mysql_pool.getConnection(function(err, connection) {
            if (err) {
                connection.release();
                console.log('Error getting mysql_pool connection: ' + err);
                throw err;
            }

            connection.query('UPDATE User_ set UserPassword = ? where ASURITE_ID = ?', [req.body.newPassword,req.body.asuID], function(err2) {
                if(err2) {
                    console.log('Error performing query: ' + err2);
                    throw err2;
                } else {
                    res.send({'error':0});
                    }
            });
            connection.release();
        });

    }})

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

function generateToken(asuID)
{
  var token = jwt.sign({username:asuID}, 'sblapp123', {expiresIn: '15m'});
  return token;
}

function sendMail(from, to)
{
	console.log("from::"+from);
	console.log("to::"+to);
  var send = require('gmail-send')({
    user : from,
    pass : 'entrepreneur_01',
    to : 'deepaksn1214@gmail.com',
    subject : 'test subject',
    text : 'http://swent1linux.asu.edu:8030/passwordreset'
  })();
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
