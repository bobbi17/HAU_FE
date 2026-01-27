/**
 * Authentication Service
 * Handles login, logout, and authentication related API calls
 */

class AuthService {
    constructor() {
        this.baseUrl = window.API_CONFIG?.BASE_URL || '/api';
        this.isAuthenticated = this.checkAuthStatus();
        this.currentUser = this.getCurrentUser();
    }
    
    /**
     * Login user
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} - Login result
     */
    async login(credentials) {
        try {
            // Mock API call - Replace with real API endpoint
            const response = await this.mockLogin(credentials);
            
            if (response.success) {
                // Store authentication data
                this.setAuthData(response.data);
                this.isAuthenticated = true;
                this.currentUser = response.data.user;
            }
            
            return response;
            
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến máy chủ'
            };
        }
    }
    
    /**
     * Mock login function (replace with real API call)
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} - Mock response
     */
    async mockLogin(credentials) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock validation based on role
        const { username, password, role } = credentials;
        
        // Simple validation rules
        let isValid = false;
        let userData = null;
        
        switch(role) {
            case 'student':
                isValid = /^\d{8,10}$/.test(username) && password.length >= 6;
                if (isValid) {
                    userData = {
                        id: username,
                        name: 'Nguyễn Văn A',
                        email: `${username}@student.hau.edu.vn`,
                        role: 'student',
                        department: 'Kiến Trúc',
                        avatar: '../../assets/images/avatars/default-student.png'
                    };
                }
                break;
                
            case 'teacher':
                isValid = /^GV\d{5}$/.test(username) && password.length >= 6;
                if (isValid) {
                    userData = {
                        id: username,
                        name: 'TS. Trần Thị B',
                        email: `${username}@hau.edu.vn`,
                        role: 'teacher',
                        department: 'Quy Hoạch',
                        courses: ['ARC101', 'ARC202'],
                        avatar: '../../assets/images/avatars/default-teacher.png'
                    };
                }
                break;
                
            case 'admin':
                isValid = username.length >= 4 && password.length >= 6;
                if (isValid) {
                    userData = {
                        id: 'admin001',
                        name: 'Quản trị viên',
                        email: 'admin@hau.edu.vn',
                        role: 'admin',
                        permissions: ['user_management', 'course_management', 'system_config'],
                        avatar: '../../assets/images/avatars/default-admin.png'
                    };
                }
                break;
        }
        
        if (isValid && userData) {
            return {
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    token: 'mock-jwt-token-' + Date.now(),
                    user: userData,
                    expiresIn: 3600
                }
            };
        } else {
            return {
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            };
        }
    }
    
    /**
     * Logout user
     * @returns {Promise<Object>} - Logout result
     */
    async logout() {
        try {
            // Clear local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('auth_expiry');
            
            this.isAuthenticated = false;
            this.currentUser = null;
            
            return {
                success: true,
                message: 'Đăng xuất thành công'
            };
            
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                message: 'Đăng xuất thất bại'
            };
        }
    }
    
    /**
     * Set authentication data in storage
     * @param {Object} data - Authentication data
     */
    setAuthData(data) {
        if (data.token) {
            localStorage.setItem('auth_token', data.token);
        }
        
        if (data.user) {
            localStorage.setItem('user_data', JSON.stringify(data.user));
        }
        
        if (data.expiresIn) {
            const expiryTime = Date.now() + (data.expiresIn * 1000);
            localStorage.setItem('auth_expiry', expiryTime.toString());
        }
    }
    
    /**
     * Check authentication status
     * @returns {boolean} - Authentication status
     */
    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const expiry = localStorage.getItem('auth_expiry');
        
        if (!token || !expiry) {
            return false;
        }
        
        const currentTime = Date.now();
        const expiryTime = parseInt(expiry);
        
        if (currentTime > expiryTime) {
            // Token expired, clear storage
            this.logout();
            return false;
        }
        
        return true;
    }
    
    /**
     * Get current user data
     * @returns {Object|null} - User data
     */
    getCurrentUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }
    
    /**
     * Get authentication token
     * @returns {string|null} - Authentication token
     */
    getToken() {
        return localStorage.getItem('auth_token');
    }
    
    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} - Whether user has the role
     */
    hasRole(role) {
        return this.currentUser?.role === role;
    }
    
    /**
     * Check if user has specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean} - Whether user has the permission
     */
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        if (this.currentUser.role === 'admin') {
            return this.currentUser.permissions?.includes(permission) || false;
        }
        
        return false;
    }
    
    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} - Validation result
     */
    validatePassword(password) {
        const validations = {
            length: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const score = Object.values(validations).filter(v => v).length;
        let strength = 'weak';
        
        if (score >= 4) strength = 'strong';
        else if (score >= 3) strength = 'medium';
        
        return {
            valid: score >= 3,
            score,
            strength,
            ...validations
        };
    }
    
    /**
     * Reset password request
     * @param {string} email - User email
     * @returns {Promise<Object>} - Reset request result
     */
    async requestPasswordReset(email) {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            
            if (isValidEmail) {
                return {
                    success: true,
                    message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn'
                };
            } else {
                return {
                    success: false,
                    message: 'Email không hợp lệ'
                };
            }
            
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: 'Không thể gửi yêu cầu đặt lại mật khẩu'
            };
        }
    }
    
    /**
     * Verify password reset token
     * @param {string} token - Reset token
     * @returns {Promise<Object>} - Verification result
     */
    async verifyResetToken(token) {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simple token validation (in real app, this would verify against database)
            const isValid = token && token.length === 32;
            
            return {
                success: isValid,
                message: isValid ? 'Token hợp lệ' : 'Token không hợp lệ hoặc đã hết hạn'
            };
            
        } catch (error) {
            console.error('Token verification error:', error);
            return {
                success: false,
                message: 'Không thể xác minh token'
            };
        }
    }
    
    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} - Reset result
     */
    async resetPassword(token, newPassword) {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const validation = this.validatePassword(newPassword);
            
            if (!validation.valid) {
                return {
                    success: false,
                    message: 'Mật khẩu không đủ mạnh. Vui lòng chọn mật khẩu khác',
                    validation
                };
            }
            
            // In real app, this would update password in database
            return {
                success: true,
                message: 'Mật khẩu đã được đặt lại thành công'
            };
            
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: 'Không thể đặt lại mật khẩu'
            };
        }
    }


    /**
 * Verify password reset code (6-digit)
 * @param {string} code - Verification code
 * @param {string} email - User email
 * @returns {Promise<Object>} - Verification result
 */
