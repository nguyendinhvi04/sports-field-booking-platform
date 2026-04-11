import api from '../api/axios';

export const voucherService = {
  /**
   * Kiểm tra tính hợp lệ của mã giảm giá
   * @param {string} code 
   * @param {string} clubId 
   * @param {number} orderAmount 
   */
  validateVoucher: async (code, clubId, orderAmount) => {
    const response = await api.post("/vouchers/validate", { code, clubId, orderAmount });
    return response.data;
  },

  /**
   * Lấy danh sách voucher khả dụng của CLB
   * @param {string} clubId 
   */
  getAvailableVouchers: async (clubId) => {
    const response = await api.get("/vouchers/available", { params: { clubId } });
    return response.data;
  }
};
