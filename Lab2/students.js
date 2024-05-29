function openAddStudent(event){
	var dialog = document.getElementById("add-dialog");
  clearDialog();
	if(!dialog){
		return;
	}
	dialog.showModal();
}
function closeAddStudent(event){
	var dialog = document.getElementById("add-dialog");
	if(!dialog){
		return;
	}
	dialog.close();
}
document.getElementById("add-student").addEventListener("click", openAddStudent);
document.getElementById("cancel-button").addEventListener("click", closeAddStudent);


function clearDialog(){
  document.getElementById("group-name").selectedIndex = 0;
  document.getElementById("fst-name").value = "";
  document.getElementById("snd-name").value = "";
  document.getElementById("gender").selectedIndex = 0;
  document.getElementById("date").value = "";
}

var currIndex = 1;
//var counter = 0;

function EditButtonClick(event) {
  // Set dialog title to indicate editing mode
  document.getElementById("title-add-edit").textContent = "Edit Student";

  // Find the row associated with the edit button
  const row = event.target.closest('tr');
  if (!row) return; // Exit if the row is not found

  // Get the data from the row
  const cells = row.querySelectorAll('td');
  const group = cells[1].textContent;
  const fullName = cells[2].textContent.split(' ');
  const firstName = fullName[0];
  const lastName = fullName[1];
  const gender = cells[3].textContent;
  const birthday = cells[4].textContent;

  // Populate the dialog with existing data
  document.getElementById('group-name').value = group;
  document.getElementById('fst-name').value = firstName;
  document.getElementById('snd-name').value = lastName;
  document.getElementById('gender').value = gender;
  document.getElementById('date').value = birthday;

  // Save the reference to the edited row
  row.setAttribute('data-editing', 'true');

  // Open the dialog for editing
  const dialog = document.getElementById('add-dialog');
  if (!dialog) return;
  dialog.showModal();
}

function DeleteButtonClick(event){
  // Show the confirmation dialog
  const deleteDialog = document.getElementById("delete-warn");
  if (!deleteDialog) return; // Exit if the dialog is not found
  deleteDialog.showModal();

  // Get the row associated with the delete button
  const row = event.target.closest('tr');
  if (!row) return; // Exit if the row is not found

  // Set up the warning message in the confirmation dialog
  const studentName = row.querySelectorAll('td')[2].textContent;
  document.getElementById("question-view").textContent = `Are you sure you want to delete ${studentName}?`;

  // Handle the click event on the "Ok" button in the confirmation dialog
  const deleteOkButton = document.getElementById("delete-ok");
  deleteOkButton.addEventListener("click", function() {
    // Remove the row from the table
    row.remove();
    // Close the confirmation dialog
    deleteDialog.close();
  });

  // Handle the click event on the "Cancel" button in the confirmation dialog
  const deleteCancelButton = document.getElementById("delete-cancel2");
  deleteCancelButton.addEventListener("click", function() {
    // Close the confirmation dialog without deleting the student
    deleteDialog.close();
  });
}

