import api from '../api/axios';

export const clubService = {
    /**
     * Lấy danh sách các sân bóng gần vị trí hiện tại
     */
    getNearbyClubs(lat, lng, radius = 20) {
        return api.get('/clubs/nearby', { params: { lat, lng, radius } });
    },

    /** Lấy thông tin chi tiết một câu lạc bộ theo slug */
    getClubBySlug(slug) {
        return api.get(`/clubs/${slug}`);
    },

    /** Tìm kiếm venues */
    searchVenues(filters) {
        return api.get('/clubs', { params: filters });
    },

    /** Lấy toàn bộ CLB của owner hiện tại */
    Getallthedetails() {
        return api.get('/owner/clubs');
    },

    /** Thêm mới câu lạc bộ */
    addClub(clubData) {
        return api.post('/owner/clubs', clubData);
    },

    /** Chỉnh sửa câu lạc bộ */
    editClub(clubId, clubData) {
        return api.patch(`/owner/clubs/${clubId}`, clubData);
    },

    /** Xóa mềm câu lạc bộ */
    deleteClub(clubId) {
        return api.delete(`/owner/clubs/${clubId}`);
    },

    /**
     * Upload ảnh lên Cloudinary qua backend
     * @param {FormData} formData - Cần có: file, type; Tùy chọn: entityId
     * @param {function} onProgress  - Callback(percent: number)
     */
    uploadImage(formData, onProgress = null) {
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onProgress
                ? (e) => {
                      const pct = Math.round((e.loaded * 100) / (e.total || 1));
                      onProgress(pct);
                  }
                : undefined,
        });
    },

    // ── Amenities ──────────────────────────────────────────────
    getClubAmenities(clubId) {
        return api.get(`/owner/clubs/${clubId}/amenities`);
    },
    updateClubAmenities(clubId, amenities) {
        return api.post(`/owner/clubs/${clubId}/amenities`, { amenities });
    },

    // ── Slots ──────────────────────────────────────────────────
    getSlotsByClub(slug, date) {
        return api.get(`/clubs/${slug}/slots`, { params: { date } });
    },
};
