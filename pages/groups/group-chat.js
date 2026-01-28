/**
 * HauHub - Group Chat Logic
 * Xử lý tương tác nhắn tin nhóm, danh sách studio và thông tin thành viên
 */

class GroupChat {
    constructor() {
        // 1. Khai báo các thuộc tính DOM
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-message');
        this.groupItems = document.querySelectorAll('.group-item');
        this.searchInput = document.querySelector('.search-input');
        this.chatTitle = document.querySelector('.chat-title');
        
        // 2. Khởi tạo sự kiện
        this.init();
    }

    init() {
        // Cuộn xuống tin nhắn mới nhất khi load trang
        this.scrollToBottom();

        // Sự kiện gửi tin nhắn
        if (this.sendButton && this.messageInput) {
            this.sendButton.addEventListener('click', () => this.handleSendMessage());
            
            this.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
        }

        // Sự kiện chọn nhóm (Studio)
        this.groupItems.forEach(item => {
            item.addEventListener('click', (e) => this.switchGroup(e));
        });

        // Sự kiện tìm kiếm nhóm
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.filterGroups(e.target.value));
        }

        // Giả lập nhận tin nhắn sau 5 giây để demo
        setTimeout(() => {
            this.receiveMockMessage("TS. HOÀNG NAM", "Mọi người nhớ nộp bài đúng hạn vào hệ thống nhé!");
        }, 5000);
    }

    /**
     * Xử lý gửi tin nhắn từ phía người dùng
     */
    handleSendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Tạo cấu trúc HTML tin nhắn gửi đi
        const msgHTML = `
            <div class="message sent">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-time">${time}</span>
                        <span class="message-author">BẠN</span>
                    </div>
                    <div class="message-bubble">
                        <p class="message-text">${this.escapeHTML(text)}</p>
                    </div>
                </div>
                <div class="message-avatar">
                    <img src="../../assets/images/avatars/current-user.jpg" alt="Your Avatar" onerror="this.src='https://ui-avatars.com/api/?name=Me&background=random'">
                </div>
            </div>
        `;

        this.chatMessages.insertAdjacentHTML('beforeend', msgHTML);
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto'; // Reset height textarea
        this.scrollToBottom();
    }

    /**
     * Giả lập nhận tin nhắn từ thành viên khác
     */
    receiveMockMessage(author, text) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgHTML = `
            <div class="message received">
                <div class="message-avatar">
                    <div class="avatar-placeholder"></div>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${author}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-bubble">
                        <p class="message-text">${text}</p>
                    </div>
                </div>
            </div>
        `;
        this.chatMessages.insertAdjacentHTML('beforeend', msgHTML);
        this.scrollToBottom();
        
        // Phát tiếng thông báo nhẹ (nếu muốn)
        // new Audio('../../assets/sounds/notification.mp3').play().catch(() => {});
    }

    /**
     * Chuyển đổi giữa các nhóm chat
     */
    switchGroup(e) {
        const clickedGroup = e.currentTarget;
        
        // Xóa class active cũ và thêm vào cái mới
        this.groupItems.forEach(item => item.classList.remove('active'));
        clickedGroup.classList.add('active');

        // Cập nhật tiêu đề chat
        const groupName = clickedGroup.querySelector('.group-name').textContent;
        this.chatTitle.textContent = groupName;

        // Trong thực tế, đây là nơi bạn gọi API để lấy tin nhắn của nhóm đó
        console.log(`Đang tải tin nhắn cho nhóm: ${groupName}`);
        
        // Hiệu ứng chuyển cảnh đơn giản
        this.chatMessages.style.opacity = '0';
        setTimeout(() => {
            this.chatMessages.style.opacity = '1';
            // Giả lập làm sạch tin nhắn cũ
            // this.chatMessages.innerHTML = '<div class="date-separator"><span>TIN NHẮN MỚI</span></div>';
        }, 300);
    }

    /**
     * Bộ lọc tìm kiếm nhóm ở sidebar trái
     */
    filterGroups(query) {
        const filter = query.toLowerCase();
        this.groupItems.forEach(item => {
            const name = item.querySelector('.group-name').textContent.toLowerCase();
            if (name.includes(filter)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Tự động cuộn xuống cuối danh sách tin nhắn
     */
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTo({
                top: this.chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Ngăn chặn XSS bằng cách mã hóa ký tự đặc biệt
     */
    escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }
}

// Khởi tạo ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    window.appChat = new GroupChat();

    // Xử lý co giãn tự động cho textarea
    const textarea = document.getElementById('message-input');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if (this.scrollHeight > 150) {
                this.style.overflowY = 'scroll';
            } else {
                this.style.overflowY = 'hidden';
            }
        });
    }
});