import { 
    getGroupById,
    getGroupMembers,
    addGroupMember,
    removeGroupMember,
    updateMemberRole,
    getGroupDocuments,
    getUpcomingMeetings,
    joinMeeting 
} from '../services/group-service.js';
import { showModal, closeModal } from '../components/modal.js';
import { showNotification } from '../components/notification.js';

class GroupDetail {
    constructor() {
        this.groupId = this.getGroupIdFromURL();
        this.currentTab = 'members';
        this.groupData = null;
        this.members = [];
        this.documents = [];
        this.meetings = [];
        
        this.init();
    }

    getGroupIdFromURL() {
        // Extract group ID from URL
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || '1'; // Default to group 1 for demo
    }

    async init() {
        await this.loadGroupData();
        await this.loadMembers();
        await this.loadDocuments();
        await this.loadMeetings();
        this.setupEventListeners();
        this.setupTabNavigation();
    }

    async loadGroupData() {
        try {
            const response = await getGroupById(this.groupId);
            this.groupData = response.data;
            this.updateGroupUI();
        } catch (error) {
            showNotification('Không thể tải thông tin nhóm', 'error');
            console.error('Error loading group data:', error);
        }
    }

    async loadMembers() {
        try {
            const response = await getGroupMembers(this.groupId);
            this.members = response.data;
            this.renderMembers();
        } catch (error) {
            showNotification('Không thể tải danh sách thành viên', 'error');
            console.error('Error loading members:', error);
        }
    }

    async loadDocuments() {
        try {
            const response = await getGroupDocuments(this.groupId);
            this.documents = response.data;
            // Documents are rendered in a separate tab
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    }

    async loadMeetings() {
        try {
            const response = await getUpcomingMeetings(this.groupId);
            this.meetings = response.data;
            this.updateMeetingBanner();
        } catch (error) {
            console.error('Error loading meetings:', error);
        }
    }

    updateGroupUI() {
        if (!this.groupData) return;

        // Update group name and info
        const groupNameElement = document.querySelector('.group-name');
        if (groupNameElement) {
            groupNameElement.textContent = this.groupData.name;
        }

        // Update status badge
        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.textContent = this.groupData.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động';
            statusBadge.className = `status-badge ${this.groupData.status}`;
        }

        // Update group code
        const groupCodeElement = document.querySelector('.meta-value.code');
        if (groupCodeElement) {
            groupCodeElement.textContent = this.groupData.code;
        }

        // Update description
        const descriptionElement = document.querySelector('.group-description');
        if (descriptionElement) {
            descriptionElement.textContent = this.groupData.description;
        }
    }

