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

angular.module('ui.dashboard', ['ui.bootstrap', 'ui.sortable', 'app.services', 'angularjs-dropdown-multiselect']);

angular.module('ui.dashboard')
    .directive('dashboard', ['WidgetModel', 'WidgetDefCollection', '$modal', 'DashboardState', '$log', 'googleService', 'dbService', '$filter', function (WidgetModel, WidgetDefCollection, $modal, DashboardState, $log, googleService, dbService, $filter) {
        return {
            restrict: 'A',
            templateUrl: function (element, attr) {
                return attr.templateUrl ? attr.templateUrl : 'template/dashboard.html';
            },
            scope: true,

            controller: ['$scope', '$attrs', function (scope, attrs) {
                // default options
                var defaults = {
                    stringifyStorage: true,
                    hideWidgetSettings: false,
                    hideWidgetClose: false,
                    settingsModalOptions: {
                        templateUrl: 'template/widget-settings-template.html',
                        controller: 'WidgetSettingsCtrl'
                    },
                    settingscompsModalOptions: {
                        templateUrl: 'template/widget-settings-comps-template.html',
                        controller: 'WidgetSettingsCompsCtrl'
                    },
                    onSettingsClose: function (result, widget, widget_scope) { // NOTE: dashboard scope is also passed as 3rd argument
                        var settings = {"datasource": result.datasource, "ga": {"accountid": result.ga.accountid, "accounts": result.ga.accounts, "propertyid": result.ga.propertyid,
                            "properties": result.ga.properties, "profileid": result.ga.profileid, "profiles": result.ga.profiles, "dimModel": result.ga.dimModel, "metModel": result.ga.metModel,
                            "dtStart": result.ga.dtStart, "dtEnd": result.ga.dtEnd, "period": result.ga.period, "segmentid": result.ga.segmentid, "indicatorArrow": result.ga.indicatorArrow
                        }};
                        //widget.dataModel.updateSettings(settings);
                        widget.title = result.title;
                        console.log(result.ga);
                        widget.widgetSettings = settings;
                        //jQuery.extend(true, widget, result);
                        scope.loadWidgetData(widget, widget_scope);
                    },
                    onSettingsCompsClose: function (result, widget, widget_scope) { // NOTE: dashboard scope is also passed as 3rd argument
                        //widget.dataModel.updateCompDataSources(result.compDatas);
                        widget.widgetCompDatas = result.compDatas;
                        //widget.isLoadingData = 1;
                        jQuery.extend(true, widget, result);
                        scope.loadWidgetData(widget, widget_scope);
                    },

                    onSettingsDismiss: function (reason) { // NOTE: dashboard scope is also passed as 2nd argument
                        $log.info('widget settings were dismissed. Reason: ', reason);
                    }
                };

                // from dashboard="options"
                // scope.options = scope.$eval(attrs.dashboard);

                // extend default settingsModalOptions
                // scope.options.settingsModalOptions = scope.options.settingsModalOptions || {};

                // extend options with defaults
                // angular.extend(defaults.settingsModalOptions, scope.options.settingsModalOptions);
                // angular.extend(scope.options.settingsModalOptions, defaults.settingsModalOptions);
                // angular.extend(defaults, scope.options);
                // angular.extend(scope.options, defaults);

                // from dashboard="options"
                scope.options = scope.$eval(attrs.dashboard);

                // Deep options
                scope.options.settingsModalOptions = scope.options.settingsModalOptions || {};
                scope.options.settingscompsModalOptions = scope.options.settingscompsModalOptions || {};
                _.each(['settingsModalOptions'], function (key) {
                    // Ensure it exists on scope.options
                    scope.options[key] = scope.options[key] || {};
                    // Set defaults
                    _.defaults(scope.options[key], defaults[key]);
                });
                _.each(['settingscompsModalOptions'], function (key) {
                    // Ensure it exists on scope.options
                    scope.options[key] = scope.options[key] || {};
                    // Set defaults
                    _.defaults(scope.options[key], defaults[key]);
                });

                // Shallow options
                _.defaults(scope.options, defaults);

                // jQuery.extend(true, defaults, scope.options);
                // jQuery.extend(scope.options, defaults);

                var sortableDefaults = {
                    stop: function () {
                        scope.saveDashboard();
                    },
                    handle: '.widget-header'
                };
                scope.sortableOptions = angular.extend({}, sortableDefaults, scope.options.sortableOptions || {});

            }],
            link: function (scope) {
                // Save default widget config for reset
                scope.defaultWidgets = scope.options.defaultWidgets;

                //scope.widgetDefs = scope.options.widgetDefinitions;
                scope.widgetDefs = new WidgetDefCollection(scope.options.widgetDefinitions);
                var count = 1;

                // Instantiate new instance of dashboard state
                scope.dashboardState = new DashboardState(
                    scope.options.storage,
                    scope.options.storageId,
                    scope.options.storageHash,
                    scope.widgetDefs,
                    scope.options.stringifyStorage
                );

                /**
                 * Instantiates a new widget on the dashboard
                 * @param {Object} widgetToInstantiate The definition object of the widget to be instantiated
                 */
                scope.addWidget = function (widgetToInstantiate, doNotSave) {
                    var defaultWidgetDefinition = scope.widgetDefs.getByName(widgetToInstantiate.name);
                    if (!defaultWidgetDefinition) {
                        throw 'Widget ' + widgetToInstantiate.name + ' is not found.';
                    }

                    // Determine the title for the new widget
                    var title;
                    if (widgetToInstantiate.title) {
                        title = widgetToInstantiate.title;
                    } else if (defaultWidgetDefinition.title) {
                        title = defaultWidgetDefinition.title;
                    } else {
                        title = 'Widget ' + count++;
                    }
                    // Deep extend a new object for instantiation
                    widgetToInstantiate = jQuery.extend(true, {}, defaultWidgetDefinition, widgetToInstantiate);
                    if(widgetToInstantiate.settings)
                        widgetToInstantiate.widgetSettings = JSON.parse(widgetToInstantiate.settings);
                    if(widgetToInstantiate.comparisons)
                        widgetToInstantiate.widgetCompDatas = JSON.parse(widgetToInstantiate.comparisons);
                    if(!_.isUndefined(widgetToInstantiate.styles) && widgetToInstantiate.styles!=""){
                        var styles = JSON.parse(widgetToInstantiate.styles);
                        if(!_.isUndefined(styles) && styles!=null) {
                            if (styles.width)
                                widgetToInstantiate.style = {width: styles.width};
                            if (styles.height)
                                widgetToInstantiate.size = {height: styles.height};
                        }
                    }

                    // Instantiation
                    var widget = new WidgetModel(widgetToInstantiate, {
                        title: title
                    });
                    widget.id = widgetToInstantiate.id;
                    widget.setDashboardid(scope.dashboardid);
                    // In case of note widget
                    if(widget.name == "Note") {
                        widget.widgetData = widgetToInstantiate.data;
                    }
                    scope.widgets.push(widget);
                    /*
                        Store the widget in the database
                     */
                    if(!doNotSave) {
                        dbService.addWidget(widget).then(function (response) {
                            widget.id = response.widgetid;
                        });
                    }
                    var widget_scope = null;
                    scope.loadWidgetData(widget, widget_scope);
                    if (!doNotSave) {
                        scope.saveDashboard();
                    }

                };

                /**
                 * Removes a widget instance from the dashboard
                 * @param  {Object} widget The widget instance object (not a definition object)
                 */
                scope.removeWidget = function (widget) {
                    dbService.deleteWidget(widget);
                    scope.widgets.splice(_.indexOf(scope.widgets, widget), 1);
                    scope.saveDashboard();
               };

                /**
                 * Opens a dialog for setting and changing widget properties
                 * @param  {Object} widget The widget instance object
                 */
                scope.openWidgetSettings = function (widget, widget_scope) {

                    // Set up $modal options
                    var options = _.defaults(
                        { scope: scope },
                        widget.settingsModalOptions,
                        scope.options.settingsModalOptions);

                    // Ensure widget is resolved
                    options.resolve = {
                        widget: function () {
                            return widget;
                        }
                    };
                    // Create the modal
                    var modalInstance = $modal.open(options);
                    var onClose = widget.onSettingsClose || scope.options.onSettingsClose;
                    var onDismiss = widget.onSettingsDismiss || scope.options.onSettingsDismiss;

                    // Set resolve and reject callbacks for the result promise
                    modalInstance.result.then(
                        function (result) {

                            // Call the close callback
                            onClose(result, widget, widget_scope);
                            //AW Persist title change from options editor
                            scope.$emit('widgetChanged', widget);
                        },
                        function (reason) {

                            // Call the dismiss callback
                            onDismiss(reason, scope);

                        }
                    );

                };

                /*
                * Popuplate the widget with the data according to the settings and compdatas
                * @param {Object} widget The widget instance object
                 */

                scope.loadWidgetData = function (widget, widget_scope) {
                    // Get Google Analytics Data Here
                    var columns = [], i, dimArray = [], metArray = [], labels = [];
                    var period = "";
                    var result, compDatas;
                    if(widget.widgetSettings)
                        result = widget.widgetSettings;
                    else
                        result = widget;
                    if(!result.ga)
                        return;
                    if(widget.widgetCompDatas)
                        compDatas = widget.widgetCompDatas;
                    else
                        compDatas = widget.compDatas;
                    dbService.updateWidget(widget);
                    if (widget.attrs.showTimeline == 1) {
                        switch (result.ga.period) {
                            case "Daily":
                                period = "ga:date";
                                break;
                            case "Weekly":
                                period = "ga:yearweek";
                                break;
                            case "Monthly":
                                period = "ga:yearmonth";
                                break;
                        }
                        result.ga.dimModel = [
                            {id: period}
                        ];
                    }
                    for (i in result.ga.dimModel) {
                        columns.push(result.ga.dimModel[i].id);
                        labels.push(googleService.getColumnLabel(result.ga.dimModel[i].id));
                        dimArray.push(result.ga.dimModel[i].id);
                    }
                    for (i in result.ga.metModel) {
                        columns.push(result.ga.metModel[i].id);
                        labels.push(googleService.getColumnLabel(result.ga.metModel[i].id));
                        metArray.push(result.ga.metModel[i].id);
                    }
                    widget.isLoadingData = 1;
                    var profile = _.findWhere(result.ga.profiles, {id: result.ga.profileid});
                    googleService.loadAnalytics(profile, $filter('date')(result.ga.dtStart, 'yyyy-MM-dd'), $filter('date')(result.ga.dtEnd, 'yyyy-MM-dd'), dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                        if(widget.name == "SmartKPI"){
                            /*
                             *  Get the 3-months data for deviation calculation
                             */
                            dimArray.push("ga:date");
                            var value = data.result.rows[0][0]; var showvalue = data.rows[0][0];
                            googleService.loadAnalytics(profile, moment().subtract(3, 'months').format("YYYY-MM-DD"), moment().format("YYYY-MM-DD"), dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                                var rows = data.result.rows;
                                if(rows.length == 0)
                                    return;
                                var mean = 0;
                                for(var i in rows){
                                    mean = mean + rows[i][1] * 1;
                                }
                                mean = mean / rows.length;
                                var sigma = 0;
                                for(i in rows){
                                    sigma = sigma + (rows[i][1]-mean) * (rows[i][1]-mean);
                                }
                                sigma = sigma / rows.length;
                                sigma = Math.sqrt(sigma);
                                var low = mean - 1 * sigma;
                                var high = mean + 1 * sigma;
                                var datas = {value:value, showvalue:showvalue, lowvalue:low, highvalue:high, labels:labels, arrow:widget.widgetSettings.ga.indicatorArrow};
                                widget.dataModel.updateScope(datas);
                                widget.isLoadingData = 0;
                                widget.isError = 0;
                            });
                            return;
                            /*console.log("from google : ");
                            console.log(data);
                            if(!_.isUndefined(data.result.rows)) {
                                console.log(widget);
                                var datas = {value: data.result.rows[0][0], showvalue: data.rows[0][0]};
                                console.log(datas);
                                console.log(widget.dataModel.widgetScope);
                                widget.dataModel.updateScope(datas);
                            }

                            return;*/
                        }

                        if(widget.name == "KPI"){
                            // If the widget is KPI, get the previouis periods for comparisons
                            console.log(data);
                            var value = data.result.rows[0][0];
                            var showvalue = data.rows[0][0];
                            var date_diff = moment(result.ga.dtEnd).diff(moment(result.ga.dtStart), 'days');
                            var prev_enddate = moment(result.ga.dtStart).subtract(1, 'days');
                            var prev_startdate = prev_enddate.subtract(date_diff, 'days');
                            googleService.loadAnalytics(profile, prev_startdate.format("YYYY-MM-DD"), prev_enddate.format("YYYY-MM-DD"), dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                                var datas = {showvalue : showvalue, value : value, oldvalue : data.result.rows[0][0], label: labels[0], arrow:widget.widgetSettings.ga.indicatorArrow};
                                widget.dataModel.updateScope(datas);
                                widget.isLoadingData = 0;
                                widget.isError = 0;
                            });
                            return;
                        }

                        var items = data.rows;
                        var datas = {columns: columns, rows: items, labels: labels, addnew : 0, profile: data.profileInfo.profileName, segment: googleService.getSegmentName(data.query.segment)};
                        widget.dataModel.updateScope(datas);
                        widget.isLoadingData = 0;
                        widget.isError = 0;
                        var compIndex = 0;
                        //scope.saveDashboard();
                        for (i in compDatas) {
                            var ga = compDatas[i].ga;
                            var subprofile = _.findWhere(ga.profiles, {id: ga.profileid});
                            googleService.loadAnalytics(subprofile, $filter('date')(result.ga.dtStart, 'yyyy-MM-dd'), $filter('date')(result.ga.dtEnd, 'yyyy-MM-dd'), dimArray.toString(), metArray.toString(), ga.segmentid, 25).then(function (data) {
                                var items = data.rows;
                                var datas = {columns: columns, rows: items, labels: labels, addnew : 1, profile: data.profileInfo.profileName, segment: googleService.getSegmentName(data.query.segment)};
                                widget.dataModel.updateScope(datas);
                                widget.isLoadingData = 0;
                                //scope.saveDashboard();
                            });
                        }
                    },function (error){
                            widget.isError = 1;
                        }
                    );

                    //scope.saveDashboard();
                };

                /**
                 * Save the widget manually (for note widget)
                 */
                 scope.saveWidget = function (widget, widget_scope) {
                     console.log(widget_scope);
                    if(widget.directive = "wt-note"){
                        var note_content = widget_scope.$$nextSibling.$$nextSibling.content;
                        widget.content = note_content;
                        dbService.updateWidget(widget).then(function(response){
                           alert("Successfully saved");
                        });
                    }
                };

                /**
                 * Opens a dialog for setting and changing widget properties
                 * @param  {Object} widget The widget instance object
                 */
                scope.openWidgetSettingsComps = function (widget, widget_scope) {

                    // Set up $modal options
                    var options = _.defaults(
                        { scope: scope },
                        widget.settingscompsModalOptions,
                        scope.options.settingscompsModalOptions);

                    // Ensure widget is resolved
                    options.resolve = {
                        widget: function () {
                            return widget;
                        }
                    };
                    // Create the modal
                    var modalInstance = $modal.open(options);
                    var onClose = widget.onSettingsCompsClose || scope.options.onSettingsCompsClose;
                    var onDismiss = widget.onSettingsDismiss || scope.options.onSettingsDismiss;

                    // Set resolve and reject callbacks for the result promise
                    modalInstance.result.then(
                        function (result) {

                            // Call the close callback
                            onClose(result, widget, widget_scope);
                            //AW Persist title change from options editor
                            scope.$emit('widgetChanged', widget);
                        },
                        function (reason) {

                            // Call the dismiss callback
                            onDismiss(reason, scope);

                        }
                    );

                };

                /**
                 * Remove all widget instances from dashboard
                 */
                scope.clear = function (doNotSave) {
                    scope.widgets = [];
                    if (doNotSave === true) {
                        return;
                    }
                    scope.saveDashboard();
                    dbService.clearDashboard(scope.dashboardid)
                };

                /**
                 * Save the layout of the dashboard
                 */
                scope.saveLayout = function (dashboardid) {
                    dbService.saveDashboard(dashboardid, scope.widgets);
                };

                /**
                 * Used for preventing default on click event
                 * @param {Object} event     A click event
                 * @param {Object} widgetDef A widget definition object
                 */
                scope.addWidgetInternal = function (event, widgetDef) {
                    event.preventDefault();
                    scope.addWidget(widgetDef);
                };

                /**
                 * Uses dashboardState service to save state
                 */
                scope.saveDashboard = function (force) {
                    if (!scope.options.explicitSave) {
                        scope.dashboardState.save(scope.widgets);
                    } else {
                        if (!angular.isNumber(scope.options.unsavedChangeCount)) {
                            scope.options.unsavedChangeCount = 0;
                        }
                        if (force) {
                            scope.options.unsavedChangeCount = 0;
                            scope.dashboardState.save(scope.widgets);

                        } else {
                            ++scope.options.unsavedChangeCount;
                        }
                    }
                };

                /**
                 * Wraps saveDashboard for external use.
                 */
                scope.externalSaveDashboard = function () {
                    scope.saveDashboard(true);
                };

                /**
                 * Clears current dash and instantiates widget definitions
                 * @param  {Array} widgets Array of definition objects
                 */
                scope.loadWidgets = function (widgets) {
                    // AW dashboards are continuously saved today (no "save" button).
                    //scope.defaultWidgets = widgets;
                    scope.savedWidgetDefs = widgets;
                    scope.clear(true);
                    _.each(widgets, function (widgetDef) {
                        scope.addWidget(widgetDef, true);
                    });
                };

                /**
                 * Resets widget instances to default config
                 * @return {[type]} [description]
                 */
                scope.resetWidgetsToDefault = function () {
                    scope.loadWidgets(scope.defaultWidgets);
                    scope.saveDashboard();
                };
                // Set default widgets array
                //var savedWidgetDefs = scope.dashboardState.load();
                var savedWidgetDefs = scope.dashboardState.loadFromDb(scope.dashboardid);
                // Success handler
                function handleStateLoad(saved) {
                    scope.options.unsavedChangeCount = 0;
                    if (saved && saved.length) {
                        scope.loadWidgets(saved);
                    } else if (scope.defaultWidgets) {
                        scope.loadWidgets(scope.defaultWidgets);
                    } else {
                        scope.clear(true);
                    }
                }

                if (angular.isArray(savedWidgetDefs)) {
                    handleStateLoad(savedWidgetDefs);
                } else if (savedWidgetDefs && angular.isObject(savedWidgetDefs) && angular.isFunction(savedWidgetDefs.then)) {
                    savedWidgetDefs.then(handleStateLoad, handleStateLoad);
                } else {
                    handleStateLoad();
                }

                // expose functionality externally
                // functions are appended to the provided dashboard options
                scope.options.addWidget = scope.addWidget;
                scope.options.loadWidgets = scope.loadWidgets;
                scope.options.saveDashboard = scope.externalSaveDashboard;


                // save state
                scope.$on('widgetChanged', function (event) {
                    dbService.updateWidget(event.targetScope.widget);
                    /*
                    event.stopPropagation();
                    scope.saveDashboard(); */
                });
            }
        };
    }]);
