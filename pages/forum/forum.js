// ============================================
// FORUM.JS - Diễn đàn thảo luận HauHub
// ============================================
// Tác giả: HauHub Team
// Mô tả: Xử lý các chức năng của trang diễn đàn
// Bao gồm: Hiển thị bài viết, Like, Comment, Share, Tạo bài viết mới
// ============================================

// ============================================
// 1. DỮ LIỆU MẪU (SAMPLE DATA)
// ============================================

// Danh sách bài viết mẫu
const samplePosts = [
    {
        id: 1,
        author: "Trần Hoàng Nam",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTj4rF-Zx7oNvvETI0jNp5rIZFAce-SmxCXy4b7XuQ4yz06PvbyCNrZSf2S0QiCN8IUe5eSu15RjDivifa3XRGWGtnIkKchhm4HqgVxi7ckmgWr7YDlBqKMMaSIKoI9CbrkkkgQOpFHXAoAYeUrKKJWs_g66olBO55II8tdCfmeKZ65ch9HC2sFprSfCKetBy37JGuWOumUfgMD_7pM9-ICRp9HY3lhrH2tfZU69zSOy0Ke5HQH4eK0WeP7ptF5-5jdkFV2LvMXS8",
        faculty: "Kiến trúc",
        facultyColor: "primary",
        time: "3 giờ trước",
        year: "Khóa 2019",
        title: "Ứng dụng vật liệu địa phương trong nhà ở xã hội tại vùng cao",
        content: "Bài viết này phân tích cách tận dụng đá hộc và gỗ thông bản địa để giảm chi phí vận chuyển trong xây dựng. Mình đã thử nghiệm mô hình 1:20 cho kết cấu vách ngăn chịu lực, kết quả cho thấy độ ổn định cao hơn dự kiến...",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        imageCount: 4,
        likes: 128,
        comments: 45,
        shares: 12,
        liked: false,
        category: "material",
        date: "2024-01-15T10:30:00"
    },
    {
        id: 2,
        author: "Lê Minh Anh",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhdcEUlQC0AwZ67X3Bm2tRwmOauZJPgcNxaFQ8cInrzccWj_SZb1c-pkTzBAffkQNn1LxbdjBFawPVGPkaaUk28fETT5fIHiMH3yUqJpqh_4LAZA6xM_s_y3ExyStaRJ7d4X9F7rfroeWCwIAtqqrEsmZarYKNTugaw9ZPx8tE2R6Hc8IWuYdxjMRAYTe73O5y0w9MWQIsRvsAeHHLk4mHxY_3zF5E7XiUWmmCYQnmqDGc-oAlCVTwuY8s8ru2GZE_dKODFru_Xzc",
        faculty: "Quy hoạch",
        facultyColor: "green",
        time: "12 giờ trước",
        year: "Khóa 2021",
        title: "Thảo luận: Tầm quan trọng của dải cây xanh cách ly trong quy hoạch đô thị vệ tinh",
        content: "Mọi người nghĩ sao về tỉ lệ 15% diện tích mặt bằng cho cây xanh cách ly tại khu công nghiệp Quang Châu? Mình đang làm đồ án về vấn đề này và cảm thấy con số này chưa thực sự tối ưu cho môi trường vi khí hậu.",
        image: null,
        imageCount: 0,
        likes: 89,
        comments: 56,
        shares: 4,
        liked: false,
        category: "theory",
        date: "2024-01-14T22:15:00"
    },
    {
        id: 3,
        author: "Nguyễn Văn Khải",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGeezOlPeh_B1ieLzqENT-jrXNjhWmumPIZl3nV-bdXRtnWEM_mEMjlclgXbBfFhPapCybML8yXYdbKMWfomvCP-WXIGSgiqIAcAhrczQroYL9nhABKYD0RrHlLJjWGhKt4dF2oMNu5OqnFspOUF6rDvLz49OkKO4SDposGlNeHi7h8lBTKl2ggF0LkXQ3MV5W9Z6W83dEBffmd1wj6stAUAtGAtgJTpCUA9ocuwvI3jej0MkrgJ7QBYd5yFKk0au1JmLMHgrWWNM",
        faculty: "Kiến trúc",
        facultyColor: "primary",
        time: "1 ngày trước",
        year: "Khóa 2018",
        title: "Hướng dẫn chi tiết làm Portfolio kiến trúc cho sinh viên năm cuối",
        content: "Chia sẻ kinh nghiệm làm portfolio từ A-Z: từ cách chọn đồ án, trình bày ý tưởng, đến thiết kế layout và in ấn. Mình đã apply thành công vào 5 công ty kiến trúc lớn nhờ portfolio này.",
        image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        imageCount: 8,
        likes: 245,
        comments: 78,
        shares: 32,
        liked: false,
        category: "graduation",
        date: "2024-01-13T15:45:00"
    }
];

