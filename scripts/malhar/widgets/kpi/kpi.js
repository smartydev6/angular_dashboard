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
    .directive('wtKpi', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'template/widgets/kpi/kpi.html',
            scope: {
                data: '='
            },
            controller: function ($scope) {
                $scope.kpi = {value : "KPI Widget", changevalue : -1};
            },
            link: function postLink(scope) {
                scope.$watch('data', function (data) {
                    if (data) {
                        scope.kpi.showvalue = data.showvalue;
                        scope.kpi.value = data.value;
                        scope.kpi.label = data.label;
                        var oldValue = data.oldvalue;
                        if(oldValue != 0) {
                            scope.kpi.changevalue = ((scope.kpi.value - oldValue) / oldValue) * 100;
                            scope.kpi.changevalue = scope.kpi.changevalue.toFixed(2);
                            if(scope.kpi.changevalue > 0 ){
                                if(data.arrow == "Good") {
                                    scope.kpi.arrowimage = "images/greenup.png";
                                    scope.kpi.changeclass = "kpigreen";
                                }
                                if(data.arrow == "Bad") {
                                    scope.kpi.arrowimage = "images/redup.png";
                                    scope.kpi.changeclass = "kpired";
                                }

                            }else{
                                if(data.arrow == "Good") {
                                    scope.kpi.arrowimage = "images/reddown.png";
                                    scope.kpi.changeclass = "kpired";
                                }
                                if(data.arrow == "Bad") {
                                    scope.kpi.arrowimage = "images/greendown.png";
                                    scope.kpi.changeclass = "kpigreen";
                                }
                            }
                        }
                    }
                });
            }
        };
    });