import { groupService } from '../services/group-service.js';
import { showNotification } from '../components/notification.js';
import { Modal } from '../components/modal.js';

class GroupsPage {
    constructor() {
        this.currentTab = 'my-groups';
        this.groups = [];
        this.filters = {
            projectType: 'all',
            semester: '2024-1',
            status: 'all'
        };
        
        this.init();
    }

    init() {
        this.loadGroups();
        this.setupEventListeners();
        this.setupModal();
        this.setupAIWidget();
    }

    async loadGroups() {
        try {
            this.showLoading();
            const groups = await groupService.getUserGroups();
            this.groups = groups;
            this.renderGroups();
        } catch (error) {
            console.error('Error loading groups:', error);
            showNotification('Không thể tải danh sách nhóm', 'error');
            this.showEmptyState();
        } finally {
            this.hideLoading();
        }
    }

    renderGroups() {
        const container = document.getElementById('groups-container');
        if (!container) return;

        // Clear container
        container.innerHTML = '';

        // Filter groups
        const filteredGroups = this.filterGroups(this.groups);

        if (filteredGroups.length === 0) {
            this.showEmptyState();
            return;
        }

        // Render each group
        filteredGroups.forEach(group => {
            const groupElement = this.createGroupElement(group);
            container.appendChild(groupElement);
        });

        // Add create group card
        const createCard = this.createCreateGroupCard();
        container.appendChild(createCard);
    }

    filterGroups(groups) {
        return groups.filter(group => {
            // Filter by project type
            if (this.filters.projectType !== 'all' && 
                group.projectType !== this.filters.projectType) {
                return false;
            }

            // Filter by semester
            if (this.filters.semester !== 'all' && 
                group.semester !== this.filters.semester) {
                return false;
            }

            // Filter by status
            if (this.filters.status !== 'all' && 
                group.status !== this.filters.status) {
                return false;
            }

            return true;
        });
    }

