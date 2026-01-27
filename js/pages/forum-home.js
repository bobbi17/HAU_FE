/**
 * Forum Home Page JavaScript
 * Handles forum homepage interactions
 */

class ForumHome {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadForumData();
        this.setupSearch();
        this.initializeUserAvatar();
    }

    bindEvents() {
        // Category card clicks
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('a')) {
                    const categoryId = card.dataset.categoryId || 'all';
                    this.navigateToCategory(categoryId);
                }
            });
        });

        // Create topic button
        const createTopicBtn = document.querySelector('.create-topic-btn');
        if (createTopicBtn) {
            createTopicBtn.addEventListener('click', () => {
                this.handleCreateTopic();
            });
        }

        // Post item clicks
        document.querySelectorAll('.post-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const postId = item.dataset.postId;
                if (postId) {
                    this.navigateToPost(postId);
                }
            });
        });

        // View all link
        const viewAllLink = document.querySelector('.view-all-link');
        if (viewAllLink) {
            viewAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllCategories();
            });
        }
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });

            // Add search icon click handler
            const searchIcon = document.querySelector('.search-icon');
            if (searchIcon) {
                searchIcon.addEventListener('click', () => {
                    this.performSearch(searchInput.value);
                });
            }
        }
    }

    async loadForumData() {
        try {
            // Load trending posts
            await this.loadTrendingPosts();
            
            // Load active members
            await this.loadActiveMembers();
            
            // Update category stats
            await this.updateCategoryStats();
            
            // Check user authentication
            this.checkAuthStatus();
        } catch (error) {
            console.error('Error loading forum data:', error);
            this.showError('Không thể tải dữ liệu diễn đàn');
        }
    }

    async loadTrendingPosts() {
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        const mockPosts = [
            {
                id: 1,
                title: '[Đồ án] Tổng hợp mặt bằng chung cư cao cấp K62',
                author: 'KTS. Minh Tuấn',
                time: '2 giờ trước',
                category: 'Kiến trúc'
            },
            {
                id: 2,
                title: 'Kinh nghiệm thực tập tại văn phòng kiến trúc quốc tế',
                author: 'Trang Lê',
                time: '5 giờ trước',
                category: 'Kinh nghiệm'
            },
            {
                id: 3,
                title: 'Thảo luận: SketchUp vs Revit trong thiết kế ý tưởng?',
                author: 'Hùng Nguyễn',
                time: '8 giờ trước',
                category: 'Công cụ'
            }
        ];

        // Update trending posts UI
        const trendingContainer = document.querySelector('.card-content');
        if (trendingContainer) {
            // We'll keep static content for now
            // In production, you'd update the DOM with fetched data
        }
    }

    async loadActiveMembers() {
        // Mock active members data
        const mockMembers = [
            { id: 1, name: 'Nguyễn Văn A', avatar: '../../assets/images/avatars/member1.jpg' },
            { id: 2, name: 'Trần Thị B', avatar: '../../assets/images/avatars/member2.jpg' },
            { id: 3, name: 'Lê Văn C', avatar: '../../assets/images/avatars/member3.jpg' },
            { id: 4, name: 'Phạm Thị D', avatar: '../../assets/images/avatars/member4.jpg' }
        ];

        // Update active members UI
        const membersContainer = document.querySelector('.active-members');
        if (membersContainer) {
            // Static for now, update in production
        }
    }

    async updateCategoryStats() {
        // In production, fetch latest stats for each category
        const categories = document.querySelectorAll('.category-card');
        
        categories.forEach(async (category, index) => {
            // Simulate API call delay
            setTimeout(() => {
                // Update with mock data
                const stats = category.querySelectorAll('.stat-number');
                if (stats.length >= 2) {
                    // Just for demo - in real app, use actual data
                    const randomPosts = Math.floor(Math.random() * 100) + 900;
                    const randomThreads = Math.floor(Math.random() * 50) + 400;
                    
                    stats[0].textContent = randomThreads.toLocaleString();
                    stats[1].textContent = randomPosts.toLocaleString();
                }
            }, index * 300);
        });
    }

    navigateToCategory(categoryId) {
        // In production, navigate to category page
        console.log(`Navigating to category: ${categoryId}`);
        // window.location.href = `category-detail.html?id=${categoryId}`;
        
        // For demo, show alert
        const categoryName = this.getCategoryName(categoryId);
        this.showNotification(`Đang chuyển đến chuyên mục: ${categoryName}`);
    }

    navigateToPost(postId) {
        console.log(`Navigating to post: ${postId}`);
        // window.location.href = `topic-detail.html?id=${postId}`;
    }

    handleCreateTopic() {
        const isLoggedIn = this.checkAuthStatus();
        
        if (!isLoggedIn) {
            this.showLoginModal();
            return;
        }
        
        // Navigate to create topic page
        // window.location.href = 'create-topic.html';
        this.showNotification('Chức năng tạo chủ đề đang được phát triển');
    }

    performSearch(query) {
        if (!query.trim()) {
            this.showError('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }
        
        console.log(`Searching for: ${query}`);
        // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        this.showNotification(`Đang tìm kiếm: ${query}`);
    }

    showAllCategories() {
        // Navigate to categories page
        // window.location.href = 'categories.html';
        this.showNotification('Đang tải tất cả chuyên mục...');
    }

    checkAuthStatus() {
        // Check if user is logged in
        // This is a mock - in production, use actual auth check
        const userAvatar = document.querySelector('.user-avatar img');
        const isLoggedIn = userAvatar && userAvatar.src.includes('user-avatar.jpg');
        
        const loginButton = document.querySelector('.login-button');
        if (loginButton && !isLoggedIn) {
            loginButton.textContent = 'Đăng nhập';
            loginButton.onclick = () => this.showLoginModal();
        } else if (loginButton) {
            loginButton.textContent = 'Hồ sơ';
            loginButton.onclick = () => this.navigateToProfile();
        }
        
        return isLoggedIn;
    }

    initializeUserAvatar() {
        const avatar = document.querySelector('.user-avatar');
        if (avatar) {
            avatar.addEventListener('click', () => {
                this.toggleUserMenu();
            });
        }
    }

    toggleUserMenu() {
        // Show/hide user dropdown menu
        console.log('Toggle user menu');
        // Implement dropdown menu logic here
    }

    showLoginModal() {
        // Show login modal or redirect to login page
        console.log('Show login modal');
        // window.location.href = '../auth/login.html';
        this.showNotification('Vui lòng đăng nhập để tiếp tục');
    }

    navigateToProfile() {
        // window.location.href = '../user/profile.html';
        console.log('Navigate to profile');
    }

    getCategoryName(categoryId) {
        const categories = {
            'all': 'Toàn trường',
            'architecture': 'Khoa Kiến trúc',
            'planning': 'Khoa Quy hoạch',
            'construction': 'Khoa Xây dựng'
        };
        return categories[categoryId] || 'Chuyên mục';
    }

    showNotification(message, type = 'info') {
        // Use your existing notification system
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Simple alert for demo
        alert(message);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const forumHome = new ForumHome();
    
    // Make it globally available if needed
    window.forumHome = forumHome;
});