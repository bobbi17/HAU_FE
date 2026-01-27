// ai-documents.js - Main JavaScript for AI Documents Management
import { showModal, closeModal, closeAllModals } from '../../js/components/modal.js';
import { showNotification } from '../../js/components/notification.js';
import { 
    getDocuments, 
    getDocumentById, 
    uploadDocument, 
    processDocument, 
    deleteDocument, 
    syncVectorDatabase,
    getDocumentStats,
    getSystemMetrics 
} from '../../js/services/ai-service.js';

class AIDocuments {
    constructor() {
        console.log('AIDocuments constructor called');
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filterType = 'all';
        this.filterStatus = 'all';
        this.searchTerm = '';
        this.documents = [];
        this.selectedDocuments = new Set();
        this.uploadQueue = [];
        
        this.init();
    }

    async init() {
        console.log('Initializing AIDocuments...');
        await this.loadDocuments();
        await this.loadStats();
        await this.loadSystemMetrics();
        this.setupInitialLogs();
        this.setupEventListeners();
        this.setupDragAndDrop();
        console.log('AIDocuments initialized successfully');
    }

    async loadDocuments() {
        console.log('Loading documents...');
        try {
            const response = await getDocuments();
            this.documents = response.data || [];
            console.log(`Loaded ${this.documents.length} documents`);
            this.renderDocuments();
            this.updatePagination();
            this.updateDocumentCount();
        } catch (error) {
            console.error('Error loading documents:', error);
            showNotification('Không thể tải danh sách tài liệu', 'error');
            this.documents = [];
            this.renderDocuments();
        }
    }

    async loadStats() {
        try {
            const response = await getDocumentStats();
            this.updateStats(response.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadSystemMetrics() {
        try {
            const response = await getSystemMetrics();
            this.updateSystemMetrics(response.data);
        } catch (error) {
            console.error('Error loading system metrics:', error);
        }
    }

    updateStats(stats) {
        const documentsCount = document.getElementById('documents-count');
        const storageUsed = document.getElementById('storage-used');
        const tokensCount = document.getElementById('tokens-count');
        const processingStatus = document.getElementById('processing-status');

        if (documentsCount) documentsCount.textContent = stats.total.toLocaleString();
        if (storageUsed) storageUsed.textContent = stats.storageUsed;
        if (tokensCount) tokensCount.textContent = stats.tokens.toLocaleString();
        if (processingStatus) processingStatus.textContent = stats.processingStatus;

        // Update capacity indicator
        const capacityElement = document.querySelector('.stat-trend.capacity');
        if (capacityElement) {
            capacityElement.textContent = `${stats.storagePercentage}% Capacity`;
        }
    }

    updateDocumentCount() {
        const filteredDocuments = this.getFilteredDocuments();
        const totalDocuments = filteredDocuments.length;
        
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            const totalPages = Math.ceil(totalDocuments / this.itemsPerPage);
            paginationInfo.innerHTML = `
                Trang <span class="highlight">${this.currentPage}</span> trong <span class="highlight">${totalPages}</span> (${totalDocuments.toLocaleString()} Tài sản)
            `;
        }

        // Update pagination buttons
        const prevBtn = document.querySelector('.pagination-btn.prev');
        const nextBtn = document.querySelector('.pagination-btn.next');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            const totalPages = Math.ceil(totalDocuments / this.itemsPerPage);
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }

    updateSystemMetrics(metrics) {
        const cpuProgress = document.querySelector('.metric-progress.cpu');
        const cpuValue = document.querySelector('.metric-card:first-child .metric-value');
        if (cpuProgress && cpuValue) {
            cpuProgress.style.width = `${metrics.cpu}%`;
            cpuValue.textContent = `${metrics.cpu}%`;
        }
        
        const ramProgress = document.querySelector('.metric-progress.ram');
        const ramValue = document.querySelector('.metric-card:nth-child(2) .metric-value');
        if (ramProgress && ramValue) {
            ramProgress.style.width = `${metrics.ram}%`;
            ramValue.textContent = `${metrics.ram}%`;
        }
        
        const storageProgress = document.querySelector('.metric-progress.storage');
        const storageValue = document.querySelector('.metric-card:nth-child(3) .metric-value');
        if (storageProgress && storageValue) {
            storageProgress.style.width = `${metrics.storage}%`;
            storageValue.textContent = `${metrics.storage}%`;
        }
    }

    getFilteredDocuments() {
        return this.documents.filter(document => {
            const matchesType = this.filterType === 'all' || document.type === this.filterType;
            const matchesStatus = this.filterStatus === 'all' || document.status === this.filterStatus;
            const matchesSearch = this.searchTerm === '' ||
                                 document.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                 (document.category && document.category.toLowerCase().includes(this.searchTerm.toLowerCase()));
            
            return matchesType && matchesStatus && matchesSearch;
        });
    }

    getPaginatedDocuments() {
        const filteredDocuments = this.getFilteredDocuments();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return filteredDocuments.slice(startIndex, endIndex);
    }

    renderDocuments() {
        const tbody = document.getElementById('documents-table-body');
        if (!tbody) {
            console.error('Table body not found');
            return;
        }

        const documents = this.getPaginatedDocuments();
        
        if (documents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8">
                        <div class="empty-state">
                            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">folder_open</span>
                            <p class="text-slate-500">Không tìm thấy tài liệu nào</p>
                            <button class="btn-secondary mt-4" id="empty-state-upload-btn">
                                <span class="material-symbols-outlined">upload</span>
                                Tải lên tài liệu đầu tiên
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            const uploadBtn = document.getElementById('empty-state-upload-btn');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => this.handleUploadDocument());
            }
            return;
        }

        tbody.innerHTML = documents.map(doc => this.createDocumentRow(doc)).join('');
        this.attachRowEventListeners();
        this.updateSelectAllCheckbox();
    }

