class Student{
     constructor(firstName, lastName, groupName, gender, birthDate, id) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.groupName = groupName;
        this.gender = gender;
        this.birthDate = birthDate;
        this.id = id;
    }

}

const addB = document.getElementById("addButton");
const interactionDialog = document.getElementById("add-edit-st");
const closeInfoDialog = document.getElementById("stinfo-cancel");
const okInfoDialog = document.getElementById("stinfo-ok");
const saveInfoDialog = document.getElementById("stinfo-save");
const pleft = document.getElementById("pages-left");
const pright = document.getElementById("pages-right");
const one = document.getElementById("pages-left");
const delCancel1 = document.getElementById("delete-cancel1");
const delCancel2 = document.getElementById("delete-cancel2");
const delConfirm = document.getElementById("delete-ok");
const deleteDialog = document.getElementById("delete-confirmation");

var studentList = [];
let currIndex = 1;
let counter = 0;
let num = -1;
let check = -1;

function handleAddButtonClick(){
    clearInvalidFields();
    check = -1;
    document.getElementById("stinfo-action").textContent = "Add Student";
    if(interactionDialog === null){
        return ;
    }
    interactionDialog.showModal();
    }

function handleCancelButtonClick(){
    if(interactionDialog === null){
        return;
    }
    interactionDialog.close();
    clearDialog();
}


function handleSaveButtonClick(event, i) {
    event.preventDefault(); 

    var group = document.getElementById('forms-groupName').value;
    var name = document.getElementById('forms-firstName').value;
    var lastname = document.getElementById('forms-lastName').value;
    var gender = document.getElementById('forms-gender').value;
    var date = document.getElementById('forms-birthDate').value;
    let id;

    if(check === -1){
    do {
        id = Math.floor(10000 + Math.random() * 90000);
        idExists = studentList.some(student => student.id === id);
    } while (idExists);
    } else {
        id = studentList[check].id;
    }
    var student = new Student(name, lastname, group, gender, date, id);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/formPost", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(student));

   xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
                if(num===-1){
                    studentList.push(student);
                    counter++;
               }else{
                   studentList[num] = student;
                }
                num = -1;
               updateTable();
               interactionDialog.close();
               showPage(currIndex);
               clearDialog();
            } else {
                console.log(response.message);
                clearInvalidFields();
                highlightInvalidFields(response.invalidFields);
            }
        } else {
            alert('Error: ' + xhr.statusText);
        }
    };
}

function highlightInvalidFields(invalidFields){
    invalidFields.forEach(function(fieldName) {
        var field = document.getElementById('forms-' + fieldName);
        if (field) {
            field.style.border = 'red 1px solid';
        }
    });
}

function clearInvalidFields(){
    document.getElementById("forms-firstName").style.border = 'black 1px solid';
    document.getElementById("forms-lastName").style.border = 'black 1px solid';
    document.getElementById("forms-birthDate").style.border = 'black 1px solid';
}

function clearDialog(){
     document.getElementById("forms-groupName").selectedIndex = 0;
    document.getElementById("forms-firstName").value = "";
    document.getElementById("forms-lastName").value = "";
    document.getElementById("forms-gender").selectedIndex = 0;
    document.getElementById("forms-birthDate").value = 0;
}

function updateTable(){
    var table =  document.getElementById("sec-table");
    if(counter === 4){
        counter = 0;
        var newElement = document.createElement("button");
        newElement.className = "button-style pages-num";
        newElement.style.marginLeft = "8px";
        newElement.textContent = ((studentList.length)/4 + 1).toString();
        newElement.id = "pages-" + ((studentList.length)/4 + 1).toString();
        var reference = document.getElementById("pages-right");
        var parent = document.getElementById("pages");
        parent.insertBefore(newElement, reference);
    }
    if(counter === -1) {
        counter = 3;
        var str = "pages-" + (Math.ceil(studentList.length/4)+1);
        var el = document.getElementById(str);
        el.remove();
    }

}

