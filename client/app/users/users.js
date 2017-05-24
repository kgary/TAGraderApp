'use-strict'
/*
 * users.js used to modularize (module) and control (controllers) all users home page
 * It will control what content is displayed per user and launching of users tasks 
 */

// setup user module
var user = angular.module('app.users', []);

user.controller('studentInfoController', function($scope, $location, $timeout, $http, UserInfoService, StudentActionsService, getFeedback, UserAuthService) {
    // sets application link
    switch(UserInfoService.getAppStatus()) {
        case 'new':
            $scope.link = 'Start Application';
            break;
        case 'incomplete':
            $scope.link = 'Continue Application';
            break;
        default:
            $scope.link = 'Application';
    }
    $scope.status = UserInfoService.getAppStatus();
    $scope.semesterName = StudentActionsService.callTo.deadlineSemester + ' ' + new Date(StudentActionsService.callTo.deadlineDate).getFullYear();
    $scope.deadline = new Date(StudentActionsService.callTo.deadlineDate).toString().substring(0,15);
    if (StudentActionsService.callTo.hasAppActions === 1) {
        for (var i = 0; i < StudentActionsService.callTo.appActions.length; i++) {
            var scopeName = StudentActionsService.callTo.appActions[i].page + '_items'; 
            $scope[scopeName] = StudentActionsService.callTo.appActions[i].missingItems;
        }
    } 
    // set feedback
    $scope.applicationFeedback = getFeedback.data.feedback;
    $scope.hasComplied = getFeedback.data.hasComplied;
    if (getFeedback.data.feedback !== 'No feedback from Program Chair') {
        $scope.hasFeedback = true;
    }
    $scope.saveHasComplied = function() {
        $http.post('/student/saveFeedbackHasComplied',{hasComplied:$scope.hasComplied, id:UserInfoService.getUserId()}).then(function successCallback(response) {
            $scope.saveMessage = 'Save successful!';
            $timeout(function() { 
                $scope.saveMessage = '';
            }, 1500);
        }, function errorCallback(response) {
            //empty
        });       
    }

    $scope.name = UserInfoService.getFullName();   
    
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/studentHome');
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

user.controller('programChairController', function($scope, $http, $location, $route, $timeout, SendClassService, SendStudentService, UserInfoService, PCActionsService, UserAuthService) {
    $scope.name = UserInfoService.getFullName();
    $scope.classes = [];
    $scope.semesterNames = ['Fall', 'Spring', 'Summer'];
    /*
     * This creates the dropdowns for classes missing/needing student assignments, student confirmations,
     * and courses missing assigned hours. The undefined check is there to prevent errors occuring on the
     * class summary page if the page is refreshed.
     */
    if (PCActionsService.callTo.hasActions !== undefined) {
        $scope.incompleteClasses = setClassOptions(PCActionsService.callTo.incompleteClasses);
        $scope.missingPlacementClasses = setClassOptions(PCActionsService.callTo.placements.missingPlacements);
        $scope.missingTAClasses = setClassOptions(PCActionsService.callTo.placements.missingTA);
        $scope.missingGraderClasses = setClassOptions(PCActionsService.callTo.placements.missingGrader);
        $scope.needTAConfirmation = setClassOptions(PCActionsService.callTo.placements.needTAConfirmation);
        $scope.needGraderConfirmation = setClassOptions(PCActionsService.callTo.placements.needGraderConfirmation);
        $scope.needTAHours = setClassOptions(PCActionsService.callTo.placements.needTAHours, true);
        $scope.needGraderHours = setClassOptions(PCActionsService.callTo.placements.needGraderHours, true);
        $scope.names = PCActionsService.callTo.compliedStudents;
    }
    
    angular.element(document).ready(function() {
        SendClassService.setAssignStudentRoute(false);
        $http.get('/programChair/getClassNames').then(function successCallback(response) {
           if (response.data[0].ScheduleID) {
                $scope.classes = setClassOptions(response.data);
                $scope.pcSelectCourse = SendClassService.getClassName();
           }
        }, function errorCallback(response) {
            //TODO
        });
        
        $http.get('programChair/getDeadline').then(function successCallback(response) {
            $scope.deadline = {date:new Date(response.data.date), semester:response.data.semester};
        }, function errorCallback(response) {
            // empty
        });
    });

    $scope.go = function(selectedClass, reload) {
        SendStudentService.clearStudentsToAssign();
        SendClassService.setClassNumber(selectedClass.courseNumber);
        SendClassService.setClassName(selectedClass.class);
        $location.path('/classSummary');
        if (reload) {
            $route.reload();
        }
    }
    
    $scope.saveDeadline = function() {
        $scope.deadlineMessage = '';
        var dateObj = new Date($scope.deadline.date).toISOString().slice(0, 19).replace('T', ' ');
        var data = {semester:$scope.deadline.semester, date:dateObj};
        $http.post('programChair/setDeadline', data).then(function successCallback(response) {
            $scope.deadlineMessage = 'Deadline successfully saved!';
            $timeout(function() { 
                $scope.deadlineMessage = '';
            }, 900);
        }, function errorCallback(response) {
        });
    } 
    
    // adds an indicator to the class name in dropdowns if a class is online and hours needed
    // for classes missing TA/Grader assigned hours
    function setClassOptions(data, hasHours) {
        var options = [];
        for (var i in data) {
            if (data[i].Location === 'ASUOnline') {
                var className = data[i].Subject + ' ' + data[i].CatalogNumber + '*';   
            } else {
                var className = data[i].Subject + ' ' + data[i].CatalogNumber;    
            }
            options.push({'class': className,'courseNumber': data[i].CourseNumber});
        } 
        return options;
    }

    $scope.scheduleFileNameChanged = function(file) {
        if (file[0]) {
            $scope.scheduleInput = file[0].name;
            $scope.uploadErrorMessage = false;
            $scope.$apply();
        }
    }

    $scope.uploadSchedule = function(){
        if ($scope.scheduleFile) {
            var file = $scope.scheduleFile;
            var uploadUrl = "/programChair/scheduleUpload";
            var fd = new FormData();
            fd.append('file', file);

            $http.post(uploadUrl,fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function successCallback(response) {
                if (response.data.error === 1) {
                    $scope.errorMessage = 'Failed to Upload File. Please Upload Properly Formatted .csv File';
                    $scope.uploadErrorMessage = true;   
                } else {
                    $scope.scheduleInput = '';
                    alert("New schedule uploaded successfully!");
                    $route.reload();
                }    
            }, function errorCallback(response) {
                // TO DO
            });   
        } else {
            $scope.errorMessage = 'Please Select a File to Upload';
            $scope.uploadErrorMessage = true; 
        }  
    };

    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/programChairHome');
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

user.controller('facultyController', function($scope, $http, $location, $route, UserInfoService, UserAuthService) {
    $scope.classes = [];
    var facultyClasses = [];
    var facultyRequests = [];
    var assignedStudents = [];
    angular.element(document).ready(function() {  
        var data = { "facultyName" : UserInfoService.getFullName() };
        $http.post('/faculty/facultyGetClassInfo', data).then(function successCallback(response) {
            facultyClasses.push(response.data)
            $scope.getFacultyRequests();
        }, function errorCallback(response) {
            // empty
        });

        
    });

    $scope.getFacultyRequests = function() {
        for (var i = 0; i < facultyClasses[0].length; i++) {
            var scheduleID = { 'scheduleID' : facultyClasses[0][i].ScheduleID };
            $http.post('/faculty/facultyGetRequests', scheduleID).then(function successCallback(response) { 
                $scope.saveRequestInfo(response.data);
            }, function errorCallback(response) {
                //TODO
            });
        }
    }  

    $scope.saveRequestInfo = function(data) {
        facultyRequests.push(data); 
        if (facultyRequests.length === facultyClasses[0].length) {
            $scope.getAssignedStudents();
             
        }
        
    }

    $scope.getAssignedStudents = function() {
        for (var i = 0; i < facultyClasses[0].length; i++) {
            var scheduleID = { 'scheduleID' : facultyClasses[0][i].ScheduleID };
            $http.post('/faculty/facultyGetAssignedStudents', scheduleID).then(function successCallback(response) {
                $scope.saveAssignedInfo(response.data);
            }, function errorCallback(response) {
                //TODO
            });
        }
    }

    $scope.saveAssignedInfo = function(data) {
        assignedStudents.push(data); 
        var holder = [];
        if (assignedStudents.length === facultyClasses[0].length) {
            for (var i = 0; i < facultyClasses[0].length; i++) {
                var studentOne = '';
                var studentTwo = '';
                var ta = '';
                var taTwo = '';
                var graderOne = '';
                var graderTwo = '';
                var taStatus = '';
                var taTwoStatus = '';
                var graderOneStatus = '';
                var graderTwoStatus = '';
                if (facultyRequests[i][0] && facultyRequests[i][0].error) {
                    studentOne = null;
                    studentTwo = null;
                } else if (facultyRequests[i][0] && !facultyRequests[i][0].error) {
                    studentOne = facultyRequests[i][0].Rank1;
                    studentTwo = facultyRequests[i][0].Rank2;
                }
                if (assignedStudents[i].error === 0) {
                    ta = 'None Assigned';
                    taStatus = 'None';
                    taTwo = 'None Assigned';
                    taTwoStatus = 'None';
                    graderOne = 'None Assigned';
                    graderOneStatus = 'None';
                    graderTwo = 'None Assigned';
                    graderTwoStatus = 'None';
                } else {
                    if (assignedStudents[i][0].TA != null) {
                        ta = assignedStudents[i][0].TA;
                        taStatus = assignedStudents[i][0].TAStatus;
                    } else {
                        ta = 'None Assigned';
                        taStatus = 'None';
                    }
                    if (assignedStudents[i][0].TATwo != null) {
                        taTwo = assignedStudents[i][0].TATwo;
                        taTwoStatus = assignedStudents[i][0].TATwoStatus;
                    } else {
                        taTwo = 'None Assigned';
                        taTwoStatus = 'None';
                    }
                    if (assignedStudents[i][0].GraderOne != null) {
                        graderOne = assignedStudents[i][0].GraderOne;
                        graderOneStatus = assignedStudents[i][0].GraderOneStatus;
                    } else {
                        graderOne = 'None Assigned';
                        graderOneStatus = 'None';
                    }
                    if (assignedStudents[i][0].GraderTwo != null) {
                        graderTwo = assignedStudents[i][0].GraderTwo;
                        graderTwoStatus = assignedStudents[i][0].GraderTwoStatus;
                    } else {
                        graderTwo = 'None Assigned';
                        graderTwoStatus = 'None';
                    }
                    studentOne = facultyRequests[i][0].Rank1;
                    studentTwo = facultyRequests[i][0].Rank2;
                }
                var classInfo = {
                    'class' : facultyClasses[0][i].Subject + ' ' + facultyClasses[0][i].CatalogNumber + ' ' +  facultyClasses[0][i].CourseTitle,
                    'ScheduleID' : facultyClasses[0][i].ScheduleID,
                    'studentOne' : studentOne,
                    'studentTwo' : studentTwo,
                    'ta' : ta,
                    'taStatus' : taStatus,
                    'taTwo' : taTwo,
                    'taTwoStatus' : taTwoStatus,
                    'graderOne' : graderOne,
                    'graderOneStatus' : graderOneStatus,
                    'graderTwo' : graderTwo,
                    'graderTwoStatus' : graderTwoStatus 
                }
                holder.push(classInfo);
                if (i === facultyClasses[0].length - 1) {
                    $scope.classes = holder;
                }
            }
        }   
    }

    $scope.go = function(selectedClass) {
        for (var i = 0; i < $scope.classes.length; i++) {
            if (selectedClass === $scope.classes[i].ScheduleID) {
                $scope.classTitle = $scope.classes[i].class;
		// KG added
		$scope.classScheduleID = $scope.classes[i].ScheduleID;
                $scope.studentOne = $scope.classes[i].studentOne;
                $scope.studentTwo = $scope.classes[i].studentTwo;
                $scope.ta = $scope.classes[i].ta;
                $scope.taStatus = $scope.classes[i].taStatus;
                $scope.taTwo = $scope.classes[i].taTwo;
                $scope.taTwoStatus = $scope.classes[i].taTwoStatus;
                $scope.graderOne = $scope.classes[i].graderOne;
                $scope.graderOneStatus = $scope.classes[i].graderOneStatus;
                $scope.graderTwo = $scope.classes[i].graderTwo;
                $scope.graderTwoStatus = $scope.classes[i].graderTwoStatus;
                $scope.showClass = true;
            }
        }   
    }

    $scope.refresh = function(id) {
        for (var i = 0; i < $scope.classes.length; i++) {
            if (id === $scope.classes[i].ScheduleID) {
                $scope.classes[i].studentOne = $scope.studentOne;
                $scope.classes[i].studentTwo = $scope.studentTwo;
                $scope.go(id);
            }
        }
    }


    $scope.saveNewRequests = function(id) {
        var requestResponse = [];
        if ($scope.studentOne === '') {
            $scope.studentOne = null;
        }
        if ($scope.studentTwo === '') {
            $scope.studentTwo = null;
        }
        var studentRequest = { 'studentOne' : $scope.studentOne, 'ScheduleID' : id};
        $http.post('/faculty/makeRequests', studentRequest).then(function successCallback(response) {
            requestResponse.push(response.data);
            var studentRequest = { 'studentTwo' : $scope.studentTwo, 'ScheduleID' : id};
            $http.post('/faculty/makeRequests', studentRequest).then(function successCallback(response) {
                requestResponse.push(response.data);
                if (requestResponse[0].length === 0 && requestResponse[1].length === 0) {
                    alert('You have successfully requested ' + $scope.studentOne + ' and ' + $scope.studentTwo);
                    $scope.refresh(id);
                } else if (requestResponse[0].length === 0 && requestResponse[1].length != 0 && $scope.studentTwo != null) {
                    alert('You have successfully requested ' + $scope.studentOne + '.\nBut ' + $scope.studentTwo + ' is not a registered user.\nPlease ensure ASURITE ID is correct or contact ' + $scope.studentTwo + ' and have them complete an application');
                    $scope.studentTwo = null;
                    $scope.refresh(id);
                } else if (requestResponse[0].length === 0 && requestResponse[1].length != 0 && $scope.studentTwo === null) {
                    alert('You have successfully requested ' + $scope.studentOne);
                    $scope.studentTwo = null;
                    $scope.refresh(id);
                } else if (requestResponse[0].length != 0 && requestResponse[1].length === 0 && $scope.studentOne != null) {
                    var studentRequest = { 'studentOne' : $scope.studentTwo, 'ScheduleID' : id};
                    if (confirm('You have successfully requested ' + $scope.studentTwo + '.\nBut ' + $scope.studentOne + ' is not a registered user.\nPlease ensure ASURITE ID is correct or contact ' + $scope.studentOne + ' and have them complete an application\n\nWould you like to have ' + $scope.studentTwo + ' set as your first choice?')) {
                        $http.post('/faculty/editRequests', studentRequest).then(function successCallback(response) {
                            $scope.studentOne = studentRequest.studentOne;   
                            $scope.studentTwo = null;
                            $scope.refresh(id);
                        }, function errorCallback(response) {
                            //TODO
                        });
                    } else {
                        $scope.studentOne = null;
                        $scope.refresh(id);
                    }
                } else if (requestResponse[0].length != 0 && requestResponse[1].length === 0 && $scope.studentOne === null) {
                    var studentRequest = { 'studentOne' : $scope.studentTwo, 'ScheduleID' : id};
                    if (confirm('You have successfully requested ' + $scope.studentTwo + '.\nBut you did not make a selection for your 1st Choice. \n\nWould you like to have ' + $scope.studentTwo + ' set as your first choice?')) {
                        $http.post('/faculty/editRequests', studentRequest).then(function successCallback(response) {
                            $scope.studentOne = studentRequest.studentOne;   
                            $scope.studentTwo = null;
                            $scope.refresh(id);
                        }, function errorCallback(response) {
                            //TODO
                        });
                    } else {
                        $scope.studentOne = null;
                        $scope.refresh(id);
                    }
                } else if (requestResponse[0].length != 0 && $scope.studentOne != null && $scope.studentTwo != null  && requestResponse[1].length != 0) {
                    alert('Neither of the students you requested are registered users.\nPlease ensure ASURITE ID is correct or contact ' + $scope.studentOne + ' and ' + $scope.studentTwo + ' and have them complete an application');
                } else if (requestResponse[0].length != 0 && $scope.studentOne === null && $scope.studentTwo === null  && requestResponse[1].length != 0) {
                    alert('All Requests have been removed');
                    $scope.studentOne === null;
                    $scope.studentTwo === null;
                    $scope.refresh(id);
                }
            }, function errorCallback(response) {
                //TODO
            });
        }, function errorCallback(response) {
            //TODO
        });    
    }
    
    $scope.name = UserInfoService.getFullName();   
    
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/facultyHome');
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }  
});

user.controller('adminController', function($scope, $http, $location, $route, $timeout, SendClassService, UserInfoService, PCActionsService, UserAuthService) {
    $scope.name = UserInfoService.getFullName();
    $scope.classes = [];
    $scope.semesterNames = ['Fall', 'Spring', 'Summer'];
    /*
     * This creates the lists of classes missing/needing student assignments, student confirmations,
     * and courses missing assigned hours. The undefined check is there to prevent errors occuring on the
     * class summary page if the page is refreshed.
     */
    if (PCActionsService.callTo.hasActions !== undefined) {
        $scope.incompleteClasses = setClassOptions(PCActionsService.callTo.incompleteClasses);
        $scope.missingPlacementClasses = setClassOptions(PCActionsService.callTo.placements.missingPlacements);
        $scope.missingTAClasses = setClassOptions(PCActionsService.callTo.placements.missingTA);
        $scope.missingGraderClasses = setClassOptions(PCActionsService.callTo.placements.missingGrader);
        $scope.needTAConfirmation = setClassOptions(PCActionsService.callTo.placements.needTAConfirmation);
        $scope.needGraderConfirmation = setClassOptions(PCActionsService.callTo.placements.needGraderConfirmation);
        $scope.needTAHours = setClassOptions(PCActionsService.callTo.placements.needTAHours, true);
        $scope.needGraderHours = setClassOptions(PCActionsService.callTo.placements.needGraderHours, true);
    }
    
    angular.element(document).ready(function() {    
        $http.get('programChair/getDeadline').then(function successCallback(response) {
            $scope.deadline = {date:new Date(response.data.date).toString().substring(0,15), semester:response.data.semester};
        }, function errorCallback(response) {
            // empty
        });
    });

    
    // adds an indicator to the class name if a class is online and hours needed
    // for classes missing TA/Grader assigned hours
    function setClassOptions(data, hasHours) {
        var options = [];
        for (var i in data) {
            if (data[i].Location === 'ASUOnline') {
                var className = data[i].Subject + ' ' + data[i].CatalogNumber + '*';   
            } else {
                var className = data[i].Subject + ' ' + data[i].CatalogNumber;    
            }
            if (hasHours) {
                className += ' ~ ' + data[i].neededHours + ' remaining hours';
            }
            options.push({'class': className,'courseNumber': data[i].CourseNumber});
        } 
        return options;
    }

    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }

    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }

    $scope.goHome = function() {
        $location.path('/administrationHome');
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});
