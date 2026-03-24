import api from '../api/axios';

export const bookingService = {
    // 1. Người dùng đặt sân (Sau đó FE nhận paymentUrl nếu có)
    createBooking: async (bookingData) => {
        const response = await api.post("/bookings", bookingData);
        return response.data;
    },

    // 2. Chủ sân đặt sân hộ khách (Offline)
    createManualBooking: async (bookingData) => {
        // Lưu ý: bookingData phải chứa clubId
        const response = await api.post(`/owner/clubs/${bookingData.clubId}/manual-bookings`, bookingData);
        return response.data;
    },

    // 3. Lấy danh sách đặt sân của chính người đang đăng nhập (Lịch sử đặt sân)
    getMyBookings: async () => {
        const response = await api.get("/bookings");
        return response.data;
    },

    // 4. Lấy danh sách đặt sân của một câu lạc bộ (Dành cho chủ sân)
    getBookingsByClub: async (clubId, date) => {
        const response = await api.get(`/owner/clubs/${clubId}/bookings`, {
            params: { date }
        });
        return response.data;
    },

    // 5. Chủ sân xác nhận thanh toán (Khi khách chuyển khoản/trả tiền mặt)
    confirmPayment: async (bookingId) => {
        const response = await api.post(`/owner/bookings/${bookingId}/confirm-payment`);
        return response.data;
    },

    // 6. Cập nhật trạng thái đơn (Ví dụ: Chủ sân hủy hoặc đánh dấu đã đá xong)
    updateStatus: async (bookingId, status) => {
        const response = await api.patch(`/owner/bookings/${bookingId}/status`, { status });
        return response.data;
    },

    // 7. Lấy chi tiết 1 đơn hàng
    getBookingById: async (bookingId) => {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
    }
}
