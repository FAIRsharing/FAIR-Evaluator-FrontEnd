angular.module('appConfigCtrl', []).controller(
    'configCtrl',
    [
        '$scope',
        function($scope){
            /* server base URL for endpoints */
            $scope.base_url = "https://fair-evaluator.semanticscience.org/FAIR_Evaluator";

            /* Warning */
            $scope.warning = false;
            $scope.maintenance = false;
            $scope.weRBack = true;

            /* ******************************************** */
            /* SORTING TABLES DEFAULT VALUES */
            /* ******************************************** */
            $scope.sortType = {
                "collections": "name",
                "evaluations": "title",
                "metrics": "principle"
            };
            $scope.reverseSort = {
                "collections": false,
                "evaluations": false,
                "metrics": false
            };
            $scope.collection_displayType = "table";

            /* ******************************************** */
            /* REQUESTS */
            /* ********************************************
            if ($scope.maintenance){
                $scope.request_timeout = 0.0001;
            }*/
            $scope.request_timeout = 10000;
            $scope.requests = {
                metrics: {
                    /* ROUTE: /metrics */
                    multiple: {
                        method: 'GET',
                        url: $scope.base_url + "/metrics.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout,
                        rejectUnauthorized: false,
                        requestCert: false,
                        agent: false
                    },
                    /* ROUTE: /metrics/{id} */
                    single: {
                        method: 'GET',
                        url: $scope.base_url + "/metrics/{:id}.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout,
                        rejectUnauthorized: false,
                        requestCert: false,
                        agent: false
                    },
                    /* ROUTE: /metric/new */
                    new: {
                        method: 'POST',
                        url: $scope.base_url + "/metrics",
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
                        url: $scope.base_url + "/evaluations.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout,
                        rejectUnauthorized: false,
                        requestCert: false,
                        agent: false
                    },
                    /* ROUTE: /evaluations/{id} */
                    single: {
                        method: 'GET',
                        url: $scope.base_url + "/evaluations/{:id}.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout,
                        rejectUnauthorized: false,
                        requestCert: false,
                        agent: false
                    },
                    /* ROUTE: /collections/{id}/evaluate */
                    new: {
                        method: 'POST',
                        url: $scope.base_url + "/evaluations",
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
                        url: $scope.base_url + "/collections.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout,
                        rejectUnauthorized: false,
                        requestCert: false,
                        agent: false
                    },
                    /* ROUTE: /collections/{id} */
                    single: {
                        method: 'GET',
                        url: $scope.base_url + "/collections/{:id}.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout,
                        rejectUnauthorized: false,
                        requestCert: false,
                        agent: false
                    },
                    /* ROUTE: /collection/new */
                    new: {
                        method: 'POST',
                        url: $scope.base_url + "/collections",
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
                        url: $scope.base_url + "/searches/abcde",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        data: { },
                        timeout: $scope.request_timeout * 1.5,
                        rejectUnauthorized: false,
                        requestCert: false,
                        agent: false
                    }
                }
            };

            /* ******************************************** */
            /* CHARTS */
            /* ******************************************** */
            $scope.charts_on = false;
            $scope.histo_options = {
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                        ticks: {
                            stepSize: 25,
                            callback: function(value) {
                                return value + '%';
                            },
                            max: 100
                        }
                    }]
                }

            };
            $scope.colors = ["#1F6FA1"];

        }
    ]
);