var utils = require('./lib/utils');

module.exports = angular
  .module('app', [])
  .factory('io',
    utils.retFn(
      require('./dependencies/sails.io')().socket//getting the sails.io function, invoking it, and returning the socket
    )
  )
  .controller('MainController', ['$scope','io', function ($scope,io) {
    $scope.test = "Angularjs works";


    io.post("/screen/register",{roomName:"mainroom"},function(one,two,three){
      debugger;
      $scope.screenNum = one.screenNum;
      $scope.$apply();



    });

  }])

;
