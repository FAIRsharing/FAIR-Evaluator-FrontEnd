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
            $scope.evaluation_searchTerms = "";
            $scope.metrics_searchTerms = "";
            $scope.collections_searchTerms = "";
            $scope.search_triggered = false;

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

            $scope.process_data = function(data){
                let processed_collections = [];
                for (let collectionIterator in data){
                    if (data.hasOwnProperty(collectionIterator)){
                        let collection = data[collectionIterator];
                        let processed_collection = {};
                        processed_collection['name'] = collection["http://purl.org/dc/elements/1.1/title"];
                        processed_collection['contact'] = collection["http://purl.org/dc/elements/1.1/authoredBy"];
                        processed_collection['Organization'] = collection["http://purl.org/dc/elements/1.1/creator"];
                        processed_collection['Deprecated'] = null;
                        processed_collection['id'] = collection["@id"];

                        if (collection.hasOwnProperty("http://purl.obolibrary.org/obo/IAO_0000114")){
                            processed_collection['status'] = collection['http://purl.obolibrary.org/obo/IAO_0000114'];
                        }

                        let raw_description = collection["http://rdfs.org/ns/void#description"].split("https://orcid.org/")[1];
                        processed_collection['description'] = raw_description.split(".")[1];
                        processed_collections.push(processed_collection)
                    }
                }
                return processed_collections
            };

            $scope.removeWarning = function(){
                $scope.warning_on = false;
            };

            $scope.getRequest = function(URLArray){
                let local_request = null;

                /* REQUEST BUILDER */

                /* NON SEARCHES */
                if (URLArray[0].indexOf('searches') === -1){

                    /* Deal with multiple items pages */
                    if (URLArray.length === 1 ){
                        for (let itemName in $scope.requests){
                            if ($scope.requests.hasOwnProperty(itemName) && itemName === URLArray[0] ){
                                local_request = angular.copy($scope.requests[itemName].multiple);
                            }
                        }
                    }

                    else if (URLArray.length === 2){
                        /* Deal with single item pages */
                        if (URLArray[1] !== "new"){
                            for (let itemName in $scope.requests) {
                                if ($scope.requests.hasOwnProperty(itemName) && itemName === URLArray[0]) {
                                    local_request = angular.copy($scope.requests[itemName].single);
                                    local_request.url = local_request.url.replace("{:id}", URLArray[1]);
                                }
                            }
                        }

                        /* Deal with new pages */
                        else {
                            for (let itemName in $scope.requests) {
                                if ($scope.requests.hasOwnProperty(itemName) && itemName === URLArray[0]) {
                                    local_request = angular.copy($scope.requests[itemName].new);
                                }
                            }
                        }
                    }
                }

                /* SEARCHES */
                else {
                    let searchterms = URLArray[0].split("?terms=")[1];
                    for (let k in searchterms){
                        searchterms[k] = searchterms[k].replace(' ', '')
                    }
                    if (searchterms !== undefined){
                        local_request = angular.copy($scope.requests.searches.multiple);
                        local_request.data = {
                            keywords: searchterms
                        }
                    }
                }
                console.log(local_request);
                return local_request;
            };

        }
    );

})();