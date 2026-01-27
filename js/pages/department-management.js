import { adminService } from '../../services/admin-service.js';
import { showNotification } from '../components/notification.js';
import { Modal } from '../components/modal.js';

class DepartmentManagementPage {
    constructor() {
        this.currentFacultyId = null;
        this.departments = [];
        this.currentPage = 1;
        this.totalPages = 1;
        
        this.init();
    }

    init() {
        this.loadDepartments();
        this.setupEventListeners();
        this.setupModal();
        this.setupSearch();
    }

    async loadDepartments() {
        try {
            this.showLoading();
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
            this.hideLoading();
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
        
        document.getElementById('total-faculties').textContent = totalFaculties;
        document.getElementById('total-majors').textContent = totalMajors;
        document.getElementById('active-students').textContent = activeStudents.toLocaleString();
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

    setupEventListeners() {
        // Add faculty button
        const addBtn = document.getElementById('add-faculty-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddFacultyModal());
        }

        // Edit and delete buttons delegation
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

        // Pagination buttons
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
    }

    setupModal() {
        this.modal = new Modal('add-faculty-modal');
        
        // Form submission
        const form = document.getElementById('faculty-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFacultySubmit(e));
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-form');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelForm());
        }

        // Close button
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.modal.close());
        }
    }

    openAddFacultyModal() {
        this.currentFacultyId = null;
        this.resetForm();
        this.modal.open();
    }

    editFaculty(facultyId) {
        const faculty = this.departments.find(d => d.id === facultyId);
        if (!faculty) return;

        this.currentFacultyId = facultyId;
        
        // Populate form
        document.getElementById('faculty-code').value = faculty.code;
        document.getElementById('faculty-name').value = faculty.name;
        document.getElementById('faculty-description').value = faculty.description || '';
        document.getElementById('faculty-head').value = faculty.headId;
        document.getElementById('faculty-status').value = faculty.status;
        document.getElementById('faculty-email').value = faculty.email || '';
        document.getElementById('faculty-phone').value = faculty.phone || '';
        
        this.modal.open();
    }

    resetForm() {
        document.getElementById('faculty-form').reset();
        document.getElementById('faculty-code').value = '';
        document.getElementById('faculty-name').value = '';
        document.getElementById('faculty-description').value = '';
        document.getElementById('faculty-head').value = '';
        document.getElementById('faculty-status').value = 'active';
        document.getElementById('faculty-email').value = '';
        document.getElementById('faculty-phone').value = '';
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

        // Validate form
        if (!this.validateFacultyForm(formData)) {
            return;
        }

        try {
            if (this.currentFacultyId) {
                // Update existing faculty
                await adminService.updateFaculty(this.currentFacultyId, formData);
                showNotification('Cập nhật khoa thành công', 'success');
            } else {
                // Create new faculty
                await adminService.createFaculty(formData);
                showNotification('Thêm khoa mới thành công', 'success');
            }
            
            this.modal.close();
            this.loadDepartments(); // Reload data
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

        // Validate code format
        const codeRegex = /^[A-Z]\d{3}$/;
        if (!codeRegex.test(data.code)) {
            showNotification('Mã khoa phải có định dạng: K001, X002, ...', 'warning');
            return false;
        }

        return true;
    }

    cancelForm() {
        this.modal.close();
        this.resetForm();
    }

    async deleteFaculty(facultyId) {
        if (!confirm('Bạn có chắc chắn muốn xóa khoa này? Tất cả ngành học và sinh viên thuộc khoa sẽ bị ảnh hưởng.')) {
            return;
        }

        try {
            await adminService.deleteFaculty(facultyId);
            showNotification('Đã xóa khoa thành công', 'success');
            this.loadDepartments(); // Reload data
        } catch (error) {
            console.error('Error deleting faculty:', error);
            showNotification('Không thể xóa khoa', 'error');
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

    showLoading() {
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

    hideLoading() {
        // Loading state will be replaced by renderDepartments
    }

    updateChart(year) {
        // Update chart based on selected year
        console.log('Updating chart for year:', year);
        // This would typically make an API call to get chart data for the selected year
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
                this.loadDepartments(); // Reload data
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
        // Navigate to faculty heads management page
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DepartmentManagementPage();
});

export { DepartmentManagementPage };




// File: ../../js/pages/
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
            
            // Update tab actions button text
            updateTabActions(tabId);
        });
    });
    
    function updateTabActions(tabId) {
        const addBtn = document.getElementById('tab-add-new');
        const actions = {
            departments: { text: 'Thêm Khoa', icon: 'apartment' },
            subjects: { text: 'Thêm Môn học', icon: 'menu_book' },
            curriculum: { text: 'Tạo Chương trình', icon: 'calendar_clock' },
            reports: { text: 'Tạo Báo cáo', icon: 'insights' }
        };
        
        if (actions[tabId]) {
            addBtn.innerHTML = `
                <span class="material-symbols-outlined">${actions[tabId].icon}</span>
                ${actions[tabId].text}
            `;
        }
    }
    
    // Tab actions
    const addBtn = document.getElementById('tab-add-new');
    const refreshBtn = document.getElementById('tab-refresh');
    
    addBtn.addEventListener('click', function() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        
        switch(activeTab) {
            case 'departments':
                document.getElementById('add-faculty-btn').click();
                break;
            case 'subjects':
                document.getElementById('add-subject-btn').click();
                break;
            case 'curriculum':
                document.getElementById('create-curriculum-btn').click();
                break;
            case 'reports':
                document.getElementById('generate-report-btn').click();
                break;
        }
    });
    
    refreshBtn.addEventListener('click', function() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        alert(`Làm mới dữ liệu ${activeTab}`);
        // Implement actual refresh logic here
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                window.location.href = '../../index.html';
            }
        });
    }
    
    // Initialize
    updateTabActions('departments');
});