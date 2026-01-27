import { API_ENDPOINTS } from '../config/api-config.js';
import { ACADEMIC_CONSTANTS } from '../config/constants.js';
import { isAuthenticated, getCurrentUser, isStudent, isInstructor } from '../utils/auth.js';
import CourseService from '../services/course-service.js';
import Modal from '../components/modal.js';
import Notification from '../components/notification.js';

class CourseClasses {
    constructor() {
        this.courseService = new CourseService();
        this.currentUser = getCurrentUser();
        this.currentPage = 1;
        this.pageSize = 10;
        this.classes = [];
        this.totalClasses = 0;
        this.filterOptions = {};
        this.selectedClass = null;
        
        this.init();
    }
    
    init() {
        this.loadClasses();
        this.setupEventListeners();
        this.initModals();
        this.updateStats();
    }
    
    async loadClasses() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.filterOptions
            };
            
            const response = await this.courseService.getClasses(params);
            
            if (this.currentPage === 1) {
                this.classes = response.classes;
            } else {
                this.classes = [...this.classes, ...response.classes];
            }
            
            this.totalClasses = response.total;
            
            this.renderClasses();
            this.updateStats();
            
            // Hide load more button if no more classes
            if (this.classes.length >= response.total) {
                document.getElementById('load-more-btn').style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            this.showError('Không thể tải danh sách lớp học');
        } finally {
            this.hideLoading();
        }
    }
    
    renderClasses() {
        const container = document.getElementById('classes-list');
        
        if (this.classes.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        const classesHTML = this.classes.map(classItem => 
            this.getClassHTML(classItem)
        ).join('');
        
        container.innerHTML = classesHTML;
        
        // Add event listeners to buttons
        this.setupClassEventListeners();
    }
    
    getClassHTML(classItem) {
        const status = this.getClassStatus(classItem);
        const capacityPercentage = (classItem.registered / classItem.capacity) * 100;
        
        return `
            <div class="class-card" data-id="${classItem.id}">
                <div class="class-card-content">
                    <div class="class-main-info">
                        <div class="class-header">
                            <span class="class-code-badge">Mã môn: ${classItem.code}</span>
                            <span class="class-status-badge ${status.type}">
                                <span class="material-symbols-outlined">${status.icon}</span>
                                ${status.text}
                            </span>
                        </div>
                        <h3 class="class-title">${classItem.name}</h3>
                        
                        <div class="class-details-grid">
                            <div class="class-detail-item">
                                <div class="detail-icon">
                                    <span class="material-symbols-outlined">person</span>
                                </div>
                                <div class="detail-content">
                                    <span class="detail-label">Giảng viên</span>
                                    <span class="detail-value">${classItem.instructor}</span>
                                </div>
                            </div>
                            
                            <div class="class-detail-item">
                                <div class="detail-icon">
                                    <span class="material-symbols-outlined">calendar_today</span>
                                </div>
                                <div class="detail-content">
                                    <span class="detail-label">Lịch học</span>
                                    <span class="detail-value">${classItem.schedule}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="class-sidebar">
                        <div class="class-capacity">
                            <div class="capacity-header">
                                <span class="capacity-label">Sĩ số lớp</span>
                                <span class="capacity-numbers">
                                    <span class="current">${classItem.registered}</span>/${classItem.capacity}
                                </span>
                            </div>
                            <div class="capacity-bar">
                                <div class="capacity-fill ${this.getCapacityClass(capacityPercentage)}" 
                                     style="width: ${Math.min(capacityPercentage, 100)}%"></div>
                            </div>
                            <p class="capacity-note ${this.getCapacityClass(capacityPercentage)}">
                                ${this.getCapacityNote(classItem, capacityPercentage)}
                            </p>
                        </div>
                        
                        <div class="class-actions">
                            <button class="btn-register" data-id="${classItem.id}">
                                Đăng ký ngay
                            </button>
                            <button class="btn-details" data-id="${classItem.id}">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getClassStatus(classItem) {
        const capacityPercentage = (classItem.registered / classItem.capacity) * 100;
        
        if (capacityPercentage >= 95) {
            return {
                type: 'warning',
                icon: 'local_fire_department',
                text: 'Sắp hết chỗ'
            };
        } else if (capacityPercentage >= 80) {
            return {
                type: 'popular',
                icon: 'star',
                text: 'Phổ biến'
            };
        } else {
            return {
                type: 'available',
                icon: 'check_circle',
                text: 'Còn chỗ trống'
            };
        }
    }
    
    getCapacityClass(percentage) {
        if (percentage >= 90) return 'low';
        if (percentage >= 70) return 'medium';
        return 'high';
    }
    
    getCapacityNote(classItem, percentage) {
        const availableSlots = classItem.capacity - classItem.registered;
        
        if (percentage >= 95) {
            return `Chỉ còn ${availableSlots} chỗ trống!`;
        } else if (percentage >= 80) {
            return `Còn ${availableSlots} chỗ trống`;
        } else {
            return `Còn ${availableSlots} chỗ trống`;
        }
    }
    
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <span class="material-symbols-outlined">school</span>
                </div>
                <h3 class="empty-title">Không tìm thấy lớp học</h3>
                <p class="empty-description">
                    Hãy thử thay đổi bộ lọc hoặc quay lại sau khi có lớp học mới
                </p>
                <button id="reset-filters-btn" class="btn-primary">
                    Đặt lại bộ lọc
                </button>
            </div>
        `;
    }
    
    setupClassEventListeners() {
        // Register buttons
        document.querySelectorAll('.btn-register').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const classId = e.currentTarget.dataset.id;
                this.handleRegisterClick(classId);
            });
        });
        
        // Detail buttons
        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const classId = e.currentTarget.dataset.id;
                this.showClassDetails(classId);
            });
        });
        
        // Class card click
        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const classId = card.dataset.id;
                    this.showClassDetails(classId);
                }
            });
        });
    }
    
    async handleRegisterClick(classId) {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        if (!isStudent()) {
            this.showError('Chỉ sinh viên mới có thể đăng ký lớp học');
            return;
        }
        
        const classItem = this.classes.find(c => c.id === classId);
        if (!classItem) return;
        
        this.selectedClass = classItem;
        this.showRegistrationModal();
    }
    
    async showClassDetails(classId) {
        try {
            const classItem = this.classes.find(c => c.id === classId);
            if (!classItem) return;
            
            this.selectedClass = classItem;
            this.renderClassDetailsModal(classItem);
            this.classDetailModal.show();
        } catch (error) {
            console.error('Error loading class details:', error);
            this.showError('Không thể tải thông tin chi tiết');
        }
    }
    
    renderClassDetailsModal(classItem) {
        document.getElementById('modal-class-name').textContent = classItem.name;
        document.getElementById('modal-class-code').textContent = classItem.code;
        document.getElementById('modal-class-subject').textContent = classItem.name;
        document.getElementById('modal-class-description').textContent = classItem.description || 'Không có mô tả';
        
        // Set status
        const statusEl = document.getElementById('modal-class-status');
        const status = this.getClassStatus(classItem);
        statusEl.textContent = status.text;
        statusEl.className = `class-status ${status.type}`;
        
        // Update details
        document.getElementById('detail-course-code').textContent = classItem.code;
        document.getElementById('detail-credits').textContent = classItem.credits || '3';
        document.getElementById('detail-type').textContent = classItem.type || 'Bắt buộc';
        document.getElementById('detail-semester').textContent = classItem.semester || 'HK1 - 2024-2025';
        document.getElementById('detail-max-students').textContent = classItem.capacity;
        document.getElementById('detail-registered').textContent = classItem.registered;
        
        // Render instructor
        const instructorCard = document.getElementById('instructor-card');
        instructorCard.innerHTML = `
            <div class="instructor-avatar" 
                 style="background-image: url('${classItem.instructorAvatar || ''}')"></div>
            <div class="instructor-info">
                <h4 class="instructor-name">${classItem.instructor}</h4>
                <p class="instructor-title">${classItem.instructorTitle || 'Giảng viên'}</p>
            </div>
        `;
        
        // Render schedule
        const scheduleCard = document.getElementById('schedule-card');
        scheduleCard.innerHTML = `
            <div class="schedule-item">
                <div class="schedule-icon">
                    <span class="material-symbols-outlined">calendar_today</span>
                </div>
                <div class="schedule-details">
                    <p class="schedule-day">${classItem.schedule}</p>
                    <p class="schedule-time">${classItem.room || 'Chưa xác định'}</p>
                </div>
            </div>
        `;
        
        // Render requirements
        const requirementsList = document.getElementById('requirements-list');
        const requirements = classItem.requirements || ['Không có yêu cầu tiên quyết'];
        requirementsList.innerHTML = requirements.map(req => `
            <div class="requirement-item">
                <span class="material-symbols-outlined">check_circle</span>
                <span>${req}</span>
            </div>
        `).join('');
    }
    
    updateStats() {
        const totalClasses = this.totalClasses;
        const totalInstructors = new Set(this.classes.map(c => c.instructor)).size;
        const registeredClasses = this.classes.filter(c => c.registered >= c.capacity).length;
        const availableSlots = this.classes.reduce((sum, c) => sum + (c.capacity - c.registered), 0);
        
        document.getElementById('total-classes').textContent = totalClasses.toLocaleString();
        document.getElementById('total-instructors').textContent = totalInstructors.toLocaleString();
        document.getElementById('registered-classes').textContent = registeredClasses.toLocaleString();
        document.getElementById('available-slots').textContent = availableSlots.toLocaleString();
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 500);
        });
        
        // Filter buttons
        document.getElementById('filter-major-btn').addEventListener('click', () => {
            this.handleFilterButtonClick('major');
        });
        
        document.getElementById('filter-semester-btn').addEventListener('click', () => {
            this.handleFilterButtonClick('semester');
        });
        
        document.getElementById('advanced-filter-btn').addEventListener('click', () => {
            this.showFilterModal();
        });
        
        // Load more button
        document.getElementById('load-more-btn').addEventListener('click', () => {
            this.handleLoadMore();
        });
        
        // Reset filters button (empty state)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'reset-filters-btn') {
                this.handleResetFilters();
            }
        });
    }
    
    initModals() {
        // Class detail modal
        this.classDetailModal = new Modal('class-detail-modal', {
            onClose: () => this.selectedClass = null
        });
        
        // Registration modal
        this.registrationModal = new Modal('registration-modal', {
            onClose: () => this.resetRegistrationForm()
        });
        
        // Filter modal
        this.filterModal = new Modal('filter-modal', {
            onClose: () => this.resetFilterForm()
        });
        
        // Setup modal events
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        // Close detail button
        document.getElementById('close-detail-btn').addEventListener('click', () => {
            this.classDetailModal.hide();
        });
        
        // Register from modal button
        document.getElementById('register-from-modal-btn').addEventListener('click', () => {
            if (this.selectedClass) {
                this.showRegistrationModal();
            }
        });
        
        // Registration form
        document.getElementById('submit-registration-btn').addEventListener('click', async () => {
            await this.handleRegistrationSubmit();
        });
        
        document.getElementById('cancel-registration-btn').addEventListener('click', () => {
            this.registrationModal.hide();
        });
        
        // Filter modal
        document.getElementById('apply-filter-btn').addEventListener('click', () => {
            this.handleApplyFilter();
        });
        
        document.getElementById('reset-filter-btn').addEventListener('click', () => {
            this.handleResetFilter();
        });
    }
    
    handleSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length > 2 || trimmedQuery === '') {
            this.filterOptions.search = trimmedQuery || undefined;
            this.resetAndReloadClasses();
        }
    }
    
    handleFilterButtonClick(filterType) {
        // Implement dropdown filter logic
        console.log(`Filter by ${filterType}`);
    }
    
    handleLoadMore() {
        this.currentPage++;
        this.loadClasses();
    }
    
    handleResetFilters() {
        this.filterOptions = {};
        this.currentPage = 1;
        this.loadClasses();
    }
    
    showRegistrationModal() {
        if (!this.selectedClass) return;
        
        // Update modal content
        document.getElementById('confirm-class-name').textContent = this.selectedClass.name;
        document.getElementById('confirm-class-code').textContent = this.selectedClass.code;
        document.getElementById('confirm-instructor').textContent = this.selectedClass.instructor;
        
        this.registrationModal.show();
    }
    
    showFilterModal() {
        // Pre-fill form with current filters
        const form = document.getElementById('filter-form');
        
        if (this.filterOptions.majors) {
            const majorSelect = form.querySelector('#filter-major');
            Array.from(majorSelect.options).forEach(option => {
                if (this.filterOptions.majors.includes(option.value)) {
                    option.selected = true;
                }
            });
        }
        
        if (this.filterOptions.semester) {
            form.querySelector('#filter-semester').value = this.filterOptions.semester;
        }
        
        if (this.filterOptions.day) {
            form.querySelector('#filter-day').value = this.filterOptions.day;
        }
        
        if (this.filterOptions.type) {
            form.querySelector('#filter-type').value = this.filterOptions.type;
        }
        
        if (this.filterOptions.availability) {
            form.querySelector('#filter-availability').value = this.filterOptions.availability;
        }
        
        if (this.filterOptions.time) {
            form.querySelector('#filter-time').value = this.filterOptions.time;
        }
        
        this.filterModal.show();
    }
    
    async handleRegistrationSubmit() {
        if (!this.selectedClass) return;
        
        const confirmTerms = document.getElementById('confirm-terms').checked;
        const confirmSchedule = document.getElementById('confirm-schedule').checked;
        
        if (!confirmTerms || !confirmSchedule) {
            this.showError('Vui lòng xác nhận tất cả các điều khoản');
            return;
        }
        
        try {
            const note = document.getElementById('registration-note').value;
            
            await this.courseService.registerForClass(this.selectedClass.id, {
                note: note || undefined
            });
            
            this.registrationModal.hide();
            this.resetRegistrationForm();
            this.showSuccess('Đăng ký lớp học thành công!');
            
            // Refresh the class list
            this.currentPage = 1;
            this.loadClasses();
        } catch (error) {
            console.error('Error registering for class:', error);
            this.showError('Không thể đăng ký lớp học. Vui lòng thử lại.');
        }
    }
    
    handleApplyFilter() {
        const form = document.getElementById('filter-form');
        const formData = new FormData(form);
        
        this.filterOptions = {
            majors: Array.from(form.querySelector('#filter-major').selectedOptions).map(o => o.value),
            semester: formData.get('filter-semester') || undefined,
            day: formData.get('filter-day') || undefined,
            type: formData.get('filter-type') || undefined,
            availability: formData.get('filter-availability') || undefined,
            time: formData.get('filter-time') || undefined
        };
        
        this.filterModal.hide();
        this.resetAndReloadClasses();
    }
    
    handleResetFilter() {
        const form = document.getElementById('filter-form');
        form.reset();
    }
    
    resetAndReloadClasses() {
        this.currentPage = 1;
        this.classes = [];
        document.getElementById('load-more-btn').style.display = 'block';
        this.loadClasses();
    }
    
    resetRegistrationForm() {
        document.getElementById('registration-form').reset();
    }
    
    resetFilterForm() {
        document.getElementById('filter-form').reset();
    }
    
    showLoading() {
        const container = document.getElementById('classes-list');
        if (this.currentPage === 1) {
            container.innerHTML = `
                <div class="loading-indicator">
                    <span class="material-symbols-outlined animate-spin">refresh</span>
                    <p>Đang tải danh sách lớp học...</p>
                </div>
            `;
        }
    }
    
    hideLoading() {
        // Loading indicator is replaced by content
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CourseClasses();
});