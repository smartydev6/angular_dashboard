var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var sourcemaps = require('gulp-sourcemaps');
var order = require('gulp-order');

var paths = {
    scripts:[   'bower_components/angular-route/angular-route.min.js',
                'bower_components/angular-animate/angular-animate.min.js',
                'bower_components/underscore/underscore-min.js',
               // 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'bower_components/jquery-spinner/dist/jquery.spinner.min.js',
                'bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js',
                'bower_components/jquery-steps/build/jquery.steps.min.js',
                'bower_components/toastr/toastr.min.js',
                'bower_components/bootstrap-file-input/bootstrap.file-input.js',
                'bower_components/jquery.slimscroll/jquery.slimscroll.min.js',
                'bower_components/holderjs/holder.js',
                'bower_components/flot/jquery.flot.resize.js',
                'bower_components/flot/jquery.flot.pie.js',
                'bower_components/flot/jquery.flot.stack.js',
                'bower_components/flot.tooltip/js/jquery.flot.tooltip.min.js',
                'bower_components/flot/jquery.flot.time.js',
                'bower_components/gauge.js/dist/gauge.min.js',
                'bower_components/jquery.easy-pie-chart/dist/angular.easypiechart.min.js',
                'bower_components/angular-wizard/dist/angular-wizard.min.js',
                'bower_components/textAngular/dist/textAngular-sanitize.min.js',
                // 'bower_components/textAngular/dist/textAngular.min.js'
    ],
    scripts1:[
         'bower_components/lodash/dist/lodash.js',
         'bower_components/angularjs-dropdown-multiselect/dist/angularjs-dropdown-multiselect.min.js',
         'bower_components/ng-grid/ng-grid-2.0.11.min.js',
//         'bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
         'bower_components/pines-notify/pnotify.core.js',
         'bower_components/angular-pines-notify/src/pnotify.js',
         'bower_components/visibilityjs/lib/visibility.core.js',
         'bower_components/moment/min/moment.min.js',
         'bower_components/angular-bootstrap-datepicker/dist/angular-bootstrap-datepicker.min.js',
         'bower_components/angular-ui-sortable/sortable.js',
         'bower_components/ngStorage/ngStorage.min.js'
    ],
    scripts_malhar_widget:[
            'scripts/malhar/modules.js',
            'scripts/malhar/models/*.js',
            'scripts/malhar/service/*.js',
            'scripts/malhar/vendor/*.js',
            'scripts/malhar/widgets/**/*.js'],

    scripts_malhar_dashboard:[
            'bower_components/malhar-angular-dashboard/src/directives/dashboard.js',
            'bower_components/malhar-angular-dashboard/src/directives/*.js',
            'bower_components/malhar-angular-dashboard/src/controllers/*.js',
            'bower_components/malhar-angular-dashboard/src/models/*.js'
    ],
    /* scripts_malhar_dashboard:[
            'bower_components/malhar-angular-dashboard/src/directives/dashboard.js',
            'bower_components/malhar-angular-dashboard/src/directives/dashboard-layouts.js',
            'bower_components/malhar-angular-dashboard/src/directives/widget.js',
            'bower_components/malhar-angular-dashboard/src/controllers/dashboardWidgetCtrl.js',
            'bower_components/malhar-angular-dashboard/src/controllers/SaveChangesModalCtrl.js',
            'bower_components/malhar-angular-dashboard/src/controllers/widgetSettingsCtrl.js',
            'bower_components/malhar-angular-dashboard/src/controllers/widgetSettingsCompsCtrl.js',
            'bower_components/malhar-angular-dashboard/src/models/dashboardState.js',
            'bower_components/malhar-angular-dashboard/src/models/LayoutStorage.js',
            'bower_components/malhar-angular-dashboard/src/models/widgetDataModel.js',
            'bower_components/malhar-angular-dashboard/src/models/widgetDefCollection.js',
            'bower_components/malhar-angular-dashboard/src/models/widgetModel.js'
    ], */

    images: 'client/img/**/*'
};

gulp.task('scripts',  function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down.
    console.log(paths.scripts);
    gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(sourcemaps.init())
        .pipe(concat('components.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));

    gulp.src(paths.scripts1)
        .pipe(order(paths.scripts1))
        .pipe(uglify())
        .pipe(sourcemaps.init())
        .pipe(concat('components1.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));
    gulp.src(paths.scripts_malhar_widget)
        .pipe(concat('malhar-widget.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));
    gulp.src(paths.scripts_malhar_dashboard)
        .pipe(concat('malhar-dashboard.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));

});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
});

// The default task (called when you run `gulp` from cli)
