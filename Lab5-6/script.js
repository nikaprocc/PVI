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
document.getElementById("messages").addEventListener("click", MessagesLink);
document.getElementById("login").addEventListener("click", handleOpenLoginDialogButton);
document.getElementById("login-cancel").addEventListener("click", handleCancelLoginDialogButton);
var studentList = [];
let currIndex = 1;
let counter = 0;
let num = -1;
var currentChat = '0';
let check = -1;
accountAccess();
showAllChats();


function setAccName(){
    var userData = JSON.parse(localStorage.getItem("userData"));
    document.getElementById("acc_name").textContent = (userData) ? userData.name : "";
}

function accountAccess(){
    if(!localStorage.getItem("userData")){
        if(document.getElementById("Chat-w-name")){
        defaultChat();}
        document.getElementById("in-account").style.display = "none";
        document.getElementById("out-account").style.display = "block";
    } else {
        document.getElementById("in-account").style.display = "block";
        document.getElementById("out-account").style.display = "none";
        setAccName();
    }
}



if( window.location.href == "http://localhost:5000/" || window.location.href == "http://localhost:5000" ){
fetch('/students')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(students => {
    var temp = students;
    studentList = [];
    counter = 0;
    for(let i = 0; i < temp.length; i++){
        studentList.push(temp[i]);
        counter++;
        updateTable();
    }
    if(currIndex > (studentList.length/4)+1)
    {currIndex = studentList.length/4+1;}
    showPage(currIndex);

  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });}

  if(localStorage.getItem("userData")){
  var xhrr = new XMLHttpRequest();
  xhrr.open("POST", "/unreadMessages", true);
  xhrr.setRequestHeader("Content-Type", "application/json");
  xhrr.send(JSON.stringify({userId : JSON.parse(localStorage.getItem("userData")).id}));

 xhrr.onload = function () {
      if (xhrr.status === 200) {
          var response = JSON.parse(xhrr.responseText);
          var div = document.getElementById("profile-notifications");
          while (div.firstChild) { 
            div.firstChild.remove(); 
            }
          if (response.valid) { 
            response.messages.forEach(message => {
                const truncatedContent = message.content.length > 40 ? message.content.substring(0, 40) + '...' : message.content;
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message-container1', 'd-flex', 'mb-2');
            
                const senderDiv = document.createElement('div');
                senderDiv.classList.add('sender-container1', 'flex-column', 'position-relative', 'text-center');
            
                const senderImg = document.createElement('img');
                senderImg.src = './images/notification.png';
                senderImg.classList.add('sender-image1', 'notif-img');
            
                const senderLabel = document.createElement('label');
                senderLabel.classList.add('sender-name1');
                senderLabel.textContent = message.senderName;
            
                senderDiv.appendChild(senderImg);
                senderDiv.appendChild(senderLabel);
            
                const messageContentDiv = document.createElement('div');
                messageContentDiv.classList.add('message-content1', 'message');
            
                const messageText = document.createElement('p');
                messageText.classList.add('message-text1');
                messageText.textContent = truncatedContent;
            
                messageContentDiv.appendChild(messageText);
            
                messageDiv.appendChild(senderDiv);
                messageDiv.appendChild(messageContentDiv);
            
                div.appendChild(messageDiv);
                document.getElementById("indicator").style.display = "block";
            });
          }else {
            document.getElementById("indicator").style.display = "none";
            div.innerHTML = `<p>No messages</p>`;
          }}};
        }

  function MessagesLink(event){
    window.location.href = "/messages.html";
  }

function handleAddButtonClick(){
    check = -1;
    document.getElementById("stinfo-action").textContent = "Add Student";
    if(interactionDialog === null){
        return ;
    }
    interactionDialog.showModal();
    }

function handleOpenLoginDialogButton(event){
    var login = document.getElementById("login-dialog");
    if(login == null){
        return;
    } 
    login.showModal();
}
function handleCancelLoginDialogButton(){
    var login = document.getElementById("login-dialog");
    if(login == null){
        return;
    } 
    login.close();
    clearLogin();
}

