
var screen = "CORE";

var register = "REGISTER";
var unregister = "UNREGISTER";
var reassign = "REASSIGN";
var resize = "RESIZE";
var display = "SHOW";
var caption = "CAPTION";
var next = "NEXT";
var prev = "PREV";

module.exports = {
  screen:{
    register:buildEvt(screen,register),
    unregister:buildEvt(screen,unregister),
    reassign:buildEvt(screen,reassign),
    display:buildEvt(screen,display),
    resize:buildEvt(screen,resize),
    caption:buildEvt(screen,caption),
    next:buildEvt(screen,next),
    prev:buildEvt(screen,prev)
  }
};


function buildEvt(prefix,suffix){
  return [prefix,suffix].join("/");
}