function showPage(num) {
    var startIndex = (num - 1) * 4;
    var table = document.getElementById("table-show");
    var tableRows = table.querySelectorAll("tr");
    var cells = table.querySelectorAll("tr td");
    cells.forEach(function (cell) {
        cell.textContent = "";
    });

    for (var i = startIndex; i < Math.min(startIndex + 4, studentList.length); i++) {
        var row = tableRows[i % 4 + 1];
        var newElement = document.createElement("input");
        newElement.type = "checkbox";
        newElement.className = "table-boxes";
        newElement.id = "table-boxes-" + i.toString();
        row.cells[0].appendChild(newElement);
        row.cells[1].textContent = studentList[i].groupName;
        row.cells[2].textContent = studentList[i].firstName + " " + studentList[i].lastName;
        row.cells[3].textContent = studentList[i].gender;
        row.cells[4].textContent = studentList[i].birthDate;
        var ne2 = document.createElement("div");
        ne2.className = "status-iden w-2 rounded-circle";
        row.cells[5].appendChild(ne2);

        var nediv = document.createElement("div");
        nediv.className = "last-column";
        row.cells[6].appendChild(nediv);
        var editEl = document.createElement("button");
        var delEl = document.createElement("button");
        var ico = document.createElement("i");
        ico.className = "gg-pen";
        editEl.className = "button-style";
        delEl.className = "button-style";
        delEl.textContent = "x";
        delEl.style.marginLeft = "8px";
        delEl.id = "del-" + (i).toString();
        editEl.id = "edit-" + (i).toString();
        nediv.appendChild(editEl);
        nediv.appendChild(delEl);
        editEl.appendChild(ico);

        editEl.addEventListener("click", handleEditButtonClick);
        delEl.addEventListener("click", handleDeleteButtonClick);

    }
}





function handleLeftClickButton(){
    if(currIndex == 1){
        return;
    }
    else {
        currIndex--;
        showPage(currIndex);
    }
}

function handleRightClickButton(){
    if(currIndex === Math.ceil(studentList.Length/4)){
        return;
    }
    else {
        currIndex++;
       showPage(currIndex);
    }
}


function handleEditButtonClick(event){
 var buttonId = event.currentTarget.id;
 clearInvalidFields()
    document.getElementById("stinfo-action").textContent = "Edit Student";
  if(interactionDialog === null){
        return;
    }
    interactionDialog.showModal();
    var studentIndex = buttonId.split("-")[1];
    check = studentIndex;
    var student = studentList[studentIndex];
    num = studentIndex;

    document.getElementById("forms-groupName").value = student.groupName;
    document.getElementById("forms-firstName").value = student.firstName;
    document.getElementById("forms-lastName").value = student.lastName;
    document.getElementById("forms-gender").value = student.gender;
    document.getElementById("forms-birthDate").value = student.birthDate;

}

function handleDeleteButtonClick(event){
    if(deleteDialog === null){
        return ;
    }
    check = parseInt(event.target.id.split("-")[1]);
    var name = studentList[check].firstName + " " + studentList[check].lastName; 
  document.getElementById("question-view").textContent = "Are you sure you want to delete student " + name + " ?";

    deleteDialog.showModal();
}


    function openContext(event){
    event.preventDefault();
   

  var imageRect = event.target.getBoundingClientRect();

    var x = imageRect.left;
    var y = imageRect.top + imageRect.height;
    var menu;
    if(event.target.id === "acc_icon"){
        menu = document.getElementById("profile-menu");
        document.addEventListener("click", closeMenu);
        x = imageRect.left-20;
    } else {
        menu = document.getElementById("profile-notifications");
        y += 7;
        document.addEventListener("click", closeNotif);
         var screenWidth = window.innerWidth; 

    }
    menu.style.left = x + "px";
    menu.style.top = y + "px";
    menu.style.display = "block";
}


function closeMenu(event) {
    var target = event.target;
    var menu = document.getElementById("profile-menu");
    
    if (!menu.contains(target) && target.id !== "acc_icon") {
        menu.style.display = "none";
        document.removeEventListener("click", closeMenu);
    }
}

function closeNotif(event) {
    var target = event.target;
    var menu = document.getElementById("profile-notifications");
    
    if (!menu.contains(target) && target.id !== "acc-notif") {
        menu.style.display = "none";
        document.removeEventListener("click", closeNotif);
    }
}


function handleCancelDelButtonClick(){
    if(deleteDialog === null){
        return;
    }
    deleteDialog.close();
    clearDialog();
    num = -1;
}

function handleDeleteConfirmedButtonClick(event){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/deleteConf", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({id: studentList[check].id }));
   xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
                studentList.splice(check, 1);
                counter--;
                showPage(currIndex);
                handleCancelDelButtonClick();
                clearDialog();
                updateTable();
            } else {
                console.log(response.message);
            }
        } else {
            alert('Error: ' + xhr.statusText);
        }
    };
}


