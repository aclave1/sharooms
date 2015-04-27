/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../types/types.d.ts"/>
declare var sails:any;
declare var __appdir:any;

var path = require('path');
var fs = require('fs');
var mime = require('mime');


var SocketHandler = require(__appdir + "/lib/sockets");

import ScreenQuery = require('../types/ScreenQuery')
import FileQuery = require('../types/FileQuery');

declare var RoomFile:Sails.Model;

var eventStrings = require(__appdir + '/lib/iso/eventstrings');

class ScreenController {


    screen(req:Express.Request, res:Express.Response):any {
        var params = req.params.all();
        var screenData = JSON.stringify({roomname:params.roomname} || {});

      return res.view("screens/screen",{screendata:screenData});
    }


    mobile(req:any, res:any) {

        var roomData = JSON.stringify(req.session.roomdata || {});

        return res.view("screens/mobile", {roomdata: roomData});
    }


    registerScreen(req, res) {
        var params = req.params.all();
        SocketHandler
            .connect(req)
            .then((screen)=> {
                return res.json({"socket": "success", screenNum: screen.num});
            });
    }

    getScreens(req:any, res:any) {
        var roomname = req.params.all().roomname;
        return SocketHandler
            .getScreens(roomname)
            .then((screens)=> {
                var screenResponse = screens.map((screen)=> {
                    return {screenNum: screen.num, screenId: screen.id};
                });
                return res.json({screens: screenResponse});
            })
            .catch(()=> {
                return res.status(500).json({error: "no screens registered"});
            });
    }


    upload(req, res) {

        var params = req.params.all();

        req.file('file').upload((err:any, files:any)=> {

            if (err) {
                return res.status(500).json({error: err});
            }
            var file = files[0];

            return RoomFile.create({
                roomname: params.roomname,
                fd: path.basename(file.fd)
            })
                .then((created:FileQuery)=> {

                  var fileParams = {
                    screenId:params.screenId,
                    fd:path.basename(file.fd),
                    userName:params.userName
                  };


                    return SocketHandler
                        .displayFileOnScreen(fileParams);
                })
                .then((status:any)=> {
                    return res.status(200).json({status: status});
                });


        });

    }


    download(req, res) {
        var fd = req.params.all().fd;

        var filePath = path.resolve('.tmp/uploads', path.basename(fd));
        var stat = fs.statSync(filePath);
        var type = mime.lookup(fd);

        res.setHeader('Content-disposition', 'attachment; filename=' + fd);
        res.setHeader('Content-Type', type);
        res.setHeader('Content-Length', stat.size);

        return fs.createReadStream(filePath).pipe(res);
    }

    getFilesForRoom(req:any, res:any) {
        var roomname = req.params.all().roomname;
        return RoomFile
            .find()
            .where({roomname: roomname})
            .then((found:Array<FileQuery>)=> {
                return res.json({
                    files: found.reverse()
                });
            })
            ;

    }

    showFile(req:any, res:any) {
        var params = req.params.all();

        var fileParams = {
          screenId:params.screenId,
          fd:path.basename(params.fd),
          userName:params.userName
        };

        return SocketHandler
            .displayFileOnScreen(fileParams)
            .then(()=> {
                res.status(200).json({status: "success"});
            });
    }

    resize(req:any, res:any) {
        var params = req.params.all();
        return SocketHandler
            .resize(params)
            .then(()=> {
                res.status(200).json({status: "success"});
            });
    }

    registerUser(req:any, res:any) {
      var params = req.params.all();

      req.session.roomdata = extractRoomData(params);
      req.session.save(function () {

        var roomData = JSON.stringify(req.session.roomdata || {});

        //return res.view("screens/mobile", {roomdata: roomData});

        return res.redirect('/mobile');


      });
    }

    caption(req:any,res:any){
        var params = req.params.all();
        return SocketHandler
            .caption(params)
            .then(()=>{
                res.status(200).json({status: "success"});
            });
    }

    getCoreOscMessages(req:any,res:any){
      return res.json(eventStrings.screen);
    }
}


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

export = controller;