// Dữ liệu bình luận cho từng bài viết
let commentsData = {
    1: [
        { 
            id: 1, 
            author: "Nguyễn Văn A", 
            avatar: "", 
            content: "Bài viết rất hữu ích, cảm ơn bạn!", 
            time: "2 giờ trước", 
            likes: 5,
            replies: [
                { id: 101, author: "Trần Hoàng Nam", avatar: "", content: "Cảm ơn bạn đã quan tâm!", time: "1 giờ trước", likes: 2 }
            ]
        },
        { 
            id: 2, 
            author: "Trần Thị B", 
            avatar: "", 
            content: "Mình cũng đang nghiên cứu về vấn đề này", 
            time: "1 giờ trước", 
            likes: 3,
            replies: []
        }
    ],
    2: [
        { 
            id: 1, 
            author: "Lê Văn C", 
            avatar: "", 
            content: "Theo mình tỉ lệ 15% là chưa đủ, nên tăng lên 20-25%", 
            time: "5 giờ trước", 
            likes: 8,
            replies: []
        }
    ],
    3: [
        { 
            id: 1, 
            author: "Phạm Thị D", 
            avatar: "", 
            content: "Portfolio đẹp quá, cảm ơn anh!", 
            time: "1 ngày trước", 
            likes: 12,
            replies: []
        },
        { 
            id: 2, 
            author: "Hoàng Văn E", 
            avatar: "", 
            content: "Anh có thể chia sẻ thêm về cách in ấn không?", 
            time: "20 giờ trước", 
            likes: 4,
            replies: [
                { id: 201, author: "Nguyễn Văn Khải", avatar: "", content: "Mình sẽ làm bài viết riêng về phần in ấn nhé!", time: "15 giờ trước", likes: 5 }
            ]
        }
    ]
};

// ============================================
// 2. KHỞI TẠO BIẾN TOÀN CỤC
// ============================================

