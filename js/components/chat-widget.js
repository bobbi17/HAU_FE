// AI Chat Widget Component - Architectural Style
export class AIChatWidget {
    constructor() {
        this.isChatOpen = false;
        this.chatHistory = []; // Lưu lịch sử chat
        this.addArchitecturalStyles(); // Thêm styles kiến trúc
        this.render();
        this.initEventListeners();
    }
    
    // Thêm styles với bảng màu kiến trúc
    addArchitecturalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Architectural Color Palette */
            :root {
                --ivory: #FDFCF8;
                --arch-blue: #0A2463;
                --drafting-gray: #64748B;
                --drafting-light: #CBD5E1;
                --line-art: #E2E8F0;
                --blueprint-blue: #0A2463;
                --paper-bg: #FAFAF8;
                --border-soft: rgba(203, 213, 225, 0.5);
                --shadow-soft: 0 4px 20px rgba(10, 36, 99, 0.08);
                --gradient-arch: linear-gradient(135deg, #0A2463 0%, #1E3A8A 100%);
            }
            
            /* Quick Chat Popup - Architectural Style */
            .quick-chat-popup {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 360px;
                height: 480px;
                background: var(--ivory);
                border-radius: 16px;
                box-shadow: var(--shadow-soft);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 1000;
                border: 1px solid var(--border-soft);
                backdrop-filter: blur(10px);
                background: rgba(253, 252, 248, 0.95);
            }
            
            .quick-chat-popup.active {
                display: flex !important;
                animation: slideUpGentle 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            @keyframes slideUpGentle {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .quick-chat-header {
                background: var(--gradient-arch);
                padding: 18px 20px;
                color: var(--ivory);
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
            }
            
            .quick-chat-header::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(253, 252, 248, 0.3), transparent);
            }
            
            .quick-chat-header h4 {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Inter', sans-serif;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                background: #34D399;
                border-radius: 50%;
                display: inline-block;
                animation: gentlePulse 2s ease-in-out infinite;
                box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.2);
            }
            
            @keyframes gentlePulse {
                0%, 100% { 
                    transform: scale(1);
                    opacity: 1;
                }
                50% { 
                    transform: scale(1.2);
                    opacity: 0.8;
                }
            }
            
            .quick-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: var(--paper-bg);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .quick-chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .quick-chat-messages::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .quick-chat-messages::-webkit-scrollbar-thumb {
                background: var(--drafting-light);
                border-radius: 3px;
            }
            
            /* Message Bubbles */
            .message-container {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .message-ai {
                align-self: flex-start;
                max-width: 80%;
            }
            
            .message-user {
                align-self: flex-end;
                max-width: 80%;
            }
            
            .message-bubble {
                padding: 12px 16px;
                border-radius: 18px;
                position: relative;
                word-wrap: break-word;
                line-height: 1.5;
                font-size: 14px;
            }
            
            .message-ai .message-bubble {
                background: white;
                border: 1px solid var(--border-soft);
                border-bottom-left-radius: 4px;
                color: var(--arch-blue);
            }
            
            .message-user .message-bubble {
                background: var(--gradient-arch);
                color: var(--ivory);
                border-bottom-right-radius: 4px;
            }
            
            .message-avatar {
                width: 24px;
                height: 24px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                margin-bottom: 4px;
            }
            
            .message-ai .message-avatar {
                background: rgba(10, 36, 99, 0.1);
                color: var(--arch-blue);
            }
            
            .message-user .message-avatar {
                background: rgba(253, 252, 248, 0.2);
                color: var(--ivory);
                align-self: flex-end;
            }
            
            .message-time {
                font-size: 11px;
                color: var(--drafting-gray);
                margin-top: 2px;
                opacity: 0.7;
            }
            
            .message-ai .message-time {
                text-align: left;
                padding-left: 4px;
            }
            
            .message-user .message-time {
                text-align: right;
                padding-right: 4px;
            }
            
            .typing-indicator {
                display: flex;
                gap: 6px;
                align-items: center;
                padding: 12px 16px;
                background: white;
                border: 1px solid var(--border-soft);
                border-radius: 18px;
                border-bottom-left-radius: 4px;
                max-width: 80%;
                align-self: flex-start;
            }
            
            .typing-dot {
                width: 6px;
                height: 6px;
                background: var(--drafting-gray);
                border-radius: 50%;
                animation: typingBounce 1.4s infinite ease-in-out;
            }
            
            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes typingBounce {
                0%, 80%, 100% { 
                    transform: translateY(0);
                    opacity: 0.5;
                }
                40% { 
                    transform: translateY(-4px);
                    opacity: 1;
                }
            }
            
            .quick-chat-input-area {
                padding: 16px 20px;
                border-top: 1px solid var(--border-soft);
                background: white;
                flex-shrink: 0;
            }
            
            .quick-input-group {
                display: flex;
                gap: 10px;
                margin-bottom: 12px;
            }
            
            .quick-chat-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid var(--drafting-light);
                border-radius: 10px;
                font-size: 14px;
                font-family: 'Inter', sans-serif;
                background: var(--ivory);
                color: var(--arch-blue);
                transition: all 0.3s ease;
            }
            
