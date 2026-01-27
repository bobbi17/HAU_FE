// Lecturer Dashboard JavaScript

// Initialize dashboard
function initializeLecturerDashboard() {
    console.log('Initializing Lecturer Dashboard...');
    
    // Set current date
    updateCurrentDate();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Load notifications count
    loadNotificationsCount();
    
    // Initialize quick stats
    initializeQuickStats();
    
    // Set up event listeners
    setupEventListeners();
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('vi-VN', options);
    
    // Capitalize first letter
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    const dateElements = document.querySelectorAll('.subtitle');
    dateElements.forEach(el => {
        el.textContent = capitalizedDate;
    });
}

// Initialize tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(tooltip => {
        const text = tooltip.getAttribute('data-tooltip');
        
        tooltip.addEventListener('mouseenter', (e) => {
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip';
            tooltipEl.textContent = text;
            
            document.body.appendChild(tooltipEl);
            
            const rect = tooltip.getBoundingClientRect();
            tooltipEl.style.left = `${rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2}px`;
            tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 10}px`;
        });
        
        tooltip.addEventListener('mouseleave', () => {
            const existingTooltip = document.querySelector('.tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }
        });
    });
}

// Load notifications count
function loadNotificationsCount() {
    // Mock data - in real app, this would be an API call
    const notifications = [
        { id: 1, read: false },
        { id: 2, read: false },
        { id: 3, read: true }
    ];
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Update badge
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    // Update header badge
    const headerBadge = document.querySelector('.badge');
    if (headerBadge) {
        headerBadge.textContent = unreadCount;
        headerBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
}

// Initialize quick stats
function initializeQuickStats() {
    // Mock data - in real app, this would be an API call
    const stats = {
        classes: 12,
        students: 245,
        projects: 8,
        schedules: 4
    };
    
    // Animate numbers
    animateNumber('.stat[data-stat="classes"] .stat-number', stats.classes);
    animateNumber('.stat[data-stat="students"] .stat-number', stats.students);
    animateNumber('.stat[data-stat="projects"] .stat-number', stats.projects);
    animateNumber('.stat[data-stat="schedules"] .stat-number', stats.schedules);
}

// Animate number counting
function animateNumber(selector, target) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    let current = 0;
    const increment = target / 50; // 50 frames
    const duration = 1000; // 1 second
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, duration / 50);
}

// Set up event listeners
function setupEventListeners() {
    // Notification button
    const notificationBtn = document.querySelector('.btn-notification');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            // In real app, this would open notifications panel
            alert('Mở danh sách thông báo');
        });
    }
    
    // Class items
    const classItems = document.querySelectorAll('.class-item');
    classItems.forEach(item => {
        item.addEventListener('click', () => {
            const classCode = item.querySelector('.class-badge').textContent;
            const className = item.querySelector('h4').textContent;
            console.log(`Opening class: ${classCode} - ${className}`);
            // In real app: navigate to class detail
        });
    });
    
    // AI Assistant buttons
    const aiButtons = document.querySelectorAll('.ai-actions .btn');
    aiButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.textContent.trim();
            console.log(`AI Action: ${action}`);
            
            // In real app: open AI chat with specific context
            if (action.includes('Soạn giáo án')) {
                openAIChat('lesson-plan');
            } else if (action.includes('Portfolio')) {
                openAIChat('portfolio');
            }
        });
    });
    
    // Schedule status buttons
    const scheduleItems = document.querySelectorAll('.schedule-item');
    scheduleItems.forEach(item => {
        const statusBtn = item.querySelector('.btn-status');
        if (statusBtn && statusBtn.textContent.includes('Mở lớp')) {
            statusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const className = item.querySelector('h4').textContent;
                console.log(`Opening virtual classroom for: ${className}`);
                // In real app: open virtual classroom
            });
        }
    });
    
    // Project "Mở studio" button
    const openStudioBtn = document.querySelector('.project-item .btn-primary');
    if (openStudioBtn) {
        openStudioBtn.addEventListener('click', () => {
            console.log('Opening project studio');
            // In real app: open project management interface
        });
    }
}

// Open AI Chat
function openAIChat(context) {
    console.log(`Opening AI chat with context: ${context}`);
    
    // In real app, this would open a modal or navigate to AI chat page
    // For now, show a message
    alert(`Mở Thư đồng AI với chủ đề: ${context}\n\nChức năng này đang được phát triển.`);
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeLecturerDashboard,
        updateCurrentDate,
        loadNotificationsCount
    };
}