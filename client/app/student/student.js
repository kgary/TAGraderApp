/*
 * File: student.js
 * Description: Module and controllers to handle pages of the student process.
 */

// setup module
var student = angular.module('app.student', []);

student.controller('studentChangePasswordController', function($scope, $http, $location, $route, UserInfoService, UserAuthService) {
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
            
            $http.post('/student/studentSetUserPassword', changePasswordData).then(function successCallback(response) {
                if(response.data.error === 2) {
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
        $location.path('/studentHome');
    }
    
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
});