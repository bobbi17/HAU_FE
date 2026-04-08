// class-management.js - Complete Version

import { Header } from '../../js/components/header.js';
import { Footer } from '../../js/components/footer.js';
import { AIChatWidget } from '../../js/components/chat-widget.js';

// ==================== MOCK DATA ====================
const subjects = [
    { code: 'KTS101', name: 'Kiến trúc Dân dụng 1', faculty: 'Khoa Kiến trúc', credits: 3, type: 'Bắt buộc', description: 'Nguyên lý thiết kế không gian chức năng trong nhà ở dân dụng.' },
    { code: 'KTS102', name: 'Kiến trúc Dân dụng 2', faculty: 'Khoa Kiến trúc', credits: 3, type: 'Bắt buộc', description: 'Thiết kế nhà ở nhiều tầng, chung cư và nhà ở đô thị.' },
    { code: 'QH201', name: 'Quy hoạch Đô thị', faculty: 'Khoa Quy hoạch', credits: 4, type: 'Bắt buộc', description: 'Phân tích và thiết kế không gian đô thị bền vững.' },
    { code: 'QH202', name: 'Quy hoạch Giao thông', faculty: 'Khoa Quy hoạch', credits: 3, type: 'Tự chọn', description: 'Thiết kế hệ thống giao thông đô thị.' },
    { code: 'XD301', name: 'Kết cấu Bê tông', faculty: 'Khoa Xây dựng', credits: 3, type: 'Bắt buộc', description: 'Thiết kế kết cấu bê tông cốt thép.' },
    { code: 'NT401', name: 'Nội thất Căn hộ', faculty: 'Khoa Nội thất', credits: 2, type: 'Tự chọn', description: 'Thiết kế nội thất không gian sống hiện đại.' }
];

const classes = [
    { code: 'ARC302', name: 'Thiết kế Kiến trúc Dân dụng 3', instructor: 'TS. KTS Nguyễn Hoàng', schedule: 'Thứ 3,5 (8:00-11:30)', credits: 3, capacity: '45/50', status: 'Còn chỗ', subjectCode: 'KTS101', room: '402-H1' },
    { code: 'QH402', name: 'Quy hoạch Đô thị Bền vững', instructor: 'ThS. Trần Minh Tuấn', schedule: 'Thứ 2,4 (13:30-17:00)', credits: 4, capacity: '40/45', status: 'Sắp đầy', subjectCode: 'QH201', room: '501-H2' },
    { code: 'XD201', name: 'Kết cấu Thép Ứng dụng', instructor: 'TS. Lê Văn Cường', schedule: 'Thứ 6 (8:00-11:30)', credits: 3, capacity: '38/50', status: 'Còn chỗ', subjectCode: 'XD301', room: '301-H3' },
    { code: 'NT301', name: 'Nội thất Thương mại', instructor: 'ThS. Phạm Thị Hương', schedule: 'Thứ 3 (13:30-17:00)', credits: 2, capacity: '30/35', status: 'Còn chỗ', subjectCode: 'NT401', room: '205-H4' }
];

// Local storage
let registeredClasses = JSON.parse(localStorage.getItem('registeredClasses') || '[]');
let currentTab = 'subjects';
let currentFilter = 'all';
let sortAscending = true;

// ==================== HELPER FUNCTIONS ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateStats() {
    document.getElementById('totalSubjects').textContent = subjects.length;
    document.getElementById('totalClasses').textContent = classes.length;
    document.getElementById('registeredCount').textContent = registeredClasses.length;
    
    const availableSlots = classes.filter(c => c.status === 'Còn chỗ').length;
    document.getElementById('availableSlots').textContent = availableSlots;
}

// ==================== RENDER FUNCTIONS ====================
function renderSubjects() {
    let filtered = [...subjects];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(s => 
            currentFilter === 'required' ? s.type === 'Bắt buộc' : s.type === 'Tự chọn'
        );
    }
    
    filtered.sort((a, b) => sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    
    const container = document.getElementById('dynamicContent');
    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">search</span><p>Không tìm thấy môn học nào</p></div>`;
        return;
    }
    
    container.innerHTML = filtered.map(s => `
        <div class="content-card" data-code="${s.code}" data-type="subject">
            <div class="card-header">
                <span class="card-code">${escapeHtml(s.code)}</span>
                <span class="card-type ${s.type === 'Bắt buộc' ? 'required' : 'elective'}">${escapeHtml(s.type)}</span>
            </div>
            <h3 class="card-title">${escapeHtml(s.name)}</h3>
            <p class="card-description">${escapeHtml(s.description)}</p>
            <div class="card-footer">
                <div class="card-meta">
                    <span><span class="material-symbols-outlined">account_balance</span> ${escapeHtml(s.faculty)}</span>
                    <span><span class="material-symbols-outlined">grade</span> ${s.credits} tín chỉ</span>
                </div>
                <div class="card-actions">
                    <button class="btn-detail" data-code="${s.code}" data-type="subject">Chi tiết</button>
                </div>
            </div>
        </div>
    `).join('');
    
    attachCardEvents();
}