    createDocumentRow(document) {
        const statusClass = document.status || 'pending';
        const statusText = this.getStatusText(document.status);
        const typeClass = document.type || 'unknown';
        const isSelected = this.selectedDocuments.has(document.id);
        const size = document.size || '0 KB';
        const category = document.category || 'Chưa phân loại';
        const uploadedAt = document.uploadedAt || new Date().toISOString();
        
        return `
            <tr class="document-item" data-document-id="${document.id}">
                <td>
                    <input type="checkbox" class="select-checkbox" 
                           data-document-id="${document.id}" 
                           ${isSelected ? 'checked' : ''}>
                </td>
                <td>
                    <div class="document-info">
                        <div class="document-icon ${typeClass}">
                            <span class="material-symbols-outlined">${this.getFileIcon(document.type)}</span>
                        </div>
                        <div class="document-details">
                            <div class="document-name">${document.name}</div>
                            <div class="document-category">${category}</div>
                        </div>
                    </div>
                </td>
                <td class="text-center">
                    <span class="document-size">${size}</span>
                </td>
                <td class="text-center">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="text-center">
                    <span class="timestamp">${this.getTimeAgo(uploadedAt)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" data-document-id="${document.id}">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="action-btn edit" data-document-id="${document.id}">
                            <span class="material-symbols-outlined">edit_note</span>
                        </button>
                        <button class="action-btn delete" data-document-id="${document.id}">
                            <span class="material-symbols-outlined">delete_sweep</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getFileIcon(type) {
        const icons = {
            'pdf': 'picture_as_pdf',
            'docx': 'description',
            'json': 'code',
            'dwg': 'architecture',
            'txt': 'text_snippet'
        };
        return icons[type] || 'insert_drive_file';
    }

    getStatusText(status) {
        const statusTexts = {
            'vectorized': 'Vectorized',
            'processing': 'Processing',
            'pending': 'Pending',
            'failed': 'Failed',
            'completed': 'Completed',
            'queued': 'Queued'
        };
        return statusTexts[status] || status || 'Unknown';
    }

    getTimeAgo(dateString) {
        try {
            const now = new Date();
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            
            if (diffInMinutes < 1) {
                return 'Vừa xong';
            } else if (diffInMinutes < 60) {
                return `${diffInMinutes} phút trước`;
            } else if (diffInMinutes < 1440) {
                const diffInHours = Math.floor(diffInMinutes / 60);
                return `${diffInHours} giờ trước`;
            } else {
                const diffInDays = Math.floor(diffInMinutes / 1440);
                return `${diffInDays} ngày trước`;
            }
        } catch (error) {
            return 'N/A';
        }
    }

    updatePagination() {
        const totalDocuments = this.getFilteredDocuments().length;
        const totalPages = Math.ceil(totalDocuments / this.itemsPerPage);

        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.innerHTML = `
                Trang <span class="highlight">${this.currentPage}</span> trong <span class="highlight">${totalPages}</span> (${totalDocuments.toLocaleString()} Tài sản)
            `;
        }

        // Update pagination buttons
        const prevBtn = document.querySelector('.pagination-btn.prev');
        const nextBtn = document.querySelector('.pagination-btn.next');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('select-all');
        if (!selectAllCheckbox) return;
        
        const visibleDocuments = this.getPaginatedDocuments();
        const allSelected = visibleDocuments.length > 0 && 
                           visibleDocuments.every(doc => this.selectedDocuments.has(doc.id));
        
        selectAllCheckbox.checked = allSelected;
        selectAllCheckbox.indeterminate = !allSelected && 
                                         visibleDocuments.some(doc => this.selectedDocuments.has(doc.id));
    }

    handleSelectAll(event) {
        const isChecked = event.target.checked;
        const visibleDocuments = this.getPaginatedDocuments();
        
        if (isChecked) {
            visibleDocuments.forEach(doc => this.selectedDocuments.add(doc.id));
        } else {
            visibleDocuments.forEach(doc => this.selectedDocuments.delete(doc.id));
        }
        
        this.renderDocuments();
    }

    handleSelectDocument(event) {
        const documentId = parseInt(event.target.dataset.documentId);
        const isChecked = event.target.checked;
        
        if (isChecked) {
            this.selectedDocuments.add(documentId);
        } else {
            this.selectedDocuments.delete(documentId);
        }
        
        this.updateSelectAllCheckbox();
    }

    async handleViewDocument(documentId) {
        try {
            const response = await getDocumentById(documentId);
            this.showDocumentDetailModal(response.data);
        } catch (error) {
            console.error('Error loading document details:', error);
            showNotification('Không thể tải chi tiết tài liệu', 'error');
        }
    }

    showDocumentDetailModal(document) {
        const modalContent = `
            <div class="document-detail-view">
                <div class="document-detail-header">
                    <div class="document-icon large ${document.type}">
                        <span class="material-symbols-outlined">${this.getFileIcon(document.type)}</span>
                    </div>
                    <div class="document-header-info">
                        <h4 class="document-title">${document.name}</h4>
                        <div class="document-meta">
                            <span class="document-category">${document.category || 'Không phân loại'}</span>
                            <span class="document-size">${document.size || 'N/A'}</span>
                            <span class="status-badge ${document.status}">${this.getStatusText(document.status)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="document-detail-grid">
                    <div class="detail-section">
                        <h5>Thông tin cơ bản</h5>
                        <div class="detail-item">
                            <span class="detail-label">Loại tệp</span>
                            <span class="detail-value">${(document.type || 'unknown').toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ngày tải lên</span>
                            <span class="detail-value">${document.uploadedAt ? new Date(document.uploadedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Số trang/chunks</span>
                            <span class="detail-value">${document.pages || document.chunks || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Thông tin xử lý</h5>
                        <div class="detail-item">
                            <span class="detail-label">Mô hình xử lý</span>
                            <span class="detail-value">${document.model || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Số tokens</span>
                            <span class="detail-value">${document.tokens ? document.tokens.toLocaleString() : 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Vector dimensions</span>
                            <span class="detail-value">${document.dimensions || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                ${document.tags && document.tags.length > 0 ? `
                <div class="detail-section">
                    <h5>Thẻ phân loại</h5>
                    <div class="tags-list">
                        ${document.tags.map(tag => `
                            <span class="tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${document.description ? `
                <div class="detail-section">
                    <h5>Mô tả</h5>
                    <p class="document-description">${document.description}</p>
                </div>
                ` : ''}
                
                ${document.status === 'failed' && document.error ? `
                <div class="detail-section error">
                    <h5>Lỗi xử lý</h5>
                    <p class="error-message">${document.error}</p>
                </div>
                ` : ''}
                
                <div class="document-actions">
                    ${document.status === 'pending' || document.status === 'failed' ? `
                    <button class="btn-secondary" id="retry-process" data-document-id="${document.id}">
                        Thử lại xử lý
                    </button>
                    ` : ''}
                    <button class="btn-primary" id="download-document" data-document-id="${document.id}">
                        <span class="material-symbols-outlined">download</span>
                        Tải xuống
                    </button>
                    <button class="btn-secondary" id="close-detail">
                        <span class="material-symbols-outlined">close</span>
                        Đóng
                    </button>
                </div>
            </div>
        `;

        const detailContent = document.getElementById('document-detail-content');
        if (detailContent) {
            detailContent.innerHTML = modalContent;
            showModal('document-detail-modal');
            
            // Attach action listeners
            const retryBtn = document.getElementById('retry-process');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.handleProcessDocument(document.id);
                    closeModal('document-detail-modal');
                });
            }
            
            const downloadBtn = document.getElementById('download-document');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    this.handleDownloadDocument(document.id);
                });
            }
            
            const closeBtn = document.getElementById('close-detail');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    closeModal('document-detail-modal');
                });
            }
        }
    }

