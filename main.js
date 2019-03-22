(function() {

    let base_url = "https://linkeddata.systems:3000/FAIR_Evaluator";

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
            .when("/collection/new", {
                templateUrl : "views/create_collection.html",
                controller: "newCollectionCtrl"
            })
            .when("/collections/:id/evaluate", {
                templateUrl : "views/run_evaluation.html"
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
            .when("/metric/new", {
                templateUrl: "views/import_metric.html"
            })
            .when("/searches", {
                templateUrl : "views/searches.html"
            });
    });

    /* *************************************************************************************************** */
    /* MAIN */

    my_app.controller("searchCtrl", function($http, $scope, $window, $location) {
        $scope.terms = null;

        $scope.goToSearches = function(){
            $scope.response_rdy = false;
            let window_url = new $window.URL($location.absUrl());

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
            if ($scope.search_terms.length > 0){
                $window.location.href =  window_url.origin + window_url.pathname + '#!searches';
                $http(request).then(function(response){
                    $scope.response_rdy = true;
                    $scope.results = response.data;
                })
            }
        };

        $scope.goToNewCollection = function(){
            $scope.baseURL = new $window.URL($location.absUrl());
            $window.location.href = $scope.baseURL.origin + $scope.baseURL.pathname + '#!/collection/new';
        }

    });

    /* *************************************************************************************************** */
    /* COLLECTIONS */

    /* route: /collections */
    my_app.controller("collectionsCtrl", function($http, $scope, $window, $location){

        $scope.response_rdy = false;
        let request = {
            method: 'GET',
            url: base_url + "/collections.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            $scope.response_rdy = true;
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
        $scope.response_rdy = false;

        let request = {
            method: 'GET',
            url: base_url + "/collections/" + $scope.identifier + '.json',
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            $scope.response_rdy = true;
            $scope.collection = response.data;
            $scope.collection['title'] = response.data['http://purl.org/dc/elements/1.1/title'];
        });

        $scope.goToCollections = function(){
            $scope.baseURL = new $window.URL($location.absUrl());
            $window.location.href = $scope.baseURL.origin + $scope.baseURL.pathname + '#!/collections';
        };

    });

    /* route: /collections */
    my_app.controller("newCollectionCtrl", function($http, $scope, $window, $location, $timeout){

        let request = {
            method: 'GET',
            url: base_url + "/metrics.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };

        $scope.available_metrics = {};
        $scope.collection_data = {};
        $scope.collection_data.name = "";
        $scope.collection_data.contact = "";
        $scope.collection_data.organization = "";
        $scope.collection_data.indicators = [];
        $scope.collection_data.description = "";
        $scope.triggered = false;
        $scope.errors = false;
        $scope.response_content = false;


        $http(request).then(function(response){
            $scope.available_metrics = response.data;
        });

        $scope.createCollection = function(coll){

            $scope.triggered = true;

            let request_data = {
                "name": $scope.collection_data.name,
                "contact": $scope.collection_data.contact,
                "description": $scope.collection_data.description,
                "organization": $scope.collection_data.organization,
                "include_metrics": []
            };

            for (let ite in $scope.collection_data.indicators){
                let metric_URL = $scope.collection_data.indicators[ite];
                for (let sub_it in $scope.available_metrics){
                    if ($scope.available_metrics[sub_it]["@id"] === metric_URL){
                        request_data['include_metrics'].push($scope.available_metrics[sub_it]['smarturl']);
                    }
                }
            }

            let request = {
                method: 'POST',
                url: base_url + "/collections",
                headers: {
                    'Accept': "application/json",
                    'Content-Type': "application/json"
                },
                data: request_data
            };

            $http(request).then(function(response){
                $scope.triggered = false;
                console.log(response);
                let identifier= response.data['@id'].split('/').slice(-1)[0];
                let root_url = new $window.URL($location.absUrl());
                $scope.response_content = root_url.origin + root_url.pathname + "#!/collections/" + identifier;
                $scope.errors = response.data.statusText
            });
        };

        $scope.clearFields = function(){
            $scope.collection_data.name = "";
            $scope.collection_data.contact = "";
            $scope.collection_data.organization = "";
            $scope.collection_data.indicators = [];
            $scope.collection_data.description = "";
        }

    });


    /* *************************************************************************************************** */
    /* EVALUATIONS */

    /* route: /evaluations */
    my_app.controller("evaluationsCtrl", function($http, $scope, $window, $location){

        $scope.response_rdy = false;

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
            $scope.response_rdy = true;
        });

        $scope.goToEvaluation = function(identifier){
            $scope.baseURL = new $window.URL($location.absUrl());
            let id = identifier.split('/').slice(-1)[0];
            $window.location.href = $scope.baseURL + "/" + id
        };

    });

    /* route: /evaluations/{id} */
    my_app.controller("evaluationCtrl", function($http, $scope, $window, $location, $routeParams){

        $scope.response_rdy = false;

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
            $scope.response_rdy = true;
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

        $scope.response_rdy = false;

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
            $scope.response_rdy = true;
        });

        $scope.goToMetric = function(identifier){
            $scope.baseURL = new $window.URL($location.absUrl());
            let id = identifier.split('/').slice(-1)[0];
            $window.location.href = $scope.baseURL + "/" + id
        };

    });

    /* route: /metrics/{id} */
    my_app.controller("metricCtrl", function($http, $scope, $window, $location, $routeParams){

        $scope.response_rdy = false;
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
            $scope.response_rdy = true;
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


    /* *************************************************************************************************** */
    /* DIRECTIVES */

    my_app.directive('loader', function(){
        return{
            restrict: 'A',
            templateUrl: 'directives/loader.html',
        }
    });


})();