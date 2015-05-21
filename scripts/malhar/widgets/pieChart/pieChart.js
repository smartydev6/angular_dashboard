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
    .directive('wtPieChart', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'template/widgets/pieChart/pieChart.html',
            scope: {
                data: '='
            },
            controller: function ($scope) {
                $scope.mainData = [];
                $scope.options = {
                    series: {
                        pie: {
                            show: true
                        }
                    },
                    legend: {
                        show: true
                    },
                    grid: {
                        hoverable: true,
                        clickable: true
                    },
                    colors: ["#23AE89", "#2EC1CC", "#FFB61C", "#E94B3B"],
                    tooltip: true,
                    tooltipOpts: {
                        content: "%p.0%, %s",
                        defaultTheme: false
                    }
                };
            },
            link: function postLink(scope) {
                scope.$watch('data', function (data) {
                    if (data) {
                        var maindata = data['datas'];
                        var items = maindata['rows'];
                        var rows = [];
                        var index;
                        for(index in items){
                            var item = items[index];
                            var row = {label : item[0], data : item[1]};
                            rows.push(row);
                        }
                        scope.mainData = rows;
                        scope.$$childHead.setData(rows);
                    }
                });
            }
        };
    });