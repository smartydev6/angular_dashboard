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

angular.module('ui.widgets', ['ngGrid']);
angular.module('ui.websocket', ['ui.visibility', 'ui.notify']);
angular.module('ui.models', ['ui.visibility', 'ui.websocket']);

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

angular.module('ui.models')
  .factory('RandomBaseDataModel', function (WidgetDataModel, Visibility) {
    function RandomBaseDataModel() {
    }

    RandomBaseDataModel.prototype = Object.create(WidgetDataModel.prototype);
    RandomBaseDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(RandomBaseDataModel.prototype, {
      init: function () {
        this.stopUpdates = false;
        this.visibilityListener = Visibility.change(function (e, state) {
          if (state === 'hidden') {
            this.stopUpdates = true;
          } else {
            this.stopUpdates = false;
          }
        }.bind(this));
      },

      updateScope: function (data) {
        if (!this.stopUpdates) {
          WidgetDataModel.prototype.updateScope.call(this, data);
        }
      },

      destroy: function () {
        WidgetDataModel.prototype.destroy.call(this);
        Visibility.unbind(this.visibilityListener);
      }
    });

    return RandomBaseDataModel;
  })
  .factory('RandomPercentageDataModel', function (RandomBaseDataModel, $interval) {
    function RandomPercentageDataModel() {
    }

    RandomPercentageDataModel.prototype = Object.create(RandomBaseDataModel.prototype);

    RandomPercentageDataModel.prototype.init = function () {
      var value = 50;

      this.intervalPromise = $interval(function () {
        value += Math.random() * 40 - 20;
        value = value < 0 ? 0 : value > 100 ? 100 : value;

        this.updateScope(value);
      }.bind(this), 500);
    };

    RandomPercentageDataModel.prototype.destroy = function () {
      RandomBaseDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomPercentageDataModel;
  })
  .factory('RandomTopNDataModel', function (RandomBaseDataModel, $interval) {
    function RandomTopNDataModel() {
    }

    RandomTopNDataModel.prototype = Object.create(RandomBaseDataModel.prototype);

    RandomTopNDataModel.prototype.init = function () {
      this.intervalPromise = $interval(function () {
        var topTen = _.map(_.range(0, 10), function (index) {
          return {
            name: 'item' + index,
            value: Math.floor(Math.random() * 100)
          };
        });
        //this.updateScope(topTen);
          $interval.cancel(this.intervalPromise);
      }.bind(this), 500);
    };

    RandomTopNDataModel.prototype.destroy = function () {
      RandomBaseDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomTopNDataModel;
  })
  .factory('RandomBaseTimeSeriesDataModel', function (RandomBaseDataModel, $interval) {
    function RandomTimeSeriesDataModel(options) {
      this.upperBound = (options && options.upperBound) ? options.upperBound : 100;
      this.rate = (options && options.rate) ? options.rate : Math.round(this.upperBound / 2);
    }

    RandomTimeSeriesDataModel.prototype = Object.create(RandomBaseDataModel.prototype);
    RandomTimeSeriesDataModel.prototype.constructor = RandomBaseDataModel;

    angular.extend(RandomTimeSeriesDataModel.prototype, {
      init: function () {
        RandomBaseDataModel.prototype.init.call(this);

        var max = 30;
        var upperBound = this.upperBound;
        var data = [];
        var chartValue = Math.round(upperBound / 2);
        var rate = this.rate;

        function nextValue() {
          chartValue += Math.random() * rate - rate / 2;
          chartValue = chartValue < 0 ? 0 : chartValue > upperBound ? upperBound : chartValue;
          return Math.round(chartValue);
        }

        var now = Date.now();
        for (var i = max - 1; i >= 0; i--) {
          data.push({
            timestamp: now - i * 1000,
            value: nextValue()
          });
        }

        this.updateScope(data);

        this.intervalPromise = $interval(function () {
          if (data.length >= max) {
            data.shift();
          }
          data.push({
            timestamp: Date.now(),
            value: nextValue()
          });

          this.updateScope(data);
        }.bind(this), 1000);
      },

      destroy: function () {
        RandomBaseDataModel.prototype.destroy.call(this);
        $interval.cancel(this.intervalPromise);
      }
    });

    return RandomTimeSeriesDataModel;
  })
  .factory('RandomTimeSeriesDataModel', function (RandomBaseTimeSeriesDataModel) {
    function RandomTimeSeriesDataModel(options) {
      RandomBaseTimeSeriesDataModel.call(this, options);
    }

    RandomTimeSeriesDataModel.prototype = Object.create(RandomBaseTimeSeriesDataModel.prototype);

    angular.extend(RandomTimeSeriesDataModel.prototype, {
      updateScope: function (data) {
        var chart = {
          data: data,
          max: 30,
          chartOptions: {
            vAxis: {}
          }
        };

        RandomBaseTimeSeriesDataModel.prototype.updateScope.call(this, chart);
      }
    });

    return RandomTimeSeriesDataModel;
  })
  .factory('RandomMetricsTimeSeriesDataModel', function (RandomBaseTimeSeriesDataModel) {
    function RandomMetricsTimeSeriesDataModel(options) {
      RandomBaseTimeSeriesDataModel.call(this, options);
    }

    RandomMetricsTimeSeriesDataModel.prototype = Object.create(RandomBaseTimeSeriesDataModel.prototype);

    angular.extend(RandomMetricsTimeSeriesDataModel.prototype, {
      updateScope: function (data) {
        var chart = [
          {
            key: 'Stream1',
            values: data
          },
          {
            key: 'Stream2',
            values: _.map(data, function (item) {
              return { timestamp: item.timestamp, value: item.value + 10 };
            })
          }
        ];

        RandomBaseTimeSeriesDataModel.prototype.updateScope.call(this, chart);
      }
    });

    return RandomMetricsTimeSeriesDataModel;
  })
  .factory('RandomNVD3TimeSeriesDataModel', function (RandomBaseTimeSeriesDataModel) {
    function RandomTimeSeriesDataModel(options) {
      RandomBaseTimeSeriesDataModel.call(this, options);
    }

    RandomTimeSeriesDataModel.prototype = Object.create(RandomBaseTimeSeriesDataModel.prototype);

    angular.extend(RandomTimeSeriesDataModel.prototype, {
      updateScope: function (data) {
        var chart = [
          {
            key: 'Data',
            values: data
          }
        ];

        RandomBaseTimeSeriesDataModel.prototype.updateScope.call(this, chart);
      }
    });

    return RandomTimeSeriesDataModel;
  })
  .factory('RandomMinutesDataModel', function (RandomBaseDataModel, $interval) {
    function RandomTimeSeriesDataModel(options) {
      this.limit = (options && options.limit) ? options.limit : 500;
    }

    RandomTimeSeriesDataModel.prototype = Object.create(RandomBaseDataModel.prototype);

    RandomTimeSeriesDataModel.prototype.init = function () {
      this.generateChart();
      this.intervalPromise = $interval(this.generateChart.bind(this), 2000);
    };

    RandomTimeSeriesDataModel.prototype.generateChart = function () {
      var minuteCount = 30;
      var data = [];
      var limit = this.limit;
      var chartValue = limit / 2;

      function nextValue() {
        chartValue += Math.random() * (limit * 0.4) - (limit * 0.2);
        chartValue = chartValue < 0 ? 0 : chartValue > limit ? limit : chartValue;
        return chartValue;
      }

      var now = Date.now();

      for (var i = minuteCount - 1; i >= 0; i--) {
        data.push({
          timestamp: now - i * 1000 * 60,
          value: nextValue()
        });
      }

      var widgetData = [
        {
          key: 'Data',
          values: data
        }
      ];

      this.updateScope(widgetData);
    };

    RandomTimeSeriesDataModel.prototype.destroy = function () {
      RandomBaseDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomTimeSeriesDataModel;
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

angular.module('ui.models')
  .factory('WebSocketDataModel', function (WidgetDataModel, webSocket) {
    function WebSocketDataModel() {
    }

    WebSocketDataModel.prototype = Object.create(WidgetDataModel.prototype);

    WebSocketDataModel.prototype.init = function () {
      this.topic = null;
      this.callback = null;
      if (this.dataModelOptions && this.dataModelOptions.defaultTopic) {
        this.update(this.dataModelOptions.defaultTopic);
      }
    };

    WebSocketDataModel.prototype.update = function (newTopic) {
      var that = this;

      if (this.topic && this.callback) {
        webSocket.unsubscribe(this.topic, this.callback);
      }

      this.callback = function (message) {
        that.updateScope(message);
        that.widgetScope.$apply();
      };

      this.topic = newTopic;
      webSocket.subscribe(this.topic, this.callback, this.widgetScope);
    };

    WebSocketDataModel.prototype.destroy = function () {
      WidgetDataModel.prototype.destroy.call(this);

      if (this.topic && this.callback) {
        webSocket.unsubscribe(this.topic, this.callback);
      }
    };

    return WebSocketDataModel;
  })
  .factory('TimeSeriesDataModel', function (WebSocketDataModel) {
    function TimeSeriesDataModel() {
    }

    TimeSeriesDataModel.prototype = Object.create(WebSocketDataModel.prototype);

    TimeSeriesDataModel.prototype.init = function () {
      WebSocketDataModel.prototype.init.call(this);
    };

    TimeSeriesDataModel.prototype.update = function (newTopic) {
      WebSocketDataModel.prototype.update.call(this, newTopic);
      this.items = [];
    };

    TimeSeriesDataModel.prototype.updateScope = function (value) {
      value = _.isArray(value) ? value[0] : value;

      this.items.push({
        timestamp: parseInt(value.timestamp, 10), //TODO
        value: parseInt(value.value, 10) //TODO
      });

      if (this.items.length > 100) { //TODO
        this.items.shift();
      }

      var chart = {
        data: this.items,
        max: 30
      };

      WebSocketDataModel.prototype.updateScope.call(this, chart);
      this.data = [];
    };

    return TimeSeriesDataModel;
  })
  .factory('PieChartDataModel', function (WebSocketDataModel) {
    function PieChartDataModel() {
    }

    PieChartDataModel.prototype = Object.create(WebSocketDataModel.prototype);

    PieChartDataModel.prototype.init = function () {
      WebSocketDataModel.prototype.init.call(this);
      this.data = [];
    };

    PieChartDataModel.prototype.update = function (newTopic) {
      WebSocketDataModel.prototype.update.call(this, newTopic);
    };

    PieChartDataModel.prototype.updateScope = function (value) {
      var sum = _.reduce(value, function (memo, item) {
        return memo + parseFloat(item.value);
      }, 0);

      var sectors = _.map(value, function (item) {
        return {
          key: item.label,
          y: item.value / sum
        };
      });

      sectors = _.sortBy(sectors, function (item) {
        return item.key;
      });

      WebSocketDataModel.prototype.updateScope.call(this, sectors);
    };

    return PieChartDataModel;
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

angular.module('ui.visibility', [])
  .factory('Visibility', function ($window) {
    return $window.Visibility;
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

angular.module('ui.websocket')
  .factory('visibly', function ($window) {
    return $window.visibly;
  })
  .provider('webSocket', function () {
    var visibilityTimeout = 20000;
    var webSocketURL;
    var webSocketObject; // for testing only

    return {
      $get: function ($q, $rootScope, $timeout, notificationService, Visibility, $log, $window) {
        if (!webSocketURL && !webSocketObject) {
          throw 'WebSocket URL is not defined';
        }

        var socket = !webSocketObject ? new $window.WebSocket(webSocketURL) : webSocketObject;

        var deferred = $q.defer();

        socket.onopen = function () {
          deferred.resolve();
          $rootScope.$apply();
        };

        var webSocketError = false;

        socket.onclose = function () {
          if (!webSocketError) {
            notificationService.notify({
              title: 'WebSocket Closed',
              text: 'WebSocket connection has been closed. Try refreshing the page.',
              type: 'error',
              icon: false,
              hide: false,
              history: false
            });
          }
        };

        //TODO
        socket.onerror = function () {
          webSocketError = true;
          notificationService.notify({
            title: 'WebSocket Error',
            text: 'WebSocket error. Try refreshing the page.',
            type: 'error',
            icon: false,
            hide: false,
            history: false
          });
        };

        var topicMap = {}; // topic -> [callbacks] mapping

        var stopUpdates = false;

        socket.onmessage = function (event) {
          if (stopUpdates) { // stop updates if page is inactive
            return;
          }

          var message = JSON.parse(event.data);

          var topic = message.topic;

          if (topicMap.hasOwnProperty(topic)) {
            if ($window.WS_DEBUG) {
              if ($window.WS_DEBUG === true) {
                $log.debug('WebSocket ', topic, ' => ', message.data);
              }
              else {
                var search = new RegExp($window.WS_DEBUG + '');
                if (search.test(topic)) {
                  $log.debug('WebSocket ', topic, ' => ', message.data);
                }
              }
            }
            topicMap[topic].fire(message.data);
          }
        };

        if (Visibility.isSupported()) {
          var timeoutPromise;

          Visibility.change(function (e, state) {
            if (state === 'hidden') {
              timeoutPromise = $timeout(function () {
                stopUpdates = true;
                timeoutPromise = null;
              }, visibilityTimeout);
            } else {
              stopUpdates = false;

              if (timeoutPromise) {
                $timeout.cancel(timeoutPromise);
              }

              $log.debug('visible');
            }
          }.bind(this));
        }

        return {
          send: function (message) {
            var msg = JSON.stringify(message);

            deferred.promise.then(function () {
              $log.debug('send ' + msg);
              socket.send(msg);
            });
          },

          subscribe: function (topic, callback, $scope) {
            var callbacks = topicMap[topic];

            // If a jQuery.Callbacks object has not been created for this
            // topic, one should be created and a "subscribe" message 
            // should be sent.
            if (!callbacks) {

              // send the subscribe message
              var message = { type: 'subscribe', topic: topic };
              this.send(message);

              // create the Callbacks object
              callbacks = jQuery.Callbacks();
              topicMap[topic] = callbacks;
            }

            // When scope is provided...
            if ($scope) {

              // ...it's $digest method should be called
              // after the callback has been triggered, so
              // we have to wrap the function.
              var wrappedCallback = function () {
                callback.apply({}, arguments);
                $scope.$digest();
              };
              callbacks.add(wrappedCallback);

              // We should also be listening for the destroy
              // event so we can automatically unsubscribe.
              $scope.$on('$destroy', angular.bind(this, function () {
                this.unsubscribe(topic, wrappedCallback);
              }));

              return wrappedCallback;
            }
            else {
              callbacks.add(callback);
              return callback;
            }
          },

          unsubscribe: function (topic, callback) {
            if (topicMap.hasOwnProperty(topic)) {
              var callbacks = topicMap[topic];
              callbacks.remove(callback);

              // callbacks.has() will return false
              // if there are no more handlers
              // registered in this callbacks collection.
              if (!callbacks.has()) {
                
                // Send the unsubscribe message first
                var message = { type: 'unsubscribe', topic: topic };
                this.send(message);

                // Then remove the callbacks object for this topic
                delete topicMap[topic];
                
              }
            }
          }
        };
      },

      setVisibilityTimeout: function (timeout) {
        visibilityTimeout = timeout;
      },

      setWebSocketURL: function (wsURL) {
        webSocketURL = wsURL;
      },

      setWebSocketObject: function (wsObject) {
        webSocketObject = wsObject;
      }
    };
  });

/**
 * Copied from https://github.com/lithiumtech/angular_and_d3
 */

/* jshint ignore:start */

function Gauge(element, configuration)
{
  this.element = element;

  var self = this; // for internal d3 functions

  this.configure = function(configuration)
  {
    this.config = configuration;

    this.config.size = this.config.size * 0.9;

    this.config.raduis = this.config.size * 0.97 / 2;
    this.config.cx = this.config.size / 2;
    this.config.cy = this.config.size / 2;

    this.config.min = undefined != configuration.min ? configuration.min : 0;
    this.config.max = undefined != configuration.max ? configuration.max : 100;
    this.config.range = this.config.max - this.config.min;

    this.config.majorTicks = configuration.majorTicks || 5;
    this.config.minorTicks = configuration.minorTicks || 2;

    this.config.greenColor 	= configuration.greenColor || "#109618";
    this.config.yellowColor = configuration.yellowColor || "#FF9900";
    this.config.redColor 	= configuration.redColor || "#DC3912";

    this.config.transitionDuration = configuration.transitionDuration || 500;
  }

  this.render = function()
  {
    this.body = d3.select( this.element )
      .append("svg:svg")
      .attr("class", "gauge")
      .attr("width", this.config.size)
      .attr("height", this.config.size);

    this.body.append("svg:circle")
      .attr("cx", this.config.cx)
      .attr("cy", this.config.cy)
      .attr("r", this.config.raduis)
      .style("fill", "#ccc")
      .style("stroke", "#000")
      .style("stroke-width", "0.5px");

    this.body.append("svg:circle")
      .attr("cx", this.config.cx)
      .attr("cy", this.config.cy)
      .attr("r", 0.9 * this.config.raduis)
      .style("fill", "#fff")
      .style("stroke", "#e0e0e0")
      .style("stroke-width", "2px");

    for (var index in this.config.greenZones)
    {
      this.drawBand(this.config.greenZones[index].from, this.config.greenZones[index].to, self.config.greenColor);
    }

    for (var index in this.config.yellowZones)
    {
      this.drawBand(this.config.yellowZones[index].from, this.config.yellowZones[index].to, self.config.yellowColor);
    }

    for (var index in this.config.redZones)
    {
      this.drawBand(this.config.redZones[index].from, this.config.redZones[index].to, self.config.redColor);
    }

    if (undefined != this.config.label)
    {
      var fontSize = Math.round(this.config.size / 9);
      this.body.append("svg:text")
        .attr("x", this.config.cx)
        .attr("y", this.config.cy / 2 + fontSize / 2)
        .attr("dy", fontSize / 2)
        .attr("text-anchor", "middle")
        .text(this.config.label)
        .style("font-size", fontSize + "px")
        .style("fill", "#333")
        .style("stroke-width", "0px");
    }

    var fontSize = Math.round(this.config.size / 16);
    var majorDelta = this.config.range / (this.config.majorTicks - 1);
    for (var major = this.config.min; major <= this.config.max; major += majorDelta)
    {
      var minorDelta = majorDelta / this.config.minorTicks;
      for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, this.config.max); minor += minorDelta)
      {
        var point1 = this.valueToPoint(minor, 0.75);
        var point2 = this.valueToPoint(minor, 0.85);

        this.body.append("svg:line")
          .attr("x1", point1.x)
          .attr("y1", point1.y)
          .attr("x2", point2.x)
          .attr("y2", point2.y)
          .style("stroke", "#666")
          .style("stroke-width", "1px");
      }

      var point1 = this.valueToPoint(major, 0.7);
      var point2 = this.valueToPoint(major, 0.85);

      this.body.append("svg:line")
        .attr("x1", point1.x)
        .attr("y1", point1.y)
        .attr("x2", point2.x)
        .attr("y2", point2.y)
        .style("stroke", "#333")
        .style("stroke-width", "2px");

      if (major == this.config.min || major == this.config.max)
      {
        var point = this.valueToPoint(major, 0.63);

        this.body.append("svg:text")
          .attr("x", point.x)
          .attr("y", point.y)
          .attr("dy", fontSize / 3)
          .attr("text-anchor", major == this.config.min ? "start" : "end")
          .text(major)
          .style("font-size", fontSize + "px")
          .style("fill", "#333")
          .style("stroke-width", "0px");
      }
    }

    var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer");

    var midValue = (this.config.min + this.config.max) / 2;

    var pointerPath = this.buildPointerPath(midValue);

    var pointerLine = d3.svg.line()
      .x(function(d) { return d.x })
      .y(function(d) { return d.y })
      .interpolate("basis");

    pointerContainer.selectAll("path")
      .data([pointerPath])
      .enter()
      .append("svg:path")
      .attr("d", pointerLine)
      .style("fill", "#dc3912")
      .style("stroke", "#c63310")
      .style("fill-opacity", 0.7)

    pointerContainer.append("svg:circle")
      .attr("cx", this.config.cx)
      .attr("cy", this.config.cy)
      .attr("r", 0.12 * this.config.raduis)
      .style("fill", "#4684EE")
      .style("stroke", "#666")
      .style("opacity", 1);

    var fontSize = Math.round(this.config.size / 10);
    pointerContainer.selectAll("text")
      .data([midValue])
      .enter()
      .append("svg:text")
      .attr("x", this.config.cx)
      .attr("y", this.config.size - this.config.cy / 4 - fontSize)
      .attr("dy", fontSize / 2)
      .attr("text-anchor", "middle")
      .style("font-size", fontSize + "px")
      .style("fill", "#000")
      .style("stroke-width", "0px");

    this.redraw(this.config.min, 0);
  }

  this.buildPointerPath = function(value)
  {
    var delta = this.config.range / 13;

    var head = valueToPoint(value, 0.85);
    var head1 = valueToPoint(value - delta, 0.12);
    var head2 = valueToPoint(value + delta, 0.12);

    var tailValue = value - (this.config.range * (1/(270/360)) / 2);
    var tail = valueToPoint(tailValue, 0.28);
    var tail1 = valueToPoint(tailValue - delta, 0.12);
    var tail2 = valueToPoint(tailValue + delta, 0.12);

    return [head, head1, tail2, tail, tail1, head2, head];

    function valueToPoint(value, factor)
    {
      var point = self.valueToPoint(value, factor);
      point.x -= self.config.cx;
      point.y -= self.config.cy;
      return point;
    }
  }

  this.drawBand = function(start, end, color)
  {
    if (0 >= end - start) return;

    this.body.append("svg:path")
      .style("fill", color)
      .attr("d", d3.svg.arc()
        .startAngle(this.valueToRadians(start))
        .endAngle(this.valueToRadians(end))
        .innerRadius(0.65 * this.config.raduis)
        .outerRadius(0.85 * this.config.raduis))
      .attr("transform", function() { return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)" });
  }

  this.redraw = function(value, transitionDuration)
  {
    var pointerContainer = this.body.select(".pointerContainer");

    pointerContainer.selectAll("text").text(Math.round(value));

    var pointer = pointerContainer.selectAll("path");
    pointer.transition()
      .duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
      //.delay(0)
      //.ease("linear")
      //.attr("transform", function(d)
      .attrTween("transform", function()
      {
        var pointerValue = value;
        if (value > self.config.max) pointerValue = self.config.max + 0.02*self.config.range;
        else if (value < self.config.min) pointerValue = self.config.min - 0.02*self.config.range;
        var targetRotation = (self.valueToDegrees(pointerValue) - 90);
        var currentRotation = self._currentRotation || targetRotation;
        self._currentRotation = targetRotation;

        return function(step)
        {
          var rotation = currentRotation + (targetRotation-currentRotation)*step;
          return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")";
        }
      });
  }

  this.valueToDegrees = function(value)
  {
    // thanks @closealert
    //return value / this.config.range * 270 - 45;
    return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45);
  }

  this.valueToRadians = function(value)
  {
    return this.valueToDegrees(value) * Math.PI / 180;
  }

  this.valueToPoint = function(value, factor)
  {
    return { 	x: this.config.cx - this.config.raduis * factor * Math.cos(this.valueToRadians(value)),
      y: this.config.cy - this.config.raduis * factor * Math.sin(this.valueToRadians(value)) 		};
  }

  // initialization
  this.configure(configuration);
}

/* jshint ignore:end */
/*!
 * visibly - v0.6 Aug 2011 - Page Visibility API Polyfill
 * http://github.com/addyosmani
 * Copyright (c) 2011 Addy Osmani
 * Dual licensed under the MIT and GPL licenses.
 *
 * Methods supported:
 * visibly.onVisible(callback)
 * visibly.onHidden(callback)
 * visibly.hidden()
 * visibly.visibilityState()
 * visibly.visibilitychange(callback(state));
 */

;(function () {

    window.visibly = {
        q: document,
        p: undefined,
        prefixes: ['webkit', 'ms','o','moz','khtml'],
        props: ['VisibilityState', 'visibilitychange', 'Hidden'],
        m: ['focus', 'blur'],
        visibleCallbacks: [],
        hiddenCallbacks: [],
        genericCallbacks:[],
        _callbacks: [],
        cachedPrefix:"",
        fn:null,

        onVisible: function (_callback) {
            if(typeof _callback == 'function' ){
                this.visibleCallbacks.push(_callback);
            }
        },
        onHidden: function (_callback) {
            if(typeof _callback == 'function' ){
                this.hiddenCallbacks.push(_callback);
            }
        },
        getPrefix:function(){
            if(!this.cachedPrefix){
                for(var l=0;b=this.prefixes[l++];){
                    if(b + this.props[2] in this.q){
                        this.cachedPrefix =  b;
                        return this.cachedPrefix;
                    }
                }    
             }
        },

        visibilityState:function(){
            return  this._getProp(0);
        },
        hidden:function(){
            return this._getProp(2);
        },
        visibilitychange:function(fn){
            if(typeof fn == 'function' ){
                this.genericCallbacks.push(fn);
            }

            var n =  this.genericCallbacks.length;
            if(n){
                if(this.cachedPrefix){
                     while(n--){
                        this.genericCallbacks[n].call(this, this.visibilityState());
                    }
                }else{
                    while(n--){
                        this.genericCallbacks[n].call(this, arguments[0]);
                    }
                }
            }

        },
        isSupported: function (index) {
            return ((this.cachedPrefix + this.props[2]) in this.q);
        },
        _getProp:function(index){
            return this.q[this.cachedPrefix + this.props[index]]; 
        },
        _execute: function (index) {
            if (index) {
                this._callbacks = (index == 1) ? this.visibleCallbacks : this.hiddenCallbacks;
                var n =  this._callbacks.length;
                while(n--){
                    this._callbacks[n]();
                }
            }
        },
        _visible: function () {
            window.visibly._execute(1);
            window.visibly.visibilitychange.call(window.visibly, 'visible');
        },
        _hidden: function () {
            window.visibly._execute(2);
            window.visibly.visibilitychange.call(window.visibly, 'hidden');
        },
        _nativeSwitch: function () {
            this[this._getProp(2) ? '_hidden' : '_visible']();
        },
        _listen: function () {
            try { /*if no native page visibility support found..*/
                if (!(this.isSupported())) {
                    if (this.q.addEventListener) { /*for browsers without focusin/out support eg. firefox, opera use focus/blur*/
                        window.addEventListener(this.m[0], this._visible, 1);
                        window.addEventListener(this.m[1], this._hidden, 1);
                    } else { /*IE <10s most reliable focus events are onfocusin/onfocusout*/
                        if (this.q.attachEvent) {
                            this.q.attachEvent('onfocusin', this._visible);
                            this.q.attachEvent('onfocusout', this._hidden);
                        }
                    }
                } else { /*switch support based on prefix detected earlier*/
                    this.q.addEventListener(this.cachedPrefix + this.props[1], function () {
                        window.visibly._nativeSwitch.apply(window.visibly, arguments);
                    }, 1);
                }
            } catch (e) {}
        },
        init: function () {
            this.getPrefix();
            this._listen();
        }
    };

    this.visibly.init();
})();

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
                    console.log(data);
                    if (data) {
                        var columns = data['columns'];
                        var _labels = data['labels'];
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
                                labels.push(data.profile + "/" + data.segment + " -- " + _labels[i]);
                                temp_labels.push(_labels[i]);
                            }
                        }
                        var rows = data['rows'];
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
                        if(data.addnew == 1){
                            for(i in scope.items){
                                _.defaults(scope.items[i], items[i]);
                            }
                            console.log(scope.items);
                            scope.metrics = scope.metrics.concat(metrics);
                            scope.labels = scope.labels.concat(labels);
                            temp_labels = scope.labels;
                        }else {
                            scope.items = items;
                            scope.metrics = metrics;
                            scope.labels = labels;
                        }
                        var graphdata = {items : scope.items, xkey : columns[0], ykeys : scope.metrics, labels : temp_labels};
                        scope.$$childHead.setData(graphdata, 'area');
                    }
                });
            }
        };
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

angular.module('ui.widgets')
    .directive('wtBarChart', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'template/widgets/barChart/barChart.html',
            scope: {
                data: '='
            },
            controller: function ($scope) {
                $scope.mainData =  [];
                $scope.metrics = ["a", "b", "c"];
                $scope.linecolors = ["#6A55C2","#E94B3B","#2EC1CC"];
                $scope.xkey = "year";
                $scope.dataindex = "";
            },
            link: function postLink(scope) {
                scope.$watch('data', function (data) {
                    if (data) {
                        var columns = data['columns'];
                        var _labels = data['labels'];
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
                                labels.push(data.profile + "/" + data.segment + " -- " + _labels[i]);
                                temp_labels.push(_labels[i]);
                            }
                        }
                        var rows = data['rows'];
                        console.log(rows);
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
                        if(data.addnew == 1){
                            for(i in scope.items){
                                _.defaults(scope.items[i], items[i]);
                            }
                            console.log(scope.items);
                            scope.metrics = scope.metrics.concat(metrics);
                            scope.labels = scope.labels.concat(labels);
                            temp_labels = scope.labels;
                        }else {
                            scope.items = items;
                            scope.metrics = metrics;
                            scope.labels = labels;
                        }
                        var graphdata = {items : scope.items, xkey : columns[0], ykeys : scope.metrics, labels : temp_labels};
                        scope.$$childHead.setData(graphdata, 'bar');
                    }
                });
            }
        };
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

