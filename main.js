(function() {

    let my_app = angular.module('FAIRmetricsApp',
        [
            'ngRoute',
            'ngMaterial',
            'ngAria',
            'ngAnimate',
            'ngMessages',
            'chart.js',
            'appLoader',
            'appConfigCtrl',
            'appGraphCtrl',
            'appCreatorsCtrl',
            'requestProviderCtrl'
        ])
        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('docs-dark', 'default')
                .primaryPalette('yellow')
        });

    // Disabling debug annotations for performance boost.
    my_app.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }]);


    /* *************************************************************************************************** */
    /* ROUTING */

    my_app.config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl : "scripts/views/main.html",
            })
            .when("/collections", {
                templateUrl : "scripts/views/listerPages.html",
                controller: "requestCtrl"
            })
            .when("/collections/:id", {
                templateUrl : "scripts/views/collection.html",
                controller: "requestCtrl"
            })
            .when("/collection/new", {
                templateUrl : "scripts/views/create_collection.html",
                controller: "newCollectionCtrl"
            })
            .when("/collections/:id/evaluate", {
                templateUrl : "scripts/views/run_evaluation.html",
                controller: "runEvaluationCtrl"
            })
            .when("/evaluations", {
                templateUrl : "scripts/views/listerPages.html",
                controller: "requestCtrl"
            })
            .when("/evaluations/:id", {
                templateUrl : "scripts/views/evaluation.html",
                controller: "requestCtrl"
            })
            .when("/metrics", {
                templateUrl : "scripts/views/listerPages.html",
                controller: "requestCtrl"
            })
            .when("/metrics/:id", {
                templateUrl : "scripts/views/metric.html",
                controller: "requestCtrl"
            })
            .when("/metric/new", {
                templateUrl: "scripts/views/import_metric.html",
                controller: "newMetricCtrl"
            })
            .when("/searches", {
                templateUrl : "scripts/views/searches.html",
                controller: "requestCtrl"
            })
            .when("/about", {
                templateUrl : "scripts/views/about.html"
            })
            .otherwise("/", {
                templateUrl : "scripts/views/main.html",
            });
    });


    /* *************************************************************************************************** */
    /* MAIN CONTROLLER */

    my_app.controller(
        'mainCtrl',
        function($http, $scope, $window, $location) {
            $scope.warning_on = $scope.$parent.warning;
            $scope.terms = null;
            $scope.search_errors = null;
            $scope.metrics_searchTerms = "";
            $scope.collections_searchTerms = "";
            $scope.search_triggered = false;
            $scope.current_path = $location.path();
            if ($scope.current_path === ""){
                $scope.current_path = '/';
            }

            $scope.goToSearches = function(terms){
                let window_url = new $window.URL($location.absUrl());
                $scope.search_triggered = true;
                if (terms !== null){
                    let termsArray = terms.split(',');
                    for (let k in termsArray){
                        termsArray[k] = termsArray[k].trim()
                    }
                    $window.location.href =  window_url.origin + window_url.pathname + '#!searches?terms=' + termsArray;
                }
            };

            $scope.removeWarning = function(){
                $scope.warning_on = false;
            };

            $scope.isURL = function(string){
                return (string.startsWith('https://') || string.startsWith('http://'));

            }

        }
    );

    my_app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
        let original = $location.path;
        $location.path = function (path, reload) {
            if (reload === false) {
                let lastRoute = $route.current;
                let un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }
            return original.apply($location, [path]);
        };
    }])

})();

