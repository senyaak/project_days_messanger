var chosenUser = null;
function setChat(name) {
  chosenUser = name;
  var $chatPanel = $("#chatPanel");
  $chatPanel.empty();

  $.ajax({
    url: `/messages/${name}`,
    type: "get",
    success: (data) => {
      data.forEach((message, i) => {
        console.log("test", message);
      });
    },
    error: () => {
      console.log("Server Unavailable!");
    }
  });
}

function sendMessage(selector) {
  console.log("send message to", chosenUser);
  socket.emit("sendMessage", chosenUser, $(selector).val());
}