angular.module('ui.widgets')
  .directive('wtHistoricalChart', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/historicalChart/historicalChart.html',
      scope: {
        chart: '='
      },
      controller: function ($scope) {
        $scope.mode = 'MINUTES';

        $scope.changeMode = function (mode) {
          $scope.mode = mode;
          $scope.$emit('modeChanged', mode);
        };
      }
    };
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

angular.module('ui.widgets')
  .directive('wtGauge', function () {
    return {
      replace: true,
      scope: {
        label: '@',
        min: '=',
        max: '=',
        value: '='
      },
      link: function (scope, element, attrs) {
        var config = {
          size: 200,
          label: attrs.label,
          min: undefined !== scope.min ? scope.min : 0,
          max: undefined !== scope.max ? scope.max : 100,
          minorTicks: 5
        };

        var range = config.max - config.min;
        config.yellowZones = [
          { from: config.min + range * 0.75, to: config.min + range * 0.9 }
        ];
        config.redZones = [
          { from: config.min + range * 0.9, to: config.max }
        ];

        scope.gauge = new Gauge(element[0], config);
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

        update(0);

        scope.$watch('value', function (value) {
          if (scope.gauge) {
            update(value);
          }
        });
      }
    };
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

angular.module('ui.widgets')
    .directive('wtLineChart', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'template/widgets/lineChart/lineChart.html',
            scope: {
                data: '='
            },
            controller: function ($scope) {
                $scope.mainData =  [];
                $scope.metrics = ["a", "b", "c"];
                $scope.linecolors = ["#6A55C2","#E94B3B","#2EC1CC"];
                $scope.xkey = "year";
                $scope.dataindex = "";
            },
            link: function postLink(scope) {
                scope.$watch('data', function (data) {
                    if (data) {
                        var columns = data['columns'];
                        var _labels = data['labels'];
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
                                labels.push(data.profile + "/" + data.segment + " -- " + _labels[i]);
                                temp_labels.push(_labels[i]);
                            }
                        }
                        var rows = data['rows'];
                        console.log(rows);
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
                        if(data.addnew == 1){
                            for(i in scope.items){
                                _.defaults(scope.items[i], items[i]);
                            }
                            console.log(scope.items);
                            scope.metrics = scope.metrics.concat(metrics);
                            scope.labels = scope.labels.concat(labels);
                            temp_labels = scope.labels;
                        }else {
                            scope.items = items;
                            scope.metrics = metrics;
                            scope.labels = labels;
                        }
                        var graphdata = {items : scope.items, xkey : columns[0], ykeys : scope.metrics, labels : temp_labels};
                        scope.$$childHead.setData(graphdata, 'line');
                    }
                });
            }
        };
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

