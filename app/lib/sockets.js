///<reference path="../typings/tsd.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var eventstrings = require('./iso/eventstrings');
var RoomTable = (function () {
    //rooms:Map<string,Room>;
    function RoomTable() {
        this.rooms = {};
        this.socketsToRooms = {};
        //this.rooms = new Map<string,Room>();
    }
    RoomTable.prototype.findRoomBySocket = function (socketId) {
    };
    return RoomTable;
})();
var Room = (function () {
    //screens:Map<string,ScreenEntry>;
    function Room(name) {
        this.name = name;
        this.screens = {};
        this.screenCount = 0;
        //this.screens = new Map<string,ScreenEntry>();
    }
    return Room;
})();
var ScreenEntry = (function () {
    function ScreenEntry(def) {
        if (def) {
            this.id = def.id ? def.id : null;
            this.socket = def.socket ? def.socket : null;
            this.num = def.num ? def.num : null;
        }
    }
    return ScreenEntry;
})();
var roomTable = new RoomTable();
var Sockets = (function () {
    function Sockets() {
    }
    Sockets.prototype.connect = function (req) {
        var _this = this;
        return new Promise(function (res, rej) {
            var roomName = req.params.all().roomName;
            var socketId = sails.sockets.id(req.socket);
            var room = roomTable.rooms[roomName];
            if (room == null) {
                room = new Room(roomName);
                roomTable.rooms[roomName] = room;
            }
            var screen = room.screens[socketId];
            if (screen == null) {
                screen = _this.mapScreenToRoom(room, socketId, req);
            }
            res(screen);
        });
    };
    Sockets.prototype.mapScreenToRoom = function (room, socketId, req) {
        room.screenCount++;
        var screen = new ScreenEntry({
            id: socketId,
            num: room.screenCount,
            socket: req.socket
        });
        room.screens[screen.id] = screen;
        roomTable.socketsToRooms[socketId] = room;
        return screen;
    };
    Sockets.prototype.onDisconnect = function (session, socket, cb) {
        console.log("disconnect");
        var socketId = sails.sockets.id(socket);
        var room = roomTable.socketsToRooms[socketId];
        if (room) {
            delete room.screens[socketId];
            room.screenCount--;
            delete roomTable.socketsToRooms[socketId];
        }
        //we should let all the other screens know that this one disconnected
        return cb();
    };
    Sockets.prototype.getScreens = function (roomName) {
        return new Promise(function (res, rej) {
            var room = roomTable.rooms[roomName];
            var screens = new Array();
            if (room === undefined) {
                rej();
            }
            else {
                for (var k in room.screens) {
                    screens.push(room.screens[k]);
                }
            }
            return res(screens);
        });
    };
    Sockets.prototype.displayFileOnScreen = function (screenId, filepath) {
        return new Promise(function (res, rej) {
            var room = roomTable.socketsToRooms[screenId];
            var screen = room.screens[screenId];
            screen.socket.emit(eventstrings.screen.display, { fd: filepath });
            res();
        });
    };
    Sockets.prototype.resize = function (params) {
        return new Promise(function (res, rej) {
            var room = roomTable.socketsToRooms[params.screenId];
            var screen = room.screens[params.screenId];
            screen.socket.emit(eventstrings.screen.resize, { direction: params.direction });
            res();
        });
    };
    Sockets.prototype.caption = function (params) {
        var _this = this;
        return new Promise(function (res, rej) {
            _this.messageScreen(params.screenId, eventstrings.screen.caption, { text: params.text });
            res();
        });
    };
    Sockets.prototype.getScreen = function (screenId) {
        var room = roomTable.socketsToRooms[screenId];
        var screen = room.screens[screenId];
        return screen;
    };
    Sockets.prototype.messageScreen = function (screenId, event, data) {
        var screen = this.getScreen(screenId);
        screen.socket.emit(event, data);
    };
    return Sockets;
})();
var sockets = new Sockets();
var RoomParams = (function () {
    function RoomParams() {
    }
    return RoomParams;
})();
var ResizeParams = (function (_super) {
    __extends(ResizeParams, _super);
    function ResizeParams() {
        _super.apply(this, arguments);
    }
    return ResizeParams;
})(RoomParams);
var CaptionParams = (function (_super) {
    __extends(CaptionParams, _super);
    function CaptionParams() {
        _super.apply(this, arguments);
    }
    return CaptionParams;
})(RoomParams);
module.exports = sockets;
//# sourceMappingURL=sockets.js.map