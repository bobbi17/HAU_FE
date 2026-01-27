// Student Dashboard JavaScript
import { DashboardService } from '../services/dashboard-service.js';
import { NotificationService } from '../services/notification-service.js';

class StudentDashboard {
    constructor() {
        this.dashboardService = new DashboardService();
        this.notificationService = new NotificationService();
        this.init();
    }
    
    async init() {
        console.log('Student Dashboard initialized');
        
        // Cập nhật ngày hiện tại
        this.updateCurrentDate();
        
        // Load all dashboard data
        await this.loadDashboardData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Khởi tạo carousel
        this.initializeCarousel();
        
        // Kiểm tra notification
        this.checkNotifications();
    }
    
    updateCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', day: '2-digit', month: '2-digit' };
        const formattedDate = now.toLocaleDateString('vi-VN', options);
        
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = formattedDate;
        }
    }
    
    async loadDashboardData() {
        try {
            const data = await this.dashboardService.getStudentDashboardData();
            
            // Load reminders
            this.loadReminders(data.reminders);
            
            // Load today's schedule
            this.loadTodaySchedule(data.schedule);
            
            // Load course progress
            this.loadCourseProgress(data.progress);
            
            // Load study groups
            this.loadStudyGroups(data.groups);
            
            // Update profile if data available
            if (data.profile) {
                this.updateProfile(data.profile);
            }
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.loadMockData();
        }
    }
    
    loadMockData() {
        // Mock data for development
        const mockData = {
            reminders: [
                {
                    id: 1,
                    type: 'deadline',
                    icon: 'history_edu',
                    color: '#f59e0b',
                    title: 'Đồ án Kiến trúc Dân dụng 1',
                    description: 'Còn 2 ngày • Giai đoạn Concept'
                },
                // ... other mock reminders
            ],
            schedule: [
                {
                    time: '07:00 - 10:30',
                    course: 'Lý thuyết Kiến trúc 1',
                    location: 'Hội trường A1 • Thầy Lê Thành Nam',
                    active: true
                },
                // ... other mock schedule items
            ],
            progress: [
                {
                    course: 'Đồ án Kiến trúc 1',
                    score: '8.2 / 10.0',
                    percentage: 82,
                    color: '#10b981'
                },
                // ... other mock progress items
            ],
            groups: [
                {
                    id: 1,
                    name: 'Team Đồ án 1',
                    online: true,
                    members: 5,
                    memberAvatars: 3
                }
            ]
        };
        
        this.loadReminders(mockData.reminders);
        this.loadTodaySchedule(mockData.schedule);
        this.loadCourseProgress(mockData.progress);
        this.loadStudyGroups(mockData.groups);
    }
    
    loadReminders(reminders) {
        const container = document.getElementById('remindersCarousel');
        if (!container) return;
        
        container.innerHTML = reminders.map(reminder => `
            <div class="reminder-card" data-id="${reminder.id}" data-type="${reminder.type}">
                <div class="reminder-icon" style="background: ${reminder.color}20; color: ${reminder.color}">
                    <span class="material-symbols-outlined">${reminder.icon}</span>
                </div>
                <div class="reminder-content">
                    <span class="reminder-type">${this.getReminderTypeText(reminder.type)}</span>
                    <h4 class="reminder-title">${reminder.title}</h4>
                    <p class="reminder-description">${reminder.description}</p>
                </div>
            </div>
        `).join('');
    }
    
    getReminderTypeText(type) {
        const types = {
            'deadline': 'Hạn nộp bài',
            'class': 'Lớp học sắp tới',
            'missing': 'Cần bổ sung',
            'grade': 'Đã công bố điểm'
        };
        return types[type] || type;
    }
    
    loadTodaySchedule(schedule) {
        const container = document.getElementById('todaySchedule');
        if (!container) return;
        
        // Determine active class based on current time
        const now = new Date();
        const currentHour = now.getHours();
        
        container.innerHTML = schedule.map(item => {
            const startHour = parseInt(item.time.split(':')[0]);
            const isActive = item.active || (startHour <= currentHour && currentHour < startHour + 3);
            
            return `
                <div class="schedule-item ${isActive ? 'active' : ''}">
                    <div class="schedule-dot ${isActive ? 'active' : ''}"></div>
                    <div class="schedule-content">
                        <div class="schedule-header">
                            <h4 class="schedule-course">${item.course}</h4>
                            <span class="schedule-time ${isActive ? 'active' : ''}">${item.time}</span>
                        </div>
                        <p class="schedule-location">${item.location}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    loadCourseProgress(progress) {
        const container = document.getElementById('courseProgress');
        if (!container) return;
        
        container.innerHTML = progress.map(item => `
            <div class="progress-item">
                <div class="progress-header">
                    <span class="progress-course">${item.course}</span>
                    <span class="progress-score" style="color: ${item.color}">${item.score}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.percentage}%; background: ${item.color}"></div>
                </div>
            </div>
        `).join('');
    }
    
    loadStudyGroups(groups) {
        const container = document.getElementById('studyGroups');
        if (!container) return;
        
        container.innerHTML = groups.map(group => `
            <div class="group-item" data-group-id="${group.id}">
                <div class="group-header">
                    <h4 class="group-name">${group.name}</h4>
                    <span class="online-indicator ${group.online ? 'online' : 'offline'}"></span>
                </div>
                <div class="group-footer">
                    <div class="member-avatars">
                        ${this.renderMemberAvatars(group.memberAvatars || group.members)}
                    </div>
                    <div class="group-actions">
                        <button class="action-btn chat-btn" title="Mở chat nhóm">
                            <span class="material-symbols-outlined">chat</span>
                        </button>
                        <button class="action-btn folder-btn" title="Xem tài liệu">
                            <span class="material-symbols-outlined">folder</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderMemberAvatars(memberCount) {
        let avatars = '';
        const visibleAvatars = Math.min(memberCount, 3);
        
        for (let i = 0; i < visibleAvatars; i++) {
            avatars += '<div class="avatar"></div>';
        }
        
        if (memberCount > 3) {
            avatars += `<div class="avatar-more">+${memberCount - 3}</div>`;
        }
        
        return avatars;
    }
    
    updateProfile(profile) {
        // Update profile information if needed
        const profileName = document.querySelector('.profile-title h1');
        if (profileName && profile.name) {
            profileName.textContent = profile.name;
        }
        
        const profileSubtitle = document.querySelector('.profile-subtitle');
        if (profileSubtitle && profile.major) {
            profileSubtitle.textContent = `${profile.major} • ${profile.faculty} • MSSV: ${profile.studentId}`;
        }
        
        // Update GPA badge
        const gpaBadge = document.querySelector('.badge-gpa');
        if (gpaBadge && profile.gpa) {
            gpaBadge.innerHTML = `<span class="material-symbols-outlined">stars</span> GPA ${profile.gpa}`;
        }
    }
    
    initializeCarousel() {
        const container = document.getElementById('remindersCarousel');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (!container || !prevBtn || !nextBtn) return;
        
        let scrollPosition = 0;
        const cardWidth = 320; // Width of reminder card including margin
        
        prevBtn.addEventListener('click', () => {
            scrollPosition = Math.max(scrollPosition - cardWidth, 0);
            container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        });
        
        nextBtn.addEventListener('click', () => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            scrollPosition = Math.min(scrollPosition + cardWidth, maxScroll);
            container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        });
        
        // Auto scroll every 5 seconds
        this.carouselInterval = setInterval(() => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            if (scrollPosition >= maxScroll) {
                scrollPosition = 0;
            } else {
                scrollPosition += cardWidth;
            }
            container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }, 5000);
    }
    
    setupEventListeners() {
        // View profile button
        const viewProfileBtn = document.querySelector('.btn-primary');
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', () => {
                this.navigateToProfile();
            });
        }
        
        // Edit profile button
        const editProfileBtn = document.querySelector('.btn-outline');
        if (editProfileBtn && !editProfileBtn.classList.contains('btn-full')) {
            editProfileBtn.addEventListener('click', () => {
                this.navigateToEditProfile();
            });
        }
        
        // View all groups button
        const viewAllGroupsBtn = document.querySelector('.btn-outline.btn-full.mt-6');
        if (viewAllGroupsBtn) {
            viewAllGroupsBtn.addEventListener('click', () => {
                this.navigateToGroups();
            });
        }
        
        // View full schedule button
        const viewScheduleBtn = document.querySelector('.btn-outline.mt-8');
        if (viewScheduleBtn) {
            viewScheduleBtn.addEventListener('click', () => {
                this.navigateToSchedule();
            });
        }
        
        // Reminder cards click
        document.addEventListener('click', (e) => {
            const reminderCard = e.target.closest('.reminder-card');
            if (reminderCard) {
                const id = reminderCard.dataset.id;
                const type = reminderCard.dataset.type;
                this.handleReminderClick(id, type);
            }
        });
        
        // Group chat buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.chat-btn')) {
                const groupItem = e.target.closest('.group-item');
                const groupId = groupItem?.dataset.groupId;
                this.openGroupChat(groupId);
            }
            
            if (e.target.closest('.folder-btn')) {
                const groupItem = e.target.closest('.group-item');
                const groupId = groupItem?.dataset.groupId;
                this.openGroupFolder(groupId);
            }
        });
        
        // Card menu buttons
        const cardMenu = document.querySelector('.card-menu');
        if (cardMenu) {
            cardMenu.addEventListener('click', (e) => {
                this.showCardMenu(e);
            });
        }
        
        // Course progress actions
        const progressActions = document.querySelectorAll('.card-actions .btn');
        progressActions.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.textContent.includes('Nhập điểm')) {
                    this.openGradeInput();
                } else if (btn.textContent.includes('Bảng điểm')) {
                    this.openGradeTable();
                }
            });
        });
        
        // Forum post click
        const forumPost = document.querySelector('.forum-post');
        if (forumPost) {
            forumPost.addEventListener('click', () => {
                this.navigateToForum();
            });
        }
    }
    
    async checkNotifications() {
        try {
            const notifications = await this.notificationService.getUnreadNotifications();
            if (notifications.length > 0) {
                this.showNotificationBadge(notifications.length);
            }
        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    }
    
    showNotificationBadge(count) {
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            let badge = notificationBtn.querySelector('.notification-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
                notificationBtn.appendChild(badge);
            }
            badge.textContent = count;
            badge.style.display = 'block';
        }
    }
    
    // Navigation methods
    navigateToProfile() {
        window.location.href = '../user/profile.html';
    }
    
    navigateToEditProfile() {
        window.location.href = '../user/settings.html';
    }
    
    navigateToGroups() {
        window.location.href = '../groups/study-groups.html';
    }
    
    navigateToSchedule() {
        window.location.href = '../academic/schedule.html';
    }
    
    navigateToForum() {
        window.location.href = '../forum/forum-home.html';
    }
    
    handleReminderClick(id, type) {
        console.log(`Reminder clicked: ${id}, type: ${type}`);
        
        switch(type) {
            case 'deadline':
                this.openAssignmentDetails(id);
                break;
            case 'class':
                this.openClassDetails(id);
                break;
            case 'missing':
                this.openMissingDocuments(id);
                break;
            case 'grade':
                this.openGradeDetails(id);
                break;
        }
    }
    
    openAssignmentDetails(assignmentId) {
        // Navigate to assignment details
        window.location.href = `../academic/assignment-detail.html?id=${assignmentId}`;
    }
    
    openClassDetails(classId) {
        // Navigate to class details
        window.location.href = `../academic/class-detail.html?id=${classId}`;
    }
    
    openMissingDocuments(id) {
        // Show missing documents modal
        console.log('Opening missing documents for:', id);
    }
    
    openGradeDetails(gradeId) {
        // Navigate to grade details
        window.location.href = `../academic/grades.html?id=${gradeId}`;
    }
    
    openGroupChat(groupId) {
        // Navigate to group chat
        window.location.href = `../groups/group-chat.html?groupId=${groupId}`;
    }
    
    openGroupFolder(groupId) {
        // Navigate to group documents
        window.location.href = `../groups/group-detail.html?groupId=${groupId}&tab=documents`;
    }
    
    openGradeInput() {
        // Open grade input modal or page
        window.location.href = '../academic/grade-input.html';
    }
    
    openGradeTable() {
        // Open grade table
        window.location.href = '../academic/grades.html';
    }
    
    showCardMenu(event) {
        // Implement card menu dropdown
        console.log('Show card menu at:', event.clientX, event.clientY);
    }
    
    // Cleanup method
    destroy() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
        
        // Remove event listeners if needed
        console.log('Student Dashboard destroyed');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new StudentDashboard();
    
    // Expose dashboard instance for debugging
    window.studentDashboard = dashboard;
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        dashboard.destroy();
    });
});

// Export for module usage
export { StudentDashboard };