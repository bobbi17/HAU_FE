// File: ../../js/pages/statistics.js
import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initCharts();
    
    // Period selector
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateChartsPeriod(this.dataset.period);
        });
    });
    
    // Export report
    const exportBtn = document.getElementById('export-report-btn');
    const exportModal = document.getElementById('export-modal');
    const cancelExport = document.getElementById('cancel-export');
    const confirmExport = document.getElementById('confirm-export');
    
    if (exportBtn && exportModal) {
        exportBtn.addEventListener('click', () => {
            exportModal.classList.add('active');
        });
        
        const closeBtn = exportModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                exportModal.classList.remove('active');
            });
        }
        
        cancelExport.addEventListener('click', () => {
            exportModal.classList.remove('active');
        });
        
        confirmExport.addEventListener('click', () => {
            const reportType = document.getElementById('report-type').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const format = document.querySelector('input[name="format"]:checked').value;
            
            // Simulate export
            alert(`Đang xuất báo cáo ${reportType} (${startDate} - ${endDate}) dạng ${format}...`);
            exportModal.classList.remove('active');
        });
    }
    
    // System performance chart controls
    const perfBtns = document.querySelectorAll('.chart-btn[data-metric]');
    perfBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            perfBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateSystemPerformanceChart(this.dataset.metric);
        });
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                window.location.href = '../../index.html';
            }
        });
    }
    
    // View all buttons
    document.getElementById('view-all-users')?.addEventListener('click', () => {
        window.location.href = 'user-management.html';
    });
    
    document.getElementById('view-all-activity')?.addEventListener('click', () => {
        alert('Chuyển đến trang nhật ký hoạt động');
    });
});

// Cập nhật trong phần initCharts() để sử dụng màu mới
function initCharts() {
    // KPI Mini Charts - sử dụng màu architectural
    createMiniChart('users-chart', [65, 59, 80, 81, 56, 55, 70], '#0A2463'); // arch-blue
    createMiniChart('posts-chart', [28, 48, 40, 19, 86, 27, 90], '#10b981'); // success
    createMiniChart('courses-chart', [45, 25, 36, 48, 42, 60, 55], '#f59e0b'); // warning
    createMiniChart('ai-docs-chart', [12, 19, 30, 51, 72, 89, 100], '#ef4444'); // danger
    
    // User Growth Chart - sử dụng arch-blue
    createUserGrowthChart();
    
    // Activity Distribution Chart - màu phù hợp với palette mới
    createActivityDistributionChart();
    
    // Platform Usage Chart
    createPlatformUsageChart();
    
    // Faculty Performance Chart
    createFacultyPerformanceChart();
    
    // System Performance Chart
    createSystemPerformanceChart('cpu');
}

function createUserGrowthChart() {
    const ctx = document.getElementById('user-growth-chart').getContext('2d');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Người dùng',
                data: [1250, 1800, 2100, 3200, 4500, 5200, 6100, 7200, 8000, 8562, 9000, 9500],
                borderColor: '#0A2463', // arch-blue
                backgroundColor: 'rgba(10, 36, 99, 0.1)', // arch-blue với opacity
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: { 
                        display: false,
                        color: 'rgba(203, 213, 225, 0.1)' // drafting-light
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(203, 213, 225, 0.1)' // drafting-light
                    }
                }
            }
        }
    });
}

function createActivityDistributionChart() {
    const ctx = document.getElementById('activity-distribution-chart').getContext('2d');
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sinh viên', 'Giảng viên', 'Quản trị'],
            datasets: [{
                data: [68, 22, 10],
                backgroundColor: [
                    '#0A2463', // arch-blue
                    '#10b981', // success
                    '#8b5cf6'  // purple (phù hợp với palette)
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}

function createPlatformUsageChart() {
    const ctx = document.getElementById('platform-usage-chart').getContext('2d');
    
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Desktop', 'Mobile', 'Tablet'],
            datasets: [{
                data: [54, 38, 8],
                backgroundColor: [
                    '#3b82f6', // info blue
                    '#10b981', // success
                    '#f59e0b'  // warning
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function createFacultyPerformanceChart() {
    const ctx = document.getElementById('faculty-performance-chart').getContext('2d');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Kiến trúc', 'CNTT', 'Xây dựng', 'Điện tử', 'Cơ bản', 'QTKD'],
            datasets: [{
                label: 'Bài viết',
                data: [320, 450, 280, 310, 190, 260],
                backgroundColor: '#0A2463', // arch-blue
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { 
                        display: false,
                        color: 'rgba(203, 213, 225, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { 
                        color: 'rgba(203, 213, 225, 0.1)'
                    }
                }
            }
        }
    });
}

function createSystemPerformanceChart(metric) {
    const ctx = document.getElementById('system-performance-chart').getContext('2d');
    
    // Generate data based on metric
    let data, label, color;
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    switch(metric) {
        case 'cpu':
            data = [35, 42, 38, 45, 32, 28, 40, 55, 60, 58, 52, 48, 42, 38, 35, 40, 52, 68, 72, 65, 58, 50, 45, 38];
            label = 'CPU Usage %';
            color = '#ef4444';
            break;
        case 'memory':
            data = [62, 65, 68, 70, 72, 68, 65, 62, 60, 58, 55, 52, 50, 48, 52, 58, 65, 72, 75, 78, 72, 68, 65, 62];
            label = 'Memory Usage %';
            color = '#10b981';
            break;
        case 'storage':
            data = [78, 78, 79, 79, 78, 77, 76, 75, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 84, 83, 82, 81, 80, 79];
            label = 'Storage Usage %';
            color = '#3b82f6';
            break;
        case 'network':
            data = [45, 38, 42, 55, 68, 72, 65, 58, 52, 48, 42, 38, 35, 40, 52, 68, 85, 92, 88, 78, 65, 58, 52, 48];
            label = 'Network MB/s';
            color = '#8b5cf6';
            break;
    }
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            }
        }
    });
}

let systemPerfChart = null;

function updateSystemPerformanceChart(metric) {
    if (systemPerfChart) {
        systemPerfChart.destroy();
    }
    systemPerfChart = createSystemPerformanceChart(metric);
}

function updateChartsPeriod(period) {
    console.log('Updating charts for period:', period);
    // In a real app, you would fetch new data based on period
    // and update all charts
}