/**
 * Profile Page JavaScript
 * Handles user profile functionality for both students and lecturers
 */

class ProfilePage {
    constructor() {
        this.currentUser = null;
        this.userType = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.setupTabs();
        this.updateUIForUserType();
    }

    async loadUserData() {
        try {
            // Check if user is logged in
            const isLoggedIn = await this.checkAuthStatus();
            if (!isLoggedIn) {
                this.redirectToLogin();
                return;
            }

            // Load user data based on URL params or auth
            const userId = this.getUserIdFromURL() || this.getCurrentUserId();
            const userData = await this.fetchUserData(userId);
            
            this.currentUser = userData;
            this.userType = userData.type; // 'student' or 'lecturer'
            
            this.populateUserData();
            this.updateTabTitle();
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Không thể tải thông tin người dùng');
        }
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Edit profile button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.toggleEditMode();
            });
        }

        // Save changes button
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProfileChanges();
            });
        }

        // Cancel button
        const cancelBtn = document.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelChanges();
            });
        }

        // Form inputs change tracking
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                this.trackChanges();
            });
        });
    }

    setupTabs() {
        // Show first tab by default
        this.switchTab('personal');
    }

    switchTab(tabId) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });

        // Show corresponding tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `tab-${tabId}`) {
                content.classList.add('active');
            }
        });

        // Load tab data if needed
        this.loadTabData(tabId);
    }

    loadTabData(tabId) {
        switch (tabId) {
            case 'academic':
                this.loadAcademicData();
                break;
            case 'security':
                this.loadSecurityData();
                break;
            case 'roles':
                this.loadRolesData();
                break;
        }
    }

    updateUIForUserType() {
        // Update page data attribute
        document.body.dataset.userType = this.userType;

        // Update tab title
        this.updateTabTitle();

        // Show/hide appropriate views
        const studentView = document.getElementById('student-view');
        const lecturerView = document.getElementById('lecturer-view');

        if (this.userType === 'student') {
            if (studentView) studentView.style.display = 'block';
            if (lecturerView) lecturerView.style.display = 'none';
        } else if (this.userType === 'lecturer') {
            if (studentView) studentView.style.display = 'none';
            if (lecturerView) lecturerView.style.display = 'block';
        }

        // Update hero section
        this.updateHeroSection();
    }

    updateTabTitle() {
        const tabTitle = document.getElementById('tab-title-academic');
        if (tabTitle) {
            tabTitle.textContent = this.userType === 'student' 
                ? 'Hồ sơ học vụ' 
                : 'Hồ sơ giảng dạy';
        }
    }

    updateHeroSection() {
        // Update user type display
        const userTypeElement = document.getElementById('user-type');
        if (userTypeElement) {
            userTypeElement.textContent = this.userType === 'student'
                ? 'Sinh viên Chính quy'
                : 'Giảng viên';
        }

        // Update description based on user type
        const descriptionElement = document.getElementById('user-description');
        if (descriptionElement && this.currentUser) {
            if (this.userType === 'student') {
                descriptionElement.textContent = `${this.currentUser.major || 'Khoa'} • Sinh viên năm ${this.currentUser.year || 'N/A'}`;
            } else {
                descriptionElement.textContent = `${this.currentUser.department || 'Khoa'} • ${this.currentUser.position || 'Giảng viên'}`;
            }
        }
    }

    populateUserData() {
        if (!this.currentUser) return;

        // Personal info
        this.setElementValue('full-name', this.currentUser.fullName);
        this.setElementValue('birthdate', this.formatDate(this.currentUser.birthdate));
        this.setElementValue('username', this.currentUser.username);
        this.setElementValue('email', this.currentUser.email);
        this.setElementValue('phone', this.currentUser.phone);

        // Set gender radio
        if (this.currentUser.gender) {
            const genderRadio = document.querySelector(`input[name="gender"][value="${this.currentUser.gender}"]`);
            if (genderRadio) {
                genderRadio.checked = true;
            }
        }

        // User ID and name
        this.setElementValue('user-name', this.currentUser.fullName);
        this.setElementValue('user-id', this.currentUser.userId || this.currentUser.code);

        // Student specific
        if (this.userType === 'student') {
            this.setElementValue('student-code', this.currentUser.code);
            this.setElementValue('major', this.currentUser.major);
            this.setElementValue('enrollment-year', this.currentUser.enrollmentYear);
            this.setElementValue('current-year', this.currentUser.currentYear);
            this.setElementValue('study-status', this.currentUser.status);
            this.setElementValue('gpa-credits', `${this.currentUser.gpa || 'N/A'} / ${this.currentUser.credits || '0'} tín chỉ`);
        }

        // Lecturer specific
        if (this.userType === 'lecturer') {
            this.setElementValue('department', this.currentUser.department);
            this.setElementValue('degree', this.currentUser.degree);
            this.setElementValue('position', this.currentUser.position);
            this.setElementValue('office', this.currentUser.office);
            this.setElementValue('contract-type', this.currentUser.contractType);
            this.setElementValue('start-date', this.formatDate(this.currentUser.startDate));
        }
    }

    async loadAcademicData() {
        try {
            if (this.userType === 'student') {
                await this.loadStudentCourses();
            } else {
                await this.loadLecturerCourses();
                await this.loadResearchProjects();
            }
        } catch (error) {
            console.error('Error loading academic data:', error);
        }
    }

    async loadStudentCourses() {
        // Mock data - replace with API call
        const courses = [
            {
                name: 'Lý thuyết Kiến trúc Đương đại',
                code: 'ARC301',
                credit: 3,
                semester: 'Kỳ 1'
            },
            {
                name: 'Đồ án Quy hoạch Đô thị 1',
                code: 'URP302',
                credit: 5,
                semester: 'Kỳ 1'
            },
            {
                name: 'Kết cấu Công trình',
                code: 'STR303',
                credit: 4,
                semester: 'Kỳ 1'
            }
        ];

        const courseList = document.querySelector('.course-list');
        if (!courseList) return;

        courseList.innerHTML = courses.map(course => `
            <div class="course-item">
                <div class="course-info">
                    <div class="course-name">${course.name}</div>
                    <div class="course-meta">${course.code} • ${course.credit} tín chỉ • ${course.semester}</div>
                </div>
                <span class="material-symbols-outlined course-arrow">chevron_right</span>
            </div>
        `).join('');
    }

    async loadLecturerCourses() {
        // Mock data - replace with API call
        const subjects = [
            {
                name: 'Lý thuyết Kiến trúc Đương đại',
                credit: 3,
                hours: 45,
                semester: 'Kỳ 1'
            },
            {
                name: 'Đồ án Quy hoạch Đô thị 1',
                credit: 5,
                hours: 75,
                semester: 'Kỳ 1'
            },
            {
                name: 'Quản lý Đô thị Thông minh',
                credit: 4,
                hours: 60,
                program: 'Cao học'
            }
        ];

        const teachingList = document.querySelector('.teaching-list');
        if (!teachingList) return;

        teachingList.innerHTML = subjects.map(subject => `
            <div class="teaching-item">
                <div class="teaching-info">
                    <div class="subject-name">${subject.name}</div>
                    <div class="subject-meta">${subject.program || 'Đại học'} • ${subject.credit} Tín chỉ • ${subject.hours} Tiết</div>
                </div>
                <span class="material-symbols-outlined teaching-arrow">chevron_right</span>
            </div>
        `).join('');
    }

    async loadResearchProjects() {
        // Mock data - replace with API call
        const projects = [
            {
                status: 'Hiện tại',
                title: 'Chủ nhiệm đề tài cấp Bộ: "Số hóa không gian di sản tại Hà Nội"'
            },
            {
                status: 'Sắp tới',
                title: 'Tư vấn Quy hoạch Khu công nghệ cao HauHub Campus 2'
            }
        ];

        const researchList = document.querySelector('.research-list');
        if (!researchList) return;

        researchList.innerHTML = projects.map(project => `
            <div class="research-item">
                <div class="research-label">${project.status}</div>
                <div class="research-title">${project.title}</div>
            </div>
        `).join('');
    }

    async loadSecurityData() {
        // Mock activity data
        const activities = [
            {
                action: 'Đăng nhập thành công',
                device: 'Chrome trên Windows',
                time: '2 giờ trước'
            },
            {
                action: 'Thay đổi mật khẩu',
                device: 'Mobile App',
                time: '3 ngày trước'
            },
            {
                action: 'Cập nhật thông tin cá nhân',
                device: 'Safari trên macOS',
                time: '1 tuần trước'
            }
        ];

        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-info">
                    <div class="activity-action">${activity.action}</div>
                    <div class="activity-details">${activity.device}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    async loadRolesData() {
        // Mock roles data
        const roles = [
            {
                name: 'Sinh viên',
                description: 'Quyền truy cập học tập cơ bản'
            },
            {
                name: 'Thành viên diễn đàn',
                description: 'Đăng bài và thảo luận'
            }
        ];

        const rolesList = document.querySelector('.roles-list');
        if (!rolesList) return;

        rolesList.innerHTML = roles.map(role => `
            <div class="role-card">
                <div class="role-name">${role.name}</div>
                <div class="role-desc">${role.description}</div>
            </div>
        `).join('');

        // Mock permissions
        const permissions = [
            {
                name: 'Xem điểm số',
                description: 'Quyền xem điểm cá nhân'
            },
            {
                name: 'Đăng ký môn học',
                description: 'Quyền đăng ký học phần'
            },
            {
                name: 'Truy cập tài liệu',
                description: 'Truy cập thư viện số'
            }
        ];

        const permissionsList = document.querySelector('.permissions-list');
        if (!permissionsList) return;

        permissionsList.innerHTML = permissions.map(perm => `
            <div class="permission-card">
                <div class="permission-name">${perm.name}</div>
                <div class="permission-desc">${perm.desc}</div>
            </div>
        `).join('');
    }

    toggleEditMode() {
        const inputs = document.querySelectorAll('.form-input:not([disabled])');
        const isEditing = inputs[0]?.hasAttribute('readonly');

        if (isEditing) {
            // Enable editing
            inputs.forEach(input => {
                input.removeAttribute('readonly');
                input.style.backgroundColor = 'white';
            });
        } else {
            // Disable editing
            inputs.forEach(input => {
                input.setAttribute('readonly', true);
                input.style.backgroundColor = 'rgba(10, 36, 99, 0.05)';
            });
        }
    }

    async saveProfileChanges() {
        try {
            const formData = this.collectFormData();
            
            // Validate data
            if (!this.validateFormData(formData)) {
                this.showError('Vui lòng kiểm tra lại thông tin');
                return;
            }

            // Show loading
            this.showLoading(true);

            // Save to server
            await this.saveUserData(formData);

            // Update local data
            this.currentUser = { ...this.currentUser, ...formData };
            
            // Show success message
            this.showSuccess('Đã cập nhật thông tin thành công');
            
            // Exit edit mode
            this.toggleEditMode();

        } catch (error) {
            console.error('Error saving profile:', error);
            this.showError('Không thể lưu thay đổi');
        } finally {
            this.showLoading(false);
        }
    }

    collectFormData() {
        return {
            fullName: document.getElementById('full-name').value,
            birthdate: document.getElementById('birthdate').value,
            gender: document.querySelector('input[name="gender"]:checked')?.value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };
    }

    validateFormData(data) {
        // Basic validation
        if (!data.fullName || data.fullName.trim() === '') {
            return false;
        }
        if (!data.email || !this.isValidEmail(data.email)) {
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    cancelChanges() {
        // Reset form to original data
        this.populateUserData();
        
        // Exit edit mode
        const inputs = document.querySelectorAll('.form-input:not([disabled])');
        inputs.forEach(input => {
            input.setAttribute('readonly', true);
            input.style.backgroundColor = 'rgba(10, 36, 99, 0.05)';
        });
    }

    trackChanges() {
        // Track if form has changes for better UX
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.disabled = false;
        }
    }

    // Utility methods
    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element && value) {
            if (element.tagName === 'INPUT') {
                element.value = value;
            } else {
                element.textContent = value;
            }
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    getUserIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    getCurrentUserId() {
        // Get from localStorage or auth system
        return localStorage.getItem('user_id');
    }

    async checkAuthStatus() {
        // Check if user is authenticated
        const token = localStorage.getItem('auth_token');
        return !!token;
    }

    redirectToLogin() {
        window.location.href = '../auth/login.html';
    }

    async fetchUserData(userId) {
        // Mock API call - replace with actual API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock data based on user type
                const userType = Math.random() > 0.5 ? 'student' : 'lecturer';
                
                if (userType === 'student') {
                    resolve({
                        id: userId,
                        type: 'student',
                        fullName: 'Nguyễn Văn A',
                        username: 'vana.nguyen_2024',
                        email: 'vana.nguyen@hau.edu.vn',
                        phone: '0987 654 321',
                        birthdate: '2002-05-15',
                        gender: 'male',
                        code: 'SV202401',
                        major: 'Kiến trúc Công trình',
                        enrollmentYear: '2024',
                        currentYear: 'Năm 1',
                        status: 'Đang học',
                        gpa: '3.5',
                        credits: '45',
                        avatar: '../../assets/images/avatars/student.jpg'
                    });
                } else {
                    resolve({
                        id: userId,
                        type: 'lecturer',
                        fullName: 'TS. Nguyễn Văn A',
                        username: 'vana.nguyen_lecturer',
                        email: 'vana.nguyen@hau.edu.vn',
                        phone: '0987 654 321',
                        birthdate: '1980-08-20',
                        gender: 'male',
                        code: 'GV202401',
                        department: 'Kiến trúc & Quy hoạch',
                        degree: 'Tiến sĩ Kiến trúc',
                        position: 'Phó Trưởng Khoa',
                        office: 'P.402 Nhà A1',
                        contractType: 'Cơ hữu',
                        startDate: '2010-09-01',
                        avatar: '../../assets/images/avatars/lecturer.jpg'
                    });
                }
            }, 500);
        });
    }

    async saveUserData(data) {
        // Mock API call - replace with actual API
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Saving user data:', data);
                resolve({ success: true });
            }, 1000);
        });
    }

    showLoading(show) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            if (show) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        });
    }

    showSuccess(message) {
        // Use your notification system here
        alert(message); // Replace with better notification
    }

    showError(message) {
        // Use your notification system here
        alert(message); // Replace with better notification
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const profilePage = new ProfilePage();
    window.profilePage = profilePage;
});