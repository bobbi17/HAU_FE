/**
 * Group Chat Page JavaScript
 * Handles real-time chat functionality for studio groups
 */

class GroupChat {
    constructor() {
        this.currentGroup = null;
        this.currentUser = null;
        this.socket = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadGroupData();
        this.bindEvents();
        this.setupWebSocket();
        this.setupAutoScroll();
    }

    async loadUserData() {
        try {
            // Load current user data
            const userId = this.getCurrentUserId();
            const userData = await this.fetchUserData(userId);
            this.currentUser = userData;
            
            // Update UI with user data
            this.updateUserUI();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadGroupData() {
        try {
            // Get group ID from URL
            const groupId = this.getGroupIdFromURL();
            if (!groupId) {
                console.error('No group ID specified');
                return;
            }

            // Load group data
            const groupData = await this.fetchGroupData(groupId);
            this.currentGroup = groupData;
            
            // Update UI with group data
            this.updateGroupUI();
            
            // Load group messages
            await this.loadMessages();
            
            // Load group members
            await this.loadMembers();
            
        } catch (error) {
            console.error('Error loading group data:', error);
        }
    }

    bindEvents() {
        // Send message button
        const sendBtn = document.getElementById('send-message');
        const messageInput = document.getElementById('message-input');
        
        if (sendBtn && messageInput) {
            // Send on button click
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
            
            // Send on Enter key (Ctrl+Enter for new line)
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
            messageInput.addEventListener('input', () => {
                this.autoResizeTextarea(messageInput);
            });
        }
        
        // Group selection
        document.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const groupId = e.currentTarget.dataset.groupId;
                if (groupId) {
                    this.switchGroup(groupId);
                }
            });
        });
        
        // File attachment
        const fileBtn = document.querySelector('.tool-btn:nth-child(2)');
        if (fileBtn) {
            fileBtn.addEventListener('click', () => {
                this.openFilePicker();
            });
        }
        
        // Call buttons
        const callBtn = document.querySelector('.header-btn:nth-child(1)');
        const videoBtn = document.querySelector('.header-btn:nth-child(2)');
        
        if (callBtn) {
            callBtn.addEventListener('click', () => {
                this.initiateCall('audio');
            });
        }
        
        if (videoBtn) {
            videoBtn.addEventListener('click', () => {
                this.initiateCall('video');
            });
        }
        
        // View all files button
        const viewAllBtn = document.querySelector('.view-all-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.viewAllFiles();
            });
        }
        
        // AI assistant button
        const aiBtn = document.querySelector('.ai-btn');
        if (aiBtn) {
            aiBtn.addEventListener('click', () => {
                this.openAIAssistant();
            });
        }
    }

    setupWebSocket() {
        // Connect to WebSocket server
        const wsUrl = this.getWebSocketUrl();
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.joinGroup();
        };
        
        this.socket.onmessage = (event) => {
            this.handleWebSocketMessage(event);
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            // Try to reconnect after 5 seconds
            setTimeout(() => this.setupWebSocket(), 5000);
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    joinGroup() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentGroup) {
            const joinMessage = {
                type: 'join',
                groupId: this.currentGroup.id,
                userId: this.currentUser.id
            };
            this.socket.send(JSON.stringify(joinMessage));
        }
    }

    handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'message':
                    this.handleNewMessage(message);
                    break;
                    
                case 'member_joined':
                    this.handleMemberJoined(message);
                    break;
                    
                case 'member_left':
                    this.handleMemberLeft(message);
                    break;
                    
                case 'typing':
                    this.handleTypingIndicator(message);
                    break;
                    
                case 'file_uploaded':
                    this.handleFileUploaded(message);
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const messageText = messageInput.value.trim();
        
        if (!messageText) return;
        
        if (!this.currentGroup) {
            this.showError('Không tìm thấy nhóm chat');
            return;
        }
        
        try {
            // Create message object
            const message = {
                type: 'message',
                groupId: this.currentGroup.id,
                userId: this.currentUser.id,
                content: messageText,
                timestamp: new Date().toISOString(),
                attachments: [] // Can add file attachments here
            };
            
            // Send via WebSocket
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(message));
            } else {
                // Fallback to HTTP if WebSocket is not available
                await this.sendMessageViaHTTP(message);
            }
            
            // Clear input
            messageInput.value = '';
            this.autoResizeTextarea(messageInput);
            
            // Add to UI immediately (optimistic update)
            this.addMessageToUI(message, true);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Không thể gửi tin nhắn');
        }
    }

    addMessageToUI(message, isSentByUser = false) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        // Check if we need to add date separator
        this.addDateSeparatorIfNeeded(message.timestamp);
        
        // Create message element
        const messageElement = this.createMessageElement(message, isSentByUser);
        
        // Add to container
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    createMessageElement(message, isSentByUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSentByUser ? 'sent' : 'received'}`;
        
        // Format time
        const time = new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (isSentByUser) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-time">${time}</span>
                        <span class="message-author">BẠN</span>
                    </div>
                    <div class="message-bubble">
                        <p class="message-text">${this.escapeHtml(message.content)}</p>
                    </div>
                </div>
                <div class="message-avatar">
                    <img src="${this.currentUser.avatar || '../../assets/images/avatars/current-user.jpg'}" alt="Your Avatar">
                </div>
            `;
        } else {
            // For received messages, we need to fetch sender info
            // This is simplified - in production you'd have user data
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-placeholder"></div>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${message.senderName || 'THÀNH VIÊN'}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-bubble">
                        <p class="message-text">${this.escapeHtml(message.content)}</p>
                    </div>
                </div>
            `;
        }
        
        return messageDiv;
    }

    async loadMessages() {
        try {
            const messages = await this.fetchGroupMessages(this.currentGroup.id);
            const messagesContainer = document.getElementById('chat-messages');
            
            // Clear existing messages (except date separators)
            messagesContainer.innerHTML = '';
            
            // Add messages to UI
            let lastDate = null;
            messages.forEach(message => {
                // Add date separator if needed
                const messageDate = new Date(message.timestamp).toDateString();
                if (messageDate !== lastDate) {
                    this.addDateSeparator(message.timestamp);
                    lastDate = messageDate;
                }
                
                // Add message
                const isSentByUser = message.userId === this.currentUser.id;
                const messageElement = this.createMessageElement(message, isSentByUser);
                messagesContainer.appendChild(messageElement);
            });
            
            // Scroll to bottom
            this.scrollToBottom();
            
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async loadMembers() {
        try {
            const members = await this.fetchGroupMembers(this.currentGroup.id);
            this.updateMembersList(members);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    }

    updateMembersList(members) {
        const memberList = document.querySelector('.member-list');
        if (!memberList) return;
        
        // Clear existing members (except the first few sample ones)
        const sampleItems = memberList.querySelectorAll('.member-item');
        for (let i = 3; i < sampleItems.length; i++) {
            sampleItems[i].remove();
        }
        
        // Add real members
        members.forEach(member => {
            if (member.id !== this.currentUser.id) { // Don't add current user
                const memberElement = this.createMemberElement(member);
                memberList.appendChild(memberElement);
            }
        });
    }

    createMemberElement(member) {
        const div = document.createElement('div');
        div.className = `member-item ${member.isOnline ? 'online' : 'offline'}`;
        
        div.innerHTML = `
            <div class="member-avatar">
                <div class="avatar-placeholder"></div>
                ${member.isOnline ? '<div class="status-indicator"></div>' : ''}
            </div>
            <div class="member-info">
                <p class="member-name">${member.name}</p>
                <p class="member-role">${member.role || 'THÀNH VIÊN'}</p>
            </div>
        `;
        
        return div;
    }

    addDateSeparatorIfNeeded(timestamp) {
        const messagesContainer = document.getElementById('chat-messages');
        const lastChild = messagesContainer.lastElementChild;
        
        if (!lastChild || !lastChild.classList.contains('date-separator')) {
            this.addDateSeparator(timestamp);
        } else {
            // Check if same date
            const lastDate = new Date(this.lastMessageTimestamp).toDateString();
            const newDate = new Date(timestamp).toDateString();
            
            if (lastDate !== newDate) {
                this.addDateSeparator(timestamp);
            }
        }
        
        this.lastMessageTimestamp = timestamp;
    }

    addDateSeparator(timestamp) {
        const messagesContainer = document.getElementById('chat-messages');
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).toUpperCase();
        
        const separator = document.createElement('div');
        separator.className = 'date-separator';
        separator.innerHTML = `<span>${formattedDate} - SESSION_${this.getSessionNumber(date)}</span>`;
        
        messagesContainer.appendChild(separator);
    }

    getSessionNumber(date) {
        // Simple session number based on week of month
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const pastDaysOfMonth = (date - firstDay) / 86400000;
        return Math.ceil((pastDaysOfMonth + firstDay.getDay() + 1) / 7);
    }

    async switchGroup(groupId) {
        // Update active group in sidebar
        document.querySelectorAll('.group-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.group-item[data-group-id="${groupId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // Leave current group
        if (this.currentGroup) {
            this.leaveGroup();
        }
        
        // Load new group
        await this.loadGroupData();
        
        // Join new group via WebSocket
        this.joinGroup();
    }

    leaveGroup() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentGroup) {
            const leaveMessage = {
                type: 'leave',
                groupId: this.currentGroup.id,
                userId: this.currentUser.id
            };
            this.socket.send(JSON.stringify(leaveMessage));
        }
    }

    handleNewMessage(message) {
        // Check if message is from current group
        if (message.groupId === this.currentGroup.id) {
            const isSentByUser = message.userId === this.currentUser.id;
            this.addMessageToUI(message, isSentByUser);
        }
    }

    handleMemberJoined(message) {
        if (message.groupId === this.currentGroup.id) {
            this.showNotification(`${message.userName} đã tham gia nhóm`);
            this.updateMemberStatus(message.userId, true);
        }
    }

    handleMemberLeft(message) {
        if (message.groupId === this.currentGroup.id) {
            this.showNotification(`${message.userName} đã rời nhóm`);
            this.updateMemberStatus(message.userId, false);
        }
    }

    handleTypingIndicator(message) {
        // Show typing indicator
        if (message.groupId === this.currentGroup.id && message.userId !== this.currentUser.id) {
            this.showTypingIndicator(message.userName);
        }
    }

    handleFileUploaded(message) {
        if (message.groupId === this.currentGroup.id) {
            // Add file to file grid
            this.addFileToGrid(message.file);
            // Show notification
            this.showNotification(`Đã tải lên: ${message.file.name}`);
        }
    }

    updateMemberStatus(userId, isOnline) {
        const memberItem = document.querySelector(`.member-item[data-user-id="${userId}"]`);
        if (memberItem) {
            if (isOnline) {
                memberItem.classList.remove('offline');
                memberItem.classList.add('online');
                const statusIndicator = memberItem.querySelector('.status-indicator');
                if (!statusIndicator) {
                    const avatarDiv = memberItem.querySelector('.member-avatar');
                    if (avatarDiv) {
                        const indicator = document.createElement('div');
                        indicator.className = 'status-indicator';
                        avatarDiv.appendChild(indicator);
                    }
                }
            } else {
                memberItem.classList.remove('online');
                memberItem.classList.add('offline');
                const statusIndicator = memberItem.querySelector('.status-indicator');
                if (statusIndicator) {
                    statusIndicator.remove();
                }
            }
        }
    }

    showTypingIndicator(userName) {
        // Implementation for typing indicator
        console.log(`${userName} is typing...`);
    }

    addFileToGrid(file) {
        const fileGrid = document.querySelector('.file-grid');
        if (!fileGrid) return;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.title = file.name;
        
        // Determine icon based on file type
        let icon = 'description';
        if (file.type.startsWith('image/')) {
            icon = 'image';
        } else if (file.type === 'application/pdf') {
            icon = 'picture_as_pdf';
        } else if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
            icon = 'folder_zip';
        }
        
        fileItem.innerHTML = `<span class="material-symbols-outlined">${icon}</span>`;
        fileItem.addEventListener('click', () => {
            this.downloadFile(file);
        });
        
        fileGrid.appendChild(fileItem);
    }

    // Utility Methods
    getGroupIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('groupId') || 'studio-a-01';
    }

    getCurrentUserId() {
        // Get from localStorage or auth system
        return localStorage.getItem('user_id') || 'user-001';
    }

    getWebSocketUrl() {
        // In production, use your WebSocket server URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws`;
    }

    updateUserUI() {
        if (!this.currentUser) return;
        
        // Update user badge
        const badgeText = document.querySelector('.badge-text');
        if (badgeText && this.currentUser.username) {
            badgeText.textContent = this.currentUser.username.toUpperCase();
        }
        
        // Update avatar
        const badgeAvatar = document.querySelector('.badge-avatar img');
        if (badgeAvatar && this.currentUser.avatar) {
            badgeAvatar.src = this.currentUser.avatar;
        }
        
        // Update chat avatar
        const chatAvatar = document.querySelector('.message.sent .message-avatar img');
        if (chatAvatar && this.currentUser.avatar) {
            chatAvatar.src = this.currentUser.avatar;
        }
    }

    updateGroupUI() {
        if (!this.currentGroup) return;
        
        // Update group title
        const titleElement = document.querySelector('.chat-title');
        if (titleElement && this.currentGroup.name) {
            titleElement.textContent = this.currentGroup.name.toUpperCase();
        }
        
        // Update studio info
        const studioLabel = document.querySelector('.card-label');
        if (studioLabel && this.currentGroup.projectName) {
            studioLabel.textContent = this.currentGroup.projectName.toUpperCase().replace(' ', '_');
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    setupAutoScroll() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            // Scroll to bottom on new messages
            const observer = new MutationObserver(() => {
                this.scrollToBottom();
            });
            
            observer.observe(messagesContainer, {
                childList: true,
                subtree: true
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // API Methods (mock implementations - replace with real API calls)
    async fetchUserData(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: userId,
                    username: 'student_24',
                    name: 'Nguyễn Văn A',
                    avatar: '../../assets/images/avatars/current-user.jpg',
                    role: 'Sinh viên'
                });
            }, 100);
        });
    }

    async fetchGroupData(groupId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: groupId,
                    name: 'STUDIO_A.01_ĐỒ ÁN 1',
                    projectName: 'PROJECT_A.01 RESIDENTIAL_COMPLEX',
                    courseCode: 'ARC402',
                    instructor: 'KTS. HOÀNG NAM',
                    members: []
                });
            }, 100);
        });
    }

    async fetchGroupMessages(groupId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 'msg1',
                        groupId: groupId,
                        userId: 'instructor-001',
                        senderName: 'KTS. HOÀNG NAM',
                        content: 'Mọi người xem qua file nhiệm vụ thiết kế mới nhé. Chú ý phần mật độ xây dựng tại khu vực phố cũ, không được vượt quá 60%.',
                        timestamp: new Date(Date.now() - 3600000).toISOString()
                    },
                    {
                        id: 'msg2',
                        groupId: groupId,
                        userId: 'user-001',
                        senderName: 'BẠN',
                        content: 'Em đã nhận được ạ. Em đang triển khai mặt bằng tầng 1 theo hướng tiếp cận từ phía Đông.',
                        timestamp: new Date(Date.now() - 3300000).toISOString()
                    },
                    {
                        id: 'msg3',
                        groupId: groupId,
                        userId: 'user-002',
                        senderName: 'KHÁNH LINH',
                        content: 'Tớ có sưu tầm được bản vẽ mẫu này, có thể áp dụng tỷ lệ này vào khối đế được không thầy?',
                        timestamp: new Date(Date.now() - 3000000).toISOString()
                    }
                ]);
            }, 100);
        });
    }

    async fetchGroupMembers(groupId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 'instructor-001',
                        name: 'Hoàng Nam',
                        role: 'GIẢNG VIÊN HƯỚNG DẪN',
                        isOnline: true
                    },
                    {
                        id: 'user-002',
                        name: 'Nguyễn Linh',
                        role: 'LỚP TRƯỞNG',
                        isOnline: true
                    },
                    {
                        id: 'user-003',
                        name: 'Trần Minh',
                        role: 'THÀNH VIÊN',
                        isOnline: false
                    },
                    {
                        id: 'user-004',
                        name: 'Phạm Hùng',
                        role: 'THÀNH VIÊN',
                        isOnline: true
                    }
                ]);
            }, 100);
        });
    }

    async sendMessageViaHTTP(message) {
        // Fallback HTTP implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Message sent via HTTP:', message);
                resolve({ success: true });
            }, 100);
        });
    }

    // Feature Methods
    openFilePicker() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.jpg,.jpeg,.png,.pdf,.dwg,.dxf,.skp,.rvt,.zip';
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            for (const file of files) {
                await this.uploadFile(file);
            }
        };
        
        input.click();
    }

    async uploadFile(file) {
        try {
            // Show loading
            this.showLoading(true);
            
            // Upload file to server
            const formData = new FormData();
            formData.append('file', file);
            formData.append('groupId', this.currentGroup.id);
            formData.append('userId', this.currentUser.id);
            
            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const result = await response.json();
            
            // Send file message via WebSocket
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                const message = {
                    type: 'file_uploaded',
                    groupId: this.currentGroup.id,
                    userId: this.currentUser.id,
                    file: result.file,
                    timestamp: new Date().toISOString()
                };
                this.socket.send(JSON.stringify(message));
            }
            
            this.showSuccess(`Đã tải lên: ${file.name}`);
            
        } catch (error) {
            console.error('Error uploading file:', error);
            this.showError('Không thể tải lên file');
        } finally {
            this.showLoading(false);
        }
    }

    downloadFile(file) {
        // Implementation for file download
        console.log('Downloading file:', file.name);
        // In production, this would trigger a download
    }

    initiateCall(type) {
        // Implementation for voice/video call
        console.log(`Initiating ${type} call`);
        // In production, this would use WebRTC
    }

    viewAllFiles() {
        // Implementation for viewing all files
        console.log('Viewing all files');
        // In production, this would open a modal or new page
    }

    openAIAssistant() {
        // Implementation for AI assistant
        console.log('Opening AI assistant');
        // In production, this would open a chat interface
    }

    showLoading(show) {
        // Implementation for loading indicator
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            if (show) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        });
    }

    showSuccess(message) {
        // Implementation for success notification
        console.log('Success:', message);
        // In production, use your notification system
        alert(message);
    }

    showError(message) {
        // Implementation for error notification
        console.error('Error:', message);
        // In production, use your notification system
        alert(message);
    }

    showNotification(message) {
        // Implementation for notification
        console.log('Notification:', message);
        // In production, use your notification system
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const groupChat = new GroupChat();
    window.groupChat = groupChat;
});