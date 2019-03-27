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

        /* Deal with multiple items pages */
        if (URLarray.length === 1 ){
            for (let itemKey in mappers){
                if (mappers.hasOwnProperty(itemKey) && mappers[itemKey] === URLarray[0] ){
                    let current_request = $scope.requests[mappers[itemKey]].multiple;
                    $http(current_request).then(function(response){
                        $scope.response_rdy = true;

                        /* collections need pre-processing */
                        if (mappers[itemKey] === 'collections' ){
                            $scope.content_output = $scope.process_data(response.data);
                        }

                        /* evaluations need another pre-processing */
                        else if (mappers[itemKey] === 'evaluations' ){
                            $scope.content_output = response.data;
                            for (let evalIterator in $scope.content_output){
                                let evaluation = $scope.content_output[evalIterator];
                                evaluation['collection'] = parseFloat(evaluation['collection'].split('/').slice(-1)[0]);
                            }
                        }

                        /* Metrics // MI */
                        else{
                            $scope.content_output = response.data;
                        }
                    },
                    function(error){
                        $scope.response_rdy = true;
                        $scope.request_error = true;
                    });
                }
            }
        }

        else if (URLarray.length > 1){

            if (URLarray[1] !== "new"){
                console.log(URLarray[1]);
            }

        }
    }
);