angular.module('appGraphCtrl', []).controller(
    'graphCtrl',
    ['$scope', '$http', function($scope){
        $scope.pie_labels = ["1 star", "2 stars", "3stars", "4 stars", "5stars"];
        $scope.histo_labels = [];
        $scope.pie_data = [0, 0, 0, 0, 0];
        $scope.histo_data = [[]];
        $scope.series = [
            ["test"], ["test2"]
        ];
        let resourceLimit = 0;

        $scope.$watch('evaluation', function(){
            for (let metricKey in $scope.evaluation['evaluationResult']){
                if ($scope.evaluation['evaluationResult'].hasOwnProperty(metricKey)){
                    let metric = $scope.evaluation['evaluationResult'][metricKey][0];
                    if (resourceLimit === 0){
                        $scope.resource = metric['http://semanticscience.org/resource/SIO_000332'][0]['@id'];
                        if (!$scope.resource){
                            $scope.resource = metric['http://semanticscience.org/resource/SIO_000332'][0]['@value'];
                        }
                        if (!$scope.resource.startsWith('http') && !$scope.resource.startsWith('https')){
                            $scope.resource = "https://doi.org/" + $scope.resource;
                        }
                        resourceLimit++
                    }

                    /* SET HISTOGRAM DATA*/
                    let score = metric["http://semanticscience.org/resource/SIO_000300"][0]["@value"];
                    $scope.histo_labels.push(
                        metricKey.split('/').slice(-1)[0].replace(/_/g, ' ')
                    );

                    if (score > 0){
                        $scope.histo_data[0].push(parseFloat(score)*100);
                    }
                    else {
                        $scope.histo_data[0].push(1);
                    }

                    /* SET PIE CHART DATA */
                    switch(parseFloat(score)){
                        case 0:
                            $scope.pie_data[0] += 1;
                            break;
                        case 1:
                            $scope.pie_data[4] += 1;
                            break;
                        case 0.25:
                            $scope.pie_data[1] += 1;
                            break;
                        case 0.5:
                            $scope.pie_data[2] += 1;
                            break;
                        case 0.75:
                            $scope.pie_data[3] += 1;
                            break;
                    }
                }
            }
        })
    }]
);