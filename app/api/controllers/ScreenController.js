/// <reference path="../../typings/tsd.d.ts"/>
var SocketHandler = require(__appdir + "/lib/sockets");
var ScreenController = (function () {
    function ScreenController() {
    }
    ScreenController.prototype.screenOne = function (req, res) {
        var params = req.params.all();
        return res.view("screens/screenone");
    };
    ScreenController.prototype.screenTwo = function (req, res) {
        return res.view("screens/screentwo");
    };
    ScreenController.prototype.mobile = function (req, res) {
        return res.view("screens/mobile");
    };
    ScreenController.prototype.register = function (req, res) {
        var params = req.params.all();
        debugger;
        SocketHandler.connect(req).then(function (screen) {
            debugger;
            return res.json({ "socket": "success", screenNum: screen.num });
        });
    };
    return ScreenController;
})();
var controller = new ScreenController();
module.exports = controller;
//# sourceMappingURL=ScreenController.js.map