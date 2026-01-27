/**
 * Login Page JavaScript
 * Handles login functionality and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const roleButtons = document.querySelectorAll('.role-btn');
    const loginBtn = document.getElementById('loginBtn');
    const loginLoader = document.getElementById('loginLoader');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    
    // Current selected role
    let selectedRole = 'student';
    
    // Initialize role selection
    initializeRoleSelection();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Handle form submission
    loginForm.addEventListener('submit', handleLoginSubmit);

     initializePasswordToggle();
    
    /**
     * Initialize role selection functionality
     */
    function initializeRoleSelection() {
        roleButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                roleButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Update selected role
                selectedRole = this.getAttribute('data-role');
                
                console.log(`Selected role: ${selectedRole}`);
                
                // Update form fields based on role
                updateFormForRole(selectedRole);
            });
        });
    }
    
    /**
     * Update form fields based on selected role
     * @param {string} role - Selected role
     */
    function updateFormForRole(role) {
        const usernameLabel = document.querySelector('label[for="username"]');
        const usernameInput = document.getElementById('username');
        
        switch(role) {
            case 'student':
                usernameLabel.textContent = 'Mã số sinh viên / ID';
                usernameInput.placeholder = 'Ví dụ: 205106xxxx';
                break;
            case 'teacher':
                usernameLabel.textContent = 'Mã giảng viên / ID';
                usernameInput.placeholder = 'Ví dụ: GVxxxxx';
                break;
            case 'admin':
                usernameLabel.textContent = 'Tên đăng nhập / ID';
                usernameInput.placeholder = 'Nhập tên đăng nhập';
                break;
        }
    }
    
    /**
     * Initialize form validation
     */
    function initializeFormValidation() {
        // Real-time validation for username
        usernameInput.addEventListener('input', function() {
            validateUsername(this.value);
        });
        
        // Real-time validation for password
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
        });
        
        // Blur validation
        usernameInput.addEventListener('blur', function() {
            if (this.value) validateUsername(this.value);
        });
        
        passwordInput.addEventListener('blur', function() {
            if (this.value) validatePassword(this.value);
        });
    }
    
    /**
     * Validate username input
     * @param {string} value - Username value
     * @returns {boolean} - Validation result
     */
    function validateUsername(value) {
        const errorElement = document.getElementById('usernameError');
        
        if (!value.trim()) {
            errorElement.textContent = 'Vui lòng nhập mã định danh';
            usernameInput.classList.add('error');
            return false;
        }
        
        // Role-specific validation
        switch(selectedRole) {
            case 'student':
                if (!/^\d{8,10}$/.test(value)) {
                    errorElement.textContent = 'Mã số sinh viên phải có 10 chữ số';
                    usernameInput.classList.add('error');
                    return false;
                }
                break;
            case 'teacher':
                if (!/^GV\d{5}$/.test(value)) {
                    errorElement.textContent = 'Mã giảng viên phải có dạng GVxxxxx';
                    usernameInput.classList.add('error');
                    return false;
                }
                break;
            case 'admin':
                if (value.length < 4) {
                    errorElement.textContent = 'Tên đăng nhập phải có ít nhất 4 ký tự';
                    usernameInput.classList.add('error');
                    return false;
                }
                break;
        }
        
        errorElement.textContent = '';
        usernameInput.classList.remove('error');
        return true;
    }
    
    /**
     * Validate password input
     * @param {string} value - Password value
     * @returns {boolean} - Validation result
     */
    function validatePassword(value) {
        const errorElement = document.getElementById('passwordError');
        
        if (!value) {
            errorElement.textContent = 'Vui lòng nhập mật khẩu';
            passwordInput.classList.add('error');
            return false;
        }
        
        if (value.length < 6) {
            errorElement.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
            passwordInput.classList.add('error');
            return false;
        }
        
        errorElement.textContent = '';
        passwordInput.classList.remove('error');
        return true;
    }
    
    /**
     * Handle login form submission
     * @param {Event} event - Form submit event
     */
    async function handleLoginSubmit(event) {
        event.preventDefault();
        
        // Get form values
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('remember').checked;
        
        // Validate inputs
        const isUsernameValid = validateUsername(username);
        const isPasswordValid = validatePassword(password);
        
        if (!isUsernameValid || !isPasswordValid) {
            showNotification('Vui lòng kiểm tra lại thông tin đăng nhập', 'error');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            // Prepare login data
            const loginData = {
                username,
                password,
                role: selectedRole,
                remember: rememberMe
            };
            
            // Call authentication service
            const result = await window.authService.login(loginData);
            
            if (result.success) {
                // Login successful
                showNotification('Đăng nhập thành công!', 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    redirectToDashboard(selectedRole);
                }, 1500);
            } else {
                // Login failed
                showNotification(result.message || 'Đăng nhập thất bại', 'error');
                setLoadingState(false);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Đã xảy ra lỗi. Vui lòng thử lại sau.', 'error');
            setLoadingState(false);
        }
    }
    
    /**
     * Set loading state for login button
     * @param {boolean} isLoading - Loading state
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            loginBtn.style.opacity = '0.8';
            loginLoader.classList.remove('hidden');
        } else {
            loginBtn.disabled = false;
            loginBtn.style.opacity = '1';
            loginLoader.classList.add('hidden');
        }
    }
    
    /**
     * Show notification message
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning)
     */
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Close button styles
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin-left: 16px;
            line-height: 1;
        `;
        
        // Add keyframe animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    /**
     * Redirect to dashboard based on role
     * @param {string} role - User role
     */
    function redirectToDashboard(role) {
        let redirectPath = '../../pages/';
        
        switch(role) {
            case 'student':
                redirectPath += 'academic/subjects.html';
                break;
            case 'teacher':
                redirectPath += 'academic/course-classes.html';
                break;
            case 'admin':
                redirectPath += 'admin/user-management.html';
                break;
            default:
                redirectPath += 'index.html';
        }
        
        window.location.href = redirectPath;
    }
    
    /**
     * Handle Enter key press
     */
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.target.matches('.role-btn')) {
            // Prevent default form submission if not on a role button
            if (!event.target.matches('button, input[type="checkbox"], a')) {
                event.preventDefault();
                loginBtn.click();
            }
        }
    });
    
    /**
     * Initialize accessibility features
     */
    function initializeAccessibility() {
        // Add ARIA labels
        roleButtons.forEach(button => {
            button.setAttribute('aria-label', `Chọn vai trò ${button.querySelector('.role-text').textContent}`);
        });
        
        // Add focus styles
        const focusableElements = 'button, input, a, [tabindex]';
        const focusable = document.querySelectorAll(focusableElements);
        
        focusable.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('focused');
            });
        });
    }
    
    // Initialize accessibility
    initializeAccessibility();
    
    // Add error class to CSS if not present
    if (!document.querySelector('#input-error-styles')) {
        const style = document.createElement('style');
        style.id = 'input-error-styles';
        style.textContent = `
            .input-academic.error {
                border-color: #EF4444 !important;
            }
            
            .input-academic.error:focus {
                border-color: #EF4444 !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }
            
            .focused {
                outline: 2px solid #0A2463;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
});

