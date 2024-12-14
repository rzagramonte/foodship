const socket = io();
const form = document.getElementById("form");
const chatId = form.dataset.chatId;
const senderId = form.dataset.senderId;
const userName = form.dataset.userName;
const input = document.getElementById("input");
const fileInput = document.getElementById("fileInput");
const messages = document.getElementById("messages");
const chatBox = document.getElementById("chat-box");
const images = document.querySelectorAll(".message-image");
const groupNameSpan = document.getElementById("group-name-span");
const groupNameInput = document.getElementById("group-name-input");
const groupNameForm = document.getElementById("group-name");

// Emit an event to join the room when the page loads
socket.emit("join chat", chatId);

chatBox.scrollTo(0, chatBox.scrollHeight);

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

form.addEventListener("submit", async (e) => {
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

socket.on("chat message", (msg) => {
  const message = document.createElement("li");
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
  createdAt.textContent = `${new Date(msg.createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })}`;
  createdAt.className = "createdAt";
  message.className = "content";
  messages.appendChild(userName);
  messages.appendChild(createdAt);
  messages.appendChild(message);

  const chatBox = document.getElementById("chat-box");
  chatBox.scrollTo(0, chatBox.scrollHeight);
});

/*
// Update the hidden input with the span's content on form submit
groupNameSpan.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent creating a new line in the span
    groupNameInput.value = groupNameSpan.innerText.trim(); // Update the input value
    groupNameForm.submit(); // Submit the form
  }
});
*/
groupNameSpan.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent creating a new line in the span
    try {
      groupNameInput.value = groupNameSpan.innerText.trim(); // Update the input value

      const chatId = groupNameForm.dataset.chatId;
      const formData = new FormData();
      formData.append("chatId", chatId); // Chat ID
      formData.append("groupName", groupNameInput.value); // group name input
      
      // Save the message to the database
      const response = await fetch(`/chat/updateGroupName/${chatId}`, {
        method: "PATCH",
        body: formData,
      });
  
      if (!response.ok) throw new Error("Failed to update group name");
  
      const savedGroupName = await response.json();
      socket.emit("group name", savedGroupName, chatId);
  
      console.log("Group name updated!");
    } catch (error) {
      console.error("Failed to update group name: ", error);
    }
  }

});

socket.on("group name", (name) => {
  groupNameSpan.textContent = name;
});