// DOM Elements - Lấy các phần tử HTML
const createPostModal = document.getElementById('createPostModal');
const createPostBtn = document.getElementById('createPostBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const mobileFabBtn = document.getElementById('mobileFabBtn');
const postsContainer = document.getElementById('postsContainer');
const filterChips = document.querySelectorAll('.filter-chip');
const sortBtn = document.getElementById('sortBtn');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const submitPostBtn = document.getElementById('submitPostBtn');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const postCategory = document.getElementById('postCategory');
const attachmentArea = document.getElementById('attachmentArea');
const fileUpload = document.getElementById('fileUpload');
const addTagBtn = document.getElementById('addTagBtn');
const draftTime = document.getElementById('draftTime');

// State - Trạng thái ứng dụng
let currentFilter = 'all';           // Bộ lọc hiện tại
let sortOrder = 'newest';            // Sắp xếp: newest hoặc oldest
let posts = [...samplePosts];        // Danh sách bài viết

// Thông tin người dùng hiện tại (giả lập)
let currentUser = {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://ui-avatars.com/api/?background=136dec&color=fff&name=Nguyen+Van+A"
};

// ============================================
// 3. CÁC HÀM TIỆN ÍCH (UTILITY FUNCTIONS)
// ============================================

/**
 * Hiển thị thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo: 'success', 'error', 'info'
 */
function showNotification(message, type = 'info') {
    // Xóa thông báo cũ nếu có
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) oldNotification.remove();
    
    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="material-symbols-outlined">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
    `;
    
    // Thêm style cho thông báo
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 1rem;
        padding: 0.75rem 1.25rem;
        border-radius: 0.75rem;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 1000;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Escape HTML để tránh XSS
 * @param {string} text - Văn bản cần escape
 * @returns {string} Văn bản đã được escape
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Lấy thời gian tương đối
 * @param {string} timeString - Chuỗi thời gian
 * @returns {string} Thời gian đã định dạng
 */
function getTimeAgo(timeString) {
    if (timeString === "Vừa xong") return "Vừa xong";
    if (timeString.includes("giờ")) return timeString;
    if (timeString.includes("ngày")) return timeString;
    return timeString;
}

/**
 * Cập nhật thời gian lưu bản nháp
 */
function updateDraftTime() {
    if (draftTime) {
        const now = new Date();
        draftTime.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    setTimeout(updateDraftTime, 60000);
}

// ============================================
// 4. CHỨC NĂNG LIKE
// ============================================

/**
 * Thích / bỏ thích bài viết
 * @param {number} postId - ID bài viết
 */
function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (post.liked) {
            post.likes--;
            post.liked = false;
            showNotification('Đã bỏ thích bài viết', 'info');
        } else {
            post.likes++;
            post.liked = true;
            showNotification('Đã thích bài viết', 'success');
        }
        renderPosts(); // Cập nhật lại giao diện
    }
}

// ============================================
// 5. CHỨC NĂNG BÌNH LUẬN
// ============================================

/**
 * Mở modal bình luận
 * @param {number} postId - ID bài viết
 */
function openCommentModal(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Tạo modal nếu chưa tồn tại
    let commentModal = document.getElementById('commentModal');
    if (!commentModal) {
        commentModal = createCommentModal();
        document.body.appendChild(commentModal);
        attachCommentModalEvents(commentModal, postId);
    }
    
    // Lưu ID bài viết hiện tại
    commentModal.dataset.currentPost = postId;
    
    // Hiển thị bài viết gốc và danh sách bình luận
    renderOriginalPost(post);
    renderCommentsModal(postId);
    
    // Hiển thị modal
    commentModal.classList.remove('hidden');
    
    // Đóng modal khi click ra ngoài
    commentModal.addEventListener('click', (e) => {
        if (e.target === commentModal) {
            commentModal.classList.add('hidden');
        }
    });
}

/**
 * Tạo cấu trúc modal bình luận
 * @returns {HTMLElement} Modal element
 */
function createCommentModal() {
    const modal = document.createElement('div');
    modal.id = 'commentModal';
    modal.className = 'modal-overlay hidden';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 700px;">
            <div class="modal-header">
                <div class="modal-title">
                    <h1>Bình luận</h1>
                    <p>Chia sẻ ý kiến của bạn về bài viết</p>
                </div>
                <button class="modal-close-btn" id="closeCommentModalBtn">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="modal-content" style="padding: 0;">
                <!-- Bài viết gốc -->
                <div id="originalPostContainer" class="original-post-container"></div>
                
                <!-- Phần bình luận -->
                <div class="comments-section">
                    <div class="comments-header">
                        <span class="material-symbols-outlined">chat_bubble</span>
                        <h3>Bình luận (<span id="commentCount">0</span>)</h3>
                    </div>
                    <div class="comments-list" id="commentsList"></div>
                    
                    <!-- Ô nhập bình luận -->
                    <div class="comment-input-area">
                        <div class="comment-input-wrapper">
                            <div class="comment-input-avatar">
                                <img src="${currentUser.avatar}" alt="Avatar">
                            </div>
                            <div class="comment-input-field">
                                <textarea id="commentInput" placeholder="Viết bình luận của bạn..." rows="2"></textarea>
                                <div class="comment-input-actions">
                                    <button class="btn-icon" id="addEmojiBtn">
                                        <span class="material-symbols-outlined">sentiment_satisfied</span>
                                    </button>
                                    <button class="btn-primary" id="submitCommentBtn">Đăng bình luận</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Gắn sự kiện cho modal bình luận
 * @param {HTMLElement} modal - Modal element
 * @param {number} postId - ID bài viết
 */
function attachCommentModalEvents(modal, postId) {
    // Nút đóng modal
    const closeBtn = modal.querySelector('#closeCommentModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    // Nút đăng bình luận
    const submitBtn = modal.querySelector('#submitCommentBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const commentInput = modal.querySelector('#commentInput');
            const commentText = commentInput.value.trim();
            if (commentText) {
                addComment(postId, commentText);
                commentInput.value = '';
                renderCommentsModal(postId);
                showNotification('Đã thêm bình luận!', 'success');
            } else {
                showNotification('Vui lòng nhập nội dung bình luận', 'error');
            }
        });
    }
    
    // Nút thêm emoji
    const emojiBtn = modal.querySelector('#addEmojiBtn');
    if (emojiBtn) {
        emojiBtn.addEventListener('click', () => {
            showEmojiPicker(emojiBtn, modal);
        });
    }
}

/**
 * Hiển thị bảng chọn emoji
 * @param {HTMLElement} triggerBtn - Nút kích hoạt
 * @param {HTMLElement} modal - Modal cha
 */
function showEmojiPicker(triggerBtn, modal) {
    const emojis = ['😊', '😂', '❤️', '👍', '🎉', '👏', '😍', '🔥', '💡', '📝'];
    const commentInput = modal.querySelector('#commentInput');
    
    // Xóa picker cũ nếu có
    const oldPicker = modal.querySelector('.emoji-picker');
    if (oldPicker) oldPicker.remove();
    
    // Tạo picker mới
    const picker = document.createElement('div');
    picker.className = 'emoji-picker';
    picker.innerHTML = emojis.map(e => `<button class="emoji-btn">${e}</button>`).join('');
    
    // Đặt vị trí
    const rect = triggerBtn.getBoundingClientRect();
    const modalRect = modal.querySelector('.modal-content').getBoundingClientRect();
    picker.style.position = 'absolute';
    picker.style.bottom = '100%';
    picker.style.left = '0';
    picker.style.marginBottom = '0.5rem';
    
    triggerBtn.parentElement.style.position = 'relative';
    triggerBtn.parentElement.appendChild(picker);
    
    // Gắn sự kiện cho các nút emoji
    picker.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            commentInput.value += btn.textContent;
            commentInput.focus();
            picker.remove();
        });
    });
    
    // Đóng picker khi click ra ngoài
    setTimeout(() => {
        document.addEventListener('click', function closePicker(e) {
            if (!picker.contains(e.target) && e.target !== triggerBtn) {
                picker.remove();
                document.removeEventListener('click', closePicker);
            }
        });
    }, 100);
}

/**
 * Hiển thị bài viết gốc trong modal
 * @param {Object} post - Đối tượng bài viết
 */
function renderOriginalPost(post) {
    const container = document.getElementById('originalPostContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="original-post">
            <div class="original-post-header">
                <div class="original-post-avatar" style="background-image: url('${post.avatar}')"></div>
                <div class="original-post-info">
                    <div class="original-post-author">
                        <strong>${escapeHtml(post.author)}</strong>
                        <span class="faculty-badge">${escapeHtml(post.faculty)}</span>
                    </div>
                    <div class="original-post-meta">${post.time} • ${post.year}</div>
                </div>
            </div>
            <div class="original-post-content">
                <h4 class="original-post-title">${escapeHtml(post.title)}</h4>
                <p class="original-post-text">${escapeHtml(post.content)}</p>
                ${post.image ? `
                    <div class="original-post-image">
                        <img src="${post.image}" alt="Post image">
                        ${post.imageCount > 1 ? `<div class="image-count">+${post.imageCount}</div>` : ''}
                    </div>
                ` : ''}
            </div>
            <div class="original-post-stats">
                <div class="stat">
                    <span class="material-symbols-outlined">favorite</span>
                    <span>${post.likes}</span>
                </div>
                <div class="stat">
                    <span class="material-symbols-outlined">chat_bubble</span>
                    <span>${post.comments}</span>
                </div>
                <div class="stat">
                    <span class="material-symbols-outlined">cycle</span>
                    <span>${post.shares}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Hiển thị danh sách bình luận
 * @param {number} postId - ID bài viết
 */
function renderCommentsModal(postId) {
    const commentsList = document.getElementById('commentsList');
    const commentCountSpan = document.getElementById('commentCount');
    const comments = commentsData[postId] || [];
    
    if (commentCountSpan) {
        commentCountSpan.textContent = comments.length;
    }
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <span class="material-symbols-outlined">chat</span>
                <p>Chưa có bình luận nào</p>
                <span class="no-comments-sub">Hãy là người đầu tiên bình luận!</span>
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-avatar" style="background-image: url('${comment.avatar || 'https://ui-avatars.com/api/?background=136dec&color=fff&name=' + encodeURIComponent(comment.author)}')"></div>
            <div class="comment-content">
                <div class="comment-header">
                    <strong class="comment-author">${escapeHtml(comment.author)}</strong>
                    <span class="comment-time">${comment.time}</span>
                </div>
                <p class="comment-text">${escapeHtml(comment.content)}</p>
                <div class="comment-footer">
                    <button class="comment-like-btn" data-comment-id="${comment.id}">
                        <span class="material-symbols-outlined">thumb_up</span>
                        <span class="like-count">${comment.likes || 0}</span>
                    </button>
                    <button class="comment-reply-btn" data-comment-id="${comment.id}">
                        <span class="material-symbols-outlined">reply</span>
                        <span>Trả lời</span>
                    </button>
                    <span class="comment-time-ago">${getTimeAgo(comment.time)}</span>
                </div>
                
                <!-- Form trả lời (ẩn ban đầu) -->
                <div class="reply-input hidden" id="replyInput-${comment.id}">
                    <div class="reply-input-wrapper">
                        <div class="reply-avatar" style="background-image: url('${currentUser.avatar}')"></div>
                        <div class="reply-field">
                            <textarea placeholder="Viết phản hồi..." rows="2"></textarea>
                            <div class="reply-actions">
                                <button class="btn-secondary cancel-reply">Hủy</button>
                                <button class="btn-primary submit-reply">Phản hồi</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Danh sách phản hồi -->
                <div class="replies-section" id="replies-${comment.id}">
                    ${renderReplies(comment.replies || [])}
                </div>
            </div>
        </div>
    `).join('');
    
    // Gắn sự kiện cho các nút trong modal
    attachCommentItemEvents(postId);
}

