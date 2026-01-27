import { API_CONFIG } from '../config/api-config.js';
import { getAuthToken } from '../utils/auth.js';

class AIService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    async sendMessage(message, chatId = null) {
        const token = getAuthToken();
        
        const response = await fetch(`${this.baseURL}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                message,
                chat_id: chatId,
                context: {
                    subject: 'Kết cấu bê tông cốt thép',
                    student_level: 'university'
                }
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    }

    async analyzeFile(file) {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/api/ai/analyze`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('File analysis failed');
        }

        return await response.json();
    }

    async getChatHistory(chatId) {
        const token = getAuthToken();
        
        const response = await fetch(`${this.baseURL}/api/ai/chats/${chatId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load chat history');
        }

        return await response.json();
    }

    async getChatList() {
        const token = getAuthToken();
        
        const response = await fetch(`${this.baseURL}/api/ai/chats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load chat list');
        }

        return await response.json();
    }

    // Mock response for development
    async mockSendMessage(message) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    content: `Tôi đã nhận được câu hỏi: "${message}". Đây là câu trả lời chi tiết...`,
                    resources: [
                        {
                            name: 'TCVN 5574:2018',
                            source: 'Tiêu chuẩn thiết kế BTCT',
                            url: '#',
                            icon: 'picture_as_pdf',
                            type: 'pdf'
                        },
                        {
                            name: 'Bảng tra cốt thép',
                            source: 'Thư viện số HauHub',
                            url: '#',
                            icon: 'database',
                            type: 'db'
                        }
                    ],
                    suggestions: ['Chi tiết hơn về bước 1', 'Ví dụ thực tế', 'Công thức tính toán'],
                    chatId: `chat_${Date.now()}`
                });
            }, 1500);
        });
    }
}

const aiServiceInstance = new AIService();




// TÀI LIỆU AI
// ai-service.js - Mock API service for AI documents
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockDocuments = [
    {
        id: 1,
        name: 'Kế hoạch đào tạo 2024.pdf',
        type: 'pdf',
        size: '2.4 MB',
        category: 'Academic / Dept. IT',
        status: 'vectorized',
        uploadedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        tags: ['academic', 'planning', '2024'],
        tokens: 12500,
        pages: 42,
        model: 'text-embedding-3-small',
        dimensions: 1536,
        description: 'Kế hoạch đào tạo năm 2024 của khoa Công nghệ Thông tin'
    },
    {
        id: 2,
        name: 'Quy_che_tuyen_sinh_2024.docx',
        type: 'docx',
        size: '845 KB',
        category: 'Admin / Dept. Admission',
        status: 'processing',
        uploadedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        tags: ['admission', 'regulation'],
        tokens: 8400,
        pages: 32,
        model: 'text-embedding-3-small',
        dimensions: 1536,
        description: 'Quy chế tuyển sinh đại học hệ chính quy năm 2024'
    },
    {
        id: 3,
        name: 'dataset_hust_qa.json',
        type: 'json',
        size: '12.2 MB',
        category: 'Dataset / Training',
        status: 'failed',
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tags: ['dataset', 'training'],
        tokens: 0,
        pages: 0,
        error: 'JSON parsing error: invalid format at line 142'
    },
    {
        id: 4,
        name: 'building_plan_2024.dwg',
        type: 'dwg',
        size: '8.7 MB',
        category: 'Architecture / Blueprint',
        status: 'pending',
        uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        tags: ['architecture', 'blueprint'],
        description: 'Bản vẽ thiết kế tòa nhà A năm 2024'
    },
    {
        id: 5,
        name: 'research_paper_ai.pdf',
        type: 'pdf',
        size: '3.1 MB',
        category: 'Research / AI',
        status: 'vectorized',
        uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        tags: ['research', 'ai', 'machine-learning'],
        tokens: 21500,
        pages: 56,
        model: 'text-embedding-3-large',
        dimensions: 3072,
        description: 'Bài nghiên cứu về ứng dụng AI trong giáo dục'
    },
    {
        id: 6,
        name: 'student_handbook.txt',
        type: 'txt',
        size: '450 KB',
        category: 'Student / Guide',
        status: 'vectorized',
        uploadedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        tags: ['student', 'handbook', 'guide'],
        tokens: 5200,
        pages: 24,
        model: 'text-embedding-3-small',
        dimensions: 1536,
        description: 'Sổ tay hướng dẫn sinh viên năm học 2024-2025'
    }
];

export async function getDocuments() {
    await delay(500);
    return {
        success: true,
        data: [...mockDocuments]
    };
}

export async function getDocumentById(id) {
    await delay(300);
    const document = mockDocuments.find(doc => doc.id === id);
    if (!document) {
        throw new Error(`Document with ID ${id} not found`);
    }
    return {
        success: true,
        data: { ...document }
    };
}

export async function uploadDocument(formData) {
    console.log('Uploading document:', formData);
    await delay(2000);
    
    // Simulate file upload
    const file = formData.get('file');
    const tags = JSON.parse(formData.get('tags') || '[]');
    const model = formData.get('model');
    
    const newDocument = {
        id: mockDocuments.length + 1,
        name: file.name,
        type: file.name.split('.').pop().toLowerCase(),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        category: 'New / Upload',
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        tags: tags,
        model: model,
        description: 'Tài liệu mới được tải lên'
    };
    
    mockDocuments.unshift(newDocument);
    
    return {
        success: true,
        message: 'Document uploaded successfully',
        data: newDocument
    };
}

export async function processDocument(id) {
    await delay(1500);
    const document = mockDocuments.find(doc => doc.id === id);
    if (!document) {
        throw new Error(`Document with ID ${id} not found`);
    }
    
    document.status = 'processing';
    
    return {
        success: true,
        message: 'Document processing started',
        data: document
    };
}

export async function deleteDocument(id) {
    await delay(800);
    const index = mockDocuments.findIndex(doc => doc.id === id);
    if (index === -1) {
        throw new Error(`Document with ID ${id} not found`);
    }
    
    mockDocuments.splice(index, 1);
    
    return {
        success: true,
        message: 'Document deleted successfully'
    };
}

export async function syncVectorDatabase() {
    await delay(3000);
    return {
        success: true,
        message: 'Vector database synchronized successfully',
        data: {
            syncedCount: mockDocuments.length,
            timestamp: new Date().toISOString()
        }
    };
}

export async function getDocumentStats() {
    await delay(300);
    const totalTokens = mockDocuments.reduce((sum, doc) => sum + (doc.tokens || 0), 0);
    const vectorizedCount = mockDocuments.filter(doc => doc.status === 'vectorized').length;
    const processingCount = mockDocuments.filter(doc => doc.status === 'processing').length;
    
    return {
        success: true,
        data: {
            total: mockDocuments.length,
            storageUsed: '4.2 GB',
            tokens: totalTokens,
            processingStatus: processingCount > 0 ? 'Processing' : 'Idle',
            storagePercentage: 84,
            vectorizedCount: vectorizedCount,
            processingCount: processingCount,
            failedCount: mockDocuments.filter(doc => doc.status === 'failed').length
        }
    };
}

export async function getSystemMetrics() {
    await delay(300);
    return {
        success: true,
        data: {
            cpu: Math.floor(Math.random() * 30) + 30, // 30-60%
            ram: Math.floor(Math.random() * 40) + 40, // 40-80%
            storage: 84
        }
    };
}

export function addLogEntry(message, type = 'info') {
    console.log(`[${type}] ${message}`);
}