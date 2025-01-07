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
const newChatForm = document.getElementById("new-chat");
const newChatFormOffCanvas = document.getElementById("new-chat-offcanvas");
const newMemberPreferencesForm = document.getElementById("preferences");
const deleteForm = document.querySelector(".x-mark");
const deleteFormOffCanvas = document.querySelector(".x-mark-offcanvas");
const user = newChatForm?.dataset.user;
const userOffCanvas = newChatFormOffCanvas?.dataset.user;

chatBox?.scrollTo(0, chatBox.scrollHeight);

images.forEach((img) => {
  img.addEventListener("load", () => {
    img.naturalWidth > img.naturalHeight ? img.classList.add("landscape") : img.classList.add("portrait");
  });

  // If the image is already loaded (this happens when the image is cached)
  if (img.complete) {
    img.naturalWidth > img.naturalHeight ? img.classList.add("landscape") : img.classList.add("portrait");
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

    // Save the message to the database
    const response = await fetch("/messages/send", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to send message");

    const msg = await response.json();
    socket.emit("chat message", msg, chatId);

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
        img.className = `message-image ${img.naturalWidth > img.naturalHeight ? "landscape" : "portrait"}`;
        message.style.display = "block";
      };
      message.appendChild(img);
    } else {
      message.textContent = msg.content;
    }
    userName.textContent = `${msg.senderId.userName} `;
    userName.className = "userName text-primary";
    createdAt.textContent = `${new Date(msg.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })}`;
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

      const name = await response.json();
      socket.emit("group name", name, chatId);
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
  const liElement = document.querySelector(`li[data-chat-id="${chatId}"]`);
  const liElementOffCanvas = document.querySelector(`li[data-chat-id-offcanvas="${chatId}"]`);
  const groupNameDiv = document.querySelector(`div[data-chat-id="${chatId}"]`);
  const input = document.querySelector(`input[data-chat-id="${chatId}"]`);

  if (liElement) {
    liElement.textContent = name;
    liElement.classList.replace("groupNameSet-false", "groupNameSet-true");
  }
  console.log();

  if (liElementOffCanvas) {
    liElementOffCanvas.textContent = name;
    liElementOffCanvas.classList.replace("groupNameSet-false", "groupNameSet-true");
  }

  if (groupNameDiv.getAttribute("data-chat-id") == chatId && input.getAttribute("data-chat-id") == chatId) {
    groupNameDiv.textContent = name;
    groupNameDiv.classList.replace("groupNameSet-false", "groupNameSet-true");
    input.placeholder = name;
    input.classList.replace("groupNameSet-false", "groupNameSet-true");
  }
});

const newChat = async (e) => {
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
};

newChatForm?.addEventListener("submit", newChat);
newChatFormOffCanvas?.addEventListener("submit", newChat);

socket.on("new member", (member) => {
  const liElement = document.querySelector(`li[data-chat-id="${member.chatMatch._id}"]`);
  const liElementOffCanvas = document.querySelector(`li[data-chat-id-offcanvas="${member.chatMatch._id}"]`);
  const lMemberCount = document.querySelector(`div[data-l-member-count-chat-id="${member.chatMatch._id}"]`);
  const lMemberCountOffCanvas = document.querySelector(`div[data-l-member-count-chat-id-offcanvas="${member.chatMatch._id}"]`);
  const rMemberCount = document.querySelector(`span[data-r-member-count-chat-id="${member.chatMatch._id}"]`);
  const rMemberCountOffCanvas = document.querySelector(`span[data-r-member-count-chat-id-offcanvas="${member.chatMatch._id}"]`);

  if (liElement?.getAttribute("class") == "mt-3 text-truncate card-group-name groupNameSet-false") {
    liElement.innerText = liElement.innerText.trim();
    liElement.innerText += `, ${member.userName}`;
  }
  if (liElementOffCanvas) {
    liElementOffCanvas.innerText = liElement.innerText;
  }

  if (lMemberCount && lMemberCount?.innerText.includes("1")) {
    lMemberCount.innerText = lMemberCount.innerText.replace("Member", "Members");
    lMemberCountOffCanvas.innerText = lMemberCount.innerText;
  }

  if (lMemberCount) {
    lMemberCount.innerText = lMemberCount.innerText.replace(/\d/g, (e) => (+e + 1).toString());
  }

  if (lMemberCountOffCanvas) {
    lMemberCountOffCanvas.innerText = lMemberCount.innerText;
  }

  if (rMemberCount && rMemberCount?.innerText.includes("1")) {
    rMemberCount.innerText = rMemberCount.innerText.replace("MEMBER", "MEMBERS");
  }

  if (rMemberCount) {
    rMemberCount.innerText = rMemberCount.innerText.replace(/\d/g, (e) => (+e + 1).toString());
  }

  if (rMemberCountOffCanvas) {
    rMemberCountOffCanvas.innerText = rMemberCount.innerText;
  }

  if (groupNameDiv?.getAttribute("class").includes("groupNameSet-false") && groupNameDiv?.getAttribute("data-chat-id") == member.chatMatch._id) {
    groupNameDiv.innerText = groupNameDiv.innerText.trim();
    groupNameDiv.innerText += `, ${member.userName}`;
  }
  if (input?.getAttribute("class").includes("groupNameSet-false") && input?.getAttribute("data-chat-id") == member.chatMatch._id) {
    input.placeholder += `, ${member.userName}`;
  }
  if (chatBox?.getAttribute("data-chat-id") == member.chatMatch._id) {
    //for message
    const message = document.createElement("li");
    const icon = document.createElement("i");
    const content = document.createElement("span");
    const createdAt = document.createElement("span");
    const memberList = document.querySelector(`ul[data-member-chat-id="${member.chatMatch._id}"]`);
    const memberListOffCanvas = document.querySelector(`ul[data-member-chat-offcanvas-id="${member.chatMatch._id}"]`);
    const memberLi = document.createElement("li");
    const memberLiOffCanvas = document.createElement("li");

    content.innerText = ` ${member.systemMessage.content} `;
    createdAt.innerText = ` ${new Date(member.systemMessage.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })} `;
    memberLi.innerText = member.userName;
    memberLiOffCanvas.innerText = member.userName;
    memberLi.setAttribute("data-member-id", `${member.userId}`);
    memberLiOffCanvas.setAttribute("data-member-offcanvas-id", `${member.userId}`);

    message.className = "content text-wrap text-break mb-2 fw-light";
    icon.className = "fa-solid fa-arrow-right";
    icon.style.color = "#4ED7D9";
    content.className = "text-primary";
    createdAt.className = "createdAt";
    memberLi.className = "mt-3";
    memberLiOffCanvas.className = "mt-3";

    message.appendChild(icon);
    message.appendChild(content);
    message.appendChild(createdAt);
    messages.appendChild(message);
    memberList?.appendChild(memberLi);
    memberListOffCanvas?.appendChild(memberLiOffCanvas);

    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTo(0, chatBox.scrollHeight);
  }
});