function renderClasses() {
    let filtered = [...classes];
    
    filtered.sort((a, b) => sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    
    const container = document.getElementById('dynamicContent');
    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">search</span><p>Không tìm thấy lớp học nào</p></div>`;
        return;
    }
    
    container.innerHTML = filtered.map(c => `
        <div class="content-card" data-code="${c.code}" data-type="class">
            <div class="card-header">
                <span class="card-code">${escapeHtml(c.code)}</span>
                <span class="card-type ${c.status === 'Còn chỗ' ? 'available' : 'almost-full'}">${c.status}</span>
            </div>
            <h3 class="card-title">${escapeHtml(c.name)}</h3>
            <div class="card-footer">
                <div class="card-meta">
                    <span><span class="material-symbols-outlined">person</span> ${escapeHtml(c.instructor)}</span>
                    <span><span class="material-symbols-outlined">schedule</span> ${c.schedule}</span>
                    <span><span class="material-symbols-outlined">grade</span> ${c.credits} TC</span>
                </div>
                <div class="card-actions">
                    <button class="btn-detail" data-code="${c.code}" data-type="class">Chi tiết</button>
                    ${!registeredClasses.includes(c.code) && c.status === 'Còn chỗ' ? 
                        `<button class="btn-register" data-code="${c.code}">Đăng ký</button>` : 
                        registeredClasses.includes(c.code) ? 
                        `<button class="cancel-btn" data-code="${c.code}">Hủy</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    attachCardEvents();
}

function renderMyClasses() {
    const myClasses = classes.filter(c => registeredClasses.includes(c.code));
    const container = document.getElementById('dynamicContent');
    
    if (myClasses.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">school</span><p>Bạn chưa đăng ký lớp học nào</p></div>`;
        return;
    }
    
    container.innerHTML = myClasses.map(c => `
        <div class="content-card" data-code="${c.code}" data-type="class">
            <div class="card-header">
                <span class="card-code">${escapeHtml(c.code)}</span>
                <span class="card-type ${c.status === 'Còn chỗ' ? 'available' : 'almost-full'}">${c.status}</span>
            </div>
            <h3 class="card-title">${escapeHtml(c.name)}</h3>
            <div class="card-footer">
                <div class="card-meta">
                    <span><span class="material-symbols-outlined">person</span> ${escapeHtml(c.instructor)}</span>
                    <span><span class="material-symbols-outlined">schedule</span> ${c.schedule}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-detail" data-code="${c.code}" data-type="class">Chi tiết</button>
                    <button class="cancel-btn" data-code="${c.code}">Hủy đăng ký</button>
                </div>
            </div>
        </div>
    `).join('');
    
    attachCardEvents();
}

function attachCardEvents() {
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const code = btn.dataset.code;
            const type = btn.dataset.type;
            if (type === 'subject') showSubjectDetail(code);
            else showClassDetail(code);
        });
    });
    
    document.querySelectorAll('.btn-register').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            registerClass(btn.dataset.code);
        });
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelRegistration(btn.dataset.code);
        });
    });
}

// ==================== MODAL FUNCTIONS ====================
function showSubjectDetail(code) {
    const subject = subjects.find(s => s.code === code);
    if (!subject) return;
    
    document.getElementById('modalSubjectName').textContent = subject.name;
    document.getElementById('modalSubjectCode').textContent = subject.code;
    document.getElementById('modalSubjectType').textContent = subject.type;
    document.getElementById('modalSubjectFaculty').textContent = subject.faculty;
    document.getElementById('modalSubjectCredits').textContent = `${subject.credits} tín chỉ`;
    document.getElementById('modalSubjectDescription').textContent = subject.description;
    
    const viewClassesBtn = document.getElementById('viewClassesFromModal');
    viewClassesBtn.onclick = () => {
        document.getElementById('subjectModal').classList.add('hidden');
        switchTab('classes');
    };
    
    document.getElementById('subjectModal').classList.remove('hidden');
}

function showClassDetail(code) {
    const classItem = classes.find(c => c.code === code);
    if (!classItem) return;
    
    document.getElementById('modalClassName').textContent = classItem.name;
    document.getElementById('modalClassCode').textContent = classItem.code;
    document.getElementById('modalClassInstructor').textContent = classItem.instructor;
    document.getElementById('modalClassSchedule').textContent = classItem.schedule;
    document.getElementById('modalClassCapacity').textContent = classItem.capacity;
    
    const statusEl = document.getElementById('modalClassStatus');
    statusEl.textContent = classItem.status;
    statusEl.style.color = classItem.status === 'Còn chỗ' ? '#10b981' : '#f59e0b';
    
    const registerBtn = document.getElementById('registerFromModal');
    if (registeredClasses.includes(code) || classItem.status !== 'Còn chỗ') {
        registerBtn.style.display = 'none';
    } else {
        registerBtn.style.display = 'inline-flex';
        registerBtn.onclick = () => {
            registerClass(code);
            document.getElementById('classModal').classList.add('hidden');
        };
    }
    
    document.getElementById('classModal').classList.remove('hidden');
}

