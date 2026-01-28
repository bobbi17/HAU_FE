// Sample post data
const samplePosts = [
    {
        id: 1,
        author: "Trần Hoàng Nam",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTj4rF-Zx7oNvvETI0jNp5rIZFAce-SmxCXy4b7XuQ4yz06PvbyCNrZSf2S0QiCN8IUe5eSu15RjDivifa3XRGWGtnIkKchhm4HqgVxi7ckmgWr7YDlBqKMMaSIKoI9CbrkkkgQOpFHXAoAYeUrKKJWs_g66olBO55II8tdCfmeKZ65ch9HC2sFprSfCKetBy37JGuWOumUfgMD_7pM9-ICRp9HY3lhrH2tfZU69zSOy0Ke5HQH4eK0WeP7ptF5-5jdkFV2LvMXS8",
        faculty: "K. Kiến trúc",
        facultyColor: "primary",
        time: "3 giờ trước",
        year: "Khóa 2019",
        title: "Ứng dụng vật liệu địa phương trong nhà ở xã hội tại vùng cao",
        content: "Bài viết này phân tích cách tận dụng đá hộc và gỗ thông bản địa để giảm chi phí vận chuyển trong xây dựng. Mình đã thử nghiệm mô hình 1:20 cho kết cấu vách ngăn chịu lực, kết quả cho thấy độ ổn định cao hơn dự kiến...",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnX9HMhBfGBU8jorh2t12oD8DseBCuEeQaUN_BmOEdvbH1LVbW6LVOxRKuavyPl36SOw7ojyxTl7bs7axmtqfBXkX4VLEpszsxO_pTwjRJWvDeh5lbYvQQueo5VQsdd1-g9sGdPO-Pem145CJkM8S2VeWtnHxEWJ5VGwS93PlGhbHN67bZKtvocpenUZEUiXgXqiLqXzRVH-dYoeiN1XvV5nekIrT0UaYaVNH1PlV6ZGYPTH9--vHHEFZ68r_Zsb4cXeHiR9O7JIc",
        imageCount: 4,
        likes: 128,
        comments: 45,
        shares: 12,
        category: "material",
        date: "2024-01-15T10:30:00"
    },
    {
        id: 2,
        author: "Lê Minh Anh",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhdcEUlQC0AwZ67X3Bm2tRwmOauZJPgcNxaFQ8cInrzccWj_SZb1c-pkTzBAffkQNn1LxbdjBFawPVGPkaaUk28fETT5fIHiMH3yUqJpqh_4LAZA6xM_s_y3ExyStaRJ7d4X9F7rfroeWCwIAtqqrEsmZarYKNTugaw9ZPx8tE2R6Hc8IWuYdxjMRAYTe73O5y0w9MWQIsRvsAeHHLk4mHxY_3zF5E7XiUWmmCYQnmqDGc-oAlCVTwuY8s8ru2GZE_dKODFru_Xzc",
        faculty: "QH. Quy hoạch",
        facultyColor: "green",
        time: "12 giờ trước",
        year: "Khóa 2021",
        title: "Thảo luận: Tầm quan trọng của dải cây xanh cách ly trong quy hoạch đô thị vệ tinh",
        content: "Mọi người nghĩ sao về tỉ lệ 15% diện tích mặt bằng cho cây xanh cách ly tại khu công nghiệp Quang Châu? Mình đang làm đồ án về vấn đề này và cảm thấy con số này chưa thực sự tối ưu cho môi trường vi khí hậu.",
        image: null,
        likes: 89,
        comments: 56,
        shares: 4,
        category: "theory",
        date: "2024-01-14T22:15:00"
    },
    {
        id: 3,
        author: "Nguyễn Văn Khải",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGeezOlPeh_B1ieLzqENT-jrXNjhWmumPIZl3nV-bdXRtnWEM_mEMjlclgXbBfFhPapCybML8yXYdbKMWfomvCP-WXIGSgiqIAcAhrczQroYL9nhABKYD0RrHlLJjWGhKt4dF2oMNu5OqnFspOUF6rDvLz49OkKO4SDposGlNeHi7h8lBTKl2ggF0LkXQ3MV5W9Z6W83dEBffmd1wj6stAUAtGAtgJTpCUA9ocuwvI3jej0MkrgJ7QBYd5yFKk0au1JmLMHgrWWNM",
        faculty: "K. Kiến trúc",
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
        category: "graduation",
        date: "2024-01-13T15:45:00"
    }
];

