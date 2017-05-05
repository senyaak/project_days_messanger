
// container - HTMLElement
// openDialogFn - function takes user name an argument
function CreateUserlist(container, openDialogFn) {
  $(container).append(`
    <ul id="contactList">
    </ul>
  `);

  $.ajax({
    url: "/contactlist",
    type: "get",
    success: (users) => {
      users.forEach((user, i) => {
        CreateListElement(user, openDialogFn);
      });

      /// add users who send messages but not in contact list
      $.ajax({
        url: "/messages",
        type: "get",
        success: (messages) => {
          messages.forEach((msg, i) => {
            if(msg.to === localStorage.getItem("username") && users.indexOf(msg.from) === -1) {
              CreateListElement(msg.from, openDialogFn);
              users.push(msg.from);
            }
          });
          localStorage.setItem("userList", users);
        },
        error: () => {
          console.log("Server Unavailable!");
        }
      });
    },
    error: () => {
      console.log("Server Unavailable!");
    }
  });
}

function ClearUserlist(container) {
  $(container).empty();
}

function AddNewContact(input, openDialogFn) {
  var name = $(input).val()
  $.ajax({
    url: `/contactlist/${name}`,
    type: "put",
    success: (data,resMessage,response) => {
      if(response.status !== 304) {
        CreateListElement(name, openDialogFn);
      }
    },
    error: () => {
      $(input).val("User not found")
      console.log("Server Unavailable!");
    }
  });
}

function DeleteContact(name) {
  $.ajax({
    url: `/contactlist/${name}`,
    type: "delete",
    success: (data,resMessage,response) => {
      if(response.status !== 304) {
        $(`.contact-${name}`).remove()
        if(chosenUser === name) {
          ClearChat();
        }
      }
    },
    error: () => {
      console.log("Server Unavailable!");
    }
  });
}


function CreateListElement(user, openDialogFn) {
  $("#contactList").append(`
    <li class="contact contact-${user}">
        <span class="dialog-changer">${user}</span>
        <button class ="button" onclick="DeleteContact('${user}')"> x </button>
    </li>
  `);
  if(openDialogFn) {
    $(`.contact-${user} .dialog-changer`).click(() => {
      openDialogFn(user);
    });
  }
}