/**
 * Hiển thị danh sách phản hồi
 * @param {Array} replies - Danh sách phản hồi
 * @returns {string} HTML của danh sách phản hồi
 */
function renderReplies(replies) {
    if (!replies || replies.length === 0) return '';
    
    return `
        <div class="replies-list">
            ${replies.map(reply => `
                <div class="reply-item">
                    <div class="reply-avatar" style="background-image: url('${reply.avatar || 'https://ui-avatars.com/api/?background=64748b&color=fff&name=' + encodeURIComponent(reply.author)}')"></div>
                    <div class="reply-content">
                        <div class="reply-header">
                            <strong>${escapeHtml(reply.author)}</strong>
                            <span class="reply-time">${reply.time}</span>
                        </div>
                        <p class="reply-text">${escapeHtml(reply.content)}</p>
                        <div class="reply-footer">
                            <button class="reply-like-btn" data-reply-id="${reply.id}">
                                <span class="material-symbols-outlined">thumb_up</span>
                                <span>${reply.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Gắn sự kiện cho các thành phần trong bình luận
 * @param {number} postId - ID bài viết
 */
function attachCommentItemEvents(postId) {
    // Like bình luận
    document.querySelectorAll('.comment-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = parseInt(btn.dataset.commentId);
            const comment = findCommentById(postId, commentId);
            if (comment) {
                comment.likes = (comment.likes || 0) + 1;
                renderCommentsModal(postId);
                showNotification('Đã thích bình luận!', 'success');
            }
        });
    });
    
    // Mở form trả lời
    document.querySelectorAll('.comment-reply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const commentId = parseInt(btn.dataset.commentId);
            const replyInput = document.getElementById(`replyInput-${commentId}`);
            if (replyInput) {
                replyInput.classList.toggle('hidden');
                const textarea = replyInput.querySelector('textarea');
                if (textarea) textarea.focus();
            }
        });
    });
    
    // Hủy trả lời
    document.querySelectorAll('.cancel-reply').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const replyInput = btn.closest('.reply-input');
            if (replyInput) replyInput.classList.add('hidden');
        });
    });
    
    // Gửi trả lời
    document.querySelectorAll('.submit-reply').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const replyInput = btn.closest('.reply-input');
            const commentId = parseInt(replyInput.id.split('-')[1]);
            const textarea = replyInput.querySelector('textarea');
            const replyText = textarea.value.trim();
            
            if (replyText) {
                addReply(postId, commentId, replyText);
                textarea.value = '';
                replyInput.classList.add('hidden');
                renderCommentsModal(postId);
                showNotification('Đã thêm phản hồi!', 'success');
            }
        });
    });
}

/**
 * Tìm bình luận theo ID
 * @param {number} postId - ID bài viết
 * @param {number} commentId - ID bình luận
 * @returns {Object|null} Đối tượng bình luận
 */
function findCommentById(postId, commentId) {
    const comments = commentsData[postId] || [];
    return comments.find(c => c.id === commentId);
}

/**
 * Thêm bình luận mới
 * @param {number} postId - ID bài viết
 * @param {string} content - Nội dung bình luận
 */
