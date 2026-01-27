// Group Management API calls
export const groupService = {
    // Get group by ID
    getGroupById: async (groupId) => {
        try {
            // Mock data for demonstration
            return {
                success: true,
                data: {
                    id: groupId,
                    name: "Nhóm 04 - Đồ án Kiến trúc Dân dụng",
                    code: "STUDIO-2023-04",
                    description: "Nhóm chuyên nghiên cứu và phát triển đồ án kiến trúc dân dụng, tập trung vào thiết kế bền vững và hiện đại.",
                    status: "active",
                    course: "K65-KTDN",
                    createdAt: "2023-09-01",
                    updatedAt: "2024-05-16",
                    advisor: "TS. Nguyễn Văn Hải",
                    advisorEmail: "hai.nguyen@hau.edu.vn",
                    projectTitle: "Thiết kế tổ hợp chung cư cao tầng tại Hà Nội",
                    projectStatus: "in_progress",
                    progress: 65
                }
            };
        } catch (error) {
            console.error('Error fetching group:', error);
            throw error;
        }
    },

    // Get group members
    getGroupMembers: async (groupId) => {
        try {
            // Mock data for demonstration
            return {
                success: true,
                data: [
                    {
                        id: "mem_001",
                        name: "Nguyễn Văn An",
                        studentId: "651203",
                        email: "an.nguyen@hau.edu.vn",
                        phone: "0987 654 321",
                        role: "leader",
                        joinedAt: "2023-09-01",
                        skills: ["Revit", "AutoCAD", "3Ds Max", "Photoshop"],
                        avatar: "https://example.com/avatars/an.jpg"
                    },
                    {
                        id: "mem_002",
                        name: "Trần Thị Lan",
                        studentId: "651245",
                        email: "lan.tran@hau.edu.vn",
                        phone: "0986 543 210",
                        role: "member",
                        joinedAt: "2023-09-01",
                        skills: ["SketchUp", "Lumion", "Illustrator", "Enscape"],
                        avatar: "https://example.com/avatars/lan.jpg"
                    },
                    {
                        id: "mem_003",
                        name: "Phạm Minh Đức",
                        studentId: "651289",
                        email: "duc.pham@hau.edu.vn",
                        phone: "0978 912 345",
                        role: "member",
                        joinedAt: "2023-09-01",
                        skills: ["AutoCAD", "Revit", "Excel", "Project"],
                        avatar: "https://example.com/avatars/duc.jpg"
                    },
                    {
                        id: "mem_004",
                        name: "Lê Hoàng",
                        studentId: "651312",
                        email: "hoang.le@hau.edu.vn",
                        phone: "0967 890 123",
                        role: "member",
                        joinedAt: "2023-09-01",
                        skills: ["SketchUp", "V-Ray", "Illustrator", "InDesign"],
                        avatar: null
                    },
                    {
                        id: "mem_005",
                        name: "Ngô Thanh",
                        studentId: "651298",
                        email: "thanh.ngo@hau.edu.vn",
                        phone: "0956 789 012",
                        role: "member",
                        joinedAt: "2023-09-01",
                        skills: ["AutoCAD", "3Ds Max", "Enscape", "After Effects"],
                        avatar: null
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching group members:', error);
            throw error;
        }
    },

    // Add group member
    addGroupMember: async (groupId, memberData) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'Member added successfully'
            };
        } catch (error) {
            console.error('Error adding group member:', error);
            throw error;
        }
    },

    // Remove group member
    removeGroupMember: async (groupId, memberId) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'Member removed successfully'
            };
        } catch (error) {
            console.error('Error removing group member:', error);
            throw error;
        }
    },

    // Update member role
    updateMemberRole: async (groupId, memberId, role) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'Member role updated successfully'
            };
        } catch (error) {
            console.error('Error updating member role:', error);
            throw error;
        }
    },

    // Get group documents
    getGroupDocuments: async (groupId) => {
        try {
            // Mock data for demonstration
            return {
                success: true,
                data: [
                    {
                        id: "doc_001",
                        name: "Ban-ve-ky-thuat-Studio-v2.pdf",
                        type: "pdf",
                        size: "14.5 MB",
                        uploadedBy: "Nguyễn Văn An",
                        uploadedAt: "2024-05-16T12:10:00Z",
                        downloads: 24,
                        permissions: "view,download"
                    },
                    {
                        id: "doc_002",
                        name: "Render-Phoi-Canh-3D-Chinh.jpg",
                        type: "jpg",
                        size: "5.2 MB",
                        uploadedBy: "Trần Thị Lan",
                        uploadedAt: "2024-05-16T10:30:00Z",
                        downloads: 18,
                        permissions: "view,download"
                    },
                    {
                        id: "doc_003",
                        name: "Mat-bang-tang-1.dwg",
                        type: "dwg",
                        size: "8.7 MB",
                        uploadedBy: "Phạm Minh Đức",
                        uploadedAt: "2024-05-15T14:45:00Z",
                        downloads: 12,
                        permissions: "view,download"
                    },
                    {
                        id: "doc_004",
                        name: "Phan-tich-kien-truc.docx",
                        type: "docx",
                        size: "3.1 MB",
                        uploadedBy: "Lê Hoàng",
                        uploadedAt: "2024-05-14T09:20:00Z",
                        downloads: 8,
                        permissions: "view,download"
                    },
                    {
                        id: "doc_005",
                        name: "Thuyet-minh-do-an.pdf",
                        type: "pdf",
                        size: "2.8 MB",
                        uploadedBy: "Nguyễn Văn An",
                        uploadedAt: "2024-05-13T16:15:00Z",
                        downloads: 15,
                        permissions: "view,download"
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching group documents:', error);
            throw error;
        }
    },

    // Get upcoming meetings
    getUpcomingMeetings: async (groupId) => {
        try {
            // Mock data for demonstration
            return {
                success: true,
                data: [
                    {
                        id: "meet_001",
                        title: "Họp nhóm: Chỉnh sửa Mặt bằng tầng 1",
                        description: "Thảo luận về thiết kế mặt bằng tầng 1 và phân công công việc tuần tới.",
                        date: "2024-05-23",
                        time: "14:00 - 15:30",
                        isOnline: true,
                        link: "https://meet.google.com/abc-defg-hij",
                        location: null,
                        attendees: 5,
                        status: "scheduled"
                    },
                    {
                        id: "meet_002",
                        title: "Gặp gỡ cố vấn: Phản biện thiết kế",
                        description: "Trình bày và nhận phản biện từ cố vấn về phương án thiết kế hiện tại.",
                        date: "2024-05-28",
                        time: "09:00 - 11:00",
                        isOnline: false,
                        link: null,
                        location: "Phòng 301, Tòa nhà A1",
                        attendees: 6,
                        status: "scheduled"
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching upcoming meetings:', error);
            throw error;
        }
    },

    // Join meeting
    joinMeeting: async (meetingId) => {
        try {
            // Simulate API call
            return {
                success: true,
                data: {
                    id: meetingId,
                    link: "https://meet.google.com/abc-defg-hij",
                    isOnline: true
                }
            };
        } catch (error) {
            console.error('Error joining meeting:', error);
            throw error;
        }
    },

    // Upload document to group
    uploadDocument: async (groupId, fileData) => {
        try {
            // Simulate API call
            return {
                success: true,
                message: 'Document uploaded successfully'
            };
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    },

    // Get group tasks
    getGroupTasks: async (groupId) => {
        try {
            // Mock data for demonstration
            return {
                success: true,
                data: [
                    {
                        id: "task_001",
                        title: "Hoàn thiện mặt bằng tầng 1",
                        description: "Chỉnh sửa và hoàn thiện bản vẽ mặt bằng tầng 1 theo ý kiến cố vấn.",
                        assignee: "Nguyễn Văn An",
                        status: "in-progress",
                        priority: "high",
                        dueDate: "2024-05-20",
                        progress: 80
                    },
                    {
                        id: "task_002",
                        name: "Render ảnh phối cảnh",
                        description: "Xuất render 3D chất lượng cao cho phương án thiết kế.",
                        assignee: "Trần Thị Lan",
                        status: "todo",
                        priority: "medium",
                        dueDate: "2024-05-25",
                        progress: 0
                    }
                ]
            };
        } catch (error) {
            console.error('Error fetching group tasks:', error);
            throw error;
        }
    }
};

// Export individual functions for convenience
export const getGroupById = groupService.getGroupById;
export const getGroupMembers = groupService.getGroupMembers;
export const addGroupMember = groupService.addGroupMember;
export const removeGroupMember = groupService.removeGroupMember;
export const updateMemberRole = groupService.updateMemberRole;
export const getGroupDocuments = groupService.getGroupDocuments;
export const getUpcomingMeetings = groupService.getUpcomingMeetings;
export const joinMeeting = groupService.joinMeeting;
export const uploadDocument = groupService.uploadDocument;
export const getGroupTasks = groupService.getGroupTasks;