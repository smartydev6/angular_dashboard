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
  .controller('WidgetSettingsCompsCtrl', ['$scope', '$rootScope', '$modalInstance', 'widget', 'googleService', function ($scope, $rootScope, $modalInstance, widget, googleService) {
    // add widget to scope
    $scope.widget = widget;
    // set up result object
    $scope.result = jQuery.extend(true, {}, widget);
    if(!$scope.dscount)
        $scope.dscount = 1;
    $scope.currentindex = 1;
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
    if(!$scope.result.compDatas)
        $scope.result.compDatas = [{
            index : 1,
            ga : {}
        }];
    if($scope.result.widgetCompDatas){
        $scope.result.compDatas = $scope.result.widgetCompDatas;
        $scope.dscount = $scope.result.compDatas.length;
    }

    $scope.new = function(){
        $scope.dscount ++;
        var compdata = {
            ga : {},
            index: $scope.dscount
        };
        $scope.result.compDatas.push(compdata);
    };
    $scope.gotoprev = function(){
        if($scope.currentindex > 1)
            $scope.currentindex--;
    };

    $scope.gotonext = function(){
        if($scope.currentindex < $scope.dscount)
            $scope.currentindex++;
    };
    $scope.changeDataSource = function(compData){
        if(compData.datasource == 'GA'){
            //Data Source : Google Analytics
            googleService.login().then(function (data) {
                compData.ga.accounts = data.items;
            }, function (err) {

            });
        }
    };
    /* *
        In case of Data Source : Google Analytics
     */
    if(!$scope.result.ga)
        $scope.result.ga = {};
    $scope.result.ga.segments = googleService.getSegments();
    $scope.result.ga.accounts = googleService.getAccounts();
    $scope.result.ga.properties = googleService.getProperties();
    $scope.result.ga.profiles = googleService.getProfiles();
  }]);