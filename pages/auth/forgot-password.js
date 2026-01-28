/**
 * Forgot Password Page JavaScript
 * Handles password recovery flow
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const verificationForm = document.getElementById('verificationForm');
    const newPasswordForm = document.getElementById('newPasswordForm');
    const successMessage = document.getElementById('successMessage');
    
    const recoveryEmailInput = document.getElementById('recoveryEmail');
    const userRoleSelect = document.getElementById('userRole');
    
    const sendResetBtn = document.getElementById('sendResetBtn');
    const sendResetLoader = document.getElementById('sendResetLoader');
    
    const verificationEmailDisplay = document.getElementById('verificationEmail');
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    const codeInputs = document.querySelectorAll('.code-input');
    const verificationCodeInput = document.getElementById('verificationCode');
    const countdownElement = document.getElementById('countdown');
    const countdownText = document.getElementById('countdownText');
    
    const backToEmailBtn = document.getElementById('backToEmailBtn');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const verifyCodeLoader = document.getElementById('verifyCodeLoader');
    
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const newPasswordToggle = document.getElementById('newPasswordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const passwordStrengthElement = document.getElementById('passwordStrength');
    const requirementsList = document.querySelectorAll('.requirement');
    
    const backToCodeBtn = document.getElementById('backToCodeBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const resetPasswordLoader = document.getElementById('resetPasswordLoader');
    
    // State
    let currentStep = 1;
    let countdownInterval;
    let countdownTime = 300; // 5 minutes in seconds
    let generatedCode = '';
    
    // Initialize
    initializeForms();
    initializePasswordToggles();
    initializePasswordValidation();
    initializeVerificationCode();
    
    /**
     * Initialize all forms and event listeners
     */
    function initializeForms() {
        // Step 1: Email verification form
        forgotPasswordForm.addEventListener('submit', handleEmailSubmit);
        
        // Step 2: Verification code form
        verificationForm.addEventListener('submit', handleVerificationSubmit);
        
        // Step 3: New password form
        newPasswordForm.addEventListener('submit', handleNewPasswordSubmit);
        
        // Navigation buttons
        backToEmailBtn.addEventListener('click', () => goToStep(1));
        backToCodeBtn.addEventListener('click', () => goToStep(2));
        
        // Resend code button
        resendCodeBtn.addEventListener('click', handleResendCode);
    }
    
    /**
     * Initialize password visibility toggles
     */
    function initializePasswordToggles() {
        // New password toggle
        newPasswordToggle.addEventListener('click', function() {
            togglePasswordVisibility(newPasswordInput, this);
        });
        
        // Confirm password toggle
        confirmPasswordToggle.addEventListener('click', function() {
            togglePasswordVisibility(confirmPasswordInput, this);
        });
    }
    
    /**
     * Initialize password strength validation
     */
    function initializePasswordValidation() {
        newPasswordInput.addEventListener('input', validatePasswordStrength);
        confirmPasswordInput.addEventListener('input', validatePasswordConfirmation);
    }
    
    /**
     * Initialize verification code input
     */
    function initializeVerificationCode() {
        codeInputs.forEach((input, index) => {
            // Handle input
            input.addEventListener('input', function(e) {
                const value = e.target.value;
                
                // Only allow numbers
                if (!/^\d*$/.test(value)) {
                    e.target.value = '';
                    return;
                }
                
                // Auto-focus next input
                if (value.length === 1 && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
                
                // Update hidden input
                updateVerificationCode();
                
                // Add filled class
                if (value) {
                    e.target.classList.add('filled');
                } else {
                    e.target.classList.remove('filled');
                }
            });
            
            // Handle paste
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').slice(0, 6);
                
                if (/^\d+$/.test(pastedData)) {
                    pastedData.split('').forEach((char, charIndex) => {
                        if (codeInputs[charIndex]) {
                            codeInputs[charIndex].value = char;
                            codeInputs[charIndex].classList.add('filled');
                        }
                    });
                    
                    // Focus last input
                    const lastFilledIndex = Math.min(pastedData.length - 1, codeInputs.length - 1);
                    codeInputs[lastFilledIndex].focus();
                    
                    updateVerificationCode();
                }
            });
            
            // Handle backspace
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    codeInputs[index - 1].focus();
                    codeInputs[index - 1].value = '';
                    codeInputs[index - 1].classList.remove('filled');
                    updateVerificationCode();
                }
            });
        });
    }
    
 /**
     * Handle email submission (Step 1) - UPDATED
     */
    async function handleEmailSubmit(event) {
        event.preventDefault();
        
        // Validate inputs
        const email = recoveryEmailInput.value.trim();
        const role = userRoleSelect.value;
        
        if (!validateEmail(email)) {
            showError('emailError', 'Vui lòng nhập email hợp lệ');
            return;
        }
        
        if (!role) {
            showError('roleError', 'Vui lòng chọn vai trò của bạn');
            return;
        }
        
        // Show loading state
        setLoadingState(sendResetBtn, sendResetLoader, true);
        
        try {
            // Call existing AuthService method
            const result = await window.authService.requestPasswordReset(email);
            
            if (result.success) {
                // Store email for next steps
                verificationEmailDisplay.textContent = email;
                
                // Generate verification code using new method
                const codeResult = await window.authService.sendVerificationCode(email);
                
                if (codeResult.success) {
                    generatedCode = codeResult.data.code;
                    console.log('Generated code:', generatedCode);
                    
                    // Show success message
                    showNotification(result.message, 'success');
                    
                    // Go to step 2
                    setTimeout(() => {
                        goToStep(2);
                        startCountdown();
                        setLoadingState(sendResetBtn, sendResetLoader, false);
                    }, 1000);
                } else {
                    showError('emailError', codeResult.message);
                    setLoadingState(sendResetBtn, sendResetLoader, false);
                }
                
            } else {
                showError('emailError', result.message);
                setLoadingState(sendResetBtn, sendResetLoader, false);
            }
            
        } catch (error) {
            console.error('Error sending reset email:', error);
            showError('emailError', 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
            setLoadingState(sendResetBtn, sendResetLoader, false);
        }
    }
    
    /**
     * Handle verification code submission (Step 2) - UPDATED
     */
    async function handleVerificationSubmit(event) {
        event.preventDefault();
        
        const enteredCode = verificationCodeInput.value;
        const email = verificationEmailDisplay.textContent;
        
        if (!enteredCode || enteredCode.length !== 6) {
            showError('codeError', 'Vui lòng nhập đủ 6 chữ số');
            return;
        }
        
        // Show loading state
        setLoadingState(verifyCodeBtn, verifyCodeLoader, true);
        
        try {
            // Use new verifyResetCode method
            const result = await window.authService.verifyResetCode(enteredCode, email);
            
            if (result.success) {
                // Store reset token for next step
                resetToken = result.data.token;
                
                showNotification(result.message, 'success');
                
                // Go to step 3
                setTimeout(() => {
                    goToStep(3);
                    setLoadingState(verifyCodeBtn, verifyCodeLoader, false);
                    clearInterval(countdownInterval);
                }, 1000);
                
            } else {
                showError('codeError', result.message);
                setLoadingState(verifyCodeBtn, verifyCodeLoader, false);
            }
            
        } catch (error) {
            console.error('Error verifying code:', error);
            showError('codeError', 'Đã xảy ra lỗi. Vui lòng thử lại.');
            setLoadingState(verifyCodeBtn, verifyCodeLoader, false);
        }
    }
    
    /**
     * Handle new password submission (Step 3) - UPDATED
     */
    async function handleNewPasswordSubmit(event) {
        event.preventDefault();
        
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Use existing validatePassword method
        const validation = window.authService.validatePassword(newPassword);
        if (!validation.valid) {
            showError('newPasswordError', 'Mật khẩu không đủ mạnh. Vui lòng chọn mật khẩu khác');
            return;
        }
        
        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            showError('confirmPasswordError', 'Mật khẩu xác nhận không khớp');
            return;
        }
        
        // Show loading state
        setLoadingState(resetPasswordBtn, resetPasswordLoader, true);
        
        try {
            // Use existing resetPassword method
            const result = await window.authService.resetPassword(resetToken, newPassword);
            
            if (result.success) {
                // Show success message
                setTimeout(() => {
                    goToStep(4); // Success step
                    setLoadingState(resetPasswordBtn, resetPasswordLoader, false);
                    showNotification(result.message, 'success');
                }, 1000);
                
            } else {
                showError('newPasswordError', result.message);
                setLoadingState(resetPasswordBtn, resetPasswordLoader, false);
            }
            
        } catch (error) {
            console.error('Error resetting password:', error);
            showError('newPasswordError', 'Đã xảy ra lỗi. Vui lòng thử lại.');
            setLoadingState(resetPasswordBtn, resetPasswordLoader, false);
        }
    }
    
    /**
     * Handle resend code request - UPDATED
     */
    async function handleResendCode() {
        const email = verificationEmailDisplay.textContent;
        
        // Disable button temporarily
        resendCodeBtn.disabled = true;
        resendCodeBtn.innerHTML = '<span class="material-symbols-outlined">refresh</span> Đang gửi...';
        
        try {
            // Use new resendVerificationCode method
            const result = await window.authService.resendVerificationCode(email);
            
            if (result.success) {
                // Store new code
                generatedCode = result.data.code;
                console.log('New code:', generatedCode);
                
                // Reset countdown
                clearInterval(countdownInterval);
                countdownTime = 300;
                startCountdown();
                
                // Show success message
                showNotification(result.message, 'success');
                
                // Clear input fields
                codeInputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('filled');
                });
                updateVerificationCode();
                codeInputs[0].focus();
                
                // Re-enable button after 30 seconds
                setTimeout(() => {
                    resendCodeBtn.disabled = false;
                    resendCodeBtn.innerHTML = '<span class="material-symbols-outlined">refresh</span> Gửi lại mã';
                }, 30000);
                
            } else {
                showNotification(result.message, 'error');
                resendCodeBtn.disabled = false;
                resendCodeBtn.innerHTML = '<span class="material-symbols-outlined">refresh</span> Gửi lại mã';
            }
            
        } catch (error) {
            console.error('Error resending code:', error);
            showNotification('Không thể gửi lại mã. Vui lòng thử lại.', 'error');
            resendCodeBtn.disabled = false;
            resendCodeBtn.innerHTML = '<span class="material-symbols-outlined">refresh</span> Gửi lại mã';
        }
    }
    
    /**
     * Validate password strength in real-time - UPDATED
     */
    function validatePasswordStrength() {
        const password = newPasswordInput.value;
        
        // Use existing validatePassword method
        const validation = window.authService.validatePassword(password);
        
        // Update strength meter
        passwordStrengthElement.className = `password-strength ${validation.strength}`;
        
        // Update requirement indicators
        requirementsList.forEach(requirement => {
            const rule = requirement.getAttribute('data-rule');
            const isMet = validation[rule];
            requirement.classList.toggle('met', isMet);
        });
        
        // Clear error if password is strong
        if (validation.valid) {
            clearError('newPasswordError');
        }
        
        return validation;
    }
    
    
    /**
     * Validate password confirmation
     */
    function validatePasswordConfirmation() {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showError('confirmPasswordError', 'Mật khẩu xác nhận không khớp');
            return false;
        } else {
            clearError('confirmPasswordError');
            return true;
        }
    }
    
    /**
     * Helper functions
     */
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function togglePasswordVisibility(passwordInput, toggleButton) {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        toggleButton.classList.toggle('active');
        const icon = toggleButton.querySelector('.toggle-icon');
        icon.textContent = type === 'password' ? 'visibility_off' : 'visibility';
    }
    
    function calculatePasswordStrength(password) {
        const rules = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };
        
        const score = Object.values(rules).filter(Boolean).length;
        
        let category = 'weak';
        if (score >= 4) category = 'strong';
        else if (score >= 3) category = 'medium';
        
        return {
            valid: score >= 3,
            category,
            rules,
            score
        };
    }
    
    function setLoadingState(button, loader, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.style.opacity = '0.7';
            loader.classList.remove('hidden');
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            loader.classList.add('hidden');
        }
    }
    
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }
    
    function clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <button class="notification-close">×</button>
        `;
        
        // Style
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10B981' : '#EF4444'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
        
        closeBtn.addEventListener('click', () => notification.remove());
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Add notification styles
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
});