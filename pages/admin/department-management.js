// File: js/pages/academic-management.js
import { adminService } from '../../services/admin-service.js';
import { 
    getAllSubjects, 
    getSubjectById, 
    createSubject, 
    updateSubject,
    deleteSubject,
    exportSubjectsToExcel 
} from '../../js/services/admin-service.js';
import { showNotification } from '../../js/components/notification.js';
import { Modal } from '../../js/components/modal.js';
import { showModal, closeModal } from '../../js/components/modal.js';

class AcademicManagementPage {
    constructor() {
        // Department properties
        this.currentFacultyId = null;
        this.departments = [];
        this.currentPage = 1;
        this.totalPages = 1;
        
        // Subject properties
        this.currentSubjectPage = 1;
        this.itemsPerPage = 5;
        this.filterDepartment = 'all';
        this.filterStatus = 'all';
        this.searchTerm = '';
        this.subjects = [];
        this.selectedSubjectId = null;
        
        this.activeTab = 'departments';
        
        this.init();
    }

    init() {
        this.loadDepartments();
        this.loadSubjects();
        this.setupEventListeners();
        this.setupModal();
        this.setupSearch();
        this.setupTabs();
    }

    // ==================== DEPARTMENT METHODS ====================

    async loadDepartments() {
        try {
            this.showDepartmentLoading();
            const response = await adminService.getFaculties(this.currentPage);
            this.departments = response.departments;
            this.totalPages = response.totalPages;
            
            this.renderDepartments();
            this.updateStats();
            this.updatePagination();
        } catch (error) {
            console.error('Error loading departments:', error);
            showNotification('Không thể tải danh sách khoa', 'error');
        } finally {
            this.hideDepartmentLoading();
        }
    }

