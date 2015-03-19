module.exports = {
  //builds a function which, when called, returns val. Useful for angular's $scope.$watch() and building angular's factories.
  retFn:function(val){
    return function (){return val;};
  }
};
