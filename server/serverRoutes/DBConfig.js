var mysql = require('mysql');
//  Create mysql connection pool
var mysql_pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'sblDB'
});

mysql_pool.on('connection', function (connection) {
  console.log('DB Connection established');

  mysql_pool.on('error', function (err) {
    console.error(new Date(), 'MySQL error', err.code);
  });
  mysql_pool.on('close', function (err) {
    console.error(new Date(), 'MySQL close', err);
  });
});

module.exports = mysql_pool;
