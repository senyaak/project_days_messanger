var socket = io();

if($.cookie("token")) {
  socket.emit("loggedin", $.cookie("token"))
}