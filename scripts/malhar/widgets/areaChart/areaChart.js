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
    .directive('wtAreaChart', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'template/widgets/areaChart/areaChart.html',
            scope: {
                data: '='
            },
            controller: function ($scope) {
                $scope.mainData = [];
                $scope.metrics = ["xbox", "will", "playstation"];
                $scope.linecolors = ["#6A55C2","#E94B3B","#2EC1CC"];
                $scope.xkey = "month";
                $scope.dataindex = "";
            },
            link: function postLink(scope) {
                scope.$watch('data', function (data) {
                    if (data) {
                        var maindata = data.datas;
                        var columns = maindata['columns'];
                        var _labels = maindata['labels'];
                        var metrics = [];
                        var labels = [], temp_labels = [];
                        if(data.addnew == 1){
                            if(scope.dataindex == "")
                                scope.dataindex = 1;
                            else
                                scope.dataindex++;
                        }else{
                            scope.dataindex = "";
                        }
                        for(var i in columns){
                            // First index is ga:date, ga:yearweek, ga:yearmonth (period)
                            if(i>0) {
                                metrics.push(columns[i] + scope.dataindex);
                                labels.push(maindata.profile + "/" + maindata.segment + " -- " + _labels[i]);
                                temp_labels.push(_labels[i]);
                            }
                        }
                        var rows = maindata['rows'];
                        var items = [];
                        for(var index in rows){
                            var row = rows[index];
                            var item = {};
                            for(var subindex in row){
                                if(subindex == 0){
                                    if(columns[0] == "ga:date"){
                                        item['ga:date'] =   moment(row[subindex], "YYYYMMDD").format("YYYY-MM-DD");
                                    }
                                    if(columns[0] == "ga:yearweek"){
                                        item['ga:yearweek'] =   moment(row[subindex], "YYYYWW").format("YYYY-MM-DD");
                                    }
                                    if(columns[0] == "ga:yearmonth"){
                                        item['ga:yearmonth'] =   moment(row[subindex], "YYYYMM").format("YYYY-MM-DD");
                                    }
                                    continue;
                                }
                                item[columns[subindex] + scope.dataindex] = row[subindex];
                            }
                            items.push(item);
                        }
                        //  In case of adding new data source
                        if(data.compdatas){
                            for(var i in data.compdatas){
                                var c_metrics = [];
                                var c_labels = [];
                                for(var j in data.compdatas[i]['columns']){
                                    var c_columns = data.compdatas[i]['columns'];
                                    // First index is ga:date, ga:yearweek, ga:yearmonth (period)
                                    if(j>0) {
                                        c_metrics.push(c_columns[j] + i);
                                        c_labels.push(data.compdatas[i].profile + "/" + data.compdatas[i].segment + " -- " +  _labels[j]);
                                    }
                                }
                                metrics = metrics.concat(c_metrics);
                                labels = labels.concat(c_labels);
                                var c_rows = data.compdatas[i]['rows'];
                                var temp_items = [];
                                for(var index in c_rows){
                                    var row = c_rows[index];
                                    var item = {};
                                    for(var subindex in row){
                                        if(subindex == 0){
                                            if(columns[0] == "ga:date"){
                                                item['ga:date'] =   moment(row[subindex], "YYYYMMDD").format("YYYY-MM-DD");
                                            }
                                            if(columns[0] == "ga:yearweek"){
                                                item['ga:yearweek'] =   moment(row[subindex], "YYYYWW").format("YYYY-MM-DD");
                                            }
                                            if(columns[0] == "ga:yearmonth"){
                                                item['ga:yearmonth'] =   moment(row[subindex], "YYYYMM").format("YYYY-MM-DD");
                                            }
                                            continue;
                                        }
                                        item[columns[subindex] + i] = row[subindex];
                                    }
                                    _.defaults(items[index], item);
                                }
                            }
                        }
                        var graphdata = {items : items, xkey : columns[0], ykeys : metrics, labels : labels};
                        scope.$$childHead.setData(graphdata, 'line');
                    }
                });
            }
        };
    });