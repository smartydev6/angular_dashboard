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
    .directive('dashboard', ['WidgetModel', 'WidgetDefCollection', '$modal', 'DashboardState', '$log', 'googleService', 'dbService', 'reportService', '$filter',  'cfpLoadingBar', 'logger', function (WidgetModel, WidgetDefCollection, $modal, DashboardState, $log, googleService, dbService, reportService, $filter, cfpLoadingBar, logger) {
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
                    displayprefersModalOptions:{
                        templateUrl: 'template/widget-settings-displayprefers-template.html',
                        controller: 'WidgetDisplayPrefersCtrl'
                    },
                    onSettingsClose: function (result, widget, widget_scope) { // NOTE: dashboard scope is also passed as 3rd argument
                        /*var settings = {"datasource": result.datasource, "ga": {"accountid": result.ga.accountid, "accounts": result.ga.accounts, "propertyid": result.ga.propertyid,
                            "properties": result.ga.properties, "profileid": result.ga.profileid, "profiles": result.ga.profiles, "dimModel": result.ga.dimModel, "metModel": result.ga.metModel,
                            "daterangeType" : result.ga.daterangeType, "daterange" : result.ga.daterange, "period": result.ga.period, "segmentid": result.ga.segmentid, "indicatorArrow": result.ga.indicatorArrow
                        },"inheritData": result.inheritData}; */
                        var settings = {"datasource": result.datasource, "ga": {"accountid": result.ga.accountid, "propertyid": result.ga.propertyid,
                            "profileid": result.ga.profileid,  "dimModel": result.ga.dimModel, "metModel": result.ga.metModel,
                            "daterangeType" : result.ga.daterangeType, "daterange" : result.ga.daterange, "period": result.ga.period, "segmentid": result.ga.segmentid, "indicatorArrow": result.ga.indicatorArrow
                        },"inheritData": {ga:{accountid : result.inheritData.ga.accountid, propertyid: result.inheritData.ga.propertyid, profileid: result.inheritData.ga.profileid, daterange: result.inheritData.ga.daterange}}};
                        widget.title = result.title;
                        widget.widgetSettings = settings;
                        widget.widgetDisplayPreferences = null;
                        //jQuery.extend(true, widget, result);
                        scope.loadWidgetData(widget, widget_scope);
                    },
                    onSettingsDisplayPrefersClose: function(result, widget, widget_scope){
                        var preferences = {metArray : result.metArray};
                        widget.widgetDisplayPreferences = preferences;
                        dbService.updateWidget(widget);
                        scope.updateDisplayPreferences(widget);
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
            link: function (scope, element, attrs) {
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
                    if(widgetToInstantiate.settings) {
                        try {
                            widgetToInstantiate.widgetSettings = JSON.parse(widgetToInstantiate.settings);
                        }catch(e){
                            widgetToInstantiate.widgetSettings = null;
                        }
                    }
                    if(widgetToInstantiate.comparisons) {
                        try {
                            widgetToInstantiate.widgetCompDatas = JSON.parse(widgetToInstantiate.comparisons);
                        }catch(e){
                            widgetToInstantiate.widgetCompDatas = nlll;
                        }
                    }
                    if(!_.isUndefined(widgetToInstantiate.styles) && widgetToInstantiate.styles!=""){
                        var styles;
                        try {
                            styles = JSON.parse(widgetToInstantiate.styles);
                        }catch(e){
                            styles = null;
                        }
                        if(!_.isUndefined(styles) && styles!=null) {
                            if (styles.width)
                                widgetToInstantiate.style = {width: styles.width};
                            if (styles.height)
                                widgetToInstantiate.size = {height: styles.height};
                        }
                    }
                    if(widgetToInstantiate.dispprefer){
                        widgetToInstantiate.widgetDisplayPreferences = JSON.parse(widgetToInstantiate.dispprefer);
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
                        widget.content = widgetToInstantiate.data;
                    }
                    scope.widgets.push(widget);
                    /*
                        Store the widget in the database
                     */
                    if(!doNotSave) {
                        dbService.addWidget(widget).then(function (response) {
                            widget.id = response.widgetid;
                            if(scope.widgets.length > 1) {
                                var last_widget = scope.widgets[scope.widgets.length - 2];
                                var last_widget_id = last_widget.id;
                                var last_widget_element = jQuery("#widget" + last_widget_id);
                                $("#content").scrollTop(last_widget_element.offset().top + last_widget_element.height());
                            }
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

                scope.export = function(){
                    var out_widgets = [];
                    for(var i in scope.widgets){
                        var widget = scope.widgets[i];
                        var widgetData;
                        if(widget.widgetData)
                            widgetData = widget.widgetData;
                        else
                            widgetData = widget.dataModel.widgetScope.widgetData;
                        var twidget = {name : widget.name, dashboardid : widget.dashboardid, title : widget.title, data : widgetData}
                        out_widgets.push(twidget);
                    }
                    var dashboardData = encodeURI(JSON.stringify(out_widgets));
                    //reportService.exportToPdf(dashboardData);
                    var form1 = document.createElement("form");
                    form1.setAttribute("target", "iframeForReport");
                    form1.setAttribute("action", reportService.getServerUrl());
                    form1.setAttribute("method", "post");
                    form1.style.display = "none";

                    var hidden_userid = document.createElement("input");
                    hidden_userid.setAttribute("name", "userid");
                    hidden_userid.setAttribute("value", dbService.getCurrentUserId());
                    form1.appendChild(hidden_userid);
                    var hidden_dashboard = document.createElement("input");
                    hidden_dashboard.setAttribute("name", "dashboardData");
                    hidden_dashboard.setAttribute("value", dashboardData);
                    var dashboardTitle = scope.dashboard.title;
                    var hidden_dashboardname = document.createElement("input");
                    hidden_dashboardname.setAttribute("name", "dashboardTitle");
                    hidden_dashboardname.setAttribute("value", dashboardTitle);
                    form1.appendChild(hidden_dashboard);
                    form1.appendChild(hidden_dashboardname);
                    form1.submit();
                    form1.remove();
                }
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
                    Update the display preferences for the tablet
                    Currently : For only SuperScore  Good/Bad thing
                 */
                scope.updateDisplayPreferences = function(widget){
                    if(!_.isUndefined(widget.widgetDisplayPreferences)){
                        var datas = {action : "updatePreferences", preferences : widget.widgetDisplayPreferences};
                        widget.dataModel.updateScope(datas);
                    }
                }


                /*
                * Popuplate the widget with the data according to the settings and compdatas
                * @param {Object} widget The widget instance object
                 */

                scope.loadWidgetData = function (widget, widget_scope) {
                    if(widget == undefined)
                        return;
                    // Get Google Analytics Data Here
                    var columns = [], i, dimArray = [], metArray = [], labels = [];
                    var period = "";
                    var result;
                    if(widget.widgetSettings)
                        result = widget.widgetSettings;
                    else
                        result = widget;
                    if(!result.ga)
                        return;
                    switch(result.ga.daterangeType){
                        case "today":
                            result.ga.dtStart =  moment().format("YYYY-MM-DD");
                            result.ga.dtEnd = moment().format("YYYY-MM-DD");;
                            break;
                        case "yesterday":
                            result.ga.dtStart =  moment().subtract(1, 'days').format("YYYY-MM-DD");;
                            result.ga.dtEnd =  moment().subtract(1, 'days').format("YYYY-MM-DD");;
                            break;
                        case "last7":
                            result.ga.dtStart =  moment().subtract(7, 'days').format("YYYY-MM-DD");;
                            result.ga.dtEnd =  moment().subtract(1, 'days').format("YYYY-MM-DD");;
                            break;
                        case "last30":
                            result.ga.dtStart =  moment().subtract(30, 'days').format("YYYY-MM-DD");;
                            result.ga.dtEnd =  moment().subtract(1, 'days').format("YYYY-MM-DD");;
                            break;
                        case "prevmonth":
                            result.ga.dtStart = moment().subtract(1, 'months').startOf('month').format("YYYY-MM-DD");;
                            result.ga.dtEnd = moment().subtract(1, 'months').endOf('month').format("YYYY-MM-DD");;
                            break;
                        case "prevyear":
                            result.ga.dtStart = moment().subtract(1, 'years').startOf('month').format("YYYY-MM-DD");;
                            result.ga.dtEnd = moment().subtract(1, 'years').endOf('month').format("YYYY-MM-DD");;
                            break;
                        case "custom":
                            result.ga.dtStart = moment(result.ga.daterange.startDate).format("YYYY-MM-DD");
                            result.ga.dtEnd = moment(result.ga.daterange.endDate).format("YYYY-MM-DD");
                            break;
                    }
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
                            period
                        ];
                    }
                    for (i in result.ga.dimModel) {
                        columns.push(result.ga.dimModel[i]);
                        labels.push(googleService.getColumnLabel(result.ga.dimModel[i]));
                        dimArray.push(result.ga.dimModel[i]);
                    }
                    for (i in result.ga.metModel) {
                        columns.push(result.ga.metModel[i]);
                        labels.push(googleService.getColumnLabel(result.ga.metModel[i]));
                        metArray.push(result.ga.metModel[i]);
                    }
                    widget.isLoadingData = 1;
                    var profile = _.findWhere(googleService.getProfiles(), {id: result.ga.profileid});
                    googleService.loadAnalytics(profile, $filter('date')(result.ga.dtStart, 'yyyy-MM-dd'), $filter('date')(result.ga.dtEnd, 'yyyy-MM-dd'), dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                        var origindimArray = _.clone(dimArray);
                        var datas = {columns: columns, rows: data.rows, origin_rows : data.result.rows, labels: labels, dimArray: origindimArray, metArray: metArray, profile: data.profileInfo.profileName,
                            segment: googleService.getSegmentName(data.query.segment), preferences:widget.widgetDisplayPreferences};
                        var columnHeaders = data.columnHeaders;
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
                        }

                        if(widget.name == "KPI"){
                            // If the widget is KPI, get the previouis periods for comparisons
                            var value = data.result.rows[0][0];
                            var showvalue = data.rows[0][0];
                            var prev_enddate = moment(result.ga.dtStart).subtract(1, 'days');
                            var enddate = prev_enddate.format("YYYY-MM-DD");
                            var date_diff = moment(result.ga.dtEnd).diff(moment(result.ga.dtStart), 'days');
                            var prev_startdate = prev_enddate.subtract(date_diff, 'days');
                            googleService.loadAnalytics(profile, prev_startdate.format("YYYY-MM-DD"), enddate, dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                                var datas = {showvalue : showvalue, value : value, oldvalue : data.result.rows[0][0], label: labels[0], arrow:widget.widgetSettings.ga.indicatorArrow};
                                widget.dataModel.updateScope(datas);
                                widget.isLoadingData = 0;
                                widget.isError = 0;
                            });
                            return;
                        }

                        if(widget.name == "SuperScore"){
                            // If the widget is SuperScore, get the 3-months data for deviation calculation
                            dimArray.push("ga:date");
                            googleService.loadAnalytics(profile, moment().subtract(3, 'months').format("YYYY-MM-DD"), moment().format("YYYY-MM-DD"), dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                                var baseitems = data.result.rows;
                                var baserows = [];
                                var dimset = [], prevdimset = [];
                                var means = [], highs=[], lows = [];
                                for(i=0; i<metArray.length; i++)
                                    means[i] = 0;
                                var index = 0, m= 0, startindex=0;
                                for(i in baseitems){
                                    var row = baseitems[i];
                                    dimset = [];
                                    for(var k=0; k<dimArray.length-1;k++)
                                        dimset.push(baseitems[i][k]);
                                    if(_.difference(dimset, prevdimset)!=null && _.difference(dimset, prevdimset).length>0 && prevdimset.length>0){
                                        var row=[];
                                        for(k=0; k<dimset.length; k++){
                                            row.push(dimset[k]);
                                        }
                                        for(k=0;k<metArray.length;k++){
                                            means[k] = means[k] /index;
                                            var sigma = 0;
                                            for(var l=startindex; l<m; l++){
                                                sigma = sigma + (baseitems[l][dimArray.length+k]-means[k]) * (baseitems[l][dimArray.length+k]-means[k]);
                                            }
                                            sigma = sigma / (m-startindex);
                                            sigma = Math.sqrt(sigma);
                                            var low = means[k] -  1 * sigma;
                                            var high = means[k] + 1 * sigma;
                                            row.push({highvalue : high, lowvalue:low});
                                            baserows.push(row);
                                        }
                                        startindex = m;
                                        index=0;
                                    }else{
                                        for(var j=0; j<metArray.length;j++){
                                            means[j] = parseFloat(means[j]) + parseFloat(baseitems[i][dimArray.length+j]);
                                        }
                                        index++;
                                    }
                                    prevdimset = dimset;
                                    m++;
                                }
                                var row=[];
                                for(k=0; k<dimset.length; k++){
                                    row.push(dimset[k]);
                                }
                                for(k=0;k<metArray.length;k++){
                                    means[k] = means[k] /index;
                                    var sigma = 0;
                                    for(var l=startindex; l<m; l++){
                                        if(isNaN(baseitems[l][dimArray.length+k])==false)
                                            sigma = sigma + parseFloat(baseitems[l][dimArray.length+k]-means[k]) * parseFloat(baseitems[l][dimArray.length+k]-means[k]);
                                    }
                                    sigma = sigma / (m-startindex);
                                    sigma = Math.sqrt(sigma);
                                    var low = means[k] -  1 * sigma;
                                    var high = means[k] + 1 * sigma;
                                    row.push({highvalue : high, lowvalue:low});
                                }
                                baserows.push(row);
                                datas.baserows = baserows;
                                scope.loadWidgetCompData(widget, datas);
                                widget.isLoadingData = 0;
                                widget.isError = 0;
                            });
                            return;
                        }
                        var items = data.rows;
                        /**
                         * If inherit data exists, load the data for the inherit data
                         */
                        if(result.inheritData.ga && result.inheritData.ga.profileid){
                            var inheritProfile = _.findWhere(googleService.getProfiles(), {id:result.inheritData.ga.profileid});
                            console.log(result.inheritData);
                            result.inheritData.ga.dtStart = result.inheritData.ga.daterange.startDate;
                            result.inheritData.ga.dtEnd = result.inheritData.ga.daterange.endDate;
                            googleService.loadAnalytics(inheritProfile, $filter('date')(result.inheritData.ga.dtStart, 'yyyy-MM-dd'), $filter('date')(result.inheritData.ga.dtEnd, 'yyyy-MM-dd'),
                                dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                                var rows = data.rows;
                                if (widget.attrs.showTimeline == 1){
                                    var merged_rows = _.union(rows, datas.rows);
                                    datas.rows = merged_rows;
                                }else{
                                    /*
                                        Table Wdiget
                                     */
                                    var date_diff = moment(result.ga.dtEnd).diff(moment(result.ga.dtStart), 'days') + 1;
                                    var inherit_date_diff = moment(result.ga.dtEnd).diff(moment(result.ga.dtStart), 'days') + 1;
                                    for(var i in datas.rows){
                                        for(var j=result.ga.metModel.length; j<(result.ga.dimModel.length + result.ga.metModel.length); j++){
                                            switch(columnHeaders[j].dataType){
                                                case "INTEGER":case "FLOAT":
                                                    datas.rows[i][j] = parseInt(datas.rows[i][j]) + parseInt(rows[i][j]);
                                                    break;
                                                case "PERCENTAGE":
                                                    datas.rows[i][j] = (datas.rows[i][j] * date_diff +  rows[i][j] * inherit_date_diff) / (date_diff + inherit_date_diff);
                                                    break;
                                                /*default:
                                                    datas.rows[i][j] += rows[i][j]; */
                                            }

                                        }
                                    }
                                }
                                // Update the widget data
                                scope.loadWidgetCompData(widget, datas);
                            });
                        }else{
                            scope.loadWidgetCompData(widget, datas);
                        }
                        widget.isLoadingData = 0;
                        widget.isError = 0;

                    },function (error){
                            widget.isError = 1;
                        }
                    );

                    //scope.saveDashboard();
                };

                scope.loadWidgetCompData = function(widget, datas){
                    var result, compDatas, period;
                    var dimArray = [], metArray = [], columns = [], labels =[];
                    if(widget.widgetSettings)
                        result = widget.widgetSettings;
                    else
                        result = widget;
                    if(widget.widgetCompDatas)
                        compDatas = widget.widgetCompDatas;
                    else
                        compDatas = widget.compDatas;
                    var compIndex = 0;
                    var compdatas  = [];
                    if(compDatas == undefined || compDatas.length == 0){
                        //widget.rawData = datas;
                        widget.dataModel.updateScope({datas:datas});
                        return;
                    }
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
                            period
                        ];
                    }
                    for (i in result.ga.dimModel) {
                        columns.push(result.ga.dimModel[i]);
                        labels.push(googleService.getColumnLabel(result.ga.dimModel[i]));
                        dimArray.push(result.ga.dimModel[i]);
                    }
                    for (i in result.ga.metModel) {
                        columns.push(result.ga.metModel[i]);
                        labels.push(googleService.getColumnLabel(result.ga.metModel[i]));
                        metArray.push(result.ga.metModel[i]);
                    }
                    for (var i in compDatas) {
                        var ga = compDatas[i].ga;
                        var subprofile = _.findWhere(googleService.getProfiles(), {id: ga.profileid});
                        googleService.loadAnalytics(subprofile, $filter('date')(result.ga.dtStart, 'yyyy-MM-dd'), $filter('date')(result.ga.dtEnd, 'yyyy-MM-dd'), dimArray.toString(), metArray.toString(), ga.segmentid, 25).then(function (data) {
                            var c_items = data.rows;
                            var c_datas = {columns: columns, origin_rows: data.result.rows, rows: c_items, labels: labels, addnew: 1, profile: data.profileInfo.profileName, segment: googleService.getSegmentName(data.query.segment)};
                            if(widget.name == "SuperScore"){
                                // If the widget is SuperScore, get the 3-months data for deviation calculation
                                dimArray.push("ga:date");
                                googleService.loadAnalytics(subprofile, moment().subtract(3, 'months').format("YYYY-MM-DD"), moment().format("YYYY-MM-DD"), dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                                    var baseitems = data.result.rows;
                                    var baserows = [];
                                    var dimset = [], prevdimset = [];
                                    var means = [], highs=[], lows = [];
                                    for(i=0; i<metArray.length; i++)
                                        means[i] = 0;
                                    var index = 0, m= 0, startindex=0;
                                    for(i in baseitems){
                                        var row = baseitems[i];
                                        dimset = [];
                                        for(var k=0; k<dimArray.length-1;k++)
                                            dimset.push(baseitems[i][k]);
                                        if(_.difference(dimset, prevdimset)!=null && _.difference(dimset, prevdimset).length>0 && prevdimset.length>0){
                                            var row=[];
                                            for(k=0; k<dimset.length; k++){
                                                row.push(dimset[k]);
                                            }
                                            for(k=0;k<metArray.length;k++){
                                                means[k] = means[k] /index;
                                                var sigma = 0;
                                                for(var l=startindex; l<m; l++){
                                                    sigma = sigma + (baseitems[l][dimArray.length+k]-means[k]) * (baseitems[l][dimArray.length+k]-means[k]);
                                                }
                                                sigma = sigma / (m-startindex);
                                                sigma = Math.sqrt(sigma);
                                                var low = means[k] -  1 * sigma;
                                                var high = means[k] + 1 * sigma;
                                                row.push({highvalue : high, lowvalue:low});
                                                baserows.push(row);
                                                index=0;
                                            }
                                            startindex = m;
                                        }else{
                                            for(var j=0; j<metArray.length;j++){
                                                means[j] = parseFloat(means[j]) + parseFloat(baseitems[i][dimArray.length+j]);
                                            }
                                            index++;
                                        }
                                        prevdimset = dimset;
                                        m++;
                                    }
                                    var row=[];
                                    for(k=0; k<dimset.length; k++){
                                        row.push(dimset[k]);
                                    }
                                    for(k=0;k<metArray.length;k++){
                                        means[k] = means[k] /index;
                                        var sigma = 0;
                                        for(var l=startindex; l<m; l++){
                                            sigma = sigma + (baseitems[l][dimArray.length+k]-means[k]) * (baseitems[l][dimArray.length+k]-means[k]);
                                        }
                                        sigma = sigma / (m-startindex);
                                        sigma = Math.sqrt(sigma);
                                        var low = means[k] -  1 * sigma;
                                        var high = means[k] + 1 * sigma;
                                        row.push({highvalue : high, lowvalue:low});
                                        index=0;
                                    }
                                    baserows.push(row);
                                    c_datas.baserows = baserows;
                                    compdatas.push(c_datas);
                                    compIndex++;
                                    if (compIndex == compDatas.length) {
                                        var overall = {datas: datas, compdatas: compdatas};
                                        widget.dataModel.updateScope(overall);
                                    }
                                    widget.isLoadingData = 0;
                                });
                                return;
                            }
                            compdatas.push(c_datas);
                            compIndex++;
                            if (compIndex == compDatas.length) {
                                var overall = {datas: datas, compdatas: compdatas};
                                widget.dataModel.updateScope(overall);
                            }
                            widget.isLoadingData = 0;
                            //scope.saveDashboard();
                        }, function (reason) {
                            compIndex++;
                            if (compIndex == compDatas.length) {
                                var overall = {datas: datas, compdatas: compdatas};
                                widget.dataModel.updateScope(overall);
                            }
                        });
                    }
                };

                /**
                 * Save the widget manually (for note widget)
                 */
                 scope.saveWidget = function (widget, widget_scope) {
                    if(widget.directive = "wt-note"){
                        var note_content = widget_scope.$$prevSibling.content;
                        widget.content = note_content;
                        widget.widgetData = note_content;
                        dbService.updateWidget(widget).then(function(response){
                            var data = {hideEditor : 1};
                            widget.attrs.isSaved = 1;
                            widget.dataModel.updateScope(data);
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
                 * Opens a dialog for widget preferences for display
                 *    At this moment : Only for SuperScore Widget
                 * @param  {Object} widget The widget instance object
                 */
                scope.openWidgetDisplayPrefers = function (widget, widget_scope) {

                    // Set up $modal options
                    var options = _.defaults(
                        { scope: scope },
                        widget.displayprefersModalOptions,
                        scope.options.displayprefersModalOptions);

                    // Ensure widget is resolved
                    options.resolve = {
                        widget: function () {
                            return widget;
                        }
                    };
                    // Create the modal
                    var modalInstance = $modal.open(options);
                    var onClose = widget.onSettingsDisplayPrefersClose || scope.options.onSettingsDisplayPrefersClose;
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
                    cfpLoadingBar.start();
                    dbService.saveDashboard(dashboardid, scope.widgets).then(function(result){
                        if(result.result == true){
                            logger.logSuccess("Dashboard successfully saved.");
                        }
                    });
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
                    console.log(widgets);
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
