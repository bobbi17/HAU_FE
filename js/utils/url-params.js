// Utility để quản lý URL parameters
export function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params.entries()) {
        result[key] = value;
    }
    
    return result;
}

export function setUrlParams(params) {
    const url = new URL(window.location);
    
    // Xóa params cũ
    url.search = '';
    
    // Thêm params mới
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    
    // Cập nhật URL mà không reload trang
    window.history.pushState({}, '', url);
}

export function updateUrlParam(key, value) {
    const url = new URL(window.location);
    
    if (value === undefined || value === null || value === '') {
        url.searchParams.delete(key);
    } else {
        url.searchParams.set(key, value);
    }
    
    window.history.pushState({}, '', url);
}

export function removeUrlParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
}