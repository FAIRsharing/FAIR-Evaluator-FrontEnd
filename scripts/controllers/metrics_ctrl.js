let my_metrics_app = angular.module('appMetricsCtrl', ['appConfigCtrl']);

/* route: /metrics */
my_metrics_app.controller(
    'metricsCtrl',
    function($http, $scope){
        let base_url = $scope.$parent.base_url;
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

    }
);

/* route: /metrics/{id} */
my_metrics_app.controller(
    'metricCtrl',
    function($http, $scope, $window, $location, $routeParams){
        let base_url = $scope.$parent.base_url;
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
    }
);


/* route: /metric/new */
my_metrics_app.controller(
    'newMetricCtrl',
    function($http, $scope){
        let base_url = $scope.$parent.base_url;
        $scope.response_rdy = true;
        $scope.form = {};
        $scope.form.metrics_url = null;

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
                    "smarturl": $scope.form.metrics_url
                }
            };
            if ($scope.form.metrics_url != null){
                $http(request).then(function(response){
                    console.log(response);
                    $scope.response_rdy = false;
                    $scope.response_content = response.data['@id']
                })
            }
        }
    }
);
