angular.module('app.services')
    .service('dbService', ['$http', '$rootScope', '$q', '$window', '$localStorage', '$anchorScroll', '$location',
        function ($http, $rootScope, $q, $window, $localStorage, $anchorScroll, $location) {
        //var serverUrl = "http://superbrain.io/backend/"
        var serverUrl = "http://localhost/flatify/backend/";
        var userid = 0;
        var that = this;
        this.getUserId = function(userInfo, $scope){
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: serverUrl + "index.php/api/user",
                data: "email=" + userInfo.email + "&name=" + userInfo.name + "&picture=" + userInfo.picture,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
               userid = response.userid;
               that.loadDashboards($scope);
                // Save log to the table
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };
        this.getCurrentUserId = function(){
            return userid;
        }
        this.saveStorage = function (name, value){
             $http({
                method: 'POST',
                url: serverUrl + "save_storage.php",
                data: "userid=" + userid + "&name=" + name + "&value=" + value,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        };

        this.init = function($scope){
            $http({
                method: 'POST',
                url: serverUrl + "load_storage.php",
                data: "userid=" + userid ,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
                .then(function(response){
                    var data = response.data;
                    if(data==undefined || data==null) return;
                    if(data['ngStorage-dashboards']) {
                        var dashboards = JSON.parse(data['ngStorage-dashboards']);
                        var dashboards_new = [];
                        for (index in dashboards) {
                            var dashboard = dashboards[index];
                            var dashboard_temp = {title: dashboard.title, id: dashboard.id};
                            dashboards_new.push(dashboard_temp);
                        }
                        $scope.dashboards = dashboards_new;
                        $localStorage.dashboards = dashboards_new;
                        $scope.dashboardCount = JSON.parse(data['ngStorage-maxNumber']);
                        $localStorage.maxNumber = JSON.parse(data['ngStorage-maxNumber']);
                    }
                    for(var key in data){
                        if(key!="ngStorage-dashboards" && key!="ngStorage-maxNumber"){
                            window.localStorage.setItem(key, data[key]);
                        }
                    }
                    /* if($window.localStorage.getItem("ngStorage-dashboards"))
                        $scope.dashboards = JSON.parse($window.localStorage.getItem("ngStorage-dashboards")); */
                    //$scope.$apply();
                    //$window.localStorage.setItem('ngStorage-dashboards', response.data.value);
                });
        };

        this.shareDashboard = function(dashboardid, recipientEmail){
            $http({
                method: 'POST',
                url: serverUrl + "index.php/api/dashboard",
                data: "action=share&userid=" + userid + "&dashboardid=" + dashboardid + "&recipient=" + recipientEmail,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        };

        this.newDashboard = function(dashboard){
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: serverUrl + "index.php/api/dashboard",
                data: "action=new&userid=" + userid + "&title=" + dashboard.title,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.loadDashboards = function($scope){
            $http({
                method: 'GET',
                url: serverUrl + "index.php/api/dashboards/userid/" + userid + "/format/json",
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                $scope.dashboards = response.dashboards;
            }).error(function(response){
                //deferred.reject(response);
            });
        };

        this.updateDashboard = function(dashboard){
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: serverUrl + "index.php/api/dashboard",
                data: "action=update&id=" + dashboard.id + "&userid=" + dashboard.userid + "&title=" + dashboard.title,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.deleteDashboard = function(dashboard){
            $http({
                method: 'DELETE',
                url: serverUrl + "index.php/api/dashboard",
                data: "id=" + dashboard.id ,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){

            }).error(function(response){

            });
        };

        this.getDashboard = function(dashboardid){
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: serverUrl + "index.php/api/dashboard/id/" + dashboardid,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.saveDashboard = function(dashboardid, widgets){
            var widgets_data = [];
            for(var i in widgets){
                var widget = widgets[i];
                var settings, comparisons, content;
                if(widget.widgetSettings)
                    settings = JSON.stringify(widget.widgetSettings);
                else
                    settings = "";
                if(widget.widgetCompDatas)
                    comparisons = JSON.stringify(widget.widgetCompDatas);
                else
                    comparisons = "";
                if(widget.name == "Note"){
                    // If the widget's type is note
                }
                if(widget.content)
                    content = widget.content;
                else
                    content = "";

                var widget_data = {
                    id:widget.id,
                    title: widget.title,
                    name: widget.name,
                    settings: settings,
                    comparisons: comparisons,
                    data: content,
                    style: {
                        width: widget.containerStyle.width,
                        height: widget.contentStyle.height
                    }
                }
                widgets_data.push(widget_data);
            }
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: serverUrl + "index.php/api/dashboard",
                data: "action=save&id=" + dashboardid + "&userid=" + userid + "&widgets=" + JSON.stringify(widgets_data),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        }

        this.clearDashboard = function(dashboardid){
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: serverUrl + "index.php/api/dashboard",
                data: "action=clear&id=" + dashboardid + "&userid=" + userid,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.addWidget = function(widget){
            var deferred = $q.defer();
            $http({
                method: 'PUT',
                url: serverUrl + "index.php/api/widget",
                data: "dashboardid=" + widget.dashboardid + "&title=" + widget.title + "&name=" + widget.name ,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.updateWidget = function(widget){
            if(!widget)
                return;
            var deferred = $q.defer();
            var settings, comparisons, content, dispprefer;
            if(widget.widgetSettings)
                settings = JSON.stringify(widget.widgetSettings);
            else
                settings = "";
            if(widget.widgetCompDatas)
                comparisons = JSON.stringify(widget.widgetCompDatas);
            else
                comparisons = "";
            if(widget.widgetDisplayPreferences)
                dispprefer = JSON.stringify(widget.widgetDisplayPreferences);
            else
                dispprefer = "";
            if(widget.content)
                content = widget.content;
            else
                content = "";
            $http({
                method: 'POST',
                url: serverUrl + "index.php/api/widget",
                data: "id=" + widget.id + "&settings=" + settings + "&title=" + widget.title + "&comparisons=" + comparisons + "&data=" + content + "&dispprefer=" + dispprefer,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.deleteWidget = function(widget){
            var deferred = $q.defer();
            $http({
                method: 'DELETE',
                url: serverUrl + "index.php/api/widget",
                data: "id=" + widget.id ,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.saveLog = function(){
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: serverUrl + "index.php/api/log",
                data: 'userid=' +userid,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response.users);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        }

        this.getAllUsers = function(){
            var deferred = $q.defer();
            $http({
                url: serverUrl + "index.php/admin/users/format/json",
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response.users);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        }

        this.getAllLogs = function(){
            var deferred = $q.defer();
            $http({
                url: serverUrl + "index.php/admin/logs/format/json",
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response.logs);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        }

        this.checkAdmin = function(username, password){
            var deferred = $q.defer();
            $http({
                method : 'POST',
                url: serverUrl + "index.php/admin/verify",
                data:"username=" + username + "&password=" + password,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(response){
                deferred.resolve(response.success);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };
    }]);