function handleOpenRegisterButton(){
    var r = document.getElementById("register-dialog");
    if(r == null){
        return;
    }
    r.showModal();
    handleCancelLoginDialogButton();
}
function handleCancelRegistrationButton(){
    var r = document.getElementById("register-dialog");
    if(r == null){
        return;
    } 
    r.close();
    clearRegister();
}
function handleCancelButtonClick(event){
    if(interactionDialog === null){
        return;
    }
    interactionDialog.close();
    clearDialog();
}

function clearRegister(){
    document.getElementById("register-username").value = "";
    document.getElementById("register-name").value = "";   
    document.getElementById("register-surname").value = "";
    document.getElementById("register-password").value = "";
}

function clearLogin(){
    document.getElementById("login-username").value = "";
    document.getElementById("login-password").value = "";
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
    clearLogin();
    validLogin();
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

function LogOut(event){
    account = [];
    localStorage.clear();
    accountAccess();
    setAccName();
    showAllChats();
    if(document.getElementById("Chat-w-name")){
        defaultChat();
    }


}

function loginValidation(event){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/loginValidation", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({username: document.getElementById("login-username").value, password: document.getElementById("login-password").value}));
   xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
               localStorage.setItem('userData', JSON.stringify( { name: response.name, username: response.username, id: response.id }));
               setAccName();
               clearLogin();
               handleCancelLoginDialogButton();
                accountAccess();
                showAllChats();
            } else {
                validLogin();
            }
        } else {
            alert('Error: ' + xhr.statusText);
        }
    };
}

function handleRegisterButton(event){
    var us = document.getElementById("register-username");
    var n = document.getElementById("register-name");
    var sn = document.getElementById("register-surname");
    var ps = document.getElementById("register-password");
    if(invalidRegister(us, n, sn, ps)){return;}

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/registerValidation", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({username: us.value, password: ps.value, name:n.value, surname: sn.value}));
   xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
                var account = { name: response.name, username: response.username, id: response.id};
                localStorage.setItem('userData', JSON.stringify(account));
                setAccName();
                clearRegister();
                handleCancelRegistrationButton();
                accountAccess();
                showAllChats();
            } else {
                alert(response.message);
            }
        } else {
            alert('Error: ' + xhr.statusText);
        }
    };
}

function invalidRegister(us, n, sn, ps){
    if(!us.value){us.style.borderColor = "red"; return 1;}
    if(!n.value){n.style.borderColor = "red"; return 1;}
    if(!sn.value){sn.style.borderColor = "red"; return 1;}
    if(!ps.value){ps.style.borderColor = "red"; return 1;}
    if(ps.value.length < 8){ps.style.borderColor = "red"; return 1;}
    return 0;
}

function validRegister(){
    document.getElementById("register-username").style.borderColor = "red";
    document.getElementById("register-name").style.borderColor = "red";
    document.getElementById("register-surname").style.borderColor = "red";
    document.getElementById("register-password").style.borderColor = "red";
}

function invalidLogin(){
    document.getElementById("login-username").style.borderColor = "red";
    document.getElementById("login-password").style.borderColor = "red";
}
function validLogin(){
    document.getElementById("login-username").style.borderColor = "black";
    document.getElementById("login-password").style.borderColor = "black";
}

function newChatOpenDialog(event){
    var g = document.getElementById("create-chat-dialog");
    if(!g){
        return;
    }
    g.showModal();
}
function showAddUserToChatDialog(event){
    var g = document.getElementById("add-user-dialog");
    if(!g){
        return;
    }
    g.showModal();
}
function closeAddUserToChatDialog(event){
    var g = document.getElementById("add-user-dialog");
    if(!g){
        return;
    }
    g.close();
}

function cancelChatCreationButton(event){
    var g = document.getElementById("create-chat-dialog");
    if(!g){
        return;
    }
    document.getElementById("chat-name-enter").value = "";
    g.close();
}

function createNewChat(event){
    var name = document.getElementById("chat-name-enter").value;
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/createChat", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({name: name, id: JSON.parse(localStorage.getItem("userData")).id}));
   xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
                cancelChatCreationButton();

            } else {
                alert(response.message);
            }
        } else {
        }
    };
}

