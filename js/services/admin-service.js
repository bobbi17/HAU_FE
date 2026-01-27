/**
 * Admin Service
 * Handles admin dashboard API calls and data management
 */

class AdminService {
    constructor() {
        this.baseUrl = window.API_CONFIG?.ADMIN_BASE_URL || '/api/admin';
        this.notificationCount = 0;
    }
    
    /**
     * Get dashboard data
     * @returns {Promise<Object>} - Dashboard data
     */
    async getDashboardData() {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Mock data - In production, this would come from API
            return {
                stats: {
                    totalUsers: Math.floor(Math.random() * 5000) + 10000,
                    activeSessions: Math.floor(Math.random() * 500) + 800,
                    aiRequests: Math.floor(Math.random() * 10000) + 40000,
                    growthRate: 12.4,
                    aiVolume: 8
                },
                charts: {
                    userGrowth: [65, 59, 80, 81, 56, 55, 40],
                    activityTrends: [40, 65, 90, 55, 75, 35, 85]
                },
                notifications: this.getMockNotifications()
            };
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw new Error('Không thể tải dữ liệu dashboard');
        }
    }
    
    /**
     * Get live statistics
     * @returns {Promise<Object>} - Live stats
     */
    async getLiveStats() {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            return {
                activeSessions: Math.floor(Math.random() * 100) + 1100,
                totalUsers: Math.floor(Math.random() * 100) + 12400,
                aiRequests: Math.floor(Math.random() * 1000) + 45700,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error fetching live stats:', error);
            throw new Error('Không thể tải thống kê thời gian thực');
        }
    }
    
    /**
     * Get notifications
     * @returns {Promise<Array>} - Notifications
     */
    async getNotifications() {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return this.getMockNotifications();
            
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw new Error('Không thể tải thông báo');
        }
    }
    
    /**
     * Mark notifications as read
     * @returns {Promise<Object>} - Result
     */
    async markNotificationsAsRead() {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.notificationCount = 0;
            
            return {
                success: true,
                message: 'Đã đánh dấu tất cả thông báo là đã đọc'
            };
            
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw new Error('Không thể cập nhật trạng thái thông báo');
        }
    }
    
    /**
     * Search system logs
     * @param {string} query - Search query
     * @returns {Promise<Array>} - Search results
     */
    async searchSystemLogs(query) {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Mock search results
            const mockResults = [
                {
                    id: 1,
                    type: 'user',
                    title: `User activity matching "${query}"`,
                    description: 'Found 12 user records',
                    timestamp: '2024-01-15 14:30:00'
                },
                {
                    id: 2,
                    type: 'system',
                    title: `System log entry containing "${query}"`,
                    description: 'Security audit log entry',
                    timestamp: '2024-01-15 13:45:00'
                },
                {
                    id: 3,
                    type: 'error',
                    title: `Error report for "${query}"`,
                    description: 'Server error detected',
                    timestamp: '2024-01-15 12:20:00'
                }
            ];
            
            return mockResults.filter(result => 
                result.title.toLowerCase().includes(query.toLowerCase()) ||
                result.description.toLowerCase().includes(query.toLowerCase())
            );
            
        } catch (error) {
            console.error('Error searching system logs:', error);
            throw new Error('Không thể thực hiện tìm kiếm');
        }
    }
    
    /**
     * Get user management data
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} - User data
     */
    async getUsers(filters = {}) {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock user data
            const mockUsers = this.generateMockUsers(50);
            
            // Apply filters
            let filteredUsers = mockUsers;
            
            if (filters.role) {
                filteredUsers = filteredUsers.filter(user => user.role === filters.role);
            }
            
            if (filters.status) {
                filteredUsers = filteredUsers.filter(user => user.status === filters.status);
            }
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredUsers = filteredUsers.filter(user => 
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.id.toLowerCase().includes(searchLower)
                );
            }
            
            return {
                users: filteredUsers,
                total: mockUsers.length,
                filtered: filteredUsers.length,
                page: filters.page || 1,
                pageSize: filters.pageSize || 20
            };
            
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Không thể tải dữ liệu người dùng');
        }
    }
    
    /**
     * Update user status
     * @param {string} userId - User ID
     * @param {string} status - New status
     * @returns {Promise<Object>} - Update result
     */
    async updateUserStatus(userId, status) {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return {
                success: true,
                message: `Cập nhật trạng thái người dùng ${userId} thành công`,
                data: {
                    userId,
                    status,
                    updatedAt: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error('Error updating user status:', error);
            throw new Error('Không thể cập nhật trạng thái người dùng');
        }
    }
    
    /**
     * Get system metrics
     * @returns {Promise<Object>} - System metrics
     */
    async getSystemMetrics() {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 700));
            
            return {
                cpuUsage: Math.floor(Math.random() * 30) + 20,
                memoryUsage: Math.floor(Math.random() * 40) + 40,
                diskUsage: Math.floor(Math.random() * 50) + 30,
                networkIn: Math.floor(Math.random() * 100) + 50,
                networkOut: Math.floor(Math.random() * 100) + 50,
                uptime: Math.floor(Math.random() * 100) + 100,
                activeConnections: Math.floor(Math.random() * 1000) + 500
            };
            
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            throw new Error('Không thể tải thông số hệ thống');
        }
    }
    
    /**
     * Generate mock notifications
     * @returns {Array} - Mock notifications
     */
    getMockNotifications() {
        return [
            {
                id: 1,
                type: 'warning',
                title: 'High server load detected',
                description: 'CPU usage above 80% for 5 minutes',
                timestamp: '2 minutes ago',
                read: false
            },
            {
                id: 2,
                type: 'info',
                title: 'New user registration',
                description: '15 new users registered today',
                timestamp: '1 hour ago',
                read: false
            },
            {
                id: 3,
                type: 'success',
                title: 'System backup completed',
                description: 'Daily backup completed successfully',
                timestamp: '3 hours ago',
                read: false
            }
        ];
    }
    
    /**
     * Generate mock users
     * @param {number} count - Number of users to generate
     * @returns {Array} - Mock users
     */
    generateMockUsers(count) {
        const roles = ['student', 'teacher', 'admin'];
        const statuses = ['active', 'inactive', 'suspended'];
        const departments = ['Kiến Trúc', 'Quy Hoạch', 'Xây Dựng', 'Nội Thất', 'Cảnh Quan'];
        
        const users = [];
        
        for (let i = 1; i <= count; i++) {
            const role = roles[Math.floor(Math.random() * roles.length)];
            const firstName = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng'][Math.floor(Math.random() * 5)];
            const lastName = ['Văn A', 'Thị B', 'Văn C', 'Thị D', 'Văn E'][Math.floor(Math.random() * 5)];
            
            users.push({
                id: role === 'student' ? `20${Math.floor(Math.random() * 90000) + 10000}` :
                     role === 'teacher' ? `GV${Math.floor(Math.random() * 9000) + 1000}` :
                     `AD${Math.floor(Math.random() * 900) + 100}`,
                name: `${firstName} ${lastName}`,
                email: role === 'student' ? `student${i}@student.hau.edu.vn` :
                       role === 'teacher' ? `teacher${i}@hau.edu.vn` :
                       `admin${i}@hau.edu.vn`,
                role: role,
                department: departments[Math.floor(Math.random() * departments.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                lastActive: this.randomDate(new Date(2024, 0, 1), new Date()),
                createdAt: this.randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31))
            });
        }
        
        return users;
    }
    
    /**
     * Generate random date between start and end
     */
    randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
}

