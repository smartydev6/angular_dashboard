angular.module('app.controllers').controller('AdminCtrl', function ($scope, $rootScope, dbService, $location) {
    console.log($rootScope.isAdmin);
    if($rootScope.isAdmin ==undefined || $rootScope.isAdmin!=1)
        $location.path("/admin/login");
    $scope.users = [];
    $scope.logs = [];
    dbService.getAllUsers().then(function(response){
        $scope.users = response;
    });
    dbService.getAllLogs().then(function(response){
        $scope.logs = response;
    });

});