function addComment(postId, content) {
    if (!commentsData[postId]) {
        commentsData[postId] = [];
    }
    
    const newComment = {
        id: Date.now(),
        author: currentUser.name,
        avatar: currentUser.avatar,
        content: content,
        time: "Vừa xong",
        likes: 0,
        replies: []
    };
    
    commentsData[postId].unshift(newComment);
    
    // Cập nhật số lượng bình luận trong bài viết
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments = (post.comments || 0) + 1;
    }
    
    renderPosts();
}

/**
 * Thêm phản hồi cho bình luận
 * @param {number} postId - ID bài viết
 * @param {number} commentId - ID bình luận
 * @param {string} replyText - Nội dung phản hồi
 */
function addReply(postId, commentId, replyText) {
    if (!commentsData[postId]) {
        commentsData[postId] = [];
    }
    
    const comment = commentsData[postId].find(c => c.id === commentId);
    if (comment) {
        if (!comment.replies) comment.replies = [];
        comment.replies.push({
            id: Date.now(),
            author: currentUser.name,
            avatar: currentUser.avatar,
            content: replyText,
            time: "Vừa xong",
            likes: 0
        });
    }
    
    // Cập nhật số lượng bình luận trong bài viết
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments = (post.comments || 0) + 1;
    }
}

// ============================================
// 6. CHỨC NĂNG CHIA SẺ
// ============================================

/**
 * Chia sẻ bài viết
 * @param {number} postId - ID bài viết
 */
function sharePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Tạo modal chia sẻ nếu chưa tồn tại
    let shareModal = document.getElementById('shareModal');
    if (!shareModal) {
        shareModal = createShareModal();
        document.body.appendChild(shareModal);
        attachShareModalEvents(shareModal);
    }
    
    // Cập nhật link chia sẻ
    const shareLink = shareModal.querySelector('#shareLink');
    if (shareLink) {
        shareLink.value = `${window.location.origin}${window.location.pathname}?post=${postId}`;
    }
    
    shareModal.classList.remove('hidden');
    
    // Cập nhật số lượng chia sẻ
    post.shares = (post.shares || 0) + 1;
    renderPosts();
}

/**
 * Tạo modal chia sẻ
 * @returns {HTMLElement} Modal element
 */
function createShareModal() {
    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.className = 'modal-overlay hidden';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 500px;">
            <div class="modal-header">
                <div class="modal-title">
                    <h1>Chia sẻ bài viết</h1>
                </div>
                <button class="modal-close-btn" id="closeShareModalBtn">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="modal-content">
                <div class="share-options">
                    <button class="share-option" data-platform="facebook">
                        <span class="material-symbols-outlined">facebook</span>
                        <span>Facebook</span>
                    </button>
                    <button class="share-option" data-platform="twitter">
                        <span class="material-symbols-outlined">X</span>
                        <span>Twitter</span>
                    </button>
                    <button class="share-option" data-platform="copy">
                        <span class="material-symbols-outlined">content_copy</span>
                        <span>Sao chép link</span>
                    </button>
                </div>
                <div class="share-link-container">
                    <input type="text" id="shareLink" readonly>
                </div>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Gắn sự kiện cho modal chia sẻ
 * @param {HTMLElement} modal - Modal element
 */
function attachShareModalEvents(modal) {
    const closeBtn = modal.querySelector('#closeShareModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    modal.querySelectorAll('.share-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.platform;
            const link = modal.querySelector('#shareLink').value;
            const postId = new URLSearchParams(new URL(link).search).get('post');
            const post = posts.find(p => p.id == postId);
            const title = encodeURIComponent(post?.title || '');
            const url = encodeURIComponent(link);
            
            if (platform === 'copy') {
                navigator.clipboard.writeText(link);
                showNotification('Đã sao chép link!', 'success');
            } else if (platform === 'facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            } else if (platform === 'twitter') {
                window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank');
            }
            
            modal.classList.add('hidden');
        });
    });
    
    // Đóng modal khi click ra ngoài
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// ============================================
// 7. CHỨC NĂNG HIỂN THỊ BÀI VIẾT
// ============================================

/**
 * Tạo HTML cho một bài viết
 * @param {Object} post - Đối tượng bài viết
 * @returns {HTMLElement} Phần tử bài viết
 */
function createPostElement(post) {
    const postEl = document.createElement('article');
    postEl.className = 'post-card';
    postEl.dataset.postId = post.id;
    
    postEl.innerHTML = `
        <div class="post-card-header">
            <div class="post-card-user">
                <div class="post-card-avatar" style="background-image: url('${post.avatar}')"></div>
                <div class="post-card-info">
                    <div>
                        <h4>${escapeHtml(post.author)}</h4>
                        <span class="faculty-badge">${escapeHtml(post.faculty)}</span>
                    </div>
                    <p class="post-meta">${post.time} • ${post.year}</p>
                </div>
            </div>
            <button class="action-btn post-more-btn" data-post-id="${post.id}">
                <span class="material-symbols-outlined">more_horiz</span>
            </button>
        </div>
        <div class="post-card-content">
            <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
            <p class="post-card-description">${escapeHtml(post.content.substring(0, 200))}${post.content.length > 200 ? '...' : ''}</p>
        </div>
        ${post.image ? `
            <div class="post-card-image">
                <img src="${post.image}" alt="Post image">
                <div class="image-badge">
                    <span class="material-symbols-outlined">photo_library</span>
                    <span>${post.imageCount} hình ảnh</span>
                </div>
            </div>
        ` : ''}
        <div class="post-card-actions">
            <div class="action-buttons">
                <button class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                    <span class="material-symbols-outlined">favorite</span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="action-btn comment-btn" data-post-id="${post.id}">
                    <span class="material-symbols-outlined">chat_bubble</span>
                    <span class="comment-count">${post.comments}</span>
                </button>
                <button class="action-btn share-btn" data-post-id="${post.id}">
                    <span class="material-symbols-outlined">cycle</span>
                    <span class="share-count">${post.shares}</span>
                </button>
            </div>
            <button class="action-btn share-btn-mobile" data-post-id="${post.id}">
                <span class="material-symbols-outlined">send</span>
                <span>Chia sẻ</span>
            </button>
        </div>
    `;
    
    return postEl;
}

