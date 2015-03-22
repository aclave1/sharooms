///<reference path="../typings/tsd.d.ts"/>
var Promise = require('bluebird');
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
    return Sockets;
})();
var sockets = new Sockets();
module.exports = sockets;
//# sourceMappingURL=sockets.js.map