const deleteChat = async (e) => {
  e.preventDefault();

  try {
    const chatId = e.target.getAttribute("data-chat-id");

    const response = await fetch(`/chat/deleteChat/${chatId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to to delete group");

    const chat = await response.json();

    socket.emit("delete chat", chat);

    window.location.href = "/profile";
  } catch (error) {
    console.log(error);
  }
};

deleteForm?.addEventListener("submit", deleteChat);
deleteFormOffCanvas?.addEventListener("submit", deleteChat);

socket.on("delete chat", (chat) => {
  const liElement = document.querySelector(`li[data-chat-id="${chat.deletedChat._id}"]`);
  const liElementOffCanvas = document.querySelector(`li[data-chat-id-offcanvas="${chat.deletedChat._id}"]`);
  const lMemberCount = document.querySelector(`div[data-l-member-count-chat-id="${chat.deletedChat._id}"]`);
  const lMemberCountOffCanvas = document.querySelector(`div[data-l-member-count-chat-id-offcanvas="${chat.deletedChat._id}"]`);
  const rMemberCount = document.querySelector(`span[data-r-member-count-chat-id="${chat.deletedChat._id}"]`);
  const rMemberCountOffCanvas = document.querySelector(`span[data-r-member-count-chat-id-offcanvas="${chat.deletedChat._id}"]`);

  if (liElement?.getAttribute("class") == "mt-3 text-truncate card-group-name groupNameSet-false") {
    liElement.innerText = liElement.innerText.replace(new RegExp(`(, ${chat.userName}|${chat.userName}, )`, "g"), "");
  }
  if (liElementOffCanvas) {
    liElementOffCanvas.innerText = liElement.innerText;
  }

  if (lMemberCount) {
    lMemberCount.innerText = lMemberCount.innerText.replace(/\d/g, (e) => (+e - 1).toString());
  }

  if (lMemberCount && lMemberCount?.innerText.includes("1")) {
    lMemberCount.innerText = lMemberCount.innerText.replace("s", "");
  }

  if (lMemberCountOffCanvas) {
    lMemberCountOffCanvas.innerText = lMemberCount.innerText;
  }

  if (rMemberCount) {
    rMemberCount.innerText = rMemberCount.innerText.replace(/\d/g, (e) => (+e - 1).toString());
  }

  if (rMemberCount && rMemberCount?.innerText.includes("1")) {
    rMemberCount.innerText = rMemberCount.innerText.replace("S", "");
  }

  if (rMemberCountOffCanvas) {
    rMemberCountOffCanvas.innerText = rMemberCount.innerText;
  }

  if (groupNameDiv?.getAttribute("class").includes("groupNameSet-false") && groupNameDiv?.getAttribute("data-chat-id") == chat.deletedChat._id) {
    groupNameDiv.innerText = groupNameDiv.innerText.replace(new RegExp(`(, ${chat.userName}|${chat.userName}, )`, "g"), "");
  }
  if (input?.getAttribute("class").includes("groupNameSet-false") && input?.getAttribute("data-chat-id") == chat.deletedChat._id) {
    input.placeholder = input.placeholder.replace(new RegExp(`(, ${chat.userName}|${chat.userName}, )`, "g"), "");
  }
  if (chatBox?.getAttribute("data-chat-id") == chat.deletedChat._id) {
    //for message
    const message = document.createElement("li");
    const icon = document.createElement("i");
    const content = document.createElement("span");
    const createdAt = document.createElement("span");
    const memberList = document.querySelector(`ul[data-member-chat-id="${chatId}"]`);
    const memberListOffCanvas = document.querySelector(`ul[data-member-chat-offcanvas-id="${chat.deletedChat._id}"]`);
    const user = document.querySelector(`li[data-member-id="${chat.userId}"]`);
    const userOffCanvas = document.querySelector(`li[data-member-offcanvas-id="${chat.userId}"]`);

    content.innerText = ` ${chat.systemMessage?.content} `;
    createdAt.innerText = ` ${new Date(chat.systemMessage?.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })} `;

    message.className = "content text-wrap text-break mb-2 fw-light";
    icon.className = "fa-solid fa-arrow-left";
    icon.style.color = "#dc143c";
    content.className = "text-primary";
    createdAt.className = "createdAt";

    message.appendChild(icon);
    message.appendChild(content);
    message.appendChild(createdAt);
    messages.appendChild(message);
    memberList?.removeChild(user);
    memberListOffCanvas?.removeChild(userOffCanvas);

    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTo(0, chatBox.scrollHeight);
  }
});
