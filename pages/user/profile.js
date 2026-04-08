/**
 * HauHub - Profile Page Script
 * ---------------------------------------------------------
 * Xử lý tất cả các tương tác người dùng cho trang Hồ sơ cá nhân.
 * Hỗ trợ: Chuyển tab, Chỉnh sửa thông tin, Chế độ Giảng viên/Sinh viên,
 * Cập nhật avatar và Bảo mật.
 */

// 1. DỮ LIỆU GIẢ LẬP (MOCK DATA) - Thay thế bằng API thực tế sau này
const MOCK_DATA = {
    student: {
        info: {
            name: "Nguyễn Văn A",
            id: "SV202401",
            type: "Sinh viên Chính quy",
            description: "Khoa Kiến trúc & Quy hoạch • Sinh viên năm 3",
            major: "Kiến trúc Công trình",
            year: "Năm 3",
            enrollmentYear: "2021",
            status: "Đang học",
            gpa: "3.5 / 4.0",
            credits: "95/150",
            email: "vana.nguyen@hau.edu.vn",
            phone: "0987 654 321",
            birthdate: "15/05/2002",
            gender: "male"
        },
        courses: [
            { id: "KT301", name: "Thiết kế Kiến trúc 5", credits: 5, status: "Đang học" },
            { id: "KT102", name: "Cấu tạo Kiến trúc 2", credits: 3, status: "Đang học" },
            { id: "QH201", name: "Quy hoạch đơn vị ở", credits: 3, status: "Đang học" }
        ],
        roles: ["Sinh viên", "Lớp trưởng 21K1", "Thành viên CLB Guitar"],
        permissions: ["Đăng ký tín chỉ", "Xem điểm tổng kết", "Đăng ký ký túc xá", "Sử dụng thư viện"]
    },
    lecturer: {
        info: {
            name: "TS. Trần Thị B",
            id: "GV10203",
            type: "Giảng viên Cơ hữu",
            description: "Khoa Kiến trúc & Quy hoạch • Tổ bộ môn Kiến trúc Dân dụng",
            department: "Kiến trúc & Quy hoạch",
            degree: "Tiến sĩ Kiến trúc",
            position: "Phó Trưởng Khoa",
            office: "P.402 Nhà A1",
            contractType: "Cơ hữu",
            startDate: "01/09/2010",
            email: "thib.tran@hau.edu.vn",
            phone: "0912 345 678",
            birthdate: "20/10/1982",
            gender: "female"
        },
        teaching: [
            { id: "KT101", name: "Nguyên lý thiết kế KT", class: "23K1", schedule: "Thứ 2 (Tiết 1-3)" },
            { id: "KT502", name: "Đồ án tốt nghiệp", class: "19K4", schedule: "Thứ 6 (Tiết 7-10)" }
        ],
        research: [
            { title: "Kiến trúc xanh trong đô thị bền vững", year: "2023", role: "Chủ nhiệm" },
            { title: "Cải tạo nhà tập thể cũ tại Hà Nội", year: "2022", role: "Thành viên" }
        ],
        roles: ["Giảng viên", "Hội đồng khoa học", "Cố vấn học tập"],
        permissions: ["Quản lý điểm lớp học", "Phê duyệt đề tài tốt nghiệp", "Quản lý bài giảng", "Tổ chức hội thảo"]
    },
    activities: [
        { icon: 'login', action: 'Đăng nhập hệ thống', time: '10:15 - Hôm nay', device: 'Chrome / Windows' },
        { icon: 'key', action: 'Thay đổi mật khẩu', time: '09:00 - 20/05/2024', device: 'Safari / iPhone 13' },
        { icon: 'edit', action: 'Cập nhật số điện thoại', time: '14:20 - 15/05/2024', device: 'Chrome / Windows' }
    ]
};

// 2. BIẾN TOÀN CỤC
let isEditMode = false;
const userType = document.body.dataset.userType || 'student'; // 'student' hoặc 'lecturer'
const currentData = MOCK_DATA[userType];

// 3. KHỞI TẠO KHI TRANG SẴN SÀNG
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    handleTabs();
    handleEditProfile();
    handleAvatarChange();
    handleSecurity();
    handleShareProfile();
});

/**
 * Khởi tạo giao diện dựa trên loại người dùng
 */
