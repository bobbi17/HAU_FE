/**
 * Admin Dashboard JavaScript
 * Handles admin dashboard functionality and data visualization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeSidebar();
    initializeCharts();
    initializeNotifications();
    loadDashboardData();
    
    /**
     * Initialize sidebar navigation
     */
    function initializeSidebar() {
        const navLinks = document.querySelectorAll('.nav-link');
        const logoutBtn = document.querySelector('.logout-btn');
        
        // Handle navigation clicks
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Remove active class from all links
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                
                // Add active class to clicked link
                this.parentElement.classList.add('active');
                
                // If it's not the current page, navigate
                if (this.href && !this.classList.contains('active')) {
                    e.preventDefault();
                    // In a real app, this would load content dynamically
                    console.log('Navigating to:', this.href);
                }
            });
        });
        
        // Handle logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    window.authService.logout().then(() => {
                        window.location.href = '../auth/login.html';
                    });
                }
            });
        }
    }
    
    /**
     * Initialize chart animations and interactions
     */
    function initializeCharts() {
        // Bar chart interactions
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.addEventListener('mouseenter', function() {
                const height = this.style.height;
                this.style.transition = 'transform 0.2s ease';
                this.style.transform = 'translateY(-4px)';
                
                // Show tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'bar-tooltip';
                tooltip.textContent = `${parseFloat(height)}% activity`;
                this.appendChild(tooltip);
            });
            
            bar.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                
                // Remove tooltip
                const tooltip = this.querySelector('.bar-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
        
        // Line chart animations
        const linePaths = document.querySelectorAll('.chart-main-svg path');
        linePaths.forEach(path => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.getBoundingClientRect();
            path.style.transition = 'stroke-dashoffset 2s ease-in-out';
            path.style.strokeDashoffset = '0';
        });
    }
    
    /**
     * Initialize notifications
     */
    function initializeNotifications() {
        const notificationBtn = document.querySelector('.notification-btn');
        const notificationBadge = document.querySelector('.notification-badge');
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', function() {
                // Toggle notification panel
                toggleNotificationPanel();
                
                // Clear notification badge
                if (notificationBadge) {
                    notificationBadge.style.display = 'none';
                }
                
                // Mark notifications as read
                markNotificationsAsRead();
            });
        }
        
        // Load notifications
        loadNotifications();
    }
    
    /**
     * Load dashboard data
     */
    async function loadDashboardData() {
        try {
            // Show loading state
            showLoadingState();
            
            // Fetch data from admin service
            const dashboardData = await window.adminService.getDashboardData();
            
            // Update stats
            updateStats(dashboardData.stats);
            
            // Update charts
            updateCharts(dashboardData.charts);
            
            // Hide loading state
            hideLoadingState();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showError('Không thể tải dữ liệu dashboard');
            hideLoadingState();
        }
    }
    
    /**
     * Update statistics cards
     */
    function updateStats(stats) {
        if (!stats) return;
        
        // Update total users
        const userElement = document.querySelector('.stat-value:nth-of-type(1)');
        if (userElement && stats.totalUsers) {
            animateCounter(userElement, stats.totalUsers);
        }
        
        // Update active sessions
        const sessionElement = document.querySelector('.stat-value:nth-of-type(2)');
        if (sessionElement && stats.activeSessions) {
            animateCounter(sessionElement, stats.activeSessions);
        }
        
        // Update AI requests
        const aiElement = document.querySelector('.stat-value:nth-of-type(3)');
        if (aiElement && stats.aiRequests) {
            animateCounter(aiElement, stats.aiRequests);
        }
    }
    
    /**
     * Animate counter from 0 to target value
     */
    function animateCounter(element, target) {
        const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const increment = Math.ceil((target - current) / 50);
        let count = current;
        
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                count = target;
                clearInterval(timer);
            }
            element.textContent = count.toLocaleString();
        }, 30);
    }
    
    /**
     * Update charts with real data
     */
    function updateCharts(chartData) {
        if (!chartData) return;
        
        // Update line chart
        if (chartData.userGrowth) {
            updateLineChart(chartData.userGrowth);
        }
        
        // Update bar chart
        if (chartData.activityTrends) {
            updateBarChart(chartData.activityTrends);
        }
    }
    
    /**
     * Update line chart data
     */
    function updateLineChart(data) {
        // In a real app, this would update SVG paths with new data
        console.log('Updating line chart with:', data);
    }
    
    /**
     * Update bar chart data
     */
    function updateBarChart(data) {
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (data[index]) {
                bar.style.height = `${data[index]}%`;
                const barFill = bar.querySelector('.bar-fill');
                if (barFill) {
                    // Update color based on value
                    if (data[index] > 80) {
                        barFill.style.backgroundColor = 'rgba(40, 127, 189, 0.6)';
                    } else if (data[index] > 50) {
                        barFill.style.backgroundColor = 'rgba(40, 127, 189, 0.4)';
                    } else {
                        barFill.style.backgroundColor = 'rgba(40, 127, 189, 0.2)';
                    }
                }
            }
        });
    }
    
    /**
     * Load notifications
     */
    async function loadNotifications() {
        try {
            const notifications = await window.adminService.getNotifications();
            updateNotificationBadge(notifications.length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    /**
     * Update notification badge count
     */
    function updateNotificationBadge(count) {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    /**
     * Toggle notification panel
     */
    function toggleNotificationPanel() {
        // In a real app, this would show/hide a notification panel
        console.log('Toggling notification panel');
    }
    
    /**
     * Mark notifications as read
     */
    async function markNotificationsAsRead() {
        try {
            await window.adminService.markNotificationsAsRead();
            updateNotificationBadge(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    }
    
    /**
     * Show loading state
     */
    function showLoadingState() {
        const stats = document.querySelectorAll('.stat-value');
        stats.forEach(stat => {
            stat.style.opacity = '0.5';
        });
        
        // Add loading skeleton
        document.querySelectorAll('.chart-container').forEach(container => {
            container.style.position = 'relative';
            const skeleton = document.createElement('div');
            skeleton.className = 'chart-skeleton';
            skeleton.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
                border-radius: 0.5rem;
            `;
            container.appendChild(skeleton);
        });
        
        // Add loading animation style
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Hide loading state
     */
    function hideLoadingState() {
        const stats = document.querySelectorAll('.stat-value');
        stats.forEach(stat => {
            stat.style.opacity = '1';
        });
        
        // Remove loading skeletons
        document.querySelectorAll('.chart-skeleton').forEach(skeleton => {
            skeleton.remove();
        });
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'dashboard-error';
        errorDiv.innerHTML = `
            <span class="material-symbols-outlined">error</span>
            <span>${message}</span>
            <button class="error-close">&times;</button>
        `;
        
        // Style
        errorDiv.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: #ef4444;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Close button
        const closeBtn = errorDiv.querySelector('.error-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            margin-left: 0.5rem;
        `;
        
        closeBtn.addEventListener('click', () => errorDiv.remove());
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => errorDiv.remove(), 300);
            }
        }, 5000);
        
        // Add animation styles
        if (!document.querySelector('#error-styles')) {
            const style = document.createElement('style');
            style.id = 'error-styles';
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
    }
    
    /**
     * Initialize real-time updates
     */
    function initializeRealtimeUpdates() {
        // Update active sessions every 30 seconds
        setInterval(async () => {
            try {
                const stats = await window.adminService.getLiveStats();
                if (stats.activeSessions) {
                    const sessionElement = document.querySelector('.stat-value:nth-of-type(2)');
                    if (sessionElement) {
                        sessionElement.textContent = stats.activeSessions.toLocaleString();
                    }
                }
            } catch (error) {
                console.error('Error updating live stats:', error);
            }
        }, 30000);
        
        // Update last sync time
        setInterval(() => {
            const syncElement = document.querySelector('.footer-left p');
            if (syncElement) {
                syncElement.textContent = `Last background sync: Just now`;
                setTimeout(() => {
                    syncElement.textContent = `Last background sync: 1 minute ago`;
                }, 60000);
            }
        }, 120000);
    }
    
    // Initialize real-time updates
    initializeRealtimeUpdates();
    
    /**
     * Handle search functionality
     */
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                performSearch(this.value.trim());
            }
        });
    }
    
    /**
     * Perform search
     */
    async function performSearch(query) {
        try {
            const results = await window.adminService.searchSystemLogs(query);
            // In a real app, this would display search results
            console.log('Search results:', results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    /**
     * Add CSS for tooltips
     */
    function addTooltipStyles() {
        if (!document.querySelector('#tooltip-styles')) {
            const style = document.createElement('style');
            style.id = 'tooltip-styles';
            style.textContent = `
                .bar-tooltip {
                    position: absolute;
                    top: -2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1f2937;
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.625rem;
                    font-weight: 600;
                    white-space: nowrap;
                    z-index: 10;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                .bar-tooltip::after {
                    content: '';
                    position: absolute;
                    bottom: -0.25rem;
                    left: 50%;
                    transform: translateX(-50%);
                    border-left: 0.25rem solid transparent;
                    border-right: 0.25rem solid transparent;
                    border-top: 0.25rem solid #1f2937;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Add tooltip styles
    addTooltipStyles();
});