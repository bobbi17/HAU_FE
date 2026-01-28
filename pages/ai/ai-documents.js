/**
 * HauHub Admin - AI Documents Management JS
 * Xử lý các chức năng quản lý tài liệu, upload và dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Dữ liệu giả lập (Initial State) ---
    let documents = [
        { id: 1, name: 'Báo_cáo_AI_2026.pdf', time: '10 phút trước', size: '2.5 MB' },
        { id: 2, name: 'Đề_tài_NCKH.docx', time: 'Hôm nay · 08:32', size: '1.2 MB' },
        { id: 3, name: 'Thuyết_trình_Thiết_kế_UI.pptx', time: 'Hôm qua · 14:20', size: '15.8 MB' },
        { id: 4, name: 'Hợp_đồng_Đối_tác_2024.pdf', time: '2 ngày trước', size: '0.8 MB' },
        { id: 5, name: 'Bảng_tính_Chi_phí.xlsx', time: '3 ngày trước · 09:15', size: '1.1 MB' }
    ];

    // --- 2. Truy vấn DOM Elements ---
    const docContainer = document.querySelector('.documents-container');
    const searchInput = document.getElementById('document-search');
    const uploadModal = document.getElementById('upload-modal');
    const uploadBtn = document.getElementById('upload-document-btn');
    const closeUploadModal = document.getElementById('close-upload-modal');
    const cancelUpload = document.getElementById('cancel-upload');
    const startUploadBtn = document.getElementById('start-upload');
    const uploadZone = document.getElementById('modal-upload-zone');
    const fileInput = document.getElementById('modal-file-input');
    const uploadQueue = document.getElementById('upload-queue');
    const docCountDisplay = document.getElementById('documents-count');

    // --- 3. Khởi tạo chức năng hiển thị danh sách ---
    function renderDocuments(data) {
        if (!docContainer) return;
        
        docContainer.innerHTML = '';
        data.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'document-item';
            docItem.innerHTML = `
                <div class="doc-info">
                    <span class="material-symbols-outlined doc-icon">description</span>
                    <div class="doc-text">
                        <p class="doc-name">${doc.name}</p>
                        <span class="doc-time">${doc.time} • ${doc.size}</span>
                    </div>
                </div>
                <button class="delete-btn" data-id="${doc.id}" title="Xóa tài liệu">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            `;
            docContainer.appendChild(docItem);
        });

        // Cập nhật số lượng hiển thị trên Stat Card
        if(docCountDisplay) docCountDisplay.textContent = data.length.toLocaleString();

        // Gán sự kiện xóa cho từng nút
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteDocument(id);
            });
        });
    }

    function deleteDocument(id) {
        if(confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
            documents = documents.filter(doc => doc.id !== id);
            renderDocuments(documents);
        }
    }

    // --- 4. Tìm kiếm tài liệu ---
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredDocs = documents.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm)
        );
        renderDocuments(filteredDocs);
    });

    // --- 5. Xử lý Upload Modal & File Queue ---
    function toggleModal(show) {
        if (show) {
            uploadModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            uploadModal.classList.remove('active');
            document.body.style.overflow = '';
            uploadQueue.innerHTML = ''; // Reset queue khi đóng
        }
    }

    uploadBtn.addEventListener('click', () => toggleModal(true));
    closeUploadModal.addEventListener('click', () => toggleModal(false));
    cancelUpload.addEventListener('click', () => toggleModal(false));

    // Xử lý kéo thả (Drag & Drop)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => uploadZone.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('highlight'), false);
    });

    uploadZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        const filesArray = [...files];
        filesArray.forEach(displayInQueue);
    }

    function displayInQueue(file) {
        const fileId = Math.random().toString(36).substr(2, 9);
        const queueItem = document.createElement('div');
        queueItem.className = 'document-item'; // Tận dụng style có sẵn
        queueItem.style.marginBottom = '10px';
        queueItem.innerHTML = `
            <div class="doc-info">
                <span class="material-symbols-outlined">insert_drive_file</span>
                <div class="doc-text">
                    <p class="doc-name">${file.name}</p>
                    <span class="doc-time">${(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
            </div>
            <div class="progress-container" style="width: 100px; height: 4px; background: var(--bg-soft); border-radius: 2px;">
                <div class="progress-bar" id="pb-${fileId}" style="width: 0%; height: 100%; background: var(--primary-color); transition: width 0.3s;"></div>
            </div>
        `;
        uploadQueue.appendChild(queueItem);

        // Giả lập tiến trình tải lên
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            document.getElementById(`pb-${fileId}`).style.width = progress + '%';
        }, 400);
    }

    startUploadBtn.addEventListener('click', function() {
        if (uploadQueue.children.length === 0) {
            alert('Vui lòng chọn ít nhất một tệp!');
            return;
        }
        
        // Giả lập hoàn tất
        this.innerHTML = '<span class="material-symbols-outlined">sync</span> Đang xử lý...';
        this.disabled = true;

        setTimeout(() => {
            alert('Tải lên và xử lý AI thành công!');
            this.innerHTML = '<span class="material-symbols-outlined">upload</span> Bắt đầu tải lên';
            this.disabled = false;
            toggleModal(false);
            
            // Thêm một item giả vào danh sách chính
            const newDoc = {
                id: Date.now(),
                name: "Tai_lieu_moi_tai_len.pdf",
                time: "Vừa xong",
                size: "2.0 MB"
            };
            documents.unshift(newDoc);
            renderDocuments(documents);
        }, 2000);
    });

    // --- 6. Giả lập thông số hệ thống (System Monitoring) ---
    function updateSystemMetrics() {
        const cpuBar = document.querySelector('.metric-progress.cpu');
        const ramBar = document.querySelector('.metric-progress.ram');
        
        if (cpuBar) {
            const cpuVal = Math.floor(Math.random() * (60 - 30) + 30);
            cpuBar.style.width = cpuVal + '%';
            cpuBar.parentElement.previousElementSibling.querySelector('.metric-value').textContent = cpuVal + '%';
        }
        
        if (ramBar) {
            const ramVal = Math.floor(Math.random() * (85 - 70) + 70);
            ramBar.style.width = ramVal + '%';
            ramBar.parentElement.previousElementSibling.querySelector('.metric-value').textContent = ramVal + '%';
        }
    }

    setInterval(updateSystemMetrics, 3000);

    // --- 7. Khởi chạy ban đầu ---
    renderDocuments(documents);
});