// DOM Elements
const createPostModal = document.getElementById('createPostModal');
const createPostBtn = document.getElementById('createPostBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const mobileFabBtn = document.getElementById('mobileFabBtn');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const submitPostBtn = document.getElementById('submitPostBtn');
const searchInput = document.getElementById('searchInput');
const postsContainer = document.getElementById('postsContainer');
const filterChips = document.querySelectorAll('.filter-chip');
const sortBtn = document.getElementById('sortBtn');
const viewAllTrendsBtn = document.getElementById('viewAllTrendsBtn');
const postCategory = document.getElementById('postCategory');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const attachmentArea = document.getElementById('attachmentArea');
const fileUpload = document.getElementById('fileUpload');
const addTagBtn = document.getElementById('addTagBtn');
const draftTime = document.getElementById('draftTime');

// State
let currentFilter = 'all';
let sortOrder = 'newest';
let posts = [...samplePosts];
let newPostData = {
    category: 'arch',
    type: 'discussion',
    title: '',
    content: '',
    tags: ['DoAn', 'KienThuc'],
    attachments: []
};

// Initialize the app
function init() {
    renderPosts();
    setupEventListeners();
    updateDraftTime();
}

// Render posts to the container
function renderPosts() {
    postsContainer.innerHTML = '';
    
    // Filter posts
    let filteredPosts = posts.filter(post => {
        if (currentFilter === 'all') return true;
        return post.category === currentFilter;
    });
    
    // Sort posts
    filteredPosts.sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.date) - new Date(a.date);
        } else {
            return new Date(a.date) - new Date(b.date);
        }
    });
    
    // Render each post
    filteredPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create a post element
function createPostElement(post) {
    const postEl = document.createElement('article');
    postEl.className = 'post-card';
    postEl.dataset.category = post.category;
    postEl.dataset.date = post.date;
    
    // Format faculty badge color
    const facultyBadgeClass = post.facultyColor === 'green' 
        ? 'bg-green-100 text-green-700'
        : 'bg-primary/10 text-primary';
    
    // Create HTML structure
    postEl.innerHTML = `
        <div class="post-card-header">
            <div class="post-card-user">
                <div class="post-card-avatar" style="background-image: url('${post.avatar}')"></div>
                <div class="post-card-info">
                    <div class="flex items-center gap-2">
                        <h4>${post.author}</h4>
                        <span class="faculty-badge ${facultyBadgeClass}">${post.faculty}</span>
                    </div>
                    <p class="post-meta">${post.time} • ${post.year}</p>
                </div>
            </div>
            <button class="post-card-more">
                <span class="material-symbols-outlined">more_horiz</span>
            </button>
        </div>
        <div class="post-card-content">
            <h3 class="post-card-title">${post.title}</h3>
            <p class="post-card-description">${post.content}</p>
        </div>
        ${post.image ? `
            <div class="post-card-image">
                <img src="${post.image}" alt="Post image">
                <div class="image-badge">
                    <span class="material-symbols-outlined">photo_library</span>
                    <span>${post.imageCount} sơ đồ kĩ thuật</span>
                </div>
            </div>
        ` : ''}
        <div class="post-card-actions">
            <div class="action-buttons">
                <button class="action-btn like" data-post-id="${post.id}">
                    <span class="material-symbols-outlined">favorite</span>
                    <span class="action-count">${post.likes}</span>
                </button>
                <button class="action-btn comment" data-post-id="${post.id}">
                    <span class="material-symbols-outlined">chat_bubble</span>
                    <span class="action-count">${post.comments}</span>
                </button>
                <button class="action-btn">
                    <span class="material-symbols-outlined">cycle</span>
                    <span class="action-count">${post.shares}</span>
                </button>
            </div>
            <button class="action-btn share" data-post-id="${post.id}">
                <span class="material-symbols-outlined">send</span>
                <span class="action-count">Chia sẻ</span>
            </button>
        </div>
    `;
    
    return postEl;
}

