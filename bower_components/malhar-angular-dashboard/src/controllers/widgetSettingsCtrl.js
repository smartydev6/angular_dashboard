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

angular.module('ui.dashboard')
  .controller('WidgetSettingsCtrl', ['$scope', '$rootScope', '$modalInstance', 'widget', 'googleService', 'mainService', function ($scope, $rootScope, $modalInstance, widget, googleService, mainService) {
    // add widget to scope
    $scope.widget = widget;
    // set up result object
    $scope.result = jQuery.extend(true, {}, widget);
	$scope.datasources = [{
         id : 'GA',
         value : 'Google Analytics'
      },
      {
         id : 'JSON',
         value : 'JSON'
      }
    ];
    $scope.ok = function () {
        $modalInstance.close($scope.result);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.changeDataSource = function(){
        if($scope.result.datasource == 'GA'){

        }
    };
    $scope.today = function() {
        if(!$scope.result.ga.dtStart) {
            $scope.result.ga.dtStart = new Date();
            $scope.result.ga.dtEnd = new Date();
        }
    };

    /* *
        In case of Data Source : Google Analytics
     */
    if(!$scope.result.ga)
        $scope.result.ga = {};
    if(!$scope.result.inheritData)
        $scope.result.inheritData = {ga : {}};
    if($scope.result.widgetSettings) {
        $scope.result.ga = $scope.result.widgetSettings.ga;
        $scope.result.datasource = $scope.result.widgetSettings.datasource;
        $scope.result.inheritData = $scope.result.widgetSettings.inheritData;
        console.log($scope.result.inheritData);
        if($scope.result.inheritData.ga.profileid)
            $scope.result.isInherit = 1;
    }
    else {
        if(!$scope.result.ga.dimModel)
            $scope.result.ga.dimModel = [];
        if(!$scope.result.ga.metModel)
            $scope.result.ga.metModel = [];
        $scope.result.ga.indicatorArrow = "Good";
        $scope.today();
    }
    $scope.result.ga.accounts = googleService.getAccounts();
    $scope.result.ga.properties = googleService.getProperties();
    $scope.result.ga.profiles = googleService.getProfiles();
    $scope.result.ga.daterange = {startDate : $scope.result.ga.dtStart, endDate : $scope.result.ga.dtEnd};
    $scope.result.ga.daterangearray = mainService.getDateRangeArray();
    $scope.result.ga.periods = ["Daily", "Weekly", "Monthly"];
    $scope.result.ga.showTimeline = $scope.result.attrs.showTimeline;
    $scope.result.ga.showIndicator  = $scope.result.attrs.showIndicator;

    $scope.result.inheritData.ga.accounts = googleService.getAccounts();
    $scope.result.inheritData.ga.properties = googleService.getProperties();
    $scope.result.inheritData.ga.profiles = googleService.getProfiles();

        var columns = googleService.getColumns();
    $scope.result.ga.dimData = columns.dimData;
    $scope.result.ga.metData = columns.metData;
    $scope.result.ga.getGroupField = function(item){
        return item.group;
    }
    $scope.result.ga.segments = googleService.getSegments();
    $scope.result.ga.dimSettings =  { scrollableHeight: '350px', scrollable: true };
    $scope.result.ga.metSettings =  { scrollableHeight: '350px', scrollable: true };
    $scope.daterangeopts = {
        ranges: {
            /*'Today': [moment(), moment()],
            'Yesterday': ['Yesterday', 'Today'],
            'Last 7 Days': [moment().subtract('days', 6), moment()],
            'Last 30 Days': [moment().subtract('days', 29), moment()],
            'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')],
            'Last Year': [moment().subtract('year', 1).startOf('month'), moment().subtract('month', 1).endOf('month')] */
        }
    };
    $scope.datepickerOptions = {
        format: 'yyyy-mm-dd',
        language: 'fr',
        startDate: "2012-10-01",
        endDate: "2012-10-31",
        autoclose: true,
        weekStart: 0
    }
    $scope.showWeeks = true;
    $scope.toggleWeeks = function() {
        return $scope.showWeeks = !$scope.showWeeks;
    };
    $scope.clear = function() {
        return $scope.dt = null;
    };
    $scope.toggleMin = function() {
        var _ref;
        return $scope.minDate = (_ref = $scope.minDate) != null ? _ref : {
            "null": new Date()
        };
    };
    $scope.toggleMin();
    $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
  }]);