angular.module('appConfigCtrl', []).controller(
    'configCtrl',
    [
        '$scope',
        function($scope){
            $scope.base_url = "https://linkeddata.systems:3000/FAIR_Evaluator";
            $scope.charts_on = false;
            $scope.warning = true;
        }
    ]
);