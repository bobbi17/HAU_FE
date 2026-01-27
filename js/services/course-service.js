import { API_ENDPOINTS } from '../config/api-config.js';
import { authRequest } from '../utils/auth.js';

class CourseService {
    constructor() {
        this.baseURL = API_ENDPOINTS.COURSES;
    }
    
    async getClassById(classId) {
        try {
            const response = await fetch(`${this.baseURL}/classes/${classId}`);
            if (!response.ok) throw new Error('Failed to fetch class data');
            return await response.json();
        } catch (error) {
            console.error('CourseService.getClassById error:', error);
            throw error;
        }
    }
    
    async getClassDocuments(classId) {
        try {
            const response = await fetch(`${this.baseURL}/classes/${classId}/documents`);
            if (!response.ok) throw new Error('Failed to fetch class documents');
            return await response.json();
        } catch (error) {
            console.error('CourseService.getClassDocuments error:', error);
            throw error;
        }
    }
    
    async getClassDeadlines(classId) {
        try {
            const response = await fetch(`${this.baseURL}/classes/${classId}/deadlines`);
            if (!response.ok) throw new Error('Failed to fetch class deadlines');
            return await response.json();
        } catch (error) {
            console.error('CourseService.getClassDeadlines error:', error);
            throw error;
        }
    }
    
    async getClassNotes(classId) {
        try {
            const response = await fetch(`${this.baseURL}/classes/${classId}/notes`);
            if (!response.ok) throw new Error('Failed to fetch class notes');
            const data = await response.json();
            return data.notes;
        } catch (error) {
            console.error('CourseService.getClassNotes error:', error);
            throw error;
        }
    }
    
    async getClassStats(classId) {
        try {
            const response = await fetch(`${this.baseURL}/classes/${classId}/stats`);
            if (!response.ok) throw new Error('Failed to fetch class stats');
            return await response.json();
        } catch (error) {
            console.error('CourseService.getClassStats error:', error);
            throw error;
        }
    }
    
    async uploadClassDocument(classId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await authRequest(`${this.baseURL}/classes/${classId}/documents`, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) throw new Error('Failed to upload document');
            return await response.json();
        } catch (error) {
            console.error('CourseService.uploadClassDocument error:', error);
            throw error;
        }
    }
    
    async downloadDocument(docId) {
        try {
            const response = await authRequest(`${this.baseURL}/documents/${docId}/download`);
            
            if (!response.ok) throw new Error('Failed to download document');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('CourseService.downloadDocument error:', error);
            throw error;
        }
    }
    
    async downloadAllDocuments(classId) {
        try {
            const response = await authRequest(`${this.baseURL}/classes/${classId}/documents/download-all`);
            
            if (!response.ok) throw new Error('Failed to download all documents');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `class-${classId}-documents.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('CourseService.downloadAllDocuments error:', error);
            throw error;
        }
    }
    
    async submitAssignment(classId, formData) {
        try {
            const response = await authRequest(`${this.baseURL}/classes/${classId}/assignments/submit`, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) throw new Error('Failed to submit assignment');
            return await response.json();
        } catch (error) {
            console.error('CourseService.submitAssignment error:', error);
            throw error;
        }
    }
    
    async contactInstructor(classId, formData) {
        try {
            const response = await authRequest(`${this.baseURL}/classes/${classId}/contact-instructor`, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) throw new Error('Failed to contact instructor');
            return await response.json();
        } catch (error) {
            console.error('CourseService.contactInstructor error:', error);
            throw error;
        }
    }
}

export default CourseService;