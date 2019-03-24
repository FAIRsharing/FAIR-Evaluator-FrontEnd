let my_evaluations_app = angular.module('appEvaluationsCtrl', ['appConfigCtrl']);

/* route: /evaluations */
my_evaluations_app.controller(
    'evaluationsCtrl',
    function($http, $scope, $window, $location) {
        let base_url = $scope.$parent.base_url;
        $scope.response_rdy = false;

        let request = {
            method: 'GET',
            url: base_url + "/evaluations.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            $scope.evaluations = response.data;
            $scope.response_rdy = true;
        });

        $scope.goToEvaluation = function(identifier){
            $scope.baseURL = new $window.URL($location.absUrl());
            let id = identifier.split('/').slice(-1)[0];
            $window.location.href = $scope.baseURL + "/" + id
        };
    }
);

/* route: /evaluations/{id}*/
my_evaluations_app.controller(
    'evaluationCtrl',
    function($http, $scope, $window, $location, $routeParams) {
        let base_url = $scope.$parent.base_url;

        $scope.charts_on = $scope.$parent.charts_on;
        $scope.response_rdy = false;
        $scope.identifier = $routeParams.id;
        $scope.pie_labels = ["1 star", "2 stars", "3stars", "4 stars", "5stars"];
        $scope.pie_data = [0, 0, 0, 0, 0];


        $scope.histo_labels = [];
        $scope.histo_data = [
        ];

        let request = {
            method: 'GET',
            url: base_url + "/evaluations/" + $scope.identifier + '.json',
            headers: {
                'Accept': "application/json",
            },
            data: null
        };
        $http(request).then(function(response){
            let evaluation =  JSON.parse(response.data['evaluationResult']);
            $scope.evaluation = response.data;
            $scope.evaluation['evaluationResult'] = evaluation;
            $scope.resource = String();

            let resourceLimit = 0;
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

                    let score = metric["http://semanticscience.org/resource/SIO_000300"][0]["@value"];
                    $scope.histo_labels.push(
                        metricKey.split('/').slice(-1)[0].replace(/_/g, ' ')
                    );
                    $scope.histo_data.push(parseFloat(score));

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

            $scope.response_rdy = true;
        });

        $scope.goToEvaluations = function(){
            $scope.baseURL = new $window.URL($location.absUrl());
            $window.location.href = $scope.baseURL.origin + $scope.baseURL.pathname + '#!/evaluations';
        };
    }
);


/* route: /evaluation/new */
my_evaluations_app.controller(
    'runEvaluationCtrl',
    function($http, $scope, $window, $location, $routeParams){
        let base_url = $scope.$parent.base_url;
        $scope.evalForm = {};
        $scope.evalForm.collection = null;
        $scope.evalForm.guid = null;
        $scope.evalForm.title = null;
        $scope.evalForm.orcid = null;
        $scope.response_content = false;
        $scope.response_rdy = true;


        let request = {
            method: 'GET',
            url: base_url + "/collections.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };

        $scope.evalForm.collection_disabled = true;
        if ($routeParams.id === "new"){
            $scope.evalForm.collection_disabled = false;
        }
        else{
            request.url = base_url+ "/collections/" + $routeParams.id + '.json';
        }

        $http(request).then(function(response){
            $scope.collections = response.data;
            if ($scope.evalForm.collection_disabled){
                $scope.collection_id = response.data['@id'];
                $scope.collection_title = response.data['http://purl.org/dc/elements/1.1/title']
            }
        });

        $scope.clearFields = function(){
            if (!$scope.evalForm.collection_disabled){
                $scope.evalForm.collection = null;
            }
            $scope.evalForm.guid = null;
            $scope.evalForm.title = null;
            $scope.evalForm.orcid = null;
        };

        $scope.runEvaluation = function() {
            $scope.response_rdy = false;
            let collection_id = "";


            if (typeof $scope.collection_id == "undefined"){
                collection_id = $scope.evalForm.collection.split('/').slice(-1)[0];
            }
            else{
                collection_id = $scope.collection_id.split('/').slice(-1)[0];
            }

            let eval_request = {
                method: 'POST',
                url: base_url + "/collections/" + collection_id + "/evaluate",
                headers: {
                    'Accept': "application/json",
                    'Content-Type': "application/json"
                },
                data: {
                    "resource": $scope.evalForm.guid,
                    "executor": $scope.evalForm.orcid,
                    "title": $scope.evalForm.title
                }
            };

            let root_url = new $window.URL($location.absUrl());
            let next_url = root_url.origin + root_url.pathname + '#!/evaluations/';

            $http(eval_request).then(function(response){
                $scope.response_rdy = true;
                let evaluation_id = response.data["@id"].split('/').slice(-1)[0];
                $scope.response_content = next_url + evaluation_id;
                $scope.response_rdy = true;
            })
        }

    }
);