    renderDepartments() {
        const tbody = document.getElementById('faculties-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.departments.forEach(department => {
            const row = this.createDepartmentRow(department);
            tbody.appendChild(row);
        });
    }

    createDepartmentRow(department) {
        const tr = document.createElement('tr');
        
        const statusClass = department.status === 'active' ? 'active' : 'inactive';
        const statusText = department.status === 'active' ? 'Hoạt động' : 'Tạm ngừng';
        
        tr.innerHTML = `
            <td><span class="code-badge">${department.code}</span></td>
            <td>
                <div class="faculty-info">
                    <div class="faculty-avatar">${department.name.charAt(0)}</div>
                    <div>
                        <div class="faculty-name">${department.name}</div>
                        <div class="faculty-description">${department.description || ''}</div>
                    </div>
                </div>
            </td>
            <td><span class="count-badge">${department.majorCount}</span></td>
            <td>${department.head}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" data-id="${department.id}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-btn delete" data-id="${department.id}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </td>
        `;
        
        return tr;
    }

    updateStats() {
        const totalFaculties = this.departments.length;
        const totalMajors = this.departments.reduce((sum, dept) => sum + dept.majorCount, 0);
        const activeStudents = this.departments.reduce((sum, dept) => sum + dept.studentCount, 0);
        
        const totalFacultiesEl = document.getElementById('total-faculties');
        const totalMajorsEl = document.getElementById('total-majors');
        const activeStudentsEl = document.getElementById('active-students');
        
        if (totalFacultiesEl) totalFacultiesEl.textContent = totalFaculties;
        if (totalMajorsEl) totalMajorsEl.textContent = totalMajors;
        if (activeStudentsEl) activeStudentsEl.textContent = activeStudents.toLocaleString();
    }

    updatePagination() {
        const pageInfo = document.querySelector('.page-info');
        const prevBtn = document.querySelector('.pagination-btn.prev');
        const nextBtn = document.querySelector('.pagination-btn.next');
        const tableSummary = document.querySelector('.table-summary');
        
        if (pageInfo) {
            pageInfo.innerHTML = `Trang <strong>${this.currentPage}</strong> của <strong>${this.totalPages}</strong>`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === this.totalPages;
        }
        
        if (tableSummary) {
            const start = (this.currentPage - 1) * 10 + 1;
            const end = Math.min(this.currentPage * 10, this.departments.length);
            tableSummary.textContent = `Hiển thị ${start}-${end} của ${this.departments.length} khoa`;
        }
    }

    openAddFacultyModal() {
        this.currentFacultyId = null;
        this.resetFacultyForm();
        this.modal.open();
    }

    editFaculty(facultyId) {
        const faculty = this.departments.find(d => d.id === facultyId);
        if (!faculty) return;

        this.currentFacultyId = facultyId;
        
        document.getElementById('faculty-code').value = faculty.code;
        document.getElementById('faculty-name').value = faculty.name;
        document.getElementById('faculty-description').value = faculty.description || '';
        document.getElementById('faculty-head').value = faculty.headId;
        document.getElementById('faculty-status').value = faculty.status;
        document.getElementById('faculty-email').value = faculty.email || '';
        document.getElementById('faculty-phone').value = faculty.phone || '';
        
        this.modal.open();
    }

    resetFacultyForm() {
        const form = document.getElementById('faculty-form');
        if (form) form.reset();
        const codeInput = document.getElementById('faculty-code');
        const nameInput = document.getElementById('faculty-name');
        const descInput = document.getElementById('faculty-description');
        const headInput = document.getElementById('faculty-head');
        const statusSelect = document.getElementById('faculty-status');
        const emailInput = document.getElementById('faculty-email');
        const phoneInput = document.getElementById('faculty-phone');
        
        if (codeInput) codeInput.value = '';
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        if (headInput) headInput.value = '';
        if (statusSelect) statusSelect.value = 'active';
        if (emailInput) emailInput.value = '';
        if (phoneInput) phoneInput.value = '';
    }

    async handleFacultySubmit(e) {
        e.preventDefault();
        
        const formData = {
            code: document.getElementById('faculty-code').value.trim(),
            name: document.getElementById('faculty-name').value.trim(),
            description: document.getElementById('faculty-description').value.trim(),
            headId: document.getElementById('faculty-head').value,
            status: document.getElementById('faculty-status').value,
            email: document.getElementById('faculty-email').value.trim(),
            phone: document.getElementById('faculty-phone').value.trim()
        };

        if (!this.validateFacultyForm(formData)) {
            return;
        }

        try {
            if (this.currentFacultyId) {
                await adminService.updateFaculty(this.currentFacultyId, formData);
                showNotification('Cập nhật khoa thành công', 'success');
            } else {
                await adminService.createFaculty(formData);
                showNotification('Thêm khoa mới thành công', 'success');
            }
            
            this.modal.close();
            this.loadDepartments();
        } catch (error) {
            console.error('Error saving faculty:', error);
            showNotification('Không thể lưu khoa', 'error');
        }
    }

    validateFacultyForm(data) {
        if (!data.code) {
            showNotification('Vui lòng nhập mã khoa', 'warning');
            return false;
        }
        if (!data.name) {
            showNotification('Vui lòng nhập tên khoa', 'warning');
            return false;
        }
        if (!data.headId) {
            showNotification('Vui lòng chọn trưởng khoa', 'warning');
            return false;
        }
        const codeRegex = /^[A-Z]\d{3}$/;
        if (!codeRegex.test(data.code)) {
            showNotification('Mã khoa phải có định dạng: K001, X002, ...', 'warning');
            return false;
        }
        return true;
    }

    async deleteFaculty(facultyId) {
        if (!confirm('Bạn có chắc chắn muốn xóa khoa này? Tất cả ngành học và sinh viên thuộc khoa sẽ bị ảnh hưởng.')) {
            return;
        }
        try {
            await adminService.deleteFaculty(facultyId);
            showNotification('Đã xóa khoa thành công', 'success');
            this.loadDepartments();
        } catch (error) {
            console.error('Error deleting faculty:', error);
            showNotification('Không thể xóa khoa', 'error');
        }
    }

    searchDepartments(query) {
        if (!query.trim()) {
            this.loadDepartments();
            return;
        }
        const filtered = this.departments.filter(dept => 
            dept.name.toLowerCase().includes(query.toLowerCase()) ||
            dept.code.toLowerCase().includes(query.toLowerCase()) ||
            dept.description?.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredDepartments(filtered);
    }

    renderFilteredDepartments(departments) {
        const tbody = document.getElementById('faculties-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        departments.forEach(department => {
            const row = this.createDepartmentRow(department);
            tbody.appendChild(row);
        });
    }

    showDepartmentLoading() {
        const tbody = document.getElementById('faculties-table-body');
        if (!tbody) return;
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem;">
                    <div class="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </td>
            </tr>
        `;
    }

    hideDepartmentLoading() {}

    // ==================== SUBJECT METHODS ====================

    async loadSubjects() {
        try {
            const response = await getAllSubjects();
            this.subjects = response.data;
            this.renderSubjects();
            this.updateSubjectPagination();
        } catch (error) {
            showNotification('Không thể tải danh sách môn học', 'error');
            console.error('Error loading subjects:', error);
        }
    }

    getFilteredSubjects() {
        return this.subjects.filter(subject => {
            const matchesDepartment = this.filterDepartment === 'all' || 
                                     subject.department === this.filterDepartment;
            const matchesStatus = this.filterStatus === 'all' || 
                                 subject.status === this.filterStatus;
            const matchesSearch = this.searchTerm === '' ||
                                 subject.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 subject.nameVi.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 subject.nameEn.toLowerCase().includes(this.searchTerm.toLowerCase());
            return matchesDepartment && matchesStatus && matchesSearch;
        });
    }

    getPaginatedSubjects() {
        const filteredSubjects = this.getFilteredSubjects();
        const startIndex = (this.currentSubjectPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return filteredSubjects.slice(startIndex, endIndex);
    }

    renderSubjects() {
        const tbody = document.getElementById('subjects-table-body');
        if (!tbody) return;
        
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
        this.attachSubjectRowEventListeners();
    }

    createSubjectRow(subject) {
        const statusClass = this.getSubjectStatusClass(subject.status);
        const statusText = this.getSubjectStatusText(subject.status);
        
        return `
            <tr class="subject-item" data-subject-id="${subject.id}">
                <td><span class="subject-code">${subject.code}</span></td>
                <td>
                    <div class="subject-info">
                        <div class="subject-name">${subject.nameVi}</div>
                        <div class="subject-category">${subject.category}</div>
                    </div>
                </td>
                <td><span class="department-name">${this.getDepartmentName(subject.department)}</span></td>
                <td class="text-center"><span class="credit-count">${subject.credits}</span></td>
                <td class="text-center"><span class="status-badge ${statusClass}">${statusText}</span></td>
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

    getSubjectStatusClass(status) {
        const statusClasses = {
            'active': 'active',
            'inactive': 'inactive',
            'pending': 'pending'
        };
        return statusClasses[status] || 'inactive';
    }

    getSubjectStatusText(status) {
        const statusTexts = {
            'active': 'Đang mở',
            'inactive': 'Đã đóng',
            'pending': 'Chờ duyệt'
        };
        return statusTexts[status] || 'Đã đóng';
    }

    updateSubjectPagination() {
        const totalSubjects = this.getFilteredSubjects().length;
        const totalPages = Math.ceil(totalSubjects / this.itemsPerPage);
        const startIndex = (this.currentSubjectPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.itemsPerPage - 1, totalSubjects);

        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.innerHTML = `
                Hiển thị <span class="highlight">${startIndex}-${endIndex}</span> trên <span class="highlight">${totalSubjects}</span> môn học
            `;
        }

        const prevBtn = document.querySelector('.pagination-btn.prev');
        const nextBtn = document.querySelector('.pagination-btn.next');
        
        if (prevBtn) prevBtn.disabled = this.currentSubjectPage === 1;
        if (nextBtn) prevBtn.disabled = this.currentSubjectPage === totalPages;
    }

    async handleAddSubject() {
        document.getElementById('modal-title').textContent = 'Thêm Mới Môn Học';
        const form = document.getElementById('subject-form');
        if (form) form.reset();
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
        const fields = ['subject-code', 'credit-hours', 'subject-name-vi', 'subject-name-en', 
                        'department', 'category', 'description', 'semester', 'status', 'prerequisites'];
        const values = [subject.code, subject.credits, subject.nameVi, subject.nameEn, 
                        subject.department, subject.category, subject.description, 
                        subject.semester, subject.status, subject.prerequisites?.join(', ') || ''];
        
        fields.forEach((field, index) => {
            const el = document.getElementById(field);
            if (el) el.value = values[index];
        });
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
                await updateSubject(this.selectedSubjectId, formData);
                showNotification('Cập nhật môn học thành công', 'success');
            } else {
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
                        <span class="status-badge ${this.getSubjectStatusClass(subject.status)}">
                            ${this.getSubjectStatusText(subject.status)}
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
                        ${subject.prerequisites && subject.prerequisites.length > 0 ? 
                            `<div class="prerequisites-list">${subject.prerequisites.map(code => `<span class="prerequisite-badge">${code}</span>`).join('')}</div>` : 
                            `<p class="detail-empty">Không có môn học tiên quyết</p>`}
                    </div>
                </div>
                <div class="detail-section">
                    <h5>Mô tả môn học</h5>
                    <div class="description-content">${subject.description}</div>
                </div>
            </div>
        `;
        const detailContent = document.getElementById('subject-detail-content');
        if (detailContent) detailContent.innerHTML = modalContent;
        showModal('subject-detail-modal');
    }

    async handleDeleteSubject(subjectId) {
        const subject = this.subjects.find(s => s.id == subjectId);
        if (!subject) return;
        const deleteMsg = document.getElementById('delete-message');
        if (deleteMsg) {
            deleteMsg.textContent = `Bạn có chắc chắn muốn xóa môn học "${subject.nameVi}" (${subject.code})? Hành động này không thể hoàn tác.`;
        }
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

    handleSubjectSearch() {
        const searchInput = document.getElementById('subject-search-input');
        if (searchInput) {
            this.searchTerm = searchInput.value.toLowerCase();
            this.currentSubjectPage = 1;
            this.renderSubjects();
            this.updateSubjectPagination();
        }
    }

    // ==================== COMMON / UI METHODS ====================

    setupModal() {
        this.modal = new Modal('add-faculty-modal');
        const form = document.getElementById('faculty-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFacultySubmit(e));
        }
        const cancelBtn = document.getElementById('cancel-form');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.modal.close());
        }
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.modal.close());
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-departments');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchDepartments(e.target.value);
                }, 300);
            });
        }
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.activeTab = tabId;
                
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });
                
                this.updateTabActions(tabId);
                
                if (tabId === 'subjects') {
                    this.renderSubjects();
                    this.updateSubjectPagination();
                }
            });
        });
        
        this.updateTabActions('departments');
    }

    updateTabActions(tabId) {
        const addBtn = document.getElementById('tab-add-new');
        const actions = {
            departments: { text: 'Thêm Khoa', icon: 'apartment' },
            subjects: { text: 'Thêm Môn học', icon: 'menu_book' },
            curriculum: { text: 'Tạo Chương trình', icon: 'calendar_clock' },
            reports: { text: 'Tạo Báo cáo', icon: 'insights' }
        };
        
        if (addBtn && actions[tabId]) {
            addBtn.innerHTML = `
                <span class="material-symbols-outlined">${actions[tabId].icon}</span>
                ${actions[tabId].text}
            `;
        }
    }

    setupEventListeners() {
        // Add faculty button
        const addFacultyBtn = document.getElementById('add-faculty-btn');
        if (addFacultyBtn) {
            addFacultyBtn.addEventListener('click', () => this.openAddFacultyModal());
        }

        // Edit and delete buttons delegation for departments
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit')) {
                const btn = e.target.closest('.edit');
                const facultyId = btn.dataset.id;
                this.editFaculty(facultyId);
            }
            if (e.target.closest('.delete')) {
                const btn = e.target.closest('.delete');
                const facultyId = btn.dataset.id;
                this.deleteFaculty(facultyId);
            }
        });

        // Pagination buttons for departments
        const prevBtn = document.querySelector('.pagination-btn.prev');
        const nextBtn = document.querySelector('.pagination-btn.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadDepartments();
                }
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.loadDepartments();
                }
            });
        }

        // Chart period change
        const chartSelect = document.getElementById('chart-period');
        if (chartSelect) {
            chartSelect.addEventListener('change', (e) => this.updateChart(e.target.value));
        }

        // Quick actions
        const quickActions = {
            'import-departments': () => this.importDepartments(),
            'export-report': () => this.exportReport(),
            'manage-heads': () => this.manageHeads(),
            'system-audit': () => this.systemAudit()
        };

        Object.entries(quickActions).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });

        // Subject event listeners
        const addSubjectBtn = document.getElementById('add-subject-btn');
        if (addSubjectBtn) {
            addSubjectBtn.addEventListener('click', () => this.handleAddSubject());
        }

        const exportBtn = document.getElementById('export-subjects-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExportSubjects());
        }

        const subjectSearchInput = document.getElementById('subject-search-input');
        if (subjectSearchInput) {
            let searchTimeout;
            subjectSearchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.handleSubjectSearch(), 300);
            });
        }

        const departmentFilter = document.getElementById('department-filter');
        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.filterDepartment = e.target.value;
                this.currentSubjectPage = 1;
                this.renderSubjects();
                this.updateSubjectPagination();
            });
        }

        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterStatus = e.target.value;
                this.currentSubjectPage = 1;
                this.renderSubjects();
                this.updateSubjectPagination();
            });
        }

        const moreFiltersBtn = document.getElementById('more-filters-btn');
        if (moreFiltersBtn) {
            moreFiltersBtn.addEventListener('click', () => {
                showNotification('Tính năng lọc nâng cao đang được phát triển', 'info');
            });
        }

        const subjectForm = document.getElementById('subject-form');
        if (subjectForm) {
            subjectForm.addEventListener('submit', (e) => this.handleSubmitSubjectForm(e));
        }

        const cancelSubjectForm = document.getElementById('cancel-form');
        if (cancelSubjectForm) {
            cancelSubjectForm.addEventListener('click', () => {
                closeModal('subject-modal');
                if (subjectForm) subjectForm.reset();
                this.selectedSubjectId = null;
            });
        }

        // Subject pagination
        const subjectPrevBtn = document.querySelector('.pagination-btn.prev');
        if (subjectPrevBtn) {
            subjectPrevBtn.addEventListener('click', () => {
                if (this.currentSubjectPage > 1) {
                    this.currentSubjectPage--;
                    this.renderSubjects();
                    this.updateSubjectPagination();
                }
            });
        }

        const subjectNextBtn = document.querySelector('.pagination-btn.next');
        if (subjectNextBtn) {
            subjectNextBtn.addEventListener('click', () => {
                const totalSubjects = this.getFilteredSubjects().length;
                const totalPages = Math.ceil(totalSubjects / this.itemsPerPage);
                if (this.currentSubjectPage < totalPages) {
                    this.currentSubjectPage++;
                    this.renderSubjects();
                    this.updateSubjectPagination();
                }
            });
        }

        const rowsPerPage = document.getElementById('rows-per-page');
        if (rowsPerPage) {
            rowsPerPage.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentSubjectPage = 1;
                this.renderSubjects();
                this.updateSubjectPagination();
            });
        }

        // Delete modal actions
        const cancelDelete = document.getElementById('cancel-delete');
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => {
                closeModal('delete-modal');
                this.selectedSubjectId = null;
            });
        }

        const confirmDelete = document.getElementById('confirm-delete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.confirmDeleteSubject());
        }

        const closeSubjectModal = document.getElementById('close-subject-modal');
        if (closeSubjectModal) {
            closeSubjectModal.addEventListener('click', () => closeModal('subject-modal'));
        }

        const closeDetailModal = document.getElementById('close-detail-modal');
        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => closeModal('subject-detail-modal'));
        }

        const closeDeleteModal = document.getElementById('close-delete-modal');
        if (closeDeleteModal) {
            closeDeleteModal.addEventListener('click', () => {
                closeModal('delete-modal');
                this.selectedSubjectId = null;
            });
        }

        // Tab actions
        const tabAddBtn = document.getElementById('tab-add-new');
        if (tabAddBtn) {
            tabAddBtn.addEventListener('click', () => {
                switch(this.activeTab) {
                    case 'departments':
                        this.openAddFacultyModal();
                        break;
                    case 'subjects':
                        this.handleAddSubject();
                        break;
                    case 'curriculum':
                        const curriculumBtn = document.getElementById('create-curriculum-btn');
                        if (curriculumBtn) curriculumBtn.click();
                        break;
                    case 'reports':
                        const reportBtn = document.getElementById('generate-report-btn');
                        if (reportBtn) reportBtn.click();
                        break;
                }
            });
        }

        const refreshBtn = document.getElementById('tab-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (this.activeTab === 'departments') {
                    this.loadDepartments();
                } else if (this.activeTab === 'subjects') {
                    this.loadSubjects();
                }
                showNotification(`Đã làm mới dữ liệu ${this.activeTab}`, 'success');
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logout-button');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    window.location.href = '../../index.html';
                }
            });
        }
    }

    attachSubjectRowEventListeners() {
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

    updateChart(year) {
        console.log('Updating chart for year:', year);
    }

    async importDepartments() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await adminService.importDepartments(file);
                showNotification('Import dữ liệu thành công', 'success');
                this.loadDepartments();
            } catch (error) {
                console.error('Error importing departments:', error);
                showNotification('Không thể import dữ liệu', 'error');
            }
        };
        input.click();
    }

    async exportReport() {
        try {
            const report = await adminService.exportDepartmentsReport();
            this.downloadReport(report);
            showNotification('Xuất báo cáo thành công', 'success');
        } catch (error) {
            console.error('Error exporting report:', error);
            showNotification('Không thể xuất báo cáo', 'error');
        }
    }

    downloadReport(report) {
        const blob = new Blob([report], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `department-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    manageHeads() {
        window.location.href = 'faculty-heads.html';
    }

    async systemAudit() {
        try {
            const auditResult = await adminService.runSystemAudit();
            this.showAuditResult(auditResult);
        } catch (error) {
            console.error('Error running system audit:', error);
            showNotification('Không thể kiểm tra hệ thống', 'error');
        }
    }

    showAuditResult(result) {
        const message = `
            <strong>Kết quả kiểm tra hệ thống:</strong><br><br>
            • Tổng số khoa: ${result.totalFaculties}<br>
            • Khoa đang hoạt động: ${result.activeFaculties}<br>
            • Khoa cần cập nhật: ${result.facultiesNeedingUpdate}<br>
            • Lỗi cấu trúc: ${result.structureErrors}<br><br>
            <em>Kiểm tra hoàn tất lúc ${new Date().toLocaleTimeString()}</em>
        `;
        showNotification(message, 'info', 10000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AcademicManagementPage();
});

export default AcademicManagementPage;