// Create global instance
window.adminService = new AdminService();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminService;
}












// quản lý khoa ngành

// Add these methods to your existing admin-service.js

class AdminService {
    // ... existing code ...

    // Department Management Methods
    async getFaculties(page = 1, limit = 10) {
        const token = getAuthToken();
        
        const response = await fetch(
            `${this.baseURL}/api/admin/faculties?page=${page}&limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch faculties');
        }
        
        return await response.json();
    }

    async createFaculty(facultyData) {
        const token = getAuthToken();
        
        const response = await fetch(`${this.baseURL}/api/admin/faculties`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(facultyData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create faculty');
        }
        
        return await response.json();
    }

    async updateFaculty(facultyId, updateData) {
        const token = getAuthToken();
        
        const response = await fetch(`${this.baseURL}/api/admin/faculties/${facultyId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update faculty');
        }
        
        return await response.json();
    }

    async deleteFaculty(facultyId) {
        const token = getAuthToken();
        
        const response = await fetch(`${this.baseURL}/api/admin/faculties/${facultyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete faculty');
        }
        
        return await response.json();
    }

    async importDepartments(file) {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${this.baseURL}/api/admin/faculties/import`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to import departments');
        }
        
        return await response.json();
    }

    async exportDepartmentsReport() {
        const token = getAuthToken();
        
        const response = await fetch(`${this.baseURL}/api/admin/faculties/export`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to export report');
        }
        
        return await response.blob();
    }

    async runSystemAudit() {
        const token = getAuthToken();
        
        const response = await fetch(`${this.baseURL}/api/admin/system/audit`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to run system audit');
        }
        
        return await response.json();
    }

    // Mock data for development
    async mockGetFaculties(page = 1) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    departments: [
                        {
                            id: "1",
                            code: "K001",
                            name: "Kiến trúc",
                            description: "Khoa Kiến trúc và Quy hoạch",
                            majorCount: 4,
                            head: "PGS.TS Nguyễn Văn A",
                            headId: "1",
                            status: "active",
                            studentCount: 3200,
                            email: "kientruc@hau.edu.vn",
                            phone: "024 3854 1234"
                        },
                        {
                            id: "2",
                            code: "K002",
                            name: "Xây dựng",
                            description: "Khoa Công trình Xây dựng",
                            majorCount: 3,
                            head: "TS. Trần Thị B",
                            headId: "2",
                            status: "active",
                            studentCount: 2800,
                            email: "xaydung@hau.edu.vn",
                            phone: "024 3854 1235"
                        },
                        // ... more mock data
                    ],
                    totalPages: 3,
                    currentPage: page
                });
            }, 500);
        });
    }
}