/**
 * Hiển thị danh sách bài viết
 */
function renderPosts() {
    if (!postsContainer) return;
    
    postsContainer.innerHTML = '';
    
    // Lọc bài viết theo danh mục
    let filteredPosts = posts.filter(post => {
        if (currentFilter === 'all') return true;
        return post.category === currentFilter;
    });
    
    // Sắp xếp bài viết
    filteredPosts.sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.date) - new Date(a.date);
        } else {
            return new Date(a.date) - new Date(b.date);
        }
    });
    
    // Hiển thị từng bài viết
    filteredPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
    
    // Gắn sự kiện cho các nút trong bài viết
    attachPostEventListeners();
}

/**
 * Gắn sự kiện cho các nút trong bài viết
 */
function attachPostEventListeners() {
    // Nút Like
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.dataset.postId);
            toggleLike(postId);
        });
    });
    
    // Nút Comment
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.dataset.postId);
            openCommentModal(postId);
        });
    });
    
    // Nút Share
    document.querySelectorAll('.share-btn, .share-btn-mobile').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.dataset.postId);
            sharePost(postId);
        });
    });
    
    // Nút More (tùy chọn thêm)
    document.querySelectorAll('.post-more-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.dataset.postId);
            showPostOptions(postId);
        });
    });
}

/**
 * Hiển thị tùy chọn cho bài viết
 * @param {number} postId - ID bài viết
 */
function showPostOptions(postId) {
    const options = [
        { label: 'Báo cáo vi phạm', icon: 'flag', action: () => reportPost(postId) },
        { label: 'Lưu bài viết', icon: 'bookmark', action: () => savePost(postId) },
        { label: 'Ẩn bài viết', icon: 'visibility_off', action: () => hidePost(postId) }
    ];
    
    // Tạo menu tùy chọn đơn giản (có thể nâng cấp thành modal sau)
    const choice = prompt('Chọn hành động:\n1 - Báo cáo vi phạm\n2 - Lưu bài viết\n3 - Ẩn bài viết');
    if (choice === '1') reportPost(postId);
    else if (choice === '2') savePost(postId);
    else if (choice === '3') hidePost(postId);
}

/**
 * Báo cáo bài viết
 * @param {number} postId - ID bài viết
 */
function reportPost(postId) {
    showNotification('Đã gửi báo cáo vi phạm. Cảm ơn bạn!', 'success');
}

/**
 * Lưu bài viết
 * @param {number} postId - ID bài viết
 */
function savePost(postId) {
    showNotification('Đã lưu bài viết vào mục đã lưu', 'success');
}

/**
 * Ẩn bài viết
 * @param {number} postId - ID bài viết
 */
function hidePost(postId) {
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        posts.splice(postIndex, 1);
        renderPosts();
        showNotification('Đã ẩn bài viết', 'info');
    }
}

// ============================================
// 8. CHỨC NĂNG TẠO BÀI VIẾT MỚI
// ============================================

/**
 * Mở modal tạo bài viết
 */
