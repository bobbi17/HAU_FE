/**
 * User Service
 * Handles user-related API calls
 */

class UserService {
    constructor() {
        this.baseUrl = '/api/users'; // Update with your actual API endpoint
    }

    async getCurrentUser() {
        try {
            const response = await fetch(`${this.baseUrl}/me`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/${userId}`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const response = await fetch(`${this.baseUrl}/${userId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/change-password`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            });
            
            if (!response.ok) {
                throw new Error('Failed to change password');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    async getStudentProfile(studentId) {
        try {
            const response = await fetch(`${this.baseUrl}/students/${studentId}`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch student profile');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching student profile:', error);
            throw error;
        }
    }

    async getLecturerProfile(lecturerId) {
        try {
            const response = await fetch(`${this.baseUrl}/lecturers/${lecturerId}`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch lecturer profile');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching lecturer profile:', error);
            throw error;
        }
    }

    async getStudentCourses(studentId) {
        try {
            const response = await fetch(`${this.baseUrl}/students/${studentId}/courses`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch student courses');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching student courses:', error);
            throw error;
        }
    }

    async getLecturerSubjects(lecturerId) {
        try {
            const response = await fetch(`${this.baseUrl}/lecturers/${lecturerId}/subjects`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch lecturer subjects');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching lecturer subjects:', error);
            throw error;
        }
    }

    async getUserRoles(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/${userId}/roles`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user roles');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching user roles:', error);
            throw error;
        }
    }

    async getUserActivity(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/${userId}/activity`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user activity');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching user activity:', error);
            throw error;
        }
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
               document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    }
}

// Create singleton instance
const userService = new UserService();
export default userService;