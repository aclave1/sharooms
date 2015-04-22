var utils = require('./lib/utils');

var hardCodedRoom = {roomName: "mainroom"};


module.exports = angular
  .module('app', ['angularFileUpload'])
  .constant('events', require('eventstrings'))
  .factory('io',
  utils.retFn(
    require('./dependencies/sails.io')().socket//getting the sails.io function, invoking it, and returning the socket
  )
)
  .controller('MainController', ['$scope', 'io', 'events', function ($scope, io, events) {
    $scope.displayImage = false;
    $scope.imageUrl = "";

    io.post("/screen/register", hardCodedRoom, function (response, jwr) {
      setScreenNum(response);
    });

    io.on(events.screen.display,function(event){

      var fd = event.fd;
      $scope.imageUrl = fd;
      $scope.displayImage = true;
      $scope.$apply();

    });

    function setScreenNum(num) {
      $scope.screenNum = num.screenNum;
      $scope.$apply();
    }

  }])
  .controller('MobileController',['$scope','io','$upload',function($scope,io,$upload){
    $scope.test = "chickens";
    $scope.showScreenPicker = false;
    $scope.currentFile = null;
    $scope.clickMap = [];

    $scope.screens = [];
    $scope.roomFiles = [];
    $scope.files = [];

    function buildUploadUrl(screen) {
      return "/upload?" + ["screenId="+screen.screenId,"roomName="+hardCodedRoom.roomName].join("&")
    }

    $scope.upload = function ($index) {
      var screen = $scope.screens[$index];

      var url = buildUploadUrl(screen);

      var files = $scope.files;
      if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          $upload.upload({
            url: buildUploadUrl(screen),
            fields: {},
            fileFormDataName:'file',
            file: file
          }).progress(function (evt) {
            hideScreenPicker();
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
          }).success(function (data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            getRoomFiles();
          });
        }
      }
    };

    //gets the list of screens and their sockets
    $scope.getScreens = function () {
      io.post('/screen/getscreens', hardCodedRoom, function (response, body) {
        //showScreenPicker();
        $scope.screens = response.screens;
        $scope.$apply();
      });
    };
    //when a file is selected from the file picker
    $scope.fileSelected = function($files,$event){
      this.getScreens();
    };

    //when an image is clicked in the carousel
    $scope.imageClick = function($index){
      $scope.clickMap = [];
      $scope.clickMap[$index] = true;
      setCurrentImg($scope.roomFiles[$index]);

    };

    $scope.chooseScreenToShow = function($index){

    };

    $scope.imgWasClicked = function($index){
     return $scope.clickMap[$index] === true;
    };


    function showScreenPicker(){
      $scope.showScreenPicker = true;
    }

    function hideScreenPicker(){
      $scope.showScreenPicker = false;
    }

    function getRoomFiles(){
      io.get('/screen/files?roomName='+hardCodedRoom.roomName,function(response,jwr){
        setRoomFiles(response.files);
      });
    }

    $scope.showOnScreen = function($index){
      var screen = $scope.screens[$index];

      var request = {
        fd:$scope.currentFile.fd,
        screenId:screen.screenId
      };
      io.post('/screen/show',request,function(response){

      });
    };

    //the last image that was clicked
    function setCurrentImg(file){
      $scope.currentFile = file;
    }
    function setRoomFiles(files){
      $scope.roomFiles = files;
      $scope.$apply();
    }
    $scope.getScreens();
    getRoomFiles();



  }])
;
