
var screen = "SCREEN";

var register = "REGISTER";
var unregister = "UNREGISTER";
var reassign = "REASSIGN";
var resize = "RESIZE";
var display = "DISPLAY";
var caption = "CAPTION";


module.exports = {
  screen:{
    register:buildEvt(screen,register),
    unregister:buildEvt(screen,unregister),
    reassign:buildEvt(screen,reassign),
    display:buildEvt(screen,display),
    resize:buildEvt(screen,resize),
    caption:buildEvt(screen,caption)
  }
};


function buildEvt(prefix,suffix){
  return [prefix,suffix].join(":");
}
