/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../types/types.d.ts"/>
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var SocketHandler = require(__appdir + "/lib/sockets");
var eventStrings = require(__appdir + '/lib/iso/eventstrings');
var ScreenController = (function () {
    function ScreenController() {
    }
    ScreenController.prototype.screen = function (req, res) {
        var params = req.params.all();
        var screenData = JSON.stringify({ roomname: params.roomname } || {});
        return res.view("screens/screen", { screendata: screenData });
    };
    ScreenController.prototype.mobile = function (req, res) {
        var roomData = JSON.stringify(req.session.roomdata || {});
        return res.view("screens/mobile", { roomdata: roomData });
    };
    ScreenController.prototype.registerScreen = function (req, res) {
        var params = req.params.all();
        SocketHandler.connect(req).then(function (screen) {
            return res.json({ "socket": "success", screenNum: screen.num });
        });
    };
    ScreenController.prototype.getScreens = function (req, res) {
        var roomname = req.params.all().roomname;
        return SocketHandler.getScreens(roomname).then(function (screens) {
            var screenResponse = screens.map(function (screen) {
                return { screenNum: screen.num, screenId: screen.id };
            });
            return res.json({ screens: screenResponse });
        }).catch(function () {
            return res.status(500).json({ error: "no screens registered" });
        });
    };
    ScreenController.prototype.upload = function (req, res) {
        var params = req.params.all();
        req.file('file').upload(function (err, files) {
            if (err) {
                return res.status(500).json({ error: err });
            }
            var file = files[0];
            return RoomFile.create({
                roomname: params.roomname,
                fd: path.basename(file.fd)
            }).then(function (created) {
                var fileParams = {
                    screenId: params.screenId,
                    fd: path.basename(file.fd),
                    userName: params.userName
                };
                return SocketHandler.displayFileOnScreen(fileParams);
            }).then(function (status) {
                return res.status(200).json({ status: status });
            });
        });
    };
    ScreenController.prototype.download = function (req, res) {
        var fd = req.params.all().fd;
        var filePath = path.resolve('.tmp/uploads', path.basename(fd));
        var stat = fs.statSync(filePath);
        var type = mime.lookup(fd);
        res.setHeader('Content-disposition', 'attachment; filename=' + fd);
        res.setHeader('Content-Type', type);
        res.setHeader('Content-Length', stat.size);
        return fs.createReadStream(filePath).pipe(res);
    };
    ScreenController.prototype.getFilesForRoom = function (req, res) {
        var roomname = req.params.all().roomname;
        return RoomFile.find().where({ roomname: roomname }).then(function (found) {
            return res.json({
                files: found.reverse()
            });
        });
    };
    ScreenController.prototype.showFile = function (req, res) {
        var params = req.params.all();
        var fileParams = {
            screenId: params.screenId,
            fd: path.basename(params.fd),
            userName: params.userName
        };
        return SocketHandler.displayFileOnScreen(fileParams).then(function () {
            res.status(200).json({ status: "success" });
        });
    };
    ScreenController.prototype.resize = function (req, res) {
        var params = req.params.all();
        return SocketHandler.resize(params).then(function () {
            res.status(200).json({ status: "success" });
        });
    };
    ScreenController.prototype.registerUser = function (req, res) {
        var params = req.params.all();
        req.session.roomdata = extractRoomData(params);
        req.session.save(function () {
            var roomData = JSON.stringify(req.session.roomdata || {});
            //return res.view("screens/mobile", {roomdata: roomData});
            return res.redirect('/mobile');
        });
    };
    ScreenController.prototype.caption = function (req, res) {
        var params = req.params.all();
        return SocketHandler.caption(params).then(function () {
            res.status(200).json({ status: "success" });
        });
    };
    ScreenController.prototype.getCoreOscMessages = function (req, res) {
        return res.json(eventStrings.screen);
    };
    return ScreenController;
})();
function extractRoomData(params) {
    var campus = params.campus || "";
    var building = params.building || "";
    var room = params.room || "";
    var userName = params.userName || "Unknown user";
    var roomname = campus + building + room;
    return {
        roomname: roomname,
        userName: userName
    };
}
var controller = new ScreenController();
module.exports = controller;
//# sourceMappingURL=MainController.js.map