function initUI() {
    // Cập nhật thông tin Header hồ sơ
    document.getElementById('user-name').textContent = currentData.info.name;
    document.getElementById('user-id').textContent = currentData.info.id;
    document.getElementById('user-type').textContent = currentData.info.type;
    document.getElementById('user-description').textContent = currentData.info.description;

    // Cập nhật Tab 1: Thông tin cá nhân
    document.getElementById('full-name').value = currentData.info.name;
    document.getElementById('birthdate').value = currentData.info.birthdate;
    document.getElementById('email').value = currentData.info.email;
    document.getElementById('phone').value = currentData.info.phone;
    
    // Set radio gender
    const genderRadios = document.getElementsByName('gender');
    genderRadios.forEach(radio => {
        if (radio.value === currentData.info.gender) radio.checked = true;
    });

    // Cập nhật Tab 2: Học vụ / Giảng dạy
    const studentView = document.getElementById('student-view');
    const lecturerView = document.getElementById('lecturer-view');
    const tabTitleAcademic = document.getElementById('tab-title-academic');

    if (userType === 'student') {
        studentView.style.display = 'block';
        lecturerView.style.display = 'none';
        tabTitleAcademic.textContent = "Hồ sơ học vụ";
        renderStudentAcademic();
    } else {
        studentView.style.display = 'none';
        lecturerView.style.display = 'block';
        tabTitleAcademic.textContent = "Hồ sơ giảng dạy";
        renderLecturerAcademic();
    }

    // Cập nhật Tab 3 & 4: Bảo mật & Quyền hạn
    renderActivityLog();
    renderRolesAndPermissions();
}

/**
 * Xử lý chuyển đổi Tab
 */
function handleTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Xóa active cũ
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Thêm active mới
            tab.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });
}

/**
 * Xử lý Chế độ Chỉnh sửa hồ sơ
 */
function handleEditProfile() {
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.querySelector('.btn-save');
    const cancelBtn = document.querySelector('.btn-cancel');
    const inputs = document.querySelectorAll('#tab-personal .form-input');
    const radios = document.querySelectorAll('#tab-personal input[type="radio"]');

    editBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;
        toggleInputs(isEditMode);
    });

    cancelBtn.addEventListener('click', () => {
        isEditMode = false;
        toggleInputs(false);
        // Reset về dữ liệu ban đầu (lý thuyết)
    });

    saveBtn.addEventListener('click', () => {
        // Giả lập lưu dữ liệu
        saveBtn.innerHTML = '<span class="material-symbols-outlined spinning">sync</span> Đang lưu...';
        saveBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            isEditMode = false;
            toggleInputs(false);
            saveBtn.innerHTML = 'Lưu thay đổi';
            saveBtn.style.pointerEvents = 'auto';
            showToast("Cập nhật thông tin thành công!");
        }, 1500);
    });

    function toggleInputs(enable) {
        inputs.forEach(input => {
            if (input.id !== 'username') { // Username không bao giờ cho sửa
                input.readOnly = !enable;
                if (enable) input.classList.add('editing');
                else input.classList.remove('editing');
            }
        });

        radios.forEach(r => r.disabled = !enable);
        saveBtn.disabled = !enable;
        cancelBtn.disabled = !enable;

        if (enable) {
            editBtn.innerHTML = '<span class="material-symbols-outlined">close</span> Hủy chỉnh sửa';
            editBtn.style.backgroundColor = 'var(--bg-light)';
        } else {
            editBtn.innerHTML = '<span class="material-symbols-outlined">edit</span> Chỉnh sửa hồ sơ';
            editBtn.style.backgroundColor = '';
        }
    }
}

/**
 * Xử lý thay đổi ảnh đại diện
 */
function handleAvatarChange() {
    const btn = document.getElementById('changeAvatarBtn');
    const avatarImg = document.getElementById('profile-avatar');

    btn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    avatarImg.src = event.target.result;
                    showToast("Đã cập nhật ảnh đại diện!");
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });
}

/**
 * Render dữ liệu học tập (Sinh viên)
 */
