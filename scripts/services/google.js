'use strict';
 angular.module('app.services', [])
    .service('googleService', ['$http', '$rootScope', '$q', 'dbService', function ($http, $rootScope, $q, dbService) {
        var clientId = '297641329485-45rfdicrb99rkammjhjeu84bprsf8d1o.apps.googleusercontent.com',
            apiKey = 'AIzaSyCIjTshdBPDBrZQdeFggnn1z85rue2ItTk',
            scopes = ["https://www.googleapis.com/auth/analytics.readonly", "https://www.googleapis.com/auth/userinfo.email"],
            domain = '';
        var columns = {dimData :[], metData:[]};
        var segments = [];
        var accounts = [], properties = [], profiles = [];
        var that = this;
        this.login = function () {
            var deferred = $q.defer();
            function handleAuthResult(authResult){
                if (authResult && !authResult.error) {
                    var data = {};
                    gapi.client.load("analytics", "v3", function(a) {
                        that.loadSegments();
                        gapi.client.analytics.management.accounts.list().execute(
                                function(a){
                                    if(a.items && a.items.length){
                                        accounts = a.items;
                                        gapi.client.analytics.management.webproperties.list({
                                            accountId: "~all"
                                        }).execute(function(a){
                                            if(a.items && a.items.length){
                                                properties = a.items;
                                                gapi.client.analytics.management.profiles.list({
                                                    accountId: "~all",
                                                    webPropertyId: "~all"
                                                }).execute(function(a){
                                                    if(a.items && a.items.length) {
                                                        profiles = a.items;
                                                        deferred.resolve('success');
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            );
                    });

                } else {
                    deferred.reject('error');
                }     
            }
            gapi.auth.authorize({ 
                client_id: clientId, 
                scope: scopes, 
                immediate: true
            }, handleAuthResult);
            return deferred.promise;
        }

        this.handleClientLoad = function () {
            gapi.client.setApiKey(apiKey);
            gapi.auth.init(function () { });
            //window.setTimeout(checkAuth, 1);
        };

        this.checkAuth = function() {
            gapi.auth.authorize({ 
                client_id: clientId, 
                scope: scopes, 
                immediate: true
            }, this.handleAuthResult);
        };


        this.handleAuthClick = function(event) {
            gapi.auth.authorize({ 
                client_id: clientId, 
                scope: scopes, 
                immediate: false
            }, this.handleAuthResult);
            return false;
        };

        this.getUserData = function($scope){
            var deferred = $q.defer();
            gapi.client.request({
                path: "/oauth2/v2/userinfo"
            }).execute(function(a) {
                $scope.userInfo = a;
                $rootScope.$evalAsync();
                dbService.getUserId($scope.userInfo, $scope);
                deferred.resolve(a);
            });
            return deferred.promise;
        }
        this.loadWebproperties = function(accountid){
            var deferred = $q.defer();
            function handleWebproperties(a){
                if (a.error) deferred.reject('error');
                else if (a.items && a.items.length){
                    var data = {};
                    data.items = a.items;
                    deferred.resolve(data);
                }else deferred.resolve(null);                
            }
            gapi.client.analytics.management.webproperties.list({
                 accountId: accountid
            }).execute(handleWebproperties);  
            return deferred.promise;
        };

        this.loadProfiles = function(accountid, propertyid){
            var deferred = $q.defer();
            function handleProfiles(a){
                if (a.error) deferred.reject('error');
                else if (a.items && a.items.length){
                    var data = {};
                    data.items = a.items;
                    deferred.resolve(data);
                }else deferred.resolve(null);                
            }
           gapi.client.analytics.management.profiles.list({
               accountId: accountid,
               webPropertyId: propertyid
            }).execute(handleProfiles);
            return deferred.promise;            
        };

        this.loadCustomVars = function(accountId, propertyId, profileId){
            var deferred = $q.defer();
            var restRequest = gapi.client.request({
                'path': '/analytics/v3/management/accounts/' + accountId + '/webproperties/' + propertyId + '/profiles/' + profileId + '/goals',
                'params': {}
            });
            restRequest.then(function(resp) {
                var goals = resp.result.items;
                deferred.resolve(goals);

            }, function(reason) {
                console.log('Error: ' + reason.result.error.message);
            });
            return deferred.promise;
        }

        this.loadColumns = function(){
            var url = "https://www.googleapis.com/analytics/v3/metadata/ga/columns?key=" + apiKey;
            $http.get(url)
                 .success(function(result) {
                    var dimindex = 0, metindex = 0;
                    var items = result.items;
                    var temp = {dimData : [], metData : []};
                    for(var index in items){
                        var item = items[index];
                        var label_ = item.attributes.uiName;
                        if(item.attributes.status == "DEPRECATED")
                            continue;
                        if(item.attributes.type=="DIMENSION"){
                            dimindex ++;
                            var dim = {id : item.id, label : label_, group : item.attributes.group};
                            temp.dimData.push(dim);
                        }
                        if(item.attributes.type=="METRIC"){
                            metindex ++;
                            var met = {id : item.id, label : label_, group : item.attributes.group};
                            temp.metData.push(met);
                        }
                    }
                    columns = temp;
                }).error(function(){
                    columns = {dimData :[], metData:[]};
                });
        };

        this.getColumns = function(){
            return columns;
        };

        this.getColumnLabel = function(id){
            var i;
            for(i in columns.dimData){
                if(columns.dimData[i]['id'] == id)
                    return columns.dimData[i]['label'];
            }
            for(i in columns.metData){
                if(columns.metData[i]['id'] == id)
                    return columns.metData[i]['label'];
            }
            return "";
        };

        this.loadAnalytics = function(profile, startdate, enddate, dimension, metric, segment, maxresult){
            var deferred = $q.defer();
            if(profile ==null){
                deferred.reject("Profile is invalid");
                return;
            }
            maxresult = 10000;
            if(segment == '' || segment == undefined)
                segment = -1;
            function handleCoreReportingResults(a){
                if (a.error) deferred.reject(a.error);
                else {
                    /*
                        If the data type is percent, show 12.34%
                     */
                    for(var i in a.rows){
                        for(var j in a.rows[i]){
                            switch(a.columnHeaders[j].dataType){
                                case "PERCENT":
                                    a.rows[i][j] = Math.round(a.rows[i][j] * 100) / 100 + "%";
                                    break;
                                case "CURRENCY":
                                    a.rows[i][j] = Math.round(a.rows[i][j] * 100) / 100 + " " + profile.currency;
                                    break;
                                case "FLOAT":
                                    a.rows[i][j] = Math.round(a.rows[i][j] * 100) / 100;
                                    break;
                                default :
                                    break;
                            }
                        }
                    }
                    deferred.resolve(a);
                }               
            }
            if(gapi && gapi.client) {
                gapi.client.analytics.data.ga.get({
                    'ids': 'ga:' + profile.id,
                    'start-date': startdate,
                    'end-date': enddate,
                    'dimensions': dimension,
                    'metrics': metric,
                    'segment': 'gaid::' + segment,
                    'max-results': maxresult
                }).execute(handleCoreReportingResults);
            }
            return deferred.promise;                         
        };

        this.loadSegments = function(){
            if(segments.length >0 )
                return;
            var deferred = $q.defer();
            gapi.client.analytics.management.segments.list().execute(
                function(a){
                    if (a.error) deferred.reject('error');
                    else if (a.items && a.items.length){
                        segments = a.items;
                    }else deferred.resolve(null)
                }
            );
        }
        this.getSegments = function(){
            return segments;
        }
        this.getSegmentName = function(segid){
            var segment = _.findWhere(segments, {segmentId: segid});
            if(segment)
                return segment.name;
            else
                return "";
        }
        this.getAccounts = function(){
            return accounts;
        }
        this.getProperties = function(){
            return properties;
        }
        this.getProfiles = function(){
            return profiles;
        }


    }]);