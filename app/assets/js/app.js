var utils = require('./lib/utils');


module.exports = angular
  .module('app', ['angularFileUpload'])
  .constant('events', require('eventstrings'))
  //getting the sails.io function, invoking it, and returning the socket
  .factory('io', utils.retFn(require('./dependencies/sails.io')().socket))
  .controller('MainController', ['$scope', 'io', 'events', function ($scope, io, events) {
    var screenData = window.__SCREENDATA;

    $scope.displayImage = false;
    $scope.imageUrl = "";

    $scope.imgdim = {
      "height": "100%",
      "width": "100%"
    };

    var captionApi = buildCaptionApi($scope);


    io.post("/screen/register", screenData, function (response, jwr) {
      setScreenNum(response);
    });

    io.on(events.screen.display, function (event) {
      $scope.imageUrl = event.fd;
      $scope.displayImage = true;
      $scope.$apply();
    });

    io.on(events.screen.resize, function (event) {
      var height = parseInt($scope.imgdim.height);
      var width = parseInt($scope.imgdim.width);

      $scope.imgdim.height = (height + event.direction * 10) + "%";
      $scope.imgdim.width = (width + event.direction * 10) + "%";
      $scope.$apply();
    });

    io.on(events.screen.caption, function (event) {
      captionApi.setCaption(event);
      $scope.$apply();
    });


    function buildCaptionApi(scope) {

      var captionUserMap = {};
      scope.captions = [];


      function setCaption (captionData) {
        var existingCaption = captionUserMap[captionData.userName];
        if (existingCaption) {
          //they deleted their text
          if (captionData.text === "") {
            return removeCaption(captionData.userName);
          }

          existingCaption.text = captionData.text;
        } else {

          captionUserMap[captionData.userName] = captionData;
          scope.captions.push(captionUserMap[captionData.userName]);

        }
      }
       function removeCaption(userName) {
        for(var i=0;i<scope.captions.length;i++){
          var caption = scope.captions[i];
          if(caption.userName === userName){
            scope.captions.splice(i,1);
            delete captionUserMap[userName];
          }
        }
      }

      return {
        setCaption: setCaption,
        removeCaption:removeCaption

      };
    }

    function setScreenNum(num) {
      $scope.screenNum = num.screenNum;
      $scope.$apply();
    }


  }])
  .controller('MobileController', ['$scope', 'io', '$upload', function ($scope, io, $upload) {
    var roomData = window.__ROOMDATA;
    $scope.test = "chickens";
    $scope.showScreenPicker = false;
    $scope.currentFile = null;
    $scope.screenToEdit = null;
    $scope.clickMap = [];

    $scope.screens = [];
    $scope.roomFiles = [];
    $scope.files = [];


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
            fileFormDataName: 'file',
            file: file
          }).success(function (data, status, headers, config) {
            hideScreenPicker();
            getRoomFiles();
          });
        }
      }
    };

    //gets the list of screens and their sockets
    $scope.getScreens = function () {
      io.post('/screen/getscreens', roomData, function (response, body) {
        showScreenPicker();
        $scope.screens = response.screens;
        $scope.$apply();
      });
    };
    //when a file is selected from the file picker
    $scope.fileSelected = function ($files, $event) {
      this.getScreens();
    };

    //when an image is clicked in the carousel
    $scope.imageClick = function ($index) {
      $scope.clickMap = [];
      $scope.clickMap[$index] = true;
      setCurrentImg($scope.roomFiles[$index]);

    };


    $scope.chooseScreenToEdit = function ($index) {
      $scope.screenToEdit = $scope.screens[$index];
      $scope.editScreenIndex = $index;
    };

    $scope.imgWasClicked = function ($index) {
      return $scope.clickMap[$index] === true;
    };


    $scope.showOnScreen = function ($index) {
      var screen = $scope.screens[$index];

      var request = {
        fd: $scope.currentFile.fd,
        screenId: screen.screenId,
        userName: getUserName()
      };
      io.post('/screen/show', request, function (response) {

      });
    };

    $scope.$watch(function () {
      return $scope.screenCaption;
    }, function (changes) {
      if (!$scope.screenToEdit)return;
      console.log(changes);
      var request = {
        text: changes,
        roomname: getRoomName(),
        screenId: $scope.screenToEdit.screenId,
        userName: getUserName()
      };
      io.post('/screen/caption', request, function (response) {

      });
    });


    $scope.resizeUp = function () {
      resizeScreen(1);
    };
    $scope.resizeDown = function () {
      resizeScreen(-1);
    };
    function resizeScreen(direction) {
      var req = {
        roomname: getRoomName(),
        direction: direction,
        screenId: $scope.screenToEdit.screenId,
        userName: getUserName()
      };
      io.post('/screen/resize', req);
    }

    //the last image that was clicked
    function setCurrentImg(file) {
      $scope.currentFile = file;
    }

    function setRoomFiles(files) {
      $scope.roomFiles = files;
      $scope.$apply();
    }

    function getRoomFiles() {
      io.get('/screen/files?roomname=' + roomData.roomname, function (response, jwr) {
        setRoomFiles(response.files);
      });
    }


    function getUserName() {
      return roomData.userName;
    }

    function getRoomName() {
      return roomData.roomname;
    }

    function showScreenPicker() {
      $scope.showScreenPicker = true;
    }

    function hideScreenPicker() {
      $scope.showScreenPicker = false;
    }


    function buildUploadUrl(screen) {
      return "/upload?" +
        ["screenId=" + screen.screenId,
          "roomname=" + getRoomName(),
          "userName=" + getUserName()
        ].join("&")
    }


    /***************************************************************************************************************
     * INIT
     * *************************************************************************************************************/
    $scope.getScreens();
    getRoomFiles();

  }])
;

