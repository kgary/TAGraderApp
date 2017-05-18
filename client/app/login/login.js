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

    $scope.forgotPassword = function() {
        alert("To reset your password please email Dr. Kevin Gary at:\n\nkgary@email.asu.edu");
    }
});
