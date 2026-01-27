// js/components/header.js
export class Header {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.render();
        this.initEventListeners();
    }
    
    getCurrentUser() {
        // Kiểm tra xem user đã đăng nhập chưa
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData && token) {
            return JSON.parse(userData);
        }
        return null; // Trả về null nếu chưa đăng nhập
    }
    
    render() {
        const isLoggedIn = this.currentUser !== null;
        
        const headerHTML = `
        <header class="main-header">
            <div class="header-container">
                <!-- Logo Section -->
                <div class="logo-section">
                    <a href="../../pages/index.html" class="logo-link group">
                        <div class="logo">
                            <svg class="logo-icon" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path d="M7 4V20M17 4L7 12L17 20M11 12H7" stroke-linecap="square"></path>
                            </svg>
                            <div class="logo-corner"></div>
                        </div>
                        <div class="logo-text">
                            <span class="logo-title">HAU HUB</span>
                            <span class="logo-subtitle">Architecture</span>
                        </div>
                    </a>
                </div>
                
                <!-- Navigation -->
                <nav class="main-nav">
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="../../pages/index.html" class="nav-link active">
                                <span>Trang chủ</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="../../pages/academic/subjects.html" class="nav-link">
                                <span>Học vụ</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="../../pages/groups/study-groups.html" class="nav-link">
                                <span>Nhóm học tập</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="../../pages/forum/forum-home.html" class="nav-link">
                                <span>Diễn đàn</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="../../pages/ai/ai-chat.html" class="nav-link ai-assistant">
                                <span class="material-symbols-outlined">auto_awesome</span>
                                <span>AI Assistant</span>
                            </a>
                        </li>
                    </ul>
                </nav>
                
                <!-- User Actions -->
                <div class="user-actions">
                    <div class="search-container">
                        <span class="material-symbols-outlined search-icon">search</span>
                        <input class="search-input" type="text" placeholder="Tìm kiếm học liệu...">
                    </div>
                    
                    <button class="notification-btn">
                        <span class="material-symbols-outlined">notifications</span>
                        <span class="notification-dot"></span>
                    </button>
                    
                    ${isLoggedIn ? this.renderUserProfile() : this.renderLoginButton()}
                </div>
                
                <!-- Mobile Menu Toggle -->
                <button class="mobile-menu-toggle">
                    <span class="material-symbols-outlined">menu</span>
                </button>
            </div>
            
            <!-- Mobile Navigation -->
            <div class="mobile-nav">
                <div class="mobile-nav-header">
                    ${isLoggedIn ? this.renderMobileUserInfo() : `
                    <div class="mobile-auth-buttons">
                        <a href="../../pages/auth/login.html" class="mobile-login-btn">
                            <span class="material-symbols-outlined">login</span>
                            <span>Đăng nhập</span>
                        </a>
                        <a href="../../pages/auth/register.html" class="mobile-register-btn">
                            <span class="material-symbols-outlined">person_add</span>
                            <span>Đăng ký</span>
                        </a>
                    </div>
                    `}
                </div>
                <ul class="mobile-nav-list">
                    <li><a href="../../pages/index.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">home</span>
                        <span>Trang chủ</span>
                    </a></li>
                    <li><a href="../../pages/academic/subjects.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">school</span>
                        <span>Học vụ</span>
                    </a></li>
                    <li><a href="../../pages/groups/study-groups.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">groups</span>
                        <span>Nhóm học tập</span>
                    </a></li>
                    <li><a href="../../pages/forum/forum-home.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">forum</span>
                        <span>Diễn đàn</span>
                    </a></li>
                    <li><a href="../../pages/ai/ai-chat.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">auto_awesome</span>
                        <span>AI Assistant</span>
                    </a></li>
                    ${isLoggedIn ? `
                    <li class="mobile-divider"></li>
                    <li><a href="../../pages/user/profile.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">person</span>
                        <span>Hồ sơ</span>
                    </a></li>
                    <li><a href="../../pages/user/settings.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">settings</span>
                        <span>Cài đặt</span>
                    </a></li>
                    <li><a href="#" class="mobile-nav-link logout-btn">
                        <span class="material-symbols-outlined">logout</span>
                        <span>Đăng xuất</span>
                    </a></li>
                    ` : `
                    <li class="mobile-divider"></li>
                    <li><a href="../../pages/auth/login.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">login</span>
                        <span>Đăng nhập</span>
                    </a></li>
                    <li><a href="../../pages/auth/register.html" class="mobile-nav-link">
                        <span class="material-symbols-outlined">person_add</span>
                        <span>Đăng ký</span>
                    </a></li>
                    `}
                </ul>
            </div>
        </header>
        `;
        
        document.querySelector('header').innerHTML = headerHTML;
    }
    
    renderUserProfile() {
        return `
        <div class="user-profile">
            <div class="user-info">
                <p class="user-name">${this.currentUser.name}</p>
                <p class="user-id">${this.currentUser.studentId || 'HAU Student'}</p>
            </div>
            <div class="user-avatar">
                <img src="${this.currentUser.avatar || '../../assets/images/avatars/default.png'}" alt="${this.currentUser.name}">
            </div>
            <div class="user-dropdown">
                <a href="../../pages/user/profile.html" class="dropdown-item">
                    <span class="material-symbols-outlined">person</span>
                    <span>Hồ sơ</span>
                </a>
                <a href="../../pages/user/settings.html" class="dropdown-item">
                    <span class="material-symbols-outlined">settings</span>
                    <span>Cài đặt</span>
                </a>
                ${this.currentUser.role === 'admin' ? `
                <div class="dropdown-divider"></div>
                <a href="../../pages/admin/user-management.html" class="dropdown-item">
                    <span class="material-symbols-outlined">admin_panel_settings</span>
                    <span>Quản trị</span>
                </a>
                ` : ''}
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item logout-btn">
                    <span class="material-symbols-outlined">logout</span>
                    <span>Đăng xuất</span>
                </a>
            </div>
        </div>
        `;
    }
    
    renderLoginButton() {
        return `
        <div class="auth-buttons">
            <a href="../../pages/auth/login.html" class="login-btn">
                <span class="material-symbols-outlined">login</span>
                <span>Đăng nhập</span>
            </a>
        </div>
        `;
    }
    
    renderMobileUserInfo() {
        return `
        <div class="mobile-user-info">
            <div class="mobile-user-avatar">
                <img src="${this.currentUser.avatar || '../../assets/images/avatars/default.png'}" alt="${this.currentUser.name}">
            </div>
            <div>
                <p class="mobile-user-name">${this.currentUser.name}</p>
                <p class="mobile-user-id">${this.currentUser.studentId || 'HAU Student'}</p>
            </div>
        </div>
        `;
    }
    
    initEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
        }
        
        // Search input focus
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchInput.parentElement.classList.add('focused');
            });
            
            searchInput.addEventListener('blur', () => {
                searchInput.parentElement.classList.remove('focused');
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }
        
        // Notification button
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
        
        // User profile dropdown
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = userProfile.querySelector('.user-dropdown');
                dropdown.classList.toggle('show');
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdown = document.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        });
        
        // Logout buttons
        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });
        
        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileNav && mobileNav.classList.contains('active') &&
                !mobileNav.contains(e.target) &&
                !mobileToggle.contains(e.target)) {
                mobileNav.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }
    
    handleSearch(query) {
        if (!query.trim()) return;
        
        // Implement search functionality
        console.log('Searching for:', query);
        // Redirect to search results or show modal
    }
    
    showNotifications() {
        // Implement notifications dropdown
        console.log('Showing notifications');
    }
    
    handleLogout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '../../pages/auth/login.html';
    }
}




