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
  .controller('WidgetDisplayPrefersCtrl', ['$scope', '$rootScope', '$modalInstance', 'widget', 'googleService', function ($scope, $rootScope, $modalInstance, widget, googleService) {
    // add widget to scope
    $scope.result = jQuery.extend(true, {}, widget);
    if($scope.result.widgetDisplayPreferences)
        $scope.result.metArray = $scope.result.widgetDisplayPreferences.metArray;
    else {
        var metArray = [];
        for(i in widget.widgetSettings.ga.metModel){
            var metric = {id:widget.widgetSettings.ga.metModel[i]};
            metArray.push(metric);
        }
        $scope.result.metArray = metArray;

    }
    for(var i in $scope.result.metArray){
        $scope.result.metArray[i]['label'] = googleService.getColumnLabel($scope.result.metArray[i]['id']);
        if(_.isUndefined($scope.result.metArray[i]['indicatorArrow']))
            $scope.result.metArray[i]['indicatorArrow'] = "Good";
    }
    // set up result object
    $scope.ok = function () {
        $modalInstance.close($scope.result);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
  }]);