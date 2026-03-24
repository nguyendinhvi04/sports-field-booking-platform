import api from "@/api/axios";

export const customerService = {
    /**
    //  * Lấy thông tin chi tiết khách hàng     * @param {string} customerId - ID của khách hàng
     */
    getCustomerDetails() {
        return api.get(`/owner/customers`);
    }, 
        //Cập nhật khách hàng
    updateCustomer(){
        return api.put(`/owner/customers`);
    }, 
    //xoá khách hàng
    deleteCustomer(){
        return api.delete(`/owner/customers`);
    },
};