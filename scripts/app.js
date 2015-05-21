(function() {
  'use strict';
  angular.module('app', ['ngRoute', 'ui.bootstrap', 'ngStorage', 'directive.g+signin', 'ui.sortable', 'ui.select', 'ui.dashboard',  'ui.widgets', 'ui.models', 'daterangepicker', 'easypiechart', 'mgcrea.bootstrap.affix', 'mgo-angular-wizard', 'textAngular', 'angular-loading-bar', 'app.ui.ctrls', 'app.ui.directives', 'app.ui.services', 'app.controllers', 'app.directives', 'app.form.validation', 'app.ui.form.ctrls', 'app.ui.form.directives', 'app.tables', 'app.task', 'app.localization', 'app.chart.ctrls', 'app.chart.directives', 'djds4rce.angular-socialshare', 'angulike']).config([
    '$routeProvider', function($routeProvider) {
      return $routeProvider.when('/', {
        redirectTo: '/supergrader'
      }).when('/home', {
          title : 'Superbrain - The Dashboard that thinks',
        templateUrl: 'views/home.html',
          controller: 'HomeCtrl'
      }).when('/supergrader',{
         title : 'SuperBrain - Grade your website customer experience in seconds and for free',
         templateUrl : 'views/supergrader.html',
          controller: 'SuperGraderCtrl'
      }).when('/dashboard/:dashboard',{
          title : 'Superbrain - The Dashboard that thinks',
          templateUrl: 'views/dashboard.html',
          controller: 'DashboardCtrl'
      }).when('/dashboardExport',{
          templateUrl: 'views/dashboard.html',
          controller: 'DashboardExportCtrl'
      }).when('/resources',{
          templateUrl: 'views/resources.html'
      }).when('/admin/login',{
          templateUrl: 'views/admin/login.html',
          controller: 'AdminLoginCtrl'
      }).when('/admin',{
          templateUrl: 'views/admin/home.html',
          controller: 'AdminCtrl'
      }).when('/ui/typography', {
        templateUrl: 'views/ui/typography.html'
      }).when('/ui/buttons', {
        templateUrl: 'views/ui/buttons.html'
      }).when('/ui/icons', {
        templateUrl: 'views/ui/icons.html'
      }).when('/ui/grids', {
        templateUrl: 'views/ui/grids.html'
      }).when('/ui/widgets', {
        templateUrl: 'views/ui/widgets.html'
      }).when('/ui/components', {
        templateUrl: 'views/ui/components.html'
      }).when('/ui/timeline', {
        templateUrl: 'views/ui/timeline.html'
      }).when('/ui/pricing-tables', {
        templateUrl: 'views/ui/pricing-tables.html'
      }).when('/forms/elements', {
        templateUrl: 'views/forms/elements.html'
      }).when('/forms/layouts', {
        templateUrl: 'views/forms/layouts.html'
      }).when('/forms/validation', {
        templateUrl: 'views/forms/validation.html'
      }).when('/forms/wizard', {
        templateUrl: 'views/forms/wizard.html'
      }).when('/tables/static', {
        templateUrl: 'views/tables/static.html'
      }).when('/tables/responsive', {
        templateUrl: 'views/tables/responsive.html'
      }).when('/tables/dynamic', {
        templateUrl: 'views/tables/dynamic.html'
      }).when('/charts/others', {
        templateUrl: 'views/charts/charts.html'
      }).when('/charts/morris', {
        templateUrl: 'views/charts/morris.html'
      }).when('/charts/flot', {
        templateUrl: 'views/charts/flot.html'
      }).when('/mail/inbox', {
        templateUrl: 'views/mail/inbox.html'
      }).when('/mail/compose', {
        templateUrl: 'views/mail/compose.html'
      }).when('/mail/single', {
        templateUrl: 'views/mail/single.html'
      }).when('/pages/features', {
        templateUrl: 'views/pages/features.html'
      }).when('/pages/signin', {
        templateUrl: 'views/pages/signin.html'
      }).when('/pages/signup', {
        templateUrl: 'views/pages/signup.html'
      }).when('/pages/lock-screen', {
        templateUrl: 'views/pages/lock-screen.html'
      }).when('/pages/profile', {
        templateUrl: 'views/pages/profile.html'
      }).when('/404', {
        templateUrl: 'views/pages/404.html'
      }).when('/pages/500', {
        templateUrl: 'views/pages/500.html'
      }).when('/pages/blank', {
        templateUrl: 'views/pages/blank.html'
      }).when('/pages/invoice', {
        templateUrl: 'views/pages/invoice.html'
      }).when('/tasks', {
        templateUrl: 'views/tasks/tasks.html'
      });
    }
  ])
  .config(['$httpProvider', function($httpProvider) {
      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }]).run(['$location', '$rootScope', function($location, $rootScope) {
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            $rootScope.title = current.$$route.title;
        });}])
 .controller('DashboardCtrl', function ($scope, $interval, $routeParams, RandomTopNDataModel, RandomTimeSeriesDataModel,
                                    RandomMinutesDataModel,  RandomMetricsTimeSeriesDataModel, $localStorage, $window, $location) {
    /* if($location.host() != "localhost") {
          if ($location.path() != "/pages/signin" && $window.gapi == undefined) {
              $location.path("/pages/signin");
          }
      } */
    if(!$routeParams.dashboard)
        $location.path('/home');
    else {
        $scope.dashboardid = $routeParams.dashboard;
        $scope.dashboard = _.findWhere($scope.dashboards, {id: $scope.dashboardid});
        if(_.isUndefined($scope.dashboard))
            $location.path('/home');
    }
    var widgetDefinitions = [
      {
        name: 'Table',
        btntitle: 'Table',
        directive: 'wt-top-n',
        dataAttrName: 'data',
          attrs: {
              showTimeline: 0
          },
          style:{
              width: '100%'
          },
          dataModelType: RandomTopNDataModel
      },
        {
            name: 'SuperScore',
            btntitle: 'Superscore',
            directive: 'wt-super-score',
            dataAttrName: 'data',
            attrs: {
                showTimeline: 0,
                showWidgetDisplayPrefers: 1,
            },
            style:{
                width: '100%'
            },
            dataModelType: RandomTopNDataModel
        },
      {
          name: 'AreaChart',
          btntitle: 'Area Chart',
          directive: 'wt-area-chart',
          dataAttrName: 'data',
          attrs: {
              showTimeline: 1,
          },
          style:{
              width: '100%'
          },
          dataModelType: RandomTopNDataModel
      },
        {
            name: 'LineChart',
            btntitle: 'Line Chart',
            directive: 'wt-line-chart',
            dataAttrName: 'data',
            attrs: {
                showTimeline: 1
            },
            style:{
                width: '100%'
            },
            dataModelType: RandomTopNDataModel
        },
        {
            name: 'BarChart',
            btntitle: 'Bar Chart',
            directive: 'wt-bar-chart',
            attrs: {
                showTimeline: 1
            },
            dataAttrName: 'data',
            style:{
                width: '100%'
            },
            dataModelType: RandomTopNDataModel
        },
        {
            name: 'PieChart',
            btntitle: 'Pie Chart',
            directive: 'wt-pie-chart',
            dataAttrName: 'data',
            attrs: {
                showTimeline: 0,
                hideWidgetComparisons: true
            },
            style:{
                width: '100%'
            },
            dataModelType: RandomTopNDataModel
        },
        {
            name: 'KPI',
            btntitle: 'KPI',
            directive: 'wt-kpi',
            dataAttrName: 'data',
            attrs: {
                showTimeline: 0,
                hideDimension: 1,
                hideWidgetComparisons: true,
                showIndicator: true
            },
            style:{
                width: '100%'
            },
            dataModelType: RandomTopNDataModel
        },
        {
            name: 'SmartKPI',
            btntitle: 'Smart KPI',
            directive: 'wt-smart-kpi',
            dataAttrName: 'data',
            attrs: {
                showTimeline: 0,
                hideDimension: 1,
                hideWidgetComparisons: true,
                showIndicator: true
            },
            style:{
                width: '100%'
            },
            dataModelType: RandomTopNDataModel
        },
        {
            name: 'Note',
            btntitle: 'Note',
            directive: 'wt-note',
            dataAttrName: 'data',
            attrs: {
                hideWidgetSettings: true,
                hideWidgetComparisons: true,
                hideWidgetLoad:true,
                showWidgetSave:true,
                isSaved:true
            },
            style:{
                width: '100%'
            },
            dataModelType: RandomTopNDataModel
        }
    ];

    var defaultWidgets = [

    ];

    $scope.dashboardOptions = {
      widgetButtons: false,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      storage: $window.localStorage,
      storageId: 'storage' + $scope.dashboardid
    };
  });
}).call(this);

