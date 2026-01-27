import { aiService } from '../services/ai-service.js';
import { showNotification } from '../components/notification.js';

class AIChatPage {
    constructor() {
        this.init();
    }

    init() {
        this.elements = {
            messageInput: document.getElementById('message-input'),
            sendButton: document.getElementById('send-message'),
            chatMessages: document.getElementById('chat-messages'),
            quickSuggestions: document.querySelectorAll('.quick-suggestion'),
            newChatBtn: document.getElementById('new-chat'),
            chatHistoryItems: document.querySelectorAll('.chat-item'),
            shareButton: document.getElementById('share-chat'),
            exportPdfButton: document.getElementById('export-pdf')
        };

        this.currentChatId = null;
        this.messages = [];
        
        this.loadChatHistory();
        this.setupEventListeners();
        this.autoResizeTextarea();
        this.setupChatSidebar();
    }

    setupEventListeners() {
        // Send message on Enter (Shift+Enter for new line)
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send button click
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());

        // Quick suggestions
        this.elements.quickSuggestions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.target.dataset.suggestion;
                this.elements.messageInput.value = suggestion;
                this.sendMessage();
            });
        });

        // New chat button
        if (this.elements.newChatBtn) {
            this.elements.newChatBtn.addEventListener('click', () => this.startNewChat());
        }

        // Share chat
        if (this.elements.shareButton) {
            this.elements.shareButton.addEventListener('click', () => this.shareChat());
        }

        // Export PDF
        if (this.elements.exportPdfButton) {
            this.elements.exportPdfButton.addEventListener('click', () => this.exportToPDF());
        }

        // Voice input
        const voiceBtn = document.getElementById('voice-input');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.startVoiceInput());
        }

        // Attach file
        const attachBtn = document.getElementById('attach-file');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.attachFile());
        }
    }

    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        // Clear input
        this.elements.messageInput.value = '';
        this.autoResizeTextarea();

        // Show loading indicator
        const loadingId = this.showLoading();

        try {
            // Send to AI service
            const response = await aiService.sendMessage(message, this.currentChatId);
            
            // Remove loading
            this.removeLoading(loadingId);
            
            // Add AI response
            this.addMessage({
                type: 'ai',
                content: response.content,
                resources: response.resources,
                suggestions: response.suggestions,
                timestamp: new Date()
            });

            // Update chat history
            if (!this.currentChatId) {
                this.currentChatId = response.chatId;
                this.addToChatHistory(response.chatId, message);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.removeLoading(loadingId);
            this.showError('Không thể kết nối với AI. Vui lòng thử lại sau.');
        }
    }

    addMessage(messageData) {
        const messageElement = this.createMessageElement(messageData);
        this.elements.chatMessages.appendChild(messageElement);
        this.messages.push(messageData);
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const isAI = message.type === 'ai';
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isAI ? '' : 'user'}`;
        
        const avatar = isAI ? 
            `<div class="message-avatar">
                <div class="ai-avatar-small">
                    <span class="material-symbols-outlined">smart_toy</span>
                </div>
            </div>` :
            `<div class="message-avatar">
                <div class="user-avatar">
                    <img src="../../assets/images/avatars/default-avatar.jpg" alt="User">
                </div>
            </div>`;
        
        const sender = isAI ? 'HauAssistant' : 'Bạn';
        const senderClass = isAI ? 'ai' : 'user';
        
        let content = message.content;
        
        // Add resources if available
        if (message.resources && message.resources.length > 0) {
            content += this.createResourcesHTML(message.resources);
        }
        
        // Add quick actions if available
        if (message.suggestions && message.suggestions.length > 0) {
            content += this.createQuickActionsHTML(message.suggestions);
        }
        
        messageDiv.innerHTML = `
            ${avatar}
            <div class="message-content">
                <div class="message-sender ${senderClass}">${sender}</div>
                <div class="message-bubble ${isAI ? 'ai' : 'user'}">
                    ${content}
                </div>
            </div>
        `;
        
        return messageDiv;
    }

    createResourcesHTML(resources) {
        return `
            <div class="resources-box">
                <div class="resources-header">
                    <span class="material-symbols-outlined resources-icon">local_library</span>
                    <h4 class="resources-title">Tài liệu tham khảo học thuật</h4>
                </div>
                <div class="resources-grid">
                    ${resources.map(resource => `
                        <a href="${resource.url}" class="resource-card" target="_blank">
                            <div class="resource-icon ${resource.type}">
                                <span class="material-symbols-outlined">${resource.icon}</span>
                            </div>
                            <div class="resource-info">
                                <p class="resource-name">${resource.name}</p>
                                <p class="resource-source">${resource.source}</p>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createQuickActionsHTML(suggestions) {
        return `
            <div class="message-actions">
                ${suggestions.map(suggestion => `
                    <button class="quick-action-btn" data-action="${suggestion}">${suggestion}</button>
                `).join('')}
            </div>
        `;
    }

    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message';
        loadingDiv.id = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="message-avatar">
                <div class="ai-avatar-small">
                    <span class="material-symbols-outlined">smart_toy</span>
                </div>
            </div>
            <div class="message-content">
                <div class="message-sender ai">HauAssistant</div>
                <div class="message-bubble ai">
                    <div class="loading-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        
        this.elements.chatMessages.appendChild(loadingDiv);
        this.scrollToBottom();
        return 'loading-indicator';
    }

    removeLoading(loadingId) {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }, 100);
    }

    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    loadChatHistory() {
        // Load from localStorage or API
        const history = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');
        this.updateChatHistoryUI(history);
    }

    updateChatHistoryUI(history) {
        // Update sidebar with chat history
        // Implementation depends on your sidebar component
    }

    addToChatHistory(chatId, firstMessage) {
        const history = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');
        history.unshift({
            id: chatId,
            title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
            timestamp: new Date().toISOString(),
            subject: 'Kết cấu bê tông cốt thép'
        });
        
        localStorage.setItem('aiChatHistory', JSON.stringify(history.slice(0, 20))); // Keep last 20
        this.updateChatHistoryUI(history);
    }

    startNewChat() {
        this.currentChatId = null;
        this.messages = [];
        this.elements.chatMessages.innerHTML = '';
        
        // Add welcome message
        this.addWelcomeMessage();
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            type: 'ai',
            content: `Chào bạn! Tôi là trợ giảng AI của HauHub. Tôi đã sẵn sàng đồng hành cùng bạn trong môn **Kết cấu bê tông cốt thép**.\n\nChúng ta có thể bắt đầu bằng việc giải thích các khái niệm, tra cứu tiêu chuẩn hoặc kiểm tra các bước tính toán đồ án. Bạn muốn bắt đầu từ đâu?`,
            suggestions: ['Quy chuẩn TCVN 5574', 'Tính toán dầm', 'Cấu tạo móng'],
            timestamp: new Date()
        };
        
        this.addMessage(welcomeMessage);
    }

    async shareChat() {
        try {
            const chatData = {
                messages: this.messages,
                timestamp: new Date().toISOString(),
                subject: 'Kết cấu bê tông cốt thép'
            };
            
            // Create shareable link or text
            const shareText = this.generateShareText(chatData);
            
            if (navigator.share) {
                await navigator.share({
                    title: 'Cuộc trò chuyện với HauAssistant',
                    text: shareText,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                showNotification('Đã sao chép cuộc trò chuyện vào clipboard!', 'success');
            }
        } catch (error) {
            console.error('Error sharing chat:', error);
            showNotification('Không thể chia sẻ cuộc trò chuyện', 'error');
        }
    }

    generateShareText(chatData) {
        let text = `Cuộc trò chuyện với HauAssistant - ${chatData.subject}\n\n`;
        
        chatData.messages.forEach(msg => {
            const sender = msg.type === 'ai' ? 'HauAssistant' : 'Bạn';
            text += `${sender}: ${msg.content}\n\n`;
        });
        
        return text;
    }

    async exportToPDF() {
        showNotification('Tính năng xuất PDF đang được phát triển...', 'info');
    }

    async startVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            showNotification('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói', 'warning');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();
        showNotification('Đang nghe... Nói điều bạn muốn hỏi', 'info');

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.elements.messageInput.value = transcript;
            this.autoResizeTextarea();
            this.sendMessage();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            showNotification('Không thể nhận diện giọng nói', 'error');
        };
    }

    attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.jpg,.png,.txt';
        input.onchange = (e) => this.handleFileUpload(e.target.files[0]);
        input.click();
    }

    async handleFileUpload(file) {
        if (!file) return;

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showNotification('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB', 'error');
            return;
        }

        try {
            // Upload file and get analysis
            const analysis = await aiService.analyzeFile(file);
            
            // Add message with file analysis
            this.addMessage({
                type: 'ai',
                content: `Tôi đã phân tích file "${file.name}":\n\n${analysis.summary}`,
                resources: analysis.resources,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error uploading file:', error);
            showNotification('Không thể phân tích file', 'error');
        }
    }

    setupChatSidebar() {
        // Load chat history into sidebar
        // Add event listeners for chat history items
        this.elements.chatHistoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const chatId = e.currentTarget.dataset.chatId;
                this.loadChat(chatId);
            });
        });
    }

    async loadChat(chatId) {
        try {
            const chat = await aiService.getChatHistory(chatId);
            this.currentChatId = chatId;
            this.messages = chat.messages;
            this.renderMessages();
        } catch (error) {
            console.error('Error loading chat:', error);
            showNotification('Không thể tải cuộc trò chuyện', 'error');
        }
    }

    renderMessages() {
        this.elements.chatMessages.innerHTML = '';
        this.messages.forEach(message => {
            const element = this.createMessageElement(message);
            this.elements.chatMessages.appendChild(element);
        });
        this.scrollToBottom();
    }

    showError(message) {
        this.addMessage({
            type: 'ai',
            content: `Xin lỗi, có lỗi xảy ra: ${message}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ kỹ thuật.`,
            timestamp: new Date()
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIChatPage();
});

export { AIChatPage };