let my_metrics_app = angular.module('appMetricsCtrl', ['appConfigCtrl']);

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
