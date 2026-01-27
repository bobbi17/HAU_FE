// settings.js - Settings Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings
    initSettings();
    
    // Load saved settings
    loadSavedSettings();
});

// Initialize all settings functionality
function initSettings() {
    initNavigation();
    initFormElements();
    initStorageMonitoring();
    initBackupSystem();
    initSearchFunctionality();
    initThemeSwitcher();
    initAvatarUpload();
    initSessionManagement();
    initSecuritySettings();
}

// Navigation between settings sections
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.settings-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            
            // Remove active class from all items and sections
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to current item and section
            this.classList.add('active');
            const targetSection = document.getElementById(`${sectionId}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
                saveActiveSection(sectionId);
            }
            
            // Update URL hash for bookmarking
            window.location.hash = `#${sectionId}`;
        });
    });
    
    // Restore active section from URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetItem = document.querySelector(`.nav-item[data-section="${hash}"]`);
        if (targetItem) {
            targetItem.click();
        }
    }
}

// Save active section to localStorage
function saveActiveSection(sectionId) {
    localStorage.setItem('activeSettingsSection', sectionId);
}

// Initialize form elements and toggles
function initFormElements() {
    // Toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const settingId = this.closest('.form-group').querySelector('span').textContent;
            const value = this.checked;
            
            saveSetting(settingId, value);
            
            // Special handling for theme toggle
            if (settingId.includes('Chế độ tối')) {
                toggleDarkMode(value);
            }
            
            // Show feedback
            showNotification(`${settingId} ${value ? 'đã bật' : 'đã tắt'}`);
        });
    });
    
    // Color scheme selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            const colorName = this.querySelector('span').textContent;
            saveSetting('colorScheme', colorName);
            applyColorScheme(colorName);
            
            showNotification(`Chủ đề ${colorName} đã được áp dụng`);
        });
    });
    
    // Form inputs auto-save
    const autoSaveInputs = document.querySelectorAll('input, select');
    autoSaveInputs.forEach(input => {
        input.addEventListener('change', function() {
            const settingId = this.id || this.name;
            const value = this.value;
            
            saveSetting(settingId, value);
        });
    });
}

// Theme switching functionality
function initThemeSwitcher() {
    const darkModeToggle = document.querySelector('input[type="checkbox"]');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = true;
    }
}

// Toggle dark mode
function toggleDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Apply color scheme
function applyColorScheme(schemeName) {
    const root = document.documentElement;
    
    // Define color schemes
    const schemes = {
        'Mặc định': {
            '--primary-color': '#287fbd',
            '--secondary-color': '#2b7ac6',
            '--primary-light': 'rgba(40, 127, 189, 0.1)'
        },
        'Tím': {
            '--primary-color': '#7b1fa2',
            '--secondary-color': '#9c27b0',
            '--primary-light': 'rgba(123, 31, 162, 0.1)'
        },
        'Đỏ': {
            '--primary-color': '#d32f2f',
            '--secondary-color': '#f44336',
            '--primary-light': 'rgba(211, 47, 47, 0.1)'
        },
        'Xanh lá': {
            '--primary-color': '#388e3c',
            '--secondary-color': '#4caf50',
            '--primary-light': 'rgba(56, 142, 60, 0.1)'
        }
    };
    
    const scheme = schemes[schemeName];
    if (scheme) {
        Object.entries(scheme).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
        localStorage.setItem('colorScheme', schemeName);
    }
}

// Avatar upload functionality
function initAvatarUpload() {
    const avatarInput = document.querySelector('input[type="file"]');
    const avatarPreview = document.querySelector('.avatar-image');
    const uploadBtn = document.querySelector('.avatar-controls .btn-secondary');
    const deleteBtn = document.querySelector('.avatar-controls .btn-secondary:nth-child(2)');
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            if (avatarInput) {
                avatarInput.click();
            } else {
                // Create hidden file input
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';
                
                input.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                            showNotification('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB', 'error');
                            return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            avatarPreview.src = event.target.result;
                            saveSetting('avatar', event.target.result);
                            showNotification('Ảnh đại diện đã được cập nhật');
                        };
                        reader.readAsDataURL(file);
                    }
                });
                
                document.body.appendChild(input);
                input.click();
                document.body.removeChild(input);
            }
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('Bạn có chắc chắn muốn xóa ảnh đại diện?')) {
                avatarPreview.src = 'https://randomuser.me/api/portraits/men/32.jpg';
                localStorage.removeItem('avatar');
                showNotification('Ảnh đại diện đã được xóa');
            }
        });
    }
}

