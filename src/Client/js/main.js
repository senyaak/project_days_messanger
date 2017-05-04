var socket = io();
function UpdateState() {
  if($.cookie("token")) {
    socket.emit("loggedin", $.cookie("token"));
    setUsername();
  } else {
    $(".authPanel.hidden").removeClass("hidden");
  }
}

function login() {
  var name = $("#ipUsername").val();
  $.ajax({
    url: "/login",
    type: "POST",
    headers: {
      user: name
    },
    success: (res) => {
      $.cookie("token", res.token);
      setUsername(name);
      UpdateState()
    }
  });
}

function signin() {
  var name = $("#ipUsername").val();
  $.ajax({
    url: "/signin",
    type: "POST",
    headers: {
      user: name
    },
    success: () => {
      setUsername(name);
      UpdateState();
    },
    error: () => {
      console.log("user already exists");
    }
  });
}

function logout() {
  $.ajax({
    url: "/logout",
    type: "POST",
    success: () => {
      localStorage.removeItem("username");
      UpdateState();
    },
    error: () => {
      console.log("cannot log out");
    }
  });
}


function setUsername(username) {
  if(!username) {
    username = localStorage.getItem("username");
  } else {
    localStorage.setItem("username", username);
  }
  $(".leftPanel.hidden").removeClass("hidden");
  $("#username").html(username);
}

$(document).ready(() => {
  UpdateState();
});

// socket.on("newMessage", (msgObj) => {
//   console.log(msgObj);
// })
