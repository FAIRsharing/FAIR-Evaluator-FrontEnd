let my_creator_app = angular.module('appCreatorsCtrl', ['appConfigCtrl']);

/* route: /evaluation/new */
my_creator_app.controller(
    'runEvaluationCtrl',
    function($http, $scope, $window, $location, $routeParams){
        let base_url = $scope.$parent.base_url;
        let self = this;
        $scope.evalForm = {};
        $scope.evalForm.collection = null;
        $scope.evalForm.guid = null;
        $scope.evalForm.title = null;
        $scope.evalForm.orcid = null;
        $scope.response_content = false;
        $scope.response_rdy = true;
        $scope.searchText = "";
        $scope.selectedItem = "";


        let request = angular.copy($scope.requests.collections.multiple);

        $scope.evalForm.collection_disabled = true;
        if ($routeParams.id === "new"){
            $scope.evalForm.collection_disabled = false;
        }
        else{
            request.url = base_url+ "/collections/" + $routeParams.id + '.json';
        }

        $http(request).then(function(response){
            $scope.collections = [];

            // Setting up the data structure for autocomplete
            for (let colIt in response.data){

                $scope.collections.push({
                    value: response.data[colIt],
                    display: response.data[colIt]['http://purl.org/dc/elements/1.1/title']
                });
            }

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

        $scope.runEvaluation = function(form) {
            form.$setSubmitted();

            if (form.$valid){
                $scope.response_rdy = false;
                let collection_id = "";

                if (typeof $scope.collection_id === "undefined"){
                    collection_id = $scope.evalForm.collection.split('/').slice(-1)[0];
                }
                else{
                    collection_id = $scope.collection_id.split('/').slice(-1)[0];
                }

                let creator_ORCID = $scope.isURL($scope.evalForm.orcid) ? $scope.evalForm.orcid.split['/'].slice(-1)[0] : $scope.evalForm.orcid;

                let eval_request = {
                    method: 'POST',
                    url: base_url + "/collections/" + collection_id + "/evaluate",
                    headers: {
                        'Accept': "application/json",
                        'Content-Type': "application/json"
                    },
                    data: {
                        "resource": $scope.evalForm.guid,
                        "executor": creator_ORCID,
                        "title": $scope.evalForm.title
                    }
                };

                let root_url = new $window.URL($location.absUrl());
                let next_url = root_url.origin + root_url.pathname + '#!/evaluations/';

                $http(eval_request).then(function(response){
                    $scope.response_rdy = true;
                    let evaluation_id = response.data["@id"].split('/').slice(-1)[0];
                    $scope.response_content = next_url + evaluation_id;
                    $window.location.href = next_url + evaluation_id;
                }, function(error){
                    $scope.response_content = true;
                    $scope.response_rdy = true;
                    $scope.request_error = error;
                })
            }
        };

        $scope.querySearch = function(query) {
            return query ? $scope.collections.filter(createFilterFor(query)) : $scope.collections;
        };

        function createFilterFor(query) {
            let lowercaseQuery = query.toLowerCase();
            return function filterFn(collection) {
                return (collection.value['http://purl.org/dc/elements/1.1/title'].toLowerCase().indexOf(lowercaseQuery) !== -1);
            };

        }

        $scope.setCollection = function(collection){
            if (collection){
                $scope.evalForm.collection = collection.value["@id"];
            }
            else {
                $scope.evalForm.collection = null;
            }
        }
    }
);

my_creator_app.controller(
    'newCollectionCtrl',
    function($http, $scope, $window, $location){
        let base_url = $scope.$parent.base_url;
        let request = {
            method: 'GET',
            url: base_url + "/metrics.json",
            headers: {
                'Accept': "application/json",
            },
            data: null
        };

        $scope.available_metrics = {};
        $scope.collection_data = {};
        $scope.collection_data.name = "";
        $scope.collection_data.contact = "";
        $scope.collection_data.organization = "";
        $scope.collection_data.indicators = [];
        $scope.collection_data.description = "";
        $scope.triggered = false;
        $scope.errors = false;
        $scope.response_content = false;


        $http(request).then(function(response){
            $scope.available_metrics = response.data;
        });

        $scope.createCollection = function(form){

            form.$setSubmitted();

            if (form.$valid){
                $scope.triggered = true;
                let contact_ORCID = $scope.isURL($scope.collection_data.contact) ? $scope.collection_data.contact.split('/').slice(-1)[0] : $scope.collection_data.contact;

                let request_data = {
                    "name": $scope.collection_data.name,
                    "contact": contact_ORCID,
                    "description": $scope.collection_data.description,
                    "organization": $scope.collection_data.organization,
                    "include_metrics": []
                };

                for (let ite in $scope.collection_data.indicators){
                    let metric_URL = $scope.collection_data.indicators[ite];
                    for (let sub_it in $scope.available_metrics){
                        if ($scope.available_metrics.hasOwnProperty(sub_it) && $scope.available_metrics[sub_it]["@id"] === metric_URL){
                            request_data['include_metrics'].push($scope.available_metrics[sub_it]['smarturl']);
                        }
                    }
                }

                let request = {
                    method: 'POST',
                    url: base_url + "/collections",
                    headers: {
                        'Accept': "application/json",
                        'Content-Type': "application/json"
                    },
                    data: request_data
                };

                $http(request).then(function(response){
                    $scope.triggered = false;
                    let identifier= response.data['@id'].split('/').slice(-1)[0];
                    let root_url = new $window.URL($location.absUrl());
                    $scope.response_content = root_url.origin + root_url.pathname + "#!/collections/" + identifier;
                    $scope.errors = response.data.statusText
                });
            }
        };

        $scope.clearFields = function(){
            $scope.collection_data.name = "";
            $scope.collection_data.contact = "";
            $scope.collection_data.organization = "";
            $scope.collection_data.indicators = [];
            $scope.collection_data.description = "";
        }

    }

);

my_creator_app.controller(
    'newMetricCtrl',
    function($http, $scope){
        let base_url = $scope.$parent.base_url;
        $scope.response_rdy = true;
        $scope.form = {};
        $scope.form.metrics_url = null;

        $scope.import_metric = function(form){

            form.$setSubmitted();

            if (form.$valid){
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
    }
);