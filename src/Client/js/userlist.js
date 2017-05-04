
// container - HTMLElement
// openDialogFn - function takes user name an argument
function CreateUserlist(container, openDialogFn) {
  console.log("start", $(container))
  $(container).append(`
    <ul id="contactList">
    </ul>
  `);

  $.ajax({
    url: "/contactlist",
    type: "get",
    success: (data) => {
      data.forEach((user, i) => {
        $("#contactList").append(`
          <li class="contact-${i}">
            ${user}
          </li>
        `);

        if(openDialogFn) {
          $(`.contact-${name}`).click(() => {
            openDialogFn(user);
          });
        }
      });
    },
    error: () => {
      console.log("Server Unavailable!");
    }
  });

}
