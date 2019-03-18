(function() {

    let base_url = "http://linkeddata.systems:3000/FAIR_Evaluator";

    let my_app = angular.module('FAIRmetricsApp',
        ['ngRoute', 'ngMaterial', 'ngAria', 'ngAnimate', 'ngMessages'])
        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('docs-dark', 'default')
                .primaryPalette('yellow')
        });

    my_app.config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl : "views/main.html",
            })
            .when("/collections", {
                templateUrl : "views/collections.html",
                controller: "collectionsCtrl"
            })
            .when("/collections/:id", {
                templateUrl : "views/collection.html",
                controller: "collectionCtrl"
            })
            .when("/evaluations", {
                templateUrl : "views/evaluations.html",
                controller: "evaluationsCtrl"
            })
            .when("/evaluations/:id", {
                templateUrl : "views/evaluation.html",
                controller: "evaluationCtrl"
            })
            .when("/metrics", {
                templateUrl : "views/metrics.html",
                controller: "metricsCtrl"
            })
            .when("/metrics/:id", {
                templateUrl : "views/metric.html",
                controller: "metricCtrl"
            })
            .when("/searches", {
                templateUrl : "views/searches.html",
                controller: "mainCtrl"
            });
    });

    /* *************************************************************************************************** */
    /* MAIN */

    my_app.controller("mainCtrl", function($http, $scope, $window, $location) {
        $scope.searches = "";
        $scope.hello = "hello";

        $scope.goToSearches = function(){
            console.log("HelloWorld")
        }
    });

    my_app.controller("searchCtrl", function($http, $scope, $window, $location) {
        $scope.terms = null;

        $scope.goToSearches = function(){
            $scope.search_terms = $scope.terms;
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
            $http(request).then(function(response){
                $scope.results = response.data;
            })
        };

    });

    /* *************************************************************************************************** */
    /* COLLECTIONS */

    /* route: /collections */
    my_app.controller("collectionsCtrl", function($http, $scope, $window, $location){

        let request = {
            method: 'GET',
            url: base_url + "/collections.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            $scope.collections = {};
            $scope.collections.data = $scope.process_data(response.data);
        });

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

    });

    /* route: /collection/{id} */
    my_app.controller("collectionCtrl", function($http, $scope, $routeParams, $window, $location){

        $scope.identifier = $routeParams.id;

        let request = {
            method: 'GET',
            url: base_url + "/collections/" + $scope.identifier + '.json',
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            $scope.collection = response.data;
            $scope.collection['title'] = response.data['http://purl.org/dc/elements/1.1/title'];
        });

        $scope.goToCollections = function(){
            $scope.baseURL = new $window.URL($location.absUrl());
            $window.location.href = $scope.baseURL.origin + $scope.baseURL.pathname + '#!/collections';
        };

    });


    /* *************************************************************************************************** */
    /* EVALUATIONS */

    /* route: /evaluations */
    my_app.controller("evaluationsCtrl", function($http, $scope, $window, $location){

        let request = {
            method: 'GET',
            url: base_url + "/evaluations.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            $scope.evaluations = response.data;

        });

        $scope.goToEvaluation = function(identifier){
            $scope.baseURL = new $window.URL($location.absUrl());
            let id = identifier.split('/').slice(-1)[0];
            $window.location.href = $scope.baseURL + "/" + id
        };

    });

    /* route: /evaluations/{id} */
    my_app.controller("evaluationCtrl", function($http, $scope, $window, $location, $routeParams){

        $scope.identifier = $routeParams.id;

        let request = {
            method: 'GET',
            url: base_url + "/evaluations/" + $scope.identifier + '.json',
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            let evaluation =  JSON.parse(response.data['evaluationResult']);
            $scope.evaluation = response.data;
            $scope.evaluation['evaluationResult'] = evaluation
        });

        $scope.goToEvaluations = function(){
            $scope.baseURL = new $window.URL($location.absUrl());
            $window.location.href = $scope.baseURL.origin + $scope.baseURL.pathname + '#!/evaluations';
        };

    });


    /* *************************************************************************************************** */
    /* METRICS */

    /* route: /metrics */
    my_app.controller("metricsCtrl", function($http, $scope, $window, $location){

        let request = {
            method: 'GET',
            url: base_url + "/metrics.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            $scope.metrics = response.data;

        });

        $scope.goToMetric = function(identifier){
            $scope.baseURL = new $window.URL($location.absUrl());
            let id = identifier.split('/').slice(-1)[0];
            $window.location.href = $scope.baseURL + "/" + id
        };

    });

    /* route: /metrics/{id} */
    my_app.controller("metricCtrl", function($http, $scope, $window, $location, $routeParams){

        $scope.identifier = $routeParams.id;

        let request = {
            method: 'GET',
            url: base_url + "/metrics/" + $scope.identifier + '.json',
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            $scope.metric = response.data;
        });

        $scope.goToMetrics = function(){
            $scope.baseURL = new $window.URL($location.absUrl());
            $window.location.href = $scope.baseURL.origin + $scope.baseURL.pathname + '#!/metrics';
        };

    });


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


})();