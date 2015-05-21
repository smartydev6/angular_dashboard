angular.module('app.services')
    .service('mainService', ['$http', '$rootScope', '$q', '$window', '$localStorage', '$anchorScroll', '$location',
        function ($http, $rootScope, $q, $window, $localStorage, $anchorScroll, $location) {
            var dashboards = [];
            var daterange_array = [{value:"today", label:"Today"},
                                    {value:"yesterday", label:"Yesterday"},
                                    {value:"last7", label:"Last 7 Days"},
                                    {value:"last30", label:"Last 30 Days"},
                                    {value:"prevmonth", label:"Previous Month"},
                                    {value:"prevyear", label:"Previous Year"},
                                    {value:"custom", label:"Custom Date Range"}
                ];
            this.getDateRangeArray = function(){
                return daterange_array;
            }
            this.getDateRangeLabel = function(value){
                var daterange = _.findWhere(daterange_array, {"value" : value});
                if(daterange!=undefined)
                    return daterange.label;
                else
                    return "";
            }
        }]);