function showAllChats(event){

    if(document.getElementById("account-chat-list") && localStorage.getItem("userData")){
    var element = document.getElementById("account-chat-list"); 
    while (element.firstChild) { 
    element.firstChild.remove(); 
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/getChats", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({id:JSON.parse(localStorage.getItem("userData")).id}));
   xhr.onload = function() {
        if (xhr.status == 200) {
            console.log(xhr.responseText);
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
            var chats = response.userChats;
            localStorage.setItem('chatInfo', JSON.stringify(response.userChats));
            if(chats == 0){return;}
            
            chats.forEach(function(chat) {
                    if (response.valid) {
                    var li = document.createElement("li");
                    var button = document.createElement("button");
                    button.id = "chat-" + chat.id;
                    button.classList.add("chat-choice-button");
                    var img = document.createElement("img");
                    img.src = "./images/chaticon.png";
                    img.classList.add("chat-image-icon");
                    var label = document.createElement("label");
                    label.textContent = chat.name;
                    
                    button.appendChild(img);
                    button.appendChild(label);
                    li.appendChild(button);
                    element.appendChild(li);
                    button.addEventListener("click", showChat);
                }
            });
        }
        }
    };
}
}

function defaultChat(){
    document.getElementById("Chat-w-name").textContent = "Chat room";
    document.getElementById("chat-window1").visibility = "hidden";
}
function showMembers(event){
    var id = parseInt(event.target.id.split("-")[1]);
    var chatInfo = JSON.parse(localStorage.getItem("chatInfo"));
if (chatInfo) {
    var chat = chatInfo.find(chat => chat.id === id);
    if (chat && chat.members) {
        var div = document.getElementById("memeners");
        while (div.firstChild) { 
            div.firstChild.remove(); 
            }
            var f = (chat.members.length)? chat.members.length : 1;
        for (let i = 0; i < f; i++) {
            var img = document.createElement("img");
            img.src = "./images/icon.jpg";
            img.classList.add("chatroom-icons");
            div.appendChild(img);
        }
    } }
   /* console.log(chat.members);
    if(chat){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/getNames", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ids: chat.members}));
       xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.valid) {
                var div = document.getElementById("memeners");
                while (div.firstChild) { 
                    div.firstChild.remove(); 
                    }
                 //   <img src="./images/icon.jpg" class="chatroom-icons">
                 for(let i = 0; i<response.userNames.length; i++){
                    var img = document.createElement("img");
                    img.src = "./images/icon.jpg";
                    img.classList.add("chatroom-icons");
    
                    var abbr = document.createElement("abbr");
                    abbr.title = userName;
                    abbr.textContent = userName;
    
                    div.appendChild(img);
                    div.appendChild(abbr);}
                 } 
            } else {

            }}
    };*/
}


function showChat(event){
    var id = parseInt(event.target.id.split("-")[1]);
    currentChat = id;
    var chatInfo = JSON.parse(localStorage.getItem("chatInfo"));
    var div = document.getElementById("chat-view-window");
    while (div.firstChild) { 
      div.firstChild.remove(); 
      }
    if (chatInfo) {
        var chat = chatInfo.find(chat => chat.id === id);
        if (chat) {
            var chatName = chat.name;
            document.getElementById("Chat-w-name").textContent = chatName;
            showMembers(event);
            document.getElementById("chat-window1").visibility = "visible";
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/getMessages', true)
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify({chatId: currentChat,  userId: JSON.parse(localStorage.getItem("userData")).id, }));
            xhr.onload = function () {
                if (xhr.status == 200) {
                    var response = JSON.parse(xhr.responseText);
                    if (response.valid) {
                    var area = document.getElementById("chat-view-window");
                    area.innerHTML = ''; // Clear previous messages

                    response.messages.forEach(function (message) {
                        const messageDiv = document.createElement('div');
                        messageDiv.classList.add('message-div');

                        const headerDiv = document.createElement('div');
                        headerDiv.style.height = '40px';

                        const iconDiv = document.createElement('div');
                        iconDiv.classList.add('message-icon');

                        const img = document.createElement('img');
                        img.src = './images/icon.jpg';
                        img.classList.add('chatroom-icons');

                        const label = document.createElement('label');
                        label.textContent = message.senderName;

                        iconDiv.appendChild(img);
                        iconDiv.appendChild(label);

                        headerDiv.appendChild(iconDiv);

                        const messageMessageDiv = document.createElement('div');
                        messageMessageDiv.classList.add('message-message');

                        const messageContext = document.createElement('p');
                        messageContext.classList.add('message-context');
                        messageContext.textContent = message.content;

                        messageMessageDiv.appendChild(messageContext);

                        messageDiv.appendChild(headerDiv);
                        messageDiv.appendChild(messageMessageDiv);

                        area.appendChild(messageDiv);
                
                    });
                        }
            }
        }; 
    }
}
   
}

