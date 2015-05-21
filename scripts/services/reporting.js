angular.module('app.services')
    .service('reportService', ['$http', '$rootScope', '$q', '$window', '$localStorage', 'dbService', function ($http, $rootScope, $q, $window, $localStorage, dbService) {
        var serverUrl = "http://superbrain.io:8080/download";
        var userid = 0;
        var self = this;
        this.getServerUrl = function(){
            return serverUrl;
        }
        this.exportToPdf = function(dashboardData){
            $http({
                method: 'POST',
                url: serverUrl,
                data: "dashboardData=" + dashboardData + "&userid=" + dbService.getCurrentUserId(),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data, status, headers, config) {
                if (data.result) {

                }
            }).error(function(){

            });
        }
    }]);
