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
const cardGroupName = document.getElementById("card-group-name");

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
    message.className = "content";
    messages.appendChild(userName);
    messages.appendChild(createdAt);
    messages.appendChild(message);

    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTo(0, chatBox.scrollHeight);
  }
});

const onGroupNameUpdate = async (e) => {
  if (e.key === "Enter" || e.type == "blur") {
    e.preventDefault(); // Prevent creating a new line in the span
    try {
      groupNameInput.value = groupNameSpan.innerText.trim(); // Update the input value

      const response = await fetch(`/chat/updateGroupName/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json", // Ensure this header is set for JSON
        },
        body: JSON.stringify({ groupName: groupNameInput.value }),
      });

      if (!response.ok) throw new Error("Failed to update group name");

      const savedGroupName = await response.json();
      socket.emit("group name", savedGroupName, chatId);
      groupNameSpan.blur();
      console.log("Group name updated!");
    } catch (error) {
      console.error("Failed to update group name: ", error);
    }
  }
};

groupNameSpan.addEventListener("keydown", onGroupNameUpdate);
groupNameSpan.addEventListener("blur", onGroupNameUpdate);

socket.on("group name", (name, chatId) => {
  const liElement = document.querySelector(`li[data-chat-id="${chatId}"]`);
  const groupNameSpan = document.querySelector(
    `span[data-chat-id="${chatId}"]`
  );
  if (liElement) {
    liElement.textContent = name;
  }
  if (groupNameSpan) {
    groupNameSpan.textContent = name;
  }
});
