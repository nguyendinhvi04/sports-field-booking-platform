import api from '../api/axios';

/**
 * Service dành riêng cho thao tác của Admin
 */
export const adminService = {
    // ==========================================
    // Quản lý Câu lạc bộ (Sân)
    // ==========================================

    /**
     * Lấy toàn bộ danh sách CLB (Dành cho Admin)
     */
    getAllClubs() {
        return api.get('/admin/clubs');
    },
    /**
     * Cập nhật trạng thái phê duyệt của CLB
     * @param {string} clubId 
     * @param {'APPROVED' | 'REJECTED' | 'PENDING'} status 
     */
    updateClubApproval(clubId, status) {
        return api.patch(`/admin/clubs/${clubId}/approval`, { status });
    },

    /**
     * Khóa hoặc mở khóa CLB
     * @param {string} clubId 
     * @param {boolean} isActive 
     */
    updateClubStatus(clubId, isActive) {
        return api.patch(`/admin/clubs/${clubId}/status`, { isActive });
    },

    /**
     * Cập nhật trạng thái một sân đơn lẻ
     * @param {string} courtId 
     * @param {'ACTIVE' | 'SUSPENDED' | 'INACTIVE'} status 
     */
    updateCourtStatus(courtId, status) {
        return api.patch(`/admin/courts/${courtId}/status`, { status });
    },

    /**
     * Lấy các số liệu tổng quan (Counts) cho Sidebar/Badge
     * @param {string} [startDate] 
     * @param {string} [endDate]
     */
    getSummary(startDate, endDate) {
        return api.get('/admin/summary', {
            params: { startDate, endDate }
        });
    },

    // ==========================================
    // Quản lý KYC (Xác minh Owner)
    // ==========================================

    /**
     * Lấy danh sách hồ sơ KYC của các Owner
     */
    getAllKyc() {
        return api.get('/admin/kyc');
    },

    /**
     * Lấy toàn bộ hồ sơ các Chủ Câu lạc bộ (Owners)
     */
    getAllOwners() {
        return api.get('/admin/owners');
    },

    /**
     * Xét duyệt KYC cho Owner
     * @param {string} profileId 
     * @param {'APPROVED' | 'REJECTED'} status 
     * @param {string} [note] - Lý do nếu từ chối
     */
    updateKycStatus(profileId, status, note) {
        return api.patch(`/admin/kyc/${profileId}`, { status, note });
    },

    /**
     * Lấy danh sách toàn bộ người dùng
     */
    getUsers() {
        return api.get('/admin/users');
    },

    /**
     * Khóa/Mở khóa tài khoản người dùng
     * @param {string} userId 
     * @param {boolean} isActive 
     */
    updateUserStatus(userId, isActive) {
        return api.patch(`/admin/users/${userId}/status`, { isActive });
    }
};
