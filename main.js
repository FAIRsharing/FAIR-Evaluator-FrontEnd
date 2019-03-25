(function() {

    let my_app = angular.module('FAIRmetricsApp',
        [
            'ngRoute',
            'ngMaterial',
            'ngAria',
            'ngAnimate',
            'ngMessages',
            'chart.js',
            'appConfigCtrl',
            'appGraphCtrl',
            'appCollectionsCtrl',
            'appEvaluationsCtrl',
            'appMetricsCtrl'
        ])
        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('docs-dark', 'default')
                .primaryPalette('yellow')
        });

    my_app.config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl : "scripts/views/main.html",
            })
            .when("/collections", {
                templateUrl : "scripts/views/collections.html",
                controller: "collectionsCtrl"
            })
            .when("/collections/:id", {
                templateUrl : "scripts/views/collection.html",
                controller: "collectionCtrl"
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
                templateUrl : "scripts/views/evaluations.html",
                controller: "evaluationsCtrl"
            })
            .when("/evaluations/:id", {
                templateUrl : "scripts/views/evaluation.html",
                controller: "evaluationCtrl"
            })
            .when("/metrics", {
                templateUrl : "scripts/views/metrics.html",
                controller: "metricsCtrl"
            })
            .when("/metrics/:id", {
                templateUrl : "scripts/views/metric.html",
                controller: "metricCtrl"
            })
            .when("/metric/new", {
                templateUrl: "scripts/views/import_metric.html",
                controller: "newMetricCtrl"
            })
            .when("/searches", {
                templateUrl : "scripts/views/searches.html"
            });
    });

    /* *************************************************************************************************** */
    /* MAIN */
    my_app.controller(
        'mainCtrl',
        function($http, $scope, $window, $location) {
            let base_url = $scope.$parent.base_url;
            $scope.warning_on = $scope.$parent.warning;

            $scope.terms = null;
            $scope.search_errors = null;

            $scope.goToSearches = function(){
                $scope.response_rdy = false;
                let window_url = new $window.URL($location.absUrl());

                $scope.search_terms = $scope.terms;
                $scope.terms_array = $scope.search_terms.split(",");
                console.log(base_url);
                let request = {
                    method: 'POST',
                    url: base_url + "/searches/abcde",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    data: {
                        "keywords": $scope.search_terms
                    }
                };

                if ($scope.search_terms.length > 0){
                    $window.location.href =  window_url.origin + window_url.pathname + '#!searches';
                    $http(request).then(function(response){
                        $scope.response_rdy = true;
                        $scope.results = response.data;
                    })
                }
                else {
                    $window.location.href =  window_url.origin + window_url.pathname + '#!searches';
                    $scope.response_rdy = true;
                }
            };

            $scope.goToLocation = function(location){
                $scope.baseURL = new $window.URL($location.absUrl());
                $window.location.href = $scope.baseURL.origin + $scope.baseURL.pathname + location;
            };

            $scope.process_data = function(data){
                let processed_collections = [];
                for (let collectionIterator in data){
                    if (data.hasOwnProperty(collectionIterator)){
                        let collection = data[collectionIterator];
                        let processed_collection = {};
                        processed_collection['name'] = collection["http://purl.org/dc/elements/1.1/title"];
                        processed_collection['contact'] = collection["http://purl.org/dc/elements/1.1/authoredBy"];
                        processed_collection['Organization'] = collection["http://purl.org/dc/elements/1.1/creator"];
                        if (collection.hasOwnProperty('valid')){
                            processed_collection['Deprecated'] = collection["valid"];
                        }
                        else {
                            processed_collection['Deprecated'] = true
                        }
                        processed_collection['id'] = collection["@id"];

                        let raw_description = collection["http://rdfs.org/ns/void#description"].split("https://orcid.org/")[1];
                        processed_collection['description'] = raw_description.split(".")[1];
                        processed_collections.push(processed_collection)
                    }
                }
                return processed_collections
            };

            $scope.goToCollection = function(identifier){
                $scope.baseURL = new $window.URL($location.absUrl());
                let id = identifier.split('/').slice(-1)[0];
                $window.location.href = $scope.baseURL + "/" + id
            };

            $scope.goToRunEvaluation = function(identifier){
                $scope.baseURL = new $window.URL($location.absUrl());
                let id = identifier.split('/').slice(-1)[0];
                $window.location.href = $scope.baseURL + "/" + id + '/evaluate'
            };

            $scope.goToMetric = function(identifier){
                $scope.baseURL = new $window.URL($location.absUrl());
                let id = identifier.split('/').slice(-1)[0];
                $window.location.href = $scope.baseURL + "/" + id
            };

            $scope.removeWarning = function(){
                $scope.warning_on = false;
            }

        }
    );

    /* *************************************************************************************************** */
    /* FILTERS */
    my_app.filter('URL_last_arg', function() {
        return function (url) {
            let item = url.split('/').slice(-1)[0];

            if (item.indexOf('#') > 0){
                return item.split('#').slice(-1)[0]
            }
            return item;
        };
    });

    my_app.filter('removeUnderscore', function() {
        return function (str) {
            return str.replace(/_/g, ' ')
        };
    });


    /* *************************************************************************************************** */
    /* DIRECTIVES */

    /* DNA Loading animation directive */
    my_app.directive('loader', function(){
        return{
            restrict: 'A',
            templateUrl: 'scripts/directives/loader.html',
        }
    });

    /* Warning */
    my_app.directive('warning', function(){
        return{
            restrict: 'A',
            templateUrl: 'scripts/directives/warning.html',
        }
    });


})();