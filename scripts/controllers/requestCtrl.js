let request_app = angular.module('requestProviderCtrl', ['appConfigCtrl']);

request_app.factory("RequestLoader", function($q, $http){
    
    function RequestsLoader(timeout){
        let loader = this;
        loader.data = null;

        let base_url = "https://linkeddata.systems:3000/FAIR_Evaluator";
        let requests = {
            metrics: {
                /* ROUTE: /metrics */
                multiple: {
                    method: 'GET',
                    url: base_url + "/metrics.json",
                    headers: {
                        'Accept': "application/json",
                    },
                    data: null,
                    timeout: timeout,
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                },
                /* ROUTE: /metrics/{id} */
                single: {
                    method: 'GET',
                    url: base_url + "/metrics/{:id}.json",
                    headers: {
                        'Accept': "application/json",
                    },
                    data: null,
                    timeout: timeout,
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                },
                /* ROUTE: /metric/new */
                new: {
                    method: 'POST',
                    url: base_url + "/metrics",
                    headers: {
                        'Accept': "application/json",
                        "Content-Type": "application/json"
                    },
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                }
            },
            evaluations: {
                /* ROUTE: /evaluations */
                multiple: {
                    method: 'GET',
                    url: base_url + "/evaluations.json",
                    headers: {
                        'Accept': "application/json",
                    },
                    data: null,
                    timeout: timeout,
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                },
                /* ROUTE: /evaluations/{id} */
                single: {
                    method: 'GET',
                    url: base_url + "/evaluations/{:id}.json",
                    headers: {
                        'Accept': "application/json",
                    },
                    data: null,
                    timeout: timeout,
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                },
                /* ROUTE: /collections/{id}/evaluate */
                new: {
                    method: 'POST',
                    url: base_url + "/evaluations",
                    headers: {
                        'Accept': "application/json",
                        "Content-Type": "application/json",
                        rejectUnauthorized: false,
                        requestCert: false,
                        agent: false
                    }
                }
            },
            collections: {
                /* ROUTE: /collections */
                multiple: {
                    method: 'GET',
                    url: base_url + "/collections.json",
                    headers: {
                        'Accept': "application/json",
                    },
                    data: null,
                    timeout: timeout,
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                },
                /* ROUTE: /collections/{id} */
                single: {
                    method: 'GET',
                    url: base_url + "/collections/{:id}.json",
                    headers: {
                        'Accept': "application/json",
                    },
                    data: null,
                    timeout: timeout,
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                },
                /* ROUTE: /collection/new */
                new: {
                    method: 'POST',
                    url: base_url + "/collections",
                    headers: {
                        'Accept': "application/json",
                        "Content-Type": "application/json"
                    },
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                }
            },
            searches: {
                /* ROUTE: /searches?terms=term */
                multiple: {
                    method: 'POST',
                    url: base_url + "/searches/abcde",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    data: { },
                    timeout: timeout * 1.5,
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                }
            }
        };


        /* Getting multiple metrics */
        loader.get_metrics = function(ids = []){
            let deferred = $q.defer();
            let request = requests.metrics.multiple;
            $http(request).then(function(response){
                deferred.resolve(response);
                if (ids.length > 0){
                    let output = [];
                    for (let key in response.data){
                        if (ids.indexOf(response.data[key]['@id']) !== -1){
                            output.push(response.data[key])
                        }
                    }
                    response.data = output;
                }
                return deferred
            });
            return deferred.promise;
        };

        /* Getting single metric */
        loader.get_metric = function(id){
            let deferred = $q.defer();
            let request = angular.copy(requests.metrics.single);
            request.url = request.url.replace('{:id}', id);
            $http(request).then(function(response){
                deferred.resolve(response);
            }, function(error){
                return deferred.reject(error);
            });

            return deferred.promise;
        };

        /* Getting multiple collections */
        loader.get_collections = function(ids = []){
            let deferred = $q.defer();
            let request = requests.collections.multiple;

            $http(request).then(function(response){
                deferred.resolve(response);
                if (ids.length > 0){
                    let output = [];
                    for (let key in response.data){
                        if (ids.indexOf(response.data[key]['@id']) !== -1){
                            output.push(response.data[key])
                        }
                    }
                    response.data = process_collection(output);
                }
                else {
                    response.data = process_collection(response.data)
                }
                return deferred
            });

            return deferred.promise;
        };

        /* Getting a single collection */
        loader.get_collection = function(id){
            let deferred = $q.defer();
            let request = angular.copy(requests.collections.single);
            request.url = request.url.replace('{:id}', id);

            $http(request).then(function(response){
                deferred.resolve(response);
                let content_data = response.data;
                content_data['title'] = response.data['http://purl.org/dc/elements/1.1/title'];
                if (response.data.hasOwnProperty("http://purl.obolibrary.org/obo/IAO_0000114")){
                    content_data['status'] = response.data['http://purl.obolibrary.org/obo/IAO_0000114'];
                }
                loader.get_metrics(response.data["http://www.w3.org/ns/ldp#contains"]).then(function(response){
                    content_data['contains'] = response.data
                });

                return deferred

            }, function(error){
                return deferred.reject(error);
            });

            return deferred.promise;
        };

        /* collections processor */
        let process_collection = function(data){
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

        /* Getting multiple evaluations */
        loader.get_evaluations = function(id = []){};

        /* Getting a single evaluation */
        loader.get_evaluation = function(id){
            let deferred = $q.defer();
            let request = angular.copy(requests.evaluations.single);
            request.url = request.url.replace('{:id}', id);

            $http(request).then(function(response){
                deferred.resolve(response);
                response.data['evaluationResult'] = JSON.parse(response.data['evaluationResult']);
                for (let metricName in response.data['evaluationResult']){
                    response.data['evaluationResult'][metricName][0]['name'] = metricName.split('/').slice(-1)[0].replace(/_/g, ' ');
                }
                let collectionID = response.data['collection'].split('/').slice(-1)[0];

                loader.get_collection(collectionID).then(function(collection_response){
                    response.data['metrics'] = collection_response.data
                });

                return deferred

            }, function(error){
                return deferred.reject(error);
            });

            return deferred.promise;
        };

        /* Getting multiple evaluations */
        loader.get_evaluations = function(ids = []){
            let deferred = $q.defer();
            let request = requests.evaluations.multiple;

            $http(request).then(function(response){
                deferred.resolve(response);
                if (ids.length > 0){
                    let output = [];
                    for (let key in response.data){
                        if (ids.indexOf(response.data[key]['@id']) !== -1){
                            output.push(response.data[key])
                        }
                    }
                    response.data = output;
                }
                else {
                    for (let evalIterator in response.data) {
                        response.data[evalIterator]['collection'] = parseFloat(response.data[evalIterator]['collection'].split('/').slice(-1)[0]);
                    }
                }
                return deferred
            });

            return deferred.promise;
        };
    }

    return RequestsLoader;

});


request_app.controller(
    'requestCtrl',
    function($http, $scope, $window, $location, RequestLoader) {

        $scope.response_rdy = false;
        $scope.request_error = false;
        $scope.dataType = null;

        let baseURL = new $window.URL($location.absUrl()).hash.replace('#!/', "");
        let URL = baseURL.split('/');
        let current_request = $scope.getRequest(URL);

        if (current_request === null){
            $scope.response_rdy = true;
            return;
        }

        let requestLoader = new RequestLoader($scope.request_timeout);

        /* SINGLE ITEMS */
        if (URL.length === 2){

            /* COLLECTION */
            if (URL[0] === 'collections'){
                $scope.dataType = "collections";
                if (URL[1] !== "new"){
                    requestLoader.get_collection(URL[1]).then(function(response){
                        $scope.response_rdy = true;
                        $scope.collection = response.data;
                    });
                }
            }

            /* METRIC */
            if (URL[0] === 'metrics'){
                $scope.dataType = "metrics";
                if (URL[1] !== "new"){
                    requestLoader.get_metric(URL[1]).then(function(response){
                        $scope.response_rdy = true;
                        $scope.metric = response.data;
                    });
                }
            }

            /* EVALUATION */
            if (URL[0] === 'evaluations'){
                $scope.dataType = "evaluations";
                if (URL[1] !== "new"){
                    requestLoader.get_evaluation(URL[1]).then(function(response){
                        $scope.response_rdy = true;
                        $scope.evaluation = response.data;
                    });
                }
            }
        }

        /* MULTIPLE ITEMS */
        else if (URL.length === 1) {

            /* COLLECTIONS */
            if (URL[0] === 'collections'){
                $scope.dataType = "collections";
                requestLoader.get_collections().then(function(response){
                    $scope.response_rdy = true;
                    $scope.content_output = response.data
                });
            }

            /* METRICS */
            if (URL[0] === 'metrics'){
                $scope.dataType = "metrics";
                requestLoader.get_metrics().then(function(response){
                    $scope.response_rdy = true;
                    $scope.content_output = response.data;
                });
            }

            /* METRICS */
            if (URL[0] === 'evaluations'){
                $scope.dataType = "evaluations";
                requestLoader.get_evaluations().then(function(response){
                    $scope.response_rdy = true;
                    $scope.content_output = response.data;
                });
            }

        }

        /* Searches */
        if (URL[0].split('?').slice(0)[0] === 'searches') {

            /* trigger the request and process the data */
            $http(current_request).then(function (response) {
                $scope.response_rdy = true;
                $scope.searchTerms = decodeURIComponent(URL[0].split("?terms=")[1]);
                $scope.results = response.data;
                $scope.results.collections = $scope.process_data(response.data.collections);

                },
                function (error) {
                    $scope.response_rdy = true;
                    $scope.request_error = true;
                }
            );
        }
    }
);
