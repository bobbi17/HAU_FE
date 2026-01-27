export class NotificationService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
    }
    
    async getUnreadNotifications() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/notifications/unread`);
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }
            return await response.json();
        } catch (error) {
            console.error('NotificationService error:', error);
            return [];
        }
    }
}