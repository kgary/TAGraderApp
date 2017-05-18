/*
 * File: faculty.js
 * Description: Module and controllers to handle pages of the faculty process.
 */

// setup module
var faculty = angular.module('app.faculty', []);

faculty.controller('studentEvalController', function($scope, $http, $location, $route, UserInfoService, UserAuthService) {
    // populates the Student Evaluation dropdown   
    $scope.ratings = ['1','2','3','4','5'];  
    
    // populates students names in dropdown
    $http.get('/faculty/evaluations/appnames').then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.studentnames = [];
        } else {
            $scope.studentnames = response.data;
        }
    }, function errorCallback(response) {
            //TODO
    });
    
    // Saves Student Evaluation into Database
    $scope.saveEval = function(doRoute) {
        var dateObj = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var studentEvalData = {
                ASURITE_ID      : $scope.selectName,
                QOneScore       : $scope.selectOne,
                QOneComments    : $scope.commentsOne,
                QTwoScore       : $scope.selectTwo,
                QTwoComments    : $scope.commentsTwo,
                QThreeScore     : $scope.selectThree,
                QThreeComments  : $scope.commentsThree,
                QFourScore      : $scope.selectFour,
                QFourComments   : $scope.commentsFour,
                DateCreated     : dateObj,
                InstructorName  : UserInfoService.getFullName()
            };
        $http.post('/faculty/evaluation', studentEvalData).then(function successCallback(response) {
            if (doRoute === true) {
                $location.path('/facultyHome'); 
            }
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

// View Applications
faculty.controller('facultySearchAppController', function($scope, $location, $http, UserInfoService, UserAuthService) {
    $http.post('/faculty/applicationNames').then(function successCallback(response) {
            $scope.names = response.data;
        }, function errorCallback(response) {
            //TODO
        });
        
    // populates dropdown for courses
    $http.get('/faculty/courses').then(function successCallback(response) {
                $scope.courses = response.data;
            }, function errorCallback(response) {
                //TODO
            });
    
    // Searches applications in database
    $scope.searchApp = function() {
        var courseData = {
            course : $scope.selectCourse.CourseSection
        };
        $http.post('/faculty/applications', courseData).then(function successCallback(response) {
            $scope.names = response.data;
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

//View Student Application Info
faculty.controller('facultyStudentInfoController', function($scope, $routeParams, $http, $location, UserInfoService, UserAuthService) {
    $scope.studentId = $routeParams.studentId
    var studentData = {
            studentId : $scope.studentId
    };
    // populates application table
    $http.post('/faculty/applicationTable', studentData).then(function successCallback(response) {
        $scope.appInfo = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates languages table
    $http.post('/faculty/languagesTable', studentData).then(function successCallback(response) {
        $scope.languages = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates IDEs table
    $http.post('/faculty/ideTable', studentData).then(function successCallback(response) {
        $scope.ides = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates collaborative tools table
    $http.post('/faculty/toolsTable', studentData).then(function successCallback(response) {
        $scope.tools = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates course competencies table
    $http.post('/faculty/coursesTable', studentData).then(function successCallback(response) {
        $scope.courses = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates calendar table
    $http.post('/faculty/calendarTable', studentData).then(function successCallback(response) {
        $scope.calendars = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates attachment table
    $http.post('/faculty/attachmentTable', studentData).then(function successCallback(response) {
        $scope.attachment = response.data;
    }, function errorCallback(response) {
        //TODO
    });
     // opens attachments
    $scope.openAttachments = function(fileType, ID, fileName) {
        // display resume file
        if (fileType == 1) {
            var resumeData = {
            ID       : ID,
            fileName : fileName
            };
            $http.post('/faculty/resume/', resumeData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
                var Resume = new Blob([response.data], {type: 'application/pdf'});
                var ResumeURL = URL.createObjectURL(Resume);
                window.location.assign(ResumeURL);
            }, function errorCallback(response) {
                //TODO
            });
        }
        // display transcript file
        if (fileType == 2) {
            var transcriptData = {
            ID       : ID,
            fileName : fileName
            };
            // display resume file
            $http.post('/faculty/transcript/', transcriptData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
                var Transcript = new Blob([response.data], {type: 'application/pdf'});
                var TranscriptURL = URL.createObjectURL(Transcript);
                window.location.assign(TranscriptURL);
            }, function errorCallback(response) {
                //TODO
            });
        }
        // display iPOS file
        if (fileType == 3) {
            var iposData = {
            ID       : ID,
            fileName : fileName
            };
            // display resume file
            $http.post('/faculty/ipos/', iposData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
                var Ipos = new Blob([response.data], {type: 'application/pdf'});
                var IposURL = URL.createObjectURL(Ipos);
                window.location.assign(IposURL);
            }, function errorCallback(response) {
                //TODO
            });
        }
    }
    // populates evaluation table
    $http.post('/faculty/evaluationTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.evaulations = [];
        } else {
            $scope.evaluations = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
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

faculty.controller('facultyChangePasswordController', function($scope, $http, $location, $route, UserInfoService, UserAuthService) {
    $scope.changePassword = function() {
        if ($scope.newPasswordOne !== $scope.newPasswordTwo) {
            $scope.passwordError = true;
            $scope.passwordErrorMessage = 'Passwords do not match. Please try again.';
            $scope.newPasswordOne = '';
            $scope.newPasswordTwo = '';
            $scope.currentPassword = '';
        } else if (!checkPassword($scope.newPasswordOne)) {
            $scope.passwordError = true;
            $scope.passwordErrorMessage = 'Password Requirements:\n  -8-20 Characters\n  -1 Lowercase Letter\n  -1 Uppercase Letter\n  -1 Special Character(#?!@$%^&*-)\n  -1 Number';
            $scope.newPasswordOne = '';
            $scope.newPasswordTwo = '';
            $scope.currentPassword = '';
        } else {
            var changePasswordData = {
                "ASURITE_ID" : UserInfoService.getUserId(),
                "CurrentPassword"  : $scope.currentPassword,
                "NewPassword"  : $scope.newPasswordOne,
            };
            
            $http.post('/faculty/facultySetUserPassword', changePasswordData).then(function successCallback(response) {
                if (response.data.error === 2) {
                    $scope.newPasswordOne = '';
                    $scope.newPasswordTwo = '';
                    $scope.currentPassword = '';
                    $scope.passwordError = true;
                    $scope.passwordErrorMessage = 'Incorrect current password';
                } else {
                    $scope.newPasswordOne = '';
                    $scope.newPasswordTwo = '';
                    $scope.currentPassword = '';
                    $scope.passwordError = false;
                    $scope.passwordSuccess = true;
                    $scope.passwordSuccessMessage = 'User password updated successfully';    
                }     
            }, function errorCallback(response) {
                //TODO
            });
        }
    }
    
    function checkPassword(password) {
        var requirement = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$");
        var res = requirement.test(password);
        return res;
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