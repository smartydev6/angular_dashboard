<?php
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST');  
?>
<!doctype html>
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv='X-UA-Compatible' content='IE=edge,chrome=1'>
        <title>Superbrain - The Dashboard that thinks</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
        <link href='http://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic' rel='stylesheet' type='text/css'>
        <!-- needs images, font... therefore can not be part of ui.css -->
        <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/css/font-awesome.css">
        <link rel="stylesheet" href="bower_components/weather-icons/css/weather-icons.min.css">
        <!-- end needs images -->
	<!-- <link rel="stylesheet" href="styles/main.css"> -->
	<link rel="stylesheet" href="styles/print.css">
	<link rel="stylesheet" href="styles/my.css">	
    <link rel="stylesheet" href="bower_components/malhar-angular-dashboard/dist/angular-ui-dashboard.css">
    <link rel="stylesheet" href="bower_components/ng-grid/ng-grid.min.css">
    <link rel="icon" href="images/shortcut_icon.png">
    <style type="text/css">
        /* .top-n .grid {
            height: 350px;
            border: 1px solid rgb(212, 212, 212);
        } */
        .line-chart, .bar-chart {
            height: 220px
        }
    </style>
    </head>
    <body data-ng-app="app" id="app" data-custom-background data-off-canvas-nav>
        <div style="width:800px;text-align:center;">
            <span><b><?php echo $_POST['dashboardTitle'];?></b></span>
            <span style="float:right;margin-top:-15px;"><img src="images/superbrain_black.png" style="width:150px"/></span>
        </div>
        <div data-ng-controller="AppCtrl">       
            <div class="view-container">
                <section data-ng-view id="content" class="animate-fade-up"></section>
            </div>
        </div>


        <!-- build:js scripts/vendor.js -->
        <script src="bower_components/jquery/dist/jquery.min.js"></script>
        <script src="bower_components/jquery-ui/jquery-ui.js"></script>
        <script src="bower_components/angular/angular.min.js"></script>
        <script src="bower_components/angular-route/angular-route.min.js"></script>
        <script src="bower_components/angular-animate/angular-animate.min.js"></script>
        <script src="bower_components/underscore/underscore-min.js"></script>
        <!-- endbuild -->

        <!-- build:js scripts/ui.js -->
        <script src="bower_components/angular-bootstrap/ui-bootstrap.min.js"></script>
        <script src="bower_components/angular-jquery/dist/angular-jquery.min.js"></script>
        <script src="bower_components/angular-bootstrap-affix/dist/angular-bootstrap-affix.min.js"></script>
        <script src="bower_components/jquery-spinner/dist/jquery.spinner.min.js"></script>
        <script src="bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js"></script>
        <script src="bower_components/jquery-steps/build/jquery.steps.min.js"></script>
        <script src="bower_components/toastr/toastr.min.js"></script>
        <script src="bower_components/bootstrap-file-input/bootstrap.file-input.js"></script>
        <script src="bower_components/jquery.slimscroll/jquery.slimscroll.min.js"></script>
        <script src="bower_components/holderjs/holder.js"></script>
        <script src="bower_components/raphael/raphael-min.js"></script>
        <script src="bower_components/morris.js/morris.js"></script>
        <script src="scripts/vendors/responsive-tables.js"></script>
        <script src="scripts/vendors/jquery.sparkline.min.js"></script>
        <script src="bower_components/flot/jquery.flot.js"></script>
        <script src="bower_components/flot/jquery.flot.resize.js"></script>
        <script src="bower_components/flot/jquery.flot.pie.js"></script>
        <script src="bower_components/flot/jquery.flot.stack.js"></script>
        <script src="bower_components/flot.tooltip/js/jquery.flot.tooltip.min.js"></script>
        <script src="bower_components/flot/jquery.flot.time.js"></script>
        <!--<script src="bower_components/gauge.js/dist/gauge.min.js"></script>-->
        <script src="bower_components/jquery.easy-pie-chart/dist/angular.easypiechart.min.js"></script>
        <script src="bower_components/angular-wizard/dist/angular-wizard.min.js"></script>
        <script src="bower_components/textAngular/dist/textAngular-sanitize.min.js"></script>
        <script src="bower_components/textAngular/dist/textAngular.min.js"></script>
        <script src="bower_components/angular-loading-bar/build/loading-bar.min.js"></script>
        <script src="scripts/vendors/skycons.js"></script>


        <script src="bower_components/lodash/dist/lodash.js"></script>
        <script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script>
        <script src="bower_components/angularjs-dropdown-multiselect/dist/angularjs-dropdown-multiselect.min.js"></script>
        <script src="bower_components/ng-grid/ng-grid-2.0.11.min.js"></script>
        <script src="bower_components/d3/d3.js"></script>
        <script src="bower_components/nvd3/nv.d3.js"></script>
        <script src="bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js"></script>
        <script src="bower_components/malhar-angular-dashboard/dist/angular-ui-dashboard.js"></script>
        <script src="bower_components/pines-notify/pnotify.core.js"></script>
        <script src="bower_components/angular-pines-notify/src/pnotify.js"></script>
        <script src="bower_components/visibilityjs/lib/visibility.core.js"></script>
        <script src="bower_components/moment/min/moment.min.js"></script>
        <!-- endbuild -->
        <script src="bower_components/angular-ui-sortable/sortable.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/directives/dashboard-export.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/directives/dashboard-layouts.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/directives/widget.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/controllers/dashboardWidgetCtrl.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/controllers/SaveChangesModalCtrl.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/controllers/widgetSettingsCtrl.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/controllers/widgetDisplayPrefersCtrl.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/controllers/widgetSettingsCompsCtrl.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/models/dashboardState.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/models/LayoutStorage.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/models/widgetDataModel.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/models/widgetDefCollection.js"></script>
        <script src="bower_components/malhar-angular-dashboard/src/models/widgetModel.js"></script>
        <script src="bower_components/ngStorage/ngStorage.min.js"></script>
        <script src="bower_components/angular-directive.g-signin/google-plus-signin.js"></script>
        <script src="bower_components/canvg/dist/canvg.bundle.js"></script>
        <script src="bower_components/html2canvas.js"></script>
        <script src="bower_components/bootstrap-daterangepicker/daterangepicker.js"></script>
        <script src="bower_components/angular-daterangepicker/js/angular-daterangepicker.min.js"></script>
        <script src="bower_components/ui-select/dist/select.min.js"></script>
        <script src="http://platform.twitter.com/widgets.js"></script>
        <script src="bower_components/angular-socialshare/angular-socialshare.min.js"></script>
        <script src="bower_components/angulike/angulike.js"></script>

        <script src="scripts/malhar/modules.js"></script>
        <script src="scripts/malhar/models/random.js"></script>
        <script src="scripts/malhar/models/websocket.js"></script>
        <script src="scripts/malhar/service/visibility.js"></script>
        <script src="scripts/malhar/service/websocket.js"></script>
        <script src="scripts/malhar/vendor/gauge_vendor.js"></script>
        <script src="scripts/malhar/vendor/visibly.js"></script>
        <script src="scripts/malhar/widgets/barChart/barChart.js"></script>
        <script src="scripts/malhar/widgets/gauge/gauge.js"></script>
        <script src="scripts/malhar/widgets/historicalChart/historicalChart.js"></script>
        <script src="scripts/malhar/widgets/areaChart/areaChart.js"></script>
        <script src="scripts/malhar/widgets/lineChart/lineChart.js"></script>
        <script src="scripts/malhar/widgets/metricsChart/metricsChart.js"></script>
        <script src="scripts/malhar/widgets/nvd3LineChart/nvd3LineChart.js"></script>
        <script src="scripts/malhar/widgets/pieChart/pieChart.js"></script>
        <script src="scripts/malhar/widgets/random/random.js"></script>
        <script src="scripts/malhar/widgets/scopeWatch/scopeWatch.js"></script>
        <script src="scripts/malhar/widgets/select/select.js"></script>
        <script src="scripts/malhar/widgets/time/time.js"></script>
        <script src="scripts/malhar/widgets/topN/topN.js"></script>
        <script src="scripts/malhar/widgets/superscore/superscore.js"></script>
        <script src="scripts/malhar/widgets/note/note.js"></script>
        <script src="scripts/malhar/widgets/kpi/kpi.js"></script>
        <script src="scripts/malhar/widgets/smartkpi/smartkpi.js"></script>

        <!-- build:js({.tmp,client}) scripts/app.js -->
        <script src="scripts/app.js"></script>
        <script src="scripts/shared/main.js"></script>
        <script src="scripts/shared/directives.js"></script>
        <script src="scripts/shared/localize.js"></script>
        <script src="scripts/shared/DashboardShareCtrl.js"></script>
        <script src="scripts/UI/UICtrl.js"></script>
        <script src="scripts/UI/UIDirective.js"></script>
        <script src="scripts/UI/UIService.js"></script>
        <script src="scripts/Form/FormDirective.js"></script>
        <script src="scripts/Form/FormCtrl.js"></script>
        <script src="scripts/Form/FormValidation.js"></script>
        <script src="scripts/Table/TableCtrl.js"></script>
        <script src="scripts/Task/Task.js"></script>
        <script src="scripts/Chart/ChartCtrl.js"></script>
        <script src="scripts/Chart/ChartDirective.js"></script>
        <script src="scripts/Admin/AdminCtrl.js"></script>
        <script src="scripts/Admin/AdminLoginCtrl.js"></script>
        <script src="scripts/services/google.js"></script>
        <script src="scripts/services/database.js"></script>
        <script src="scripts/services/reporting.js"></script>
        <script src="scripts/services/mainservice.js"></script>
        <script type="text/javascript">
            angular.module('app').controller('DashboardExportCtrl', function ($scope, $interval, $routeParams, RandomTopNDataModel, RandomTimeSeriesDataModel,
                                                           RandomMinutesDataModel,  RandomMetricsTimeSeriesDataModel, $localStorage, $window, $location) {
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
                  var defaultWidgets =<?php $dashboardData = urldecode(urldecode($_POST['dashboardData']));echo $dashboardData;?>;

				  //var defaultWidgets = [{"name":"Note","dashboardid":"38","title":"Widget 1","data":"<p>äöå</p><p>This is scandinavian letter.</p>"}];
				  $scope.dashboardOptions = {
                      widgetButtons: true,
                      widgetDefinitions: widgetDefinitions,
                      defaultWidgets: defaultWidgets,
                      storage: $window.localStorage,
                      storageId: 'storage' + $scope.dashboardid,
                      hideToolbar: true,
                      showTitle:true
                  };
              });
        </script>
        <!-- endbuild -->
    </body>
</html>
