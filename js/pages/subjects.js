import { API_ENDPOINTS } from '../config/api-config.js';
import { ACADEMIC_CONSTANTS } from '../config/constants.js';
import { isAuthenticated, getCurrentUser, isStudent, isInstructor } from '../utils/auth.js';
import CourseService from '../services/course-service.js';
import Modal from '../components/modal.js';
import Notification from '../components/notification.js';

class Subjects {
    constructor() {
        this.courseService = new CourseService();
        this.currentUser = getCurrentUser();
        this.subjects = [];
        this.currentPage = 1;
        this.pageSize = 6;
        this.totalSubjects = 72;
        this.filterOptions = {};
        this.selectedSubject = null;
        
        this.init();
    }
    
    init() {
        this.loadSubjects();
        this.setupEventListeners();
        this.initModals();
        this.setupPagination();
        this.updateStats();
    }
    
    async loadSubjects() {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.filterOptions
            };
            
            const response = await this.courseService.getSubjects(params);
            
            this.subjects = response.subjects || [];
            this.totalSubjects = response.total || 72;
            
            this.renderSubjects();
            this.updatePagination();
            this.updatePaginationInfo();
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showError('Không thể tải danh mục môn học');
        } finally {
            this.hideLoading();
        }
    }
    
    renderSubjects() {
        const container = document.getElementById('subjects-grid');
        
        if (this.subjects.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        const subjectsHTML = this.subjects.map(subject => 
            this.getSubjectHTML(subject)
        ).join('');
        
        container.innerHTML = subjectsHTML;
        
        // Add event listeners to detail buttons
        this.setupSubjectEventListeners();
    }
    
    getSubjectHTML(subject) {
        const icon = this.getSubjectIcon(subject.category);
        
        return `
            <div class="subject-card" data-id="${subject.id}">
                <div class="subject-header">
                    <span class="subject-code">${subject.code}</span>
                    <div class="subject-icon">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                </div>
                
                <h3 class="subject-title">${subject.name}</h3>
                
                <div class="subject-meta">
                    <div class="meta-item">
                        <span class="material-symbols-outlined">school</span>
                        <span>${subject.faculty}</span>
                    </div>
                    <div class="meta-item">
                        <span class="material-symbols-outlined">grade</span>
                        <span>${subject.credits} Tín chỉ</span>
                    </div>
                </div>
                
                <p class="subject-description">${subject.description}</p>
                
                <div class="subject-footer">
                    <button class="detail-btn" data-id="${subject.id}">
                        Xem chi tiết
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    getSubjectIcon(category) {
        const icons = {
            'architecture': 'architecture',
            'construction': 'engineering',
            'design': 'brush',
            'history': 'history_edu',
            'theory': 'menu_book',
            'project': 'home_work',
            'urban': 'location_city',
            'interior': 'foundation'
        };
        return icons[category] || 'school';
    }
    
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <span class="material-symbols-outlined">search_off</span>
                </div>
                <h3 class="empty-title">Không tìm thấy môn học</h3>
                <p class="empty-description">
                    Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                </p>
                <button id="reset-filters-btn" class="detail-btn">
                    <span class="material-symbols-outlined">refresh</span>
                    Đặt lại bộ lọc
                </button>
            </div>
        `;
    }
    
    setupSubjectEventListeners() {
        // Detail buttons
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const subjectId = e.currentTarget.dataset.id;
                this.showSubjectDetails(subjectId);
            });
        });
        
        // Subject card click
        document.querySelectorAll('.subject-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const subjectId = card.dataset.id;
                    this.showSubjectDetails(subjectId);
                }
            });
        });
        
        // Reset filters button (empty state)
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.handleResetFilters();
            });
        }
    }
    
    async showSubjectDetails(subjectId) {
        try {
            const subject = this.subjects.find(s => s.id === subjectId);
            if (!subject) return;
            
            this.selectedSubject = subject;
            await this.loadSubjectDetails(subjectId);
            
            this.subjectDetailModal.show();
        } catch (error) {
            console.error('Error loading subject details:', error);
            this.showError('Không thể tải thông tin chi tiết');
        }
    }
    
    async loadSubjectDetails(subjectId) {
        try {
            const details = await this.courseService.getSubjectDetails(subjectId);
            this.renderSubjectDetails(details);
        } catch (error) {
            console.error('Error loading subject details:', error);
            // Use basic data if API fails
            this.renderSubjectDetails(this.selectedSubject);
        }
    }
    
    renderSubjectDetails(details) {
        const subject = details || this.selectedSubject;
        
        // Basic info
        document.getElementById('modal-subject-name').textContent = subject.name;
        document.getElementById('modal-subject-code').textContent = subject.code;
        document.getElementById('modal-subject-faculty').textContent = subject.faculty;
        document.getElementById('modal-subject-credits').textContent = `${subject.credits} Tín chỉ`;
        document.getElementById('modal-subject-description').textContent = subject.description;
        
        // Type badge
        const typeElement = document.getElementById('modal-subject-type');
        if (typeElement) {
            typeElement.textContent = subject.type || 'Bắt buộc';
        }
        
        // Additional details
        if (details) {
            document.getElementById('modal-subject-department').textContent = 
                details.department || 'Chưa xác định';
            document.getElementById('modal-subject-semester').textContent = 
                details.semester || 'HK1, HK2';
            document.getElementById('modal-subject-duration').textContent = 
                details.duration || '45 tiết';
            document.getElementById('modal-prerequisites').textContent = 
                details.prerequisites?.join(', ') || 'Không có';
            document.getElementById('modal-corequisites').textContent = 
                details.corequisites?.join(', ') || 'Không có';
            document.getElementById('modal-assessment').textContent = 
                details.assessment || 'Bài tập (30%), Thi cuối kỳ (70%)';
            
            // Objectives
            const objectivesList = document.getElementById('modal-subject-objectives');
            if (objectivesList) {
                const objectives = details.objectives || [
                    'Hiểu các nguyên lý cơ bản của môn học',
                    'Áp dụng kiến thức vào thực tế',
                    'Phát triển kỹ năng phân tích và thiết kế'
                ];
                objectivesList.innerHTML = objectives.map(obj => 
                    `<li>${obj}</li>`
                ).join('');
            }
            
            // References
            const referencesElement = document.getElementById('modal-references');
            if (referencesElement) {
                const references = details.references || [
                    'Giáo trình chính',
                    'Tài liệu tham khảo bổ sung',
                    'Tiêu chuẩn xây dựng'
                ];
                referencesElement.innerHTML = references.map(ref => 
                    `<div>• ${ref}</div>`
                ).join('');
            }
            
            // Instructor info
            const instructorElement = document.getElementById('modal-instructor-info');
            if (instructorElement) {
                const instructor = details.instructor || {
                    name: 'TS. Nguyễn Văn A',
                    title: 'Giảng viên chính',
                    avatar: ''
                };
                
                instructorElement.innerHTML = `
                    <div class="instructor-avatar" 
                         style="background-image: url('${instructor.avatar || ''}')"></div>
                    <div class="instructor-details">
                        <p class="instructor-name">${instructor.name}</p>
                        <p class="instructor-title">${instructor.title}</p>
                    </div>
                `;
            }
        }
    }
    
    setupPagination() {
        this.updatePagination();
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.totalSubjects / this.pageSize);
        const controls = document.getElementById('pagination-controls');
        
        if (!controls || totalPages <= 1) {
            controls.style.display = 'none';
            return;
        }
        
        let paginationHTML = `
            <button class="pagination-btn prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                <span class="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div class="pagination-numbers">
        `;
        
        // Always show first page
        paginationHTML += `
            <button class="page-number ${this.currentPage === 1 ? 'active' : ''}" data-page="1">
                1
            </button>
        `;
        
        // Calculate range of pages to show
        let startPage = Math.max(2, this.currentPage - 1);
        let endPage = Math.min(totalPages - 1, this.currentPage + 1);
        
        // Add ellipsis if needed
        if (startPage > 2) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
        
        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-number ${this.currentPage === i ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // Add ellipsis if needed
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
        
        // Always show last page if not already shown
        if (totalPages > 1 && endPage < totalPages) {
            paginationHTML += `
                <button class="page-number ${this.currentPage === totalPages ? 'active' : ''}" data-page="${totalPages}">
                    ${totalPages}
                </button>
            `;
        }
        
        paginationHTML += `
            </div>
            
            <button class="pagination-btn next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <span class="material-symbols-outlined">chevron_right</span>
            </button>
        `;
        
        controls.innerHTML = paginationHTML;
        
        // Add event listeners
        this.setupPaginationEventListeners();
    }
    
    setupPaginationEventListeners() {
        // Previous button
        const prevBtn = document.querySelector('.pagination-btn.prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadSubjects();
                }
            });
        }
        
        // Next button
        const nextBtn = document.querySelector('.pagination-btn.next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.totalSubjects / this.pageSize);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadSubjects();
                }
            });
        }
        
        // Page numbers
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadSubjects();
                }
            });
        });
    }
    
    updatePaginationInfo() {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, this.totalSubjects);
        
        const infoElement = document.getElementById('pagination-info');
        if (infoElement) {
            infoElement.textContent = `HIỂN THỊ ${start}-${end} TRÊN TỔNG SỐ ${this.totalSubjects} MÔN HỌC CHUYÊN NGÀNH`;
        }
    }
    
    updateStats() {
        // These could be loaded from API
        const stats = {
            totalSubjects: this.totalSubjects,
            totalFaculties: 4,
            totalCredits: 186,
            updatedThisYear: 24
        };
        
        document.getElementById('total-subjects').textContent = stats.totalSubjects;
        document.getElementById('total-faculties').textContent = stats.totalFaculties;
        document.getElementById('total-credits').textContent = stats.totalCredits;
        document.getElementById('updated-this-year').textContent = stats.updatedThisYear;
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('subject-search-input');
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 500);
        });
        
        // Search action button
        const searchActionBtn = document.getElementById('search-action-btn');
        if (searchActionBtn) {
            searchActionBtn.addEventListener('click', () => {
                this.handleSearch(searchInput.value);
            });
        }
        
        // Filter buttons
        document.getElementById('filter-faculty-btn')?.addEventListener('click', () => {
            this.handleFacultyFilter();
        });
        
        document.getElementById('filter-credits-btn')?.addEventListener('click', () => {
            this.handleCreditsFilter();
        });
        
        document.getElementById('advanced-filter-btn')?.addEventListener('click', () => {
            this.showFilterModal();
        });
        
        // Download buttons
        document.getElementById('download-pdf-btn')?.addEventListener('click', () => {
            this.handleDownloadPDF();
        });
        
        document.getElementById('download-excel-btn')?.addEventListener('click', () => {
            this.handleDownloadExcel();
        });
        
        // Modal buttons
        document.getElementById('modal-view-syllabus-btn')?.addEventListener('click', () => {
            this.viewSyllabus();
        });
        
        document.getElementById('modal-view-classes-btn')?.addEventListener('click', () => {
            this.viewClasses();
        });
    }
    
    initModals() {
        // Subject detail modal
        this.subjectDetailModal = new Modal('subject-detail-modal', {
            onClose: () => {
                this.selectedSubject = null;
            }
        });
        
        // Filter modal
        this.filterModal = new Modal('filter-modal', {
            onClose: () => this.resetFilterForm()
        });
        
        // Setup modal events
        this.setupModalEvents();
    }
    
    setupModalEvents() {
        // Apply filter button
        document.getElementById('apply-filter-btn')?.addEventListener('click', () => {
            this.handleApplyFilter();
        });
        
        // Reset filter button
        document.getElementById('reset-filter-btn')?.addEventListener('click', () => {
            this.handleResetFilter();
        });
    }
    
    handleSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length > 2 || trimmedQuery === '') {
            this.filterOptions.search = trimmedQuery || undefined;
            this.resetAndReloadSubjects();
        }
    }
    
    handleFacultyFilter() {
        // Implementation for faculty filter dropdown
        this.showInfo('Tính năng lọc theo khoa sẽ được cập nhật sau');
    }
    
    handleCreditsFilter() {
        // Implementation for credits filter dropdown
        this.showInfo('Tính năng lọc theo tín chỉ sẽ được cập nhật sau');
    }
    
    showFilterModal() {
        // Pre-fill form with current filters
        const form = document.getElementById('filter-form');
        
        if (this.filterOptions.faculty) {
            form.querySelector('#filter-faculty').value = this.filterOptions.faculty;
        }
        
        if (this.filterOptions.credits) {
            form.querySelector('#filter-credits').value = this.filterOptions.credits;
        }
        
        if (this.filterOptions.type) {
            form.querySelector('#filter-type').value = this.filterOptions.type;
        }
        
        if (this.filterOptions.semester) {
            form.querySelector('#filter-semester').value = this.filterOptions.semester;
        }
        
        if (this.filterOptions.year) {
            form.querySelector('#filter-year').value = this.filterOptions.year;
        }
        
        if (this.filterOptions.level) {
            form.querySelector('#filter-level').value = this.filterOptions.level;
        }
        
        this.filterModal.show();
    }
    
    handleApplyFilter() {
        const form = document.getElementById('filter-form');
        const formData = new FormData(form);
        
        this.filterOptions = {
            faculty: formData.get('filter-faculty') || undefined,
            credits: formData.get('filter-credits') || undefined,
            type: formData.get('filter-type') || undefined,
            semester: formData.get('filter-semester') || undefined,
            year: formData.get('filter-year') || undefined,
            level: formData.get('filter-level') || undefined
        };
        
        this.filterModal.hide();
        this.resetAndReloadSubjects();
    }
    
    handleResetFilter() {
        const form = document.getElementById('filter-form');
        form.reset();
    }
    
    handleResetFilters() {
        this.filterOptions = {};
        this.currentPage = 1;
        this.loadSubjects();
    }
    
    async handleDownloadPDF() {
        try {
            this.showLoading('Đang chuẩn bị file PDF...');
            // Simulate download
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.showSuccess('Đã bắt đầu tải xuống file PDF');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            this.showError('Không thể tải xuống file PDF');
        }
    }
    
    async handleDownloadExcel() {
        try {
            this.showLoading('Đang chuẩn bị file Excel...');
            // Simulate download
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.showSuccess('Đã bắt đầu tải xuống file Excel');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            this.showError('Không thể tải xuống file Excel');
        }
    }
    
    viewSyllabus() {
        if (!this.selectedSubject) return;
        
        this.showInfo(`Đang mở đề cương môn học ${this.selectedSubject.code}`);
        // Navigate to syllabus page or open PDF
        // window.open(`/syllabus/${this.selectedSubject.id}.pdf`, '_blank');
    }
    
    viewClasses() {
        if (!this.selectedSubject) return;
        
        this.showInfo(`Đang tìm lớp học cho môn ${this.selectedSubject.code}`);
        // Navigate to classes page
        // window.location.href = `/pages/academic/course-classes.html?subject=${this.selectedSubject.id}`;
    }
    
    resetAndReloadSubjects() {
        this.currentPage = 1;
        this.loadSubjects();
    }
    
    resetFilterForm() {
        const form = document.getElementById('filter-form');
        form.reset();
    }
    
    showLoading(message = 'Đang tải danh mục môn học...') {
        const container = document.getElementById('subjects-grid');
        container.innerHTML = `
            <div class="loading-indicator">
                <span class="material-symbols-outlined animate-spin">refresh</span>
                <p>${message}</p>
            </div>
        `;
    }
    
    hideLoading() {
        // Loading indicator is replaced by content
    }
    
    showSuccess(message) {
        Notification.show(message, 'success');
    }
    
    showError(message) {
        Notification.show(message, 'error');
    }
    
    showInfo(message) {
        Notification.show(message, 'info');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Subjects();
});