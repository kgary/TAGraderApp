/*
 * File: availabilityRouter.js
 * Description: Processes all requests routed from the server made to /availability
 */

var express  = require('express');
var router = express.Router();
var mysql = require('mysql');

// Invoked for any request passed to this router
router.use(function(req, res, next) {
  	next();
});

// Create mysql connection pool
var mysql_pool  = mysql.createPool({
	connectionLimit : 100,
	host            : 'localhost',
	user            : 'root',
	password        : 'root',
	database        : 'sblDB'
});

// Deletes users old availability information and saves their new information
router.post('/', function(req, res) {
	var dateObj = new Date().toISOString().slice(0, 19).replace('T', ' ');
	if (!req.body.user) {
	  	mysql_pool.getConnection(function(err, connection) {
		    if (err) {
		      	connection.release();
		      	console.log('Error getting mysql_pool connection: ' + err);
		      	throw err;
		    }
		    connection.query('DELETE FROM Calendar WHERE ASURITE_ID = ?', [req.user.username], function(err2) {
		        if(err2) {
		        	console.log('Error performing query: ' + err2);
		            throw err2;
		        } else {
		            connection.query('INSERT INTO Calendar (CalendarDay, StartHour, StopHour, ASURITE_ID) VALUES ?', [req.body.availableSlots], function(err3) {  
						if(err3) {
					    	console.log('Error performing query: ' + err3);
					        throw err3;
					    } else {
                            connection.query('UPDATE Application SET isAvailabilityComplete = ?, AppStatus = ?, ModifiedDate = ? WHERE ASURITE_ID = ?', [req.body.isAvailabilityComplete, req.body.appStatus, dateObj, req.user.username], function(err4) {
                                if (err4) {
                                    throw err4;
                                }
                                res.sendStatus(200);
                            });
					    }
					    connection.release();
				    });
		        } 
		    });
	  	});
	} else {
		mysql_pool.getConnection(function(err, connection) {
			if (err) {
		      	connection.release();
		      	console.log('Error getting mysql_pool connection: ' + err);
		      	throw err;
		    }
		    connection.query('DELETE FROM Calendar WHERE ASURITE_ID = ?', [req.user.username], function(err2) {
		    	if(err2) {
		        	console.log('Error performing query: ' + err2);
		            throw err5;
		        } else {
                    connection.query('UPDATE Application SET isAvailabilityComplete = ?, AppStatus = ?, ModifiedDate = ? WHERE ASURITE_ID = ?',[req.body.isAvailabilityComplete, req.body.appStatus, dateObj, req.user.username], function(err3) {
                        if (err3) {
                            throw err3;
                        }
                        res.sendStatus(200);
                    });		        		
		        }
		        connection.release();
		    });
		});
	}
});

// Returns data to populate application page if user already saved availability information
router.get('/', function(req, res) {
  	mysql_pool.getConnection(function(err, connection) {
    	if (err) {
    		connection.release();
      		console.log('Error getting mysql_pool connection: ' + err);
      		throw err;
    	}
    	connection.query('SELECT * FROM Calendar WHERE ASURITE_ID = ?', [req.user.username], function(err2, rows) {
      		if(err2) {
        		console.log('Error performing query: ' + err2);
        		throw err2;
      		} else if (!rows.length) {
        		res.sendStatus(200);
      		} else if (rows[0]) {          
				var data = [];
				for(var i in rows) {    
    				var item = rows[i];   
      				data.push({ 
          				'calendarDay' 	: item.CalendarDay,
          				'startHour'     : item.StartHour 
      				});
    			}
        		res.send({'data' : data});
      		}
      		connection.release();
    	});
  	});
});

module.exports = router;