async verifyResetCode(code, email) {
    try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // In real app, this would verify against database
        // For demo, accept any 6-digit code
        const isValid = /^\d{6}$/.test(code);
        
        if (isValid) {
            return {
                success: true,
                message: 'Mã xác nhận hợp lệ',
                data: {
                    token: 'reset-token-' + Date.now(),
                    expiresIn: 600 // 10 minutes
                }
            };
        } else {
            return {
                success: false,
                message: 'Mã xác nhận không đúng'
            };
        }
        
    } catch (error) {
        console.error('Code verification error:', error);
        return {
            success: false,
            message: 'Không thể xác minh mã'
        };
    }
}

/**
 * Send verification code to email
 * @param {string} email - User email
 * @returns {Promise<Object>} - Send code result
 */
async sendVerificationCode(email) {
    try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (isValidEmail) {
            // In real app, this would send actual email
            // For demo, generate and log code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`[DEMO] Verification code for ${email}: ${code}`);
            
            return {
                success: true,
                message: 'Mã xác nhận đã được gửi đến email của bạn',
                data: {
                    code: code, // In production, this would be stored in database
                    expiresIn: 300 // 5 minutes
                }
            };
        } else {
            return {
                success: false,
                message: 'Email không hợp lệ'
            };
        }
        
    } catch (error) {
        console.error('Send code error:', error);
        return {
            success: false,
            message: 'Không thể gửi mã xác nhận'
        };
    }
}

/**
 * Resend verification code
 * @param {string} email - User email
 * @returns {Promise<Object>} - Resend result
 */
async resendVerificationCode(email) {
    return this.sendVerificationCode(email);
}

}

// Create global instance
window.authService = new AuthService();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}