export const adminService = new AdminService();





// quản lý forum môn học
// Forum Management API calls
export const forumService = {
    // Get all reports
    getReports: async () => {
        try {
            const response = await fetch('/api/mock-data/forum-posts.json');
            const data = await response.json();
            return {
                success: true,
                data: data.reports,
                total: data.reports.length
            };
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    },

    // Get report by ID
    getReportById: async (reportId) => {
        try {
            const response = await fetch('/api/mock-data/forum-posts.json');
            const data = await response.json();
            const report = data.reports.find(r => r.id == reportId);
            
            if (!report) {
                throw new Error('Report not found');
            }
            
            return report;
        } catch (error) {
            console.error('Error fetching report:', error);
            throw error;
        }
    },

    // Resolve report
    resolveReport: async (reportId) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'Report resolved successfully'
            };
        } catch (error) {
            console.error('Error resolving report:', error);
            throw error;
        }
    },

    // Dismiss report
    dismissReport: async (reportId) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'Report dismissed successfully'
            };
        } catch (error) {
            console.error('Error dismissing report:', error);
            throw error;
        }
    },

    // Delete reported content
    deleteReportedContent: async (reportId) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'Content deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting content:', error);
            throw error;
        }
    },

    // Block user
    blockUser: async (reportId) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'User blocked successfully'
            };
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    },

    // Get report statistics
    getReportStats: async () => {
        try {
            const response = await fetch('/api/mock-data/forum-posts.json');
            const data = await response.json();
            
            return {
                success: true,
                data: data.stats
            };
        } catch (error) {
            console.error('Error fetching report stats:', error);
            throw error;
        }
    },

    // Get violation trends
    getViolationTrends: async () => {
        try {
            const response = await fetch('/api/mock-data/forum-posts.json');
            const data = await response.json();
            
            return {
                success: true,
                data: data.trends
            };
        } catch (error) {
            console.error('Error fetching violation trends:', error);
            throw error;
        }
    },

    // Get moderator statistics
    getModeratorStats: async () => {
        try {
            const response = await fetch('/api/mock-data/forum-posts.json');
            const data = await response.json();
            
            return {
                success: true,
                data: data.moderators
            };
        } catch (error) {
            console.error('Error fetching moderator stats:', error);
            throw error;
        }
    }
};


