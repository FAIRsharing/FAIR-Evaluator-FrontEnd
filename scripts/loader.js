let loader = angular.module('appLoader', []);

/* *************************************************************************************************** */
/* FILTERS */

loader.filter('URL_last_arg', function() {
    return function (url) {
        let item = url.split('/').slice(-1)[0];
        if (item.indexOf('#') > 0){
            return item.split('#').slice(-1)[0]
        }
        return item;
    };
});

loader.filter('test_of_URL', function() {
    return function (url) {
        let item = url.split('/').slice(-1)[0];

        if (item.indexOf('#') > 0){
            return item.split('#').slice(-1)[0]
        }
        return item.replace("FM", "MI");
    };
});


loader.filter('removeUnderscore', function() {
    return function (str) {
        return str.replace(/_/g, ' ')
    };
});

loader.filter('str_to_int', function() {
    return function (str) {
        return parseInt(str)
    };
});

loader.filter('replaceURL', function($location) {
    return function (str) {
        let urlArray = str.split('/');
        let identifier = urlArray[urlArray.length - 1];
        return $location.absUrl().replace($location.$$path, '') + '/metrics/' + identifier
    };
});



/* *************************************************************************************************** */
/* DIRECTIVES */

/* DNA Loading animation directive */
loader.directive('loader', function(){
    return{
        restrict: 'A',
        templateUrl: 'scripts/directives/loader.html',
    }
});

/* Warning */
loader.directive('warning', function(){
    return{
        restrict: 'A',
        templateUrl: 'scripts/directives/warning.html',
    }
});

/* Timeout Error */
loader.directive('timeout', function(){
    return{
        restrict: 'A',
        templateUrl: 'scripts/directives/timeout.html',
    }
});

/* Metrics table */
loader.directive('metricsData', function(){
    return{
        restrict: 'A',
        templateUrl: 'scripts/directives/metricsTable.html',
        scope: {
            metricsData: '=',
        },
        link: function($scope){
            $scope.$watch('metricsData', function(metricsData){
                if(metricsData)
                    $scope.content_output = $scope.metricsData;
            });
        }
    }
});

/* Collections table */
loader.directive('collectionsData', function(){
    return{
        restrict: 'A',
        templateUrl: 'scripts/directives/collectionsTable.html',
        scope: {
            collectionsData: '=',
        },
        link: function($scope){
            $scope.$watch('collectionsData', function(collectionsData){
                if(collectionsData)
                    $scope.content_output = $scope.collectionsData;
            });
        }
    }
});

/* Collections table */
loader.directive('evaluationsData', function(){
    return{
        restrict: 'A',
        templateUrl: 'scripts/directives/evaluationsTable.html',
        scope: {
            evaluationsData: '=',
        },
        link: function($scope){
            $scope.$watch('evaluationsData', function(evaluationsData){
                if(evaluationsData)
                    $scope.content_output = $scope.evaluationsData;
            });
        }
    }
});