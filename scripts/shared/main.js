(function() {
  'use strict';
  angular.module('app.controllers', ['app.services', 'ui.bootstrap']).controller('AppCtrl', [
    '$scope', '$rootScope', '$location', '$window', '$http', 'googleService', 'dbService', '$localStorage', '$modal', '$element', '$timeout', function($scope, $rootScope, $location, $window, $http, googleService, dbService, $localStorage, $modal, $element, $timeout) {
      $scope.isSpecificPage = function() {
        var path;
        path = $location.path();
        /* if($window.gapi == undefined)
            return true; */
        return _.contains(['/404', '/pages/500', '/pages/login', '/pages/signin', '/pages/signin1', '/pages/signin2', '/pages/signup', '/pages/signup1', '/pages/signup2', '/pages/lock-screen', '/admin/login'], path);
      };
      // Deprecated : Function to determine if the footer should be big or small.
      /* $scope.hasSmallFooter = function(){
        var path = $location.path();
        return path.indexOf("dashboard") != -1;
      };*/
      $scope.dashboards = [];
      $scope.loadDashboards = function(){
        dbService.loadDashboards().then(function(response){
            $scope.dashboards = response;
        });
      };
      $scope.addDashboard = function(){
          var dashboard = {};
          dashboard.title = "Dashboard" + ($scope.dashboards.length + 1);
          dashboard.id =$scope.dashboards.length + 1;
          $localStorage.maxNumber = $scope.dashboardCount;
          $localStorage.dashboards = $scope.dashboards;
          dbService.saveStorage("ngStorage-dashboards", JSON.stringify($scope.dashboards));
          dbService.saveStorage("ngStorage-maxNumber", JSON.stringify($scope.dashboardCount));
          dbService.newDashboard(dashboard).then(function(response){
              var dashboard = response.dashboard;
              $scope.dashboards.push(dashboard);
          });
      };
      $scope.remove = function(dashboardid) {
        var i=0, index=-1;
        var dashboard = _.findWhere($scope.dashboards, {id: dashboardid});
        if(dashboard)
        {
             $scope.dashboards.splice(_.indexOf($scope.dashboards, dashboard), 1);
             dbService.deleteDashboard(dashboard);
             $location.path('/home');
        }
         else
            console.log("Invalid Dashboard");
      };
      $scope.export = function(dashboard){
          console.log(JSON.stringify($scope.dashboards));
      }
      $scope.share = function(dashboardid){
          if(dashboardid == 0){
              alert("You can't share this dashboard.");
              return;
          }

          var shareModalOptions = {
                  templateUrl: 'template/dashboard-share-template.html',
                  controller: 'DashboardShareCtrl'
              };
          shareModalOptions.resolve = {
              dashboardid: function () {
                  return dashboardid;
              }
          };
          // Create the modal
          var modalInstance = $modal.open(shareModalOptions);
          //var onClose = widget.onSettingsClose || scope.options.onSettingsClose;
          //var onDismiss = widget.onSettingsDismiss || scope.options.onSettingsDismiss;

          // Set resolve and reject callbacks for the result promise
          modalInstance.result.then(
              function (result) {

                  // Call the close callback
                 // onClose(result, widget, widget_scope);
                  //AW Persist title change from options editor
                  //scope.$emit('widgetChanged', widget);
              },
              function (reason) {

                  // Call the dismiss callback
                  //onDismiss(reason, scope);

              }
          );
      };
      $scope.editTitle = function(dashboard, titleelement){
          dashboard.editingTitle = true;
      }
      $scope.saveTitleEdit = function(dashboard){
          //dbService.saveStorage("ngStorage-dashboards", JSON.stringify($scope.dashboards));
          dbService.updateDashboard(dashboard);
          dashboard.editingTitle = false;

      }
      // Handling Signing Callback from GooglePlus
      $scope.$on('event:google-plus-signin-success', function (event, authResult) {
        console.log(authResult);
        googleService.login().then(function(){
            googleService.getUserData($scope).then(function(response){
                var d = new Date();
                window.Intercom('boot', {
                    app_id: "oqur09vj",
                    // TODO: The current logged in user's full name
                    name: response.name,
                    // TODO: The current logged in user's email address.
                    email: response.email,
                    // TODO: The current logged in user's sign-up date as a Unix timestamp.
                    created_at: d.getTime()
                });
                window.Intercom('update');
                $window.location.href= '#/supergrader';
            });

        });
      });
      $scope.$on('event:google-plus-signin-failure', function (event, authResult) {

      });
      googleService.loadColumns();
      $scope.userInfo = {picture : "images/default.jpg", name:"Undefined"};
      return $scope.main = {
        brand: 'Flatify',
        name: 'Lisa Doe'
      };
    }
  ]).controller('NavCtrl', [
    '$scope', 'taskStorage', 'filterFilter', function($scope, taskStorage, filterFilter) {
      $scope.currentDashboardId = 0;
      $scope.changedashboard = function(dashboardid){
          $scope.currentDashboardId = dashboardid;
      }
      var tasks;
      tasks = $scope.tasks = taskStorage.get();
      $scope.taskRemainingCount = filterFilter(tasks, {
        completed: false
      }).length;
      return $scope.$on('taskRemaining:changed', function(event, count) {
        return $scope.taskRemainingCount = count;
      });
    }
  ]).controller('HomeCtrl', [
      '$scope', '$location', '$window', function($scope, $location, $window){
          if($location.host() != "localhost") {
              if ($location.path() != "/pages/signin" && $window.gapi == undefined) {
                  $location.path("/pages/signin");
              }
          }
          $scope.myInterval = 1000;
          var slides = $scope.slides = [];
          $scope.addSlide = function(index) {
              $scope.slides.push({
                  image: 'images/homeslider/slider' + index + '.jpg'
              });
          };
          $scope.gotoResources = function(){
              $location.path('/resources');
          }
          for (var i=1; i<=5; i++) {
              $scope.addSlide(i);
          }
      }])
.controller('SuperGraderCtrl',[
    '$scope', '$location', '$window', '$modal', 'googleService', function($scope, $location, $window, $modal, googleService){
              if($location.host() != "localhost") {
                  if ($location.path() != "/pages/signin" && $window.gapi == undefined) {
                      $location.path("/pages/signin");
                  }
              }
              $scope.result = {ga : []};
              $scope.result.ga.accounts = googleService.getAccounts();
              $scope.result.ga.properties = googleService.getProperties();
              $scope.result.ga.profiles = googleService.getProfiles();
              $scope.segments_data = [];
              $scope.loading_progress = 0;
              $scope.easypiechart_allsessions = {
                  percent: 0,
                  options: {
                      animate: {
                          duration: 1000,
                          enabled: true
                      },
                      barColor: '#976CAD',
                      lineCap: 'square',
                      size: 200,
                      lineWidth: 40,
                      scaleLength: 0
                  }
              };
              var metArray = ["ga:sessions", "ga:bounceRate", "ga:avgSessionDuration", "ga:pageviewsPerSession", "ga:exits", "ga:goalAbandonRateAll", "ga:goalConversionRateAll"];
              $scope.openShareDialog = function(){
                  var modalInstance;
                  modalInstance = $modal.open({
                      templateUrl: "SocialShareDialog.html",
                      scope:$scope
                  });
              };
              $scope.startGrade = function(){
                  var profile = _.findWhere(googleService.getProfiles(), {id: $scope.result.ga.profileid});
                  var segments = googleService.getSegments();
                  var segment_count = 25;
                  var index = 0;
                  segments.forEach(function(segment){
                      if(segment.type != "BUILT_IN")
                         return;
                      var retry_count = 0;
                      var request_analytics = function() {
                          googleService.loadAnalytics(profile, '90daysAgo', 'yesterday', '', metArray.toString(), segment.id, 25).then(function (data) {
                              var segment_info = {segment_id: data.query.segment, rows: data.rows[0], gradevalue : 0};
                              $scope.segments_data.push(segment_info);
                              index++;
                              $scope.loading_progress = (index * 100 ) / segment_count;
                              if (index == segment_count) {
                                  $scope.calculate();
                              }
                          }, function (error) {
                              if(error.code == 403) {
                                  if (retry_count < 5) {
                                      setTimeout(function () {
                                          request_analytics();
                                          retry_count++;
                                      }, Math.pow(2, retry_count) * 1000 + (Math.random() * 1000) % 1000);
                                  }
                              }else{
                                  var segment_info = {segment_id: segment.id, gradevalue : 0};
                                  $scope.segments_data.push(segment_info);
                                  index++;
                                  $scope.loading_progress = (index * 100 ) / segment_count;
                                  if (index == segment_count) {
                                      $scope.calculate();
                                  }
                              }
                          });
                      };
                     request_analytics();
                  });
              };

              $scope.startDashing  = function(){
                  $location.path('/home');
              }

              $scope.calculate = function(){
                  var segments_data = $scope.segments_data;
                  var segment_count = segments_data.length;
                  var metric_ranks = [];
                  var i,j;
                  var sort_orders = ["asc", "desc", "asc", "asc", "desc", "desc", "asc"];
                  // Get the ordered array of each metric values
                  for(i=0; i<metArray.length; i++){
                      var kpis = [];
                      for(j=0; j<segment_count; j++){
                        kpis.push(segments_data[j].rows[i]);
                      }
                      var sorted = kpis.slice().sort();
                      if(sort_orders == "desc")
                        sorted = sorted.reverse();
                      metric_ranks.push(sorted);
                  }
                  var average_grade = 0;
                  for(i=0; i<segment_count; i++) {
                      var exp_grade = 0;
                      if(segments_data[i].rows[0] == 0){
                          segments_data[i].gradevalue = 0;
                          continue;
                      }
                      for (j = 0; j < metArray.length; j++) {
                          var rank = metric_ranks[j].indexOf(segments_data[i].rows[j]);
                          exp_grade = exp_grade + rank;
                      }
                      exp_grade = (exp_grade / 6) * 4;
                      segments_data[i].gradevalue = exp_grade;
                      average_grade = average_grade + exp_grade;
                  }
                  $scope.loading_progress = 100;
                  average_grade = Math.round(average_grade / segment_count);
                  $scope.easypiechart_allsessions.percent = Math.round(average_grade);
                  segments_data.sort(function(a,b){return a.gradevalue- b.gradevalue;});
                  segments_data = _.filter(segments_data, function(a){return a.gradevalue>0});
                  $scope.topfive = [];
                  $scope.bottomfive = [];
                  for(i=0; i<5; i++){
                     $scope.bottomfive.push(googleService.getSegmentName(segments_data[i].segment_id));
                  }
                  for(i=segments_data.length-1; i>=segments_data.length-5; i--){
                      $scope.topfive.push(googleService.getSegmentName(segments_data[i].segment_id));
                  }
                  $scope.fbLikeurl = "http://superbrain.io/?utm_source=facebook&utm_medium=share&utm_campaign=grade";
                  $scope.sharingtext = "My website just scored " + average_grade + "% customer experience by #Superbrain#cxm #analytics Test your score at ";
              };
          }])
}.call(this));

