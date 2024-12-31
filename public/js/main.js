const socket = io();
const form = document.getElementById("form");
const chatId = form?.dataset.chatId;
const senderId = form?.dataset.senderId;
const userName = form?.dataset.userName;
const input = document.getElementById("input");
const fileInput = document.getElementById("fileInput");
const messages = document.getElementById("messages");
const chatBox = document.getElementById("chat-box");
const images = document.querySelectorAll(".message-image");
const groupNameDiv = document.getElementById("group-name-div");
const groupNameInput = document.getElementById("group-name-input");
const groupNameForm = document.getElementById("group-name");
const cardGroupName = document.getElementById("card-group-name");
const newChatMemberForm = document.getElementById("new-chat");
const user = newChatMemberForm?.dataset.user;
const newMemberPreferencesForm = document.getElementById("preferences");

// Emit an event to join the room when the page loads
socket.emit("join chat", chatId);

chatBox?.scrollTo(0, chatBox.scrollHeight);

images.forEach((img) => {
  img.addEventListener("load", () => {
    img.naturalWidth > img.naturalHeight
      ? img.classList.add("landscape")
      : img.classList.add("portrait");
  });

  // If the image is already loaded (this happens when the image is cached)
  if (img.complete) {
    img.naturalWidth > img.naturalHeight
      ? img.classList.add("landscape")
      : img.classList.add("portrait");
  }
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    if (!input.value && !fileInput.files[0]) return;

    const formData = new FormData();
    formData.append("chatId", chatId); // Chat ID
    formData.append("content", input.value || fileInput.files[0].name); // Text message content
    formData.append("contentType", fileInput.files[0] ? "image" : "text");
    formData.append("senderId", senderId); // Sender ID
    formData.append("userName", userName); // userName

    if (fileInput.files[0]) formData.append("file", fileInput.files[0]);
    console.log(formData);

    // Save the message to the database
    const response = await fetch("/messages/send", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to send message");

    const savedMessage = await response.json();
    socket.emit("chat message", savedMessage, chatId);

    input.value = "";
    fileInput.value = "";

    console.log("Message saved!");
  } catch (error) {
    console.error("Failed to save message: ", error);
  }
});

socket.on("chat message", (msg, chatId) => {
  const divElement = document.querySelector(`div[data-chat-id="${chatId}"]`);
  if (divElement) {
    const message = document.createElement("li");
    const div = document.createElement("div");
    const userName = document.createElement("span");
    const createdAt = document.createElement("span");
    

    if (msg.contentType === "image") {
      const img = document.createElement("img");
      img.src = msg.image;
      img.alt = "User uploaded image";
      message.style.display = "none";
      img.onload = () => {
        img.className = `message-image ${
          img.naturalWidth > img.naturalHeight ? "landscape" : "portrait"
        }`;
        message.style.display = "block";
      };
      message.appendChild(img);
    } else {
      message.textContent = msg.content;
    }
    userName.textContent = `${msg.senderId.userName} `;
    userName.className = "userName text-primary";
    createdAt.textContent = `${new Date(msg.createdAt).toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }
    )}`;
    createdAt.className = "createdAt";
    message.className = "content text-wrap text-break mb-2 fw-light";

    div.appendChild(userName);
    div.appendChild(createdAt);
    message.prepend(div);
    messages.appendChild(message);
    
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTo(0, chatBox.scrollHeight);
  }
});

const onGroupNameUpdate = async (e) => {
  if (e.key === "Enter" || e.type == "blur") {
    e.preventDefault(); // Prevent creating a new line in the span
    try {
      groupNameInput.value = groupNameDiv.innerText.trim(); // Update the input value

      const response = await fetch(`/chat/updateGroupName/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupName: groupNameInput.value }),
      });

      if (!response.ok) throw new Error("Failed to update group name");

      const savedGroupName = await response.json();
      socket.emit("group name", savedGroupName, chatId);
      groupNameDiv.blur();
      console.log("Group name updated!");
    } catch (error) {
      console.error("Failed to update group name: ", error);
    }
  }
};

groupNameDiv?.addEventListener("keydown", onGroupNameUpdate);
groupNameDiv?.addEventListener("blur", onGroupNameUpdate);

socket.on("group name", (name, chatId) => {
  const liElement = document.querySelectorAll(`li[data-chat-id="${chatId}"]`);
  const groupNameDiv = document.querySelector(`div[data-chat-id="${chatId}"]`);
  const input = document.querySelector(`input[data-chat-id="${chatId}"]`);

  liElement?.forEach((e) => (e.textContent = name));
  groupNameDiv.textContent = name;
  input.placeholder = name;
});

newChatMemberForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const response = await fetch("/chat/createChat", {
      method: "POST",
      headers: { "Content-Type": "application/javascript" },
      body: user,
    });

    if (!response.ok) throw new Error("Failed to to create group");

    const result = await response.json();

    socket.emit("new member", result);
  
    window.location.href = `/messages/${result.chatMatch?._id || result._id}`;

  } catch (error) {
    console.log(error);
  }
});

socket.on("new member", (member) => {
  const liElement = document.querySelector(`li[data-chat-id*="${member.chatMatch._id}"]`);
  const memberLength = document.querySelector(`div[data-member-length-chat-id*="${member.chatMatch._id}"]`);
  const memberNum = document.querySelector(`span[data-member-num-chat-id*="${member.chatMatch._id}"]`);

  if (liElement.getAttribute("class") == "mt-3 text-truncate card-group-name groupNameSet-false"){
    liElement.innerText += `, ${member.userName}`;
  }
  
  if (groupNameDiv.getAttribute("data-chat-id") == member.chatMatch._id){
    groupNameDiv.innerText += `, ${member.userName}`;
  }

  if (memberLength.getAttribute("data-member-length-chat-id") == member.chatMatch._id){
    memberLength.innerText = memberLength.innerText.replace(/\d/g,e=>(+e+1).toString());
    memberLength.innerText = memberLength.innerText.replace(/Member/g,"Members");
  }

  if (memberNum.getAttribute("data-member-num-chat-id") == member.chatMatch._id){
    memberNum.innerText = memberNum.innerText.replace(/\d/g,e=>(+e+1).toString());
    memberNum.innerText = memberNum.innerText.replace(/MEMBER/g,"MEMBERS");
  }

  if (chatBox.getAttribute("data-chat-id") == member.chatMatch._id) {
    //for message
    const message = document.createElement("li");
    const icon = document.createElement("i");
    const content = document.createElement("span");
    const createdAt = document.createElement("span");
    const memberList = document.querySelector(`ul[data-member-chat-id*="${member.chatMatch._id}"]`);
    const memberLi = document.createElement("li");

    content.innerText = ` ${member.systemMessage.content} `;
    createdAt.innerText = ` ${new Date(member.systemMessage.createdAt).toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }
    )} `;
    memberLi.innerText = member.userName;

    message.className = "content text-wrap text-break mb-2 fw-light";
    icon.className = "fa-solid fa-arrow-right";
    icon.style.color = "#4ED7D9";
    content.className = "text-primary"
    createdAt.className = "createdAt";
    memberLi.className = "mt-3";

    message.appendChild(icon);
    message.appendChild(content);
    message.appendChild(createdAt);
    messages.appendChild(message);
    memberList.appendChild(memberLi);
  }
});
