(function(){

    let my_app = angular.module('FAIRmetricsApp',
        ['ngRoute', 'ngAria', 'ngAnimate', 'ngMessages']);

    my_app.controller('CollectionsController', ['$http', '$sce',
        function($http, $sce) {

            let collections = this;
            collections.base_url = "http://linkeddata.systems:3000/FAIR_Evaluator";
            let collections_url = '/collections.json';
            collections.current_collection = false;
            collections.current_evaluation = false;
            collections.curent_metric = false;

            collections.process_data = function(data){
                let processed_collections = [];
                for (let collectionIterator in data){
                    if (data.hasOwnProperty(collectionIterator)){
                        let collection = data[collectionIterator];
                        let processed_collection = {};
                        processed_collection['name'] = collection["http://purl.org/dc/elements/1.1/title"];
                        processed_collection['contact'] = collection["http://purl.org/dc/elements/1.1/authoredBy"];
                        processed_collection['Organization'] = collection["http://purl.org/dc/elements/1.1/creator"];
                        if (collection.hasOwnProperty('valid')){
                            processed_collection['Deprecated'] = collection["valid"];
                        }
                        else {
                            processed_collection['Deprecated'] = true
                        }
                        processed_collection['id'] = collection["@id"];

                        let raw_description = collection["http://rdfs.org/ns/void#description"].split("https://orcid.org/")[1];
                        processed_collection['description'] = raw_description.split(".")[1];
                        processed_collections.push(processed_collection)
                    }
                }
                return processed_collections
            };

            /* Get one collection */
            collections.get_collection = function(collection_id) {
                $http.get(collection_id + '.json').then(function(response){
                    collections.current_collection = response.data;
                    collections.current_collection['name'] = response.data['http://purl.org/dc/elements/1.1/title'];
                })
            };

            /* Get all collections */
            collections.get_collections = function() {
                $http.get(collections.base_url + collections_url).then(function(response){
                    collections.evaluations = false;
                    collections.metrics = false;
                    collections.current_collection = false;
                    collections.data = collections.process_data(response.data);
                })
            };

            /* Get one evaluation */
            collections.get_evaluation = function(evaluation_id) {
                $http.get(evaluation_id + '.json').then(function(response){
                    let evaluation =  JSON.parse(response.data['evaluationResult']);
                    collections.current_evaluation = response.data;
                    collections.current_evaluation['evaluationResult'] = evaluation
                })
            };

            /* Get all evaluations */
            collections.get_evaluations = function(){
              $http.get(collections.base_url + "/evaluations.json").then(function(response){
                  collections.data = false;
                  collections.metrics = false;
                  collections.current_evaluation = false;
                  collections.evaluations = response.data;
              })
            };

            /* Get one metrics */
            collections.get_metric = function(metric_id) {
                $http.get(metric_id + '.json').then(function(response){
                    collections.current_metric = response.data;
                    console.log(collections.current_metric)
                })
            };

            /* Get all metrics */
            collections.get_metrics = function(){
                $http.get(collections.base_url+ "/metrics.json").then(function(response){
                    collections.data = false;
                    collections.evaluations = false;
                    collections.current_metric = false;
                    collections.metrics = response.data;
                })
            };


            collections.get_collections();
        }
    ]);

    my_app.filter('URL_last_arg', function() {
        return function (url) {
            let item = url.split('/').slice(-1)[0];

            if (item.indexOf('#') > 0){
                return item.split('#').slice(-1)[0]
            }
            return item;
        };
    });



})();