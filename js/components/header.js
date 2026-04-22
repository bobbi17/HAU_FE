// js/components/header.js
export class Header {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.basePath = this.getBasePath();
        this.injectStyles(); // Inject CSS trước khi render
        this.render();
        this.initEventListeners();
    }
    
    getBasePath() {
        const scripts = document.getElementsByTagName('script');
        const currentScript = scripts[scripts.length - 1];
        const src = currentScript.src;
        return src.substring(0, src.indexOf('/js/components/'));
    }
    
    getPath(relativePath) {
        if (relativePath.startsWith('/') || relativePath.startsWith('http')) {
            return relativePath;
        }
        return this.basePath + relativePath;
    }
    
    getCurrentUser() {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userData && token) {
            try {
                return JSON.parse(userData);
            } catch(e) {
                return null;
            }
        }
        return null;
    }

    injectStyles() {
        // Tránh inject CSS nhiều lần nếu Header khởi tạo lại
        if (document.getElementById('header-component-styles')) return;

        const style = document.createElement('style');
        style.id = 'header-component-styles';
        style.textContent = `
            /* ===== USER PROFILE TRIGGER ===== */
            .user-profile {
                position: relative;
            }

            .user-trigger {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                padding: 6px 10px;
                border-radius: 50px;
                transition: background 0.2s ease;
            }

            .user-trigger:hover {
                background: rgba(0, 0, 0, 0.06);
            }

            /* ===== AVATAR TRÒN CHUNG ===== */
            .user-avatar-circle,
            .dropdown-avatar-circle,
            .mobile-user-avatar-circle {
                position: relative;
                border-radius: 50%;
                overflow: hidden;
                flex-shrink: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .user-avatar-circle {
                width: 38px;
                height: 38px;
                border: 2px solid #fff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }

            .dropdown-avatar-circle {
                width: 48px;
                height: 48px;
                border: 2px solid #eee;
            }

            .mobile-user-avatar-circle {
                width: 44px;
                height: 44px;
                border: 2px solid rgba(255,255,255,0.4);
            }

            .user-avatar-circle img,
            .dropdown-avatar-circle img,
            .mobile-user-avatar-circle img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            /* Fallback chữ cái đầu */
            .avatar-initials {
                color: #fff;
                font-weight: 700;
                font-size: 14px;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }

            /* ===== TÊN & ID TRÊN HEADER ===== */
            .user-info-inline {
                display: flex;
                flex-direction: column;
                line-height: 1.2;
            }

            .user-name-inline {
                font-size: 14px;
                font-weight: 600;
                color: #1a1a2e;
                white-space: nowrap;
                max-width: 120px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .user-id-inline {
                font-size: 11px;
                color: #888;
                white-space: nowrap;
            }

            /* Mũi tên chevron */
            .user-chevron {
                font-size: 18px;
                color: #888;
                transition: transform 0.25s ease;
            }

            .user-chevron.rotated {
                transform: rotate(180deg);
            }

            /* ===== DROPDOWN HEADER ===== */
            .dropdown-user-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 16px 12px;
            }

            .dropdown-user-details {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .dropdown-user-name {
                font-size: 15px;
                font-weight: 700;
                color: #1a1a2e;
            }

            .dropdown-user-id {
                font-size: 12px;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    }
    
    render() {
        const isLoggedIn = this.currentUser !== null;
        
        const logoPath = this.getPath('/assets/images/logoHAU.png');
        const defaultAvatarPath = this.getPath('/assets/images/avatars/default.png');
        const homeLink = this.getPath('/pages/index.html');
        const classManagementLink = this.getPath('/pages/academic/class-management.html');
        const groupChatLink = this.getPath('/pages/groups/group-chat.html');
        const forumLink = this.getPath('/pages/forum/forum.html');
        const aiChatLink = this.getPath('/pages/ai/ai-chat.html');
        const profileLink = this.getPath('/pages/user/profile.html');
        const settingsLink = this.getPath('/pages/user/settings.html');
        const loginLink = this.getPath('/pages/auth/login.html');
        const registerLink = this.getPath('/pages/auth/register.html');
        const adminLink = this.getPath('/pages/admin/user-management.html');
        
        const headerHTML = `
        <header class="main-header">
            <div class="header-container">
                <!-- Logo Section -->
                <div class="logo-section">
                    <a href="${homeLink}" class="logo-link group">
                       <div class="logo">
                        <img class="logo-icon" src="${logoPath}" alt="Logo" 
                             onerror="this.src='https://via.placeholder.com/40x40?text=HAU'">
                         <div class="logo-corner"></div>
                        </div>
                        <div class="logo-text">
                            <span class="logo-title">HAU </span>
                            <span class="logo-subtitle"> University</span>
                        </div>
                    </a>
                </div>
                
                <!-- Navigation -->
                <nav class="main-nav">
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="${homeLink}" class="nav-link">
                                <span>Trang chủ</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="${classManagementLink}" class="nav-link">
                                <span>Học vụ</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="${groupChatLink}" class="nav-link">
                                <span>Nhóm học tập</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="${forumLink}" class="nav-link">
                                <span>Diễn đàn</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="${aiChatLink}" class="nav-link ai-assistant">
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
                        <input class="search-input" type="text" placeholder="Tìm kiếm...">
                    </div>
                    
                    <button class="notification-btn">
                        <span class="material-symbols-outlined">notifications</span>
                        <span class="notification-dot"></span>
                    </button>
                    
                    ${isLoggedIn ? this.renderUserProfile(defaultAvatarPath, profileLink, settingsLink, adminLink) : this.renderLoginButton(loginLink)}
                </div>
                
                <!-- Mobile Menu Toggle -->
                <button class="mobile-menu-toggle">
                    <span class="material-symbols-outlined">menu</span>
                </button>
            </div>
            
            <!-- Mobile Navigation -->
            <div class="mobile-nav">
                <div class="mobile-nav-header">
                    ${isLoggedIn ? this.renderMobileUserInfo(defaultAvatarPath) : `
                    <div class="mobile-auth-buttons">
                        <a href="${loginLink}" class="mobile-login-btn">
                            <span class="material-symbols-outlined">login</span>
                            <span>Đăng nhập</span>
                        </a>
                        <a href="${registerLink}" class="mobile-register-btn">
                            <span class="material-symbols-outlined">person_add</span>
                            <span>Đăng ký</span>
                        </a>
                    </div>
                    `}
                </div>
                <ul class="mobile-nav-list">
                    <li><a href="${homeLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">home</span>
                        <span>Trang chủ</span>
                    </a></li>
                    <li><a href="${classManagementLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">school</span>
                        <span>Học vụ</span>
                    </a></li>
                    <li><a href="${groupChatLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">groups</span>
                        <span>Nhóm học tập</span>
                    </a></li>
                    <li><a href="${forumLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">forum</span>
                        <span>Diễn đàn</span>
                    </a></li>
                    <li><a href="${aiChatLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">auto_awesome</span>
                        <span>AI Assistant</span>
                    </a></li>
                    ${isLoggedIn ? `
                    <li class="mobile-divider"></li>
                    <li><a href="${profileLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">person</span>
                        <span>Hồ sơ</span>
                    </a></li>
                    <li><a href="${settingsLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">settings</span>
                        <span>Cài đặt</span>
                    </a></li>
                    <li><a href="#" class="mobile-nav-link logout-btn">
                        <span class="material-symbols-outlined">logout</span>
                        <span>Đăng xuất</span>
                    </a></li>
                    ` : `
                    <li class="mobile-divider"></li>
                    <li><a href="${loginLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">login</span>
                        <span>Đăng nhập</span>
                    </a></li>
                    <li><a href="${registerLink}" class="mobile-nav-link">
                        <span class="material-symbols-outlined">person_add</span>
                        <span>Đăng ký</span>
                    </a></li>
                    `}
                </ul>
            </div>
        </header>
        `;
        
        const headerElement = document.querySelector('header');
        if (headerElement) {
            headerElement.innerHTML = headerHTML;
        } else {
            console.error('Header element not found!');
            const body = document.querySelector('body');
            const newHeader = document.createElement('header');
            body.insertBefore(newHeader, body.firstChild);
            newHeader.innerHTML = headerHTML;
        }
    }
    
    renderUserProfile(defaultAvatarPath, profileLink, settingsLink, adminLink) {
        const avatarUrl = this.currentUser?.avatar || defaultAvatarPath;
        const initials = (this.currentUser?.name || 'U')
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

        return `
        <div class="user-profile">
            <div class="user-trigger">
                <div class="user-avatar-circle">
                    <img 
                        src="${avatarUrl}" 
                        alt="${this.currentUser.name || 'User'}"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    >
                    <span class="avatar-initials" style="display:none;">${initials}</span>
                </div>
                <div class="user-info-inline">
                    <p class="user-name-inline">${this.currentUser.name || 'User'}</p>
                    <p class="user-id-inline">${this.currentUser.studentId || 'HAU Student'}</p>
                </div>
                <span class="material-symbols-outlined user-chevron">expand_more</span>
            </div>

            <div class="user-dropdown">
                <div class="dropdown-user-header">
                    <div class="dropdown-avatar-circle">
                        <img 
                            src="${avatarUrl}" 
                            alt="${this.currentUser.name || 'User'}"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                        >
                        <span class="avatar-initials" style="display:none;">${initials}</span>
                    </div>
                    <div class="dropdown-user-details">
                        <p class="dropdown-user-name">${this.currentUser.name || 'User'}</p>
                        <p class="dropdown-user-id">${this.currentUser.studentId || 'HAU Student'}</p>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="${profileLink}" class="dropdown-item">
                    <span class="material-symbols-outlined">person</span>
                    <span>Hồ sơ</span>
                </a>
                <a href="${settingsLink}" class="dropdown-item">
                    <span class="material-symbols-outlined">settings</span>
                    <span>Cài đặt</span>
                </a>
                ${this.currentUser?.role === 'admin' ? `
                <div class="dropdown-divider"></div>
                <a href="${adminLink}" class="dropdown-item">
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
    
    renderLoginButton(loginLink) {
        return `
        <div class="auth-buttons">
            <a href="${loginLink}" class="login-btn">
                <span class="material-symbols-outlined">login</span>
                <span>Đăng nhập</span>
            </a>
        </div>
        `;
    }
    
    renderMobileUserInfo(defaultAvatarPath) {
        const avatarUrl = this.currentUser?.avatar || defaultAvatarPath;
        const initials = (this.currentUser?.name || 'U')
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

        return `
        <div class="mobile-user-info">
            <div class="mobile-user-avatar-circle">
                <img 
                    src="${avatarUrl}" 
                    alt="${this.currentUser.name || 'User'}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >
                <span class="avatar-initials" style="display:none;">${initials}</span>
            </div>
            <div>
                <p class="mobile-user-name">${this.currentUser.name || 'User'}</p>
                <p class="mobile-user-id">${this.currentUser.studentId || 'HAU Student'}</p>
            </div>
        </div>
        `;
    }
    
    initEventListeners() {
        setTimeout(() => {
            // Mobile menu toggle
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const mobileNav = document.querySelector('.mobile-nav');
            
            if (mobileToggle && mobileNav) {
                const newToggle = mobileToggle.cloneNode(true);
                mobileToggle.parentNode.replaceChild(newToggle, mobileToggle);
                
                newToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mobileNav.classList.toggle('active');
                    newToggle.classList.toggle('active');
                });
                
                window.mobileNav = mobileNav;
                window.mobileToggle = newToggle;
            }
            
            // Search input
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.addEventListener('focus', () => {
                    searchInput.parentElement?.classList.add('focused');
                });
                searchInput.addEventListener('blur', () => {
                    searchInput.parentElement?.classList.remove('focused');
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
                notificationBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showNotifications();
                });
            }
            
            // User profile dropdown
            const userTrigger = document.querySelector('.user-trigger');
            if (userTrigger) {
                userTrigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const dropdown = userTrigger.closest('.user-profile')?.querySelector('.user-dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('show');
                        const chevron = userTrigger.querySelector('.user-chevron');
                        if (chevron) chevron.classList.toggle('rotated');
                    }
                });
            }
            
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
                if (window.mobileNav?.classList.contains('active') &&
                    window.mobileNav && window.mobileToggle &&
                    !window.mobileNav.contains(e.target) &&
                    !window.mobileToggle.contains(e.target)) {
                    window.mobileNav.classList.remove('active');
                    window.mobileToggle.classList.remove('active');
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                const dropdown = document.querySelector('.user-dropdown');
                const chevron = document.querySelector('.user-chevron');
                if (dropdown) dropdown.classList.remove('show');
                if (chevron) chevron.classList.remove('rotated');
            });
        }, 100);
    }
    
    handleSearch(query) {
        if (!query.trim()) return;
        const searchLink = this.getPath('/pages/search.html');
        window.location.href = `${searchLink}?q=${encodeURIComponent(query)}`;
    }
    
    showNotifications() {
        console.log('Showing notifications');
    }
    
    handleLogout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        const loginLink = this.getPath('/pages/auth/login.html');
        window.location.href = loginLink;
    }
}