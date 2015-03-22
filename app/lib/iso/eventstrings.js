
var screen = "SCREEN";

var register = "REGISTER";
var unregister = "UNREGISTER";
var reassign = "REASSIGN";

var display = "DISPLAY";


module.exports = {
  screen:{
    register:buildEvt(screen,register),
    unregister:buildEvt(screen,unregister),
    reassign:buildEvt(screen,reassign),
    display:buildEvt(screen,display)
  }
};


function buildEvt(prefix,suffix){
  return [prefix,suffix].join(":");
}
