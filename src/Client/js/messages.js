var chosenUser = null;
function setChat(name) {
  ClearChat();
  chosenUser = name;
  $("#chatPartner").html(name);

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
  $("#chatPartner").empty();
  chosenUser = null;
}


function newMessage(msg) {
  var positionClass = msg.from === localStorage.getItem("username")? "messageMine": "messageOther";
  var content = `
  <div class="messageWrapper" data-id="${msg._id}">
    <div class="message ${positionClass}">
      ${msg.message}
      <div>
        <span class="messageRead">${msg.read?"gelesen":"nicht gelesen"}</span>
        <span class="messageTime">${msg.created_at}</span>
      </div>
    </div>
    </div>`;
  $("#chatPanel").append(content);
}
