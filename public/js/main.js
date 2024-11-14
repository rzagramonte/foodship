const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if(!input.value) return;
  const content = input.value;
  const formData = new FormData();
  formData.append('content', content);       // Text message content
  formData.append('chatId', chatId);         // Chat ID
  formData.append('senderId', senderId);     // Sender ID
  formData.append('contentType', contentType); // 'text' or 'image'

// Only append the file if there's an image being sent
if (fileInput.files[0]) formData.append('file', fileInput.files[0]); // Image file input

  try {
    // Save the message to the database
    await fetch(`/messages/send`, {
      method: 'POST',
      body: formData,
    });
    socket.emit('chat message', content);
    input.value = '';
    console.log('Message saved!')
  } catch (error) {
    console.error('Failed to save message: ', error);
  }
});

socket.on('chat message', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
