/// <reference path="../../typings/tsd.d.ts"/>

declare var sails:any;
declare var __appdir:any;

var SocketHandler = require(__appdir+"/lib/sockets");

import ScreenQuery = require('../types/ScreenQuery')


class ScreenController{


  screenOne(req:Express.Request,res:Express.Response):any{
    var params = req.params.all();

    return res.view("screens/screenone");

  }
  screenTwo(req:any,res:any) {
    return res.view("screens/screentwo");
  }
  mobile(req:any,res:any){
    return res.view("screens/mobile");
  }


  register(req,res){

    var params = req.params.all();

    //sails.sockets.join(req.socket,"mainroom");
    debugger;
    SocketHandler
      .connect(req)
      .then((screen)=>{
        debugger;
        return res.json({"socket":"success",screenNum:screen.num});


      });


  }
}


var controller = new ScreenController();

export = controller;

