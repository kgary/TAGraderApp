'use-strict'
/*
 * File: account.js
 * Description: Modules and controllers for user account creation and viewing.
 */

// setup account module
var account = angular.module('app.account', ['ngRoute']);

//This is the filter for the password security question.
account.filter('custFile', function() {
  return function(input, uppercase) {
    //alert('filter called'+uppercase);
    if(uppercase == undefined)
    {
      return;
    }

    input = input || '';
    var output = [];
    var count = 0;
    for (var i = 0; i < input.length; i++) {
      if(input[i] != uppercase)
      {
        output[count++] =  input[i];
      }
    }

    return output;
  };
});
// account pages controllers
account.controller('createAccountController', function($scope, $location, $http, UserInfoService, FirstTimeLoginService) {
    var regTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    $scope.questions = ["What was the name of your elementary / primary school?",
                        "In what city or town does your nearest sibling live?",
                        "What time of the day were you born? (hh:mm)",
                        "What Is your favorite book?",
                        "What is your mother’s maiden name?",
                        "Where is your favorite place to vacation?",
                        "What city were you born in?",
                        "What is your favorite food?",
                        "What was the first company that you worked for?",
                        "What is the name of the road you grew up on?",
                      ];

    $scope.securityQuestion = true;

    $scope.submitAccount = function() {
        $scope.message = '';
        // checks if passwords match, then posts if match
        if ($scope.password1 !== $scope.password2) {
            $scope.passwordError = true;
            $scope.passwordErrorMessage = 'Passwords do not match. Please try again.';
            $scope.password1 = '';
            $scope.password2 = '';
        } else if (!checkEmail($scope.email)) {
            $scope.emailError = true;
            $scope.emailErrorMessage = 'You must use an ASU email.';
            $scope.email = '';
            $scope.password1 = '';
            $scope.password2 = '';
        } else if (!checkPassword($scope.password1)) {
            $scope.passwordError = true;
            $scope.passwordErrorMessage = 'Password Requirements:\n  -8-20 Characters\n  -1 Lowercase Letter\n  -1 Uppercase Letter\n  -1 Special Character(#?!@$%^&*-)\n  -1 Number';
            $scope.password1 = '';
            $scope.password2 = '';
        } else if(!checkSecurityQuestion($scope.securityQuestion1,$scope.securityQuestion2,$scope.selectedSecurityQuestion1,$scope.selectedSecurityQuestion2)){
            $scope.securityQuestionError = true;
            $scope.securityQuestionMessage = 'Security Question need to be answered';
        } else {
            var createAccountData = {
               "ASURITE_ID" : $scope.asuriteID,
                "FirstName"  : $scope.firstname,
                "MiddleName"  : $scope.middlename,
                "LastName"  : $scope.lastname,
                "UserEmail"  : $scope.email,
                "UserPassword"  : $scope.password1,
                "UserRole"  : "student",
                "RegTime"  : regTime,
                "securityQuestion"  : $scope.selectedSecurityQuestion1.trim(),
                "securityQuestion2"  : $scope.selectedSecurityQuestion2.trim(),
                "securityQuestionAnswer"  : $scope.securityQuestion1.trim(),
                "securityQuestionAnswer2"  : $scope.securityQuestion2.trim(),
                "isActive"  : 1,
                "LoginTime" : regTime
            };
            $http.post('/createAccount', createAccountData).then(function successCallback(response) {
                if (response.data.error === 0) {
                    UserInfoService.setUserId($scope.username);
                    UserInfoService.setFullName($scope.firstname + ' ' + $scope.lastname);
                    UserInfoService.setUserType('student');
                    FirstTimeLoginService.setFirstTime(true);
                    $location.path('/login');
                } else if(response.data.error === 1) {
                    $scope.userError = true;
                    $scope.userErrorMessage = 'User already exists';
                    $scope.password1 = '';
                    $scope.password2 = '';
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

    function checkEmail(email) {
        var require = 'asu.edu';
        var end = email.split('@')[1];
        if (end === require) {
            return true;
        }
        return false;
    }
    function checkSecurityQuestion(answer1 , answer2,question1, question2)
    {
      $scope.securityQuestionError = false;
      if(answer1 === ''|| answer2 === ''|| question1 === undefined || question1 === '' || question2 === undefined || question2 === '')
      {
        return false;
      }

      return true;
    }
});

// account pages controllers
account.controller('createFacultyAdminAccountController', function($scope, $location, $http, UserInfoService, FirstTimeLoginService, SendClassService) {
    angular.element(document).ready(function() {
        SendClassService.setAssignStudentRoute(false);
    });

    var regTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    $scope.setDefaultPassword = function() {
        if ($scope.defaultPassword) {
            $scope.password1 = '8*Yyyyyy';
            $scope.password2 = '8*Yyyyyy';
        } else {
            $scope.password1 = null;
            $scope.password2 = null;
        }
    }

    $scope.submitAccount = function() {
        // checks if passwords match, then posts if match
        if ($scope.password1 !== $scope.password2) {
            $scope.userError = false;
            $scope.passwordError = true;
            $scope.defaultPassword = 0;
            $scope.passwordErrorMessage = 'Passwords do not match. Please try again.';
            $scope.password1 = '';
            $scope.password2 = '';
        } else if (!checkPassword($scope.password1)) {
            $scope.userError = false;
            $scope.passwordError = true;
            $scope.defaultPassword = 0;
            $scope.passwordErrorMessage = 'Password Requirements:\n  -8-20 Characters\n  -1 Lowercase Letter\n  -1 Uppercase Letter\n  -1 Special Character(#?!@$%^&*-)\n  -1 Number';
            $scope.password1 = '';
            $scope.password2 = '';
        } else {
            var createAccountData = {
                "ASURITE_ID" : $scope.asuriteID,
                "FirstName"  : $scope.firstname,
                "MiddleName"  : $scope.middlename,
                "LastName"  : $scope.lastname,
                "UserEmail"  : $scope.email,
                "UserPassword"  : $scope.password1,
                "UserRole"  : $scope.accountType,
                "RegTime"  : regTime,
                "isActive"  : 1,
                "LoginTime" : regTime
            };
            $http.post('/createAccount', createAccountData).then(function successCallback(response) {
                if (response.data.error === 0) {
                    if (confirm("Account creation successful!\n\nClick OK to return to your home page\n\nClick Cancel to add another user") == true) {
                        $location.path('/programChairHome');
                    } else {
                        $scope.asuriteID = null;
                        $scope.firstname = null;
                        $scope.middlename = null;
                        $scope.lastname = null;
                        $scope.email = null;
                        $scope.password1 = null;
                        $scope.password2 = null;
                        $scope.defaultPassword = 0;
                        $scope.accountType = null;
                        $scope.userError = false;
                        $scope.passwordError = false;
                    }

                } else if(response.data.error === 1) {
                    $scope.defaultPassword = null;
                    $scope.userError = true;
                    $scope.userErrorMessage = 'User already exists';
                    $scope.password1 = '';
                    $scope.password2 = '';
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
});
