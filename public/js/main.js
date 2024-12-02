const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const fileInput = document.getElementById("fileInput");
const messages = document.getElementById("messages");
const images = document.querySelectorAll(".message-image");
const chatId = form.dataset.chatId;
const senderId = form.dataset.senderId;
const chatbox = document.getElementById("chatbox");

chatbox.scrollTo(0, chatbox.scrollHeight);

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
    formData.append("content", input.value || fileInput.files[0].name); // Text message content
    formData.append("chatId", chatId); // Chat ID
    formData.append("senderId", senderId); // Sender ID
    formData.append("contentType", fileInput.files[0] ? "image" : "text");

    if (fileInput.files[0]) formData.append("file", fileInput.files[0]);

    // Save the message to the database
    const response = await fetch("/messages/send", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to send message");

    const savedMessage = await response.json();

    socket.emit("chat message", savedMessage);

    input.value = "";
    fileInput.value = "";

    console.log("Message saved!");
  } catch (error) {
    console.error("Failed to save message: ", error);
  }
});

socket.on("chat message", (msg) => {
  console.log(msg);
  const message = document.createElement("li");
  const messageDetails = document.createElement("span");
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
  messageDetails.textContent = `${msg.senderId.userName} ${new Date(
    msg.createdAt
  ).toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })}`;
  messages.appendChild(messageDetails);
  messages.appendChild(message);

  const chatbox = document.getElementById("chatbox");
  chatbox.scrollTo(0, chatbox.scrollHeight);
});
