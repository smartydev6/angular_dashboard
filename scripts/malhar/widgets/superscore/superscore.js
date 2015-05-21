/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
'use strict';

angular.module('ui.widgets')
    .directive('wtSuperScore', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'template/widgets/superscore/superscore.html',
            scope: {
                data: '='
            },
            controller: function ($scope) {
                $scope.columns = [
                    { field: 'name', displayName: 'Name' },
                    { field: 'value', displayName: 'Value' }
                ];
                $scope.gridOptions = {
                    data: 'items',
                    enableRowSelection: false,
                    enableColumnResize: false,
                    columnDefs: 'columns'
                };
                $scope.items = [];
                $scope.running = 0;
                $scope.updatePreferences = function(preferences){
                    if(_.isUndefined(preferences))
                        return;
                    $scope.cellstyles = [];
                    for(var i in $scope.items){
                        $scope.cellstyles[i] = [];
                        for(var j in $scope.items[i]){
                            if(j>=$scope.dimArray.length){
                                var preference = preferences.metArray[j-$scope.dimArray.length]['indicatorArrow'];
                                if(preference == "Good") {
                                    if ($scope.origin_rows[i][j] > $scope.baseitems[i][j]['lowvalue']) {
                                        $scope.cellstyles[i][j] = "yellow";
                                    } else if ($scope.origin_rows[i][j] < $scope.baseitems[i][j]['highvalue']) {
                                        $scope.cellstyles[i][j] = "green";
                                    } else {
                                        $scope.cellstyles[i][j] = "red";
                                    }
                                }
                                if(preference == "Bad"){
                                    if ($scope.origin_rows[i][j] > $scope.baseitems[i][j]['lowvalue']) {
                                        $scope.cellstyles[i][j] = "red";
                                    } else if ($scope.origin_rows[i][j] < $scope.baseitems[i][j]['highvalue']) {
                                        $scope.cellstyles[i][j] = "green";
                                    } else {
                                        $scope.cellstyles[i][j] = "yellow";
                                    }
                                }
                            }
                        }
                    }
                    for(var k in $scope.compdatas){
                        var compdata = $scope.compdatas[k];
                        compdata.cellstyles = [];
                        for(var i in compdata.rows){
                            compdata.cellstyles[i] = [];
                            for(var j in compdata.rows[i]){
                                if(j>=$scope.dimArray.length){
                                    var preference = preferences.metArray[j-$scope.dimArray.length]['indicatorArrow'];
                                    if(preference == "Good") {
                                        if (compdata.origin_rows[i][j] > compdata.baserows[i][j]['lowvalue']) {
                                            compdata.cellstyles[i][j] = "yellow";
                                        } else if (compdata.origin_rows[i][j] < compdata.baserows[i][j]['highvalue']) {
                                            compdata.cellstyles[i][j] = "green";
                                        } else {
                                            compdata.cellstyles[i][j] = "red";
                                        }
                                    }
                                    if(preference == "Bad"){
                                        if (compdata.origin_rows[i][j] > compdata.baserows[i][j]['lowvalue']) {
                                            compdata.cellstyles[i][j] = "red";
                                        } else if (compdata.origin_rows[i][j] < compdata.baserows[i][j]['highvalue']) {
                                            compdata.cellstyles[i][j] = "green";
                                        } else {
                                            compdata.cellstyles[i][j] = "yellow";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            link: function postLink(scope) {
                scope.$watch('data', function (data) {
                    console.log(data);
                    if (data) {
                        if(data['action'] == "updatePreferences"){
                            /*
                                If the action is update preferences Good/Bad
                             */
                            scope.updatePreferences(data.preferences);
                            return;
                        }
                        var maindata = data['datas'];
                        var items = maindata['rows'];
                        var origin_rows = maindata['origin_rows'];
                        var dimArray = maindata['dimArray'];
                        var baseitems = null;
                        if(maindata['baserows'])
                            baseitems = maindata['baserows'];
                        var labels = maindata['labels'];

                        scope.items = items;
                        scope.baseitems = baseitems;
                        scope.cellstyles =  [];
                        scope.origin_rows = origin_rows;
                        scope.dimArray = dimArray;
                        scope.labels = labels;
                        scope.maindata = maindata;
                        scope.compdatas = data['compdatas'];
                        var preferences = [];
                        if(maindata.preferences!=null && maindata.preferences.length>0)
                            preferences = maindata.preferences;
                        else{
                            var preferences = {metArray :[]}
                            for(var i=0; i<maindata.metArray.length; i++)
                                preferences.metArray[i] = {"indicatorArrow":"Good"};
                        }
                        console.log(preferences);
                        scope.updatePreferences(preferences);
                    }
                });
            }
        };
    });