import { 
    getReports,
    getReportById,
    resolveReport,
    dismissReport,
    deleteReportedContent,
    blockUser,
    getReportStats,
    getViolationTrends,
    getModeratorStats 
} from '../services/admin-service.js';
import { showModal, closeModal } from '../components/modal.js';
import { showNotification } from '../components/notification.js';

class ForumManagement {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.filterType = 'all';
        this.filterStatus = 'pending';
        this.searchTerm = '';
        this.reports = [];
        this.selectedReportId = null;
        this.selectedAction = null;
        
        this.init();
    }

    async init() {
        await this.loadReports();
        await this.loadStats();
        await this.loadTrends();
        await this.loadModerators();
        this.setupEventListeners();
    }

    async loadReports() {
        try {
            const response = await getReports();
            this.reports = response.data;
            this.renderReports();
            this.updatePagination();
        } catch (error) {
            showNotification('Không thể tải danh sách báo cáo', 'error');
            console.error('Error loading reports:', error);
        }
    }

    async loadStats() {
        try {
            const stats = await getReportStats();
            this.updateStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadTrends() {
        try {
            const trends = await getViolationTrends();
            this.updateTrends(trends);
        } catch (error) {
            console.error('Error loading trends:', error);
        }
    }

    async loadModerators() {
        try {
            const moderators = await getModeratorStats();
            this.updateModerators(moderators);
        } catch (error) {
            console.error('Error loading moderators:', error);
        }
    }

    updateStats(stats) {
        document.getElementById('pending-count').textContent = stats.pending;
        document.getElementById('resolved-count').textContent = stats.resolved24h;
        document.getElementById('accuracy-rate').textContent = `${stats.accuracy}%`;
    }

    updateTrends(trends) {
        // Trends are updated via static HTML in this example
        // In a real app, you would update the trend bars dynamically
    }

    updateModerators(moderators) {
        // Moderators are updated via static HTML in this example
        // In a real app, you would update the moderator list dynamically
    }

    getFilteredReports() {
        return this.reports.filter(report => {
            // Apply type filter
            const matchesType = this.filterType === 'all' || 
                               report.violationType === this.filterType;
            
            // Apply status filter
            const matchesStatus = this.filterStatus === 'all' || 
                                 report.status === this.filterStatus;
            
            // Apply search filter
            const matchesSearch = this.searchTerm === '' ||
                                 report.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 report.authorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 report.reporterName.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            return matchesType && matchesStatus && matchesSearch;
        });
    }

    getPaginatedReports() {
        const filteredReports = this.getFilteredReports();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return filteredReports.slice(startIndex, endIndex);
    }

    renderReports() {
        const tbody = document.getElementById('reports-table-body');
        const reports = this.getPaginatedReports();
        
        if (reports.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8">
                        <div class="empty-state">
                            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">check_circle</span>
                            <p class="text-slate-500">Không có báo cáo nào cần xử lý</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = reports.map(report => this.createReportRow(report)).join('');
        this.attachRowEventListeners();
    }

    createReportRow(report) {
        const statusClass = report.status;
        const statusText = this.getStatusText(report.status);
        const violationClass = report.violationType;
        const violationText = this.getViolationText(report.violationType);
        const timeAgo = this.getTimeAgo(report.createdAt);
        
        const isResolved = report.status === 'resolved';
        const rowClass = isResolved ? 'resolved' : 'pending';
        
        return `
            <tr class="report-item ${rowClass}" data-report-id="${report.id}">
                <td>
                    <div class="report-content ${isResolved ? 'resolved' : ''}">
                        <div class="report-title">${report.title}</div>
                        <div class="report-meta">
                            <div class="user-avatar">${this.getAvatarInitials(report.authorName)}</div>
                            <div class="meta-details">
                                <span class="user-name">${report.authorName}</span>
                                <span class="report-time">${timeAgo}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="violation-tag ${violationClass}">${violationText}</span>
                </td>
                <td class="text-center">
                    <div class="status-indicator ${statusClass}">
                        <span class="status-dot"></span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </td>
                <td>
                    ${isResolved ? `
                    <button class="text-link" data-report-id="${report.id}">
                        Xem lại
                    </button>
                    ` : `
                    <div class="action-buttons">
                        <button class="action-btn delete" data-report-id="${report.id}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                        <button class="action-btn block" data-report-id="${report.id}">
                            <span class="material-symbols-outlined">block</span>
                        </button>
                        <button class="action-btn review" data-report-id="${report.id}">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                    </div>
                    `}
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

    getStatusText(status) {
        const statusTexts = {
            'pending': 'Chờ xử lý',
            'resolved': 'Đã xử lý',
            'dismissed': 'Đã bỏ qua'
        };
        return statusTexts[status] || 'Chờ xử lý';
    }

    getViolationText(type) {
        const violationTexts = {
            'spam': 'Spam',
            'toxic': 'Độc hại',
            'ads': 'Quảng cáo',
            'offtopic': 'Sai chủ đề',
            'copyright': 'Bản quyền'
        };
        return violationTexts[type] || type;
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} phút trước`;
        } else if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} ngày trước`;
        }
    }

    updatePagination() {
        const totalReports = this.getFilteredReports().length;
        const totalPages = Math.ceil(totalReports / this.itemsPerPage);

        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.innerHTML = `
                Trang <span class="highlight">${this.currentPage}</span> / <span class="highlight">${totalPages}</span>
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

    async handleViewReport(reportId) {
        try {
            const report = await getReportById(reportId);
            this.showReportDetailModal(report);
        } catch (error) {
            showNotification('Không thể tải chi tiết báo cáo', 'error');
        }
    }

    showReportDetailModal(report) {
        const modalContent = `
            <div class="report-detail-view">
                <div class="report-detail-header">
                    <h3 class="report-detail-title">${report.title}</h3>
                    <div class="report-detail-meta">
                        <div class="report-detail-author">
                            <div class="user-avatar">${this.getAvatarInitials(report.authorName)}</div>
                            <span class="user-name">${report.authorName}</span>
                        </div>
                        <span class="report-detail-time">${this.getTimeAgo(report.createdAt)}</span>
                        <span class="violation-tag ${report.violationType}">${this.getViolationText(report.violationType)}</span>
                        <div class="status-indicator ${report.status}">
                            <span class="status-dot"></span>
                            <span class="status-text">${this.getStatusText(report.status)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-detail-content">
                    <div class="report-detail-section">
                        <h4>Nội dung báo cáo</h4>
                        <p>${report.content || 'Không có nội dung chi tiết'}</p>
                    </div>
                    
                    ${report.reporterNote ? `
                    <div class="report-detail-section">
                        <h4>Ghi chú từ người báo cáo</h4>
                        <p>${report.reporterNote}</p>
                    </div>
                    ` : ''}
                    
                    <div class="report-detail-section">
                        <h4>Thông tin bổ sung</h4>
                        <p>
                            <strong>Người báo cáo:</strong> ${report.reporterName}<br>
                            <strong>Thời gian báo cáo:</strong> ${new Date(report.createdAt).toLocaleString('vi-VN')}<br>
                            ${report.resolvedAt ? `<strong>Thời gian xử lý:</strong> ${new Date(report.resolvedAt).toLocaleString('vi-VN')}` : ''}
                        </p>
                    </div>
                </div>
                
                ${report.status === 'pending' ? `
                <div class="report-actions">
                    <button class="btn-secondary" id="dismiss-report" data-report-id="${report.id}">
                        Bỏ qua báo cáo
                    </button>
                    <button class="btn-primary" id="resolve-report" data-report-id="${report.id}">
                        Đánh dấu đã xử lý
                    </button>
                </div>
                ` : ''}
            </div>
        `;

        document.getElementById('report-detail-content').innerHTML = modalContent;
        showModal('report-detail-modal');
        
        // Attach action listeners
        if (report.status === 'pending') {
            document.getElementById('dismiss-report').addEventListener('click', () => {
                this.handleDismissReport(report.id);
            });
            
            document.getElementById('resolve-report').addEventListener('click', () => {
                this.handleResolveReport(report.id);
            });
        }
    }

    async handleResolveReport(reportId) {
        try {
            await resolveReport(reportId);
            showNotification('Đã đánh dấu báo cáo đã xử lý', 'success');
            closeModal('report-detail-modal');
            await this.loadReports();
            await this.loadStats();
        } catch (error) {
            showNotification('Không thể xử lý báo cáo', 'error');
        }
    }

    async handleDismissReport(reportId) {
        try {
            await dismissReport(reportId);
            showNotification('Đã bỏ qua báo cáo', 'success');
            closeModal('report-detail-modal');
            await this.loadReports();
            await this.loadStats();
        } catch (error) {
            showNotification('Không thể bỏ qua báo cáo', 'error');
        }
    }

    showActionConfirmation(action, reportId) {
        this.selectedReportId = reportId;
        this.selectedAction = action;
        
        const report = this.reports.find(r => r.id == reportId);
        if (!report) return;
        
        let message = '';
        let icon = 'warning';
        
        switch (action) {
            case 'delete':
                message = `Bạn có chắc chắn muốn xóa bài viết "${report.title}"? Hành động này không thể hoàn tác.`;
                icon = 'delete';
                break;
            case 'block':
                message = `Bạn có chắc chắn muốn chặn người dùng "${report.authorName}"? Người dùng này sẽ không thể đăng bài trong 7 ngày.`;
                icon = 'block';
                break;
        }
        
        document.getElementById('action-message').textContent = message;
        document.getElementById('action-icon').textContent = icon;
        showModal('action-modal');
    }

    async confirmAction() {
        if (!this.selectedReportId || !this.selectedAction) return;
        
        try {
            switch (this.selectedAction) {
                case 'delete':
                    await deleteReportedContent(this.selectedReportId);
                    showNotification('Đã xóa nội dung vi phạm', 'success');
                    break;
                case 'block':
                    await blockUser(this.selectedReportId);
                    showNotification('Đã chặn người dùng vi phạm', 'success');
                    break;
            }
            
            closeModal('action-modal');
            await this.loadReports();
            await this.loadStats();
        } catch (error) {
            showNotification('Không thể thực hiện hành động', 'error');
        } finally {
            this.selectedReportId = null;
            this.selectedAction = null;
        }
    }

    async handleRefreshReports() {
        await this.loadReports();
        await this.loadStats();
        await this.loadTrends();
        showNotification('Đã làm mới danh sách báo cáo', 'success');
    }

    async handleExportReports() {
        try {
            // Implement export functionality
            showNotification('Đã xuất báo cáo thành công', 'success');
        } catch (error) {
            showNotification('Không thể xuất báo cáo', 'error');
        }
    }

    handleSearch() {
        this.searchTerm = document.getElementById('report-search').value.toLowerCase();
        this.currentPage = 1;
        this.renderReports();
        this.updatePagination();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refresh-reports-btn').addEventListener('click', () => this.handleRefreshReports());

        // Export button
        document.getElementById('export-reports-btn').addEventListener('click', () => this.handleExportReports());

        // Search input
        const searchInput = document.getElementById('report-search');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.handleSearch(), 300);
        });

        // Filters
        document.getElementById('violation-type-filter').addEventListener('change', (e) => {
            this.filterType = e.target.value;
            this.currentPage = 1;
            this.renderReports();
            this.updatePagination();
        });

        document.getElementById('report-status-filter').addEventListener('change', (e) => {
            this.filterStatus = e.target.value;
            this.currentPage = 1;
            this.renderReports();
            this.updatePagination();
        });

        // Update standards button
        document.getElementById('update-standards-btn').addEventListener('click', () => {
            showNotification('Tính năng cập nhật tiêu chuẩn đang được phát triển', 'info');
        });

        // Pagination
        document.querySelector('.pagination-btn.prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderReports();
                this.updatePagination();
            }
        });

        document.querySelector('.pagination-btn.next').addEventListener('click', () => {
            const totalReports = this.getFilteredReports().length;
            const totalPages = Math.ceil(totalReports / this.itemsPerPage);
            
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderReports();
                this.updatePagination();
            }
        });

        // Page buttons
        document.querySelectorAll('.pagination-page').forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.textContent);
                this.renderReports();
                this.updatePagination();
            });
        });

        // Action modal buttons
        document.getElementById('cancel-action').addEventListener('click', () => {
            closeModal('action-modal');
            this.selectedReportId = null;
            this.selectedAction = null;
        });

        document.getElementById('confirm-action').addEventListener('click', () => this.confirmAction());

        // Close modal buttons
        document.getElementById('close-report-modal').addEventListener('click', () => {
            closeModal('report-detail-modal');
        });

        document.getElementById('close-action-modal').addEventListener('click', () => {
            closeModal('action-modal');
            this.selectedReportId = null;
            this.selectedAction = null;
        });
    }

    attachRowEventListeners() {
        // View buttons
        document.querySelectorAll('.action-btn.review').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.currentTarget.dataset.reportId;
                this.handleViewReport(reportId);
            });
        });

        // View links for resolved reports
        document.querySelectorAll('.text-link').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.currentTarget.dataset.reportId;
                this.handleViewReport(reportId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.action-btn.delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.currentTarget.dataset.reportId;
                this.showActionConfirmation('delete', reportId);
            });
        });

        // Block buttons
        document.querySelectorAll('.action-btn.block').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportId = e.currentTarget.dataset.reportId;
                this.showActionConfirmation('block', reportId);
            });
        });

        // Click on report title
        document.querySelectorAll('.report-title').forEach(title => {
            title.addEventListener('click', (e) => {
                const reportItem = e.target.closest('.report-item');
                if (reportItem) {
                    const reportId = reportItem.dataset.reportId;
                    this.handleViewReport(reportId);
                }
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const forumManagement = new ForumManagement();
});

export default ForumManagement;