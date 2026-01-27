/**
 * Search Component
 * Handles search functionality across the application
 */

class SearchComponent {
    constructor() {
        this.searchInputs = document.querySelectorAll('.search-input');
        this.searchButtons = document.querySelectorAll('.search-button, .search-icon');
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAutoComplete();
    }

    bindEvents() {
        // Bind enter key on search inputs
        this.searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(input.value);
                }
            });
        });

        // Bind click on search buttons/icons
        this.searchButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.closest('.search-box')?.querySelector('.search-input') ||
                            document.querySelector('.search-input');
                if (input) {
                    this.performSearch(input.value);
                }
            });
        });
    }

    setupAutoComplete() {
        // Setup auto-complete for search inputs
        this.searchInputs.forEach(input => {
            input.addEventListener('input', debounce(() => {
                this.showSuggestions(input.value);
            }, 300));
            
            input.addEventListener('focus', () => {
                if (input.value) {
                    this.showSuggestions(input.value);
                }
            });
        });
    }

    async showSuggestions(query) {
        if (query.length < 2) return;
        
        try {
            const suggestions = await this.fetchSuggestions(query);
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    async fetchSuggestions(query) {
        // Mock suggestions - replace with actual API call
        const mockSuggestions = [
            { type: 'topic', title: 'Đồ án kiến trúc năm 3', category: 'Kiến trúc' },
            { type: 'user', name: 'Nguyễn Văn An', role: 'Giảng viên' },
            { type: 'document', title: 'Tài liệu Revit cơ bản', category: 'Tài liệu' },
            { type: 'category', name: 'Quy hoạch đô thị', description: 'Chuyên mục quy hoạch' }
        ];
        
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockSuggestions.filter(item => 
                    item.title?.toLowerCase().includes(query.toLowerCase()) ||
                    item.name?.toLowerCase().includes(query.toLowerCase()) ||
                    item.category?.toLowerCase().includes(query.toLowerCase())
                ));
            }, 200);
        });
    }

    displaySuggestions(suggestions) {
        // Remove existing suggestions
        this.removeSuggestions();
        
        if (suggestions.length === 0) return;
        
        const searchBox = document.querySelector('.search-box');
        if (!searchBox) return;
        
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = this.formatSuggestion(suggestion);
            suggestionItem.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
        
        searchBox.appendChild(suggestionsContainer);
    }

    formatSuggestion(suggestion) {
        switch (suggestion.type) {
            case 'topic':
                return `
                    <div class="suggestion-icon">📝</div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${suggestion.title}</div>
                        <div class="suggestion-meta">Chủ đề • ${suggestion.category}</div>
                    </div>
                `;
            case 'user':
                return `
                    <div class="suggestion-icon">👤</div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${suggestion.name}</div>
                        <div class="suggestion-meta">Thành viên • ${suggestion.role}</div>
                    </div>
                `;
            case 'document':
                return `
                    <div class="suggestion-icon">📄</div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${suggestion.title}</div>
                        <div class="suggestion-meta">Tài liệu • ${suggestion.category}</div>
                    </div>
                `;
            default:
                return `
                    <div class="suggestion-icon">📁</div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${suggestion.name}</div>
                        <div class="suggestion-meta">${suggestion.description}</div>
                    </div>
                `;
        }
    }

    selectSuggestion(suggestion) {
        // Handle suggestion selection
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = suggestion.title || suggestion.name;
        }
        
        // Navigate based on suggestion type
        switch (suggestion.type) {
            case 'topic':
                window.location.href = `topic-detail.html?id=${suggestion.id}`;
                break;
            case 'user':
                window.location.href = `../user/profile.html?id=${suggestion.id}`;
                break;
            case 'document':
                window.location.href = `document-detail.html?id=${suggestion.id}`;
                break;
            case 'category':
                window.location.href = `category-detail.html?id=${suggestion.id}`;
                break;
        }
        
        this.removeSuggestions();
    }

    performSearch(query) {
        if (!query.trim()) {
            this.showMessage('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }
        
        // Remove suggestions
        this.removeSuggestions();
        
        // Navigate to search results page
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    }

    removeSuggestions() {
        const existingSuggestions = document.querySelector('.search-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
    }

    showMessage(message) {
        // Use your existing notification system
        alert(message); // Replace with better notification
    }
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize search component
document.addEventListener('DOMContentLoaded', () => {
    const searchComponent = new SearchComponent();
});