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

class ScreenController {


    screen(req:Express.Request, res:Express.Response):any {
        var params = req.params.all();
        return res.view("screens/screen");
    }


    mobile(req:any, res:any) {
        return res.view("screens/mobile");
    }


    register(req, res) {
        var params = req.params.all();
        SocketHandler
            .connect(req)
            .then((screen)=> {
                return res.json({"socket": "success", screenNum: screen.num});
            });
    }

    getScreens(req:any, res:any) {
        var roomName = req.params.all().roomName;
        return SocketHandler
            .getScreens(roomName)
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
                roomName: params.roomName,
                fd: path.basename(file.fd)
            })
                .then((created:FileQuery)=> {
                    return SocketHandler
                        .displayFileOnScreen(params.screenId, path.basename(created.fd));
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
        var roomName = req.params.all().roomName;
        return RoomFile
            .find()
            .where({roomName: roomName})
            .then((found:Array<FileQuery>)=> {
                return res.json({
                    files: found.reverse()
                });
            })
            ;

    }

    showFile(req:any, res:any) {
        var params = req.params.all();
        return SocketHandler
            .displayFileOnScreen(params.screenId, path.basename(params.fd))
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

    caption(req:any,res:any){
        var params = req.params.all();
        return SocketHandler
            .caption(params)
            .then(()=>{
                res.status(200).json({status: "success"});
            });
    }
}


var controller = new ScreenController();

export = controller;

