var socket = io();

function UpdateState() {
  if($.cookie("token")) {
    socket.emit("loggedin", $.cookie("token"));
    setUsername();
    enterChatroom();
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
    },
    error: () => {
      $("#ipUsername").val("User not found");
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
      leaveChatroom();
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
  $("#userPanel .label").html(username);
}

$(document).ready(() => {
  UpdateState();
});

// socket.on("newMessage", (msgObj) => {
//   console.log(msgObj);
// })

function enterChatroom(){
  let $loginDialog = $("#loginDialog");
  let $chatroomAnchor = $('#chatroomAnchor');

  $chatroomAnchor.css("marginLeft", 0);
  $loginDialog.css({margin: "0px 0px 0px "+$loginDialog.css('margin-left')+"px"});
  $loginDialog.animate({marginLeft: "-300px"}, 300, () => {
    $loginDialog.css("display", "none");;
    //$('body').attr("background", "");
    $chatroomAnchor.css("visibility", "visible");
  });

  CreateUserlist($("#contactPanel"), setChat);
}


function leaveChatroom() {
  let $loginDialog = $("#loginDialog");
  let $chatroomAnchor = $('#chatroomAnchor');

  $loginDialog.css("display", "flex");;
  $chatroomAnchor.animate({marginLeft: "-300px"}, 300, () => {
    $chatroomAnchor.css("visibility", "hidden");
  });
  $loginDialog.animate({marginLeft: "300px"}, 300, () => {
    $loginDialog.css("margin", "auto");
  });
  ClearUserlist($("#contactPanel"));
}
