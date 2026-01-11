<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot AI Gemini</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .chat-container { max-width: 500px; margin: 50px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .messages { height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
        .messages div { margin-bottom: 10px; }
        .user { color: blue; }
        .bot { color: green; }
        textarea { width: 100%; height: 50px; }
        button { padding: 8px 15px; margin-top: 5px; }
    </style>
</head>
<body>

<div class="chat-container">
    <div class="messages" id="messages"></div>
    <textarea id="message" placeholder="Nhập tin nhắn..."></textarea>
    <button id="sendBtn">Gửi</button>
</div>

<script>
document.getElementById('sendBtn').addEventListener('click', async function() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    if (!message) return alert('Nhập tin nhắn');

    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML += `<div class="user"><strong>Bạn:</strong> ${message}</div>`;

    messageInput.value = '';

    try {
        const response = await fetch('/api/chatbot', { // route API của bạn
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        const reply = data.reply || 'Không có phản hồi';

        messagesDiv.innerHTML += `<div class="bot"><strong>Bot:</strong> ${reply}</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // scroll xuống dưới

    } catch (err) {
        console.error(err);
        messagesDiv.innerHTML += `<div class="bot"><strong>Bot:</strong> Lỗi khi gọi API</div>`;
    }
});
</script>

</body>
</html>
