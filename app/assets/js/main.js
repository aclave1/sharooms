require('angular');


require('./app');

angular
    .element(document)
    .ready(function(){
        angular.bootstrap(document,['app']);
    });
