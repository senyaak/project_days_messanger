var chosenUser = null;
function setChat(name) {
  chosenUser = name;
  var $chatPanel = $("#chatPanel");
  $chatPanel.empty();

  $.ajax({
    url: `/messages/${name}`,
    type: "get",
    success: (data) => {
      console.log("test", data);
      data.forEach((message, i) => {
        // TODO add messages
      });
    },
    error: () => {
      console.log("Server Unavailable!");
    }
  });
}

function sendMessage(selector) {
  if(chosenUser !== null) {
    console.log("send message to", chosenUser);
    socket.emit("sendMessage", chosenUser, $(selector).val());
    $(selector).val("");
  } else {
    console.log("user not set");
  }
}


function ClearChat() {
  chosenUser = null;
  // TODO remove messages
}
