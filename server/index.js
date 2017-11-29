/*
 * File: index.js
 * Description: Creates server and routes requests
 */

'use strict'

var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    expressJWT = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    favicon = require('serve-favicon'),
    directoryToServe = 'client',
//    https = require('https'),  -- not running https internally as running apache proxy in front
    port = 8030;

var app = express();

// Directs to client folder to serve static files
app.use('/', express.static(path.join(__dirname, '..', directoryToServe)));

app.use(express.static(path.join(__dirname, '..', directoryToServe)));

// Directs to angular modules to have modules stored locally
app.use('/angular', express.static(path.join(__dirname, '..', 'node_modules/angular')));
app.use('/angular-route', express.static(path.join(__dirname, '..', 'node_modules/angular-route')));

// Use body Parser for reading sent data
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Use JWT for token authorization
app.use(expressJWT({secret:'sblapp123',
                    getToken: function fromHeaderOrQuerystring (req) {

     if (req.query && req.query.access_token) {
      //console.log(req.query.access_token);
      return req.query.access_token;
    }
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        //console.log("access-token");
        return req.headers.authorization.split(' ')[1];
    }
    return null;
  }}).unless({path:['/', '/login', '/createAccount', '/favicon.ico','/login/recoverPassword','/login/retrievePassword']})); // token secret - not needed for 'unless' routes

//app.get('/passwordreset', express.static(path.join(__dirname, '../client/app/login', 'passwordreset.html')));
app.use('/passwordreset', express.static(path.join(__dirname, '..', directoryToServe)));

// Set up favicon
app.use(favicon(path.join(__dirname, '../client/assets/images', 'asufavicon.ico')));

// Maybe create a seperate file for the routers or other app.use paths and body parser
// Request routers
var logInRouter = require('./serverRoutes/logInRouter/logInRouter.js'),
    createAccountRouter = require('./serverRoutes/createAccountRouter/createAccountRouter.js'),
    contactInfoRouter = require('./serverRoutes/applicationRouters/contactInfoRouter.js'),
    educationRouter = require('./serverRoutes/applicationRouters/educationRouter.js'),
    educationIposUploadRouter = require('./serverRoutes/applicationRouters/educationIposUploadRouter.js'),
    educationTranscriptUploadRouter = require('./serverRoutes/applicationRouters/educationTranscriptUploadRouter.js'),
    employmentRouter = require('./serverRoutes/applicationRouters/employmentRouter.js'),
    employmentResumeUploadRouter = require('./serverRoutes/applicationRouters/employmentResumeUploadRouter.js'),
    availabilityRouter = require('./serverRoutes/applicationRouters/availabilityRouter.js'),
    languagesRouter = require('./serverRoutes/applicationRouters/languagesRouter.js'),
    coursesRouter = require('./serverRoutes/applicationRouters/coursesRouter.js'),
    programChairRouter = require('./serverRoutes/programChairRouters/programChairRouter.js'),
    studentActionsRouter = require('./serverRoutes/homeRouters/studentActionsRouter.js'),
    facultyRouter = require('./serverRoutes/facultyRouter/facultyRouter.js'),
    pcActionsRouter = require('./serverRoutes/homeRouters/pcActionsRouter.js'),
    classScheduleUploadRouter = require('./serverRoutes/programChairRouters/classScheduleUploadRouter.js'),
    administrativeRouter = require('./serverRoutes/administrativeRouter/administrativeRouter.js'),
    studentRouter = require('./serverRoutes/studentRouter/studentRouter.js');

// Use ssl certificate and key - commented out now that we are not doing https
//var httpsOptions = {
//  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
//  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
//};

// Create https server
//https.createServer(httpsOptions, app).listen(port, function () {
//    console.log('Server running at https://tagraderapp.fulton.asu.edu:3443');
//});

app.listen(8030, function () {
   console.log('Example app listening on port 8030!')
});

//  Send requests to correct router
app.use('/login', logInRouter);
app.use('/login', createAccountRouter);
app.use('/login/recoverPassword', logInRouter);
app.use('/login/password-reset', logInRouter);
app.use('/createAccount/retrievePassword', logInRouter);
app.use('/contactInfo', contactInfoRouter);
app.use('/education', educationRouter);
app.use('/iposUpload', educationIposUploadRouter);
app.use('/transcriptUpload', educationTranscriptUploadRouter);
app.use('/employment', employmentRouter);
app.use('/resumeUpload', employmentResumeUploadRouter);
app.use('/availability', availabilityRouter);
app.use('/languages', languagesRouter);
app.use('/courses', coursesRouter);
app.use('/programChair', programChairRouter);
app.use('/programChair/getClassNames', programChairRouter);
app.use('/programChair/getClassInfo', programChairRouter);
app.use('/programChair/getStudentNameHours', programChairRouter);
app.use('/programChair/updateEnrollment', programChairRouter);
app.use('/programChair/updateStatus', programChairRouter);
app.use('/programChair/updateRequiredHours', programChairRouter);
app.use('/programChair/updateAssignedStudents', programChairRouter);
app.use('/programChair/editSchedule', programChairRouter);
app.use('/programChair/saveNewStudents', programChairRouter);
app.use('/programChair/flagApplication', programChairRouter);
app.use('/faculty', facultyRouter);
app.use('/programChair/getDeadline', programChairRouter);
app.use('/programChair/setDeadline', programChairRouter);
app.use('/programChairs/courses', programChairRouter);
app.use('/programChair/scheduleUpload', classScheduleUploadRouter);
app.use('/student', studentActionsRouter);
app.use('/getPCActions', pcActionsRouter);
app.use('/pcSetUserPassword', programChairRouter);
app.use('/administrative', administrativeRouter);
app.use('/adminSetUserPassword', administrativeRouter);
app.use('/facultySetUserPassword', facultyRouter);
app.use('/student/studentSetUserPassword', studentRouter);
app.use('/faculty/facultyGetClassInfo', facultyRouter);
app.use('/faculty/facultyGetRequests', facultyRouter);
app.use('/faculty/facultyGetAssignedStudents', facultyRouter);
app.use('/faculty/makeRequests', facultyRouter);
app.use('/faculty/editRequests', facultyRouter);
