angular.module('appConfigCtrl', []).controller(
    'configCtrl',
    [
        '$scope',
        function($scope){
            $scope.base_url = "https://linkeddata.systems:3000/FAIR_Evaluator";
            $scope.charts_on = false;
            $scope.warning = true;
            $scope.request_timeout = 2000;

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
            $scope.evaluation_searchTerms = "";
            $scope.metrics_searchTerms = "";

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
                    post: {
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
                    post: {
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
                    post: {
                        method: 'POST',
                        url: $scope.base_url + "/collections",
                        headers: {
                            'Accept': "application/json",
                            "Content-Type": "application/json"
                        }
                    }
                }
            }

        }
    ]
);