    createGroupElement(group) {
        const div = document.createElement('div');
        div.className = 'group-card';
        div.dataset.groupId = group.id;

        const membersHTML = group.members.map((member, index) => `
            <div class="member-avatar" style="z-index: ${group.members.length - index}">
                <img src="${member.avatar || '../../assets/images/avatars/default.jpg'}" alt="${member.name}">
            </div>
        `).join('');

        const extraMembers = group.members.length > 3 ? 
            `<div class="member-count">+${group.members.length - 3}</div>` : '';

        div.innerHTML = `
            <div class="group-header">
                <div class="group-info">
                    <span class="group-code">${group.code}</span>
                    <h4 class="group-name">${group.name}</h4>
                </div>
                <span class="group-status ${group.status}">${this.getStatusText(group.status)}</span>
            </div>
            <p class="group-description">${group.description}</p>
            <div class="group-footer">
                <div class="group-members">
                    ${membersHTML.slice(0, 3)}
                    ${extraMembers}
                </div>
                <div class="group-stats">
                    <span class="stat-item">
                        <span class="material-symbols-outlined">attachment</span>
                        ${group.fileCount}
                    </span>
                    <button class="group-action" data-action="${group.status === 'submitted' ? 'archive' : 'detail'}">
                        ${this.getActionText(group.status)}
                    </button>
                </div>
            </div>
            <div class="group-icon">
                <span class="material-symbols-outlined">${this.getGroupIcon(group.projectType)}</span>
            </div>
        `;

        return div;
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'ACTIVE',
            'submitted': 'SUBMITTED',
            'archived': 'ARCHIVED'
        };
        return statusMap[status] || 'ACTIVE';
    }

    getActionText(status) {
        const actionMap = {
            'active': 'CHI TIẾT',
            'submitted': 'LƯU TRỮ',
            'archived': 'XEM LẠI'
        };
        return actionMap[status] || 'CHI TIẾT';
    }

    getGroupIcon(projectType) {
        const iconMap = {
            'architecture': 'architecture',
            'urban': 'map',
            'interior': 'chair',
            'structure': 'construction',
            'history': 'history_edu'
        };
        return iconMap[projectType] || 'groups';
    }

    createCreateGroupCard() {
        const div = document.createElement('div');
        div.className = 'group-card create-group';
        div.id = 'create-group-card';
        div.innerHTML = `
            <div class="create-group-content">
                <div class="create-icon">
                    <span class="material-symbols-outlined">add</span>
                </div>
                <h4 class="create-title">TẠO NHÓM MỚI</h4>
                <p class="create-subtitle">Khởi tạo Studio cho đồ án tiếp theo</p>
            </div>
        `;
        return div;
    }

    showEmptyState() {
        const container = document.getElementById('groups-container');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <span class="material-symbols-outlined">groups</span>
                </div>
                <h3 class="empty-title">Chưa có nhóm nào</h3>
                <p class="empty-description">Bắt đầu bằng cách tạo nhóm mới hoặc tham gia nhóm khác</p>
                <button class="btn-primary" id="create-empty-group">
                    <span class="material-symbols-outlined">add_box</span>
                    Tạo nhóm đầu tiên
                </button>
            </div>
        `;
    }

    showLoading() {
        const container = document.getElementById('groups-container');
        if (!container) return;

        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Đang tải danh sách nhóm...</p>
            </div>
        `;
    }

    hideLoading() {
        // Loading state will be replaced by renderGroups
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Filter changes
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => this.handleFilterChange(e.target.id, e.target.value));
        });

        // Group actions delegation
        document.addEventListener('click', (e) => {
            // Create group button
            if (e.target.closest('#create-group-btn') || 
                e.target.closest('#create-group-card') ||
                e.target.closest('#create-empty-group')) {
                this.openCreateModal();
            }

            // Group detail action
            if (e.target.closest('.group-action[data-action="detail"]')) {
                const groupCard = e.target.closest('.group-card');
                const groupId = groupCard.dataset.groupId;
                this.viewGroupDetail(groupId);
            }

            // Group archive action
            if (e.target.closest('.group-action[data-action="archive"]')) {
                const groupCard = e.target.closest('.group-card');
                const groupId = groupCard.dataset.groupId;
                this.archiveGroup(groupId);
            }
        });

        // Start AI chat
        const aiChatBtn = document.getElementById('start-ai-chat');
        if (aiChatBtn) {
            aiChatBtn.addEventListener('click', () => this.startAIChat());
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update active tab UI
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Load groups for this tab
        this.loadTabGroups(tab);
    }

    async loadTabGroups(tab) {
        try {
            this.showLoading();
            let groups;
            
            switch (tab) {
                case 'my-groups':
                    groups = await groupService.getUserGroups();
                    break;
                case 'all-groups':
                    groups = await groupService.getAllGroups();
                    break;
                case 'pending-requests':
                    groups = await groupService.getPendingRequests();
                    break;
                default:
                    groups = [];
            }
            
            this.groups = groups;
            this.renderGroups();
        } catch (error) {
            console.error(`Error loading ${tab} groups:`, error);
            showNotification('Không thể tải dữ liệu', 'error');
        } finally {
            this.hideLoading();
        }
    }

    handleFilterChange(filterId, value) {
        switch (filterId) {
            case 'project-type-filter':
                this.filters.projectType = value;
                break;
            case 'semester-filter':
                this.filters.semester = value;
                break;
            case 'status-filter':
                this.filters.status = value;
                break;
        }
        
        this.renderGroups();
    }

    viewGroupDetail(groupId) {
        // Navigate to group detail page
        window.location.href = `group-detail.html?id=${groupId}`;
    }

    async archiveGroup(groupId) {
        if (!confirm('Bạn có chắc chắn muốn lưu trữ nhóm này?')) {
            return;
        }

        try {
            await groupService.archiveGroup(groupId);
            showNotification('Đã lưu trữ nhóm', 'success');
            this.loadGroups(); // Reload groups
        } catch (error) {
            console.error('Error archiving group:', error);
            showNotification('Không thể lưu trữ nhóm', 'error');
        }
    }

    setupModal() {
        this.modal = new Modal('create-group-modal');
        
        // Form submission
        const form = document.getElementById('create-group-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleCreateGroup(e));
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-create');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.modal.close());
        }

        // Close button
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.modal.close());
        }
    }

    openCreateModal() {
        this.modal.open();
    }

    async handleCreateGroup(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('group-name').value,
            code: document.getElementById('group-code').value,
            description: document.getElementById('group-description').value,
            projectType: document.getElementById('group-project-type').value,
            maxMembers: parseInt(document.getElementById('group-max-members').value)
        };

        // Validate form
        if (!this.validateGroupForm(formData)) {
            return;
        }

        try {
            const newGroup = await groupService.createGroup(formData);
            showNotification('Đã tạo nhóm thành công', 'success');
            this.modal.close();
            this.loadGroups(); // Reload groups
        } catch (error) {
            console.error('Error creating group:', error);
            showNotification('Không thể tạo nhóm', 'error');
        }
    }

    validateGroupForm(data) {
        if (!data.name.trim()) {
            showNotification('Vui lòng nhập tên nhóm', 'warning');
            return false;
        }

        if (!data.code.trim()) {
            showNotification('Vui lòng nhập mã nhóm', 'warning');
            return false;
        }

        if (!data.projectType) {
            showNotification('Vui lòng chọn loại đồ án', 'warning');
            return false;
        }

        // Validate code format (optional)
        const codeRegex = /^[A-Z0-9_]+$/;
        if (!codeRegex.test(data.code)) {
            showNotification('Mã nhóm chỉ chứa chữ in hoa, số và dấu gạch dưới', 'warning');
            return false;
        }

        return true;
    }

    setupAIWidget() {
        const widget = document.getElementById('ai-assistant');
        
        // Toggle popup on mobile
        if (window.innerWidth < 768) {
            const aiBtn = widget.querySelector('.ai-widget-btn');
            aiBtn.addEventListener('click', () => {
                widget.classList.toggle('active');
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!widget.contains(e.target)) {
                    widget.classList.remove('active');
                }
            });
        }
    }

    startAIChat() {
        // Navigate to AI chat page with group context
        window.location.href = '../ai/ai-chat.html?context=group_assistant';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GroupsPage();
});

export { GroupsPage };