function registerClass(code) {
    const classItem = classes.find(c => c.code === code);
    if (!classItem) return;
    
    if (registeredClasses.includes(code)) {
        showNotification('Bạn đã đăng ký lớp này rồi!', 'error');
        return;
    }
    
    if (classItem.status !== 'Còn chỗ') {
        showNotification('Lớp học đã đầy, không thể đăng ký!', 'error');
        return;
    }
    
    registeredClasses.push(code);
    localStorage.setItem('registeredClasses', JSON.stringify(registeredClasses));
    showNotification(`Đăng ký thành công lớp ${classItem.name}`, 'success');
    
    if (currentTab === 'classes') renderClasses();
    if (currentTab === 'my-learning') renderMyClasses();
    updateStats();
}

function cancelRegistration(code) {
    if (confirm('Bạn có chắc muốn hủy đăng ký lớp này?')) {
        registeredClasses = registeredClasses.filter(c => c !== code);
        localStorage.setItem('registeredClasses', JSON.stringify(registeredClasses));
        showNotification('Đã hủy đăng ký lớp học', 'success');
        
        if (currentTab === 'classes') renderClasses();
        if (currentTab === 'my-learning') renderMyClasses();
        updateStats();
    }
}

// ==================== TAB & FILTER FUNCTIONS ====================
function switchTab(tabId) {
    currentTab = tabId;
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.tab === tabId) link.classList.add('active');
    });
    
    if (tabId === 'subjects') renderSubjects();
    else if (tabId === 'classes') renderClasses();
    else if (tabId === 'my-learning') renderMyClasses();
}

function initSidebar() {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });
}

function initFilters() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.dataset.filter;
            if (currentTab === 'subjects') renderSubjects();
        });
    });
    
    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            sortAscending = !sortAscending;
            sortBtn.innerHTML = `Theo tên ${sortAscending ? '↓' : '↑'} <span class="material-symbols-outlined">expand_more</span>`;
            if (currentTab === 'subjects') renderSubjects();
            if (currentTab === 'classes') renderClasses();
        });
    }
}

function initFacultyFilter() {
    document.querySelectorAll('.faculty-item').forEach(item => {
        item.addEventListener('click', () => {
            const faculty = item.dataset.faculty;
            let facultyName = '';
            switch(faculty) {
                case 'arch': facultyName = 'Khoa Kiến trúc'; break;
                case 'plan': facultyName = 'Khoa Quy hoạch'; break;
                case 'civil': facultyName = 'Khoa Xây dựng'; break;
                case 'interior': facultyName = 'Khoa Nội thất'; break;
            }
            
            const filteredSubjects = subjects.filter(s => s.faculty === facultyName);
            if (filteredSubjects.length > 0 && currentTab === 'subjects') {
                const container = document.getElementById('dynamicContent');
                container.innerHTML = filteredSubjects.map(s => `
                    <div class="content-card" data-code="${s.code}" data-type="subject">
                        <div class="card-header">
                            <span class="card-code">${escapeHtml(s.code)}</span>
                            <span class="card-type ${s.type === 'Bắt buộc' ? 'required' : 'elective'}">${escapeHtml(s.type)}</span>
                        </div>
                        <h3 class="card-title">${escapeHtml(s.name)}</h3>
                        <p class="card-description">${escapeHtml(s.description)}</p>
                        <div class="card-footer">
                            <div class="card-meta">
                                <span><span class="material-symbols-outlined">account_balance</span> ${escapeHtml(s.faculty)}</span>
                                <span><span class="material-symbols-outlined">grade</span> ${s.credits} tín chỉ</span>
                            </div>
                            <div class="card-actions">
                                <button class="btn-detail" data-code="${s.code}" data-type="subject">Chi tiết</button>
                            </div>
                        </div>
                    </div>
                `).join('');
                attachCardEvents();
                showNotification(`Đang lọc theo: ${facultyName}`, 'info');
            }
        });
    });
}

function initModals() {
    const closeSubjectBtns = document.getElementById('closeSubjectModal');
    const closeSubjectBtn = document.getElementById('closeSubjectModalBtn');
    const closeClassBtns = document.getElementById('closeClassModal');
    const closeClassBtn = document.getElementById('closeClassModalBtn');
    
    const closeModal = (modalId) => {
        document.getElementById(modalId).classList.add('hidden');
    };
    
    if (closeSubjectBtns) closeSubjectBtns.onclick = () => closeModal('subjectModal');
    if (closeSubjectBtn) closeSubjectBtn.onclick = () => closeModal('subjectModal');
    if (closeClassBtns) closeClassBtns.onclick = () => closeModal('classModal');
    if (closeClassBtn) closeClassBtn.onclick = () => closeModal('classModal');
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.add('hidden');
        }
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    new Header();
    new Footer();
    new AIChatWidget();
    
    initSidebar();
    initFilters();
    initFacultyFilter();
    initModals();
    
    renderSubjects();
    updateStats();
});