async function saveStudentToServer(data) {
  try {
    const response = await fetch('url_to_your_server_endpoint', {
      method: 'POST', // або 'PUT'
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    console.log('Server response:', responseData);
  } catch (error) {
    console.error('Error saving student to server:', error);
  }
}


function createOrUpdateStudent() {
  const groupSelect = document.getElementById("group-name");
  const firstNameInput = document.getElementById("fst-name");
  const lastNameInput = document.getElementById("snd-name");
  const genderSelect = document.getElementById("gender");
  const birthdayInput = document.getElementById("date");


    if (groupSelect.value === "---") {
    document.getElementById("group-error").textContent = "Please select a group.";
    groupSelect.style.borderColor = "red";
    return;
  } else {
    document.getElementById("group-error").textContent = "";
    groupSelect.style.borderColor = "";
  }


  let firstNameValue = firstNameInput.value.trim();
  if (!firstNameValue.match(/^[a-zA-Z]+$/)) {
    document.getElementById("fst-name-error").textContent = "Please enter a valid first name (no digits).";
    firstNameInput.style.borderColor = "red";
    return;
  } else {
    document.getElementById("fst-name-error").textContent = "";
    firstNameInput.style.borderColor = "";
  }

  let lastNameValue = lastNameInput.value.trim();
  if (!lastNameValue.match(/^[a-zA-Z]+$/)) {
    document.getElementById("snd-name-error").textContent = "Please enter a valid last name (no digits).";
    lastNameInput.style.borderColor = "red";
    return;
  } else {
    document.getElementById("snd-name-error").textContent = "";
    lastNameInput.style.borderColor = "";
  }


  if (genderSelect.value === "---") {
    document.getElementById("gender-error").textContent = "Please select a gender.";
    genderSelect.style.borderColor = "red";
    return;
  } else {
    document.getElementById("gender-error").textContent = "";
    genderSelect.style.borderColor = "";
  }


  const today = new Date();
  const selectedDate = new Date(birthdayInput.value);
  const age = today.getFullYear() - selectedDate.getFullYear();
  const monthDiff = today.getMonth() - selectedDate.getMonth();
  const dayDiff = today.getDate() - selectedDate.getDate();
  const isUnderage = age < 15 || (age === 15 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));
  const isOver90 = age > 90;

  if (isUnderage || isOver90) {
    document.getElementById("date-error").textContent = "Please select a valid birthday.";
    birthdayInput.style.borderColor = "red";
    return;
  } else {
    document.getElementById("date-error").textContent = "";
    birthdayInput.style.borderColor = "";
  }


  const group = groupSelect.value;
  const firstName = firstNameInput.value;
  const lastName = lastNameInput.value;
  const gender = genderSelect.value;
  const birthday = birthdayInput.value;


  /**************************************************************/
  //рядок даних, що буде передаватись з даної форми на сервер
  const dataString = `Group: ${group}, First Name: ${firstName}, Last Name: ${lastName}, Gender: ${gender}, Birthday: ${birthday}`;
  console.log(dataString);
  /**************************************************************/

  const data = {
    group,
    firstName,
    lastName,
    gender,
    birthday
  };

  // Відправляємо дані на сервер
  saveStudentToServer(data);



  const tableBody = document.querySelector("table tbody");
  if (!tableBody) {
    console.error("Error: tbody element not found in the table");
    return;
  }

  const isEditing = document.querySelector('tr[data-editing="true"]');
  if (isEditing) {
    // Update existing student
    const cells = isEditing.querySelectorAll('td');
    cells[1].textContent = group;
    cells[2].textContent = firstName + " " + lastName;
    cells[3].textContent = gender;
    cells[4].textContent = birthday;
    isEditing.removeAttribute('data-editing'); // Reset editing flag
  } else {
    // Create new student
    // Find the first empty row
    let emptyRow = null;
    for (const row of tableBody.querySelectorAll("tr")) {
      let isEmpty = true;
      row.querySelectorAll("td").forEach(cell => {
        if (cell.textContent.trim() !== "") {
          isEmpty = false;
        }
      });
      if (isEmpty) {
        emptyRow = row;
        break;
      }
    }

    // If no empty row found, create a new one at the end
    if (!emptyRow) {
      currIndex++;
      const newTbody = document.createElement("tbody");
      newTbody.classList.add("page-" + currIndex);
      document.querySelector("table").appendChild(newTbody);

      emptyRow = newTbody.insertRow(-1);
      const checkboxCell = emptyRow.insertCell(0);
      checkboxCell.innerHTML = "<input type='checkbox'>";
      for (let i = 1; i<7; i++) {
        emptyRow.insertCell(i);
      }
    }

    const cells = emptyRow.querySelectorAll("td");
    const statusImage = document.createElement('img');
    statusImage.src = 'grey_circle.svg';
    statusImage.alt = 'Student Status';
    statusImage.classList.add('centered-image');

    cells[1].textContent = group;
    cells[2].textContent = firstName + " " + lastName;
    cells[3].textContent = gender;
    cells[4].textContent = birthday;
    cells[5].innerHTML = '';
    cells[5].appendChild(statusImage);

    var nediv = document.createElement("div");
    cells[6].appendChild(nediv);
    nediv.className = "last-column";
    var editEl = document.createElement("button");
    editEl.id="edit-button-id";
    var delEl = document.createElement("button");
    delEl.id="del-button-id";
    var ico = document.createElement("img");
    ico.src = 'pen.png';
    ico.alt = 'Student Status';
    ico.id = "pen-id";
    ico.classList.add('centered-image');

    editEl.className = "table-button";
    delEl.className = "table-button";
    delEl.textContent = "x";

    nediv.appendChild(editEl);
    nediv.appendChild(delEl);
    editEl.appendChild(ico);

    editEl.addEventListener("click", EditButtonClick);
    delEl.addEventListener("click", DeleteButtonClick);
  }

  clearDialog();
  document.getElementById("add-dialog").close();
}

document.getElementById("create-button").addEventListener("click", createOrUpdateStudent);



function openContext(event) {
  const target = event.target;
  const profileMenu = document.getElementById("profile-menu");

  // Calculate menu position based on clicked element
  const elementRect = target.getBoundingClientRect();
  const { left: x, top: y, height } = elementRect;

  let adjustedX = x;
  let adjustedY = y + height;

  // Adjust position based on clicked element (icon or name)
  if (target.id === "icon-png") {
    adjustedX -= 20; // Shift left for icon's positioning
        document.addEventListener("click", closeMenu);
  } else if (target.id === "acc_name") {
    adjustedY += 7;  // Shift down slightly for name's positioning
  } else {
    // Handle unexpected clicks (optional: log or ignore)
    console.warn("Unexpected element clicked within openContext:", target);
    return;
  }

  // Show and position the menu
  profileMenu.style.left = `${adjustedX}px`; // Template literal for cleaner string formatting
  profileMenu.style.top = `${adjustedY}px`;
  profileMenu.style.display = "block";

}

function closeMenu(event) {
    var target = event.target;
    var menu = document.getElementById("profile-menu");
    
    // Перевіряємо, чи клік був не на самому меню та не на acc_icon
    if (!menu.contains(target) && target.id !== "icon-png") {
        menu.style.display = "none";
        document.removeEventListener("click", closeMenu);
    }
}

// Attach event listeners to icon and name elements
document.getElementById("icon-png").addEventListener("click", openContext);



 function openContext(event) {
      const target = event.target;
      const profileMenu = document.getElementById("profile-menu");

      // Calculate menu position based on clicked element
      const elementRect = target.getBoundingClientRect();
      const { left: x, top: y, height } = elementRect;

      let adjustedX = x;
      let adjustedY = y + height;

      // Adjust position based on clicked element (icon or name)
      if (target.id === "icon-png") {
        adjustedX -= 20; // Shift left for icon's positioning
        document.addEventListener("click", closeMenu);
      } else if (target.id === "acc_name") {
        adjustedY += 7;  // Shift down slightly for name's positioning
      } else {
        // Handle unexpected clicks (optional: log or ignore)
        console.warn("Unexpected element clicked within openContext:", target);
        return;
      }

      // Show and position the menu
      profileMenu.style.left = `${adjustedX}px`; // Template literal for cleaner string formatting
      profileMenu.style.top = `${adjustedY}px`;
      profileMenu.style.display = "block";

    }

    function closeMenu(event) {
      var target = event.target;
      var menu = document.getElementById("profile-menu");

      // Перевіряємо, чи клік був не на самому меню та не на acc_icon
      if (!menu.contains(target) && target.id !== "icon-png") {
        menu.style.display = "none";
        document.removeEventListener("click", closeMenu);
      }
    }

    // Attach event listeners to icon and name elements
    document.getElementById("icon-png").addEventListener("click", openContext);


    document.getElementById("bell-icon").addEventListener("mouseover", function() {
      // Show the red circle
      document.getElementById("red-circle").style.display = "block";
    });

    // Hiding the red circle on mouseout from gg-bell icon
    document.getElementById("bell-icon").addEventListener("mouseout", function() {
      // Hide the red circle
      document.getElementById("red-circle").style.display = "none";
    });



 function openContext2(event) {
      const target = event.target;
      const profileMenu = document.getElementById("profile-notifications");

      // Calculate menu position based on clicked element
      const elementRect = target.getBoundingClientRect();
      const { left: x, top: y, height } = elementRect;

      let adjustedX = x;
      let adjustedY = y + height;

      // Adjust position based on clicked element (icon or name)
      if (target.id === "gg-bell") {
        adjustedX -= 20; // Shift left for icon's positioning
        document.addEventListener("click", closeMenu);
      } else {
        // Handle unexpected clicks (optional: log or ignore)
        console.warn("Unexpected element clicked within openContext:", target);
        return;
      }

      // Show and position the menu
      profileMenu.style.left = `${adjustedX}px`; // Template literal for cleaner string formatting
      profileMenu.style.top = `${adjustedY}px`;
      profileMenu.style.display = "block";

    }

    function closeMenu2(event) {
      var target = event.target;
      var menu = document.getElementById("profile-notifications");

      // Перевіряємо, чи клік був не на самому меню та не на acc_icon
      if (!menu.contains(target) && target.id !== "gg-bell") {
        menu.style.display = "none";
        document.removeEventListener("click", closeMenu2);
      }
    }

    // Attach event listeners to icon and name elements
    document.getElementById("gg-bell").addEventListener("click", openContext2);