    async handleProcessDocument(documentId) {
        try {
            showNotification('Đang xử lý tài liệu...', 'info');
            await processDocument(documentId);
            showNotification('Đã bắt đầu xử lý tài liệu', 'success');
            this.addLog(`[${this.getCurrentTime()}] Started processing document ID: ${documentId}`, 'info');
            await this.loadDocuments();
            await this.loadStats();
        } catch (error) {
            console.error('Error processing document:', error);
            showNotification('Không thể xử lý tài liệu', 'error');
            this.addLog(`[${this.getCurrentTime()}] Failed to process document ID: ${documentId}`, 'error');
        }
    }

    async handleDownloadDocument(documentId) {
        try {
            showNotification('Đang tải xuống tài liệu...', 'info');
            
            // Simulate download
            setTimeout(() => {
                showNotification('Đã bắt đầu tải xuống tài liệu', 'success');
                this.addLog(`[${this.getCurrentTime()}] Downloaded document ID: ${documentId}`, 'success');
            }, 1000);
        } catch (error) {
            console.error('Error downloading document:', error);
            showNotification('Không thể tải xuống tài liệu', 'error');
        }
    }

    async handleDeleteDocument(documentId) {
        if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
            return;
        }

        try {
            await deleteDocument(documentId);
            showNotification('Đã xóa tài liệu thành công', 'success');
            this.addLog(`[${this.getCurrentTime()}] Deleted document ID: ${documentId}`, 'info');
            this.selectedDocuments.delete(documentId);
            await this.loadDocuments();
            await this.loadStats();
        } catch (error) {
            console.error('Error deleting document:', error);
            showNotification('Không thể xóa tài liệu', 'error');
        }
    }

    async handleDeleteSelected() {
        if (this.selectedDocuments.size === 0) {
            showNotification('Vui lòng chọn ít nhất một tài liệu để xóa', 'warning');
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn xóa ${this.selectedDocuments.size} tài liệu đã chọn?`)) {
            return;
        }

        try {
            for (const documentId of this.selectedDocuments) {
                await deleteDocument(documentId);
            }
            
            showNotification(`Đã xóa ${this.selectedDocuments.size} tài liệu thành công`, 'success');
            this.addLog(`[${this.getCurrentTime()}] Deleted ${this.selectedDocuments.size} documents`, 'info');
            this.selectedDocuments.clear();
            await this.loadDocuments();
            await this.loadStats();
        } catch (error) {
            console.error('Error deleting selected documents:', error);
            showNotification('Không thể xóa tài liệu đã chọn', 'error');
        }
    }

    async handleProcessSelected() {
        if (this.selectedDocuments.size === 0) {
            showNotification('Vui lòng chọn ít nhất một tài liệu để xử lý', 'warning');
            return;
        }

        try {
            for (const documentId of this.selectedDocuments) {
                await processDocument(documentId);
            }
            
            showNotification(`Đã bắt đầu xử lý ${this.selectedDocuments.size} tài liệu`, 'success');
            this.addLog(`[${this.getCurrentTime()}] Started processing ${this.selectedDocuments.size} documents`, 'info');
            await this.loadDocuments();
            await this.loadStats();
        } catch (error) {
            console.error('Error processing selected documents:', error);
            showNotification('Không thể xử lý tài liệu đã chọn', 'error');
        }
    }

    async handleSyncDatabase() {
        try {
            showNotification('Đang đồng bộ Vector Database...', 'info');
            this.addLog('[SYSTEM] Starting Vector DB synchronization...', 'info');
            
            await syncVectorDatabase();
            
            setTimeout(() => {
                showNotification('Đồng bộ Vector Database thành công', 'success');
                this.addLog('[SYSTEM] Vector DB synchronization completed successfully.', 'success');
                this.loadStats();
            }, 2000);
        } catch (error) {
            console.error('Error syncing vector database:', error);
            showNotification('Không thể đồng bộ Vector Database', 'error');
            this.addLog('[SYSTEM] Vector DB synchronization failed.', 'error');
        }
    }

    handleUploadDocument() {
        this.uploadQueue = [];
        this.renderUploadQueue();
        showModal('upload-modal');
    }

    setupDragAndDrop() {
        const modalUploadZone = document.getElementById('modal-upload-zone');
        
        if (!modalUploadZone) return;
        
        modalUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            modalUploadZone.classList.add('dragover');
        });
        
        modalUploadZone.addEventListener('dragleave', () => {
            modalUploadZone.classList.remove('dragover');
        });
        
        modalUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            modalUploadZone.classList.remove('dragover');
            this.handleFileDrop(e.dataTransfer.files);
        });
    }

    handleFileDrop(files) {
        this.addFilesToQueue(Array.from(files));
    }

    handleFileSelect(event) {
        this.addFilesToQueue(Array.from(event.target.files));
    }

    addFilesToQueue(files) {
        const uploadQueue = document.getElementById('upload-queue');
        if (!uploadQueue) return;

        files.forEach(file => {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                showNotification(`Tệp "${file.name}" vượt quá giới hạn 50MB`, 'error');
                return;
            }

            const allowedTypes = ['.pdf', '.dwg', '.json', '.docx', '.txt'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!allowedTypes.includes(fileExtension)) {
                showNotification(`Loại tệp "${fileExtension}" không được hỗ trợ`, 'error');
                return;
            }

            const fileItem = {
                id: Date.now() + Math.random(),
                file: file,
                name: file.name,
                size: this.formatFileSize(file.size),
                type: fileExtension.replace('.', ''),
                progress: 0,
                status: 'pending'
            };

            this.uploadQueue.push(fileItem);
        });

        this.renderUploadQueue();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    renderUploadQueue() {
        const queueContainer = document.getElementById('upload-queue');
        if (!queueContainer) return;

        if (this.uploadQueue.length === 0) {
            queueContainer.innerHTML = `
                <div class="queue-empty-state">
                    <span class="material-symbols-outlined">cloud_upload</span>
                    <p>Kéo thả tệp vào đây hoặc nhấn để chọn</p>
                </div>
            `;
            return;
        }

        queueContainer.innerHTML = `
            <div class="queue-header">
                <h5>${this.uploadQueue.length} tệp đang chờ tải lên</h5>
                <button class="btn-secondary btn-sm" id="clear-queue-btn">
                    <span class="material-symbols-outlined">clear_all</span>
                    Xóa tất cả
                </button>
            </div>
            <div class="queue-list">
                ${this.uploadQueue.map(item => this.createQueueItem(item)).join('')}
            </div>
        `;

        // Attach event listener for clear queue button
        const clearQueueBtn = document.getElementById('clear-queue-btn');
        if (clearQueueBtn) {
            clearQueueBtn.addEventListener('click', () => {
                this.uploadQueue = [];
                this.renderUploadQueue();
            });
        }

        this.attachQueueEventListeners();
    }

    createQueueItem(item) {
        return `
            <div class="queue-item" data-file-id="${item.id}">
                <div class="queue-icon">
                    <span class="material-symbols-outlined">${this.getFileIcon(item.type)}</span>
                </div>
                <div class="queue-details">
                    <div class="queue-name">${item.name}</div>
                    <div class="queue-size">${item.size} • ${item.type.toUpperCase()}</div>
                </div>
                <div class="queue-progress">
                    <div class="progress-container">
                        <div class="queue-progress-bar" style="width: ${item.progress}%"></div>
                    </div>
                    <span class="queue-percentage">${item.progress}%</span>
                </div>
                <div class="queue-actions">
                    <button class="queue-action remove" data-file-id="${item.id}" title="Xóa khỏi hàng đợi">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        `;
    }

    removeFromQueue(fileId) {
        this.uploadQueue = this.uploadQueue.filter(item => item.id !== fileId);
        this.renderUploadQueue();
    }

    async startUpload() {
        const uploadQueue = document.getElementById('upload-queue');
        const startUploadBtn = document.getElementById('start-upload');
        
        if (!uploadQueue || !startUploadBtn) return;

        if (this.uploadQueue.length === 0) {
            showNotification('Vui lòng chọn ít nhất một tệp để tải lên', 'warning');
            return;
        }

        const autoProcess = document.getElementById('auto-process')?.checked || false;
        const generateEmbeddings = document.getElementById('generate-embeddings')?.checked || false;
        const extractMetadata = document.getElementById('extract-metadata')?.checked || false;
        const tagsInput = document.getElementById('document-tags');
        const tags = tagsInput ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        const model = document.getElementById('processing-model')?.value || 'text-embedding-3-small';
        const priority = document.getElementById('processing-priority')?.value || 'normal';

        // Disable start button during upload
        startUploadBtn.disabled = true;
        startUploadBtn.innerHTML = '<span class="material-symbols-outlined">sync</span> Đang tải lên...';

        try {
            for (const item of this.uploadQueue) {
                // Update progress bar animation
                this.animateProgressBar(item.id, 100, 2000);
                
                // Simulate API call
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('autoProcess', autoProcess);
                formData.append('generateEmbeddings', generateEmbeddings);
                formData.append('extractMetadata', extractMetadata);
                formData.append('tags', JSON.stringify(tags));
                formData.append('model', model);
                formData.append('priority', priority);

                await uploadDocument(formData);
                
                this.addLog(`[${this.getCurrentTime()}] Uploaded: ${item.name}`, 'success');
            }

            showNotification(`Đã tải lên ${this.uploadQueue.length} tệp thành công`, 'success');
            this.addLog(`[${this.getCurrentTime()}] Completed upload of ${this.uploadQueue.length} files`, 'info');
            
            // Close modal and reset
            setTimeout(() => {
                closeModal('upload-modal');
                this.resetUploadModal();
                this.loadDocuments();
                this.loadStats();
            }, 1000);
            
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('Có lỗi xảy ra khi tải lên tệp', 'error');
            this.addLog(`[${this.getCurrentTime()}] Upload failed: ${error.message}`, 'error');
            
            // Re-enable button on error
            startUploadBtn.disabled = false;
            startUploadBtn.innerHTML = '<span class="material-symbols-outlined">upload</span> Bắt đầu tải lên';
        }
    }

    animateProgressBar(fileId, targetProgress, duration) {
        const item = this.uploadQueue.find(i => i.id === fileId);
        if (!item) return;

        const startProgress = item.progress;
        const startTime = Date.now();
        const endTime = startTime + duration;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            item.progress = startProgress + (targetProgress - startProgress) * progress;
            this.updateQueueItem(fileId, item.progress);

            if (now < endTime) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    updateQueueItem(fileId, progress) {
        const progressBar = document.querySelector(`[data-file-id="${fileId}"] .queue-progress-bar`);
        const percentage = document.querySelector(`[data-file-id="${fileId}"] .queue-percentage`);
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        if (percentage) {
            percentage.textContent = `${Math.round(progress)}%`;
        }
    }

    resetUploadModal() {
        const modalFileInput = document.getElementById('modal-file-input');
        const startUploadBtn = document.getElementById('start-upload');
        
        if (modalFileInput) modalFileInput.value = '';
        if (startUploadBtn) {
            startUploadBtn.disabled = false;
            startUploadBtn.innerHTML = '<span class="material-symbols-outlined">upload</span> Bắt đầu tải lên';
        }
        
        this.uploadQueue = [];
    }

    addLog(message, type = 'info') {
        const logsContainer = document.getElementById('logs-container');
        if (!logsContainer) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-time">[${this.getCurrentTime()}]</span>
            <span class="log-message">${message}</span>
        `;

        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
        
        // Keep only last 50 logs
        const logs = logsContainer.querySelectorAll('.log-entry');
        if (logs.length > 50) {
            logs[0].remove();
        }
    }

    setupInitialLogs() {
        this.addLog('[SYSTEM] AI Document Management System initialized.', 'info');
        this.addLog('[SYSTEM] Ready to process academic documents.', 'info');
        this.addLog('[SYSTEM] Vector database connection established.', 'success');
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('vi-VN', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    clearLogs() {
        const logsContainer = document.getElementById('logs-container');
        if (logsContainer) {
            logsContainer.innerHTML = '';
            this.addLog('[SYSTEM] Logs cleared manually.', 'info');
        }
    }

    toggleLogsExpansion() {
        const logsContainer = document.getElementById('logs-container');
        const expandBtn = document.getElementById('expand-logs-btn');
        
        if (!logsContainer || !expandBtn) return;

        if (logsContainer.style.maxHeight === '400px') {
            logsContainer.style.maxHeight = 'none';
            expandBtn.querySelector('span').textContent = 'expand_less';
            expandBtn.title = 'Thu gọn logs';
        } else {
            logsContainer.style.maxHeight = '400px';
            expandBtn.querySelector('span').textContent = 'expand_more';
            expandBtn.title = 'Mở rộng logs';
        }
    }

    setupEventListeners() {
        // Upload buttons
        const uploadDocumentBtn = document.getElementById('upload-document-btn');
        const quickUploadBtn = document.getElementById('quick-upload-btn');
        
        if (uploadDocumentBtn) {
            uploadDocumentBtn.addEventListener('click', () => this.handleUploadDocument());
        }
        
        if (quickUploadBtn) {
            quickUploadBtn.addEventListener('click', () => this.handleUploadDocument());
        }
        
        // Sync database button
        const syncDbBtn = document.getElementById('sync-database-btn');
        if (syncDbBtn) {
            syncDbBtn.addEventListener('click', () => this.handleSyncDatabase());
        }

        // File input in modal
        const modalFileInput = document.getElementById('modal-file-input');
        if (modalFileInput) {
            modalFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Click on upload zone
        const modalUploadZone = document.getElementById('modal-upload-zone');
        if (modalUploadZone) {
            modalUploadZone.addEventListener('click', () => {
                if (modalFileInput) modalFileInput.click();
            });
        }

        // Upload modal actions
        const startUploadBtn = document.getElementById('start-upload');
        if (startUploadBtn) {
            startUploadBtn.addEventListener('click', () => this.startUpload());
        }

        const cancelUploadBtn = document.getElementById('cancel-upload');
        if (cancelUploadBtn) {
            cancelUploadBtn.addEventListener('click', () => {
                closeModal('upload-modal');
                this.resetUploadModal();
            });
        }

        // Close modal buttons
        const closeUploadModalBtn = document.getElementById('close-upload-modal');
        if (closeUploadModalBtn) {
            closeUploadModalBtn.addEventListener('click', () => {
                closeModal('upload-modal');
                this.resetUploadModal();
            });
        }

        const closeDetailModalBtn = document.getElementById('close-detail-modal');
        if (closeDetailModalBtn) {
            closeDetailModalBtn.addEventListener('click', () => {
                closeModal('document-detail-modal');
            });
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => this.handleSelectAll(e));
        }

        // Bulk actions
        const processSelectedBtn = document.getElementById('process-selected-btn');
        if (processSelectedBtn) {
            processSelectedBtn.addEventListener('click', () => this.handleProcessSelected());
        }

        const deleteSelectedBtn = document.getElementById('delete-selected-btn');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => this.handleDeleteSelected());
        }

        // Filters
        const fileTypeFilter = document.getElementById('file-type-filter');
        if (fileTypeFilter) {
            fileTypeFilter.addEventListener('change', (e) => {
                this.filterType = e.target.value;
                this.currentPage = 1;
                this.renderDocuments();
                this.updatePagination();
            });
        }

        const processingStatusFilter = document.getElementById('processing-status-filter');
        if (processingStatusFilter) {
            processingStatusFilter.addEventListener('change', (e) => {
                this.filterStatus = e.target.value;
                this.currentPage = 1;
                this.renderDocuments();
                this.updatePagination();
            });
        }

        // Search
        const searchInput = document.getElementById('document-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = searchInput.value.toLowerCase();
                    this.currentPage = 1;
                    this.renderDocuments();
                    this.updatePagination();
                }, 300);
            });
        }

        // Pagination
        const prevPageBtn = document.querySelector('.pagination-btn.prev');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderDocuments();
                    this.updatePagination();
                }
            });
        }

        const nextPageBtn = document.querySelector('.pagination-btn.next');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalDocuments = this.getFilteredDocuments().length;
                const totalPages = Math.ceil(totalDocuments / this.itemsPerPage);
                
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderDocuments();
                    this.updatePagination();
                }
            });
        }

        // Log controls
        const clearLogsBtn = document.getElementById('clear-logs-btn');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => this.clearLogs());
        }

        const expandLogsBtn = document.getElementById('expand-logs-btn');
        if (expandLogsBtn) {
            expandLogsBtn.addEventListener('click', () => this.toggleLogsExpansion());
        }

        // Quick action buttons
        const bulkProcessBtn = document.getElementById('bulk-process-btn');
        if (bulkProcessBtn) {
            bulkProcessBtn.addEventListener('click', () => this.handleProcessSelected());
        }

        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                showNotification('Tính năng xuất dữ liệu đang được phát triển', 'info');
            });
        }

        const analyzeStatsBtn = document.getElementById('analyze-stats-btn');
        if (analyzeStatsBtn) {
            analyzeStatsBtn.addEventListener('click', () => {
                showNotification('Tính năng phân tích đang được phát triển', 'info');
            });
        }

        // Handle logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    window.location.href = '../../index.html';
                }
            });
        }

        // Handle notifications button
        const notificationsBtn = document.getElementById('notifications-btn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                showNotification('Không có thông báo mới', 'info');
            });
        }
    }

    attachRowEventListeners() {
        // Checkboxes
        document.querySelectorAll('.select-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleSelectDocument(e));
        });

        // Action buttons
        document.querySelectorAll('.action-btn.view').forEach(button => {
            button.addEventListener('click', (e) => {
                const documentId = parseInt(e.currentTarget.dataset.documentId);
                if (documentId) {
                    this.handleViewDocument(documentId);
                }
            });
        });

        document.querySelectorAll('.action-btn.edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const documentId = parseInt(e.currentTarget.dataset.documentId);
                showNotification('Tính năng chỉnh sửa đang được phát triển', 'info');
                console.log('Edit document ID:', documentId);
            });
        });

        document.querySelectorAll('.action-btn.delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const documentId = parseInt(e.currentTarget.dataset.documentId);
                if (documentId) {
                    await this.handleDeleteDocument(documentId);
                }
            });
        });
    }

    attachQueueEventListeners() {
        document.querySelectorAll('.queue-action.remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const fileId = parseFloat(e.currentTarget.dataset.fileId);
                if (fileId) {
                    this.removeFromQueue(fileId);
                }
            });
        });
    }

    setupUploadZone() {
        const modalUploadZone = document.getElementById('modal-upload-zone');
        const modalFileInput = document.getElementById('modal-file-input');
        
        if (!modalUploadZone || !modalFileInput) {
            console.error('Upload zone or file input not found');
            return;
        }
        
        modalUploadZone.addEventListener('click', () => {
            console.log('Upload zone clicked');
            modalFileInput.click();
        });
        
        modalFileInput.addEventListener('change', (e) => {
            console.log('File input changed:', e.target.files);
            this.handleFileSelect(e);
        });
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing AIDocuments...');
    try {
        const aiDocuments = new AIDocuments();
        window.aiDocuments = aiDocuments; // Make it accessible globally for debugging
        console.log('AIDocuments instance created successfully');
    } catch (error) {
        console.error('Error initializing AIDocuments:', error);
        showNotification('Có lỗi xảy ra khi khởi tạo hệ thống', 'error');
    }
});

export default AIDocuments;