angular.module('ui.widgets')
  .directive('wtMetricsChart', function ($filter, MetricsChartHistory) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/metricsChart/metricsChart.html',
      scope: {
        data: '=?',
        metrics: '=',
        controller: '='
      },
      controller: function ($scope) {
        var filter = $filter('date');
        var yAxisFilter = $filter('number');

        $scope.xAxisTickFormatFunction = function () {
          return function (d) {
            return filter(d, 'mm:ss');
          };
        };

        $scope.yAxisTickFormatFunction = function () {
          return function (d) {
            return yAxisFilter(d);
          };
        };

        $scope.xFunction = function () {
          return function (d) {
            return d.timestamp;
          };
        };
        $scope.yFunction = function () {
          return function (d) {
            return d.value;
          };
        };

        $scope.chartCallback = function () { // callback to access nvd3 chart
          //console.log('chartCallback');
          //console.log(arguments);
          //console.log(chart.legend.dispatch.);
          //chart.legend.dispatch.on('legendClick', function(newState) {
          //  console.log(newState);
          //});
        };

        $scope.maxTimeLimit = 300;

        $scope.options = [
          {
            value: 30,
            label: 'last 30 seconds'
          },
          {
            value: 60,
            label: 'last minute'
          },
          {
            value: 120,
            label: 'last two minutes'
          },
          {
            value: $scope.maxTimeLimit,
            label: 'last 5 minutes'
          }
        ];
        $scope.timeFrame = $scope.options[0];


        var chartHistory = null;
        if ($scope.controller) {
          chartHistory = new MetricsChartHistory($scope, $scope.metrics, $scope.maxTimeLimit, $scope.timeFrame.value);
          $scope.controller.addPoint = function (point) {
            chartHistory.addPoint(point);
          };
        }

        $scope.timeFrameChanged = function (newTimeFrame) {
          if (chartHistory) {
            chartHistory.updateChart(Date.now(), newTimeFrame.value);
          }
        };
      },
      link: function postLink(scope) {
        scope.data = [];
      }
    };
  })
  .factory('MetricsChartHistory', function () {
    function MetricsChartHistory(scope, metrics, maxTimeLimit, timeLimit) {
      this.scope = scope;
      this.metrics = metrics;
      this.maxTimeLimit = maxTimeLimit;
      this.timeLimit = timeLimit;
      this.history = [];

      this.series = [];

      _.each(metrics, function (metric) {
        this.series.push({
          key: metric.key,
          disabled: !metric.visible,
          color: metric.color
        });
      }.bind(this));
    }

    angular.extend(MetricsChartHistory.prototype, {
      updateHistory: function (now, point) {
        var historyStartTime = now - this.maxTimeLimit * 1000;

        var ind = _.findIndex(this.history, function (historyPoint) {
          return historyPoint.timestamp >= historyStartTime;
        });
        if (ind > 1) {
          this.history = _.rest(this.history, ind - 1);
        }

        var historyPoint = {
          timestamp: now,
          data: point
        };
        this.history.push(historyPoint);
      },

      updateChart: function (now, timeLimit) {
        this.timeLimit = timeLimit;

        var startTime = now - 1000 * timeLimit;

        var history = _.filter(this.history, function (historyPoint) { //TODO optimize
          return historyPoint.timestamp >= startTime;
        });

        _.each(this.metrics, function (metric, index) {
          var metricKey = metric.key;

          var values = _.map(history, function (historyPoint) {
            return {
              timestamp: historyPoint.timestamp,
              value: Math.round(parseInt(historyPoint.data[metricKey], 10))
            };
          });

          this.series[index].values = values;
        }.bind(this));

        /*
         //TODO this is workaround to have fixed x axis scale when no enough date is available
         chart.push({
         key: 'Left Value',
         values: [
         {timestamp: startTime, value: 0}
         ]
         });
         */

        /*
         var max = _.max(history, function (historyPoint) { //TODO optimize
         return historyPoint.stats.tuplesEmittedPSMA; //TODO
         });

         chart.push({
         key: 'Upper Value',
         values: [
         {timestamp: now - 30 * 1000, value: Math.round(max.value * 1.2)}
         ]
         });
         */

        if (history.length > 1) {
          this.scope.data = _.clone(this.series);
          this.scope.start = Math.min(startTime, _.first(history).timestamp);
          this.scope.end = _.last(history).timestamp;
        }
      },

      addPoint: function (point) {
        var now = Date.now();
        this.updateHistory(now, point);

        this.updateChart(now, this.timeLimit);
      }
    });

    return MetricsChartHistory;
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

angular.module('ui.widgets')
  .directive('wtNvd3LineChart', function ($filter) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/nvd3LineChart/nvd3LineChart.html',
      scope: {
        data: '=data',
        showLegend: '@'
      },
      controller: function ($scope) {
        var filter = $filter('date');
        var numberFilter = $filter('number');

        $scope.xAxisTickFormatFunction = function () {
          return function (d) {
            return filter(d, 'HH:mm');
          };
        };

        $scope.yAxisTickFormatFunction = function () {
          return function (d) {
            if (d > 999) {
              var value = Math.round(d/1000);
              return numberFilter(value) + 'k';
            } else {
              return numberFilter(d);
            }
          };
        };

        $scope.xFunction = function () {
          return function (d) {
            return d.timestamp;
          };
        };
        $scope.yFunction = function () {
          return function (d) {
            return d.value;
          };
        };
      },
      link: function postLink(scope) {
        scope.$watch('data', function (data) {
          if (data && data[0] && data[0].values && (data[0].values.length > 1)) {
            var timeseries = _.sortBy(data[0].values, function (item) {
              return item.timestamp;
            });

            var start = timeseries[0].timestamp;
            var end = timeseries[timeseries.length - 1].timestamp;
            scope.start = start;
            scope.end = end;
          }
        });
      }
    };
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

angular.module('ui.widgets')
  .directive('wtRandom', function ($interval) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/random/random.html',
      link: function postLink(scope) {
        function update() {
          scope.number = Math.floor(Math.random() * 100);
        }

        var promise = $interval(update, 500);

        scope.$on('$destroy', function () {
          $interval.cancel(promise);
        });
      }
    };
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
                        var items = data['rows'];
                        var rows = [];
                        var index;
                        for(index in items){
                            var item = items[index];
                            var row = {label : item[0], data : item[1]};
                            rows.push(row);
                        }
                        console.log(rows);
                        scope.mainData = rows;
                        scope.$$childHead.setData(rows);
                    }
                });
            }
        };
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

