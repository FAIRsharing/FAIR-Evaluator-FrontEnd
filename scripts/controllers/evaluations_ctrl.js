let my_evaluations_app = angular.module('appEvaluationsCtrl', ['appConfigCtrl']);

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


        let request = $scope.request.evaluations.new;

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