if(addB){
addB.addEventListener("click", handleAddButtonClick);}
if(closeInfoDialog){
closeInfoDialog.addEventListener("click", handleCancelButtonClick);}
if(okInfoDialog){
okInfoDialog.addEventListener("click", handleSaveButtonClick);}
if(saveInfoDialog){
saveInfoDialog.addEventListener("click", handleSaveButtonClick);}
if(pleft){
pleft.addEventListener("click", handleLeftClickButton);}
if(pright){
pright.addEventListener("click", handleRightClickButton);}
if(document.getElementById("new-chat-button")){
    document.getElementById("new-chat-button").addEventListener("click", newChatOpenDialog);
}
if(document.getElementById("cancel-create-chat")){
    document.getElementById("cancel-create-chat").addEventListener("click", cancelChatCreationButton);
}
if(document.getElementById("create-chat")) {
    document.getElementById("create-chat").addEventListener("click", createNewChat);
}
document.getElementById("logout").addEventListener("click", LogOut);
document.getElementById("register-button").addEventListener("click", handleRegisterButton);
document.getElementById("register-cancel").addEventListener("click", handleCancelRegistrationButton)
document.getElementById("register-move-button").addEventListener("click", handleOpenRegisterButton);
document.getElementById("acc_icon").addEventListener("click", openContext); 
document.getElementById("acc-notif").addEventListener("click", openContext);
document.getElementById("login-button").addEventListener("click", loginValidation);
if(document.getElementById("delete-cancel1")){
document.getElementById("delete-cancel1").addEventListener("click", handleCancelDelButtonClick);}
if(document.getElementById("delete-cancel2")){
document.getElementById("delete-cancel2").addEventListener("click", handleCancelDelButtonClick);}
if(document.getElementById("delete-ok")){
document.getElementById("delete-ok").addEventListener("click", handleDeleteConfirmedButtonClick);}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("worker.js").then(registration => {
        console.log("SW Registered!");
        console.log(registration);
    }).catch(error => {
        console.log("SW Registration failed!");
    });
}


const socket = io();


function sendMessage(event) {
    event.preventDefault();
    const messageContent = document.getElementById('message-context');
    if (messageContent.value) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/sendMessage', true)
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ chatId: currentChat, userId: JSON.parse(localStorage.getItem("userData")).id, text: messageContent.value}));
        xhr.onload = function () {
            if (xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.valid) {
                    console.log(response.sender);
                    socket.emit('chat message', messageContent.value, response.sender, response.chatId);
                    messageContent.value = '';
                }} else {
                    console.log(JSON.parse(xhr.responseText).message);
                }}
    }

}


socket.on('chat message', function(msg, sender, chatId) {
    if (window.location.pathname === '/messages.html' && chatId == currentChat) {
    var area = document.getElementById("chat-view-window");
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message-div');

            const headerDiv = document.createElement('div');
            headerDiv.style.height = '40px';

            const iconDiv = document.createElement('div');
            iconDiv.classList.add('message-icon');

            const img = document.createElement('img');
            img.src = './images/icon.jpg';
            img.classList.add('chatroom-icons');

            const label = document.createElement('label');
            label.textContent = sender;

            iconDiv.appendChild(img);
            iconDiv.appendChild(label);

            headerDiv.appendChild(iconDiv);

            const messageMessageDiv = document.createElement('div');
            messageMessageDiv.classList.add('message-message');

            const messageContext = document.createElement('p');
            messageContext.classList.add('message-context');
            messageContext.textContent = msg;

            messageMessageDiv.appendChild(messageContext);

            messageDiv.appendChild(headerDiv);
            messageDiv.appendChild(messageMessageDiv);

            area.appendChild(messageDiv);}
});


if(document.getElementById("send-message")){
document.getElementById("send-message").addEventListener("click", sendMessage);}
if(document.getElementById("add-memeber")){
    document.getElementById("add-memeber").addEventListener("click", showAddUserToChatDialog);
    document.getElementById("close-dialog-btn").addEventListener("click", closeAddUserToChatDialog);}