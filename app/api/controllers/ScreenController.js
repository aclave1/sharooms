/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../types/types.d.ts"/>
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var SocketHandler = require(__appdir + "/lib/sockets");
var ScreenController = (function () {
    function ScreenController() {
    }
    ScreenController.prototype.screen = function (req, res) {
        var params = req.params.all();
        return res.view("screens/screen");
    };
    ScreenController.prototype.mobile = function (req, res) {
        return res.view("screens/mobile");
    };
    ScreenController.prototype.register = function (req, res) {
        var params = req.params.all();
        SocketHandler.connect(req).then(function (screen) {
            return res.json({ "socket": "success", screenNum: screen.num });
        });
    };
    ScreenController.prototype.getScreens = function (req, res) {
        var roomName = req.params.all().roomName;
        return SocketHandler.getScreens(roomName).then(function (screens) {
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
                roomName: params.roomName,
                fd: path.basename(file.fd)
            }).then(function (created) {
                return SocketHandler.displayFileOnScreen(params.screenId, path.basename(created.fd));
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
        var roomName = req.params.all().roomName;
        return RoomFile.find().where({ roomName: roomName }).then(function (found) {
            return res.json({
                files: found.reverse()
            });
        });
    };
    ScreenController.prototype.showFile = function (req, res) {
        var params = req.params.all();
        return SocketHandler.displayFileOnScreen(params.screenId, path.basename(params.fd)).then(function () {
            res.status(200).json({ status: "success" });
        });
    };
    ScreenController.prototype.resize = function (req, res) {
        var params = req.params.all();
        return SocketHandler.resize(params).then(function () {
            res.status(200).json({ status: "success" });
        });
    };
    ScreenController.prototype.caption = function (req, res) {
        var params = req.params.all();
        return SocketHandler.caption(params).then(function () {
            res.status(200).json({ status: "success" });
        });
    };
    return ScreenController;
})();
var controller = new ScreenController();
module.exports = controller;
//# sourceMappingURL=ScreenController.js.map