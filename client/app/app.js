'use strict';
/*
 * File: app.js 
 * Description: Top level control of the application
 */

// setup main app module and other modules
var app = angular.module('app', ['ngRoute',
                                 'app.login',
                                 'app.header',
                                 'app.errors',
                                 'app.account',
                                 'app.users',
                                 'app.programChair',
                                 'app.faculty',
                                 'app.administrative',
                                 'app.student',
                                 'app.application',
                                 'app.helpControllers',
                                 'app.services',
                                 'app.directives'
                                 ]);

app.constant('USER_ROLES', {
    all: '*',
    administrative: 'administrative',
    faculty: 'faculty',
    program_chair: 'program chair',
    student: 'student'
});

app.constant('APPLICATION_LINKS', {
	Contact : '#!/contactInfo',
    Education : '#!/education',
    Employment : '#!/employment',
    Availability : '#!/availability',
    Languages : '#!/languages',
    Courses : '#!/courses'
});

/* Upon a change in route, this checks if the user is logged in and is the correct 
 * user type to view the route. 
 * Sets the css layout for the next page. 
 * Reroutes a logged in user to home page if they attempt to access login page.
 */
app.run(function($rootScope, $location, UserAuthService, UserInfoService, USER_ROLES) {
    $rootScope.$on('$routeChangeStart', function(event, next) {
       $rootScope.mainDisplay = false;
       // reroute logged in user from hitting login page
       if (next.templateUrl === 'app/login/loginView.html' && UserAuthService.isAuthenticated()) {
           if (UserInfoService.getUserType() === USER_ROLES.student) {
                $location.path('/studentHome'); 
           } else if (UserInfoService.getUserType() === USER_ROLES.faculty) {
                $location.path('/facultyHome'); 
           } else if (UserInfoService.getUserType() === USER_ROLES.program_chair) {
                $location.path('/programChairHome');
           } else if (UserInfoService.getUserType() === USER_ROLES.administrative) {
                $location.path('/administrationHome');
           } // rest TODO
       }
       // checks if a user is authorized to view a page
       var authRoles = next.permissions;
       if (!UserAuthService.isAuthorized(authRoles)) {
           event.preventDefault();
           if (UserAuthService.isAuthenticated()) {
               // user is logged in but not allowed - 403
               $location.path('/forbidden')
           } else if (authRoles.indexOf(USER_ROLES.all) !== -1) {
               // user is not restricted but no such file exists - 404
               $location.path('/badrequest')
           } else {
               // user is not or no longer logged in - 401
               UserInfoService.clearUserSession();
               $location.path('/unauthorized');     
           }
       }
   }); 
   $rootScope.$on('$routeChangeSuccess', function(event, current, next) {
        // empty
   }); 
});

