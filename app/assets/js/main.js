
require('angular');
require('ngfile');
require('./app');

angular
    .element(document)
    .ready(function(){
        angular.bootstrap(document,['app']);
    });
