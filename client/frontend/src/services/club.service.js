import api from '../api/axios';

export const clubService = {
    /**
     * Lấy danh sách các sân bóng (club) gần vị trí hiện tại của người dùng
     * @param {number} lat - Vĩ độ
     * @param {number} lng - Kinh độ
     * @param {number} [radius=20] - Bán kính (mặc định 20km)
     */
    getNearbyClubs(lat, lng, radius = 20) {
        return api.get('/clubs/nearby', {
            params: { lat, lng, radius }
        });
    },

    /**
     * Lấy thông tin chi tiết một câu lạc bộ thông qua slug
     * @param {string} slug 
     */
    getClubBySlug(slug) {
        return api.get(`/clubs/${slug}`);
    }
};
