/*
 * File: header.js
 * Description: Handles Header scopes and methods.
 */

// setup module
var header = angular.module('app.header', ['ngRoute']);

header.controller('headerController', function($scope, $location, UserInfoService, UserAuthService) {

    $scope.goHome = function() {
        if (UserInfoService.getUserType() === 'student') {
            $location.path('/studentHome');
        } else if (UserInfoService.getUserType() === 'faculty') {
            $location.path('/facultyHome');
        } else if (UserInfoService.getUserType() === 'program chair') {
            $location.path('/programChairHome');
        }
        // else other types TODO
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
    
    $scope.login = function() {
        $location.path('/login');
    }
    
    $scope.displayLogin = function() {
        return $location.path() === '/unauthorized';
    }
       
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }   
    
    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }
});