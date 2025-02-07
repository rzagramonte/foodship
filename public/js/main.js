const socket = io();
const year = document.getElementById("copyright");
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
const deleteForm = document.querySelectorAll(".x-mark");
const deleteFormOffCanvas = document.querySelectorAll(".x-mark-offcanvas");
const user = newChatForm?.dataset.user;
const userOffCanvas = newChatFormOffCanvas?.dataset.user;
const clearAllButton = document.getElementById("clearAll");
const clearAllButtonOffCanvas = document.getElementById("clearAll-offcanvas");
const newEventForm = document.getElementById("calendar");
const userEvent = newEventForm?.dataset.user;
const eventDate = document.getElementById("date");
const createdAt = document.querySelectorAll(".createdAt");
const dateSet = document.querySelectorAll(".date-set");
const eventSystemMessage = document.querySelectorAll(".eventSystemMessage");

chatBox?.scrollTo(0, chatBox.scrollHeight);

if (year)
  year.innerText = year.innerText.replace(
    /\d{4}/g,
    `${new Date().toLocaleString(undefined, {
      year: "numeric",
    })}`
  );

images.forEach((img) => {
  img.addEventListener("load", () => {
    img.naturalWidth > img.naturalHeight ? img.classList.add("landscape") : img.classList.add("portrait");
    chatBox?.scrollTo(0, chatBox.scrollHeight);
  });

  // If the image is already loaded (this happens when the image is cached)
  if (img.complete) {
    img.naturalWidth > img.naturalHeight ? img.classList.add("landscape") : img.classList.add("portrait");
    chatBox?.scrollTo(0, chatBox.scrollHeight);
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
    const icon = document.createElement("i");
    const messageHeader = document.createElement("div");
    const userName = document.createElement("span");
    const createdAt = document.createElement("span");
    const content = document.createElement("div");
    const chatBox = document.getElementById("chat-box");

    if (msg.contentType === "image") {
      const img = document.createElement("img");
      img.src = msg.image;
      img.alt = "User uploaded image";
      message.style.display = "none";
      img.onload = () => {
        img.className = `message-image ${img.naturalWidth > img.naturalHeight ? "landscape" : "portrait"}`;
        message.style.display = "block";
        chatBox.scrollTo(0, chatBox.scrollHeight);
      };
      content.appendChild(img);
    } else {
      content.textContent = ` ${msg.content} `;
    }
    icon.className = "px-2 fa-solid fa-user";
    userName.textContent = ` ${msg.senderId.userName} `;
    userName.className = "text-primary";
    createdAt.textContent = `${new Date(msg.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })}`;
    createdAt.className = "createdAt";
    message.className = "content text-wrap text-break mb-2 fw-light";
    messageHeader.className = "message-header";
    content.className = "message-content";

    message.appendChild(messageHeader);
    messageHeader.appendChild(icon);
    messageHeader.appendChild(userName);
    messageHeader.appendChild(createdAt);
    message.appendChild(content);
    messages.appendChild(message);

    chatBox?.scrollTo(0, chatBox.scrollHeight);
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

  if (liElementOffCanvas) {
    liElementOffCanvas.textContent = name;
    liElementOffCanvas.classList.replace("groupNameSet-false", "groupNameSet-true");
  }

  if (groupNameDiv.getAttribute("data-chat-id") == chatId && input.getAttribute("data-chat-id") == chatId) {
    groupNameDiv.textContent = name;
    groupNameDiv.classList.replace("groupNameSet-false", "groupNameSet-true");
    input.placeholder = `Message ${name}`;
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

    message.className = "content text-wrap text-break mb-3 fw-light";
    icon.className = "px-2 fa-solid fa-arrow-right";
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

deleteForm?.forEach((e) => e.addEventListener("submit", deleteChat));
deleteFormOffCanvas?.forEach((e) => e.addEventListener("submit", deleteChat));

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
    icon.className = "px-2 fa-solid fa-arrow-left";
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

newEventForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const chatId = newEventForm?.dataset.chatId;
    const eventModal = document.getElementById("new-calender-event-close");

    const date = new Date(new Date(eventDate.value).toISOString());
    const dateUTC = date.toISOString();

    const response = await fetch(`/events/createEvent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: dateUTC, chatId }),
    });

    if (!response.ok) throw new Error("Failed to update group name");

    const event = await response.json();
    socket.emit("new event", event, chatId);

    eventModal.click();

    console.log("User created event!");
  } catch (error) {
    console.error("Failed to create new event: ", error);
  }
});

socket.on("new event", (event, chatId) => {
  const divElement = document.querySelector(`div[data-chat-id="${chatId}"]`);
  if (divElement) {
    const message = document.createElement("li");
    const icon = document.createElement("i");
    const user = document.createElement("span");
    const content = document.createElement("span");
    const createdAt = document.createElement("span");
    const systemMessage = event.systemMessage.content.replace(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
      `${new Date(event.event.date).toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      })}`
    );
    user.innerText = ` ${systemMessage.split(" ")[0]} `;
    content.innerText = ` ${systemMessage.split(" ").slice(1).join(" ")} `;
    createdAt.innerText = ` ${new Date(event.systemMessage.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })} `;

    createdAt.className = "createdAt";
    message.className = "eventSystemMessage text-wrap text-break mb-2 fw-light";
    icon.className = "px-2 fa-solid fa-calendar-check";
    icon.style.color = "#85edbe";
    user.className = "text-primary";

    message.appendChild(icon);
    message.appendChild(user);
    message.appendChild(content);
    message.appendChild(createdAt);
    messages.appendChild(message);

    chatBox?.scrollTo(0, chatBox.scrollHeight);
  }
});

socket.on("question", async (savedQuestion, chatId) => {
  const divElement = document.querySelector(`div[data-chat-id="${chatId}"]`);
  if (divElement) {
    const message = document.createElement("li");
    const icon = document.createElement("i");
    const span = document.createElement("span");
    const content = document.createElement("span");
    const content2 = document.createElement("span");
    const createdAt = document.createElement("span");

    content.innerText = ` ${savedQuestion.content.split(" ")[0]} `;
    content2.innerText = ` ${savedQuestion.content.split(" ").slice(1).join(" ")} `;
    createdAt.textContent = `${new Date(savedQuestion.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })}`;

    createdAt.className = "createdAt";
    message.className = "content text-wrap text-break mb-2 fw-light";
    icon.className = "px-2 fa-solid fa-circle-question";
    icon.style.color = "#b38f3f";

    span.appendChild(icon);
    message.appendChild(span);
    message.appendChild(content);
    message.appendChild(content2);
    message.appendChild(createdAt);
    messages.appendChild(message);

    chatBox?.scrollTo(0, chatBox.scrollHeight);
  }
});

const clearAll = () => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
};

clearAllButton?.addEventListener("click", clearAll);
clearAllButtonOffCanvas?.addEventListener("click", clearAll);

createdAt?.forEach(
  (e) =>
    (e.textContent = `${new Date(e.textContent).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })}`)
);

dateSet?.forEach(
  (e) =>
    (e.textContent = `${new Date(e.textContent).toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })}`)
);

eventSystemMessage?.forEach((e) => {
  const systemMessage = e.textContent;
  const regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g;
  const eventDate = systemMessage.match(regex);

  e.textContent = e.textContent.replace(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
    `${new Date(eventDate).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
    })}`
  );
});
