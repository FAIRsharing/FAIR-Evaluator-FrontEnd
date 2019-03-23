(function() {

    let base_url = "https://linkeddata.systems:3000/FAIR_Evaluator";
    let charts_on = false;

    let my_app = angular.module('FAIRmetricsApp',
        ['ngRoute', 'ngMaterial', 'ngAria', 'ngAnimate', 'ngMessages', 'chart.js'])
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
                templateUrl : "views/run_evaluation.html",
                controller: "runEvaluationCtrl"
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
                templateUrl: "views/import_metric.html",
                controller: "newMetricCtrl"
            })
            .when("/searches", {
                templateUrl : "views/searches.html"
            });
    });

    /* *************************************************************************************************** */
    /* MAIN */

    my_app.controller("maniCtrl", function($http, $scope, $window, $location) {
        $scope.terms = null;
        $scope.search_errors = null;

        $scope.goToSearches = function(){
            $scope.response_rdy = false;
            let window_url = new $window.URL($location.absUrl());

            $scope.search_terms = $scope.terms;
            $scope.terms_array = $scope.search_terms.split(",");

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

    });

    /* route: /collection/new */
    my_app.controller("newCollectionCtrl", function($http, $scope, $window, $location){

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

        $scope.charts_on = charts_on;
        $scope.response_rdy = false;
        $scope.identifier = $routeParams.id;
        $scope.pie_labels = ["1 star", "2 stars", "3stars", "4 stars", "5stars"];
        $scope.pie_data = [0, 0, 0, 0, 0];


        $scope.histo_labels = [];
        $scope.histo_data = [
        ];

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
            $scope.evaluation['evaluationResult'] = evaluation;
            $scope.resource = String();

            let resourceLimit = 0;
            for (let metricKey in $scope.evaluation['evaluationResult']){
                let metric = $scope.evaluation['evaluationResult'][metricKey][0];
                if (resourceLimit === 0){
                    console.log(metric['http://semanticscience.org/resource/SIO_000332'][0]);

                    $scope.resource = metric['http://semanticscience.org/resource/SIO_000332'][0]['@id'];
                    if (!$scope.resource){
                        $scope.resource = metric['http://semanticscience.org/resource/SIO_000332'][0]['@value'];
                    }
                    if (!$scope.resource.startsWith('http') && !$scope.resource.startsWith('https')){
                        $scope.resource = "https://doi.org/" + $scope.resource;
                    }
                    resourceLimit++
                }

                let score = metric["http://semanticscience.org/resource/SIO_000300"][0]["@value"];
                $scope.histo_labels.push(
                    metricKey.split('/').slice(-1)[0].replace(/_/g, ' ')
                );
                $scope.histo_data.push(parseFloat(score));

                switch(parseFloat(score)){
                    case 0:
                        $scope.pie_data[0] += 1;
                        break;
                    case 1:
                        $scope.pie_data[4] += 1;
                        break;
                    case 0.25:
                        $scope.pie_data[1] += 1;
                        break;
                    case 0.5:
                        $scope.pie_data[2] += 1;
                        break;
                    case 0.75:
                        $scope.pie_data[3] += 1;
                        break;
                }
            }

            $scope.response_rdy = true;
        });

        $scope.goToEvaluations = function(){
            $scope.baseURL = new $window.URL($location.absUrl());
            $window.location.href = $scope.baseURL.origin + $scope.baseURL.pathname + '#!/evaluations';
        };

    });

    /* route: /collections/{id}/evaluate */
    my_app.controller("runEvaluationCtrl", function($http, $scope, $window, $location, $routeParams){
        $scope.evalForm = {};
        $scope.evalForm.collection = null;
        $scope.evalForm.guid = null;
        $scope.evalForm.title = null;
        $scope.evalForm.orcid = null;
        $scope.response_content = false;
        $scope.response_rdy = true;


        let request = {
            method: 'GET',
            url: base_url + "/collections.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };

        $scope.evalForm.collection_disabled = true;
        if ($routeParams.id === "new"){
            $scope.evalForm.collection_disabled = false;
        }
        else{
            request.url = base_url+ "/collections/" + $routeParams.id + '.json';
        }

        $http(request).then(function(response){
            $scope.collections = response.data;
            if ($scope.evalForm.collection_disabled){
                $scope.collection_id = response.data['@id'];
                $scope.collection_title = response.data['http://purl.org/dc/elements/1.1/title']
            }
        });

        $scope.clearFields = function(){
            if (!$scope.evalForm.collection_disabled){
                $scope.evalForm.collection = null;
            }
            $scope.evalForm.guid = null;
            $scope.evalForm.title = null;
            $scope.evalForm.orcid = null;
        };

        $scope.runEvaluation = function() {

            $scope.response_rdy = false;
            let collection_id = $scope.evalForm.collection.split('/').slice(-1)[0];

            let eval_request = {
                method: 'POST',
                url: base_url + "/collections/" + collection_id + "/evaluate",
                headers: {
                    'Accept': "application/json",
                    'Content-Type': "application/json"
                },
                data: {
                    "resource": $scope.evalForm.collection,
                    "executor": $scope.evalForm.orcid,
                    "title": $scope.evalForm.title
                }
            };

            let root_url = new $window.URL($location.absUrl());
            let next_url = root_url.origin + root_url.pathname + '#!/collections/';

            $http(eval_request).then(function(response){
                $scope.response_rdy = true;
                let evaluation_id = response.data["@id"].split('/').slice(-1)[0];
                $scope.response_content = next_url + evaluation_id;

            $scope.response_rdy = true;
            })
        }

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
    });

    /* route: /metric/new*/
    my_app.controller('newMetricCtrl', function($http, $scope, $window, $location, $routeParams){
        $scope.response_rdy = true;
        $scope.metrics_url = null;

        $scope.import_metric = function(){
            $scope.response_rdy = false;
            let request = {
                method: 'POST',
                url: base_url + "/metrics",
                headers: {
                    'Accept': "application/json",
                    "Content-Type": "application/json"
                },
                data: {
                    "smarturl": $scope.metrics_url
                }
            };
            if ($scope.metrics_url != null){
                $http(request).then(function(response){
                    console.log(response)
                    $scope.response_rdy = false;
                    $scope.response_content = response.data['@id']
                })
            }

        }
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
            templateUrl: 'directives/loader.html',
        }
    });


})();