// Quản lí môn học
// Subject Management API calls
export const subjectService = {
    // Get all subjects
    getAllSubjects: async () => {
        try {
            const response = await fetch('/api/mock-data/subjects.json');
            const data = await response.json();
            return {
                success: true,
                data: data.subjects,
                total: data.statistics.total
            };
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    },

    // Get subject by ID
    getSubjectById: async (subjectId) => {
        try {
            const response = await fetch('/api/mock-data/subjects.json');
            const data = await response.json();
            const subject = data.subjects.find(s => s.id == subjectId);
            
            if (!subject) {
                throw new Error('Subject not found');
            }
            
            return subject;
        } catch (error) {
            console.error('Error fetching subject:', error);
            throw error;
        }
    },

    // Create new subject
    createSubject: async (subjectData) => {
        try {
            // Simulate API call
            const newSubject = {
                id: Date.now(),
                ...subjectData,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: null
            };
            
            return {
                success: true,
                data: newSubject,
                message: 'Subject created successfully'
            };
        } catch (error) {
            console.error('Error creating subject:', error);
            throw error;
        }
    },

    // Update subject
    updateSubject: async (subjectId, subjectData) => {
        try {
            // Simulate API call
            return {
                success: true,
                data: { id: subjectId, ...subjectData },
                message: 'Subject updated successfully'
            };
        } catch (error) {
            console.error('Error updating subject:', error);
            throw error;
        }
    },

    // Delete subject
    deleteSubject: async (subjectId) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'Subject deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting subject:', error);
            throw error;
        }
    },

    // Get subjects by department
    getSubjectsByDepartment: async (departmentCode) => {
        try {
            const response = await fetch('/api/mock-data/subjects.json');
            const data = await response.json();
            const subjects = data.subjects.filter(s => s.department === departmentCode);
            
            return {
                success: true,
                data: subjects,
                total: subjects.length
            };
        } catch (error) {
            console.error('Error fetching subjects by department:', error);
            throw error;
        }
    },

    // Export subjects to Excel
    exportSubjectsToExcel: async (subjects) => {
        try {
            // Simulate export functionality
            const csvContent = convertSubjectsToCSV(subjects);
            downloadCSV(csvContent, 'hauhub-subjects.csv');
            
            return {
                success: true,
                message: 'Export completed successfully'
            };
        } catch (error) {
            console.error('Error exporting subjects:', error);
            throw error;
        }
    }
};

// Helper functions
function convertSubjectsToCSV(subjects) {
    const headers = ['Mã môn', 'Tên môn học (VN)', 'Tên môn học (EN)', 'Số tín', 'Khoa', 'Trạng thái', 'Học kỳ'];
    const rows = subjects.map(subject => [
        subject.code,
        subject.nameVi,
        subject.nameEn,
        subject.credits,
        getDepartmentName(subject.department),
        getStatusText(subject.status),
        subject.semester
    ]);
    
    const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csv;
}

function getDepartmentName(code) {
    const departments = {
        'it': 'Công nghệ thông tin',
        'architecture': 'Kiến trúc',
        'electronics': 'Điện tử viễn thông',
        'basic': 'Cơ bản',
        'construction': 'Xây dựng',
        'business': 'Quản trị Kinh doanh'
    };
    return departments[code] || code;
}

function getStatusText(status) {
    const statusTexts = {
        'active': 'Đang mở',
        'inactive': 'Đã đóng',
        'pending': 'Chờ duyệt'
    };
    return statusTexts[status] || status;
}

function downloadCSV(content, filename) {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}