function openCreateModal() {
    if (createPostModal) {
        createPostModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Đóng modal tạo bài viết
 */
function closeCreateModal() {
    if (createPostModal) {
        createPostModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Lưu bản nháp
 */
function saveDraft() {
    const draftData = {
        title: postTitle?.value || '',
        content: postContent?.value || '',
        category: postCategory?.value || 'arch'
    };
    localStorage.setItem('hauhub_forum_draft', JSON.stringify(draftData));
    showNotification('Đã lưu bản nháp!', 'success');
}

/**
 * Đăng bài viết mới
 */
function submitNewPost() {
    const title = postTitle?.value.trim();
    const content = postContent?.value.trim();
    
    if (!title) {
        showNotification('Vui lòng nhập tiêu đề!', 'error');
        return;
    }
    
    if (!content) {
        showNotification('Vui lòng nhập nội dung!', 'error');
        return;
    }
    
    const newPost = {
        id: posts.length + 1,
        author: currentUser.name,
        avatar: currentUser.avatar,
        faculty: postCategory?.value === 'arch' ? 'Kiến trúc' : 
                postCategory?.value === 'plan' ? 'Quy hoạch' :
                postCategory?.value === 'civil' ? 'Xây dựng' : 'Toàn trường',
        facultyColor: 'primary',
        time: 'Vừa xong',
        year: 'Khóa 2023',
        title: title,
        content: content,
        image: null,
        imageCount: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        category: 'all',
        date: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    renderPosts();
    
    // Reset form
    if (postTitle) postTitle.value = '';
    if (postContent) postContent.value = '';
    
    closeCreateModal();
    showNotification('Đăng bài thành công!', 'success');
}

/**
 * Tải bản nháp đã lưu
 */
function loadSavedDraft() {
    const saved = localStorage.getItem('hauhub_forum_draft');
    if (saved) {
        try {
            const draft = JSON.parse(saved);
            if (postTitle) postTitle.value = draft.title || '';
            if (postContent) postContent.value = draft.content || '';
            if (postCategory) postCategory.value = draft.category || 'arch';
            if (draft.title || draft.content) {
                showNotification('Đã tải bản nháp trước đó', 'info');
            }
        } catch (e) {
            console.error('Lỗi tải bản nháp:', e);
        }
    }
}

// ============================================
// 9. CHỨC NĂNG LỌC VÀ SẮP XẾP
// ============================================

/**
 * Thay đổi cách sắp xếp bài viết
 */
function toggleSortOrder() {
    sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
    if (sortBtn) {
        sortBtn.innerHTML = sortOrder === 'newest' 
            ? 'Mới nhất <span class="material-symbols-outlined">expand_more</span>'
            : 'Cũ nhất <span class="material-symbols-outlined">expand_more</span>';
    }
    renderPosts();
}

/**
 * Thay đổi bộ lọc danh mục
 * @param {string} filter - Giá trị bộ lọc
 */
function setFilter(filter) {
    currentFilter = filter;
    renderPosts();
}

// ============================================
// 10. GẮN SỰ KIỆN VÀ KHỞI TẠO
// ============================================

/**
 * Gắn tất cả các sự kiện
 */
function setupEventListeners() {
    // Nút mở/đóng modal tạo bài viết
    if (createPostBtn) createPostBtn.addEventListener('click', openCreateModal);
    if (mobileFabBtn) mobileFabBtn.addEventListener('click', openCreateModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeCreateModal);
    
    // Đóng modal khi click ra ngoài
    if (createPostModal) {
        createPostModal.addEventListener('click', (e) => {
            if (e.target === createPostModal) closeCreateModal();
        });
    }
    
    // Nút lưu nháp và đăng bài
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', saveDraft);
    if (submitPostBtn) submitPostBtn.addEventListener('click', submitNewPost);
    
    // Nút sắp xếp
    if (sortBtn) sortBtn.addEventListener('click', toggleSortOrder);
    
    // Nút lọc danh mục
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            setFilter(chip.dataset.filter);
        });
    });
    
    // Tự động lưu nháp khi nhập liệu
    if (postTitle) postTitle.addEventListener('input', saveDraft);
    if (postContent) postContent.addEventListener('input', saveDraft);
    
    // Đính kèm file
    if (attachmentArea) {
        attachmentArea.addEventListener('click', () => fileUpload?.click());
    }
    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            showNotification(`Đã thêm ${files.length} tệp!`, 'success');
        });
    }
    
    // Thêm thẻ mới
    if (addTagBtn) {
        addTagBtn.addEventListener('click', () => {
            const tag = prompt('Nhập tên thẻ mới:');
            if (tag && tag.trim()) {
                showNotification(`Đã thêm thẻ #${tag.trim()}`, 'success');
            }
        });
    }
}

/**
 * Khởi tạo ứng dụng
 */
function init() {
    console.log('Khởi tạo Forum...');
    setupEventListeners();
    renderPosts();
    loadSavedDraft();
    updateDraftTime();
}

