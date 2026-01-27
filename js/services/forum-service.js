/**
 * Forum Service
 * Handles forum-related API calls
 */

class ForumService {
    constructor() {
        this.baseUrl = '/api/forum'; // Update with your actual API endpoint
    }

    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    async getTrendingPosts(limit = 5) {
        try {
            const response = await fetch(`${this.baseUrl}/posts/trending?limit=${limit}`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch trending posts');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching trending posts:', error);
            throw error;
        }
    }

    async getActiveMembers(limit = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/members/active?limit=${limit}`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch active members');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching active members:', error);
            throw error;
        }
    }

    async searchForum(query, page = 1, limit = 20) {
        try {
            const response = await fetch(
                `${this.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
                {
                    headers: this.getHeaders()
                }
            );
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error searching forum:', error);
            throw error;
        }
    }

    async createTopic(topicData) {
        try {
            const response = await fetch(`${this.baseUrl}/topics`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(topicData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create topic');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating topic:', error);
            throw error;
        }
    }

    async getCategoryStats(categoryId) {
        try {
            const response = await fetch(`${this.baseUrl}/categories/${categoryId}/stats`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch category stats');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching category stats:', error);
            throw error;
        }
    }

    async getPinnedTopics() {
        try {
            const response = await fetch(`${this.baseUrl}/topics/pinned`, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch pinned topics');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching pinned topics:', error);
            throw error;
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    getAuthToken() {
        // Get auth token from localStorage or cookies
        return localStorage.getItem('auth_token') || 
               document.cookie.replace(/(?:(?:^|.*;\s*)auth_token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    }
}




// TOPIC DETAILS 
import { API_ENDPOINTS } from '../config/api-config.js';
import { authRequest } from '../utils/auth.js';

class ForumService {
    constructor() {
        this.baseURL = API_ENDPOINTS.FORUM;
    }
    
    async getTopicById(id) {
        try {
            const response = await fetch(`${this.baseURL}/topics/${id}`);
            if (!response.ok) throw new Error('Failed to fetch topic');
            return await response.json();
        } catch (error) {
            console.error('ForumService.getTopicById error:', error);
            throw error;
        }
    }
    
    async getCommentsByTopicId(topicId) {
        try {
            const response = await fetch(`${this.baseURL}/topics/${topicId}/comments`);
            if (!response.ok) throw new Error('Failed to fetch comments');
            return await response.json();
        } catch (error) {
            console.error('ForumService.getCommentsByTopicId error:', error);
            throw error;
        }
    }
    
    async addComment(commentData) {
        try {
            const response = await authRequest(`${this.baseURL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentData),
            });
            
            if (!response.ok) throw new Error('Failed to add comment');
            return await response.json();
        } catch (error) {
            console.error('ForumService.addComment error:', error);
            throw error;
        }
    }
    
    async likeTopic(topicId) {
        try {
            const response = await authRequest(`${this.baseURL}/topics/${topicId}/like`, {
                method: 'POST',
            });
            
            if (!response.ok) throw new Error('Failed to like topic');
            return await response.json();
        } catch (error) {
            console.error('ForumService.likeTopic error:', error);
            throw error;
        }
    }
    
    async likeComment(commentId) {
        try {
            const response = await authRequest(`${this.baseURL}/comments/${commentId}/like`, {
                method: 'POST',
            });
            
            if (!response.ok) throw new Error('Failed to like comment');
            return await response.json();
        } catch (error) {
            console.error('ForumService.likeComment error:', error);
            throw error;
        }
    }
    
    async reportContent(contentId, reason) {
        try {
            const response = await authRequest(`${this.baseURL}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contentId,
                    reason,
                    type: 'topic'
                }),
            });
            
            if (!response.ok) throw new Error('Failed to report content');
            return await response.json();
        } catch (error) {
            console.error('ForumService.reportContent error:', error);
            throw error;
        }
    }
    
    async pinTopic(topicId) {
        try {
            const response = await authRequest(`${this.baseURL}/topics/${topicId}/pin`, {
                method: 'PUT',
            });
            
            if (!response.ok) throw new Error('Failed to pin topic');
            return await response.json();
        } catch (error) {
            console.error('ForumService.pinTopic error:', error);
            throw error;
        }
    }
    
    async lockTopic(topicId) {
        try {
            const response = await authRequest(`${this.baseURL}/topics/${topicId}/lock`, {
                method: 'PUT',
            });
            
            if (!response.ok) throw new Error('Failed to lock topic');
            return await response.json();
        } catch (error) {
            console.error('ForumService.lockTopic error:', error);
            throw error;
        }
    }
}

export default ForumService;
