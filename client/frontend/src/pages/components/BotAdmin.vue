<template>
    <footer class="footer">
        <div class="footer-container">
            <!-- Logo / Giới thiệu -->
            <div class="footer-col">
                <h3>EasyShop</h3>
                <p class="text-white">
                    Nền tảng mua sắm trực tuyến uy tín, mang đến trải nghiệm
                    nhanh chóng – an toàn – tiện lợi cho khách hàng.
                </p>
            </div>

            <!-- Liên kết -->
            <div class="footer-col">
                <h4>Liên kết</h4>
                <ul>
                    <li><a href="#">Trang chủ</a></li>
                    <li><a href="#">Sản phẩm</a></li>
                    <li><a href="#">Giới thiệu</a></li>
                    <li><a href="#">Liên hệ</a></li>
                </ul>
            </div>

            <!-- Hỗ trợ -->
            <div class="footer-col">
                <h4>Hỗ trợ khách hàng</h4>
                <ul>
                    <li><a href="#">Hướng dẫn mua hàng</a></li>
                    <li><a href="#">Chính sách đổi trả</a></li>
                    <li><a href="#">Chính sách bảo mật</a></li>
                </ul>
            </div>

            <!-- Liên hệ -->
            <div class="footer-col">
                <h4>Liên hệ</h4>
                <p class="text-white">Email: support@easyshop.vn</p>
                <p class="text-white">Hotline: 0123 456 789</p>
                <p class="text-white">Địa chỉ: TP. Hồ Chí Minh</p>
            </div>
        </div>

        <div class="footer-bottom">
            © 2025 EasyShop. All rights reserved.
        </div>
    </footer>
</template>

<script>
export default {
    name: "Footer"
}
</script>

<style scoped>
.footer {
    background: #111827;
    color: #d1d5db;
    margin-top: 40px;
}

.footer-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 30px;
    padding: 40px 24px;
}

.footer-col h3 {
    color: #ffffff;
    font-size: 22px;
    margin-bottom: 12px;
}

.footer-col h4 {
    color: #ffffff;
    margin-bottom: 12px;
}

.footer-col p {
    font-size: 14px;
    line-height: 1.6;
}

.footer-col ul {
    list-style: none;
    padding: 0;
}

.footer-col ul li {
    margin-bottom: 8px;
}

.footer-col ul li a {
    color: #d1d5db;
    text-decoration: none;
    font-size: 14px;
}

.footer-col ul li a:hover {
    color: #3b82f6;
}

/* Footer bottom */
.footer-bottom {
    text-align: center;
    padding: 14px;
    font-size: 13px;
    background: #0f172a;
    color: #9ca3af;
}
</style>
