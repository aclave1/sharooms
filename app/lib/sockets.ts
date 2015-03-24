///<reference path="../typings/tsd.d.ts"/>

import ScreenQuery = require('../api/types/ScreenQuery');
import Promise = require('bluebird');

var eventstrings = require('./iso/eventstrings');

declare var sails:any;


class RoomTable {
  rooms:Object;
  socketsToRooms:Object;
  //rooms:Map<string,Room>;
  constructor() {
    this.rooms = {};
    this.socketsToRooms = {};
    //this.rooms = new Map<string,Room>();
  }

  findRoomBySocket(socketId:string) {

  }

}

class Room {
  name:string;
  screenCount:number;
  screens:Object;
  //screens:Map<string,ScreenEntry>;
  constructor(name:string) {
    this.name = name;
    this.screens = {};
    this.screenCount = 0;
    //this.screens = new Map<string,ScreenEntry>();
  }
}

class ScreenEntry {
  id:string;
  socket:SocketIO.Socket;
  num:number;


  constructor(def?:any) {
    if (def) {
      this.id = def.id ? def.id : null;
      this.socket = def.socket ? def.socket : null;
      this.num = def.num ? def.num : null;
    }
  }
}


var roomTable:RoomTable = new RoomTable();


declare var Screen:Sails.Model;


class Sockets {

  connect(req) {
    return new Promise((res:any, rej)=> {


      var roomName:string = req.params.all().roomName;
      var socketId:string = sails.sockets.id(req.socket);
      var room:Room = roomTable.rooms[roomName];


      if (room == null) {
        room = new Room(roomName);
        roomTable.rooms[roomName] = room;
      }

      var screen:ScreenEntry = room.screens[socketId];

      if (screen == null) {
        screen = this.mapScreenToRoom(room, socketId, req);
      }

      res(screen);


    });
  }

  private mapScreenToRoom(room, socketId, req) {
    room.screenCount++;


    var screen:ScreenEntry = new ScreenEntry({
      id: socketId,
      num: room.screenCount,
      socket: req.socket
    });


    room.screens[screen.id] = screen;
    roomTable.socketsToRooms[socketId] = room;
    return screen;
  }


  onDisconnect(session, socket, cb) {

    console.log("disconnect");
    var socketId:string = sails.sockets.id(socket);

    var room:Room = roomTable.socketsToRooms[socketId];

    if (room) {
      delete room.screens[socketId];
      room.screenCount--;
      delete roomTable.socketsToRooms[socketId];
    }


    //we should let all the other screens know that this one disconnected
    return cb();
  }


  getScreens(roomName:string) {

    return new Promise((res:any, rej:any)=> {

      var room = roomTable.rooms[roomName];

      var screens:Array<Screen> = new Array<Screen>();
      if(room === undefined){
        rej();
      }else{

        for (var k in room.screens) {
          screens.push(room.screens[k]);
        }

      }

      return res(screens);
    });

  }

  displayFileOnScreen(screenId:string,filepath:string){

    return new Promise((res:any,rej:any)=>{
      var room:Room = roomTable.socketsToRooms[screenId];
      var screen = room.screens[screenId];


      screen.socket.emit(eventstrings.screen.display,{fd:filepath});

      res();

    });



  }

}

var sockets = new Sockets();

export = sockets;