// Thêm CSS động cho các thành phần
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    /* Nút Like đã được thích */
    .like-btn.liked .material-symbols-outlined {
        font-variation-settings: 'FILL' 1;
        color: #ef4444;
    }
    
    /* Style cho modal bình luận và các thành phần */
    .original-post-container {
        border-bottom: 1px solid #eef2f6;
        background: #fafbfc;
    }
    .dark .original-post-container {
        border-bottom-color: #334155;
        background: #0f172a;
    }
    .original-post { padding: 1.5rem; }
    .original-post-header { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .original-post-avatar { width: 48px; height: 48px; border-radius: 50%; background-size: cover; background-position: center; }
    .original-post-info { flex: 1; }
    .original-post-author { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .original-post-author strong { font-size: 0.875rem; }
    .original-post-meta { font-size: 0.7rem; color: #64748b; margin-top: 0.25rem; }
    .original-post-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #0f172a; }
    .dark .original-post-title { color: #f1f5f9; }
    .original-post-text { font-size: 0.875rem; color: #475569; line-height: 1.5; margin-bottom: 1rem; }
    .dark .original-post-text { color: #94a3b8; }
    .original-post-image { position: relative; border-radius: 0.75rem; overflow: hidden; margin-top: 0.75rem; }
    .original-post-image img { width: 100%; max-height: 300px; object-fit: cover; }
    .image-count { position: absolute; bottom: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.7rem; color: white; }
    .original-post-stats { display: flex; gap: 1.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eef2f6; }
    .dark .original-post-stats { border-top-color: #334155; }
    .original-post-stats .stat { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: #64748b; }
    
    .comments-section { padding: 1.5rem; }
    .comments-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid #eef2f6; }
    .dark .comments-header { border-bottom-color: #334155; }
    .comments-header h3 { font-size: 1rem; font-weight: 600; }
    
    .comments-list { max-height: 400px; overflow-y: auto; margin-bottom: 1.5rem; }
    .comments-list::-webkit-scrollbar { width: 4px; }
    .comments-list::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
    .comments-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    
    .no-comments { text-align: center; padding: 3rem 2rem; color: #64748b; }
    .no-comments .material-symbols-outlined { font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.5; }
    .no-comments p { font-size: 0.875rem; margin-bottom: 0.25rem; }
    .no-comments-sub { font-size: 0.75rem; opacity: 0.7; }
    
    .comment-item { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #eef2f6; }
    .dark .comment-item { border-bottom-color: #334155; }
    .comment-avatar { width: 40px; height: 40px; border-radius: 50%; background-size: cover; background-position: center; flex-shrink: 0; }
    .comment-content { flex: 1; }
    .comment-header { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.25rem; }
    .comment-author { font-size: 0.875rem; font-weight: 600; }
    .comment-time { font-size: 0.65rem; color: #94a3b8; }
    .comment-text { font-size: 0.875rem; color: #1f2937; line-height: 1.5; margin-bottom: 0.5rem; }
    .dark .comment-text { color: #e2e8f0; }
    .comment-footer { display: flex; align-items: center; gap: 1rem; }
    .comment-like-btn, .comment-reply-btn { display: flex; align-items: center; gap: 0.25rem; background: none; border: none; font-size: 0.7rem; color: #64748b; cursor: pointer; transition: color 0.2s; }
    .comment-like-btn:hover, .comment-reply-btn:hover { color: #136dec; }
    .comment-time-ago { font-size: 0.65rem; color: #94a3b8; }
    
    .reply-input { margin-top: 0.75rem; margin-left: 2rem; }
    .reply-input-wrapper { display: flex; gap: 0.75rem; }
    .reply-avatar { width: 32px; height: 32px; border-radius: 50%; background-size: cover; background-position: center; flex-shrink: 0; }
    .reply-field { flex: 1; }
    .reply-field textarea { width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.75rem; resize: vertical; background: white; }
    .dark .reply-field textarea { background: #0f172a; border-color: #334155; color: #f1f5f9; }
    .reply-field textarea:focus { outline: none; border-color: #136dec; }
    .reply-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .reply-actions .btn-secondary { padding: 0.25rem 0.75rem; border-radius: 0.375rem; background: transparent; border: 1px solid #e2e8f0; font-size: 0.7rem; cursor: pointer; }
    .reply-actions .btn-primary { padding: 0.25rem 0.75rem; border-radius: 0.375rem; background: #136dec; border: none; color: white; font-size: 0.7rem; cursor: pointer; }
    
    .replies-section { margin-top: 0.75rem; margin-left: 2rem; }
    .replies-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .reply-item { display: flex; gap: 0.75rem; padding: 0.5rem 0; border-left: 2px solid #e2e8f0; padding-left: 0.75rem; }
    .dark .reply-item { border-left-color: #334155; }
    .reply-avatar { width: 28px; height: 28px; border-radius: 50%; background-size: cover; background-position: center; flex-shrink: 0; }
    .reply-content { flex: 1; }
    .reply-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
    .reply-header strong { font-size: 0.75rem; }
    .reply-time { font-size: 0.6rem; color: #94a3b8; }
    .reply-text { font-size: 0.75rem; color: #475569; margin-bottom: 0.25rem; }
    .dark .reply-text { color: #94a3b8; }
    .reply-footer { display: flex; gap: 0.75rem; }
    .reply-like-btn { display: flex; align-items: center; gap: 0.25rem; background: none; border: none; font-size: 0.6rem; color: #64748b; cursor: pointer; }
    
    .comment-input-area { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eef2f6; }
    .dark .comment-input-area { border-top-color: #334155; }
    .comment-input-wrapper { display: flex; gap: 0.75rem; }
    .comment-input-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
    .comment-input-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .comment-input-field { flex: 1; }
    .comment-input-field textarea { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.875rem; resize: vertical; background: white; font-family: inherit; }
    .dark .comment-input-field textarea { background: #0f172a; border-color: #334155; color: #f1f5f9; }
    .comment-input-field textarea:focus { outline: none; border-color: #136dec; }
    .comment-input-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
    .comment-input-actions .btn-icon { width: 32px; height: 32px; border-radius: 50%; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; }
    .comment-input-actions .btn-icon:hover { background: #f1f5f9; }
    .comment-input-actions .btn-primary { padding: 0.5rem 1rem; border-radius: 0.5rem; background: #136dec; border: none; color: white; font-size: 0.75rem; font-weight: 500; cursor: pointer; }
    
    .emoji-picker { position: absolute; bottom: 100%; left: 0; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem; display: flex; gap: 0.25rem; flex-wrap: wrap; max-width: 200px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10; }
    .dark .emoji-picker { background: #1e293b; border-color: #334155; }
    .emoji-btn { width: 32px; height: 32px; border: none; background: transparent; cursor: pointer; font-size: 1.25rem; border-radius: 0.25rem; }
    .emoji-btn:hover { background: #f1f5f9; }
    .dark .emoji-btn:hover { background: #334155; }
    
    .share-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .share-option { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; cursor: pointer; transition: all 0.2s; }
    .dark .share-option { background: #0f172a; border-color: #334155; color: #f1f5f9; }
    .share-option:hover { border-color: #136dec; background: rgba(19, 109, 236, 0.05); }
    .share-link-container { padding: 12px; background: #f8fafc; border-radius: 8px; }
    .dark .share-link-container { background: #0f172a; }
    .share-link-container input { width: 100%; padding: 8px; border: none; background: transparent; font-size: 0.75rem; color: #64748b; }
    .dark .share-link-container input { color: #94a3b8; }
    
    .hidden { display: none !important; }
`;
document.head.appendChild(dynamicStyles);

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', init);