function handleSumbitFormButtonClick(event) {
      var xhr = new XMLHttpRequest();
    xhr.open("POST", "/confLogin", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var u = document.getElementById("username").value;
    var p = document.getElementById("password").value;
   // User a = new User(u, p);
    var f = {name: u, password: p};
    console.log(u);
    console.log(p);
    xhr.send(JSON.stringify(f));
    //xhr.send(JSON.stringify({id: studentList[check].id }));
   xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
               console.log(response.message);
            } else {
                console.log(response.message);
            }
        } else {
            alert('Error: ' + xhr.statusText);
        }
    };

}

addB.addEventListener("click", handleAddButtonClick);
closeInfoDialog.addEventListener("click", handleCancelButtonClick);
okInfoDialog.addEventListener("click", handleSaveButtonClick);
saveInfoDialog.addEventListener("click", handleSaveButtonClick);
pleft.addEventListener("click", handleLeftClickButton);
pright.addEventListener("click", handleRightClickButton);


document.getElementById("acc_icon").addEventListener("click", openContext); 
document.getElementById("acc-notif").addEventListener("click", openContext);
document.getElementById("delete-cancel1").addEventListener("click", handleCancelDelButtonClick);
document.getElementById("delete-cancel2").addEventListener("click", handleCancelDelButtonClick);
document.getElementById("delete-ok").addEventListener("click", handleDeleteConfirmedButtonClick);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("worker.js").then(registration => {
        console.log("SW Registered!");
        console.log(registration);
    }).catch(error => {
        console.log("SW Registration failed!");
    });
}

document.addEventListener("DOMContentLoaded", function() {
    fetchStudents();
});

function fetchStudents() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/students", true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
                studentList = response.data.map(student => new Student(student.firstName, student.lastName, student.groupName, student.gender, student.birthDate, student.id));
                updateTable();
                showPage(currIndex);
            } else {
                console.log(response.message);
            }
        } else {
            alert('Error: ' + xhr.statusText);
        }
    };
    xhr.send();
}

function updateTable() {
    var table = document.getElementById("sec-table");
    var numPages = Math.ceil(studentList.length / 4);

    // Remove existing page buttons
    var pageButtons = document.querySelectorAll(".pages-num");
    pageButtons.forEach(button => button.remove());

    for (let i = 1; i <= numPages; i++) {
        var newElement = document.createElement("button");
        newElement.className = "button-style pages-num";
        newElement.style.marginLeft = "8px";
        newElement.textContent = i.toString();
        newElement.id = "pages-" + i.toString();
        newElement.addEventListener("click", () => showPage(i));
        var reference = document.getElementById("pages-right");
        var parent = document.getElementById("pages");
        parent.insertBefore(newElement, reference);
    }
}

function showPage(num) {
    currIndex = num;
    var startIndex = (num - 1) * 4;
    var table = document.getElementById("table-show");
    var tableRows = table.querySelectorAll("tr");

    tableRows.forEach((row, index) => {
        if (index > 0) {
            row.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `;
        }
    });

    for (var i = startIndex; i < Math.min(startIndex + 4, studentList.length); i++) {
        var row = tableRows[i % 4 + 1];
        var student = studentList[i];
        var newElement = document.createElement("input");
        newElement.type = "checkbox";
        newElement.className = "table-boxes";
        newElement.id = "table-boxes-" + i.toString();
        row.cells[0].appendChild(newElement);
        row.cells[1].textContent = student.groupName;
        row.cells[2].textContent = student.firstName + " " + student.lastName;
        row.cells[3].textContent = student.gender;

        var birthDate = new Date(student.birthDate);
        var formattedDate = birthDate.toISOString().split('T')[0];
        row.cells[4].textContent = formattedDate;

        var ne2 = document.createElement("div");
        ne2.className = "status-iden w-2 rounded-circle";
        row.cells[5].appendChild(ne2);

        var nediv = document.createElement("div");
        nediv.className = "last-column";
        row.cells[6].appendChild(nediv);
        var editEl = document.createElement("button");
        var delEl = document.createElement("button");
        var ico = document.createElement("i");
        ico.className = "gg-pen";
        editEl.className = "button-style";
        delEl.className = "button-style";
        delEl.textContent = "x";
        delEl.style.marginLeft = "8px";
        delEl.id = "del-" + (i).toString();
        editEl.id = "edit-" + (i).toString();
        nediv.appendChild(editEl);
        nediv.appendChild(delEl);
        editEl.appendChild(ico);

        editEl.addEventListener("click", handleEditButtonClick);
        delEl.addEventListener("click", handleDeleteButtonClick);
    }
}

