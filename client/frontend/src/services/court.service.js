import api from '../api/axios';

export const courtService = {
    /**
     * Lấy danh sách sân của một câu lạc bộ
     * GET /api/owner/clubs/[clubId]/courts
     */
    getCourts(clubId) {
        return api.get(`/owner/clubs/${clubId}/courts`);
    },

    /**
     * Tạo sân mới cho câu lạc bộ
     * POST /api/owner/clubs/[clubId]/courts
     * Body: { name, sportType, surface, indoorOutdoor, capacity, description }
     */
    createCourt(clubId, courtData) {
        return api.post(`/owner/clubs/${clubId}/courts`, courtData);
    },

    /**
     * Cập nhật thông tin sân
     * PUT /api/owner/courts/[id]
     * Body: { name, sportType, surface, indoorOutdoor, capacity, description }
     */
    updateCourt(courtId, courtData) {
        return api.put(`/owner/courts/${courtId}`, courtData);
    },

    /**
     * Xoá sân (soft delete → INACTIVE)
     * DELETE /api/owner/courts/[id]
     */
    deleteCourt(courtId) {
        return api.delete(`/owner/courts/${courtId}`);
    },
};
