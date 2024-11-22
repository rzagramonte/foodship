const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const fileInput = document.getElementById("fileInput");
const messages = document.getElementById("messages");
const chatId = form.dataset.chatId;
const senderId = form.dataset.senderId;

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
/*
socket.on("chat message", (msg) => {
  const item = document.createElement("li");
  if (msg.contentType === "image") {
    // Display image or link to image
    const imgDiv = document.createElement("div");
    const img = document.createElement("img");
    imgDiv.className = "image-container"
    img.src = msg.image; // Assuming server-side file handling
    img.alt = "User uploaded image";  // Alt text for the image
    img.className = "image-message";
    item.appendChild(imgDiv).appendChild(img);
  } else {
    item.textContent = msg.content;
  }
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll('.message-image');

  images.forEach(img => {
    // Add class once the image is loaded
    if (img.complete) {
      setAspectRatioClass(img);
    } else {
      img.onload = () => setAspectRatioClass(img);
    }
  });

  function setAspectRatioClass(img) {
    if (img.naturalWidth > img.naturalHeight) {
      img.classList.add('landscape');
    } else {
      img.classList.add('portrait');
    }
  }
});

*/

socket.on("chat message", (msg) => {
  const item = document.createElement("li");

  if (msg.contentType === "image") {
    const img = document.createElement("img");
    img.src = msg.image;
    img.alt = "User uploaded image";
    img.className = "message-image";

    img.onload = () => {
      setAspectRatioClass(img);
    };

    item.appendChild(img);
  } else {
    item.textContent = msg.content;
  }

  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

function setAspectRatioClass(img) {
  if (img.naturalWidth > img.naturalHeight) {
    img.classList.add('landscape');
  } else {
    img.classList.add('portrait');
  }
}