angular.module('appConfigCtrl', []).controller(
    'configCtrl',
    [
        '$scope',
        function($scope){
            /* server base URL for endpoints */
            $scope.base_url = "https://linkeddata.systems:3000/FAIR_Evaluator";

            /* Warning */
            $scope.warning = true;

            /* ******************************************** */
            /* SORTING TABLES */
            /* ******************************************** */
            $scope.sortType = {
                "collections": null,
                "evaluations": "title",
                "metrics": "principle"
            };
            $scope.reverseSort = {
                "collections": false,
                "evaluations": false,
                "metrics": false
            };

            /* ******************************************** */
            /* REQUESTS */
            /* ******************************************** */
            $scope.request_timeout = 2000;
            $scope.requests = {
                metrics: {
                    multiple: {
                        method: 'GET',
                        url: $scope.base_url + "/metrics.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout
                    },
                    single: {
                        method: 'GET',
                        url: $scope.base_url + "/metrics/{:id}.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout
                    },
                    new: {
                        method: 'POST',
                        url: $scope.base_url + "/metrics",
                        headers: {
                            'Accept': "application/json",
                            "Content-Type": "application/json"
                        }
                    }
                },
                evaluations: {
                    multiple: {
                        method: 'GET',
                        url: $scope.base_url + "/evaluations.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout
                    },
                    single: {
                        method: 'GET',
                        url: $scope.base_url + "/evaluations/{:id}.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout
                    },
                    new: {
                        method: 'POST',
                        url: $scope.base_url + "/evaluations",
                        headers: {
                            'Accept': "application/json",
                            "Content-Type": "application/json"
                        }
                    }
                },
                collections: {
                    multiple: {
                        method: 'GET',
                        url: $scope.base_url + "/collections.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout
                    },
                    single: {
                        method: 'GET',
                        url: $scope.base_url + "/collections/{:id}.json",
                        headers: {
                            'Accept': "application/json",
                        },
                        data: null,
                        timeout: $scope.request_timeout
                    },
                    new: {
                        method: 'POST',
                        url: $scope.base_url + "/collections",
                        headers: {
                            'Accept': "application/json",
                            "Content-Type": "application/json"
                        }
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
                            }
                        }
                    }]
                }

            };
            $scope.colors = ["#1F6FA1"];

        }
    ]
);