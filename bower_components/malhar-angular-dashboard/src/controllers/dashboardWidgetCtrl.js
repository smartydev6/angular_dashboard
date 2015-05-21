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
  .controller('DashboardWidgetCtrl', ['$scope', '$element', '$compile', '$window', '$timeout', 'reportService', 'dbService', 'mainService',
    function($scope, $element, $compile, $window, $timeout, reportService, dbService, mainService) {

      $scope.status = {
        isopen: false
      };

      // Fills "container" with compiled view
      $scope.makeTemplateString = function() {

        var widget = $scope.widget;

        // First, build template string
        var templateString = '';

        if (widget.templateUrl) {

          // Use ng-include for templateUrl
          templateString = '<div ng-include="\'' + widget.templateUrl + '\'"></div>';

        } else if (widget.template) {

          // Direct string template
          templateString = widget.template;

        } else {

          // Assume attribute directive
          templateString = '<div ' + widget.directive;

          // Check if data attribute was specified
          if (widget.dataAttrName) {
            widget.attrs = widget.attrs || {};
            widget.attrs[widget.dataAttrName] = 'widgetData';
          }

          // Check for specified attributes
          if (widget.attrs) {

            // First check directive name attr
            if (widget.attrs[widget.directive]) {
              templateString += '="' + widget.attrs[widget.directive] + '"';
            }

            // Add attributes
            _.each(widget.attrs, function(value, attr) {

              // make sure we aren't reusing directive attr
              if (attr !== widget.directive) {
                templateString += ' ' + attr + '="' + value + '"';
              }

            });
          }
          templateString += '></div>';
        }
        return templateString;
      };

      $scope.grabResizer = function(e) {

        var widget = $scope.widget;
        var widgetElm = $element.find('.widget');

        // ignore middle- and right-click
        if (e.which !== 1) {
          return;
        }

        e.stopPropagation();
        e.originalEvent.preventDefault();

        // get the starting horizontal position
        var initX = e.clientX;
        // console.log('initX', initX);

        // Get the current width of the widget and dashboard
        var pixelWidth = widgetElm.width();
        var pixelHeight = widgetElm.height();
        var widgetStyleWidth = widget.containerStyle.width;
        var widthUnits = widget.widthUnits;
        var unitWidth = parseFloat(widgetStyleWidth);

        // create marquee element for resize action
        var $marquee = angular.element('<div class="widget-resizer-marquee" style="height: ' + pixelHeight + 'px; width: ' + pixelWidth + 'px;"></div>');
        widgetElm.append($marquee);

        // determine the unit/pixel ratio
        var transformMultiplier = unitWidth / pixelWidth;

        // updates marquee with preview of new width
        var mousemove = function(e) {
          var curX = e.clientX;
          var pixelChange = curX - initX;
          var newWidth = pixelWidth + pixelChange;
          $marquee.css('width', newWidth + 'px');
        };

        // sets new widget width on mouseup
        var mouseup = function(e) {
          // remove listener and marquee
          jQuery($window).off('mousemove', mousemove);
          $marquee.remove();

          // calculate change in units
          var curX = e.clientX;
          var pixelChange = curX - initX;
          var unitChange = Math.round(pixelChange * transformMultiplier * 100) / 100;

          // add to initial unit width
          var newWidth = unitWidth * 1 + unitChange;
          widget.setWidth(newWidth + widthUnits);
          $scope.$emit('widgetChanged', widget);
          $scope.$apply();
          $scope.$broadcast('widgetResized', {
            width: newWidth
          });
        };

        jQuery($window).on('mousemove', mousemove).one('mouseup', mouseup);
      };

      //TODO refactor
      $scope.grabSouthResizer = function(e) {
        var widgetElm = $element.find('.widget');

        // ignore middle- and right-click
        if (e.which !== 1) {
          return;
        }

        e.stopPropagation();
        e.originalEvent.preventDefault();

        // get the starting horizontal position
        var initY = e.clientY;
        // console.log('initX', initX);

        // Get the current width of the widget and dashboard
        var pixelWidth = widgetElm.width();
        var pixelHeight = widgetElm.height();

        // create marquee element for resize action
        var $marquee = angular.element('<div class="widget-resizer-marquee" style="height: ' + pixelHeight + 'px; width: ' + pixelWidth + 'px;"></div>');
        widgetElm.append($marquee);

        // updates marquee with preview of new height
        var mousemove = function(e) {
          var curY = e.clientY;
          var pixelChange = curY - initY;
          var newHeight = pixelHeight + pixelChange;
          $marquee.css('height', newHeight + 'px');
        };

        // sets new widget width on mouseup
        var mouseup = function(e) {
          // remove listener and marquee
          jQuery($window).off('mousemove', mousemove);
          $marquee.remove();

          // calculate height change
          var curY = e.clientY;
          var pixelChange = curY - initY;

          //var widgetContainer = widgetElm.parent(); // widget container responsible for holding widget width and height
          var widgetContainer = widgetElm.find('.widget-content');

          var diff = pixelChange;
          var height = parseInt(widgetContainer.css('height'), 10);
          var newHeight = (height + diff);

          //$scope.widget.style.height = newHeight + 'px';

          $scope.widget.setHeight(newHeight + 'px');

          $scope.$emit('widgetChanged', $scope.widget);
          $scope.$apply(); // make AngularJS to apply style changes

          $scope.$broadcast('widgetResized', {
            height: newHeight
          });
        };

        jQuery($window).on('mousemove', mousemove).one('mouseup', mouseup);
      };

      // replaces widget title with input
      $scope.editTitle = function(widget) {
        var widgetElm = $element.find('.widget');
        widget.editingTitle = true;
        // HACK: get the input to focus after being displayed.
        $timeout(function() {
          widgetElm.find('form.widget-title input:eq(0)').focus()[0].setSelectionRange(0, 9999);
        });
      };

      // saves whatever is in the title input as the new title
      $scope.saveTitleEdit = function(widget) {
        widget.editingTitle = false;
        $scope.$emit('widgetChanged', widget);
      };

      $scope.exportWidget = function(widget){
          var svg = $element.find('svg').get(0);

          var form1 = document.createElement("form");
          form1.setAttribute("target", "iframeForReport");
          form1.setAttribute("action", reportService.PDFUrl);
          form1.setAttribute("method", "post");
          form1.style.display = "none";

          var hidden1 = document.createElement("input");
          hidden1.setAttribute("name", "data");
          hidden1.setAttribute("id", "data");

          if(svg) {

              canvas = $element.find('canvas').get(0);
              canvg('canvas', svg.outerHTML);
              hidden1.setAttribute("value", canvas.toDataURL());
              form1.appendChild(hidden1);
              form1.submit();
              form1.remove();
          }else{
            var canvas = $element.find('canvas');
            if(canvas){
                canvas = canvas.get(0);
                hidden1.setAttribute("value", canvas.toDataURL());
                form1.appendChild(hidden1);
                form1.submit();
                form1.remove();
            }
          }
      }
        $scope.getWidgetDateRange = function(widget){
            if(widget.widgetSettings.ga.daterangeType != "custom")
                return mainService.getDateRangeLabel(widget.widgetSettings.ga.daterangeType);
            else
                return widget.widgetSettings.ga.dtStart + " ~ " + widget.widgetSettings.ga.dtStart;
        }
       /* $scope.saveWidget = function (widget, widget_scope) {
            var data = {hideEditor : 1};
            widget.attrs.isSaved = 1;
            widget.dataModel.updateScope(data);
            if(widget.directive = "wt-note"){
                console.log(widget);
                console.log(widget_scope);
                var note_content = widget_scope.$$nextSibling.$$nextSibling.content;
                widget.content = note_content;
                dbService.updateWidget(widget).then(function(response){
                    //alert("Successfully saved");
                });
            }
        };*/

        $scope.editWidget = function (widget, widget_scope) {
            var data = {hideEditor : 0};
            widget.attrs.isSaved = 0;
            widget.dataModel.updateScope(data);
        };

        $scope.compileTemplate = function() {
        var container = $scope.findWidgetContainer($element);
        var templateString = $scope.makeTemplateString();
        var widgetElement = angular.element(templateString);

        container.empty();
        container.append(widgetElement);
        $compile(widgetElement)($scope);
      };

      $scope.findWidgetContainer = function(element) {
        // widget placeholder is the first (and only) child of .widget-content
        return element.find('.widget-content');
      };
    }
  ]);