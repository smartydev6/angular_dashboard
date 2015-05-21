angular.module('app.controllers').controller('AdminLoginCtrl', function ($scope, $rootScope, dbService, $location) {
    $scope.login = function(){
        dbService.checkAdmin($scope.username, $scope.password).then(function(response){
            $scope.success = response;
            console.log($scope.success);
            if($scope.success == 1){
                $rootScope.isAdmin = 1;
                $location.path("/admin");
            }
        });
    }
});