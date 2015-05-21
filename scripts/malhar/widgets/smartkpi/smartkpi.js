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
    .directive('wtSmartKpi', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'template/widgets/smartkpi/smartkpi.html',
            scope: {
                data: '='
            },
            controller: function ($scope) {
                $scope.kpi = {showvalue : "Smart KPI Widget", value : 0, lowvalue : 0, highvalue : 100};
            },
            link: function postLink(scope, element, attrs) {
                var config = {
                    size: 200,
                    label: attrs.label,
                    min: undefined !== scope.min ? scope.min : 0,
                    max: undefined !== scope.max ? scope.max : 100,
                    minorTicks: 5
                };

                var range = config.max - config.min;
                config.redZones = [
                    {from:config.min, to: config.min + range * 0.3}
                ];

                config.yellowZones = [
                    { from: config.min + range * 0.3, to: config.min + range * 0.6 }
                ];
                config.greenZones = [
                    { from: config.min + range * 0.6, to: config.max }
                ];

                scope.gauge = new Gauge(element.find('div').get(0), config);
                scope.gauge.render();

                function update(value) {
                    var percentage;
                    if (_.isString(value)) {
                        percentage = parseFloat(value);
                    } else if (_.isNumber(value)) {
                        percentage = value;
                    }

                    if (!_.isUndefined(percentage)) {
                        scope.gauge.redraw(percentage);
                    }
                }
                function configure(config){
                    if(!_.isUndefined(config)) {
                        var _default = {
                            size: 200,
                            label: attrs.label,
                            min: undefined !== scope.min ? scope.min : 0,
                            max: undefined !== scope.max ? scope.max : 100,
                            minorTicks: 5,
                            lowvalue : 0,
                            highvalue : 100
                        };
                        config = _.defaults(config, _default);
                        if(config.arrow == "Good") {
                            config.greenZones = [
                                { from: config.min + range * config.highvalue / 100, to: config.max }
                            ];
                            config.yellowZones = [
                                { from: config.min + range * config.lowvalue / 100, to: config.min + range * config.highvalue / 100 }
                            ];
                            config.redZones = [
                                {from: config.min, to: config.min + range * config.lowvalue / 100}
                            ];
                        }
                        if(config.arrow == "Bad"){
                            config.redZones = [
                                { from: config.min + range * config.highvalue / 100, to: config.max }
                            ];
                            config.yellowZones = [
                                { from: config.min + range * config.lowvalue / 100, to: config.min + range * config.highvalue / 100 }
                            ];
                            config.greenZones = [
                                {from: config.min, to: config.min + range * config.lowvalue / 100}
                            ];
                        }
                        scope.gauge.configure(config);
                        element.find("div.meter").html("");
                        scope.gauge.render();
                        if(!isNaN(scope.kpi.value))
                            update(scope.kpi.value);
                    }
                }

                scope.$watch('data', function (data) {
                    if (data) {
                        if(!_.isUndefined(data.labels[0]))
                            scope.kpi.label = data.labels[0];
                        scope.kpi.showvalue = data.showvalue;
                        scope.kpi.value = data.value;
                        var config = {lowvalue : data.lowvalue, highvalue : data.highvalue, arrow: data.arrow};
                        configure(config);
                    }
                });
            }
        };
    });