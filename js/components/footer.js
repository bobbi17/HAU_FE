// js/components/footer.js - UPDATED WITH 4 COLUMNS DESIGN
export class Footer {
    constructor() {
        this.render();
        this.initEventListeners();
    }
    
    render() {
        const currentYear = new Date().getFullYear();
        
        const footerHTML = `
        <footer class="main-footer">
            <div class="footer-container">
                <!-- Campus Illustration Background -->
                <div class="campus-illustration">
                    <svg class="campus-svg" fill="none" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 400H1200M100 400V250H200V400M250 400V150H450V220H550V400M600 400V300H700V400M750 400V100H900V350H1000V400M1050 400V280H1150V400" stroke="#1e4d8c" stroke-width="1"></path>
                        <path d="M250 150L350 100L450 150M750 100L825 50L900 100" stroke="#1e4d8c" stroke-width="1"></path>
                        <circle cx="350" cy="180" r="15" stroke="#1e4d8c" stroke-width="1"></circle>
                        <rect height="10" stroke="#1e4d8c" stroke-width="0.5" width="10" x="280" y="170"></rect>
                        <rect height="10" stroke="#1e4d8c" stroke-width="0.5" width="10" x="300" y="170"></rect>
                        <rect height="10" stroke="#1e4d8c" stroke-width="0.5" width="10" x="320" y="170"></rect>
                    </svg>
                </div>
                
                <div class="footer-content">
                    <div class="footer-grid">
                        <!-- Cột 1: Brand & Description -->
                        <div class="footer-brand-section">
                            <div class="footer-brand">
                                <div class="footer-logo">
                                    <svg class="footer-logo-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <path d="M7 4V20M17 4L7 12L17 20" stroke-linecap="square"></path>
                                    </svg>
                                </div>
                                <span class="footer-brand-name">HAU HUB</span>
                            </div>
                            <p class="footer-description">
                                Nền tảng số hóa học thuật dành riêng cho cộng đồng Trường Đại học Kiến trúc Hà Nội.
                            </p>
                            <div class="footer-social">
                                <a href="#" class="social-link" aria-label="Facebook">
                                    <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                                    </svg>
                                </a>
                                <a href="#" class="social-link" aria-label="YouTube">
                                    <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        
                        <!-- Cột 2: HỖ TRỢ (CHỮ HOA) -->
                        <div class="footer-column">
                             <h4 class="footer-column-title">TÀI NGUYÊN</h4>
                            <ul class="footer-links">
                                <li><a href="../../pages/index.html" class="footer-link">
                                    Trang chủ
                                </a></li>
                                <li><a href="../../pages/academic/subjects.html" class="footer-link">
                                    Học vụ
                                </a></li>
                                <li><a href="../../pages/forum/forum-home.html" class="footer-link">
                                    Nhóm học tập
                                </a></li>
                                <li><a href="#" class="footer-link">
                                    Diễn đàn trường
                                </a></li>
                            </ul>
                        </div>
                        
                        <!-- Cột 3: TÀI NGUYÊN (CHỮ HOA) -->
                        <div class="footer-column">
                             <h4 class="footer-column-title">HỖ TRỢ</h4>
                            <ul class="footer-links">
                                <li><a href="#" class="footer-link">
                                    TRUNG TÂM TRỢ GIÚP
                                </a></li>
                                <li><a href="#" class="footer-link">
                                    QUY ĐỊNH ĐÀO TẠO
                                </a></li>
                                <li><a href="#" class="footer-link">
                                    PHÒNG BAN LIÊN QUAN
                                </a></li>
                            </ul>
                        </div>
                        
                        <!-- Cột 4: LIÊN HỆ (chữ thường) -->
                        <div class="footer-column">
                            <h4 class="footer-column-title">LIÊN HỆ</h4>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <span class="material-symbols-outlined contact-icon">location_on</span>
                                    <p>Km10 Nguyễn Trãi, Thanh Xuân, Hà Nội</p>
                                </div>
                                <div class="contact-item">
                                    <span class="material-symbols-outlined contact-icon">phone</span>
                                    <p>024.3854.4243</p>
                                </div>
                                <div class="contact-item">
                                    <span class="material-symbols-outlined contact-icon">mail</span>
                                    <p>contact@hauhub.edu.vn</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer Bottom -->
                    <div class="footer-bottom">
                        <div class="footer-bottom-left">
                            <span class="copyright">© ${currentYear} HAU HUB SYSTEM</span>
                            <span class="divider"></span>
                        </div>
                        <div class="footer-bottom-right">
                            <a href="#" class="footer-policy-link">Chính sách</a>
                            <a href="#" class="footer-policy-link">Hệ thống</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        `;
        
        document.querySelector('footer').innerHTML = footerHTML;
    }
    
    initEventListeners() {
        // Các event listeners giữ nguyên
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Social link clicked');
            });
        });
        
        const footerLinks = document.querySelectorAll('.footer-link');
        footerLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const indicator = link.querySelector('.link-indicator');
                if (indicator) {
                    indicator.style.width = '6px';
                }
            });
            
            link.addEventListener('mouseleave', () => {
                const indicator = link.querySelector('.link-indicator');
                if (indicator) {
                    indicator.style.width = '0';
                }
            });
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    window.location.href = href;
                }
            });
        });
    }
}



