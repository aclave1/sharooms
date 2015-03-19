var utils = require('./lib/utils');

module.exports = angular
  .module('app', [])
  .factory('io',
    utils.retFn(
      require('./dependencies/sails.io')().socket//getting the sails.io function, invoking it, and returning the socket
    )
  )
  .controller('TestController', ['$scope','io', function ($scope,io) {
    $scope.test = "Angularjs works";
  }])
;