angular.module('ui.widgets')
  .directive('wtScopeWatch', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/scopeWatch/scopeWatch.html',
      scope: {
        scopeValue: '=value',
        valueClass: '@valueClass'
      }
    };
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

angular.module('ui.widgets')
  .directive('wtTime', function ($interval) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/time/time.html',
      link: function (scope) {
        function update() {
          scope.time = new Date().toLocaleTimeString();
        }

        var promise = $interval(update, 500);

        scope.$on('$destroy', function () {
          $interval.cancel(promise);
        });
      }
    };
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

angular.module('ui.widgets')
  .directive('wtSelect', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/widgets/select/select.html',
      scope: {
        label: '@',
        value: '=',
        options: '='
      },
      controller: function ($scope) {
        $scope.prevValue = function () {
          var index = $scope.options.indexOf($scope.value);
          var nextIndex = (index - 1 + $scope.options.length) % $scope.options.length;
          $scope.value = $scope.options[nextIndex];
        };

        $scope.nextValue = function () {
          var index = $scope.options.indexOf($scope.value);
          var nextIndex = (index + 1) % $scope.options.length;
          $scope.value = $scope.options[nextIndex];
        };
      }
    };
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

angular.module('ui.widgets')
    .directive('wtTopN', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'template/widgets/topN/topN.html',
            scope: {
                data: '='
            },
            controller: function ($scope) {
                $scope.columns = [
                    { field: 'name', displayName: 'Name' },
                    { field: 'value', displayName: 'Value' }
                ];
                $scope.gridOptions = {
                    data: 'items',
                    enableRowSelection: false,
                    enableColumnResize: false,
                    columnDefs: 'columns'
                };
            },
            link: function postLink(scope) {
                scope.$watch('data', function (data) {
                    if (data) {
                        var items = data['rows'];
                        var rows = [];
                        var index, subindex;
                        for(index in items){
                            var item = items[index];
                            var row = {};
                            for(subindex in item){
                                row["column" + subindex] = item[subindex];
                            }
                            row["profile"] = data["profile"];
                            row["segment"] = data["segment"];
                            rows.push(row);
                        }
                        var columns = data['columns'];
                        var labels = data['labels'];
                        var cols = [];
                        for(index in columns){
                            var column = {field : 'column' + index, displayName : labels[index]};
                            cols.push(column);
                        }

                        //  In case of adding new data source
                        if(data.addnew == 1){
                            scope.items = scope.items.concat(rows);
                            if(scope.columns[0].field != "profile") {
                                var cols_pre = [
                                    {
                                        field: 'profile', displayName: "Profile Name"
                                    },
                                    {
                                        field: 'segment', displayName: "Segment Name"
                                    }
                                ];
                                cols_pre = cols_pre.concat(scope.columns);
                                scope.columns = cols_pre;
                            }
                            return;
                        }
                        scope.items = rows;
                        scope.columns = cols;
                    }
                });
            }
        };
    });