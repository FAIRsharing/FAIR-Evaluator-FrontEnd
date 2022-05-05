let request_app = angular.module('requestProviderCtrl', ['appConfigCtrl']);

request_app.factory("RequestLoader", function($q, $http, $sce, $location){
    return function RequestsLoader(timeout, base_url){
        let loader = this;
        loader.data = null;

        //let base_url = "https://fair-evaluator.semanticscience.org/FAIR_Evaluator";
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
            }, function(error){
                return deferred.reject(error);
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
            }, function(error){
                return deferred.reject(error);
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
                response.data['title'] = response.data['http://purl.org/dc/elements/1.1/title'];
                if (response.data.hasOwnProperty("http://purl.obolibrary.org/obo/IAO_0000114")){
                    response.data['status'] = response.data['http://purl.obolibrary.org/obo/IAO_0000114'];
                }
                loader.get_metrics(response.data["http://www.w3.org/ns/ldp#contains"]).then(function(sub_response){
                    response.data['contains'] = sub_response.data
                }, function(sub_error){
                    response.data['contains'] = {
                        error: true,
                        content: sub_error
                    }
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

        /* Getting a single evaluation */
        loader.get_evaluation = function(id){

            let colors = {
                "SUCCESS": [
                    /SUCCESS/g,
                    "<label class='textGreen'>SUCCESS</label>"
                ],
                "INFO": [
                    /INFO/g,
                    "<label class='textBlue'>INFO</label>"
                ],
                "WARN": [
                    /WARN/g,
                    "<label class='textYellow'>WARN</label>"
                ],
                "CRITICAL": [
                    /CRITICAL/g,
                    "<label class='textOrange'>CRITICAL</label>"
                ],
                "FAILURE": [
                    /FAILURE/g,
                    "<label class='textRed'>FAILURE</label>"
                ]
            };

            let deferred = $q.defer();
            let request = angular.copy(requests.evaluations.single);
            request.url = request.url.replace('{:id}', id);

            $http(request).then(function(response){
                console.log(response);
                deferred.resolve(response);

                let current_id = response.data['collection'].split('/').slice(-1)[0];
                response.data['collection'] = $location.absUrl().split('#!')[0] + "#!/collections/" + current_id;

                response.data['evaluationResult'] = JSON.parse(response.data['evaluationResult']);
                for (let metricName in response.data['evaluationResult']){

                    response.data['evaluationResult'][metricName][0]["http://schema.org/comment"][0]["@value"] =
                        response.data['evaluationResult'][metricName][0]["http://schema.org/comment"][0]["@value"].replace(/\n\n/g, "\n");
                    response.data['evaluationResult'][metricName][0]['name'] = metricName.split('/').slice(-1)[0].replace(/_/g, ' ');


                    let comment = angular.copy(response.data['evaluationResult'][metricName][0]["http://schema.org/comment"][0]["@value"]);
                    for (let colorLabel in colors){
                        let color = colors[colorLabel];
                        comment = comment.replace(color[0], color[1]);
                    }

                    response.data['evaluationResult'][metricName][0]["http://schema.org/comment"][0]["@value"] = $sce.trustAsHtml(comment.replace('\r', '<BR>'));
                    response.data['evaluationResult'][metricName][0]['opened'] = false;
                }

                let metricsID = [];
                for (let metricName in response.data['evaluationResult']){
                    metricsID.push(metricName);
                }
                loader.get_metrics(metricsID).then(function(sub_response){

                    for (let metrics in sub_response.data){
                        let metricsID = sub_response.data[metrics]['@id'];
                        response.data['evaluationResult'][metricsID].push(sub_response.data[metrics])
                    }
                }, function(sub_error){
                    response.data['evaluationResult'] = {
                        error: true,
                        content: sub_error
                    }
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
            }, function(error){
                return deferred.reject(error);
            });

            return deferred.promise;
        };

        /* Searcher */
        loader.search_terms = function(terms){
            let deferred = $q.defer();
            let request = angular.copy(requests.searches.multiple);
            request.data = {
                keywords: terms
            };
            $http(request).then(function(response){
                deferred.resolve(response);
                response.data.collections = process_collection(response.data.collections);
                return deferred
            }, function(error){
                return deferred.reject(error);
            });

            return deferred.promise;
        }
    }
});


request_app.controller(
    'requestCtrl',
    function($http, $scope, $window, $location, RequestLoader, $filter) {

        $scope.response_rdy = false;
        $scope.request_error = false;
        $scope.dataType = null;
        $scope.search = {
            terms: ""
        };

        let URL = new $window.URL($location.absUrl()).hash.replace('#!/', "").split('/');
        let full_url = URL[0] = URL[0].split("?");
        URL[0] = full_url[0];
        let requestLoader = new RequestLoader($scope.request_timeout, $scope.base_url);
        let url_mapper = {
            "metrics/": function(){
                return requestLoader.get_metrics()
            },
            "metrics": function(id){
                return requestLoader.get_metric(id)
            }  ,
            "collections/": function(){
                return requestLoader.get_collections()
            },
            "collections": function(id){
                return requestLoader.get_collection(id)
            },
            "evaluations/": function(){
                return requestLoader.get_evaluations()
            },
            "evaluations": function(id){
                return requestLoader.get_evaluation(id)
            }
        };

        for (let URL_param in url_mapper){
            let endpointURL = null;
            let id = null;
            if (URL.length === 2 && URL[1] !== "new") {
                endpointURL = URL[0];
                id = URL[1];
            }
            else if (URL.length === 1) {
                endpointURL = URL[0] + "/";
            }

            if (endpointURL === URL_param){
                url_mapper[URL_param](id).then(function(response){
                    $scope.dataType = endpointURL.replace('/', '');
                    $scope.response_rdy = true;
                    $scope.content_output = response.data;
                    $scope.raw_output = angular.copy($scope.content_output);

                    if (endpointURL === "evaluations/"){
                        let currentPage = "1" ;
                        if (full_url.length > 1){
                            let page = $location.search()['page'];
                            if (page){
                                currentPage = page
                            }
                        }
                        currentPage = parseInt(currentPage);
                        $scope.configure_pagination = {
                            items_per_page: 50,
                            totalPages: function(){
                                return Math.ceil(Object.keys($scope.content_output).length / this.items_per_page)
                            },
                            currentPage: currentPage,
                            changePage: function(newPage){
                                if (newPage < 1){
                                    newPage = 1
                                }
                                else if (newPage >= this.totalPages()){
                                    newPage = this.totalPages()
                                }
                                $location.path("evaluations", false).search({page: newPage});
                                this.currentPage = newPage;
                                console.log(newPage)
                            },
                            pages: function(){
                                let pages = [];

                                if (this.currentPage === 1 || this.currentPage === 2 || this.currentPage === this.totalPages() || this.currentPage === this.totalPages() -1){
                                    pages = [
                                        "< Previous",
                                        1,
                                        2,
                                        3,
                                        "...",
                                        this.totalPages() -2,
                                        this.totalPages() -1,
                                        this.totalPages(),
                                        "Next >"
                                    ]
                                }

                                if (this.currentPage === 3){
                                    pages = [
                                        "< Previous",
                                        1,
                                        2,
                                        3,
                                        4,
                                        5,
                                        "...",
                                        this.totalPages(),
                                        "Next >"
                                    ]
                                }

                                if (this.currentPage === this.totalPages() - 2){
                                    pages = [
                                        "< Previous",
                                        1,
                                        "...",
                                        this.totalPages() - 4,
                                        this.totalPages() - 3,
                                        this.totalPages() - 2,
                                        this.totalPages() - 1,
                                        this.totalPages(),
                                        "Next >"
                                    ]
                                }

                                if (this.currentPage < this.totalPages() -2 && this.currentPage > 3){
                                    pages = [
                                        "< Previous",
                                        1,
                                        "...",
                                        this.currentPage - 1,
                                        this.currentPage,
                                        this.currentPage + 1,
                                        "...",
                                        this.totalPages(),
                                        "Next >"
                                    ];
                                }

                                if (this.totalPages() < 7 && this.totalPages() > 1){
                                    pages = [];
                                    pages[0] = "< Previous";

                                    [...Array(this.totalPages()).keys()].forEach(function(val){
                                        pages.push(val+1);
                                    });

                                    pages.push("Next >")
                                }
                                return pages;
                            },
                        };
                    }
                }, function(error){
                    $scope.response_rdy = true;
                    $scope.request_error = error;
                })
            }
        }

        /* Searches */
        if (URL[0].split('?').slice(0)[0] === 'searches') {
            $scope.searchTerms = decodeURIComponent(URL[0].split("?terms=")[1]);
            console.log($scope.searchTerms);
            requestLoader.search_terms($scope.searchTerms).then(function(response){
                $scope.response_rdy = true;
                $scope.results = response.data;
            }, function(error){
                $scope.response_rdy = true;
                $scope.request_error = error;
            });
        }

        $scope.open_tab = function(metric, evaluations){

            let state = angular.copy(metric['opened']);

            for (let result in evaluations){
                evaluations[result][0]['opened'] = false;
            }
            $scope.content_output['evaluationResult'] = evaluations;
            metric['opened'] = !state;
        };

        $scope.$watch("search.terms", function(current, original) {
            if (current !== original && current.length >= 3 ){
                $scope.content_output = $filter('filter')($scope.raw_output, current);
                $scope.configure_pagination.currentPage = 1;
            }
            if (current.length < 3){
                $scope.content_output = $scope.raw_output;
            }
        });


    }
);
