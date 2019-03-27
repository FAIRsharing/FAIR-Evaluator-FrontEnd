let request_app = angular.module('requestProviderCtrl', ['appConfigCtrl']);

/* route: /collections */
my_collections_app.controller(
    'requestCtrl',
    function($http, $scope, $window, $location) {
        console.log("HI");

        let mappers = ["metrics", "evaluations", "collections"];

        $scope.response_rdy = false;
        $scope.request_error = false;


        let baseURL = new $window.URL($location.absUrl()).hash.replace('#!/', "");
        let URLarray = baseURL.split('/');

        let current_request = null;


        /* REQUEST BUILDER */
        /* Deal with multiple items pages */
        if (URLarray.length === 1 ){
            for (let itemName in $scope.requests){
                if ($scope.requests.hasOwnProperty(itemName) && itemName === URLarray[0] ){
                    current_request = $scope.requests[itemName].multiple;
                    $http(current_request).then(function(response){
                    });
                }
            }
        }

        /* Deal with single item pages */
        else if (URLarray.length === 2){
            if (URLarray[1] !== "new"){
                for (let itemName in $scope.requests) {
                    if ($scope.requests.hasOwnProperty(itemName) && itemName === URLarray[0]) {
                        current_request = $scope.requests[itemName].single;
                        current_request.url = current_request.url.replace("{:id}", URLarray[1]);
                    }
                }
            }

        }

        /* trigger the request and process the data */
        $http(current_request).then(function(response){
            $scope.response_rdy = true;

            /* COLLECTIONS */
            if (URLarray[0] === 'collections'){

                if (URLarray.length === 2){
                    $scope.collection = response.data;
                    $scope.collection['title'] = response.data['http://purl.org/dc/elements/1.1/title'];
                }
                else {
                    $scope.content_output = $scope.process_data(response.data);
                }
            }

            /* EVALUATIONS */
            else if (URLarray[0] === 'evaluations'){
                $scope.content_output = response.data;
                for (let evalIterator in $scope.content_output){
                    let evaluation = $scope.content_output[evalIterator];
                    evaluation['collection'] = parseFloat(evaluation['collection'].split('/').slice(-1)[0]);
                }
            }

            /* METRICS */
            else if (URLarray[0] === 'metrics'){
                if (URLarray.length === 2){
                    $scope.metric = response.data;
                }
                else {
                    $scope.content_output = response.data;
                }
            }
        },
        function(error){
            $scope.response_rdy = true;
            $scope.request_error = true;
        })

    }
);