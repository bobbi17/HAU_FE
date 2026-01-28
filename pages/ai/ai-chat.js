document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-message');
    const loadingTemplate = document.getElementById('loading-template');

    // Hàm tạo giao diện tin nhắn
    function createMessageElement(role, text) {
        const messageDiv = document.createElement('div');
        // Phân loại class để CSS đẩy trái/phải
        messageDiv.className = `message ${role}-message`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Cấu trúc HTML cho tin nhắn
        const avatarHtml = role === 'assistant' 
            ? `<div class="msg-avatar"><span class="material-symbols-outlined">face_6</span></div>` 
            : '';

        messageDiv.innerHTML = `
            ${avatarHtml}
            <div class="msg-bubble">
                <div class="msg-text">${text.replace(/\n/g, '<br>')}</div>
                <span class="msg-time">${time}</span>
            </div>
        `;
        
        return messageDiv;
    }

    // Hàm gửi tin nhắn
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        // 1. Người dùng gửi (Hiện bên phải)
        const userMsg = createMessageElement('user', text);
        chatMessages.appendChild(userMsg);
        
        // Reset input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        scrollToBottom();

        // 2. Hiển thị trạng thái AI đang gõ (Bên trái)
        loadingTemplate.style.display = 'flex';
        chatMessages.appendChild(loadingTemplate);
        scrollToBottom();

        try {
            // Giả lập thời gian suy nghĩ của AI
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 3. AI phản hồi (Hiện bên trái)
            const aiResponseText = getMockResponse(text);
            const aiMsg = createMessageElement('assistant', aiResponseText);
            
            loadingTemplate.style.display = 'none';
            chatMessages.appendChild(aiMsg);
            scrollToBottom();
            
        } catch (error) {
            loadingTemplate.style.display = 'none';
            console.error("Lỗi AI:", error);
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Phản hồi giả lập
    function getMockResponse(input) {
        const q = input.toLowerCase();
        if (q.includes("hi") || q.includes("chào")) return "Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?";
        if (q.includes("tín chỉ")) return "Lịch đăng ký tín chỉ đợt 2 sẽ bắt đầu vào thứ Hai tuần tới trên cổng thông tin HAU.";
        return "HauAssistant đã nhận được thông tin. Để tư vấn chính xác hơn về '" + input + "', bạn có thể cung cấp thêm chi tiết không?";
    }

    // Sự kiện Click và Enter
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    // Cuộn mượt mà xuống cuối cùng
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
}

// Gọi hàm này mỗi khi:
// 1. Người dùng vừa gửi tin nhắn.
// 2. AI vừa phản hồi xong.
// 3. Khi mới load trang.
});