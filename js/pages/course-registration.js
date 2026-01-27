import { API_ENDPOINTS } from '../config/api-config.js';
import { ACADEMIC_CONSTANTS } from '../config/constants.js';
import { isAuthenticated, getCurrentUser, isStudent, isInstructor } from '../utils/auth.js';
import CourseService from '../services/course-service.js';
import Modal from '../components/modal.js';
import Notification from '../components/notification.js';

class CourseRegistration {
    constructor() {
        this.courseService = new CourseService();
        this.currentUser = getCurrentUser();
        this.selectedCourses = new Map(); // Map of courseId -> courseData
        this.courses = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.activeFilter = 'all';
        this.searchQuery = '';
        
        this.init();
    }
    
    init() {
        this.loadUserRegistrationInfo();
        this.loadAvailableCourses();
        this.loadSelectedCourses();
        this.setupEventListeners();
        this.initModals();
        this.setupTabs();
    }
    
    async loadUserRegistrationInfo() {
        try {
            const info = await this.courseService.getRegistrationInfo();
            this.updateUserInfo(info);
        } catch (error) {
            console.error('Error loading registration info:', error);
        }
    }
    
    async loadAvailableCourses() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                filter: this.activeFilter !== 'all' ? this.activeFilter : undefined,
                search: this.searchQuery || undefined,
                semester: 'HK1-2024' // Current semester
            };
            
            const response = await this.courseService.getAvailableCourses(params);
            this.courses = response.courses;
            
            this.renderCourses();
            this.updateEmptyState();
        } catch (error) {
            console.error('Error loading available courses:', error);
            this.showError('Không thể tải danh sách học phần');
        } finally {
            this.hideLoading();
        }
    }
    
    async loadSelectedCourses() {
        try {
            const selected = await this.courseService.getSelectedCourses();
            this.selectedCourses = new Map(selected.map(course => [course.id, course]));
            this.renderSelectedCourses();
            this.updateSummary();
        } catch (error) {
            console.error('Error loading selected courses:', error);
        }
    }
    
    updateUserInfo(info) {
        document.getElementById('credits-count').textContent = info.totalCredits || '18';
        document.getElementById('courses-count').textContent = info.selectedCount || '05';
        document.getElementById('payment-status').textContent = info.paymentStatus || 'Học phí: Đã đóng';
    }
    
    renderCourses() {
        const container = document.getElementById('courses-list');
        
        if (this.courses.length === 0) {
            return;
        }
        
        const coursesHTML = this.courses.map(course => 
            this.getCourseHTML(course)
        ).join('');
        
        container.innerHTML = coursesHTML;
        
        // Add event listeners
        this.setupCourseEventListeners();
    }
    
    getCourseHTML(course) {
        const isSelected = this.selectedCourses.has(course.id);
        const iconType = this.getCourseIconType(course.category);
        const actionClass = isSelected ? 'selected' : 'unselected';
        const actionText = isSelected ? 'Đã chọn' : 'Đăng ký';
        const actionIcon = isSelected ? 'check' : 'add_circle';
        
        return `
            <div class="course-card" data-id="${course.id}">
                <div class="course-info">
                    <div class="course-icon ${iconType}">
                        <span class="material-symbols-outlined">${this.getCourseIcon(course.category)}</span>
                    </div>
                    <div class="course-details">
                        <h4 class="course-title">${course.name}</h4>
                        <div class="course-meta">
                            <span class="meta-item">Mã: ${course.code}</span>
                            <span class="dot"></span>
                            <span class="meta-item">${course.credits} Tín chỉ</span>
                            <span class="dot"></span>
                            <span class="meta-item">GV: ${course.instructor}</span>
                        </div>
                    </div>
                </div>
                
                <div class="course-schedule">
                    <span class="schedule-label">Lịch học</span>
                    <span class="schedule-value">${course.schedule}</span>
                </div>
                
                <button class="course-action ${actionClass}" data-id="${course.id}">
                    ${actionText}
                    <span class="material-symbols-outlined">${actionIcon}</span>
                </button>
            </div>
        `;
    }
    
    getCourseIconType(category) {
        const types = {
            'architecture': 'architecture',
            'construction': 'construction',
            'art': 'art',
            'history': 'history',
            'design': 'art',
            'urban': 'architecture'
        };
        return types[category] || 'architecture';
    }
    
    getCourseIcon(category) {
        const icons = {
            'architecture': 'home_work',
            'construction': 'foundation',
            'art': 'brush',
            'history': 'history_edu',
            'design': 'draw',
            'urban': 'location_city'
        };
        return icons[category] || 'home_work';
    }
    
    renderSelectedCourses() {
        const container = document.getElementById('selected-courses-list');
        const selectedArray = Array.from(this.selectedCourses.values());
        
        if (selectedArray.length === 0) {
            container.innerHTML = `
                <div class="empty-selection">
                    <p>Chưa có học phần nào được chọn</p>
                </div>
            `;
            return;
        }
        
        // Show only first 3 courses, others can be expanded
        const displayCourses = selectedArray.slice(0, 3);
        const hasMore = selectedArray.length > 3;
        
        let coursesHTML = displayCourses.map(course => `
            <div class="selected-course-item" data-id="${course.id}">
                <div class="selected-course-info">
                    <span class="course-code">${course.code}</span>
                    <span class="course-name">${course.name}</span>
                </div>
                <button class="remove-course-btn" data-id="${course.id}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `).join('');
        
        if (hasMore) {
            coursesHTML += `
                <button class="view-more-btn" id="view-more-courses">
                    Xem thêm ${selectedArray.length - 3} học phần khác
                </button>
            `;
        }
        
        container.innerHTML = coursesHTML;
        
        // Update counter
        document.getElementById('selected-count').textContent = selectedArray.length;
        
        // Add event listeners
        this.setupSelectedCourseEventListeners();
    }
    
    updateSummary() {
        const selectedArray = Array.from(this.selectedCourses.values());
        const totalCredits = selectedArray.reduce((sum, course) => sum + (course.credits || 0), 0);
        const totalFee = this.calculateTotalFee(selectedArray);
        
        // Update credits count
        document.getElementById('courses-count').textContent = selectedArray.length;
        
        // Update total fee
        document.getElementById('total-fee').textContent = totalFee.toLocaleString('vi-VN') + 'đ';
        
        // Update preview modal values
        if (document.getElementById('confirm-courses-count')) {
            document.getElementById('confirm-courses-count').textContent = `${selectedArray.length} môn`;
            document.getElementById('confirm-credits-count').textContent = `${totalCredits} tín chỉ`;
            document.getElementById('confirm-total-fee').textContent = totalFee.toLocaleString('vi-VN') + 'đ';
        }
    }
    
    calculateTotalFee(courses) {
        // Simple calculation: 200,000đ per credit
        const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
        return totalCredits * 200000;
    }
    
    setupTabs() {
        const tabs = [
            { id: 'all', label: 'Tất cả học phần' },
            { id: 'architecture', label: 'Kiến trúc & Quy hoạch' },
            { id: 'interior', label: 'Nội thất' },
            { id: 'industrial', label: 'Mỹ thuật công nghiệp' }
        ];
        
        const container = document.getElementById('tabs-container');
        container.innerHTML = tabs.map(tab => `
            <button class="tab-button ${this.activeFilter === tab.id ? 'active' : ''}" 
                    data-filter="${tab.id}">
                ${tab.label}
            </button>
        `).join('');
        
        // Add filter button
        container.innerHTML += `
            <button class="tab-button filter" id="advanced-tab-filter">
                <span class="material-symbols-outlined">tune</span>
            </button>
        `;
        
        // Add tab click events
        container.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                if (filter) {
                    this.handleTabFilter(filter);
                } else if (e.currentTarget.id === 'advanced-tab-filter') {
                    this.showAdvancedFilter();
                }
            });
        });
    }
    
    setupCourseEventListeners() {
        // Course action buttons (register/unregister)
        document.querySelectorAll('.course-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const courseId = e.currentTarget.dataset.id;
                this.handleCourseAction(courseId);
            });
        });
        
        // Course card click for details
        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const courseId = card.dataset.id;
                    this.showCourseDetails(courseId);
                }
            });
        });
    }
    
    setupSelectedCourseEventListeners() {
        // Remove course buttons
        document.querySelectorAll('.remove-course-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const courseId = e.currentTarget.dataset.id;
                this.handleRemoveCourse(courseId);
            });
        });
        
        // View more courses button
        const viewMoreBtn = document.getElementById('view-more-courses');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', () => {
                this.showAllSelectedCourses();
            });
        }
    }
    
    async handleCourseAction(courseId) {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        if (!isStudent()) {
            this.showError('Chỉ sinh viên mới có thể đăng ký học phần');
            return;
        }
        
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const isSelected = this.selectedCourses.has(courseId);
        
        try {
            if (isSelected) {
                // Unregister course
                await this.courseService.unregisterCourse(courseId);
                this.selectedCourses.delete(courseId);
                this.showSuccess('Đã hủy đăng ký học phần');
            } else {
                // Register course
                await this.courseService.registerCourse(courseId);
                this.selectedCourses.set(courseId, course);
                this.showSuccess('Đã thêm học phần vào đăng ký');
            }
            
            // Update UI
            this.renderSelectedCourses();
            this.updateSummary();
            this.updateCourseButton(courseId, !isSelected);
            
            // Check schedule conflicts
            await this.checkScheduleConflicts();
            
        } catch (error) {
            console.error('Error handling course action:', error);
            
            if (error.message.includes('conflict')) {
                this.showError('Lịch học bị trùng với môn học khác');
            } else if (error.message.includes('prerequisite')) {
                this.showError('Chưa hoàn thành môn học tiên quyết');
            } else if (error.message.includes('capacity')) {
                this.showError('Lớp học đã đầy');
            } else {
                this.showError('Không thể thực hiện thao tác');
            }
        }
    }
    
    async handleRemoveCourse(courseId) {
        try {
            await this.courseService.unregisterCourse(courseId);
            this.selectedCourses.delete(courseId);
            
            this.renderSelectedCourses();
            this.updateSummary();
            this.updateCourseButton(courseId, false);
            
            this.showSuccess('Đã xóa học phần khỏi danh sách đăng ký');
        } catch (error) {
            console.error('Error removing course:', error);
            this.showError('Không thể xóa học phần');
        }
    }
    
    updateCourseButton(courseId, isSelected) {
        const button = document.querySelector(`.course-action[data-id="${courseId}"]`);
        if (!button) return;
        
        if (isSelected) {
            button.className = 'course-action selected';
            button.innerHTML = `
                Đã chọn
                <span class="material-symbols-outlined">check</span>
            `;
        } else {
            button.className = 'course-action unselected';
            button.innerHTML = `
                Đăng ký
                <span class="material-symbols-outlined">add_circle</span>
            `;
        }
    }
    
    async checkScheduleConflicts() {
        const selectedArray = Array.from(this.selectedCourses.values());
        if (selectedArray.length < 2) return;
        
        try {
            const conflicts = await this.courseService.checkScheduleConflicts(
                Array.from(this.selectedCourses.keys())
            );
            
            if (conflicts.length > 0) {
                this.showWarning('Có môn học bị trùng lịch. Vui lòng kiểm tra lại.');
            }
        } catch (error) {
            console.error('Error checking schedule conflicts:', error);
        }
    }
    
    handleTabFilter(filter) {
        this.activeFilter = filter;
        this.currentPage = 1;
        
        // Update active tab UI
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.tab-button[data-filter="${filter}"]`).classList.add('active');
        
        // Reload courses
        this.loadAvailableCourses();
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('course-search-input');
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchQuery = e.target.value.trim();
                this.currentPage = 1;
                this.loadAvailableCourses();
            }, 500);
        });
        
        // Advanced filter button
        document.getElementById('advanced-filter-btn')?.addEventListener('click', () => {
            this.showAdvancedFilter();
        });
        
        // Load more button
        document.getElementById('load-more-btn')?.addEventListener('click', () => {
            this.handleLoadMore();
        });
        
        // Confirm registration button
        document.getElementById('confirm-registration-btn')?.addEventListener('click', () => {
            this.handleConfirmRegistration();
        });
        
        // Help video button
        document.getElementById('help-video-btn')?.addEventListener('click', () => {
            this.showHelpVideo();
        });
        
        // View schedule button
        document.getElementById('view-schedule-btn')?.addEventListener('click', () => {
            this.viewFullSchedule();
        });
    }
    
    initModals() {
        // Course detail modal
        this.courseDetailModal = new Modal('course-detail-modal', {
            onClose: () => {}
        });
        
        // Confirm registration modal
        this.confirmRegistrationModal = new Modal('confirm-registration-modal', {
            onClose: () => this.resetConfirmationForm()
        });
        
        // Help video modal
        this.helpVideoModal = new Modal('help-video-modal', {
            onClose: () => {}
        });
        
        // Setup modal events
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        // Course detail modal register button
        document.getElementById('modal-register-btn')?.addEventListener('click', () => {
            const courseId = this.currentDetailCourse?.id;
            if (courseId) {
                this.handleCourseAction(courseId);
                this.courseDetailModal.hide();
            }
        });
        
        // Final confirm button
        document.getElementById('final-confirm-btn')?.addEventListener('click', async () => {
            await this.handleFinalConfirmation();
        });
    }
    
    async showCourseDetails(courseId) {
        try {
            const course = await this.courseService.getCourseDetails(courseId);
            this.currentDetailCourse = course;
            
            // Update modal content
            this.updateCourseDetailModal(course);
            this.courseDetailModal.show();
        } catch (error) {
            console.error('Error loading course details:', error);
            this.showError('Không thể tải thông tin chi tiết');
        }
    }
    
    updateCourseDetailModal(course) {
        document.getElementById('modal-course-name').textContent = course.name;
        document.getElementById('detail-instructor').textContent = course.instructor;
        document.getElementById('detail-schedule').textContent = course.schedule;
        document.getElementById('detail-room').textContent = course.room || 'Chưa xác định';
        document.getElementById('detail-capacity').textContent = `${course.registered}/${course.capacity}`;
        document.getElementById('detail-prerequisites').textContent = course.prerequisites?.join(', ') || 'Không có';
        
        // Update capacity bar
        const capacityPercentage = (course.registered / course.capacity) * 100;
        document.getElementById('modal-capacity').textContent = `${course.registered}/${course.capacity}`;
        document.getElementById('modal-capacity-fill').style.width = `${Math.min(capacityPercentage, 100)}%`;
        document.getElementById('modal-capacity-note').textContent = 
            `Còn ${course.capacity - course.registered} chỗ trống`;
        
        // Update register button based on selection
        const isSelected = this.selectedCourses.has(course.id);
        const registerBtn = document.getElementById('modal-register-btn');
        
        if (isSelected) {
            registerBtn.innerHTML = `
                <span class="material-symbols-outlined">remove</span>
                Hủy đăng ký
            `;
        } else {
            registerBtn.innerHTML = `
                <span class="material-symbols-outlined">add_circle</span>
                Thêm vào đăng ký
            `;
        }
    }
    
    handleConfirmRegistration() {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        const selectedCount = this.selectedCourses.size;
        if (selectedCount === 0) {
            this.showError('Vui lòng chọn ít nhất một học phần để đăng ký');
            return;
        }
        
        // Check minimum credits (12 credits)
        const totalCredits = Array.from(this.selectedCourses.values())
            .reduce((sum, course) => sum + (course.credits || 0), 0);
        
        if (totalCredits < 12) {
            this.showError(`Cần đăng ký tối thiểu 12 tín chỉ. Hiện tại: ${totalCredits} tín chỉ`);
            return;
        }
        
        this.confirmRegistrationModal.show();
    }
    
    async handleFinalConfirmation() {
        const checkboxes = [
            'confirm-rules',
            'confirm-schedule-check',
            'confirm-prerequisites',
            'confirm-payment'
        ];
        
        const allChecked = checkboxes.every(id => document.getElementById(id).checked);
        
        if (!allChecked) {
            this.showError('Vui lòng xác nhận tất cả các điều khoản');
            return;
        }
        
        try {
            const selectedCourseIds = Array.from(this.selectedCourses.keys());
            await this.courseService.confirmRegistration(selectedCourseIds);
            
            this.confirmRegistrationModal.hide();
            this.resetConfirmationForm();
            
            this.showSuccess('Đăng ký học phần thành công!');
            
            // Refresh the page or update UI
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error confirming registration:', error);
            this.showError('Không thể xác nhận đăng ký. Vui lòng thử lại.');
        }
    }
    
    showAdvancedFilter() {
        // Implementation for advanced filter modal
        this.showInfo('Tính năng bộ lọc nâng cao sẽ được cập nhật sau');
    }
    
    handleLoadMore() {
        this.currentPage++;
        this.loadMoreCourses();
    }
    
    async loadMoreCourses() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                filter: this.activeFilter !== 'all' ? this.activeFilter : undefined,
                search: this.searchQuery || undefined
            };
            
            const response = await this.courseService.getAvailableCourses(params);
            const newCourses = response.courses;
            
            if (newCourses.length === 0) {
                this.showInfo('Đã hiển thị tất cả học phần');
                document.getElementById('load-more-btn').style.display = 'none';
                return;
            }
            
            this.courses = [...this.courses, ...newCourses];
            this.renderCourses();
            
        } catch (error) {
            console.error('Error loading more courses:', error);
            this.showError('Không thể tải thêm học phần');
        }
    }
    
    showAllSelectedCourses() {
        const selectedArray = Array.from(this.selectedCourses.values());
        
        let coursesHTML = selectedArray.map(course => `
            <div class="selected-course-item" data-id="${course.id}">
                <div class="selected-course-info">
                    <span class="course-code">${course.code}</span>
                    <span class="course-name">${course.name}</span>
                </div>
                <button class="remove-course-btn" data-id="${course.id}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `).join('');
        
        document.getElementById('selected-courses-list').innerHTML = coursesHTML;
        this.setupSelectedCourseEventListeners();
    }
    
    showHelpVideo() {
        this.helpVideoModal.show();
    }
    
    viewFullSchedule() {
        const selectedArray = Array.from(this.selectedCourses.values());
        if (selectedArray.length === 0) {
            this.showInfo('Chưa có học phần nào được chọn');
            return;
        }
        
        // Navigate to schedule page or show schedule modal
        window.open('/pages/academic/schedule.html', '_blank');
    }
    
    updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (this.courses.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
        }
    }
    
    showLoading() {
        const container = document.getElementById('courses-list');
        container.innerHTML = `
            <div class="loading-indicator">
                <span class="material-symbols-outlined animate-spin">refresh</span>
                <p>Đang tải danh sách học phần...</p>
            </div>
        `;
    }
    
    hideLoading() {
        // Loading indicator is replaced by content
    }
    
    resetConfirmationForm() {
        const checkboxes = [
            'confirm-rules',
            'confirm-schedule-check',
            'confirm-prerequisites',
            'confirm-payment'
        ];
        
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });
    }
    
    showAuthRequired() {
        if (confirm('Bạn cần đăng nhập để thực hiện chức năng này. Đến trang đăng nhập?')) {
            window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.href);
        }
    }
    
    showSuccess(message) {
        Notification.show(message, 'success');
    }
    
    showError(message) {
        Notification.show(message, 'error');
    }
    
    showWarning(message) {
        Notification.show(message, 'warning');
    }
    
    showInfo(message) {
        Notification.show(message, 'info');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CourseRegistration();
});