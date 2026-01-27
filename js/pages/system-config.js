// system-config.js
class SystemConfig {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadConfig();
        this.initializeColorPicker();
        this.initializeRangeInputs();
    }

    initializeElements() {
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        
        // Form elements
        this.saveAllBtn = document.getElementById('save-all-btn');
        this.importConfigBtn = document.getElementById('import-config-btn');
        this.configSearch = document.getElementById('config-search');
        
        // Settings elements
        this.colorInput = document.getElementById('primary-color');
        this.colorValue = document.querySelector('.color-value');
        this.fontSize = document.getElementById('font-size');
        this.logoUpload = document.getElementById('logo-upload');
        
        // Toggle switches
        this.toggleSwitches = document.querySelectorAll('.switch input[type="checkbox"]');
        
        // Status elements
        this.systemStatus = document.querySelector('.system-status');
        this.notificationsBtn = document.getElementById('notifications-btn');
        
        // Certificate elements
        this.certActions = document.querySelectorAll('.certificate-actions button');
        
        // Performance metrics
        this.performanceMetrics = document.querySelectorAll('.metric-progress');
    }

    bindEvents() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e));
        });

        // Save all changes
        this.saveAllBtn?.addEventListener('click', () => this.saveAllChanges());

        // Import config
        this.importConfigBtn?.addEventListener('click', () => this.importConfig());

        // Search config
        this.configSearch?.addEventListener('input', (e) => this.searchConfig(e));

        // Color picker
        this.colorInput?.addEventListener('input', (e) => this.updateColorValue(e));

        // Font size range
        this.fontSize?.addEventListener('input', (e) => this.updateFontSizePreview(e));

        // Logo upload
        this.logoUpload?.addEventListener('change', (e) => this.handleLogoUpload(e));

        // Toggle switches
        this.toggleSwitches.forEach(switchElement => {
            switchElement.addEventListener('change', (e) => this.handleToggleChange(e));
        });

        // Certificate actions
        this.certActions.forEach(button => {
            button.addEventListener('click', (e) => this.handleCertAction(e));
        });

        // Performance metrics animation
        this.performanceMetrics.forEach(metric => {
            this.animateMetric(metric);
        });

        // Form validation
        this.setupFormValidation();

        // Auto-save on change
        this.setupAutoSave();
    }

    switchTab(e) {
        const targetTab = e.currentTarget.dataset.tab;
        
        // Update active tab button
        this.tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        // Show target tab pane
        this.tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${targetTab}-tab`) {
                pane.classList.add('active');
            }
        });

        // Update URL hash
        window.location.hash = `tab-${targetTab}`;

        // Trigger custom event
        document.dispatchEvent(new CustomEvent('configTabChanged', {
            detail: { tab: targetTab }
        }));
    }

    loadConfig() {
        try {
            // Load saved config from localStorage
            const savedConfig = localStorage.getItem('hauhub-system-config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.applyConfig(config);
                console.log('Configuration loaded from storage');
            }

            // Load from server (simulated)
            this.simulateServerLoad();
            
        } catch (error) {
            console.error('Error loading configuration:', error);
            this.showToast('Không thể tải cấu hình', 'error');
        }
    }

    simulateServerLoad() {
        // Simulate loading from server
        setTimeout(() => {
            // Update performance metrics with simulated data
            this.updatePerformanceMetrics();
            
            // Update SSL certificate info
            this.updateCertificateInfo();
            
            console.log('Configuration synced with server');
        }, 1000);
    }

    applyConfig(config) {
        // Apply saved configuration to form elements
        Object.entries(config).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range') {
                    element.value = value;
                    this.updateRangeValue(element);
                } else {
                    element.value = value;
                }
            }
        });

        // Update color picker
        if (config['primary-color']) {
            this.colorInput.value = config['primary-color'];
            this.colorValue.textContent = config['primary-color'];
        }
    }

    saveAllChanges() {
        const config = this.collectConfig();
        
        // Validate configuration
        if (!this.validateConfig(config)) {
            return;
        }

        // Show saving indicator
        this.showSavingIndicator();

        // Save to localStorage
        localStorage.setItem('hauhub-system-config', JSON.stringify(config));

        // Simulate server save
        setTimeout(() => {
            this.hideSavingIndicator();
            this.showToast('Đã lưu tất cả thay đổi', 'success');
            
            // Update system status
            this.updateSystemStatus();
            
            // Trigger config save event
            document.dispatchEvent(new CustomEvent('configSaved', {
                detail: { config }
            }));
        }, 1500);
    }

    collectConfig() {
        const config = {};

        // Collect all form values
        const formElements = document.querySelectorAll('.form-input, .form-select, .switch input[type="checkbox"], input[type="range"], input[type="color"]');
        
        formElements.forEach(element => {
            if (element.type === 'checkbox') {
                config[element.id] = element.checked;
            } else if (element.type === 'range') {
                config[element.id] = parseInt(element.value);
            } else {
                config[element.id] = element.value;
            }
        });

        return config;
    }

    validateConfig(config) {
        let isValid = true;
        const errors = [];

        // Validate password settings
        if (config['password-min-length'] < 6) {
            errors.push('Độ dài mật khẩu tối thiểu phải từ 6 ký tự');
            isValid = false;
        }

        // Validate SMTP settings if enabled
        if (document.getElementById('email-notifications')?.checked) {
            if (!config['smtp-host'] || !config['smtp-port']) {
                errors.push('Vui lòng cấu hình đầy đủ thông tin SMTP');
                isValid = false;
            }
        }

        // Show errors if any
        if (!isValid) {
            this.showValidationErrors(errors);
        }

        return isValid;
    }

    showValidationErrors(errors) {
        const errorHtml = errors.map(error => `
            <div class="validation-error">
                <span class="material-symbols-outlined">error</span>
                ${error}
            </div>
        `).join('');

        this.showModal('Lỗi xác thực', errorHtml, 'error');
    }

    importConfig() {
        // Create file input for import
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);
                    this.applyConfig(config);
                    this.showToast('Đã nhập cấu hình thành công', 'success');
                } catch (error) {
                    this.showToast('File cấu hình không hợp lệ', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        fileInput.click();
    }

    exportConfig() {
        const config = this.collectConfig();
        const configStr = JSON.stringify(config, null, 2);
        const blob = new Blob([configStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `hauhub-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    searchConfig(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (!searchTerm) {
            // Reset search
            this.resetSearch();
            return;
        }

        // Search in tabs and settings
        let foundInTab = false;
        
        this.tabPanes.forEach(pane => {
            const tabContent = pane.textContent.toLowerCase();
            const tabId = pane.id.replace('-tab', '');
            
            if (tabContent.includes(searchTerm)) {
                // Highlight matching elements
                this.highlightMatches(pane, searchTerm);
                
                // Switch to this tab if not already active
                if (!pane.classList.contains('active')) {
                    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                    if (tabBtn) {
                        tabBtn.click();
                        foundInTab = true;
                    }
                }
            }
        });

        // Show search results summary
        this.showSearchResults(foundInTab);
    }

    highlightMatches(container, searchTerm) {
        // Remove previous highlights
        container.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });

        // Simple text search and highlight
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(searchTerm)) {
                const span = document.createElement('span');
                span.className = 'search-highlight';
                span.style.backgroundColor = '#fbbf24';
                span.style.padding = '0 2px';
                span.style.borderRadius = '2px';
                
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                const newText = node.textContent.replace(regex, '<span class="search-highlight">$1</span>');
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newText;
                
                node.parentNode.replaceChild(tempDiv.firstChild, node);
            }
        }
    }

    resetSearch() {
        // Remove all highlights
        document.querySelectorAll('.search-highlight').forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });

        // Hide search results
        const resultsElement = document.querySelector('.search-results');
        if (resultsElement) {
            resultsElement.remove();
        }
    }

    showSearchResults(found) {
        // Remove previous results
        const previousResults = document.querySelector('.search-results');
        if (previousResults) {
            previousResults.remove();
        }

        if (!found) {
            // Show no results message
            const noResults = document.createElement('div');
            noResults.className = 'search-results';
            noResults.innerHTML = `
                <div class="search-result-message">
                    <span class="material-symbols-outlined">search_off</span>
                    Không tìm thấy cài đặt phù hợp
                </div>
            `;
            this.configSearch.parentNode.appendChild(noResults);
        }
    }

    initializeColorPicker() {
        if (!this.colorInput) return;
        
        // Initialize color picker with current value
        this.colorValue.textContent = this.colorInput.value;
        
        // Add color preview
        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.width = '24px';
        preview.style.height = '24px';
        preview.style.borderRadius = '4px';
        preview.style.backgroundColor = this.colorInput.value;
        preview.style.border = '1px solid var(--border-color)';
        
        this.colorInput.parentNode.insertBefore(preview, this.colorInput);
    }

    updateColorValue(e) {
        const color = e.target.value;
        this.colorValue.textContent = color;
        
        // Update preview
        const preview = this.colorInput.previousElementSibling;
        if (preview && preview.className === 'color-preview') {
            preview.style.backgroundColor = color;
        }

        // Update CSS variable for real-time preview
        document.documentElement.style.setProperty('--primary', color);
        
        // Auto-save
        this.autoSave('primary-color', color);
    }

    initializeRangeInputs() {
        // Initialize all range inputs
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            this.updateRangeValue(input);
            input.addEventListener('input', (e) => this.updateRangeValue(e.target));
        });
    }

    updateRangeValue(input) {
        const valueDisplay = input.nextElementSibling?.className.includes('range-value') 
            ? input.nextElementSibling 
            : input.parentNode.querySelector('.range-value');
        
        if (valueDisplay) {
            if (input.id === 'font-size') {
                valueDisplay.textContent = `${input.value}px`;
            } else if (input.id === 'password-min-length') {
                valueDisplay.textContent = `${input.value} ký tự`;
            } else {
                valueDisplay.textContent = input.value;
            }
        }

        // Auto-save
        this.autoSave(input.id, parseInt(input.value));
    }

    updateFontSizePreview(e) {
        const size = e.target.value;
        
        // Update preview in real-time
        const previewElement = document.querySelector('.font-size-preview');
        if (!previewElement) {
            const preview = document.createElement('div');
            preview.className = 'font-size-preview';
            preview.textContent = `Văn bản mẫu - ${size}px`;
            preview.style.fontSize = `${size}px`;
            preview.style.padding = '1rem';
            preview.style.marginTop = '0.5rem';
            preview.style.border = '1px solid var(--border-color)';
            preview.style.borderRadius = 'var(--radius-lg)';
            preview.style.backgroundColor = 'var(--background-light)';
            
            e.target.parentNode.appendChild(preview);
        } else {
            previewElement.style.fontSize = `${size}px`;
            previewElement.textContent = `Văn bản mẫu - ${size}px`;
        }
    }

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.match('image.*')) {
            this.showToast('Vui lòng chọn file hình ảnh', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB
            this.showToast('Kích thước file không được vượt quá 2MB', 'error');
            return;
        }

        // Preview logo
        const reader = new FileReader();
        reader.onload = (event) => {
            this.previewLogo(event.target.result);
            this.showToast('Đã tải lên logo thành công', 'success');
        };
        reader.readAsDataURL(file);
    }

    previewLogo(dataUrl) {
        // Update favicon preview
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            favicon.href = dataUrl;
        }

        // Update logo in sidebar (simulated)
        const logoIcon = document.querySelector('.logo-icon');
        if (logoIcon) {
            logoIcon.style.display = 'none';
            const logoImg = document.createElement('img');
            logoImg.src = dataUrl;
            logoImg.style.width = '32px';
            logoImg.style.height = '32px';
            logoIcon.parentNode.appendChild(logoImg);
        }

        // Store in localStorage for persistence
        localStorage.setItem('hauhub-logo', dataUrl);
    }

    handleToggleChange(e) {
        const toggle = e.target;
        const label = toggle.parentNode.querySelector('.setting-title')?.textContent || toggle.id;
        
        console.log(`${label}: ${toggle.checked ? 'Bật' : 'Tắt'}`);
        
        // Auto-save
        this.autoSave(toggle.id, toggle.checked);
        
        // Show immediate feedback for important toggles
        if (toggle.id === 'allow-registration' && !toggle.checked) {
            this.showToast('Đã tắt đăng ký mới', 'warning');
        }
    }

    handleCertAction(e) {
        const action = e.currentTarget.textContent.trim();
        
        switch (action) {
            case 'Gia hạn SSL':
                this.renewSSLCertificate();
                break;
            case 'Xem chi tiết':
                this.viewCertificateDetails();
                break;
            case 'Tạo CSR mới':
                this.generateCSR();
                break;
        }
    }

    renewSSLCertificate() {
        this.showLoading('Đang gia hạn SSL...');
        
        setTimeout(() => {
            this.hideLoading();
            this.showToast('Đã gia hạn SSL thành công', 'success');
            
            // Update certificate info
            this.updateCertificateInfo();
        }, 2000);
    }

    viewCertificateDetails() {
        const details = `
            <div class="cert-details">
                <div class="cert-detail-item">
                    <strong>Tổ chức phát hành:</strong> Let's Encrypt
                </div>
                <div class="cert-detail-item">
                    <strong>Thuật toán:</strong> RSA 2048-bit
                </div>
                <div class="cert-detail-item">
                    <strong>Ngày cấp:</strong> ${new Date().toLocaleDateString('vi-VN')}
                </div>
                <div class="cert-detail-item">
                    <strong>Ngày hết hạn:</strong> ${new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                </div>
                <div class="cert-detail-item">
                    <strong>Chữ ký:</strong> SHA256-RSA
                </div>
            </div>
        `;
        
        this.showModal('Chi tiết chứng chỉ SSL', details);
    }

    generateCSR() {
        this.showLoading('Đang tạo CSR mới...');
        
        setTimeout(() => {
            this.hideLoading();
            
            const csrContent = `-----BEGIN CERTIFICATE REQUEST-----
MIICVzCCAT8CAQAwETEPMA0GA1UEAwwGaGF1aHViMIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAw8vJz8nLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
y8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvIy8jLyMvI
-----END CERTIFICATE REQUEST-----`;
            
            this.showModal('CSR mới đã tạo', `
                <div class="csr-content">
                    <p>CSR đã được tạo thành công. Vui lòng sao chép nội dung bên dưới:</p>
                    <textarea class="csr-textarea" rows="10" readonly>${csrContent}</textarea>
                    <button class="btn-primary copy-csr-btn" style="margin-top: 1rem;">
                        <span class="material-symbols-outlined">content_copy</span>
                        Sao chép CSR
                    </button>
                </div>
            `);
            
            // Add copy functionality
            document.querySelector('.copy-csr-btn')?.addEventListener('click', () => {
                navigator.clipboard.writeText(csrContent);
                this.showToast('Đã sao chép CSR vào clipboard', 'success');
            });
        }, 1500);
    }

    updatePerformanceMetrics() {
        // Simulate updating performance metrics
        const metrics = [
            { id: 0, value: Math.floor(Math.random() * 30) + 30 },
            { id: 1, value: Math.floor(Math.random() * 40) + 40 },
            { id: 2, value: Math.floor(Math.random() * 35) + 30 },
            { id: 3, value: Math.floor(Math.random() * 50) + 100 }
        ];

        metrics.forEach((metric, index) => {
            if (this.performanceMetrics[index]) {
                const newValue = metric.value;
                const currentValue = parseInt(this.performanceMetrics[index].style.width);
                
                // Animate the change
                this.animateMetricChange(this.performanceMetrics[index], currentValue, newValue);
                
                // Update the value display
                const valueDisplay = this.performanceMetrics[index].closest('.metric-card')
                    .querySelector('.metric-value');
                if (valueDisplay) {
                    if (index === 3) {
                        valueDisplay.textContent = `${newValue}ms`;
                    } else {
                        valueDisplay.textContent = `${newValue}%`;
                    }
                }
            }
        });
    }

    animateMetric(metric) {
        const targetWidth = metric.style.width;
        metric.style.width = '0%';
        
        setTimeout(() => {
            metric.style.transition = 'width 1s ease';
            metric.style.width = targetWidth;
        }, 100);
    }

    animateMetricChange(metric, from, to) {
        metric.style.transition = 'width 0.5s ease';
        metric.style.width = `${to}%`;
    }

    updateCertificateInfo() {
        // Update certificate expiry
        const daysLeft = Math.floor(Math.random() * 30) + 10;
        const certValue = document.querySelector('.cert-value');
        if (certValue && certValue.textContent.includes('còn')) {
            certValue.textContent = `90 ngày (còn ${daysLeft} ngày)`;
        }
    }

    updateSystemStatus() {
        // Update status dot and text
        const statusDot = this.systemStatus?.querySelector('.status-dot');
        const statusText = this.systemStatus?.querySelector('.status-text');
        
        if (statusDot && statusText) {
            statusDot.classList.remove('online', 'warning', 'error');
            statusDot.classList.add('online');
            statusText.textContent = 'Hệ thống ổn định';
        }
    }

    setupFormValidation() {
        // Add validation to required fields
        const requiredFields = document.querySelectorAll('.setting-label.required');
        requiredFields.forEach(label => {
            const fieldId = label.getAttribute('for');
            const field = document.getElementById(fieldId);
            
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearFieldError(field));
            }
        });
    }

    validateField(field) {
        if (!field.value.trim()) {
            this.showFieldError(field, 'Trường này là bắt buộc');
            return false;
        }
        
        // Additional validations based on field type
        switch (field.type) {
            case 'email':
                if (!this.isValidEmail(field.value)) {
                    this.showFieldError(field, 'Email không hợp lệ');
                    return false;
                }
                break;
            case 'number':
                if (field.min && parseInt(field.value) < parseInt(field.min)) {
                    this.showFieldError(field, `Giá trị tối thiểu là ${field.min}`);
                    return false;
                }
                break;
        }
        
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);
        
        // Add error class
        field.classList.add('error');
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--error)';
        errorDiv.style.fontSize = '0.75rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    setupAutoSave() {
        // Auto-save on form changes
        const autoSaveFields = document.querySelectorAll('.form-input, .form-select');
        autoSaveFields.forEach(field => {
            field.addEventListener('change', () => {
                this.autoSave(field.id, field.value);
            });
        });
    }

    autoSave(key, value) {
        // Debounce auto-save
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const config = JSON.parse(localStorage.getItem('hauhub-system-config') || '{}');
            config[key] = value;
            localStorage.setItem('hauhub-system-config', JSON.stringify(config));
            
            console.log(`Auto-saved: ${key} = ${value}`);
        }, 1000);
    }

    showSavingIndicator() {
        // Create saving indicator
        const indicator = document.createElement('div');
        indicator.className = 'saving-indicator';
        indicator.innerHTML = `
            <span class="material-symbols-outlined">sync</span>
            Đang lưu...
        `;
        indicator.style.position = 'fixed';
        indicator.style.top = '20px';
        indicator.style.right = '20px';
        indicator.style.backgroundColor = 'var(--primary)';
        indicator.style.color = 'white';
        indicator.style.padding = '0.75rem 1.25rem';
        indicator.style.borderRadius = 'var(--radius-lg)';
        indicator.style.boxShadow = 'var(--shadow-md)';
        indicator.style.zIndex = '9999';
        indicator.style.display = 'flex';
        indicator.style.alignItems = 'center';
        indicator.style.gap = '0.5rem';
        indicator.style.animation = 'pulse 1.5s infinite';
        
        document.body.appendChild(indicator);
        this.savingIndicator = indicator;
    }

    hideSavingIndicator() {
        if (this.savingIndicator) {
            this.savingIndicator.remove();
            this.savingIndicator = null;
        }
    }

    showLoading(message = 'Đang xử lý...') {
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9998';
        
        document.body.appendChild(overlay);
        this.loadingOverlay = overlay;
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
            this.loadingOverlay = null;
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="material-symbols-outlined">
                ${type === 'success' ? 'check_circle' : 
                  type === 'error' ? 'error' : 
                  type === 'warning' ? 'warning' : 'info'}
            </span>
            <span>${message}</span>
        `;
        
        // Style toast
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = type === 'success' ? 'var(--success)' :
                                     type === 'error' ? 'var(--error)' :
                                     type === 'warning' ? 'var(--warning)' : 'var(--primary)';
        toast.style.color = 'white';
        toast.style.padding = '1rem 1.5rem';
        toast.style.borderRadius = 'var(--radius-lg)';
        toast.style.boxShadow = 'var(--shadow-lg)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '0.75rem';
        toast.style.zIndex = '9999';
        toast.style.animation = 'slideIn 0.3s ease, fadeOut 0.3s ease 2.7s';
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    showModal(title, content, type = 'info') {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'config-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-close-btn">Đóng</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .config-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(2px);
            }
            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-2xl);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h3 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-primary);
            }
            .modal-close {
                background: none;
                border: none;
                padding: 0.5rem;
                cursor: pointer;
                color: var(--text-secondary);
                border-radius: var(--radius-md);
            }
            .modal-close:hover {
                background: var(--background-light);
            }
            .modal-body {
                padding: 1.5rem;
                overflow-y: auto;
                flex: 1;
            }
            .modal-footer {
                padding: 1.5rem;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }
            .csr-textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                font-family: var(--font-mono);
                font-size: 0.75rem;
                resize: vertical;
            }
            .validation-error {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                border-radius: var(--radius-lg);
                margin-bottom: 0.5rem;
                color: var(--error);
            }
            .validation-error .material-symbols-outlined {
                font-size: 1.25rem;
            }
        `;
        document.head.appendChild(style);
        
        // Add close functionality
        modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
        
        // Store modal reference
        this.currentModal = modal;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.systemConfig = new SystemConfig();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
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
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-spinner {
            text-align: center;
        }
        .loading-spinner p {
            margin-top: 1rem;
            color: var(--text-secondary);
            font-weight: 500;
        }
        .search-highlight {
            background-color: #fbbf24 !important;
            color: #000 !important;
            padding: 0 2px !important;
            border-radius: 2px !important;
        }
        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 100;
            margin-top: 0.5rem;
            padding: 1rem;
        }
        .search-result-message {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
    `;
    document.head.appendChild(style);
});

// Export functionality for other scripts
window.exportConfig = () => {
    if (window.systemConfig) {
        window.systemConfig.exportConfig();
    }
};

// Reset configuration
window.resetConfig = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại tất cả cấu hình về mặc định?')) {
        localStorage.removeItem('hauhub-system-config');
        location.reload();
    }
};






// system-config.js - Phần thêm vào

// Back to top button đơn giản
function setupSimpleScroll() {
    // Tạo back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
    backToTopBtn.setAttribute('aria-label', 'Lên đầu trang');
    document.body.appendChild(backToTopBtn);
    
    // Sự kiện click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hiển thị/ẩn khi scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Thêm smooth scroll cho anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Gọi khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setupSimpleScroll();
    
    // Log để debug
    console.log('Page height:', document.body.scrollHeight);
    console.log('Viewport height:', window.innerHeight);
    console.log('Can scroll:', document.body.scrollHeight > window.innerHeight);
});