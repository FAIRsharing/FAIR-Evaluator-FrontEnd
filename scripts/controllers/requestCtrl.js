let request_app = angular.module('requestProviderCtrl', ['appConfigCtrl']);

/* route: /collections */
request_app.controller(
    'requestCtrl',
    function($http, $scope, $window, $location) {

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

        /* trigger the request and process the data */
        $http(current_request).then(function (response) {
                $scope.response_rdy = true;

                /* COLLECTIONS */
                if (URL[0] === 'collections') {
                    $scope.dataType = "collections";
                    if (URL.length === 2) {
                        $scope.collection = response.data;
                        $scope.collection['title'] = response.data['http://purl.org/dc/elements/1.1/title'];
                    }
                    else {
                        $scope.content_output = $scope.process_data(response.data);
                    }
                }

                /* EVALUATIONS */
                else if (URL[0] === 'evaluations') {
                    $scope.dataType = "evaluations";
                    if (URL.length === 2) {
                        let evaluation = JSON.parse(response.data['evaluationResult']);
                        $scope.evaluation = response.data;
                        $scope.evaluation['evaluationResult'] = evaluation;
                        $scope.resource = String();
                    }
                    else {
                        $scope.content_output = response.data;
                        for (let evalIterator in $scope.content_output) {
                            let evaluation = $scope.content_output[evalIterator];
                            evaluation['collection'] = parseFloat(evaluation['collection'].split('/').slice(-1)[0]);
                        }
                    }
                }

                /* METRICS */
                else if (URL[0] === 'metrics') {
                    $scope.dataType = "metrics";
                    if (URL.length === 2) {
                        $scope.metric = response.data;
                    }
                    else {
                        $scope.content_output = response.data;
                    }
                }

                /* SEARCHES */
                else {
                    $scope.searchTerms = decodeURIComponent(URL[0].split("?terms=")[1]);
                    $scope.results = response.data;
                    $scope.results.collections = $scope.process_data(response.data.collections);
                }
            },
            function (error) {
                $scope.response_rdy = true;
                $scope.request_error = true;
            }
        );
    }
);