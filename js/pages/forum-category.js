import { API_ENDPOINTS } from '../config/api-config.js';
import { FORUM_CONSTANTS } from '../config/constants.js';
import { isAuthenticated, getCurrentUser } from '../utils/auth.js';
import { formatRelativeTime, formatDate } from '../utils/date-format.js';
import { getUrlParams, setUrlParams } from '../utils/url-params.js';
import ForumService from '../services/forum-service.js';
import Modal from '../components/modal.js';
import Notification from '../components/notification.js';

class ForumCategory {
    constructor() {
        this.forumService = new ForumService();
        this.currentUser = getCurrentUser();
        this.categoryId = this.getCategoryId();
        this.currentPage = 1;
        this.currentTag = 'all';
        this.currentSort = 'popular';
        this.tags = [];
        this.topics = [];
        this.stats = {};
        this.filterOptions = {};
        this.isLoading = false;
        this.hasMore = true;
        
        this.init();
    }
    
    init() {
        this.loadCategoryData();
        this.loadTags();
        this.loadTopics();
        this.setupEventListeners();
        this.initModals();
        this.setupURLParams();
    }
    
    getCategoryId() {
        // Lấy từ URL: /forum/category-detail.html?category=architecture
        const params = new URLSearchParams(window.location.search);
        return params.get('category') || 'architecture';
    }
    
    setupURLParams() {
        const params = getUrlParams();
        
        // Khôi phục filter từ URL
        if (params.tag) this.currentTag = params.tag;
        if (params.sort) this.currentSort = params.sort;
        if (params.page) this.currentPage = parseInt(params.page);
        if (params.search) {
            document.getElementById('search-input').value = params.search;
            this.filterOptions.search = params.search;
        }
        
        // Cập nhật UI
        this.updateActiveTags();
        this.updateActiveSort();
    }
    
    async loadCategoryData() {
        try {
            const category = await this.forumService.getCategoryById(this.categoryId);
            this.renderCategoryInfo(category);
            this.loadSubCategories(category.subCategories);
            this.loadOtherDepartments();
        } catch (error) {
            console.error('Error loading category data:', error);
            this.showError('Không thể tải thông tin khoa');
        }
    }
    
