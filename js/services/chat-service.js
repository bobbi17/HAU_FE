/**
 * Chat Service
 * Handles chat-related API calls
 */

class ChatService {
    constructor() {
        this.baseUrl = '/api/chat';
        this.wsUrl = this.getWebSocketUrl();
        this.socket = null;
    }

    // WebSocket Methods
    connectToGroup(groupId, userId) {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(`${this.wsUrl}?groupId=${groupId}&userId=${userId}`);
            
            this.socket.onopen = () => {
                resolve(this.socket);
            };
            
            this.socket.onerror = (error) => {
                reject(error);
            };
        });
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    // HTTP API Methods
    async getGroupChats(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups?userId=${userId}`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    }

    async getGroupMessages(groupId, limit = 50, offset = 0) {
        try {
            const response = await fetch(
                `${this.baseUrl}/groups/${groupId}/messages?limit=${limit}&offset=${offset}`,
                {
                    headers: this.getHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    async getGroupMembers(groupId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/members`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch members');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching members:', error);
            throw error;
        }
    }

    async sendChatMessage(messageData) {
        try {
            const response = await fetch(`${this.baseUrl}/messages`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(messageData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async uploadFile(groupId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('groupId', groupId);
            
            const response = await fetch(`${this.baseUrl}/files/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload file');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async getGroupFiles(groupId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/files`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching files:', error);
            throw error;
        }
    }

    // Utility Methods
    getWebSocketUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws/chat`;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    getAuthToken() {
        // Get auth token from localStorage or cookies
        return localStorage.getItem('auth_token') || 
               document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*=\s*([^;]*).*$)|^.*$/, '$1');
    }

    // Real-time typing indicators
    sendTypingIndicator(groupId, userId, userName) {
        const typingMessage = {
            type: 'typing',
            groupId: groupId,
            userId: userId,
            userName: userName,
            timestamp: new Date().toISOString()
        };
        
        return this.sendMessage(typingMessage);
    }

    sendReadReceipt(groupId, userId, messageId) {
        const receipt = {
            type: 'read_receipt',
            groupId: groupId,
            userId: userId,
            messageId: messageId,
            timestamp: new Date().toISOString()
        };
        
        return this.sendMessage(receipt);
    }

    // Group management
    async createGroup(groupData) {
        try {
            const response = await fetch(`${this.baseUrl}/groups`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(groupData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create group');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    }

    async updateGroup(groupId, groupData) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(groupData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update group');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating group:', error);
            throw error;
        }
    }

    async deleteGroup(groupId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete group');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    }

    async addMemberToGroup(groupId, userId, role = 'member') {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/members`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ userId, role })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add member');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    }

    async removeMemberFromGroup(groupId, userId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/members/${userId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove member');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error removing member:', error);
            throw error;
        }
    }

    async updateMemberRole(groupId, userId, role) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/members/${userId}/role`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ role })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update role');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    // Message management
    async deleteMessage(messageId) {
        try {
            const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete message');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    async editMessage(messageId, newContent) {
        try {
            const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ content: newContent })
            });
            
            if (!response.ok) {
                throw new Error('Failed to edit message');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error editing message:', error);
            throw error;
        }
    }

    // Search functionality
    async searchMessages(groupId, query, limit = 20) {
        try {
            const response = await fetch(
                `${this.baseUrl}/groups/${groupId}/search?q=${encodeURIComponent(query)}&limit=${limit}`,
                {
                    headers: this.getHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to search messages');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    }

    async searchGroups(query, limit = 10) {
        try {
            const response = await fetch(
                `${this.baseUrl}/groups/search?q=${encodeURIComponent(query)}&limit=${limit}`,
                {
                    headers: this.getHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to search groups');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error searching groups:', error);
            throw error;
        }
    }

    // File management
    async deleteFile(fileId) {
        try {
            const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete file');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    async getFileInfo(fileId) {
        try {
            const response = await fetch(`${this.baseUrl}/files/${fileId}/info`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to get file info');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting file info:', error);
            throw error;
        }
    }

    // Statistics and analytics
    async getGroupStatistics(groupId, period = 'month') {
        try {
            const response = await fetch(
                `${this.baseUrl}/groups/${groupId}/statistics?period=${period}`,
                {
                    headers: this.getHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to get group statistics');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting group statistics:', error);
            throw error;
        }
    }

    async getUserChatStatistics(userId, period = 'month') {
        try {
            const response = await fetch(
                `${this.baseUrl}/users/${userId}/chat-statistics?period=${period}`,
                {
                    headers: this.getHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to get user chat statistics');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting user chat statistics:', error);
            throw error;
        }
    }

    // Notifications
    async getUnreadMessageCount() {
        try {
            const response = await fetch(`${this.baseUrl}/notifications/unread-count`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to get unread count');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    async markMessagesAsRead(groupId, lastReadMessageId = null) {
        try {
            const url = lastReadMessageId 
                ? `${this.baseUrl}/groups/${groupId}/read/${lastReadMessageId}`
                : `${this.baseUrl}/groups/${groupId}/read`;
                
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark messages as read');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }

    // Polls and reactions (advanced features)
    async createPoll(groupId, pollData) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/polls`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(pollData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create poll');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating poll:', error);
            throw error;
        }
    }

    async voteInPoll(pollId, optionId) {
        try {
            const response = await fetch(`${this.baseUrl}/polls/${pollId}/vote`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ optionId })
            });
            
            if (!response.ok) {
                throw new Error('Failed to vote in poll');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error voting in poll:', error);
            throw error;
        }
    }

    async addReaction(messageId, emoji) {
        try {
            const response = await fetch(`${this.baseUrl}/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ emoji })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add reaction');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error adding reaction:', error);
            throw error;
        }
    }

    async removeReaction(messageId, emoji) {
        try {
            const response = await fetch(`${this.baseUrl}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove reaction');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error removing reaction:', error);
            throw error;
        }
    }

    // Pin messages
    async pinMessage(groupId, messageId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/pinned-messages`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ messageId })
            });
            
            if (!response.ok) {
                throw new Error('Failed to pin message');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error pinning message:', error);
            throw error;
        }
    }

    async unpinMessage(groupId, messageId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/pinned-messages/${messageId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to unpin message');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error unpinning message:', error);
            throw error;
        }
    }

    async getPinnedMessages(groupId) {
        try {
            const response = await fetch(`${this.baseUrl}/groups/${groupId}/pinned-messages`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to get pinned messages');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting pinned messages:', error);
            throw error;
        }
    }

    // Voice and video calls
    async startCall(groupId, callType = 'audio') {
        try {
            const response = await fetch(`${this.baseUrl}/calls`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ groupId, type: callType })
            });
            
            if (!response.ok) {
                throw new Error('Failed to start call');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error starting call:', error);
            throw error;
        }
    }

    async endCall(callId) {
        try {
            const response = await fetch(`${this.baseUrl}/calls/${callId}/end`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to end call');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error ending call:', error);
            throw error;
        }
    }

    async getActiveCalls(groupId = null) {
        try {
            const url = groupId 
                ? `${this.baseUrl}/calls/active?groupId=${groupId}`
                : `${this.baseUrl}/calls/active`;
                
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to get active calls');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting active calls:', error);
            throw error;
        }
    }

    // WebRTC signaling
    async getWebRTCConfiguration() {
        try {
            const response = await fetch(`${this.baseUrl}/webrtc/config`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to get WebRTC configuration');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting WebRTC configuration:', error);
            throw error;
        }
    }

    // Error handling wrapper
    async withRetry(operation, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    // Event listeners for WebSocket
    setupWebSocketListeners(onMessage, onOpen, onClose, onError) {
        if (this.socket) {
            this.socket.onmessage = onMessage;
            this.socket.onopen = onOpen;
            this.socket.onclose = onClose;
            this.socket.onerror = onError;
        }
    }

    // Connection status
    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    // Cleanup
    cleanup() {
        this.disconnect();
    }
}

// Export singleton instance
let chatServiceInstance = null;

export function getChatService() {
    if (!chatServiceInstance) {
        chatServiceInstance = new ChatService();
    }
    return chatServiceInstance;
}

// Alternative: Export class for multiple instances
export { ChatService };