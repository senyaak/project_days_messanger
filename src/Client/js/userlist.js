
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
    success: (data) => {
      data.forEach((user, i) => {
        CreateListElement(user, openDialogFn);
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
          clearChat();
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
    <li class="contact-${user}">
      <span class="dialog-changer">${user}</span> <button onclick="DeleteContact('${user}')"> - </button>
    </li>
  `);
  if(openDialogFn) {
    $(`.contact-${user} .dialog-changer`).click(() => {
      openDialogFn(user);
    });
  }
}
