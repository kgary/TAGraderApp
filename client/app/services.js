'use-strict'
/*
 * File: services.js
 * Description: Used for common custom services within the web application
 */

// setup services module
var services = angular.module('app.services',['app.application']);

/*
 * Runs check on entered hours on application employment page
 */
services.service('WorkHoursCheckService', function(WORK_HOURS) {
    this.checkHours = function(commitedHours, type, extraHours) {
        var wantedHours = 0;
        var maxHours = 0;
        if (commitedHours !== null && extraHours !== null) {
            if (commitedHours === '10 hours per week') {
                wantedHours = 10;
            }
            else {
                wantedHours = 20;
            }
            if (type === 1) {
                maxHours = WORK_HOURS.international;
            } else {
                maxHours = WORK_HOURS.us;
            }
            wantedHours += extraHours;
            if (wantedHours > maxHours) {
                return {isOver:true, hours:wantedHours};
            } 
        }
        return {isOver:false, hours:null};
    }
});

/*
 * UserInfoService - provides the name and user type of the logged in user
 */
services.service('UserInfoService', function($window) {
    this.setUserId = function(loginId) {
        $window.sessionStorage.setItem('userId', loginId);
    } 
    this.setFullName = function(name) {
        $window.sessionStorage.setItem('userName', name);
    }   
    this.setUserType = function(type) {
        $window.sessionStorage.setItem('userType', type);
    }   
    this.setAppStatus = function(status) {
        $window.sessionStorage.setItem('appStatus', status);
    } 
    this.setToken = function(token) {
        $window.sessionStorage.setItem('token', token);
    } 
    this.setLastLogin = function(lastLogin) {
        $window.sessionStorage.setItem('lastLogin', lastLogin);
    }
    this.getUserId = function() {
        return $window.sessionStorage.getItem('userId');
    }   
    this.getFullName = function() {
        return $window.sessionStorage.getItem('userName');
    }   
    this.getUserType = function() {
        return $window.sessionStorage.getItem('userType');
    }
    this.getAppStatus = function() {
        return $window.sessionStorage.getItem('appStatus');
    }
    this.getToken = function() {
        return $window.sessionStorage.getItem('token');
    }
    this.getLastLogin = function() {
        return $window.sessionStorage.getItem('lastLogin');
    }
    this.clearUserSession = function() {
        $window.sessionStorage.removeItem('userId');   
        $window.sessionStorage.removeItem('userName');   
        $window.sessionStorage.removeItem('userType');          
        $window.sessionStorage.removeItem('appStatus');   
        $window.sessionStorage.removeItem('token');
        $window.sessionStorage.removeItem('lastLogin');
        $window.sessionStorage.removeItem('className');
        $window.sessionStorage.removeItem('classNumber');
        $window.sessionStorage.removeItem('studentId');
        $window.sessionStorage.removeItem('hasContact');
        $window.sessionStorage.removeItem('hasEducation');
        $window.sessionStorage.removeItem('hasEmployment');
        $window.sessionStorage.removeItem('hasAvailability');
        $window.sessionStorage.removeItem('hasLanguages');
        $window.sessionStorage.removeItem('hasCourses');
        $window.sessionStorage.removeItem('assignStudentRoute');
        $window.sessionStorage.removeItem('studentsToAssign');
    }
});

/*
* Checks user session status (authentication) and if the user is authorized to
* view the route
*/
services.service('UserAuthService', function(UserInfoService, USER_ROLES) {
    this.isAuthenticated = function() {
        // converts a truthy string to boolen true or false
        // checks if user is logged in
        return !!UserInfoService.getUserId() && !!UserInfoService.getToken();
    }
    // checks if user type is authorized
    this.isAuthorized = function(authRoles) {
        if (authRoles.indexOf(USER_ROLES.all) !== -1) {
            return true;
        }
        return this.isAuthenticated() && authRoles.indexOf(UserInfoService.getUserType()) !== -1;
    }
});

/*
 * request: adds the stored token to the http call Authorization header     
 * responseError: andles unauthorized response from server
 */
services.service('AuthInterceptor', function($injector, $location, UserInfoService) {
   return {
       request : function(config) {
           config.headers.Authorization = 'Bearer ' + UserInfoService.getToken();
           return config;
       },
       responseError : function(response) {
           if (response.status === 401) {
               UserInfoService.clearUserSession();
               $location.path('/unauthorized');
           } else if (response.status === 403) {
               $location.path('/forbidden');
           } else if (response.status === 404) {
               $location.path('/badrequest');
           }
       }
   } 
});

/*
 * Notifies user of successful account creation
 */
services.service('FirstTimeLoginService', function() {
    this.firstTime = false;
    
    this.setFirstTime = function(val) {
        this.firstTime = val;
    }
    this.isFirstTime = function() {
        return this.firstTime;
    }
    this.firstTimeMessage = function() {
        return 'Account creation successful. Please login to continue';
    }
});

/*
 * Allows passing of class information between pages
 */
