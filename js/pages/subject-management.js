import { 
    getAllSubjects, 
    getSubjectById, 
    createSubject, 
    updateSubject,
    deleteSubject,
    getSubjectsByDepartment,
    exportSubjectsToExcel 
} from '../services/admin-service.js';
import { showModal, closeModal } from '../components/modal.js';
import { showNotification } from '../components/notification.js';

class SubjectManagement {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.filterDepartment = 'all';
        this.filterStatus = 'all';
        this.searchTerm = '';
        this.subjects = [];
        this.selectedSubjectId = null;
        
        this.init();
    }

    async init() {
        await this.loadSubjects();
        this.setupEventListeners();
    }

    async loadSubjects() {
        try {
            const response = await getAllSubjects();
            this.subjects = response.data;
            this.renderSubjects();
            this.updatePagination();
        } catch (error) {
            showNotification('Không thể tải danh sách môn học', 'error');
            console.error('Error loading subjects:', error);
        }
    }

    getFilteredSubjects() {
        return this.subjects.filter(subject => {
            // Apply department filter
            const matchesDepartment = this.filterDepartment === 'all' || 
                                     subject.department === this.filterDepartment;
            
            // Apply status filter
            const matchesStatus = this.filterStatus === 'all' || 
                                 subject.status === this.filterStatus;
            
            // Apply search filter
            const matchesSearch = this.searchTerm === '' ||
                                 subject.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 subject.nameVi.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 subject.nameEn.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            return matchesDepartment && matchesStatus && matchesSearch;
        });
    }

    getPaginatedSubjects() {
        const filteredSubjects = this.getFilteredSubjects();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return filteredSubjects.slice(startIndex, endIndex);
    }

    renderSubjects() {
        const tbody = document.getElementById('subjects-table-body');
        const subjects = this.getPaginatedSubjects();
        
        if (subjects.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8">
                        <div class="empty-state">
                            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                            <p class="text-slate-500">Không tìm thấy môn học nào</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = subjects.map(subject => this.createSubjectRow(subject)).join('');
        this.attachRowEventListeners();
    }

    createSubjectRow(subject) {
        const statusClass = this.getStatusClass(subject.status);
        const statusText = this.getStatusText(subject.status);
        
        return `
            <tr class="subject-item" data-subject-id="${subject.id}">
                <td>
                    <span class="subject-code">${subject.code}</span>
                </td>
                <td>
                    <div class="subject-info">
                        <div class="subject-name">${subject.nameVi}</div>
                        <div class="subject-category">${subject.category}</div>
                    </div>
                </td>
                <td>
                    <span class="department-name">${this.getDepartmentName(subject.department)}</span>
                </td>
                <td class="text-center">
                    <span class="credit-count">${subject.credits}</span>
                </td>
                <td class="text-center">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" data-subject-id="${subject.id}">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="action-btn edit" data-subject-id="${subject.id}">
                            <span class="material-symbols-outlined">edit_square</span>
                        </button>
                        <button class="action-btn delete" data-subject-id="${subject.id}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getDepartmentName(departmentCode) {
        const departments = {
            'it': 'Công nghệ thông tin',
            'architecture': 'Kiến trúc',
            'electronics': 'Điện tử viễn thông',
            'basic': 'Cơ bản',
            'construction': 'Xây dựng',
            'business': 'Quản trị Kinh doanh'
        };
        return departments[departmentCode] || departmentCode;
    }

    getStatusClass(status) {
        const statusClasses = {
            'active': 'active',
            'inactive': 'inactive',
            'pending': 'pending'
        };
        return statusClasses[status] || 'inactive';
    }

    getStatusText(status) {
        const statusTexts = {
            'active': 'Đang mở',
            'inactive': 'Đã đóng',
            'pending': 'Chờ duyệt'
        };
        return statusTexts[status] || 'Đã đóng';
    }

    updatePagination() {
        const totalSubjects = this.getFilteredSubjects().length;
        const totalPages = Math.ceil(totalSubjects / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.itemsPerPage - 1, totalSubjects);

        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.innerHTML = `
                Hiển thị <span class="highlight">${startIndex}-${endIndex}</span> trên <span class="highlight">${totalSubjects}</span> môn học
            `;
        }

        // Update pagination buttons
        const prevBtn = document.querySelector('.pagination-btn.prev');
        const nextBtn = document.querySelector('.pagination-btn.next');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }

    async handleAddSubject() {
        document.getElementById('modal-title').textContent = 'Thêm Mới Môn Học';
        document.getElementById('subject-form').reset();
        this.selectedSubjectId = null;
        showModal('subject-modal');
    }

    async handleEditSubject(subjectId) {
        try {
            const subject = await getSubjectById(subjectId);
            this.selectedSubjectId = subjectId;
            this.populateSubjectForm(subject);
            document.getElementById('modal-title').textContent = 'Chỉnh sửa Môn Học';
            showModal('subject-modal');
        } catch (error) {
            showNotification('Không thể tải thông tin môn học', 'error');
        }
    }

    populateSubjectForm(subject) {
        document.getElementById('subject-code').value = subject.code;
        document.getElementById('credit-hours').value = subject.credits;
        document.getElementById('subject-name-vi').value = subject.nameVi;
        document.getElementById('subject-name-en').value = subject.nameEn;
        document.getElementById('department').value = subject.department;
        document.getElementById('category').value = subject.category;
        document.getElementById('description').value = subject.description;
        document.getElementById('semester').value = subject.semester;
        document.getElementById('status').value = subject.status;
        document.getElementById('prerequisites').value = subject.prerequisites?.join(', ') || '';
    }

    async handleSubmitSubjectForm(event) {
        event.preventDefault();
        
        const formData = {
            code: document.getElementById('subject-code').value,
            credits: parseInt(document.getElementById('credit-hours').value),
            nameVi: document.getElementById('subject-name-vi').value,
            nameEn: document.getElementById('subject-name-en').value,
            department: document.getElementById('department').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            semester: parseInt(document.getElementById('semester').value),
            status: document.getElementById('status').value,
            prerequisites: document.getElementById('prerequisites').value
                .split(',')
                .map(code => code.trim())
                .filter(code => code !== '')
        };

        try {
            if (this.selectedSubjectId) {
                // Update existing subject
                await updateSubject(this.selectedSubjectId, formData);
                showNotification('Cập nhật môn học thành công', 'success');
            } else {
                // Create new subject
                await createSubject(formData);
                showNotification('Thêm môn học mới thành công', 'success');
            }
            
            closeModal('subject-modal');
            await this.loadSubjects();
        } catch (error) {
            showNotification('Không thể lưu thông tin môn học', 'error');
        }
    }

    async handleViewSubject(subjectId) {
        try {
            const subject = await getSubjectById(subjectId);
            this.showSubjectDetailModal(subject);
        } catch (error) {
            showNotification('Không thể tải thông tin môn học', 'error');
        }
    }

    showSubjectDetailModal(subject) {
        const modalContent = `
            <div class="subject-detail-view">
                <div class="subject-detail-header">
                    <div class="subject-header-info">
                        <div class="subject-title">
                            <h4>${subject.nameVi}</h4>
                            <span class="subject-code">${subject.code}</span>
                        </div>
                        <span class="status-badge ${this.getStatusClass(subject.status)}">
                            ${this.getStatusText(subject.status)}
                        </span>
                    </div>
                    <p class="subject-english-name">${subject.nameEn}</p>
                </div>
                
                <div class="subject-detail-grid">
                    <div class="detail-section">
                        <h5>Thông tin chung</h5>
                        <div class="detail-item">
                            <span class="detail-label">Khoa quản lý</span>
                            <span class="detail-value">${this.getDepartmentName(subject.department)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phân loại</span>
                            <span class="detail-value">${subject.category}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Số tín chỉ</span>
                            <span class="detail-value">${subject.credits}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Học kỳ</span>
                            <span class="detail-value">Học kỳ ${subject.semester}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Môn học tiên quyết</h5>
                        ${subject.prerequisites && subject.prerequisites.length > 0 ? `
                        <div class="prerequisites-list">
                            ${subject.prerequisites.map(code => `
                                <span class="prerequisite-badge">${code}</span>
                            `).join('')}
                        </div>
                        ` : `
                        <p class="detail-empty">Không có môn học tiên quyết</p>
                        `}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h5>Mô tả môn học</h5>
                    <div class="description-content">${subject.description}</div>
                </div>
                
                <div class="subject-metadata">
                    <div class="metadata-item">
                        <span class="metadata-label">Ngày tạo</span>
                        <span class="metadata-value">${this.formatDate(subject.createdAt)}</span>
                    </div>
                    ${subject.updatedAt ? `
                    <div class="metadata-item">
                        <span class="metadata-label">Cập nhật lần cuối</span>
                        <span class="metadata-value">${this.formatDate(subject.updatedAt)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('subject-detail-content').innerHTML = modalContent;
        showModal('subject-detail-modal');
    }

    async handleDeleteSubject(subjectId) {
        const subject = this.subjects.find(s => s.id == subjectId);
        if (!subject) return;

        // Show confirmation modal
        document.getElementById('delete-message').textContent = 
            `Bạn có chắc chắn muốn xóa môn học "${subject.nameVi}" (${subject.code})? Hành động này không thể hoàn tác.`;
        
        this.selectedSubjectId = subjectId;
        showModal('delete-modal');
    }

    async confirmDeleteSubject() {
        if (!this.selectedSubjectId) return;

        try {
            await deleteSubject(this.selectedSubjectId);
            showNotification('Đã xóa môn học thành công', 'success');
            closeModal('delete-modal');
            await this.loadSubjects();
        } catch (error) {
            showNotification('Không thể xóa môn học', 'error');
        } finally {
            this.selectedSubjectId = null;
        }
    }

    async handleExportSubjects() {
        try {
            const subjects = this.getFilteredSubjects();
            await exportSubjectsToExcel(subjects);
            showNotification('Đã xuất dữ liệu thành công', 'success');
        } catch (error) {
            showNotification('Không thể xuất dữ liệu', 'error');
        }
    }

    handleSearch() {
        this.searchTerm = document.getElementById('subject-search-input').value.toLowerCase();
        this.currentPage = 1;
        this.renderSubjects();
        this.updatePagination();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    setupEventListeners() {
        // Add subject button
        document.getElementById('add-subject-btn').addEventListener('click', () => this.handleAddSubject());

        // Export button
        document.getElementById('export-subjects-btn').addEventListener('click', () => this.handleExportSubjects());

        // Search input
        const searchInput = document.getElementById('subject-search-input');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.handleSearch(), 300);
        });

        // Department filter
        document.getElementById('department-filter').addEventListener('change', (e) => {
            this.filterDepartment = e.target.value;
            this.currentPage = 1;
            this.renderSubjects();
            this.updatePagination();
        });

        // Status filter
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filterStatus = e.target.value;
            this.currentPage = 1;
            this.renderSubjects();
            this.updatePagination();
        });

        // More filters button
        document.getElementById('more-filters-btn').addEventListener('click', () => {
            // Implement additional filter UI
            showNotification('Tính năng lọc nâng cao đang được phát triển', 'info');
        });

        // Subject form
        document.getElementById('subject-form').addEventListener('submit', (e) => this.handleSubmitSubjectForm(e));

        // Cancel form button
        document.getElementById('cancel-form').addEventListener('click', () => {
            closeModal('subject-modal');
            document.getElementById('subject-form').reset();
            this.selectedSubjectId = null;
        });

        // Pagination
        document.querySelector('.pagination-btn.prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderSubjects();
                this.updatePagination();
            }
        });

        document.querySelector('.pagination-btn.next').addEventListener('click', () => {
            const totalSubjects = this.getFilteredSubjects().length;
            const totalPages = Math.ceil(totalSubjects / this.itemsPerPage);
            
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderSubjects();
                this.updatePagination();
            }
        });

        // Page buttons
        document.querySelectorAll('.pagination-page').forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.textContent);
                this.renderSubjects();
                this.updatePagination();
            });
        });

        // Rows per page
        document.getElementById('rows-per-page').addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.renderSubjects();
            this.updatePagination();
        });

        // Delete modal actions
        document.getElementById('cancel-delete').addEventListener('click', () => {
            closeModal('delete-modal');
            this.selectedSubjectId = null;
        });

        document.getElementById('confirm-delete').addEventListener('click', () => this.confirmDeleteSubject());

        // Close modal buttons
        document.getElementById('close-subject-modal').addEventListener('click', () => {
            closeModal('subject-modal');
        });

        document.getElementById('close-detail-modal').addEventListener('click', () => {
            closeModal('subject-detail-modal');
        });

        document.getElementById('close-delete-modal').addEventListener('click', () => {
            closeModal('delete-modal');
            this.selectedSubjectId = null;
        });
    }

    attachRowEventListeners() {
        document.querySelectorAll('.action-btn.view').forEach(button => {
            button.addEventListener('click', (e) => {
                const subjectId = e.currentTarget.dataset.subjectId;
                this.handleViewSubject(subjectId);
            });
        });

        document.querySelectorAll('.action-btn.edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const subjectId = e.currentTarget.dataset.subjectId;
                this.handleEditSubject(subjectId);
            });
        });

        document.querySelectorAll('.action-btn.delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const subjectId = e.currentTarget.dataset.subjectId;
                this.handleDeleteSubject(subjectId);
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const subjectManagement = new SubjectManagement();
});

export default SubjectManagement;