function renderStudentAcademic() {
    document.getElementById('student-code').textContent = currentData.info.id;
    document.getElementById('major').textContent = currentData.info.major;
    document.getElementById('enrollment-year').textContent = currentData.info.enrollmentYear;
    document.getElementById('current-year').textContent = currentData.info.year;
    document.getElementById('study-status').textContent = currentData.info.status;
    document.getElementById('gpa-credits').textContent = `${currentData.info.gpa} / ${currentData.info.credits}`;

    const list = document.querySelector('.course-list');
    list.innerHTML = currentData.courses.map(c => `
        <div class="course-item">
            <div class="course-info">
                <span class="course-code">${c.id}</span>
                <span class="course-name">${c.name}</span>
            </div>
            <div class="course-meta">
                <span>${c.credits} tín chỉ</span>
                <span class="status-badge">${c.status}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Render dữ liệu giảng dạy (Giảng viên)
 */
function renderLecturerAcademic() {
    document.getElementById('department').textContent = currentData.info.department;
    document.getElementById('degree').textContent = currentData.info.degree;
    document.getElementById('position').textContent = currentData.info.position;
    document.getElementById('office').textContent = currentData.info.office;
    document.getElementById('contract-type').textContent = currentData.info.contractType;
    document.getElementById('start-date').textContent = currentData.info.startDate;

    const teachingList = document.querySelector('.teaching-list');
    teachingList.innerHTML = currentData.teaching.map(t => `
        <div class="teaching-item">
            <div class="teaching-main">
                <span class="course-name">${t.name}</span>
                <span class="class-id">Lớp: ${t.class}</span>
            </div>
            <div class="teaching-schedule">
                <span class="material-symbols-outlined">calendar_today</span> ${t.schedule}
            </div>
        </div>
    `).join('');

    const researchList = document.querySelector('.research-list');
    researchList.innerHTML = currentData.research.map(r => `
        <div class="research-item">
            <div class="research-header">
                <strong>${r.title}</strong>
                <span class="year-badge">${r.year}</span>
            </div>
            <div class="research-role">Vai trò: ${r.role}</div>
        </div>
    `).join('');
}

/**
 * Render Nhật ký hoạt động & Quyền hạn
 */
function renderActivityLog() {
    const list = document.querySelector('.activity-list');
    list.innerHTML = MOCK_DATA.activities.map(a => `
        <div class="activity-item">
            <div class="activity-icon">
                <span class="material-symbols-outlined">${a.icon}</span>
            </div>
            <div class="activity-info">
                <div class="activity-action">${a.action}</div>
                <div class="activity-meta">${a.time} • ${a.device}</div>
            </div>
        </div>
    `).join('');
}

function renderRolesAndPermissions() {
    const rolesContainer = document.querySelector('.roles-list');
    rolesContainer.innerHTML = currentData.roles.map(r => `
        <span class="role-badge-item">${r}</span>
    `).join('');

    const permsContainer = document.querySelector('.permissions-list');
    permsContainer.innerHTML = currentData.permissions.map(p => `
        <div class="permission-item">
            <span class="material-symbols-outlined">verified</span>
            ${p}
        </div>
    `).join('');
}

/**
 * Xử lý Đổi mật khẩu
 */
function handleSecurity() {
    const btn = document.getElementById('updatePasswordBtn');
    btn.addEventListener('click', () => {
        const cur = document.getElementById('current-password').value;
        const newP = document.getElementById('new-password').value;
        const cfm = document.getElementById('confirm-password').value;

        if (!cur || !newP || !cfm) {
            showToast("Vui lòng điền đầy đủ các trường!", "error");
            return;
        }

        if (newP !== cfm) {
            showToast("Mật khẩu xác nhận không khớp!", "error");
            return;
        }

        showToast("Thay đổi mật khẩu thành công!");
        document.querySelectorAll('#tab-security input').forEach(i => i.value = '');
    });
}

/**
 * Chia sẻ hồ sơ
 */
function handleShareProfile() {
    const shareBtn = document.getElementById('share-profile-btn');
    shareBtn.addEventListener('click', () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: 'HauHub Profile',
                text: `Hồ sơ của ${currentData.info.name} trên HauHub`,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            showToast("Đã sao chép liên kết vào bộ nhớ tạm!");
        }
    });
}

/**
 * Hàm hỗ trợ hiển thị thông báo nhanh (Toast)
 */
function showToast(message, type = "success") {
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
        ${message}
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}