services.service('SendClassService', function($window) {
    this.setClassName = function(className) {
        $window.sessionStorage.setItem('className', className);
    }
    this.getClassName = function() {
        return $window.sessionStorage.getItem('className');
    }
    this.setClassNumber = function(classNumber) {
        $window.sessionStorage.setItem('classNumber', classNumber);
    }
    this.getClassNumber = function() {
        return $window.sessionStorage.getItem('classNumber');
    }
    this.setAssignStudentRoute = function(bool) {
        $window.sessionStorage.setItem('assignStudentRoute', bool);
    }
    this.getAssignStudentRoute = function() {
        return $window.sessionStorage.getItem('assignStudentRoute');
    }
});

// Handles received data for Student Call to Actions
services.service('StudentActionsService', function() {
    this.callTo = {};
    this.getAppActions = function() {
    	return this.callTo.AppActions;
    }
});

// Allows passing of student information between pages
services.service('SendStudentService', function($window) {
    this.setStudentId = function(studentId) {
        $window.sessionStorage.setItem('studentId', studentId);
    }
    this.getStudentId = function() {
        return $window.sessionStorage.getItem('setStudentId');
    }
    this.setStudentsToAssign = function(studentIds) {
        $window.sessionStorage.setItem('studentsToAssign', JSON.stringify(studentIds));     
    }
    this.getStudentsToAssign = function() {
        return JSON.parse($window.sessionStorage.getItem('studentsToAssign'));
    }
    this.clearStudentsToAssign = function () {
        $window.sessionStorage.removeItem('studentsToAssign');
    }
});

// Handles checking for complete application pages
services.service('PageCompletionService', function() {
    this.checkFields = function(scope, page) {
        var requiredFields = [];
        if (page === 'contact') {
            requiredFields = ['phoneNumber', 'mobileNumber', 'addressOne', 'country', 'city', 'state', 'zip'];
        } else if (page === 'education') {
            requiredFields = ['selectedDegree', 'gpa', 'session', 'gradDate'];
            if (scope.selectedDegree === 'M.S. Other' || scope.selectedDegree === 'Ph.D Other') {
                requiredFields.push('otherDegree');
            }
        } else if (page === 'employment') {
            if (scope.ta === 0 && scope.grader === 0 || scope.ta === null && scope.grader === null || scope.ta === null && scope.grader === 0 ||  scope.ta === 0 && scope.grader === null) {
                return 0;
            }
            if (scope.hours === 'null hours per week') {              
               return 0;
            }
            if (scope.international === 1) {
                requiredFields.push('speakTest');
            }
            if (scope.employer) {
                requiredFields.push('workHours');
            }
            if (scope.workHours) {
                requiredFields.push('employer');
            }
        }
        for (var i = 0; i < requiredFields.length; i++) {
            if (!scope[requiredFields[i]]) {  
               return 0;
            }
       }
        return 1;
    }
});

// handles setting the application status based on application page completion status
services.service('AppStatusService', function($window, UserInfoService) {
    this.pages = ['contact', 'education', 'employment', 'availability', 'languages', 'courses'];
    this.setStatuses = function(data) {
        if (data.hasAppActions === 0) {
            UserInfoService.setAppStatus('new');
        } else if (data.hasAppActions === 2) {
            UserInfoService.setAppStatus('complete');
            $window.sessionStorage.setItem('contact', 1);
            $window.sessionStorage.setItem('education', 1);
            $window.sessionStorage.setItem('employment', 1);
            $window.sessionStorage.setItem('availability', 1);
            $window.sessionStorage.setItem('languages', 1);
            $window.sessionStorage.setItem('courses', 1);
        } else {
            UserInfoService.setAppStatus('incomplete');
            $window.sessionStorage.setItem('contact', data.pageStatuses[0].isContactComplete);
            $window.sessionStorage.setItem('education', data.pageStatuses[0].isEducationComplete);
            $window.sessionStorage.setItem('employment', data.pageStatuses[0].isEmploymentComplete);
            $window.sessionStorage.setItem('availability', data.pageStatuses[0].isAvailabilityComplete);
            $window.sessionStorage.setItem('languages', data.pageStatuses[0].isLanguagesComplete);
            $window.sessionStorage.setItem('courses', data.pageStatuses[0].isCoursesComplete);
        }
        return;
    }
    this.checkStatus = function(pageName, pageStatus) {
        $window.sessionStorage.setItem(pageName, pageStatus);
        if (pageStatus === 0) {
            return 'incomplete'
        } 
        for (var i = 0; i < this.pages.length; i++) {
            if ($window.sessionStorage.getItem(this.pages[i]) === '0') {
                return 'incomplete';
            }
        }
        return 'complete';
    }
});

// performs a check of the set deadline date against the current date 
services.service('DeadlineDateCheckService', function() {
   this.deadlineNotice = 3;
   this.studentDateNotice = function(deadline) {
       var today =  new Date().toLocaleDateString();
       today = new Date(today).toISOString();
       var window = new Date();
       window.setDate(window.getDate() + 7);    // window of 7 days from today
       window = window.toISOString();
       if (deadline === today) {
           this.deadlineNotice = 0;     // today is the same as the deadline
       } else if (window >= deadline) {         
           this.deadlineNotice = 1;     // today is within a week of deadline
       }
       if (today > deadline) {
           this.deadlineNotice = 2;     // today is after the deadline
       }
   }
});

// Handles received data for PC Call to Actions
services.service('PCActionsService', function() {
    this.callTo = {};
    this.getActions = function() {
    	return this.callTo.actions;
    }
});