function initializePasswordToggle() {
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const toggleIcon = passwordToggle.querySelector('.toggle-icon');
    
    if (!passwordToggle || !passwordInput) return;
    
    passwordToggle.addEventListener('click', function() {
        // Toggle password visibility
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon and active state
        passwordToggle.classList.toggle('active');
        
        if (type === 'text') {
            toggleIcon.textContent = 'visibility';
            toggleIcon.setAttribute('aria-label', 'Ẩn mật khẩu');
            passwordToggle.setAttribute('aria-label', 'Ẩn mật khẩu');
            
            // Add visual feedback
            passwordInput.style.letterSpacing = '1px';
            setTimeout(() => {
                passwordInput.style.letterSpacing = '';
            }, 300);
        } else {
            toggleIcon.textContent = 'visibility_off';
            toggleIcon.setAttribute('aria-label', 'Hiển thị mật khẩu');
            passwordToggle.setAttribute('aria-label', 'Hiển thị mật khẩu');
        }
        
        // Keep focus on input for better UX
        passwordInput.focus();
    });
    
    // Handle Enter key on toggle button
    passwordToggle.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            passwordToggle.click();
        }
    });
    
    // Auto-hide password when input loses focus (optional)
    passwordInput.addEventListener('blur', function() {
        setTimeout(() => {
            // Only hide if not manually showing
            if (passwordInput.getAttribute('type') === 'text' && 
                document.activeElement !== passwordToggle) {
                passwordInput.setAttribute('type', 'password');
                passwordToggle.classList.remove('active');
                toggleIcon.textContent = 'visibility_off';
                toggleIcon.setAttribute('aria-label', 'Hiển thị mật khẩu');
                passwordToggle.setAttribute('aria-label', 'Hiển thị mật khẩu');
            }
        }, 1000); // Delay 1 second
    });
}