    async loadTags() {
        try {
            this.tags = await this.forumService.getCategoryTags(this.categoryId);
            this.renderTags();
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }
    
    async loadTopics() {
        if (this.isLoading || !this.hasMore) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const params = {
                page: this.currentPage,
                limit: 10,
                tag: this.currentTag !== 'all' ? this.currentTag : undefined,
                sort: this.currentSort,
                ...this.filterOptions
            };
            
            const response = await this.forumService.getCategoryTopics(this.categoryId, params);
            
            if (this.currentPage === 1) {
                this.topics = response.topics;
            } else {
                this.topics = [...this.topics, ...response.topics];
            }
            
            this.hasMore = response.hasMore;
            this.stats = response.stats || {};
            
            this.renderTopics();
            this.renderStats();
            
            // Cập nhật URL
            this.updateURLParams();
            
            // Ẩn nút Load More nếu không còn dữ liệu
            if (!this.hasMore) {
                document.getElementById('load-more-section').style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading topics:', error);
            this.showError('Không thể tải danh sách thảo luận');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    renderCategoryInfo(category) {
        // Cập nhật title
        document.title = `${category.name} | Diễn đàn - HauHub`;
        
        // Cập nhật breadcrumb
        const breadcrumbHTML = `
            <a href="/pages/forum/forum-home.html">Diễn đàn</a>
            <span>/</span>
            <span class="current">${category.name}</span>
        `;
        document.getElementById('breadcrumb-nav').innerHTML = breadcrumbHTML;
        
        // Cập nhật tên và mô tả
        document.getElementById('category-name').textContent = category.name;
        document.getElementById('category-description').textContent = category.description;
        
        // Cập nhật background cho từng khoa
        const bannerBg = document.querySelector('.banner-background');
        if (category.backgroundImage) {
            bannerBg.style.backgroundImage = `url('${category.backgroundImage}')`;
        }
        
        // Cập nhật màu sắc chính cho từng khoa
        if (category.color) {
            document.documentElement.style.setProperty('--category-primary', category.color);
        }
    }
    
    renderTags() {
        const container = document.getElementById('tags-list');
        
        if (this.tags.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        let tagsHTML = `
            <span class="tag ${this.currentTag === 'all' ? 'active' : ''}" 
                  data-tag="all">#Tất Cả</span>
        `;
        
        this.tags.forEach(tag => {
            const isActive = this.currentTag === tag.slug;
            tagsHTML += `
                <span class="tag ${isActive ? 'active' : ''}" 
                      data-tag="${tag.slug}">#${tag.name}</span>
            `;
        });
        
        container.innerHTML = tagsHTML;
    }
    
    renderTopics() {
        const container = document.getElementById('topics-container');
        
        if (this.topics.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }
        
        let topicsHTML = '';
        
        // Hiển thị các topic được ghim trước
        const pinnedTopics = this.topics.filter(topic => topic.isPinned);
        const normalTopics = this.topics.filter(topic => !topic.isPinned);
        
        pinnedTopics.forEach(topic => {
            topicsHTML += this.getTopicHTML(topic, true);
        });
        
        normalTopics.forEach(topic => {
            topicsHTML += this.getTopicHTML(topic, false);
        });
        
        container.innerHTML = topicsHTML;
        
        // Thêm event listeners
        this.setupTopicEventListeners();
    }
    
    getTopicHTML(topic, isPinned = false) {
        const categoryLabel = topic.category || 'Chung';
        const timeAgo = formatRelativeTime(topic.createdAt);
        const author = topic.author || { name: 'Ẩn danh', avatar: '' };
        
        let badgesHTML = '';
        if (topic.isPinned) badgesHTML += '<span class="badge pinned">Đã ghim</span>';
        if (topic.isLocked) badgesHTML += '<span class="badge locked">Đã khóa</span>';
        if (topic.isFeatured) badgesHTML += '<span class="badge featured">Nổi bật</span>';
        
        const topicClass = isPinned ? 'topic-item pinned' : 'topic-item';
        
        return `
            <div class="${topicClass} ${topic.isLocked ? 'locked' : ''}" data-id="${topic.id}">
                <div class="topic-avatar">
                    <div class="avatar-image" 
                         style="background-image: url('${author.avatar || '/assets/images/default-avatar.png'}')">
                    </div>
                    ${author.isOnline ? '<div class="online-dot"></div>' : ''}
                </div>
                <div class="topic-content">
                    <div class="topic-meta">
                        <span class="topic-category">${categoryLabel}</span>
                        <span class="topic-author">Đăng bởi • ${author.name}</span>
                        ${badgesHTML}
                    </div>
                    <h3 class="topic-title">${topic.title}</h3>
                    ${topic.excerpt ? `<p class="topic-excerpt">${topic.excerpt}</p>` : ''}
                    <div class="topic-stats">
                        <div class="topic-stat">
                            <span class="material-symbols-outlined">chat_bubble</span>
                            <span>${topic.commentCount || 0} bình luận</span>
                        </div>
                        <div class="topic-stat">
                            <span class="material-symbols-outlined">visibility</span>
                            <span>${topic.viewCount?.toLocaleString() || 0} lượt xem</span>
                        </div>
                        <div class="topic-stat">
                            <span class="material-symbols-outlined">schedule</span>
                            <span>${timeAgo}</span>
                        </div>
                        ${topic.lastActivity ? `
                            <div class="topic-stat">
                                <span class="material-symbols-outlined">update</span>
                                <span>${formatRelativeTime(topic.lastActivity)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="topic-actions">
                    <button class="btn-action" data-action="bookmark" title="Lưu bài viết">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                    <button class="btn-action" data-action="share" title="Chia sẻ">
                        <span class="material-symbols-outlined">share</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <span class="material-symbols-outlined">forum</span>
                </div>
                <h3 class="empty-title">Chưa có thảo luận nào</h3>
                <p class="empty-description">Hãy là người đầu tiên tạo chủ đề thảo luận trong khoa này!</p>
                <button id="create-first-topic" class="btn-create-topic">
                    <span class="material-symbols-outlined">add_circle</span>
                    <span>Tạo chủ đề đầu tiên</span>
                </button>
            </div>
        `;
    }
    
    renderStats() {
        const container = document.getElementById('stats-grid');
        
        const stats = {
            members: this.stats.memberCount || 1240,
            topics: this.stats.topicCount || 3521,
            online: this.stats.onlineCount || 42,
            active: this.stats.activeUsers || 156
        };
        
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-symbols-outlined">groups</span>
                </div>
                <div class="stat-info">
                    <p class="stat-number">${stats.members.toLocaleString()}</p>
                    <p class="stat-label">Thành viên</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-symbols-outlined">forum</span>
                </div>
                <div class="stat-info">
                    <p class="stat-number">${stats.topics.toLocaleString()}</p>
                    <p class="stat-label">Bài thảo luận</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-symbols-outlined">bolt</span>
                </div>
                <div class="stat-info">
                    <p class="stat-number">${stats.online.toLocaleString()}</p>
                    <p class="stat-label">Đang trực tuyến</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <span class="material-symbols-outlined">trending_up</span>
                </div>
                <div class="stat-info">
                    <p class="stat-number">${stats.active.toLocaleString()}</p>
                    <p class="stat-label">Đang hoạt động</p>
                </div>
            </div>
        `;
    }
    
    async loadSubCategories(subCategories) {
        if (!subCategories || subCategories.length === 0) return;
        
        const filterSelect = document.getElementById('filter-category');
        if (!filterSelect) return;
        
        // Xóa options cũ (giữ option đầu tiên)
        while (filterSelect.options.length > 1) {
            filterSelect.remove(1);
        }
        
        // Thêm subcategories
        subCategories.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.slug;
            option.textContent = sub.name;
            filterSelect.appendChild(option);
        });
    }
    
    async loadOtherDepartments() {
        try {
            const departments = await this.forumService.getDepartments();
            this.renderOtherDepartments(departments);
        } catch (error) {
            console.error('Error loading other departments:', error);
            document.getElementById('department-nav-section').style.display = 'none';
        }
    }
    
    renderOtherDepartments(departments) {
        const container = document.getElementById('department-grid');
        if (!container || departments.length === 0) {
            document.getElementById('department-nav-section').style.display = 'none';
            return;
        }
        
        // Lọc bỏ khoa hiện tại
        const otherDepts = departments.filter(dept => dept.slug !== this.categoryId).slice(0, 6);
        
        if (otherDepts.length === 0) {
            document.getElementById('department-nav-section').style.display = 'none';
            return;
        }
        
        let deptsHTML = '';
        otherDepts.forEach(dept => {
            deptsHTML += `
                <div class="department-card" data-slug="${dept.slug}">
                    <div class="department-name">${dept.name}</div>
                    <div class="department-stats">
                        <span>${dept.topicCount?.toLocaleString() || 0} bài</span>
                        <span>${dept.memberCount?.toLocaleString() || 0} thành viên</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = deptsHTML;
        
        // Thêm event listeners
        container.querySelectorAll('.department-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const slug = e.currentTarget.dataset.slug;
                this.navigateToDepartment(slug);
            });
        });
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
        
        // Tags
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tag')) {
                const tag = e.target.closest('.tag').dataset.tag;
                this.handleTagClick(tag);
            }
        });
        
        // Sort options
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sort-option')) {
                const sort = e.target.closest('.sort-option').dataset.sort;
                this.handleSortChange(sort);
            }
        });
        
        // Filter button
        document.getElementById('filter-btn').addEventListener('click', () => {
            this.showFilterModal();
        });
        
        // Create topic button
        document.getElementById('create-topic-btn').addEventListener('click', () => {
            if (!isAuthenticated()) {
                this.showAuthRequired();
                return;
            }
            this.showCreateTopicModal();
        });
        
        // Load more button
        document.getElementById('load-more-btn').addEventListener('click', () => {
            this.handleLoadMore();
        });
        
        // Create first topic button (empty state)
        document.addEventListener('click', (e) => {
            if (e.target.id === 'create-first-topic' || e.target.closest('#create-first-topic')) {
                if (!isAuthenticated()) {
                    this.showAuthRequired();
                    return;
                }
                this.showCreateTopicModal();
            }
        });
    }
    
    setupTopicEventListeners() {
        // Topic click
        document.querySelectorAll('.topic-title').forEach(title => {
            title.addEventListener('click', (e) => {
                const topicId = e.target.closest('.topic-item').dataset.id;
                this.navigateToTopic(topicId);
            });
        });
        
        // Topic actions
        document.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const topicItem = e.target.closest('.topic-item');
                const topicId = topicItem.dataset.id;
                const action = e.currentTarget.dataset.action;
                
                switch (action) {
                    case 'bookmark':
                        this.handleBookmark(topicId);
                        break;
                    case 'share':
                        this.handleShare(topicItem);
                        break;
                }
            });
        });
    }
    
    initModals() {
        // Create topic modal
        this.createTopicModal = new Modal('create-topic-modal', {
            onClose: () => this.resetCreateTopicForm()
        });
        
        // Filter modal
        this.filterModal = new Modal('filter-modal', {
            onClose: () => this.resetFilterForm()
        });
        
        // Setup create topic form
        const createForm = document.getElementById('create-topic-form');
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateTopic(createForm);
        });
        
        // Setup filter form
        const filterForm = document.getElementById('filter-form');
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleApplyFilter(filterForm);
        });
        
        // Cancel buttons
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.closest('#create-topic-modal')) {
                    this.createTopicModal.hide();
                } else if (btn.closest('#filter-modal')) {
                    this.filterModal.hide();
                }
            });
        });
        
        // Reset filter button
        const resetBtn = document.querySelector('.btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.handleResetFilter();
            });
        }
    }
    
    updateActiveTags() {
        document.querySelectorAll('.tag').forEach(tag => {
            if (tag.dataset.tag === this.currentTag) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
    }
    
    updateActiveSort() {
        document.querySelectorAll('.sort-option').forEach(option => {
            if (option.dataset.sort === this.currentSort) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    updateURLParams() {
        const params = {
            category: this.categoryId,
            tag: this.currentTag !== 'all' ? this.currentTag : undefined,
            sort: this.currentSort,
            page: this.currentPage > 1 ? this.currentPage : undefined,
            search: this.filterOptions.search
        };
        
        setUrlParams(params);
    }
    
    handleSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length > 2 || trimmedQuery === '') {
            this.filterOptions.search = trimmedQuery || undefined;
            this.resetAndReloadTopics();
        }
    }
    
    handleTagClick(tag) {
        this.currentTag = tag;
        this.currentPage = 1;
        this.resetAndReloadTopics();
        this.updateActiveTags();
    }
    
    handleSortChange(sort) {
        this.currentSort = sort;
        this.currentPage = 1;
        this.resetAndReloadTopics();
        this.updateActiveSort();
    }
    
    handleLoadMore() {
        if (this.hasMore && !this.isLoading) {
            this.currentPage++;
            this.loadTopics();
        }
    }
    
    resetAndReloadTopics() {
        this.currentPage = 1;
        this.topics = [];
        this.hasMore = true;
        document.getElementById('load-more-section').style.display = 'block';
        this.loadTopics();
    }
    
    showCreateTopicModal() {
        this.createTopicModal.show();
    }
    
    showFilterModal() {
        // Pre-fill form với filter hiện tại
        const form = document.getElementById('filter-form');
        if (this.filterOptions.category) {
            form.querySelector('#filter-category').value = this.filterOptions.category;
        }
        if (this.filterOptions.time) {
            form.querySelector('#filter-time').value = this.filterOptions.time;
        }
        if (this.filterOptions.author) {
            form.querySelector('#filter-author').value = this.filterOptions.author;
        }
        
        this.filterModal.show();
    }
    
    async handleCreateTopic(form) {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        const formData = new FormData(form);
        const topicData = {
            title: formData.get('topic-title'),
            content: formData.get('topic-content'),
            categoryId: this.categoryId,
            tags: formData.get('topic-tags')?.split(',').map(tag => tag.trim()).filter(tag => tag) || []
        };
        
        try {
            const newTopic = await this.forumService.createTopic(topicData);
            this.createTopicModal.hide();
            this.resetCreateTopicForm();
            
            // Hiển thị thông báo
            this.showSuccess('Đã tạo chủ đề thành công!');
            
            // Chuyển đến trang chi tiết
            setTimeout(() => {
                this.navigateToTopic(newTopic.id);
            }, 1500);
        } catch (error) {
            console.error('Error creating topic:', error);
            this.showError('Không thể tạo chủ đề. Vui lòng thử lại.');
        }
    }
    
    async handleApplyFilter(form) {
        const formData = new FormData(form);
        
        this.filterOptions = {
            category: formData.get('filter-category') || undefined,
            time: formData.get('filter-time') || undefined,
            author: formData.get('filter-author') || undefined,
            sort: formData.get('filter-sort') || 'popular'
        };
        
        this.filterModal.hide();
        this.resetAndReloadTopics();
    }
    
    handleResetFilter() {
        this.filterOptions = {};
        this.resetFilterForm();
        this.filterModal.hide();
        this.resetAndReloadTopics();
    }
    
    async handleBookmark(topicId) {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        try {
            await this.forumService.bookmarkTopic(topicId);
            this.showSuccess('Đã lưu bài viết!');
        } catch (error) {
            console.error('Error bookmarking topic:', error);
            this.showError('Không thể lưu bài viết');
        }
    }
    
    handleShare(topicItem) {
        const topicTitle = topicItem.querySelector('.topic-title').textContent;
        const topicUrl = `${window.location.origin}/pages/forum/topic-detail.html?id=${topicItem.dataset.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: topicTitle,
                text: 'Chia sẻ bài viết từ HauHub',
                url: topicUrl,
            });
        } else {
            navigator.clipboard.writeText(topicUrl);
            this.showSuccess('Đã sao chép liên kết vào clipboard!');
        }
    }
    
    navigateToTopic(topicId) {
        window.location.href = `/pages/forum/topic-detail.html?id=${topicId}&category=${this.categoryId}`;
    }
    
    navigateToDepartment(slug) {
        window.location.href = `/pages/forum/category-detail.html?category=${slug}`;
    }
    
    resetCreateTopicForm() {
        document.getElementById('create-topic-form').reset();
    }
    
    resetFilterForm() {
        document.getElementById('filter-form').reset();
    }
    
    showLoading() {
        const container = document.getElementById('topics-container');
        if (this.currentPage === 1) {
            container.innerHTML = `
                <div class="loading-indicator">
                    <span class="material-symbols-outlined animate-spin">refresh</span>
                    <p>Đang tải thảo luận...</p>
                </div>
            `;
        }
    }
    
    hideLoading() {
        // Không cần làm gì, renderTopics sẽ thay thế loading indicator
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

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    new ForumCategory();
});