            .quick-chat-input:focus {
                outline: none;
                border-color: var(--arch-blue);
                box-shadow: 0 0 0 3px rgba(10, 36, 99, 0.1);
                background: white;
            }
            
            .quick-chat-input::placeholder {
                color: var(--drafting-gray);
                opacity: 0.6;
            }
            
            .quick-send-btn {
                background: var(--gradient-arch);
                color: var(--ivory);
                border: none;
                border-radius: 10px;
                width: 44px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(10, 36, 99, 0.15);
            }
            
            .quick-send-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(10, 36, 99, 0.2);
            }
            
            .quick-send-btn:active {
                transform: translateY(0);
            }
            
            .quick-suggestions {
                display: flex;
                gap: 8px;
                overflow-x: auto;
                padding-bottom: 4px;
            }
            
            .quick-suggestions::-webkit-scrollbar {
                height: 4px;
            }
            
            .quick-suggestions::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .quick-suggestions::-webkit-scrollbar-thumb {
                background: var(--drafting-light);
                border-radius: 2px;
            }
            
            .quick-suggestion-btn {
                padding: 8px 12px;
                background: var(--ivory);
                border: 1px solid var(--border-soft);
                border-radius: 20px;
                font-size: 12px;
                color: var(--arch-blue);
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
                font-weight: 500;
                flex-shrink: 0;
            }
            
            .quick-suggestion-btn:hover {
                background: linear-gradient(135deg, rgba(10, 36, 99, 0.05) 0%, rgba(10, 36, 99, 0.02) 100%);
                border-color: var(--arch-blue);
                transform: translateY(-1px);
            }
            
            .open-full-chat-btn {
                width: 100%;
                padding: 12px;
                background: var(--gradient-arch);
                color: var(--ivory);
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 12px;
                transition: all 0.3s ease;
                font-family: 'Inter', sans-serif;
                letter-spacing: 0.3px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 2px 8px rgba(10, 36, 99, 0.15);
            }
            
            .open-full-chat-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(10, 36, 99, 0.2);
            }
            
            /* Toggle Button - Architectural Style */
            .ai-chat-widget {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 1000;
            }
            
            .ai-chat-container {
                position: relative;
            }
            
            .ai-chat-toggle {
                width: 64px;
                height: 64px;
                border-radius: 20px;
                background: var(--gradient-arch);
                border: 1px solid rgba(10, 36, 99, 0.2);
                color: var(--ivory);
                cursor: pointer;
                box-shadow: var(--shadow-soft);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
            }
            
            .ai-chat-toggle::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(253, 252, 248, 0.3), transparent);
            }
            
            .ai-chat-toggle::after {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(10, 36, 99, 0.8) 0%, rgba(10, 36, 99, 0.4) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .ai-chat-toggle:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 8px 30px rgba(10, 36, 99, 0.2);
            }
            
            .ai-chat-toggle:hover::after {
                opacity: 1;
            }
            
            .ai-chat-toggle:active {
                transform: translateY(-1px) scale(1.02);
            }
            
            .ai-chat-icon {
                font-size: 28px;
                font-variation-settings: 'FILL' 1;
                position: relative;
                z-index: 1;
                transition: transform 0.3s ease;
            }
            
            .ai-chat-toggle:hover .ai-chat-icon {
                transform: scale(1.1) rotate(5deg);
            }
            
            /* Original popup (minimal) */
            .ai-chat-popup {
                display: none;
            }
            
            /* Architectural corner accents */
            .arch-corner {
                position: absolute;
                width: 20px;
                height: 20px;
            }
            
            .corner-tl {
                top: 0;
                left: 0;
                border-top: 2px solid var(--arch-blue);
                border-left: 2px solid var(--arch-blue);
                border-top-left-radius: 12px;
                opacity: 0.2;
            }
            
            .corner-br {
                bottom: 0;
                right: 0;
                border-bottom: 2px solid var(--arch-blue);
                border-right: 2px solid var(--arch-blue);
                border-bottom-right-radius: 12px;
                opacity: 0.2;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .quick-chat-popup {
                    width: 320px;
                    height: 420px;
                    right: -10px;
                    bottom: 80px;
                }
                
                .ai-chat-toggle {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                }
                
                .ai-chat-icon {
                    font-size: 24px;
                }
                
                .message-bubble {
                    max-width: 85%;
                }
            }
            
            @media (max-width: 480px) {
                .ai-chat-widget {
                    bottom: 16px;
                    right: 16px;
                }
                
                .quick-chat-popup {
                    width: 280px;
                    height: 380px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    render() {
        const widgetHTML = `
        <div class="ai-chat-widget">
            <div class="ai-chat-container">
                <!-- Quick Chat Popup -->
                <div class="quick-chat-popup">
                    <div class="quick-chat-header">
                        <h4>
                            <span class="status-dot"></span>
                            HAU Assistant
                        </h4>
                        <div class="arch-corner corner-tl"></div>
                        <div class="arch-corner corner-br"></div>
                    </div>
                    
                    <!-- Chat Messages Area -->
                    <div class="quick-chat-messages" id="quick-chat-messages">
                        <!-- Messages sẽ được thêm ở đây -->
                    </div>
                    
                    <!-- Input Area -->
                    <div class="quick-chat-input-area">
                        <div class="quick-input-group">
                            <input type="text" class="quick-chat-input" placeholder="Nhập tin nhắn...">
                            <button class="quick-send-btn">
                                <span class="material-symbols-outlined">send</span>
                            </button>
                        </div>
                        
                        <div class="quick-suggestions">
                            <button class="quick-suggestion-btn" data-question="Công thức tính mật độ xây dựng">
                                Mật độ XD
                            </button>
                            <button class="quick-suggestion-btn" data-question="Gợi ý mặt bằng nhà ống">
                                Mặt bằng
                            </button>
                            <button class="quick-suggestion-btn" data-question="Tài liệu đồ án kiến trúc">
                                Tài liệu
                            </button>
                            <button class="quick-suggestion-btn" data-question="Thông gió tự nhiên">
                                Thông gió
                            </button>
                        </div>
                        
                        <button class="open-full-chat-btn" id="open-full-chat">
                            <span class="material-symbols-outlined">forum</span>
                            Mở Studio Chat
                        </button>
                    </div>
                </div>
                
                <!-- Original Popup (minimal) -->
                <div class="ai-chat-popup">
                    <div class="ai-chat-header">
                        <span class="ai-status-indicator"></span>
                        <h3 class="mono-label font-bold">TRỢ GIẢNG AI ONLINE</h3>
                    </div>
                    <p class="ai-chat-message">
                        "Tôi đã sẵn sàng hỗ trợ bạn tính toán mật độ xây dựng hoặc gợi ý mặt bằng điển hình cho đồ án hiện tại."
                    </p>
                    <button class="ai-chat-button">BẮT ĐẦU HỘI THOẠI</button>
                </div>
                
                <!-- Toggle Button -->
                <button class="ai-chat-toggle">
                    <span class="material-symbols-outlined ai-chat-icon">smart_toy</span>
                </button>
            </div>
        </div>
        `;
        
        const container = document.getElementById('ai-chat-widget');
        if (container) {
            container.innerHTML = widgetHTML;
        }
        
        // Add welcome message
        this.addWelcomeMessage();
    }
    
    addWelcomeMessage() {
        const welcomeMessage = {
            type: 'ai',
            content: 'Xin chào! Tôi là HAU Assistant. Tôi có thể hỗ trợ bạn với các câu hỏi về kiến trúc, tính toán mật độ xây dựng, gợi ý mặt bằng, hoặc tài liệu tham khảo.',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        
        this.addMessageToChat(welcomeMessage);
    }
    
    addMessageToChat(message) {
        this.chatHistory.push(message);
        
        const messagesContainer = document.getElementById('quick-chat-messages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message-container message-${message.type}`;
        
        if (message.type === 'ai') {
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <span class="material-symbols-outlined">auto_awesome</span>
                </div>
                <div class="message-bubble">${message.content}</div>
                <div class="message-time">${message.timestamp}</div>
            `;
        } else {
            messageElement.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <div class="message-avatar">
                        <span class="material-symbols-outlined">person</span>
                    </div>
                    <div class="message-bubble">${message.content}</div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        
        // Auto scroll to bottom
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('quick-chat-messages');
        if (!messagesContainer) return;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    initEventListeners() {
        const chatToggle = document.querySelector('.ai-chat-toggle');
        const quickChatPopup = document.querySelector('.quick-chat-popup');
        const quickSendBtn = document.querySelector('.quick-send-btn');
        const quickChatInput = document.querySelector('.quick-chat-input');
        const quickSuggestionBtns = document.querySelectorAll('.quick-suggestion-btn');
        const openFullChatBtn = document.getElementById('open-full-chat');
        
        // Toggle QUICK chat popup
        if (chatToggle) {
            chatToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Chat toggle clicked');
                quickChatPopup.classList.toggle('active');
                this.isChatOpen = !this.isChatOpen;
                
                // Focus input khi mở
                if (this.isChatOpen && quickChatInput) {
                    setTimeout(() => {
                        quickChatInput.focus();
                    }, 100);
                }
            });
        }
        
        // Send message
        if (quickSendBtn && quickChatInput) {
            const sendMessage = () => {
                const message = quickChatInput.value.trim();
                if (message) {
                    this.sendQuickMessage(message);
                    quickChatInput.value = '';
                }
            };
            
            quickSendBtn.addEventListener('click', sendMessage);
            
            quickChatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        // Quick suggestion buttons
        quickSuggestionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const question = btn.getAttribute('data-question');
                if (question) {
                    this.sendQuickMessage(question);
                }
            });
        });
        
        // Open full chat page
        if (openFullChatBtn) {
            openFullChatBtn.addEventListener('click', () => {
                window.location.href = '../pages/ai/ai-chat.html';
            });
        }
        
        // Close quick chat khi click bên ngoài
        document.addEventListener('click', (e) => {
            if (quickChatPopup && 
                !quickChatPopup.contains(e.target) && 
                !chatToggle.contains(e.target) && 
                quickChatPopup.classList.contains('active')) {
                quickChatPopup.classList.remove('active');
                this.isChatOpen = false;
            }
        });
    }
    
    sendQuickMessage(message) {
        if (!message.trim()) return;
        
        // Add user message
        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        
        this.addMessageToChat(userMessage);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response sau 1-2 giây
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const response = this.getArchitecturalResponse(message);
            const aiMessage = {
                type: 'ai',
                content: response,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            };
            
            this.addMessageToChat(aiMessage);
        }, 1000 + Math.random() * 800);
    }
    
    getArchitecturalResponse(userMessage) {
        const responses = {
            'mật độ xây dựng': `**Công thức tính mật độ xây dựng:**
            
MĐXD = (Diện tích xây dựng / Tổng diện tích lô đất) × 100%

• Nhà ở thấp tầng: 60-70% tối đa
• Nhà ở cao tầng: 40-50% tối đa
• Công trình công cộng: 30-40% tối đa

*Theo QCVN 01:2021*`,
            
            'mặt bằng nhà ống': `**Giải pháp mặt bằng nhà ống:**
1. Giếng trời trung tâm - Thông thoáng & chiếu sáng
2. Thông gió chéo - Tạo luồng khí xuyên suốt
3. Bố trí không gian mở - Kết nối các khu chức năng
4. Tận dụng chiều cao - Tầng lửng, double height
5. Vật liệu nhẹ & sáng - Gỗ, kính, composite`,
            
            'tài liệu đồ án': `**Tài liệu tham khảo:**
📚 Sách chuyên ngành:
- "Kiến trúc nhà ở Việt Nam" - GS. Nguyễn Bá Đang
- "Thiết kế đô thị bền vững" - TS. Lê Văn Thương

🏛️ Case study:
- Bảo tàng Guggenheim Bilbao
- Các công trình Kiến trúc Xanh`,
            
            'thông gió tự nhiên': `**Giải pháp thông gió tự nhiên:**
1. Thông gió chéo - Mở cửa đối diện nhau
2. Thông gió đứng - Sử dụng giếng trời, ống khói nhiệt
3. Thông gió áp mái - Hút gió qua hệ thống mái
4. Vật liệu thoáng khí - Gạch block, lam chắn nắng`,
            
            'kiến trúc': `**Kiến trúc tại HAU:**
Công năng × Thẩm mỹ × Bền vững

• Công năng - Tối ưu không gian
• Thẩm mỹ - Ngôn ngữ kiến trúc Việt đương đại
• Bền vững - Thích ứng khí hậu nhiệt đới`,
            
            'thiết kế': `**Quy trình thiết kế:**
1. Nghiên cứu (20%) - Site analysis
2. Concept (30%) - Ý tưởng, parti
3. Phát triển (40%) - Mặt bằng, mặt đứng
4. Trình bày (10%) - Render, bản vẽ`,
            
            'đồ án': `**Cấu trúc đồ án HAU:**
📋 Phần 1: Nghiên cứu tổng quan (20%)
💡 Phần 2: Ý tưởng thiết kế (30%)
🏗️ Phần 3: Giải pháp kiến trúc (40%)
📊 Phần 4: Kỹ thuật & Kết luận (10%)`
        };
        
        const lowerMsg = userMessage.toLowerCase();
        let response = `Tôi đã nhận được câu hỏi của bạn. Để được tư vấn chi tiết hơn, bạn có thể mở **Studio Chat đầy đủ** hoặc hỏi cụ thể hơn về thiết kế mặt bằng, tính toán kỹ thuật, giải pháp bền vững, hoặc tài liệu tham khảo.

*Trợ giảng AI - HAU Studio*`;
        
        for (const [keyword, aiResponse] of Object.entries(responses)) {
            if (lowerMsg.includes(keyword.toLowerCase())) {
                response = aiResponse;
                break;
            }
        }
        
        return response;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AIChatWidget = AIChatWidget;
}