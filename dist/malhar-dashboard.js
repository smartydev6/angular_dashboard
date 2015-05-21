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
    .directive('dashboard', ['WidgetModel', 'WidgetDefCollection', '$modal', 'DashboardState', '$log', 'googleService', '$filter', function (WidgetModel, WidgetDefCollection, $modal, DashboardState, $log, googleService, $filter) {
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
                            "dtStart": result.ga.dtStart, "dtEnd": result.ga.dtEnd, "period": result.ga.period, "segmentid": result.ga.segmentid
                        }};
                        //widget.dataModel.updateSettings(settings);
                        widget.widgetSettings = settings;
                        jQuery.extend(true, widget, result);
                        scope.loadWidgetData(widget, widget_scope);
                    },
                    onSettingsCompsClose: function (result, widget, widget_scope) { // NOTE: dashboard scope is also passed as 3rd argument
                        //widget.dataModel.updateCompDatatSources(result.compDatas);
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

                    // Instantiation
                    var widget = new WidgetModel(widgetToInstantiate, {
                        title: title
                    });
                    scope.widgets.push(widget);
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
                    console.log(widget);
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
                    googleService.loadAnalytics(result.ga.profileid, $filter('date')(result.ga.dtStart, 'yyyy-MM-dd'), $filter('date')(result.ga.dtEnd, 'yyyy-MM-dd'), dimArray.toString(), metArray.toString(), result.ga.segmentid, 25).then(function (data) {
                        var items = data.rows;
                        var datas = {columns: columns, rows: items, labels: labels, addnew : 0, profile: data.profileInfo.profileName, segment: googleService.getSegmentName(data.query.segment)};
                        console.log(datas);
                        widget.dataModel.updateScope(datas);
                        widget.isLoadingData = 0;
                        //scope.saveDashboard();
                        for (i in compDatas) {
                            var ga = compDatas[i].ga;
                            googleService.loadAnalytics(ga.profileid, $filter('date')(result.ga.dtStart, 'yyyy-MM-dd'), $filter('date')(result.ga.dtEnd, 'yyyy-MM-dd'), dimArray.toString(), metArray.toString(), ga.segmentid, 25).then(function (data) {
                                var items = data.rows;
                                var datas = {columns: columns, rows: items, labels: labels, addnew : 1, profile: data.profileInfo.profileName, segment: googleService.getSegmentName(data.query.segment)};
                                widget.dataModel.updateScope(datas);
                                widget.isLoadingData = 0;
                                //scope.saveDashboard();
                            });
                        }
                    });
                    scope.saveDashboard();
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
                var savedWidgetDefs = scope.dashboardState.load();
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
                    event.stopPropagation();
                    scope.saveDashboard();
                });
            }
        };
    }]);

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
  .directive('dashboardLayouts', ['LayoutStorage', '$timeout', '$modal',
    function(LayoutStorage, $timeout, $modal) {
      return {
        scope: true,
        templateUrl: function(element, attr) {
          return attr.templateUrl ? attr.templateUrl : 'template/dashboard-layouts.html';
        },
        link: function(scope, element, attrs) {

          scope.options = scope.$eval(attrs.dashboardLayouts);

          var layoutStorage = new LayoutStorage(scope.options);

          scope.layouts = layoutStorage.layouts;

          scope.createNewLayout = function() {
            var newLayout = {
              title: 'Custom',
              defaultWidgets: scope.options.defaultWidgets || []
            };
            layoutStorage.add(newLayout);
            scope.makeLayoutActive(newLayout);
            layoutStorage.save();
            return newLayout;
          };

          scope.removeLayout = function(layout) {
            layoutStorage.remove(layout);
            layoutStorage.save();
          };

          scope.makeLayoutActive = function(layout) {

            var current = layoutStorage.getActiveLayout();

            if (current && current.dashboard.unsavedChangeCount) {
              var modalInstance = $modal.open({
                templateUrl: 'template/save-changes-modal.html',
                resolve: {
                  layout: function() {
                    return layout;
                  }
                },
                controller: 'SaveChangesModalCtrl'
              });

              // Set resolve and reject callbacks for the result promise
              modalInstance.result.then(
                function() {
                  current.dashboard.saveDashboard();
                  scope._makeLayoutActive(layout);
                },
                function() {
                  scope._makeLayoutActive(layout);
                }
              );
            } else {
              scope._makeLayoutActive(layout);
            }

          };

          scope._makeLayoutActive = function(layout) {
            angular.forEach(scope.layouts, function(l) {
              if (l !== layout) {
                l.active = false;
              } else {
                l.active = true;
              }
            });
            layoutStorage.save();
          };

          scope.isActive = function(layout) {
            return !!layout.active;
          };

          scope.editTitle = function(layout) {
            var input = element.find('input[data-layout="' + layout.id + '"]');
            layout.editingTitle = true;

            $timeout(function() {
              input.focus()[0].setSelectionRange(0, 9999);
            });
          };

          // saves whatever is in the title input as the new title
          scope.saveTitleEdit = function(layout) {
            layout.editingTitle = false;
            layoutStorage.save();
          };

          scope.options.saveLayouts = function() {
            layoutStorage.save(true);
          };
          scope.options.addWidget = function() {
            var layout = layoutStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.addWidget.apply(layout.dashboard, arguments);
            }
          };
          scope.options.loadWidgets = function() {
            var layout = layoutStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.loadWidgets.apply(layout.dashboard, arguments);
            }
          };
          scope.options.saveDashboard = function() {
            var layout = layoutStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.saveDashboard.apply(layout.dashboard, arguments);
            }
          };

          var sortableDefaults = {
            stop: function() {
              scope.options.saveLayouts();
            },
          };
          scope.sortableOptions = angular.extend({}, sortableDefaults, scope.options.sortableOptions || {});
        }
      };
    }
  ]);
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
  .directive('widget', ['$injector', function ($injector) {

    return {

      controller: 'DashboardWidgetCtrl',

      link: function (scope) {

        var widget = scope.widget;
        var dataModelType = widget.dataModelType;
        // set up data source
        if (dataModelType) {
          var DataModelConstructor; // data model constructor function

          if (angular.isFunction(dataModelType)) {
            DataModelConstructor = dataModelType;
          } else if (angular.isString(dataModelType)) {
            $injector.invoke([dataModelType, function (DataModelType) {
              DataModelConstructor = DataModelType;
            }]);
          } else {
            throw new Error('widget dataModelType should be function or string');
          }

          var ds;
          if (widget.dataModelArgs) {
            ds = new DataModelConstructor(widget.dataModelArgs);
          } else {
            ds = new DataModelConstructor();
          }
          widget.dataModel = ds;
          ds.setup(widget, scope);
          ds.init();
          widget.dataModel.updateScope(widget.widgetData);
          scope.$on('$destroy', _.bind(ds.destroy,ds));
        }

        // Compile the widget template, emit add event
        scope.compileTemplate();
        scope.$emit('widgetAdded', widget);

      }

    };
  }]);

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
  .controller('DashboardWidgetCtrl', ['$scope', '$element', '$compile', '$window', '$timeout',
    function($scope, $element, $compile, $window, $timeout) {

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
  .controller('SaveChangesModalCtrl', ['$scope', '$modalInstance', 'layout', function ($scope, $modalInstance, layout) {
    
    // add layout to scope
    $scope.layout = layout;

    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };
  }]);
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
    function GA(){

    }
    $scope.ga = new GA();
      $scope.ga.changeAccount = function(compData){
        googleService.loadWebproperties(compData.ga.accountid).then(function(data){
          compData.ga.properties = data.items;
        }, function (err){

        }
        );
      };
      $scope.ga.changeProperty = function(compData){
        googleService.loadProfiles(compData.ga.accountid, compData.ga.propertyid).then(function(data){
          compData.ga.profiles = data.items;
        }, function(err){

        }
        );
      };
  }]);
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
  .controller('WidgetSettingsCtrl', ['$scope', '$rootScope', '$modalInstance', 'widget', 'googleService', function ($scope, $rootScope, $modalInstance, widget, googleService) {
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
            //Data Source : Google Analytics
            googleService.login().then(function (data) {
                $scope.result.ga.accounts = data.items;
                $scope.result.authorized = 1;
            }, function (err) {
                $scope.result.authorized = 0;
            });
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

    if($scope.result.widgetSettings) {
        $scope.result.ga = $scope.result.widgetSettings.ga;
        $scope.result.datasource = $scope.result.widgetSettings.datasource;
    }
    else {
        if(!$scope.result.ga.dimModel)
            $scope.result.ga.dimModel = [];
        if(!$scope.result.ga.metModel)
            $scope.result.ga.metModel = [];
        $scope.today();
    }
    $scope.result.ga.periods = ["Daily", "Weekly", "Monthly"];
    $scope.result.ga.showTimeline = $scope.result.attrs.showTimeline;
    var columns = googleService.getColumns();
    $scope.result.ga.dimData = columns.dimData;
    $scope.result.ga.metData = columns.metData;
    $scope.result.ga.segments = googleService.getSegments();
    $scope.result.ga.dimSettings =  { scrollableHeight: '350px', scrollable: true };
    $scope.result.ga.metSettings =  { scrollableHeight: '350px', scrollable: true };
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

    function GA(){

    }

    $scope.ga = new GA();
      $scope.ga.changeAccount = function(){
        googleService.loadWebproperties($scope.result.ga.accountid).then(function(data){
          $scope.result.ga.properties = data.items;
        }, function (err){

        }
        );
      };
      $scope.ga.changeProperty = function(){
        googleService.loadProfiles($scope.result.ga.accountid, $scope.result.ga.propertyid).then(function(data){
          $scope.result.ga.profiles = data.items;
        }, function(err){

        }
        );
      };
      $scope.ga.changeProfile = function(){
          googleService.loadCustomVars($scope.result.ga.accountid, $scope.result.ga.propertyid, $scope.result.ga.profileid).then(function(goals){
            var metArray = $scope.result.ga.metData;
            var index, startindex = 0, completionindex = 0, valueindex = 0;
            for(index in metArray){
                var metric = metArray[index];
                if(metric.id == "ga:goalXXStarts")startindex =index;
                if(metric.id == "ga:goalXXCompletions")completionindex =index;
                if(metric.id == "ga:goalXXValue")valueindex =index;
            }
            var metArray_new = [];
            var j = 0;
            for(var i in goals){
                var goalstart_metric = {id : "ga:goal" + goals[i]["id"] + "Starts", label :  "goal" + goals[i]["id"] + "Starts", group : "Goal Conversions"};
                metArray.splice(startindex * 1+j, 0, goalstart_metric);
                var goalcompletion_metric = {id : "ga:goal" + goals[i]["id"] + "Completions", label :  "goal" + goals[i]["id"] + "Completions", group : "Goal Conversions"};
                metArray.splice(completionindex * 1+1+2*j, 0, goalcompletion_metric);
                var goalvalue_metric = {id : "ga:goal" + goals[i]["id"] + "Value", label :  "goal" + goals[i]["id"] + "Value", group : "Goal Conversions"};
                metArray.splice(valueindex * 1+2+3*j, 0, goalvalue_metric);
                j++;
            }
            $scope.result.ga.metData = metArray;
          }, function(err){

          });
      };
  }]);
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
  .factory('DashboardState', ['$log', '$q', 'dbService', function ($log, $q, dbService) {
    function DashboardState(storage, id, hash, widgetDefinitions, stringify) {
      this.storage = storage;
      this.id = id;
      this.hash = hash;
      this.widgetDefinitions = widgetDefinitions;
      this.stringify = stringify;
    }

    DashboardState.prototype = {
      /**
       * Takes array of widget instance objects, serializes, 
       * and saves state.
       * 
       * @param  {Array} widgets  scope.widgets from dashboard directive
       * @return {Boolean}        true on success, false on failure
       */
      save: function (widgets) {
        if (!this.storage) {
          return true;
        }

        var serialized = _.map(widgets, function (widget) {
          var widgetObject = {
            title: widget.title,
            name: widget.name,
            style: widget.style,
            size: widget.size,
            dataModelOptions: widget.dataModelOptions,
            storageHash: widget.storageHash,
            attrs: widget.attrs,
            widgetSettings: widget.widgetSettings,
            widgetCompDatas: widget.widgetCompDatas
          };

          return widgetObject;
        });

        var item = { widgets: serialized, hash: this.hash };

        if (this.stringify) {
          item = JSON.stringify(item);
        }

        dbService.saveStorage(this.id, item);
        this.storage.setItem(this.id, item);
        return true;
      },

      /**
       * Loads dashboard state from the storage object.
       * Can handle a synchronous response or a promise.
       * 
       * @return {Array|Promise} Array of widget definitions or a promise
       */
      load: function () {

        if (!this.storage) {
          return null;
        }

        var serialized;

        // try loading storage item
        serialized = this.storage.getItem( this.id );

        if (serialized) {
          // check for promise
          if (angular.isObject(serialized) && angular.isFunction(serialized.then)) {
            return this._handleAsyncLoad(serialized);
          }
          // otherwise handle synchronous load
          return this._handleSyncLoad(serialized);
        } else {
          return null;
        }
      },

      _handleSyncLoad: function(serialized) {

        var deserialized, result = [];

        if (!serialized) {
          return null;
        }

        if (this.stringify) {
          try { // to deserialize the string

            deserialized = JSON.parse(serialized);

          } catch (e) {

            // bad JSON, log a warning and return
            $log.warn('Serialized dashboard state was malformed and could not be parsed: ', serialized);
            return null;

          }
        }
        else {
          deserialized = serialized;
        }

        // check hash against current hash
        if (deserialized.hash !== this.hash) {

          $log.info('Serialized dashboard from storage was stale (old hash: ' + deserialized.hash + ', new hash: ' + this.hash + ')');
          this.storage.removeItem(this.id);
          return null;

        }

        // Cache widgets
        var savedWidgetDefs = deserialized.widgets;
        // instantiate widgets from stored data
        for (var i = 0; i < savedWidgetDefs.length; i++) {

          // deserialized object
          var savedWidgetDef = savedWidgetDefs[i];

          // widget definition to use
          var widgetDefinition = this.widgetDefinitions.getByName(savedWidgetDef.name);

          // check for no widget
          if (!widgetDefinition) {
            // no widget definition found, remove and return false
            $log.warn('Widget with name "' + savedWidgetDef.name + '" was not found in given widget definition objects');
            continue;
          }

          // check widget-specific storageHash
          if (widgetDefinition.hasOwnProperty('storageHash') && widgetDefinition.storageHash !== savedWidgetDef.storageHash) {
            // widget definition was found, but storageHash was stale, removing storage
            $log.info('Widget Definition Object with name "' + savedWidgetDef.name + '" was found ' +
              'but the storageHash property on the widget definition is different from that on the ' +
              'serialized widget loaded from storage. hash from storage: "' + savedWidgetDef.storageHash + '"' +
              ', hash from WDO: "' + widgetDefinition.storageHash + '"');
            continue;
          }
          // push instantiated widget to result array
          result.push(savedWidgetDef);
        }

        return result;
      },

      _handleAsyncLoad: function(promise) {
        var self = this;
        var deferred = $q.defer();
        promise.then(
          // success
          function(res) {
            var result = self._handleSyncLoad(res);
            if (result) {
              deferred.resolve(result);
            } else {
              deferred.reject(result);
            }
          },
          // failure
          function(res) {
            deferred.reject(res);
          }
        );

        return deferred.promise;
      }

    };
    return DashboardState;
  }]);
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
  .factory('LayoutStorage', function() {

    var noopStorage = {
      setItem: function() {

      },
      getItem: function() {

      },
      removeItem: function() {

      }
    };

    

    function LayoutStorage(options) {

      var defaults = {
        storage: noopStorage,
        storageHash: '',
        stringifyStorage: true
      };

      angular.extend(defaults, options);
      angular.extend(options, defaults);

      this.id = options.storageId;
      this.storage = options.storage;
      this.storageHash = options.storageHash;
      this.stringifyStorage = options.stringifyStorage;
      this.widgetDefinitions = options.widgetDefinitions;
      this.defaultLayouts = options.defaultLayouts;
      this.widgetButtons = options.widgetButtons;
      this.explicitSave = options.explicitSave;
      this.defaultWidgets = options.defaultWidgets;
      this.settingsModalOptions = options.settingsModalOptions;
      this.onSettingsClose = options.onSettingsClose;
      this.onSettingsDismiss = options.onSettingsDismiss;
      this.options = options;
      this.options.unsavedChangeCount = 0;

      this.layouts = [];
      this.states = {};
      this.load();
      this._ensureActiveLayout();
    }

    LayoutStorage.prototype = {

      add: function(layouts) {
        if (!angular.isArray(layouts)) {
          layouts = [layouts];
        }
        var self = this;
        angular.forEach(layouts, function(layout) {
          layout.dashboard = layout.dashboard || {};
          layout.dashboard.storage = self;
          layout.dashboard.storageId = layout.id = self._getLayoutId.call(self,layout);
          layout.dashboard.widgetDefinitions = self.widgetDefinitions;
          layout.dashboard.stringifyStorage = false;
          layout.dashboard.defaultWidgets = layout.defaultWidgets || self.defaultWidgets;
          layout.dashboard.widgetButtons = self.widgetButtons;
          layout.dashboard.explicitSave = self.explicitSave;
          layout.dashboard.settingsModalOptions = self.settingsModalOptions;
          layout.dashboard.onSettingsClose = self.onSettingsClose;
          layout.dashboard.onSettingsDismiss = self.onSettingsDismiss;
          self.layouts.push(layout);
        });
      },

      remove: function(layout) {
        var index = this.layouts.indexOf(layout);
        if (index >= 0) {
          this.layouts.splice(index, 1);
          delete this.states[layout.id];

          // check for active
          if (layout.active && this.layouts.length) {
            var nextActive = index > 0 ? index - 1 : 0;
            this.layouts[nextActive].active = true;
          }
        }
      },

      save: function() {

        var state = {
          layouts: this._serializeLayouts(),
          states: this.states,
          storageHash: this.storageHash
        };

        if (this.stringifyStorage) {
          state = JSON.stringify(state);
        }

        this.storage.setItem(this.id, state);
        this.options.unsavedChangeCount = 0;
      },

      load: function() {

        var serialized = this.storage.getItem(this.id);

        this.clear();

        if (serialized) {
          // check for promise
          if (angular.isObject(serialized) && angular.isFunction(serialized.then)) {
            this._handleAsyncLoad(serialized);
          } else {
            this._handleSyncLoad(serialized);
          }
        } else {
          this._addDefaultLayouts();
        }
      },

      clear: function() {
        this.layouts = [];
        this.states = {};
      },

      setItem: function(id, value) {
        this.states[id] = value;
        this.save();
      },

      getItem: function(id) {
        return this.states[id];
      },

      removeItem: function(id) {
        delete this.states[id];
        this.save();
      },

      getActiveLayout: function() {
        var len = this.layouts.length;
        for (var i = 0; i < len; i++) {
          var layout = this.layouts[i];
          if (layout.active) {
            return layout;
          }
        }
        return false;
      },

      _addDefaultLayouts: function() {
        var self = this;
        angular.forEach(this.defaultLayouts, function(layout) {
          self.add(angular.extend({}, layout));
        });
      },

      _serializeLayouts: function() {
        var result = [];
        angular.forEach(this.layouts, function(l) {
          result.push({
            title: l.title,
            id: l.id,
            active: l.active,
            defaultWidgets: l.dashboard.defaultWidgets
          });
        });
        return result;
      },

      _handleSyncLoad: function(serialized) {
        
        var deserialized;

        if (this.stringifyStorage) {
          try {

            deserialized = JSON.parse(serialized);

          } catch (e) {
            this._addDefaultLayouts();
            return;
          }
        } else {

          deserialized = serialized;

        }

        if (this.storageHash !== deserialized.storageHash) {
          this._addDefaultLayouts();
          return;
        }
        this.states = deserialized.states;
        this.add(deserialized.layouts);
      },

      _handleAsyncLoad: function(promise) {
        var self = this;
        promise.then(
          angular.bind(self, this._handleSyncLoad),
          angular.bind(self, this._addDefaultLayouts)
        );
      },

      _ensureActiveLayout: function() {
        for (var i = 0; i < this.layouts.length; i++) {
          var layout = this.layouts[i];
          if (layout.active) {
            return;
          }
        }
        if (this.layouts[0]) {
          this.layouts[0].active = true;
        }
      },

      _getLayoutId: function(layout) {
        if (layout.id) {
          return layout.id;
        }
        var max = 0;
        for (var i = 0; i < this.layouts.length; i++) {
          var id = this.layouts[i].id;
          max = Math.max(max, id * 1);
        }
        return max + 1;
      }

    };
    return LayoutStorage;
  });
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
  .factory('WidgetDataModel', function () {
    function WidgetDataModel() {
    }

    WidgetDataModel.prototype = {
      setup: function (widget, scope) {
        this.dataAttrName = widget.dataAttrName;
        this.dataModelOptions = widget.dataModelOptions;
        this.widgetScope = scope;
      },

      updateScope: function (data) {
        this.widgetScope.widgetData = data;
      },

      updateSettings: function(settings){
          this.widgetScope.widgetSettings = settings;
      },

      updateCompDatatSources: function(compDatas){
          this.widgetScope.widgetCompDatas = compDatas;
      },
      init: function () {
        // to be overridden by subclasses
      },

      destroy: function () {
        // to be overridden by subclasses
      }
    };

    return WidgetDataModel;
  });
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
  .factory('WidgetDefCollection', function () {
    function WidgetDefCollection(widgetDefs) {
      this.push.apply(this, widgetDefs);

      // build (name -> widget definition) map for widget lookup by name
      var map = {};
      _.each(widgetDefs, function (widgetDef) {
        map[widgetDef.name] = widgetDef;
      });
      this.map = map;
    }

    WidgetDefCollection.prototype = Object.create(Array.prototype);

    WidgetDefCollection.prototype.getByName = function (name) {
      return this.map[name];
    };

    return WidgetDefCollection;
  });
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
  .factory('WidgetModel', function () {
    // constructor for widget model instances
    function WidgetModel(Class, overrides) {
      var defaults = {
          title: 'Widget',
          name: Class.name,
          attrs: Class.attrs,
          dataAttrName: Class.dataAttrName,
          dataModelType: Class.dataModelType,
          dataModelArgs: Class.dataModelArgs, // used in data model constructor, not serialized
          //AW Need deep copy of options to support widget options editing
          dataModelOptions: Class.dataModelOptions,
          settingsModalOptions: Class.settingsModalOptions,
          onSettingsClose: Class.onSettingsClose,
          onSettingsDismiss: Class.onSettingsDismiss,
          style: Class.style || {},
          size: Class.size || {},
          enableVerticalResize: (Class.enableVerticalResize === false) ? false : true
        };

      overrides = overrides || {};
      angular.extend(this, angular.copy(defaults), overrides);
      this.containerStyle = { width: '33%' }; // default width
      this.contentStyle = {};
      this.updateContainerStyle(this.style);

      if (Class.templateUrl) {
        this.templateUrl = Class.templateUrl;
      } else if (Class.template) {
        this.template = Class.template;
      } else {
        var directive = Class.directive || Class.name;
        this.directive = directive;
      }

      if (this.size && _.has(this.size, 'height')) {
        this.setHeight(this.size.height);
      }

      if (this.style && _.has(this.style, 'width')) { //TODO deprecate style attribute
        this.setWidth(this.style.width);
      }

      if (this.size && _.has(this.size, 'width')) {
        this.setWidth(this.size.width);
      }

      /*
         Load widget data and widget settings
       */
      if(Class.widgetSettings){
          this.widgetSettings = Class.widgetSettings;
      }
      if(Class.widgetCompDatas)
          this.widgetCompDatas = Class.widgetCompDatas;
    }

    WidgetModel.prototype = {
      // sets the width (and widthUnits)
      setWidth: function (width, units) {
        width = width.toString();
        units = units || width.replace(/^[-\.\d]+/, '') || '%';
        this.widthUnits = units;
        width = parseFloat(width);

        if (width < 0) {
          return false;
        }

        if (units === '%') {
          width = Math.min(100, width);
          width = Math.max(0, width);
        }

        this.containerStyle.width = width + '' + units;

        this.updateSize(this.containerStyle);

        return true;
      },

      setHeight: function (height) {
        this.contentStyle.height = height;
        this.updateSize(this.contentStyle);
      },

      setStyle: function (style) {
        this.style = style;
        this.updateContainerStyle(style);
      },

      updateSize: function (size) {
        angular.extend(this.size, size);
      },

      updateContainerStyle: function (style) {
        angular.extend(this.containerStyle, style);
      }
    };

    return WidgetModel;
  });