// Setup all event listeners
function setupEventListeners() {
    // Modal controls
    createPostBtn.addEventListener('click', openCreatePostModal);
    mobileFabBtn.addEventListener('click', openCreatePostModal);
    closeModalBtn.addEventListener('click', closeCreatePostModal);
    
    // Close modal when clicking outside
    createPostModal.addEventListener('click', (e) => {
        if (e.target === createPostModal) {
            closeCreatePostModal();
        }
    });
    
    // Form controls
    saveDraftBtn.addEventListener('click', saveDraft);
    submitPostBtn.addEventListener('click', submitPost);
    
    // Filter and sort controls
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Update active state
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            // Update filter and re-render
            currentFilter = chip.dataset.filter;
            renderPosts();
        });
    });
    
    sortBtn.addEventListener('click', toggleSortOrder);
    
    // Search functionality
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Post type buttons
    document.querySelectorAll('.post-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.post-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            newPostData.type = btn.dataset.type;
        });
    });
    
    // Toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tool === 'image') {
                fileUpload.click();
            } else {
                applyTextFormatting(btn.dataset.tool);
            }
        });
    });
    
    // File upload
    attachmentArea.addEventListener('click', () => fileUpload.click());
    fileUpload.addEventListener('change', handleFileUpload);
    
    // Tags
    addTagBtn.addEventListener('click', addNewTag);
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!btn.classList.contains('add-tag')) {
                toggleTag(btn.dataset.tag, btn);
            }
        });
    });
    
    // Form inputs
    postTitle.addEventListener('input', (e) => {
        newPostData.title = e.target.value;
        autoSaveDraft();
    });
    
    postContent.addEventListener('input', (e) => {
        newPostData.content = e.target.value;
        autoSaveDraft();
    });
    
    postCategory.addEventListener('change', (e) => {
        newPostData.category = e.target.value;
        autoSaveDraft();
    });
    
    // Trending tags
    document.querySelectorAll('.trending-item').forEach(item => {
        item.addEventListener('click', () => {
            const tag = item.dataset.tag;
            // Set filter to trending tag
            filterChips.forEach(chip => {
                chip.classList.remove('active');
                if (chip.dataset.filter === tag) {
                    chip.classList.add('active');
                    currentFilter = tag;
                }
            });
            renderPosts();
        });
    });
    
    viewAllTrendsBtn.addEventListener('click', () => {
        alert('Tính năng xem tất cả xu hướng đang được phát triển!');
    });
}

// Modal functions
function openCreatePostModal() {
    createPostModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCreatePostModal() {
    createPostModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Post creation functions
function saveDraft() {
    // In a real app, this would save to backend
    localStorage.setItem('hauhub_draft', JSON.stringify(newPostData));
    showNotification('Đã lưu bản nháp thành công!', 'success');
}

function autoSaveDraft() {
    // Auto-save every 30 seconds
    clearTimeout(window.autoSaveTimeout);
    window.autoSaveTimeout = setTimeout(() => {
        saveDraft();
    }, 30000);
}

function submitPost() {
    if (!newPostData.title.trim()) {
        showNotification('Vui lòng nhập tiêu đề bài viết!', 'error');
        postTitle.focus();
        return;
    }
    
    if (!newPostData.content.trim()) {
        showNotification('Vui lòng nhập nội dung bài viết!', 'error');
        postContent.focus();
        return;
    }
    
    // Create new post object
    const newPost = {
        id: posts.length + 1,
        author: "Người dùng hiện tại", // In real app, get from user session
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPWlF7T-MKxMFkz0lef0b_50kEC3oCUqP-a0Amp4pWJuVCAEa1oKab5lo5eqP6rtrl9a3e9CAf4TmbdFrAIyv2G06Eg532jBfy6thEg7D_qqQgYgKxhiZWkhMNlcRZfDjjb_NLZPfJWjPVtTWNY8RkuXAC581u_t9VqX0i95tePcM2LqKzzHXBwjezXR4A1b7eiyrQ4b_tZpv1g5Sd2zvlC_uWIOH8wUwzJGmZ_XnwIpl8_rmJ4dZ9FUlydE5AMKhQktKP_SZjdbU",
        faculty: newPostData.category === 'arch' ? 'K. Kiến trúc' : 
                newPostData.category === 'plan' ? 'QH. Quy hoạch' :
                newPostData.category === 'civil' ? 'XD. Xây dựng' : 'Toàn trường',
        facultyColor: 'primary',
        time: 'Vừa xong',
        year: 'Khóa 2023',
        title: newPostData.title,
        content: newPostData.content,
        image: null, // In real app, handle image upload
        imageCount: newPostData.attachments.length,
        likes: 0,
        comments: 0,
        shares: 0,
        category: getCategoryFromTags(newPostData.tags),
        date: new Date().toISOString()
    };
    
    // Add to posts array and re-render
    posts.unshift(newPost);
    renderPosts();
    
    // Reset form
    resetForm();
    
    // Close modal
    closeCreatePostModal();
    
    // Show success message
    showNotification('Bài viết đã được đăng thành công!', 'success');
    
    // Scroll to top to see new post
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getCategoryFromTags(tags) {
    if (tags.includes('DoAn')) return 'graduation';
    if (tags.includes('VatLieu')) return 'material';
    if (tags.includes('LyThuyet')) return 'theory';
    return 'all';
}

function resetForm() {
    newPostData = {
        category: 'arch',
        type: 'discussion',
        title: '',
        content: '',
        tags: ['DoAn', 'KienThuc'],
        attachments: []
    };
    
    postTitle.value = '';
    postContent.value = '';
    postCategory.value = 'arch';
    
    // Reset tags
    document.querySelectorAll('.tag-btn').forEach(btn => {
        if (btn.dataset.tag === 'DoAn' || btn.dataset.tag === 'KienThuc') {
            btn.classList.add('active');
        } else if (!btn.classList.contains('add-tag')) {
            btn.classList.remove('active');
        }
    });
    
    // Reset post type
    document.querySelectorAll('.post-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === 'discussion') {
            btn.classList.add('active');
        }
    });
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
        renderPosts();
        return;
    }
    
    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm)
    );
    
    // Temporary render filtered results
    postsContainer.innerHTML = '';
    filteredPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Sort functionality
