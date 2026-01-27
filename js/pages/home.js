// js/pages/home.js - UPDATED
export class HomePage {
    constructor() {
        this.render();
        this.initEventListeners();
    }
    
    render() {
        const homeContent = `
        <section class="home-hero">
            <div class="hero-content">
                <div class="space-y-6">
                    <div class="hero-meta">
                        <span class="hero-divider"></span>
                        <span class="mono-label text-[var(--arch-blue)] uppercase tracking-[0.4em]">Established 1969 / HAU System</span>
                    </div>
                    <h1 class="hero-title">
                        KHÔNG GIAN<br/>
                        <span class="hero-subtitle">HỌC TẬP</span>
                    </h1>
                    <p class="hero-description">
                        Nền tảng số hóa dành cho sinh viên Kiến trúc Hà Nội.
                    </p>
                </div>
                <div class="hero-actions">
                    <button class="btn-arch btn-arch-primary">Vào Studio</button>
                    <button class="btn-arch">Khám phá </button>
                </div>
            </div>
            <div class="blueprint-container">
                <div class="blueprint-bg"></div>
                <div class="blueprint-main">
                    <div class="blueprint-frame">
                        <div class="blueprint-label-top">SEC_A-A' / HAU MAIN BLDG</div>
                        <div class="blueprint-label-bottom">SCALE: 1/100_VECTORIZIED</div>
                        <div class="blueprint-structure">
                            <div class="blueprint-roof"></div>
                            <div class="blueprint-grid">
                                ${Array.from({length: 30}, (_, i) => 
                                    `<div class="blueprint-grid-cell" style="--cell-index: ${i};"></div>`
                                ).join('')}
                            </div>
                            <div class="blueprint-grid-center-h"></div>
                            <div class="blueprint-grid-center-v"></div>
                        </div>
                        <div class="blueprint-annotation-right">
                            <div class="annotation-line"></div>
                            <span class="mono-label">LOAD_BEARING_STR</span>
                        </div>
                        <div class="blueprint-annotation-left">
                            <div class="annotation-line"></div>
                            <span class="mono-label">BRUTALIST_INFLE_02</span>
                        </div>
                    </div>
                    <div class="blueprint-circle">
                        <div class="blueprint-circle-inner"></div>
                    </div>
                </div>
            </div>
        </section>

        <div class="home-content-grid">
            <div>
                <section class="tools-section">
                    <h3 class="tools-label">01_CÔNG CỤ HỌC VỤ</h3>
                    <div class="space-y-4">
                        <div class="illustrated-card">
                            <span class="material-symbols-outlined card-icon">account_tree</span>
                            <h4 class="card-title">QUẢN LÝ ĐỒ ÁN</h4>
                            <p class="card-description">Theo dõi tiến độ từ giai đoạn ý tưởng đến khai triển chi tiết kỹ thuật.</p>
                        </div>
                        <div class="illustrated-card">
                            <span class="material-symbols-outlined card-icon">architecture</span>
                            <h4 class="card-title">TRA CỨU QUY CHUẨN</h4>
                            <p class="card-description">Kho dữ liệu TCVN và quy chuẩn xây dựng Việt Nam tích hợp.</p>
                        </div>
                    </div>
                </section>
            </div>
            <div>
                <section class="knowledge-section">
                    <div class="knowledge-header">
                        <div>
                            <h3 class="knowledge-label">02_NHÓM HỌC TẬP & DIỄN ĐÀN</h3>
                            <h4 class="knowledge-title">Dòng chảy Tri thức </h4>
                        </div>
                        <a href="#" class="knowledge-view-all">XEM TẤT CẢ </a>
                    </div>
                    <div class="knowledge-cards">
                        <div class="knowledge-card">
                            <div class="card-image-container">
                                <img alt="Studio discussion" class="card-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdwLIdNUHuib85a5_fPiWUgm3GMB5Bj7xnz4p_g7XvFpZGBLSiDycmcKt2LjJ2jURp-2F90DszR5Zfa-X-3pEi5g98PO0G9Due-Kh3bUJmcjNjI-h_6pgcf4ZCxSQ1BN-jBxBQRomNKcest8qVv_owHE73Z0wlHKMnxADxcZ_R3icaTRw_O38PyXR0dotOhqB_XrMDHpjPnv_iXOU-AcM9PTA0FqRAMhefEldmWO5ERf_uvzh5yO4Tq2iTEc-NxYoDPxE-K7Peck8">
                                <div class="card-image-overlay"></div>
                                <div class="card-tag">HOT_TOPIC</div>
                            </div>
                            <h5 class="card-title-large">Vật liệu bền vững trong đồ án nhà phố</h5>
                            <p class="card-description-large">Thảo luận về cách tối ưu hóa chi phí vật liệu tre và gỗ ép trong bối cảnh khí hậu nhiệt đới.</p>
                            <div class="card-stats">
                                <span class="card-stat">
                                    <span class="material-symbols-outlined card-stat-icon">chat_bubble</span>
                                    42
                                </span>
                                <span class="card-stat">
                                    <span class="material-symbols-outlined card-stat-icon">visibility</span>
                                    1.2K
                                </span>
                            </div>
                        </div>
                        <div class="knowledge-card">
                            <div class="card-image-container">
                                <img alt="Heritage study" class="card-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJhgn8yMCdn5Aa5DtvCXrUHg8rGm8AvbMUEYv9xSMTGdVXFqDPRXnwYCpCsuxChRbz-ePeJ1L94c2q5-PRs1ytWbzXkME4DBlLqYEe_vNJMrsG6rdxiUCoxqpJmu5OSZ7j5enuI6FDr6ISKToIhViPAOMegEMWx-csWEP_d1ijik4SFfG6n2u_ZSIGMsJCidQVgyoKpLpeSw3z5pxXvopNZZEsFjOnx7h_AOKJnY4_pxWO6wpy6tph8eoyWVjoC8p5QVdUhU2KDu0">
                                <div class="card-image-overlay"></div>
                                <div class="card-tag">ARCHIVE</div>
                            </div>
                            <h5 class="card-title-large">Giải mã tỷ lệ kiến trúc truyền thống</h5>
                            <p class="card-description-large">Phân tích module 'Gian' trong kiến trúc đình chùa Bắc Bộ ứng dụng vào thiết kế đương đại.</p>
                            <div class="card-stats">
                                <span class="card-stat">
                                    <span class="material-symbols-outlined card-stat-icon">chat_bubble</span>
                                    18
                                </span>
                                <span class="card-stat">
                                    <span class="material-symbols-outlined card-stat-icon">visibility</span>
                                    856
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
        `;
        
        const container = document.getElementById('home-content');
        if (container) {
            container.innerHTML = homeContent;
        }
    }
    initEventListeners() {
        // Studio buttons
        const studioBtn = document.querySelector('.btn-arch-primary');
        const heritageBtn = document.querySelector('.btn-arch:not(.btn-arch-primary)');
        
        if (studioBtn) {
            studioBtn.addEventListener('click', () => {
                window.location.href = '../pages/auth/login.html';
            });
        }
        
        if (heritageBtn) {
            heritageBtn.addEventListener('click', () => {
                window.location.href = '#heritage-section';
            });
        }
        
        // Knowledge cards
        const knowledgeCards = document.querySelectorAll('.knowledge-card');
        knowledgeCards.forEach(card => {
            card.addEventListener('click', () => {
                // Navigate to forum topic
                window.location.href = '../pages/forum/forum-home.html';
            });
        });
        
        // View all link
        const viewAllLink = document.querySelector('.knowledge-view-all');
        if (viewAllLink) {
            viewAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '../pages/forum/forum-home.html';
            });
        }
        
        // Tool cards
        const toolCards = document.querySelectorAll('.illustrated-card');
        toolCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index === 0) {
                    // Project management tool
                    window.location.href = '../pages/academic/class-detail.html';
                } else if (index === 1) {
                    // Standards reference
                    window.location.href = '#standards-section';
                }
            });
        });
    }
}