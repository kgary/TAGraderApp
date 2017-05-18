'use-strict'
/*
 * administrative.js used to modularize (module) and control (controllers) the Administrative User (other than homepage)
 * It will control what content is displayed and launching of Administrative tasks 
 */

// setup user module
var administrative = angular.module('app.administrative', []);

// View Applications
administrative.controller('AdminSearchAppController', function($scope, $location, $http, UserInfoService, UserAuthService) {
    $http.post('/administrative/applicationNames').then(function successCallback(response) {
            $scope.names = response.data;
        }, function errorCallback(response) {
            //TODO
        });
        
    // populates dropdown for courses
    $http.get('/administrative/courses').then(function successCallback(response) {
                $scope.courses = response.data;
            }, function errorCallback(response) {
                //TODO
            });
    
    // Searches applications in database
    $scope.searchApp = function() {
        var courseData = {
            course : $scope.selectCourse.CourseSection
        };
        $http.post('/administrative/applications', courseData).then(function successCallback(response) {
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
        $location.path('/administrationHome');
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

//View Student Application Info
administrative.controller('AdminStudentInfoController', function($scope, $routeParams, $http, $location, UserInfoService, UserAuthService) {
    $scope.studentId = $routeParams.studentId
    var studentData = {
            studentId   : $scope.studentId
    };
    // populates contact information
    $http.post('/administrative/contactInfo', studentData).then(function successCallback(response) {
        $scope.contactInfo = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates application table
    $http.post('/administrative/applicationTable', studentData).then(function successCallback(response) {
        $scope.appInfo = response.data;
    }, function errorCallback(response) {
        //TODO
    });
    // populates languages table
    $http.post('/administrative/languagesTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.courses = [];
        } else {
            $scope.languages = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates IDEs table
    $http.post('/administrative/ideTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.ides = [];
        } else {
            $scope.ides = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates collaborative tools table
    $http.post('/administrative/toolsTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.tools = [];
        } else {
            $scope.tools = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates course competencies table
    $http.post('/administrative/coursesTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.courses = [];
        } else {
            $scope.courses = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates calendar table
    $http.post('/administrative/calendarTable', studentData).then(function successCallback(response) {
        if(response.data == 'OK') {
            $scope.calendars = [];
        } else {
            $scope.calendars = response.data;
        }
    }, function errorCallback(response) {
        //TODO
    });
    // populates attachment table
    $http.post('/administrative/attachmentTable', studentData).then(function successCallback(response) {
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
            $http.post('/administrative/resume/', resumeData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
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
            $http.post('/administrative/transcript/', transcriptData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
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
            $http.post('/administrative/ipos/', iposData, {responseType: 'arraybuffer'}).then(function successCallback(response) {
                var Ipos = new Blob([response.data], {type: 'application/pdf'});
                var IposURL = URL.createObjectURL(Ipos);
                window.location.assign(IposURL);
            }, function errorCallback(response) {
                //TODO
            });
        }
    }
    // populates evaluation table
    $http.post('/administrative/evaluationTable', studentData).then(function successCallback(response) {
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
        $location.path('/administrationHome');
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});

administrative.controller('adminChangePasswordController', function($scope, $http, $location, $route, UserInfoService, UserAuthService) {
    $scope.changePassword = function(changeOther) {
        if ($scope.newPasswordOne !== $scope.newPasswordTwo) {
            $scope.passwordError = true;
            $scope.passwordErrorMessage = 'Passwords do not match. Please try again.';
            $scope.newPasswordOne = '';
            $scope.newPasswordTwo = '';
            $scope.currentPassword = '';
            $scope.defaultPassword = 0;
        } else if (!checkPassword($scope.newPasswordOne)) {
            $scope.defaultPassword = 0;
            $scope.passwordError = true;
            $scope.passwordErrorMessage = 'Password Requirements:\n  -8-20 Characters\n  -1 Lowercase Letter\n  -1 Uppercase Letter\n  -1 Special Character(#?!@$%^&*-)\n  -1 Number';
            $scope.newPasswordOne = '';
            $scope.newPasswordTwo = '';
            $scope.currentPassword = '';
        } else {
            var userToChange = '';
            var changePsswordData;
            if (changeOther === 1) {
                userToChange = $scope.studentToChange;
                var changePasswordData = {
                    "ASURITE_ID" : userToChange,
                    "NewPassword"  : $scope.newPasswordOne,
                };
            } else {
                userToChange = UserInfoService.getUserId();
                var changePasswordData = {
                    "ASURITE_ID" : userToChange,
                    "CurrentPassword"  : $scope.currentPassword,
                    "NewPassword"  : $scope.newPasswordOne,
                };
            }
            $http.post('/administrative/adminSetUserPassword', changePasswordData).then(function successCallback(response) {
                if (response.data.error === 1) {
                    $scope.newPasswordOne = '';
                    $scope.newPasswordTwo = '';
                    $scope.studentToChange = '';
                    $scope.passwordError = true;
                    $scope.defaultPassword = 0;
                    $scope.passwordErrorMessage = 'User does not exist';               
                } else if(response.data.error === 2) {
                    $scope.newPasswordOne = '';
                    $scope.newPasswordTwo = '';
                    $scope.currentPassword = '';
                    $scope.passwordError = true;
                    $scope.passwordErrorMessage = 'Incorrect current password';
                } else {
                    $scope.newPasswordOne = '';
                    $scope.newPasswordTwo = '';
                    $scope.currentPassword = '';
                    $scope.studentToChange = '';
                    $scope.defaultPassword = 0;
                    $scope.changeOther = 0;
                    $scope.passwordError = false;
                    $scope.passwordSuccess = true;
                    $scope.passwordSuccessMessage = 'User password updated successfully';   
                }     
            }, function errorCallback(response) {
                //TODO
            });
        }
    }

    $scope.setDefaultPassword = function() {
        if ($scope.defaultPassword) {
            $scope.newPasswordOne = '1!Aaaaaa';
            $scope.newPasswordTwo = '1!Aaaaaa';   
        } else {
            $scope.newPasswordOne = null;
            $scope.newPasswordTwo = null;      
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
        $location.path('/administrationHome');
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});