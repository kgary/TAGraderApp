'use strict'
/*
 * File: login.js
 * Description: Establishes login page module and controller
 */

// setup login module
var login = angular.module('app.login', ['ngRoute']);

// login page controller
login.controller('loginController', function($scope, $location, $http, UserInfoService, FirstTimeLoginService) {
    $scope.message = '';
    $scope.userName = true;
    $scope.disableBtn = false;

    if (FirstTimeLoginService.isFirstTime()) {
        $scope.createAccountSuccess = true;
        $scope.successMessage = FirstTimeLoginService.firstTimeMessage();
    }
    $scope.submitLogin = function() {
        $scope.message = '';
        FirstTimeLoginService.setFirstTime(false);
        var loginData = {'username':$scope.username, 'password':$scope.password};
        $http.post('/login', loginData).then(function successCallback(response) {
            if (response.data.error === 0) {
                UserInfoService.setUserId($scope.username);
                UserInfoService.setFullName(response.data.firstName + ' ' + response.data.lastName);
                UserInfoService.setUserType(response.data.type);
                UserInfoService.setToken(response.data.token);
                UserInfoService.setLastLogin(response.data.lastLogin);
                if (response.data.type === 'student') {
                    UserInfoService.setAppStatus(response.data.appStatus);
                    // go to student home
                    $location.path('/studentHome');
                } else if (response.data.type === 'faculty') {
                    $location.path('/facultyHome');
                } else if (response.data.type === 'program chair') {
                    $location.path('/programChairHome');
                } else if (response.data.type === 'administrative') {
                    $location.path('/administrationHome');
                }
            } else if (response.data.error === 1) {
                // Incorrect Credentials
                $scope.message = 'Username/Password Incorrect';
                $scope.password = '';
            } else {
                // TODO
            }
        }, function errorCallback(response) {
            //TODO
        });
    }

    $scope.tokenValidation = function() {

      var accessToken = $location.search().access_token;
      var config = {
    params: {
        access_token: accessToken
    }
}
      $http.get('/login/password-reset',config).then(function successCallback(response) {
        if (response.data.error === 0) {
          $scope.asurite = response.data.username;
            UserInfoService.setToken(accessToken);
        }
      });

    }

$scope.changePassword = function() {
  var password = $scope.newpassword.trim();
  var confirmPassword = $scope.confirmpassword.trim();

  if(password != confirmPassword)
  {
    $scope.userError = true;
    $scope.userErrorMessage = "Passwords do not match";
  }
  else {

    var changePasswordData = {
      "asuID" : $scope.asurite,
      "newPassword" : confirmPassword
    }

    $http.post('/login/changePassword', changePasswordData).then(function successCallback(response) {
      if(response.data.error == 0)
      {
        $location.path('/login');
      }
      else {
        $scope.userError = true;
        $scope.userErrorMessage = "Unfornate error while updating password";
      }

    })
  }
}

    $scope.recoverPassword = function() {

      var userName = $scope.forgotUserName.trim();

      if(userName == null || userName == '')
      {
        $scope.userError = true;
        $scope.userErrorMessage = 'Please enter your ASU ID';
      }
      else
      {
        var forgotPasswordData = {
           "ASURITE_ID" : userName
         }
         $http.post('/login/recoverPassword', forgotPasswordData).then(function successCallback(response) {
           if (response.data.error === 0 && response.data.isSecurityQuestion == 1) {
             console.log("response received");
             console.log(response.data);
             $scope.asuID = userName;
             $scope.userError = false;
             $scope.userName = false;
             $scope.recoveryPassword = true;
             $scope.userName = false;
             $scope.securityQuestion1 = response.data.securityquestion;
             $scope.securityQuestion2 = response.data.securityquestion2;
           }
           else
           {
             $scope.userError = true;
             if(response.data.error === 0 && response.data.validated === 1 && response.data.message != null)
             {
               console.log("Disable buttton");
               $scope.disableBtn = true;
               $scope.userErrorMessage = response.data.message;
             }
             else
             {
               $scope.disableBtn = false;
               if(response.data.message == null)
               {
                 $scope.userErrorMessage = "Unable to recover the password for the given ASURITE ID";
               }
               else
               {
                 $scope.userErrorMessage = response.data.message;
               }
             }
           }
         });
         }
      }

      $scope.retrievePassword = function(){
        console.log("retrievePassword called");
        var securityAnswer1 = $scope.securityAnswer1;
        var securityAnswer2 = $scope.securityAnswer2;

        if(securityAnswer1 == null || securityAnswer1 == '' || securityAnswer2 == null || securityAnswer2 == '')
        {
          $scope.userError = true;
          $scope.userErrorMessage = 'Please enter the corresponding security answers';
        }
        else {
          var securityAnswers = {
            "ASURITE_ID" : $scope.asuID,
             "security_answer1" : securityAnswer1.trim(),
             "security_answer2" : securityAnswer2.trim()
           }

           $http.post('/login/retrievePassword', securityAnswers).then(function successCallback(response) {
             $scope.userError = true;
             if(response.data.verified == 1)
             {
               console.log("Security Answer verified");
               console.log("Disable buttton");
               $scope.disableBtn = true;
               $scope.userErrorMessage = response.data.message;
             }
             else if(response.data.verified == 0 || response.data.error === 1)
             {
               console.log("Incorrect security answer or error");
               $scope.disableBtn = false;
               if(response.data.message == null)
               {
                 $scope.userErrorMessage = "Unable to recover the password for the given ASURITE ID";
               }
               else
               {
                 $scope.userErrorMessage = response.data.message;
               }
             }
           });
        }
      }

      $scope.resetPassword = function()
      {
        alert("reset-password called");
      }


    $scope.forgotPassword = function() {
      $location.path('/forgotPassword');
        //alert("To reset your password please email Dr. Kevin Gary at:\n\nkgary@email.asu.edu");
    }
});
