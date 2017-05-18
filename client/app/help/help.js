var helpControllers = angular.module('app.helpControllers', ['ngRoute']);

helpControllers.controller('ListController', ['$scope', '$http', '$location', 'UserInfoService', 'UserAuthService', function($scope, $http, $location, UserInfoService, UserAuthService) {
  $http.get('app/help/helpData.json').then(function success(data) {
    $scope.help_data = data.data;
    $scope.listOrder = 'topic';
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }
    $scope.name = UserInfoService.getFullName();
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
  });
}]);

helpControllers.controller('DetailsController', ['$scope', '$http','$routeParams', '$location', 'UserInfoService', 'UserAuthService', function($scope, $http, $routeParams, $location, UserInfoService, UserAuthService) {
  $http.get('app/help/helpData.json').then(function success(data) {
    $scope.help_data = data.data;
    $scope.whichItem = $routeParams.itemId;
    if ($routeParams.itemId > 0) {
      $scope.prevItem = Number($routeParams.itemId)-1;
    } else {
      $scope.prevItem = $scope.help_data.length-1;
    }
    if ($routeParams.itemId < $scope.help_data.length-1) {
      $scope.nextItem = Number($routeParams.itemId)+1;
    } else {
      $scope.nextItem = 0;
    }
    $scope.name = UserInfoService.getFullName();
    $scope.displayLogout = function() {
        return UserAuthService.isAuthenticated();
    }
    $scope.logout = function() {
        UserInfoService.clearUserSession();
        $location.path('/login');
    }
    $scope.goHome = function() {
        $location.path('/studentHome');
    }
    $scope.displayHome = function() {
        if (UserAuthService.isAuthenticated()) {
            return true;
        }
    }
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
  });
}]);

