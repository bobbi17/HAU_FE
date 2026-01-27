import { API_ENDPOINTS } from '../config/api-config.js';
import { FORUM_CONSTANTS } from '../config/constants.js';
import { isAuthenticated, getCurrentUser } from '../utils/auth.js';
import { formatDate } from '../utils/date-format.js';
import ForumService from '../services/forum-service.js';

class ForumTopic {
    constructor() {
        this.topicId = this.getTopicIdFromURL();
        this.forumService = new ForumService();
        this.comments = [];
        this.currentUser = getCurrentUser();
        
        this.init();
    }
    
    init() {
        this.loadTopic();
        this.loadComments();
        this.setupEventListeners();
        this.checkModeratorStatus();
    }
    
    getTopicIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || '1'; // Default for demo
    }
    
    async loadTopic() {
        try {
            const topic = await this.forumService.getTopicById(this.topicId);
            this.renderTopic(topic);
        } catch (error) {
            console.error('Error loading topic:', error);
            this.showError('Không thể tải bài viết');
        }
    }
    
    async loadComments() {
        try {
            this.comments = await this.forumService.getCommentsByTopicId(this.topicId);
            this.renderComments();
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }
    
    renderTopic(topic) {
        // Render breadcrumbs
        this.renderBreadcrumbs(topic);
        
        // Render topic header
        const headerHTML = `
            <h1>${topic.title}</h1>
            <div class="topic-meta">
                <div class="author-info">
                    <div class="author-avatar" 
                         style="background-image: url('${topic.author.avatar}')"></div>
                    <div>
                        <div class="author-name">${topic.author.name}</div>
                        <div class="author-details">
                            Đăng ngày ${formatDate(topic.createdAt)} • Chuyên mục: ${topic.category}
                        </div>
                    </div>
                </div>
                <div class="view-count">
                    <span class="material-symbols-outlined">visibility</span>
                    <span>${topic.viewCount.toLocaleString()} lượt xem</span>
                </div>
            </div>
        `;
        document.querySelector('.topic-header').innerHTML = headerHTML;
        
        // Render main post
        const postHTML = `
            <div class="prose">
                ${topic.content}
                <div class="post-actions">
                    <div class="left-actions">
                        <button class="btn-like" data-id="${topic.id}">
                            <span class="material-symbols-outlined">thumb_up</span>
                            <span>Thích (${topic.likes})</span>
                        </button>
                        <button class="btn-share">
                            <span class="material-symbols-outlined">share</span>
                            <span>Chia sẻ</span>
                        </button>
                    </div>
                    <button class="btn-report">
                        <span class="material-symbols-outlined">report</span>
                        Báo cáo vi phạm
                    </button>
                </div>
            </div>
        `;
        document.querySelector('.main-post').innerHTML = postHTML;
    }
    
    renderBreadcrumbs(topic) {
        const breadcrumbsHTML = `
            <a href="/">
                <span class="material-symbols-outlined">home</span>
                Trang chủ
            </a>
            <span>/</span>
            <a href="/pages/forum/forum-home.html">Diễn đàn</a>
            <span>/</span>
            <span class="current">${topic.category}</span>
        `;
        document.querySelector('.breadcrumbs').innerHTML = breadcrumbsHTML;
    }
    
    renderComments() {
        const container = document.getElementById('comments-container');
        const countElement = document.querySelector('.comment-count');
        
        if (this.comments.length === 0) {
            container.innerHTML = `
                <div class="no-comments text-center py-8 text-gray-500">
                    <span class="material-symbols-outlined text-4xl mb-2">chat</span>
                    <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
            `;
            countElement.textContent = '0';
            return;
        }
        
        countElement.textContent = this.comments.length;
        
        let commentsHTML = '';
        this.comments.forEach(comment => {
            commentsHTML += this.renderComment(comment);
        });
        
        container.innerHTML = commentsHTML;
    }
    
    renderComment(comment, isNested = false) {
        const nestedClass = isNested ? 'comment-thread' : '';
        const commentClass = isNested ? 'nested-comment' : 'comment-item';
        
        let repliesHTML = '';
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(reply => {
                repliesHTML += this.renderComment(reply, true);
            });
        }
        
        return `
            <div class="${nestedClass}">
                <div class="${commentClass}">
                    <div class="comment-content">
                        <div class="comment-avatar" 
                             style="background-image: url('${comment.author.avatar}')"></div>
                        <div class="comment-body">
                            <div class="comment-meta">
                                <span class="comment-author">${comment.author.name}</span>
                                <span class="comment-time">${formatDate(comment.createdAt, true)}</span>
                            </div>
                            <div class="comment-text">
                                ${comment.content}
                            </div>
                            <div class="comment-actions">
                                <button class="btn-comment-like" data-id="${comment.id}">
                                    <span class="material-symbols-outlined">thumb_up</span>
                                    ${comment.likes}
                                </button>
                                <button class="btn-reply" data-id="${comment.id}">
                                    Trả lời
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ${repliesHTML}
            </div>
        `;
    }
    
    setupEventListeners() {
        // Like button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-like')) {
                this.handleLikeTopic();
            }
            
            if (e.target.closest('.btn-comment-like')) {
                const commentId = e.target.closest('.btn-comment-like').dataset.id;
                this.handleLikeComment(commentId);
            }
            
            if (e.target.closest('.btn-reply')) {
                const commentId = e.target.closest('.btn-reply').dataset.id;
                this.handleReply(commentId);
            }
        });
        
        // Submit comment
        const submitBtn = document.getElementById('submit-comment');
        const commentInput = document.getElementById('comment-input');
        
        submitBtn.addEventListener('click', () => this.handleSubmitComment());
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleSubmitComment();
            }
        });
        
        // Report
        document.querySelector('.btn-report')?.addEventListener('click', () => {
            this.handleReport();
        });
        
        // Share
        document.querySelector('.btn-share')?.addEventListener('click', () => {
            this.handleShare();
        });
        
        // Moderator actions
        document.querySelectorAll('.btn-toolbar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleModeratorAction(action);
            });
        });
    }
    
    checkModeratorStatus() {
        if (this.currentUser?.role === 'moderator' || this.currentUser?.role === 'admin') {
            document.querySelector('.moderator-toolbar').classList.add('moderator-active');
        }
    }
    
    async handleLikeTopic() {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        try {
            await this.forumService.likeTopic(this.topicId);
            // Update UI
            const likeBtn = document.querySelector('.btn-like');
            const countSpan = likeBtn.querySelector('span:nth-child(2)');
            const currentCount = parseInt(countSpan.textContent.match(/\d+/)[0]);
            countSpan.textContent = `Thích (${currentCount + 1})`;
        } catch (error) {
            console.error('Error liking topic:', error);
        }
    }
    
    async handleLikeComment(commentId) {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        try {
            await this.forumService.likeComment(commentId);
            // Update UI
            const likeBtn = document.querySelector(`.btn-comment-like[data-id="${commentId}"]`);
            const currentCount = parseInt(likeBtn.textContent.trim());
            likeBtn.innerHTML = `<span class="material-symbols-outlined">thumb_up</span> ${currentCount + 1}`;
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    }
    
    async handleSubmitComment() {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        const commentInput = document.getElementById('comment-input');
        const content = commentInput.value.trim();
        
        if (!content) {
            this.showError('Vui lòng nhập nội dung bình luận');
            return;
        }
        
        try {
            const newComment = await this.forumService.addComment({
                topicId: this.topicId,
                content: content,
                authorId: this.currentUser.id
            });
            
            // Add to comments array
            this.comments.unshift(newComment);
            
            // Re-render comments
            this.renderComments();
            
            // Clear input
            commentInput.value = '';
            
            // Show success message
            this.showSuccess('Bình luận đã được đăng thành công!');
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showError('Không thể đăng bình luận. Vui lòng thử lại.');
        }
    }
    
    handleReply(commentId) {
        if (!isAuthenticated()) {
            this.showAuthRequired();
            return;
        }
        
        const commentInput = document.getElementById('comment-input');
        commentInput.value = `@${commentId} `;
        commentInput.focus();
    }
    
    handleReport() {
        const reason = prompt('Vui lòng nhập lý do báo cáo:');
        if (reason) {
            this.forumService.reportContent(this.topicId, reason)
                .then(() => {
                    this.showSuccess('Đã gửi báo cáo thành công!');
                })
                .catch(error => {
                    console.error('Error reporting:', error);
                    this.showError('Không thể gửi báo cáo');
                });
        }
    }
    
    handleShare() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: 'Chia sẻ bài viết từ HauHub',
                url: window.location.href,
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(window.location.href);
            this.showSuccess('Đã sao chép liên kết vào clipboard!');
        }
    }
    
    async handleModeratorAction(action) {
        if (!this.currentUser?.role.includes('moderator')) {
            return;
        }
        
        try {
            switch (action) {
                case 'pin':
                    await this.forumService.pinTopic(this.topicId);
                    this.showSuccess('Đã ghim bài viết');
                    break;
                case 'lock':
                    await this.forumService.lockTopic(this.topicId);
                    this.showSuccess('Đã khóa bài viết');
                    // Disable comment input
                    document.getElementById('comment-input').disabled = true;
                    document.getElementById('submit-comment').disabled = true;
                    break;
            }
        } catch (error) {
            console.error('Error performing moderator action:', error);
            this.showError('Không thể thực hiện thao tác');
        }
    }
    
    showAuthRequired() {
        const confirmLogin = confirm('Bạn cần đăng nhập để thực hiện chức năng này. Đến trang đăng nhập?');
        if (confirmLogin) {
            window.location.href = '/pages/auth/login.html';
        }
    }
    
    showSuccess(message) {
        // You can integrate with notification component here
        alert(message); // Temporary
    }
    
    showError(message) {
        alert(message); // Temporary
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ForumTopic();
});