function toggleSortOrder() {
    sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
    sortBtn.innerHTML = sortOrder === 'newest' 
        ? 'Mới nhất <span class="material-symbols-outlined">expand_more</span>'
        : 'Cũ nhất <span class="material-symbols-outlined">expand_more</span>';
    renderPosts();
}

// Tag functionality
function toggleTag(tag, element) {
    const index = newPostData.tags.indexOf(tag);
    
    if (index === -1) {
        newPostData.tags.push(tag);
        element.classList.add('active');
    } else {
        newPostData.tags.splice(index, 1);
        element.classList.remove('active');
    }
    
    autoSaveDraft();
}

function addNewTag() {
    const tagName = prompt('Nhập tên thẻ mới (không dấu #):');
    if (tagName && tagName.trim()) {
        const tag = tagName.trim();
        
        // Check if tag already exists
        if (!newPostData.tags.includes(tag)) {
            newPostData.tags.push(tag);
            
            // Create new tag button
            const tagBtn = document.createElement('button');
            tagBtn.className = 'tag-btn active';
            tagBtn.type = 'button';
            tagBtn.dataset.tag = tag;
            tagBtn.innerHTML = `#${tag} <span class="material-symbols-outlined">close</span>`;
            
            // Insert before the add tag button
            addTagBtn.parentNode.insertBefore(tagBtn, addTagBtn);
            
            // Add click event
            tagBtn.addEventListener('click', (e) => {
                toggleTag(tag, tagBtn);
            });
            
            autoSaveDraft();
        }
    }
}

// File upload
function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    
    // Validate file sizes (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    const validFiles = files.filter(file => file.size <= maxSize);
    
    if (validFiles.length !== files.length) {
        showNotification('Một số tệp vượt quá giới hạn 20MB!', 'error');
    }
    
    // Add to attachments
    validFiles.forEach(file => {
        newPostData.attachments.push(file);
    });
    
    // Update UI
    if (validFiles.length > 0) {
        showNotification(`Đã thêm ${validFiles.length} tệp đính kèm!`, 'success');
        
        // Update attachment area text
        const p = attachmentArea.querySelector('p');
        p.textContent = `${validFiles.length} tệp đã được chọn (JPG, PNG, PDF up to 20MB)`;
    }
    
    autoSaveDraft();
}

// Text formatting
function applyTextFormatting(tool) {
    const textarea = postContent;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let formattedText = selectedText;
    
    switch(tool) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'list':
            formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
            break;
        case 'quote':
            formattedText = `> ${selectedText}`;
            break;
        case 'link':
            const url = prompt('Nhập URL:');
            if (url) {
                formattedText = `[${selectedText}](${url})`;
            }
            break;
    }
    
    textarea.value = beforeText + formattedText + afterText;
    textarea.focus();
    textarea.setSelectionRange(start, start + formattedText.length);
    
    newPostData.content = textarea.value;
    autoSaveDraft();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="material-symbols-outlined">
            ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 1000;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateDraftTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    draftTime.textContent = timeString;
    
    // Update every minute
    setTimeout(updateDraftTime, 60000);
}

// Load saved draft from localStorage
function loadSavedDraft() {
    const savedDraft = localStorage.getItem('hauhub_draft');
    if (savedDraft) {
        try {
            newPostData = JSON.parse(savedDraft);
            
            // Update form fields
            postTitle.value = newPostData.title;
            postContent.value = newPostData.content;
            postCategory.value = newPostData.category;
            
            // Update tags
            document.querySelectorAll('.tag-btn').forEach(btn => {
                if (btn.dataset.tag) {
                    if (newPostData.tags.includes(btn.dataset.tag)) {
                        btn.classList.add('active');
                    } else if (!btn.classList.contains('add-tag')) {
                        btn.classList.remove('active');
                    }
                }
            });
            
            // Update post type
            document.querySelectorAll('.post-type-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === newPostData.type) {
                    btn.classList.add('active');
                }
            });
            
            showNotification('Đã tải bản nháp trước đó!', 'info');
        } catch (e) {
            console.error('Error loading draft:', e);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    loadSavedDraft();
});