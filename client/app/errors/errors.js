/*
 * File: errors.js
 * Description: Handles nav links on error pages.
 */

// setup module
var errors = angular.module('app.errors', ['ngRoute']);

errors.controller('errorsController', function($scope, $location, UserInfoService, UserAuthService) {

    $scope.goHome = function() {
        if (UserInfoService.getUserType() === 'student') {
            $location.path('/studentHome');
        } else if (UserInfoService.getUserType() === 'faculty') {
            $location.path('/facultyHome');
        } else if (UserInfoService.getUserType() === 'program chair') {
            $location.path('/programChairHome');
        } else if (UserInfoService.getUserType() === 'administrative') {
            $location.path('/programChairHome');
        }
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