var chosenUser = null;
function setChat(name) {
  ClearChat();
  chosenUser = name;

  $.ajax({
    url: `/messages/${name}`,
    type: "get",
    success: (data) => {
      console.log("test", data);
      data.forEach((msg, i) => {
        newMessage(msg);
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
  var $chatPanel = $("#chatPanel");
  $chatPanel.empty();
  chosenUser = null;
}


function newMessage(msg) {
  var positionClass = msg.from === localStorage.getItem("username")? "messageMine": "messageOther";
  var content = `
  <div class="messageWrapper ${msg.read?"read":"notread"}" data-id="${msg._id}">
    <div class="message ${positionClass}">${msg.message}</div>
    <div>${msg.created_at}</div>
  </div>`;
  $("#chatPanel").append(content);
}
