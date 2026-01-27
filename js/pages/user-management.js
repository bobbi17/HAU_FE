import { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUserStatus,
    getUserStats,
    getPendingRequests 
} from '../services/admin-service.js';
import { showModal, closeModal } from '../components/modal.js';
import { showNotification } from '../components/notification.js';

class UserManagement {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filterType = 'all';
        this.filterStatus = 'all';
        this.users = [];
        
        this.init();
    }

    async init() {
        await this.loadUsers();
        this.setupEventListeners();
        this.loadStats();
    }

    async loadUsers() {
        try {
            const response = await getAllUsers();
            this.users = response.data;
            this.renderUsers();
            this.updatePagination();
        } catch (error) {
            showNotification('Không thể tải danh sách người dùng', 'error');
            console.error('Error loading users:', error);
        }
    }

    async loadStats() {
        try {
            const stats = await getUserStats();
            this.updateStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStats(stats) {
        document.getElementById('total-users').textContent = stats.total.toLocaleString();
        document.getElementById('active-users').textContent = stats.active.toLocaleString();
        document.getElementById('pending-users').textContent = stats.pending;
        document.getElementById('locked-users').textContent = stats.locked;
        document.getElementById('student-count').textContent = stats.byRole.student.toLocaleString();
        document.getElementById('teacher-count').textContent = stats.byRole.teacher.toLocaleString();
        document.getElementById('admin-count').textContent = stats.byRole.admin.toLocaleString();
    }

    getFilteredUsers() {
        return this.users.filter(user => {
            const matchesType = this.filterType === 'all' || user.role === this.filterType;
            const matchesStatus = this.filterStatus === 'all' || user.status === this.filterStatus;
            return matchesType && matchesStatus;
        });
    }

    getPaginatedUsers() {
        const filteredUsers = this.getFilteredUsers();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }

    renderUsers() {
        const tbody = document.getElementById('users-table-body');
        const users = this.getPaginatedUsers();
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8">
                        <div class="empty-state">
                            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                            <p class="text-slate-500">Không tìm thấy người dùng nào</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => this.createUserRow(user)).join('');
        this.attachRowEventListeners();
    }

    createUserRow(user) {
        const roleClass = this.getRoleClass(user.role);
        const roleText = this.getRoleText(user.role);
        const statusClass = user.status === 'locked' ? 'locked' : 'active';
        const statusText = user.status === 'locked' ? 'Bị khóa' : 'Hoạt động';
        const lockAction = user.status === 'locked' ? 'unlock' : 'lock';
        const lockIcon = user.status === 'locked' ? 'lock_open' : 'lock';

        return `
            <tr class="user-item ${user.status === 'locked' ? 'locked' : ''}" data-user-id="${user.id}">
                <td>
                    <span class="user-code">${user.code}</span>
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${this.getAvatarInitials(user.name)}</div>
                        <div class="user-details">
                            <div class="user-name">${user.name}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="role-badge ${roleClass}">${roleText}</span>
                </td>
                <td>
                    <div class="status-indicator ${statusClass}">
                        <span class="status-dot"></span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </td>
                <td class="text-center">
                    <span class="date-text">${this.formatDate(user.createdAt)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" data-user-id="${user.id}">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="action-btn permissions" data-user-id="${user.id}">
                            <span class="material-symbols-outlined">admin_panel_settings</span>
                        </button>
                        <button class="action-btn ${lockAction}" data-user-id="${user.id}">
                            <span class="material-symbols-outlined">${lockIcon}</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getAvatarInitials(name) {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    getRoleClass(role) {
        const roleClasses = {
            'student': 'student',
            'teacher': 'teacher',
            'admin': 'admin'
        };
        return roleClasses[role] || 'student';
    }

    getRoleText(role) {
        const roleTexts = {
            'student': 'Sinh viên',
            'teacher': 'Giảng viên',
            'admin': 'Quản trị'
        };
        return roleTexts[role] || 'Sinh viên';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    updatePagination() {
        const totalUsers = this.getFilteredUsers().length;
        const totalPages = Math.ceil(totalUsers / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + this.itemsPerPage - 1, totalUsers);

        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.innerHTML = `
                Kết quả: <span class="highlight">${startIndex} - ${endIndex}</span> / ${totalUsers.toLocaleString()}
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

    async handleViewUser(userId) {
        try {
            const user = await getUserById(userId);
            this.showUserDetailModal(user);
        } catch (error) {
            showNotification('Không thể tải thông tin người dùng', 'error');
        }
    }

    showUserDetailModal(user) {
        const modalContent = `
            <div class="user-detail-view">
                <div class="user-detail-header">
                    <div class="user-avatar large">
                        ${this.getAvatarInitials(user.name)}
                    </div>
                    <div class="user-header-info">
                        <h4>${user.name}</h4>
                        <p class="user-code">${user.code}</p>
                        <span class="role-badge ${this.getRoleClass(user.role)}">
                            ${this.getRoleText(user.role)}
                        </span>
                    </div>
                </div>
                
                <div class="user-detail-grid">
                    <div class="detail-section">
                        <h5>Thông tin liên hệ</h5>
                        <div class="detail-item">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${user.email}</span>
                        </div>
                        ${user.phone ? `
                        <div class="detail-item">
                            <span class="detail-label">Điện thoại</span>
                            <span class="detail-value">${user.phone}</span>
                        </div>
                        ` : ''}
                        <div class="detail-item">
                            <span class="detail-label">Khoa/Phòng</span>
                            <span class="detail-value">${user.department}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Thông tin tài khoản</h5>
                        <div class="detail-item">
                            <span class="detail-label">Trạng thái</span>
                            <span class="detail-value status-indicator ${user.status === 'locked' ? 'locked' : 'active'}">
                                <span class="status-dot"></span>
                                <span class="status-text">${user.status === 'locked' ? 'Bị khóa' : 'Hoạt động'}</span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ngày tạo</span>
                            <span class="detail-value">${this.formatDate(user.createdAt)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Lần đăng nhập cuối</span>
                            <span class="detail-value">${user.lastLogin ? this.formatDate(user.lastLogin) : 'Chưa đăng nhập'}</span>
                        </div>
                    </div>
                </div>
                
                ${user.notes ? `
                <div class="detail-section">
                    <h5>Ghi chú</h5>
                    <div class="notes-content">${user.notes}</div>
                </div>
                ` : ''}
            </div>
        `;

        document.getElementById('user-detail-content').innerHTML = modalContent;
        showModal('user-detail-modal');
    }

    async handleToggleUserStatus(userId, currentStatus) {
        try {
            const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
            await updateUserStatus(userId, newStatus);
            
            showNotification(
                `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản thành công`,
                'success'
            );
            
            await this.loadUsers();
        } catch (error) {
            showNotification('Không thể thay đổi trạng thái tài khoản', 'error');
        }
    }

    handleAddUser() {
        showModal('add-user-modal');
    }

    async handleSubmitUserForm(event) {
        event.preventDefault();
        
        const formData = {
            name: document.getElementById('user-name').value,
            code: document.getElementById('user-code').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            role: document.getElementById('user-type').value,
            department: document.getElementById('user-department').value,
            status: document.getElementById('user-status').value,
            notes: document.getElementById('user-notes').value
        };

        try {
            await createUser(formData);
            showNotification('Tạo tài khoản thành công', 'success');
            closeModal('add-user-modal');
            
            // Reset form
            event.target.reset();
            
            // Reload users
            await this.loadUsers();
            await this.loadStats();
        } catch (error) {
            showNotification('Không thể tạo tài khoản', 'error');
        }
    }

    handleSearch() {
        const searchTerm = document.getElementById('user-search').value.toLowerCase();
        const filteredUsers = this.users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.code.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        
        this.currentPage = 1;
        this.users = filteredUsers;
        this.renderUsers();
        this.updatePagination();
    }

    handleExportData() {
        // Implement export functionality
        const users = this.getFilteredUsers();
        const csvContent = this.convertToCSV(users);
        this.downloadCSV(csvContent, 'hauhub-users.csv');
        showNotification('Đã xuất dữ liệu thành công', 'success');
    }

    convertToCSV(users) {
        const headers = ['Mã số', 'Họ tên', 'Email', 'Phân quyền', 'Trạng thái', 'Ngày tạo'];
        const rows = users.map(user => [
            user.code,
            user.name,
            user.email,
            this.getRoleText(user.role),
            user.status === 'locked' ? 'Bị khóa' : 'Hoạt động',
            this.formatDate(user.createdAt)
        ]);
        
        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        return csv;
    }

    downloadCSV(content, filename) {
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setupEventListeners() {
        // Filters
        document.getElementById('user-type-filter').addEventListener('change', (e) => {
            this.filterType = e.target.value;
            this.currentPage = 1;
            this.renderUsers();
            this.updatePagination();
        });

        document.getElementById('user-status-filter').addEventListener('change', (e) => {
            this.filterStatus = e.target.value;
            this.currentPage = 1;
            this.renderUsers();
            this.updatePagination();
        });

        // Search
        const searchInput = document.getElementById('user-search');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.handleSearch(), 300);
        });

        // Add user button
        document.getElementById('add-user-btn').addEventListener('click', () => this.handleAddUser());

        // Export button
        document.getElementById('export-data-btn').addEventListener('click', () => this.handleExportData());

        // Review pending button
        document.getElementById('review-pending-btn').addEventListener('click', async () => {
            try {
                const pendingRequests = await getPendingRequests();
                this.showPendingRequestsModal(pendingRequests);
            } catch (error) {
                showNotification('Không thể tải yêu cầu chờ phê duyệt', 'error');
            }
        });

        // User form
        document.getElementById('user-form').addEventListener('submit', (e) => this.handleSubmitUserForm(e));

        // Copy password button
        document.getElementById('copy-password').addEventListener('click', () => {
            const passwordField = document.getElementById('user-password');
            passwordField.select();
            document.execCommand('copy');
            showNotification('Đã sao chép mật khẩu', 'success');
        });

        // Cancel form
        document.getElementById('cancel-form').addEventListener('click', () => {
            closeModal('add-user-modal');
            document.getElementById('user-form').reset();
        });

        // Pagination
        document.querySelector('.pagination-btn.prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderUsers();
                this.updatePagination();
            }
        });

        document.querySelector('.pagination-btn.next').addEventListener('click', () => {
            const totalUsers = this.getFilteredUsers().length;
            const totalPages = Math.ceil(totalUsers / this.itemsPerPage);
            
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderUsers();
                this.updatePagination();
            }
        });

        // Page buttons
        document.querySelectorAll('.pagination-page').forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.textContent);
                this.renderUsers();
                this.updatePagination();
            });
        });

        // Rows per page
        document.getElementById('rows-per-page').addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.renderUsers();
            this.updatePagination();
        });
    }

    attachRowEventListeners() {
        document.querySelectorAll('.action-btn.view').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.userId;
                this.handleViewUser(userId);
            });
        });

        document.querySelectorAll('.action-btn.lock, .action-btn.unlock').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.currentTarget.dataset.userId;
                const user = this.users.find(u => u.id == userId);
                if (user) {
                    await this.handleToggleUserStatus(userId, user.status);
                }
            });
        });

        document.querySelectorAll('.action-btn.permissions').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.userId;
                // Implement permission management
                showNotification('Tính năng quản lý quyền đang được phát triển', 'info');
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const userManagement = new UserManagement();
});

export default UserManagement;