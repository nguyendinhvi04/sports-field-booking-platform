import axios from "axios";
const api = axios.create({
    baseURL: "http://localhost:3000/api",  // be
    headers: {
        "Content-Type": "application/json",
    }
});
// tự động đính kèm token vào header 
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;

});
// xử lý lỗi 401 (token hết hạn hoặc không hợp lệ)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/client/login";
        }
        return Promise.reject(error);
    }
);
export default api;