/// <reference path="../../typings/tsd.d.ts"/>
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
        //sails.sockets.join(req.socket,"mainroom");
        SocketHandler.connect(req).then(function (screen) {
            return res.json({ "socket": "success", screenNum: screen.num });
        });
    };
    ScreenController.prototype.getScreens = function (req, res) {
        var roomName = req.params.all().roomName;
        SocketHandler.getScreens(roomName).then(function (screens) {
            var screenResponse = screens.map(function (screen) {
                return { screenNum: screen.num, screenId: screen.id };
            });
            return res.json({ screens: screenResponse });
        });
    };
    ScreenController.prototype.upload = function (req, res) {
        var params = req.params.all();
        req.file('file').upload(function (err, files) {
            var file = files[0];
            if (err) {
                return res.status(500).json({ error: err });
            }
            return SocketHandler.displayFileOnScreen(params.screenId, path.basename(file.fd)).then(function (status) {
                return res.json({ status: status });
            });
        });
    };
    ScreenController.prototype.download = function (req, res) {
        var fd = req.params.all().fd;
        var filePath = path.resolve('.tmp/uploads', fd);
        var stat = fs.statSync(filePath);
        res.setHeader('Content-disposition', 'attachment; filename=' + fd);
        var type = mime.lookup(fd);
        res.setHeader('Content-Type', type);
        res.setHeader('Content-Length', stat.size);
        fs.createReadStream(filePath).pipe(res);
        return;
    };
    return ScreenController;
})();
var controller = new ScreenController();
module.exports = controller;
//# sourceMappingURL=ScreenController.js.map