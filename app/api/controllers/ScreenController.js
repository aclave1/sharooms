/**
 * ScreenController
 *
 * @description :: Server-side logic for managing Screens
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  screenOne:function(req,res,next){
    var params = req.params.all();
    return res.view("screens/screenone");
  },
  screenTwo:function(req,res,next){
    return res.view("screens/screentwo");
  },
  mobile:function(req,res,next){
    res.view("screens/mobile");
  }
};