    renderMembers() {
        const membersList = document.getElementById('members-list');
        if (!membersList) return;

        if (this.members.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">group_off</span>
                    <p class="text-slate-500">Nhóm chưa có thành viên nào</p>
                </div>
            `;
            return;
        }

        membersList.innerHTML = this.members.map(member => this.createMemberCard(member)).join('');
        this.attachMemberEventListeners();
    }

    createMemberCard(member) {
        const isLeader = member.role === 'leader';
        const cardClass = isLeader ? 'member-card leader' : 'member-card';
        
        // Get initials for avatar placeholder
        const initials = member.name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        return `
            <div class="${cardClass}" data-member-id="${member.id}">
                <div class="member-header">
                    ${member.avatar ? `
                    <div class="member-avatar">
                        <img src="${member.avatar}" alt="${member.name}">
                    </div>
                    ` : `
                    <div class="member-avatar">
                        <div class="avatar-placeholder">${initials}</div>
                    </div>
                    `}
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-id">ID: ${member.studentId}</div>
                        <div class="member-role">${this.getRoleText(member.role)}</div>
                    </div>
                </div>
                <div class="member-contact">
                    ${member.email ? `
                    <div class="contact-item">
                        <span class="material-symbols-outlined">mail</span>
                        <span>${member.email}</span>
                    </div>
                    ` : ''}
                    ${member.phone ? `
                    <div class="contact-item">
                        <span class="material-symbols-outlined">call</span>
                        <span>${member.phone}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="member-skills">
                    ${member.skills && member.skills.length > 0 
                        ? member.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
                        : '<span class="text-gray-400 text-sm">Chưa cập nhật kỹ năng</span>'
                    }
                </div>
            </div>
        `;
    }

    getRoleText(role) {
        const roleTexts = {
            'leader': 'Trưởng nhóm',
            'member': 'Thành viên',
            'secretary': 'Thư ký',
            'treasurer': 'Thủ quỹ'
        };
        return roleTexts[role] || 'Thành viên';
    }

    updateMeetingBanner() {
        if (this.meetings.length === 0) {
            const banner = document.querySelector('.meeting-banner');
            if (banner) {
                banner.style.display = 'none';
            }
            return;
        }

        const nextMeeting = this.meetings[0]; // Get the next meeting
        const banner = document.querySelector('.meeting-banner');
        
        if (banner) {
            const meetingDate = new Date(nextMeeting.date);
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            const dayOfWeek = dayNames[meetingDate.getDay()];
            const dayNumber = meetingDate.getDate();
            
            // Update banner content
            const dateElement = banner.querySelector('.date-day');
            const numberElement = banner.querySelector('.date-number');
            const titleElement = banner.querySelector('.meeting-title');
            const detailsElement = banner.querySelector('.meeting-details');
            const descriptionElement = banner.querySelector('.meeting-description');
            const joinButton = banner.querySelector('.join-meeting-btn');
            
            if (dateElement) dateElement.textContent = dayOfWeek;
            if (numberElement) numberElement.textContent = dayNumber;
            if (titleElement) titleElement.textContent = nextMeeting.title;
            if (descriptionElement) descriptionElement.textContent = nextMeeting.description;
            
            // Update join button
            if (joinButton) {
                joinButton.dataset.meetingId = nextMeeting.id;
            }
            
            // Update details
            if (detailsElement) {
                detailsElement.innerHTML = `
                    <span class="detail-item">
                        <span class="material-symbols-outlined">schedule</span>
                        ${nextMeeting.time}
                    </span>
                    <span class="detail-item">
                        <span class="material-symbols-outlined">${nextMeeting.isOnline ? 'video_camera_front' : 'location_on'}</span>
                        ${nextMeeting.isOnline ? 'Trực tuyến' : nextMeeting.location}
                    </span>
                `;
            }
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                this.switchTab(tabId, button);
            });
        });
    }

    switchTab(tabId, activeButton) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
        
        // Update active tab pane
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const targetPane = document.getElementById(`${tabId}-tab`);
        if (targetPane) {
            targetPane.classList.add('active');
            this.loadTabContent(tabId);
        }
    }

    async loadTabContent(tabId) {
        switch (tabId) {
            case 'documents':
                await this.loadDocumentsTab();
                break;
            case 'chat':
                await this.loadChatTab();
                break;
            case 'schedule':
                await this.loadScheduleTab();
                break;
            case 'tasks':
                await this.loadTasksTab();
                break;
        }
    }

    async loadDocumentsTab() {
        const tabPane = document.getElementById('documents-tab');
        if (!tabPane) return;
        
        try {
            const response = await getGroupDocuments(this.groupId);
            const documents = response.data;
            
            tabPane.innerHTML = `
                <div class="tab-header">
                    <h2 class="tab-title">Tài liệu nhóm</h2>
                    <button class="btn-primary" id="upload-document-btn">
                        <span class="material-symbols-outlined">upload</span>
                        Tải lên tài liệu
                    </button>
                </div>
                
                <div class="documents-list" id="documents-list">
                    ${documents.length > 0 
                        ? this.createDocumentsList(documents)
                        : this.createEmptyState('Tài liệu', 'folder_open', 'Nhóm chưa có tài liệu nào')
                    }
                </div>
            `;
            
            // Attach event listeners for the new buttons
            this.attachDocumentsTabListeners();
        } catch (error) {
            tabPane.innerHTML = this.createErrorState('Không thể tải danh sách tài liệu');
        }
    }

    createDocumentsList(documents) {
        return `
            <div class="documents-table">
                <div class="table-header">
                    <div class="table-cell">Tên tài liệu</div>
                    <div class="table-cell">Loại</div>
                    <div class="table-cell">Kích thước</div>
                    <div class="table-cell">Người tải lên</div>
                    <div class="table-cell">Ngày tải</div>
                    <div class="table-cell">Hành động</div>
                </div>
                ${documents.map(doc => this.createDocumentRow(doc)).join('')}
            </div>
        `;
    }

    createDocumentRow(document) {
        const fileType = document.name.split('.').pop().toLowerCase();
        const fileIcon = this.getFileIcon(fileType);
        
        return `
            <div class="table-row">
                <div class="table-cell">
                    <div class="document-name">
                        <span class="material-symbols-outlined document-icon">${fileIcon}</span>
                        ${document.name}
                    </div>
                </div>
                <div class="table-cell">
                    <span class="file-type">${fileType.toUpperCase()}</span>
                </div>
                <div class="table-cell">
                    <span class="file-size">${document.size}</span>
                </div>
                <div class="table-cell">
                    <span class="uploader">${document.uploadedBy}</span>
                </div>
                <div class="table-cell">
                    <span class="upload-date">${this.formatDate(document.uploadedAt)}</span>
                </div>
                <div class="table-cell">
                    <div class="document-actions">
                        <button class="action-btn preview" data-document-id="${document.id}">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="action-btn download" data-document-id="${document.id}">
                            <span class="material-symbols-outlined">download</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getFileIcon(fileType) {
        const iconMap = {
            'pdf': 'picture_as_pdf',
            'doc': 'description',
            'docx': 'description',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'dwg': 'architecture',
            'skp': 'design_services',
            'max': 'view_in_ar',
            'zip': 'folder_zip',
            'rar': 'folder_zip'
        };
        return iconMap[fileType] || 'insert_drive_file';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    createEmptyState(title, icon, message) {
        return `
            <div class="empty-state">
                <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">${icon}</span>
                <h3 class="text-lg font-semibold text-slate-700 mb-1">Không có ${title}</h3>
                <p class="text-slate-500">${message}</p>
            </div>
        `;
    }

    createErrorState(message) {
        return `
            <div class="error-state">
                <span class="material-symbols-outlined text-4xl text-red-300 mb-2">error</span>
                <p class="text-red-600">${message}</p>
            </div>
        `;
    }

    async loadChatTab() {
        const tabPane = document.getElementById('chat-tab');
        if (!tabPane) return;
        
        tabPane.innerHTML = `
            <div class="tab-header">
                <h2 class="tab-title">Tin nhắn nhóm</h2>
            </div>
            
            <div class="chat-container">
                <div class="chat-sidebar">
                    <div class="chat-search">
                        <span class="material-symbols-outlined">search</span>
                        <input type="text" placeholder="Tìm kiếm tin nhắn...">
                    </div>
                    <div class="chat-members">
                        <h4 class="sidebar-title">Thành viên trực tuyến</h4>
                        <!-- Online members will be listed here -->
                    </div>
                </div>
                
                <div class="chat-main">
                    <div class="chat-messages" id="chat-messages">
                        <!-- Messages will be loaded here -->
                    </div>
                    
                    <div class="chat-input">
                        <input type="text" placeholder="Nhập tin nhắn..." id="message-input">
                        <button class="send-btn" id="send-message-btn">
                            <span class="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadScheduleTab() {
        const tabPane = document.getElementById('schedule-tab');
        if (!tabPane) return;
        
        tabPane.innerHTML = `
            <div class="tab-header">
                <h2 class="tab-title">Lịch họp nhóm</h2>
                <button class="btn-primary" id="add-meeting-btn">
                    <span class="material-symbols-outlined">add</span>
                    Tạo lịch họp
                </button>
            </div>
            
            <div class="schedule-container">
                <div class="calendar-view" id="calendar-view">
                    <!-- Calendar will be rendered here -->
                </div>
                
                <div class="meetings-list" id="meetings-list">
                    <!-- Meetings list will be loaded here -->
                </div>
            </div>
        `;
    }

    async loadTasksTab() {
        const tabPane = document.getElementById('tasks-tab');
        if (!tabPane) return;
        
        tabPane.innerHTML = `
            <div class="tab-header">
                <h2 class="tab-title">Công việc nhóm</h2>
                <button class="btn-primary" id="add-task-btn">
                    <span class="material-symbols-outlined">add</span>
                    Thêm công việc
                </button>
            </div>
            
            <div class="tasks-container">
                <div class="tasks-board">
                    <div class="task-column" data-status="todo">
                        <h3 class="column-title">Cần làm</h3>
                        <div class="task-list" id="todo-tasks">
                            <!-- To-do tasks will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="task-column" data-status="in-progress">
                        <h3 class="column-title">Đang thực hiện</h3>
                        <div class="task-list" id="in-progress-tasks">
                            <!-- In-progress tasks will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="task-column" data-status="review">
                        <h3 class="column-title">Chờ duyệt</h3>
                        <div class="task-list" id="review-tasks">
                            <!-- Review tasks will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="task-column" data-status="completed">
                        <h3 class="column-title">Hoàn thành</h3>
                        <div class="task-list" id="completed-tasks">
                            <!-- Completed tasks will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async handleAddMember() {
        showModal('add-member-modal');
    }

    async handleShareGroup() {
        const shareUrl = `${window.location.origin}/pages/groups/group-detail.html?id=${this.groupId}`;
        
        // Create a temporary input to copy the URL
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        showNotification('Đã sao chép liên kết chia sẻ vào clipboard', 'success');
    }

    async handleEditGroup() {
        showNotification('Tính năng chỉnh sửa nhóm đang được phát triển', 'info');
    }

    async handleJoinMeeting(meetingId) {
        try {
            const meeting = await joinMeeting(meetingId);
            
            if (meeting.isOnline) {
                // Open meeting link in new tab
                window.open(meeting.link, '_blank');
            } else {
                showNotification(`Cuộc họp sẽ diễn ra tại: ${meeting.location}`, 'info');
            }
        } catch (error) {
            showNotification('Không thể tham gia cuộc họp', 'error');
        }
    }

    async handleDownloadDocument(documentId) {
        try {
            showNotification('Đang tải xuống tài liệu...', 'info');
            // In a real app, this would trigger a file download
            setTimeout(() => {
                showNotification('Đã bắt đầu tải xuống', 'success');
            }, 1000);
        } catch (error) {
            showNotification('Không thể tải xuống tài liệu', 'error');
        }
    }

    attachMemberEventListeners() {
        // In a real app, you would add event listeners for member cards
    }

    attachDocumentsTabListeners() {
        // In a real app, you would add event listeners for document actions
    }

    setupEventListeners() {
        // Add member button
        document.getElementById('add-member-btn')?.addEventListener('click', () => this.handleAddMember());
        
        // Share group button
        document.getElementById('share-group-btn')?.addEventListener('click', () => this.handleShareGroup());
        
        // Edit group button
        document.getElementById('edit-group-btn')?.addEventListener('click', () => this.handleEditGroup());
        
        // Join meeting button
        document.querySelector('.join-meeting-btn')?.addEventListener('click', (e) => {
            const meetingId = e.currentTarget.dataset.meetingId;
            if (meetingId) {
                this.handleJoinMeeting(meetingId);
            }
        });
        
        // Download document buttons
        document.querySelectorAll('.document-action.download').forEach(button => {
            button.addEventListener('click', (e) => {
                const documentId = e.currentTarget.dataset.documentId;
                if (documentId) {
                    this.handleDownloadDocument(documentId);
                }
            });
        });
        
        // Close modal button
        document.getElementById('close-member-modal')?.addEventListener('click', () => {
            closeModal('add-member-modal');
        });
        
        // Cancel add member button
        document.getElementById('cancel-add-member')?.addEventListener('click', () => {
            closeModal('add-member-modal');
        });
        
        // Add member form submission
        document.getElementById('add-member-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Handle member addition logic
            showNotification('Đã thêm thành viên vào nhóm', 'success');
            closeModal('add-member-modal');
            await this.loadMembers();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const groupDetail = new GroupDetail();
});

export default GroupDetail;