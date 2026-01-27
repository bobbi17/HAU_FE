export class DashboardService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
    }
    
    async getStudentDashboardData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/student/dashboard`);
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            return await response.json();
        } catch (error) {
            console.error('DashboardService error:', error);
            throw error;
        }
    }
    
    // Other methods for specific data fetching
}