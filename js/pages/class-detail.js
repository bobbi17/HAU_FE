import { API_ENDPOINTS } from '../config/api-config.js';
import { ACADEMIC_CONSTANTS } from '../config/constants.js';
import { isAuthenticated, getCurrentUser, isInstructor, isStudent } from '../utils/auth.js';
import { formatDate, formatRelativeTime, formatFileSize } from '../utils/date-format.js';
import { handleFileUpload, validateFileType } from '../utils/file-upload.js';
import CourseService from '../services/course-service.js';
import Modal from '../components/modal.js';
import Notification from '../components/notification.js';

class ClassDetail {
    constructor() {
        this.courseService = new CourseService();
        this.currentUser = getCurrentUser();
        this.classId = this.getClassId();
        this.activeTab = 'documents';
        this.uploadedFiles = [];
        
        this.init();
    }
    
    init() {
        this.loadClassData();
        this.loadClassContent();
        this.setupEventListeners();
        this.initModals();
        this.setupTabs();
        this.checkUserRole();
    }
    
    getClassId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || 'KTS2024';
    }
    
    async loadClassData() {
        try {
            const classData = await this.courseService.getClassById(this.classId);
            this.renderClassHeader(classData);
            this.renderBreadcrumbs(classData);
            this.updatePageTitle(classData);
        } catch (error) {
            console.error('Error loading class data:', error);
            this.showError('Không thể tải thông tin lớp học');
        }
    }
    
    async loadClassContent() {
        try {
            // Load content based on active tab
            switch (this.activeTab) {
                case 'documents':
                    await this.loadDocuments();
                    break;
                case 'announcements':
                    await this.loadAnnouncements();
                    break;
                case 'students':
                    await this.loadStudents();
                    break;
                case 'discussions':
                    await this.loadDiscussions();
                    break;
                case 'grades':
                    await this.loadGrades();
                    break;
            }
            
            // Load sidebar widgets
            await this.loadDeadlines();
            await this.loadClassNotes();
            await this.loadClassStats();
        } catch (error) {
            console.error('Error loading class content:', error);
            this.showError('Không thể tải nội dung lớp học');
        }
    }
    
    renderClassHeader(classData) {
        document.getElementById('class-name').textContent = classData.name;
        document.getElementById('instructor-name').textContent = classData.instructor;
        document.getElementById('class-schedule').textContent = classData.schedule;
        document.getElementById('class-room').textContent = classData.room;
        document.getElementById('class-semester').textContent = classData.semester;
        
        // Update modal info
        document.getElementById('modal-class-name').textContent = classData.name;
        document.getElementById('info-class-code').textContent = classData.code;
        document.getElementById('info-subject').textContent = classData.subject;
        document.getElementById('info-credits').textContent = classData.credits;
        document.getElementById('info-duration').textContent = classData.duration;
        document.getElementById('info-instructor').textContent = classData.instructor;
        document.getElementById('info-instructor-email').textContent = classData.instructorEmail;
        document.getElementById('info-room').textContent = classData.room;
        document.getElementById('info-schedule').textContent = classData.schedule;
        document.getElementById('info-description').textContent = classData.description;
        
        // Render objectives
        const objectivesList = document.getElementById('info-objectives');
        objectivesList.innerHTML = classData.objectives?.map(obj => 
            `<li>${obj}</li>`
        ).join('') || '';
    }
    
    renderBreadcrumbs(classData) {
        const breadcrumbNav = document.querySelector('.breadcrumb-nav');
        breadcrumbNav.innerHTML = `
            <a href="/">Trang chủ</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <a href="/pages/academic/course-classes.html">Lớp học của tôi</a>
            <span class="material-symbols-outlined">chevron_right</span>
            <span class="current">${classData.name}</span>
        `;
    }
    
    updatePageTitle(classData) {
        document.title = `${classData.name} | HauHub`;
    }
    
    setupTabs() {
        const tabs = [
            { id: 'documents', label: 'Tài liệu học tập', icon: 'folder', badge: null },
            { id: 'announcements', label: 'Thông báo lớp', icon: 'notifications', badge: 3 },
            { id: 'students', label: 'Danh sách SV', icon: 'group', badge: null },
            { id: 'discussions', label: 'Thảo luận nhóm', icon: 'forum', badge: 12 },
            { id: 'grades', label: 'Điểm số', icon: 'grade', badge: null }
        ];
        
        const tabsNav = document.getElementById('tabs-nav');
        tabsNav.innerHTML = `
            <ul class="tabs-list">
                ${tabs.map(tab => `
                    <li class="tab-item">
                        <a href="#" class="tab-link ${tab.id === this.activeTab ? 'active' : ''}" 
                           data-tab="${tab.id}">
                            <span class="material-symbols-outlined">${tab.icon}</span>
                            <span>${tab.label}</span>
                            ${tab.badge ? `<span class="tab-badge">${tab.badge}</span>` : ''}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
        
        // Add tab click event
        tabsNav.addEventListener('click', (e) => {
            const tabLink = e.target.closest('.tab-link');
            if (tabLink) {
                e.preventDefault();
                this.switchTab(tabLink.dataset.tab);
            }
        });
    }
    
    switchTab(tabId) {
        // Update active tab UI
        document.querySelectorAll('.tab-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected tab content
        document.getElementById(`tab-${tabId}`).classList.add('active');
        
        // Update active tab and load content
        this.activeTab = tabId;
        this.loadClassContent();
    }
    
    async loadDocuments() {
        try {
            const documents = await this.courseService.getClassDocuments(this.classId);
            this.renderDocuments(documents);
        } catch (error) {
            console.error('Error loading documents:', error);
            this.showDocumentsError();
        }
    }
    
    renderDocuments(documents) {
        const container = document.getElementById('documents-list');
        
        if (!documents || documents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <span class="material-symbols-outlined">folder_off</span>
                    </div>
                    <h4>Chưa có tài liệu nào</h4>
                    <p>Giảng viên sẽ tải lên tài liệu học tập sớm nhất</p>
                </div>
            `;
            return;
        }
        
        const documentsHTML = documents.map(doc => {
            const iconType = this.getDocumentIconType(doc.type);
            const fileSize = doc.size ? formatFileSize(doc.size) : '';
            const updatedTime = doc.updatedAt ? formatRelativeTime(doc.updatedAt) : '';
            
            return `
                <div class="document-item" data-id="${doc.id}" data-type="${doc.type}">
                    <div class="document-icon ${iconType}">
                        <span class="material-symbols-outlined">${this.getDocumentIcon(doc.type)}</span>
                    </div>
                    <div class="document-info">
                        <p class="document-name">${doc.name}</p>
                        <p class="document-meta">
                            ${fileSize ? fileSize + ' • ' : ''}
                            ${doc.fileCount ? doc.fileCount + ' tệp • ' : ''}
                            ${updatedTime}
                        </p>
                    </div>
                    <span class="document-action material-symbols-outlined">
                        ${doc.type === 'folder' ? 'chevron_right' : 'download'}
                    </span>
                </div>
            `;
        }).join('');
        
        container.innerHTML = documentsHTML;
        
        // Add document click events
        container.querySelectorAll('.document-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const docId = item.dataset.id;
                const docType = item.dataset.type;
                this.handleDocumentClick(docId, docType);
            });
        });
    }
    
    getDocumentIconType(type) {
        const iconTypes = {
            'folder': 'folder',
            'pdf': 'pdf',
            'image': 'image',
            'dwg': 'dwg',
            'doc': 'word',
            'xls': 'word',
            'ppt': 'word'
        };
        return iconTypes[type] || 'folder';
    }
    
    getDocumentIcon(type) {
        const icons = {
            'folder': 'folder',
            'pdf': 'picture_as_pdf',
            'image': 'image',
            'dwg': 'draw',
            'doc': 'description',
            'xls': 'table_chart',
            'ppt': 'slideshow'
        };
        return icons[type] || 'folder';
    }
    
    async loadAnnouncements() {
        // Implementation for announcements
    }
    
    async loadStudents() {
        // Implementation for students list
    }
    
    async loadDiscussions() {
        // Implementation for discussions
    }
    
    async loadGrades() {
        // Implementation for grades
    }
    
    async loadDeadlines() {
        try {
            const deadlines = await this.courseService.getClassDeadlines(this.classId);
            this.renderDeadlines(deadlines);
        } catch (error) {
            console.error('Error loading deadlines:', error);
        }
    }
    
    renderDeadlines(deadlines) {
        const container = document.getElementById('deadlines-list');
        
        if (!deadlines || deadlines.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <p>Không có hạn nộp nào sắp tới</p>
                </div>
            `;
            return;
        }
        
        const deadlinesHTML = deadlines.map(deadline => {
            const progressPercentage = deadline.progress || 0;
            const daysLeft = deadline.daysLeft || 0;
            
            return `
                <div class="deadline-item">
                    <div class="deadline-date">
                        <span class="deadline-month">${deadline.month}</span>
                        <span class="deadline-day">${deadline.day}</span>
                    </div>
                    <div class="deadline-content">
                        <p class="deadline-title">${deadline.title}</p>
                        <p class="deadline-time">Còn lại ${daysLeft} ngày</p>
                        <div class="deadline-progress">
                            <div class="deadline-progress-bar" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = deadlinesHTML;
    }
    
    async loadClassNotes() {
        try {
            const notes = await this.courseService.getClassNotes(this.classId);
            this.renderClassNotes(notes);
        } catch (error) {
            console.error('Error loading class notes:', error);
        }
    }
    
    renderClassNotes(notes) {
        const container = document.getElementById('class-notes');
        container.innerHTML = notes || `
            <p class="no-notes">Chưa có lưu ý nào từ giảng viên</p>
        `;
    }
    
    async loadClassStats() {
        try {
            const stats = await this.courseService.getClassStats(this.classId);
            this.renderClassStats(stats);
        } catch (error) {
            console.error('Error loading class stats:', error);
        }
    }
    
    renderClassStats(stats) {
        const container = document.getElementById('class-stats');
        
        const defaultStats = {
            totalStudents: stats?.totalStudents || 35,
            assignments: stats?.assignments || 8,
            avgGrade: stats?.avgGrade || 8.5,
            attendance: stats?.attendance || 92
        };
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${defaultStats.totalStudents}</span>
                <span class="stat-label">Sinh viên</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${defaultStats.assignments}</span>
                <span class="stat-label">Bài tập</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${defaultStats.avgGrade}</span>
                <span class="stat-label">Điểm TB</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${defaultStats.attendance}%</span>
                <span class="stat-label">Tham gia</span>
            </div>
        `;
    }
    
    checkUserRole() {
        // Show upload area for instructors
        if (isInstructor()) {
            document.getElementById('upload-area').style.display = 'block';
            this.setupFileUpload();
        }
        
        // Hide submit button if not student
        if (!isStudent()) {
            document.getElementById('submit-assignment-btn').style.display = 'none';
        }
    }
    
    setupFileUpload() {
        const uploadArea = document.getElementById('upload-area');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--class-primary)';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            const files = e.dataTransfer.files;
            this.handleFilesUpload(files);
        });
    }
    
    setupEventListeners() {
        // Class info button
        document.getElementById('class-info-btn').addEventListener('click', () => {
            this.showClassInfoModal();
        });
        
        // Download all button
        document.getElementById('download-all-btn').addEventListener('click', () => {
            this.handleDownloadAll();
        });
        
        // Submit assignment button
        document.getElementById('submit-assignment-btn').addEventListener('click', () => {
            if (!isAuthenticated()) {
                this.showAuthRequired();
                return;
            }
            this.showUploadAssignmentModal();
        });
        
        // Contact instructor button
        document.getElementById('contact-instructor-btn').addEventListener('click', () => {
            if (!isAuthenticated()) {
                this.showAuthRequired();
                return;
            }
            this.showContactInstructorModal();
        });
        
        // View syllabus button
        document.getElementById('view-syllabus-btn').addEventListener('click', () => {
            this.viewSyllabus();
        });
    }
    
    initModals() {
        // Class info modal
        this.classInfoModal = new Modal('class-info-modal', {
            onClose: () => {}
        });
        
        // Upload assignment modal
        this.uploadAssignmentModal = new Modal('upload-assignment-modal', {
            onClose: () => this.resetUploadForm()
        });
        
        // Contact instructor modal
        this.contactInstructorModal = new Modal('contact-instructor-modal', {
            onClose: () => this.resetContactForm()
        });
        
        // Setup forms
        this.setupUploadForm();
        this.setupContactForm();
    }
    
    setupUploadForm() {
        const form = document.getElementById('upload-assignment-form');
        const fileInput = document.getElementById('assignment-files');
        const fileList = document.getElementById('file-list');
        
        fileInput.addEventListener('change', (e) => {
            this.handleFilesInput(e.target.files, fileList);
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAssignmentSubmit(form);
        });
    }
    
    setupContactForm() {
        const form = document.getElementById('contact-instructor-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleContactSubmit(form);
        });
    }
    
    async handleFilesUpload(files) {
        if (!files.length) return;
        
        try {
            const uploadPromises = Array.from(files).map(file => 
                this.courseService.uploadClassDocument(this.classId, file)
            );
            
            await Promise.all(uploadPromises);
            this.showSuccess('Tải lên tài liệu thành công!');
            this.loadDocuments();
        } catch (error) {
            console.error('Error uploading files:', error);
            this.showError('Không thể tải lên tệp');
        }
    }
    
    handleFilesInput(files, fileListContainer) {
        this.uploadedFiles = Array.from(files);
        
        fileListContainer.innerHTML = this.uploadedFiles.map((file, index) => `
            <div class="file-item">
                <div class="file-info">
                    <span class="material-symbols-outlined">${this.getFileIcon(file.type)}</span>
                    <div>
                        <p class="file-name">${file.name}</p>
                        <p class="file-size">${formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button type="button" class="file-remove" data-index="${index}">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        `).join('');
        
        // Add remove button events
        fileListContainer.querySelectorAll('.file-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.removeFile(index);
            });
        });
    }
    
    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return 'picture_as_pdf';
        if (fileType.includes('image')) return 'image';
        if (fileType.includes('word') || fileType.includes('document')) return 'description';
        if (fileType.includes('dwg') || fileType.includes('cad')) return 'draw';
        return 'insert_drive_file';
    }
    
    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.handleFilesInput(this.uploadedFiles, document.getElementById('file-list'));
    }
    
    async handleAssignmentSubmit(form) {
        if (this.uploadedFiles.length === 0) {
            this.showError('Vui lòng chọn ít nhất một tệp để nộp');
            return;
        }
        
        const formData = new FormData(form);
        
        // Add files to form data
        this.uploadedFiles.forEach(file => {
            formData.append('files', file);
        });
        
        try {
            await this.courseService.submitAssignment(this.classId, formData);
            this.uploadAssignmentModal.hide();
            this.resetUploadForm();
            this.showSuccess('Nộp bài thành công!');
        } catch (error) {
            console.error('Error submitting assignment:', error);
            this.showError('Không thể nộp bài. Vui lòng thử lại.');
        }
    }
    
    async handleContactSubmit(form) {
        const formData = new FormData(form);
        
        try {
            await this.courseService.contactInstructor(this.classId, formData);
            this.contactInstructorModal.hide();
            this.resetContactForm();
            this.showSuccess('Đã gửi tin nhắn đến giảng viên!');
        } catch (error) {
            console.error('Error contacting instructor:', error);
            this.showError('Không thể gửi tin nhắn. Vui lòng thử lại.');
        }
    }
    
    handleDocumentClick(docId, docType) {
        if (docType === 'folder') {
            // Navigate to folder
            this.navigateToFolder(docId);
        } else {
            // Download file
            this.downloadDocument(docId);
        }
    }
    
    async downloadDocument(docId) {
        try {
            await this.courseService.downloadDocument(docId);
            this.showSuccess('Đang tải xuống tài liệu...');
        } catch (error) {
            console.error('Error downloading document:', error);
            this.showError('Không thể tải xuống tài liệu');
        }
    }
    
    async handleDownloadAll() {
        try {
            await this.courseService.downloadAllDocuments(this.classId);
            this.showSuccess('Đang tải xuống tất cả tài liệu...');
        } catch (error) {
            console.error('Error downloading all documents:', error);
            this.showError('Không thể tải xuống tài liệu');
        }
    }
    
    showClassInfoModal() {
        this.classInfoModal.show();
    }
    
    showUploadAssignmentModal() {
        this.uploadAssignmentModal.show();
    }
    
    showContactInstructorModal() {
        this.contactInstructorModal.show();
    }
    
    viewSyllabus() {
        // Navigate to syllabus page
        window.open(`/documents/syllabus/${this.classId}.pdf`, '_blank');
    }
    
    resetUploadForm() {
        document.getElementById('upload-assignment-form').reset();
        document.getElementById('file-list').innerHTML = '';
        this.uploadedFiles = [];
    }
    
    resetContactForm() {
        document.getElementById('contact-instructor-form').reset();
    }
    
    navigateToFolder(folderId) {
        window.location.href = `/pages/academic/class-folder.html?class=${this.classId}&folder=${folderId}`;
    }
    
    showDocumentsError() {
        const container = document.getElementById('documents-list');
        container.innerHTML = `
            <div class="error-state">
                <span class="material-symbols-outlined">error</span>
                <h4>Không thể tải tài liệu</h4>
                <p>Vui lòng thử lại sau</p>
                <button id="retry-documents" class="btn-primary">Thử lại</button>
            </div>
        `;
        
        document.getElementById('retry-documents').addEventListener('click', () => {
            this.loadDocuments();
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ClassDetail();
});