// Session management
function initSessionManagement() {
    const logoutButtons = document.querySelectorAll('.session-item .btn-secondary');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sessionInfo = this.closest('.session-item').querySelector('h4').textContent;
            
            if (confirm(`Đăng xuất khỏi ${sessionInfo}?`)) {
                this.closest('.session-item').remove();
                showNotification('Đã đăng xuất khỏi phiên');
            }
        });
    });
}

// Security settings
function initSecuritySettings() {
    const changePasswordBtn = document.querySelector('.btn-primary');
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            // Open password change modal
            showPasswordChangeModal();
        });
    }
}

function showPasswordChangeModal() {
    const modalHTML = `
        <div class="modal-overlay active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Đổi mật khẩu</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="password-change-form">
                        <div class="form-group">
                            <label>Mật khẩu hiện tại</label>
                            <input type="password" required>
                        </div>
                        <div class="form-group">
                            <label>Mật khẩu mới</label>
                            <input type="password" required minlength="8">
                        </div>
                        <div class="form-group">
                            <label>Xác nhận mật khẩu mới</label>
                            <input type="password" required minlength="8">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-cancel">Hủy</button>
                    <button class="btn-primary modal-confirm">Xác nhận</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const confirmBtn = modal.querySelector('.modal-confirm');
    
    function closeModal() {
        modal.remove();
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    confirmBtn.addEventListener('click', function() {
        const form = modal.querySelector('#password-change-form');
        if (form.checkValidity()) {
            // Simulate password change
            setTimeout(() => {
                showNotification('Mật khẩu đã được thay đổi thành công');
                closeModal();
            }, 1000);
        } else {
            form.reportValidity();
        }
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Storage monitoring
function initStorageMonitoring() {
    updateStorageUsage();
    
    // Update storage usage periodically
    setInterval(updateStorageUsage, 30000);
}

function updateStorageUsage() {
    const totalStorage = 15; // GB
    const usedStorage = 4.2; // GB
    
    // Update storage meter
    const progressBar = document.querySelector('.storage-progress');
    const percentage = (usedStorage / totalStorage) * 100;
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    // Update storage value
    const storageValue = document.querySelector('.storage-value');
    if (storageValue) {
        storageValue.textContent = `${usedStorage.toFixed(1)} GB / ${totalStorage} GB`;
    }
    
    // Save current usage
    saveSetting('storageUsage', usedStorage);
}

// Backup system
function initBackupSystem() {
    const backupToggle = document.querySelector('input[type="checkbox"]');
    const backupFrequency = document.querySelector('select');
    const restoreButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    if (backupToggle) {
        backupToggle.addEventListener('change', function() {
            const enabled = this.checked;
            saveSetting('cloudBackup', enabled);
            
            if (enabled) {
                // Simulate backup process
                simulateBackup();
            }
        });
    }
    
    if (backupFrequency) {
        backupFrequency.addEventListener('change', function() {
            saveSetting('backupFrequency', this.value);
        });
    }
    
    restoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent.includes('Khôi phục')) {
                showRestoreConfirmation();
            }
        });
    });
}

function simulateBackup() {
    showNotification('Đang bắt đầu sao lưu đám mây...', 'info');
    
    setTimeout(() => {
        showNotification('Sao lưu đám mây hoàn tất!', 'success');
        
        // Update backup history
        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        
        const backupHistory = document.querySelector('.backup-history');
        if (backupHistory) {
            const newItem = document.createElement('div');
            newItem.className = 'backup-item';
            newItem.innerHTML = `
                <span>${dateStr}</span>
                <span class="text-success">Thành công</span>
            `;
            backupHistory.insertBefore(newItem, backupHistory.firstChild);
        }
    }, 2000);
}

function showRestoreConfirmation() {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu? Hành động này sẽ ghi đè lên dữ liệu hiện tại.')) {
        showNotification('Đang khôi phục dữ liệu...', 'info');
        
        setTimeout(() => {
            showNotification('Khôi phục dữ liệu hoàn tất!', 'success');
        }, 3000);
    }
}

// Search functionality
function initSearchFunctionality() {
    const searchInput = document.getElementById('settings-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            if (searchTerm.length === 0) {
                // Show all sections
                document.querySelectorAll('.settings-section').forEach(section => {
                    section.style.display = 'block';
                });
                return;
            }
            
            // Search through all settings
            let found = false;
            document.querySelectorAll('.settings-section').forEach(section => {
                const text = section.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    section.style.display = 'block';
                    found = true;
                    
                    // Highlight matching text
                    highlightText(section, searchTerm);
                } else {
                    section.style.display = 'none';
                }
            });
            
            if (!found) {
                showNotification('Không tìm thấy cài đặt phù hợp', 'warning');
            }
        }, 300));
    }
}

function highlightText(element, searchTerm) {
    // Remove previous highlights
    element.querySelectorAll('.highlight').forEach(highlight => {
        highlight.outerHTML = highlight.textContent;
    });
    
    // Add new highlights
    element.innerHTML = element.innerHTML.replace(
        new RegExp(searchTerm, 'gi'),
        match => `<span class="highlight">${match}</span>`
    );
}

// Save all settings button
document.getElementById('save-all-settings')?.addEventListener('click', function() {
    const button = this;
    const originalText = button.innerHTML;
    
    // Simulate saving process
    button.innerHTML = '<span class="material-symbols-outlined">sync</span> Đang lưu...';
    button.disabled = true;
    
    setTimeout(() => {
        // Save all form values
        const formData = collectAllSettings();
        localStorage.setItem('hauhubSettings', JSON.stringify(formData));
        
        button.innerHTML = '<span class="material-symbols-outlined">check</span> Đã lưu tất cả';
        button.classList.add('success');
        
        showNotification('Tất cả cài đặt đã được lưu thành công', 'success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('success');
            button.disabled = false;
        }, 2000);
    }, 1500);
});

// Collect all settings from forms
function collectAllSettings() {
    const settings = {};
    
    // Collect form inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
        const key = input.id || input.name || input.placeholder;
        if (key) {
            if (input.type === 'checkbox') {
                settings[key] = input.checked;
            } else {
                settings[key] = input.value;
            }
        }
    });
    
    // Collect custom settings
    settings['activeSection'] = localStorage.getItem('activeSettingsSection');
    settings['theme'] = localStorage.getItem('theme');
    settings['colorScheme'] = localStorage.getItem('colorScheme');
    settings['avatar'] = localStorage.getItem('avatar');
    settings['storageUsage'] = localStorage.getItem('storageUsage');
    
    return settings;
}

// Load saved settings
function loadSavedSettings() {
    const savedSettings = localStorage.getItem('hauhubSettings');
    
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Apply saved settings
            Object.entries(settings).forEach(([key, value]) => {
                applySetting(key, value);
            });
            
            // Restore active section
            const activeSection = localStorage.getItem('activeSettingsSection');
            if (activeSection) {
                const targetItem = document.querySelector(`.nav-item[data-section="${activeSection}"]`);
                if (targetItem) {
                    targetItem.click();
                }
            }
        } catch (error) {
            console.error('Error loading saved settings:', error);
        }
    }
}

// Apply a single setting
function applySetting(key, value) {
    const input = document.querySelector(`[id="${key}"], [name="${key}"]`);
    
    if (input) {
        if (input.type === 'checkbox') {
            input.checked = Boolean(value);
        } else {
            input.value = value;
        }
    }
}

// Save individual setting
function saveSetting(key, value) {
    const settings = JSON.parse(localStorage.getItem('hauhubSettings') || '{}');
    settings[key] = value;
    localStorage.setItem('hauhubSettings', JSON.stringify(settings));
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.settings-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `settings-notification ${type}`;
    notification.innerHTML = `
        <span class="material-symbols-outlined">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility: Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Add CSS for notifications
const notificationStyles = `
    .settings-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--background-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        max-width: 400px;
    }
    
    .settings-notification.show {
        transform: translateX(0);
    }
    
    .settings-notification.success {
        border-left: 4px solid var(--success-color);
    }
    
    .settings-notification.error {
        border-left: 4px solid var(--danger-color);
    }
    
    .settings-notification.warning {
        border-left: 4px solid var(--warning-color);
    }
    
    .settings-notification.info {
        border-left: 4px solid var(--info-color);
    }
    
    .settings-notification .material-symbols-outlined {
        font-size: 20px;
    }
    
    .settings-notification.success .material-symbols-outlined {
        color: var(--success-color);
    }
    
    .settings-notification.error .material-symbols-outlined {
        color: var(--danger-color);
    }
    
    .settings-notification.warning .material-symbols-outlined {
        color: var(--warning-color);
    }
    
    .settings-notification.info .material-symbols-outlined {
        color: var(--info-color);
    }
    
    .highlight {
        background-color: var(--primary-light);
        color: var(--primary-color);
        padding: 2px 4px;
        border-radius: 4px;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);