app.config(function($locationProvider, $routeProvider, $httpProvider, USER_ROLES) {
    $routeProvider
        .when('/', {
            redirectTo : '/login',
            permissions : [USER_ROLES.all]
        })
        .when('/login', {
            templateUrl : 'app/login/loginView.html',
            controller : 'loginController',
            permissions : [USER_ROLES.all],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/login/css/login.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 400);
                }
            }
        })
        .when('/studentHome', {
            templateUrl : 'app/users/studentView.html',
            controller : 'studentInfoController',
            permissions : [USER_ROLES.student],
            resolve : {
                    getActions : function($q, $http, UserInfoService, StudentActionsService, AppStatusService, DeadlineDateCheckService) {
                      var deferred = $q.defer();
                          $http({method: 'POST', 
                                 url: '/student/getStudentActions', 
                                 data: {user: UserInfoService.getUserId()}}).then(function(getActions) {
                                   StudentActionsService.callTo = getActions.data;	
                                   AppStatusService.setStatuses(getActions.data);
                                   DeadlineDateCheckService.studentDateNotice(getActions.data.deadlineDate);
                                   deferred.resolve(getActions);
                          });
                    return deferred.promise;
                    }, 
                    getFeedback : function($q, $http, UserInfoService) {
                      var deferred = $q.defer();
                          $http({method: 'POST', 
                                 url: '/student/getApplicationFeedback', 
                                 data: {user: UserInfoService.getUserId()}}).then(function(getFeedback) {
                                   deferred.resolve(getFeedback);
                          });
                    return deferred.promise;
                    }, 
                    set : function($rootScope, $timeout) {
                        $rootScope.layout = "/app/users/css/studentView.css";
                        $timeout(function() {
                            $rootScope.mainDisplay = true;
                        }, 200);
                    }
                }
        })
        .when('/facultyHome', {
            templateUrl : 'app/users/facultyView.html',
            permissions : [USER_ROLES.faculty],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/users/css/facultyView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/evaluation', {
            templateUrl : 'app/faculty/studentEval.html',
            permissions : [USER_ROLES.faculty],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "app/faculty/css/studentEval.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/viewApplications', {
            templateUrl : 'app/faculty/searchApp.html',
            permissions : [USER_ROLES.faculty],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "app/faculty/css/searchApp.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/studentInfo/:studentId', {
            templateUrl : 'app/faculty/studentApp.html',
            permissions : [USER_ROLES.faculty],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "app/faculty/css/studentApp.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/administrationHome', {
            templateUrl : 'app/users/administrationView.html',
            permissions : [USER_ROLES.administrative],
            resolve : {
                getPCActions : function($q, $http, DeadlineDateCheckService, UserInfoService, PCActionsService) {
                  var deferred = $q.defer();
                      $http({method: 'POST', 
                           url: '/getPCActions',
                           data: {lastLogin: UserInfoService.getLastLogin()}
                      }).then(function(getPCActions) {
                           PCActionsService.callTo = getPCActions.data;
                           DeadlineDateCheckService.studentDateNotice(PCActionsService.callTo.deadline);
                           deferred.resolve(getPCActions);
                      });
                return deferred.promise;
                },
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/users/css/programChairView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/viewAppsAdmin', {
            templateUrl : 'app/administrative/searchAppAdmin.html',
            permissions : [USER_ROLES.administrative],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "app/faculty/css/searchApp.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/studentInfoAdmin/:studentId', {
            templateUrl : 'app/administrative/studentAppAdmin.html',
            permissions : [USER_ROLES.administrative],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "app/faculty/css/studentApp.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/programChairHome', {
            templateUrl : 'app/users/programChairView.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
                getPCActions : function($q, $http, DeadlineDateCheckService, UserInfoService, PCActionsService) {
                  var deferred = $q.defer();
                      $http({method: 'POST', 
                           url: '/getPCActions',
                           data: {lastLogin: UserInfoService.getLastLogin()}
                      }).then(function(getPCActions) {
                           PCActionsService.callTo = getPCActions.data;
                           DeadlineDateCheckService.studentDateNotice(PCActionsService.callTo.deadline);
                           deferred.resolve(getPCActions);
                      });
                return deferred.promise;
                }, 
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/users/css/programChairView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                } 
            }
        })
        .when('/classSummary', {
            templateUrl : 'app/programChair/classSummaryView.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/programChair/css/classSummaryView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/createFacultyAdminAccount', {
            templateUrl : 'app/account/createFacultyAdminAccountView.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/account/css/createFacultyAdminAccount.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/editSchedule', {
            templateUrl : 'app/programChair/pcEditSchedule.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/programChair/css/pcEditSchedule.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/assignStudent', {
            templateUrl : 'app/programChair/assignStudentView.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/pcChangePassword', {
            templateUrl : 'app/programChair/pcChangePasswordView.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/programChair/css/pcChangePasswordView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/pcUpdateAllEnrollments', {
            templateUrl : 'app/programChair/pcUpdateAllEnrollmentsView.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/programChair/css/pcUpdateAllEnrollmentsView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        }) 
        .when('/adminChangePassword', {
            templateUrl : 'app/administrative/adminChangePasswordView.html',
            permissions : [USER_ROLES.administrative],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/administrative/css/adminChangePasswordView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/facultyChangePassword', {
            templateUrl : 'app/faculty/facultyChangePasswordView.html',
            permissions : [USER_ROLES.faculty],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/faculty/css/facultyChangePasswordView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/studentChangePassword', {
            templateUrl : 'app/student/studentChangePasswordView.html',
            permissions : [USER_ROLES.student],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/student/css/studentChangePasswordView.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/evaluationsPC', {
            templateUrl : 'app/programChair/studentEvalPC.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "app/faculty/css/studentEval.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/viewApplicationsPC', {
            templateUrl : 'app/programChair/searchAppPC.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "app/faculty/css/searchApp.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/studentInfoPC/:studentName', {
            templateUrl : 'app/programChair/studentAppPC.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "app/faculty/css/studentApp.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/courseEdit', {
            templateUrl : 'app/programChair/courseEdit.html',
            permissions : [USER_ROLES.program_chair],
            resolve : {
               'set' : function($rootScope, $timeout) {
                   $rootScope.layout = "/app/programChair/css/courseEdit.css";
                   $timeout(function() {
                       $rootScope.mainDisplay = true;
                   }, 200);
               }
           }
        })
        .when('/createAccount', {
            templateUrl : 'app/account/createAccountView.html',
            controller : 'createAccountController',
            permissions : [USER_ROLES.all],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/account/css/createAccount.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            } 
        })
        .when('/badrequest', {
            templateUrl : 'app/errors/404.html',
            permissions : [USER_ROLES.all],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/unauthorized', {
            templateUrl : 'app/errors/401.html',
            permissions : [USER_ROLES.all],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/forbidden', {
            templateUrl : 'app/errors/403.html',
            permissions : [USER_ROLES.all],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/contactInfo', {
            templateUrl : 'app/application/contactInfoView.html',
            controller : 'contactInfoController',
            permissions : [USER_ROLES.student],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/application/css/contactInfo.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/education', {
            templateUrl : 'app/application/educationView.html',
            controller : 'educationInfoController',
            permissions : [USER_ROLES.student],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/application/css/education.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/employment', {
            templateUrl : 'app/application/employmentView.html',
            controller : 'employmentInfoController',
            permissions : [USER_ROLES.student],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/application/css/employment.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            } 
        })
        .when('/availability', {
            templateUrl : 'app/application/availabilityView.html',
            controller : 'availabilityInfoController',
            permissions : [USER_ROLES.student],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/application/css/availability.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }  
        })
        .when('/languages', {
            templateUrl : 'app/application/languagesView.html',
            controller : 'languagesInfoController',
            permissions : [USER_ROLES.student],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/application/css/languages.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/courses', {
            templateUrl : 'app/application/coursesView.html',
            controller : 'coursesInfoController',
            permissions : [USER_ROLES.student],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/application/css/courses.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            } 
        })
        .when('/helpList', {
          templateUrl: 'app/help/helpList.html',
          controller: 'ListController',
            permissions : [USER_ROLES.student, USER_ROLES.faculty,
                           USER_ROLES.administrative, USER_ROLES.human_resources,
                           USER_ROLES.program_chair],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/help/css/help.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .when('/helpDetails/:itemId', {
          templateUrl: 'app/help/helpDetails.html',
          controller: 'DetailsController',
            permissions : [USER_ROLES.student, USER_ROLES.faculty,
                           USER_ROLES.administrative, USER_ROLES.human_resources,
                           USER_ROLES.program_chair],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "/app/help/css/help.css";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            }
        })
        .otherwise({
            redirectTo : '/badrequest',
            permissions : [USER_ROLES.all],
            resolve : {
                'set' : function($rootScope, $timeout) {
                    $rootScope.layout = "";
                    $timeout(function() {
                        $rootScope.mainDisplay = true;
                    }, 200);
                }
            } 
        });
    
    // adds http interceptor for adding token to Auth header
    $httpProvider.interceptors.push([
        '$injector',
        function($injector) {
            return $injector.get('AuthInterceptor');
        }
    ]);
});
