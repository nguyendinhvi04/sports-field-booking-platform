import nodemailer from "nodemailer";

/**
 * Cấu hình Transporter cho Nodemailer sử dụng Gmail SMTP
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // false cho port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Gửi email đặt lại mật khẩu bằng Nodemailer
 */
export async function sendResetPasswordEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/auth/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"Playfinder Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu - Playfinder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #16a34a; text-align: center;">Đặt lại mật khẩu của bạn</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này.</p>
        <p>Vui lòng nhấn vào nút bên dưới để tiến hành thay đổi mật khẩu. Liên kết này sẽ hết hạn trong vòng <strong>1 giờ</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
        </div>
        <p>Nếu bạn không yêu cầu thay đổi này, bạn có thể bỏ qua email này một cách an toàn.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888888; text-align: center;">Đây là email tự động, vui lòng không phản hồi.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}

export interface BookingEmailData {
  bookingId: string;
  bookerName: string;
  bookerEmail: string;
  bookingCode: string;
  clubName: string;
  courtName: string;
  slots: { date: string; time: string }[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
}

/**
 * Gửi email xác nhận đặt sân thành công
 */
export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const slotRows = data.slots
    .map(
      (s) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0;">${s.date}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0;">${s.time}</td>
      </tr>`
    )
    .join('');

  const mailOptions = {
    from: `"Playfinder" <${process.env.EMAIL_USER}>`,
    to: data.bookerEmail,
    subject: `✅ Đặt sân thành công - ${data.bookingCode}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Đặt sân thành công!</h1>
          <p style="color: #bbf7d0; margin: 8px 0 0; font-size: 14px;">Mã đơn: <strong style="color: white;">${data.bookingCode}</strong></p>
        </div>

        <!-- Body -->
        <div style="padding: 24px 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Xin chào <strong>${data.bookerName}</strong>,</p>
          <p style="color: #4b5563;">Cảm ơn bạn đã đặt sân tại <strong>${data.clubName}</strong>. Dưới đây là chi tiết đơn đặt sân của bạn:</p>

          <!-- Booking Info Card -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #16a34a; font-size: 16px;">📋 Thông tin đơn đặt sân</h3>
            <table style="width: 100%; font-size: 14px; color: #374151;">
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Sân:</td>
                <td style="padding: 4px 0; font-weight: 600;">${data.courtName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Phương thức thanh toán:</td>
                <td style="padding: 4px 0; font-weight: 600;">${data.paymentMethod}</td>
              </tr>
            </table>
          </div>

          <!-- Time Slots Table -->
          <div style="margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #16a34a; font-size: 16px;">⏰ Khung giờ đã đặt</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-weight: 600;">Ngày</th>
                  <th style="padding: 10px 12px; text-align: left; color: #6b7280; font-weight: 600;">Giờ</th>
                </tr>
              </thead>
              <tbody>${slotRows}</tbody>
            </table>
          </div>

          <!-- Pricing -->
          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <h3 style="margin: 0 0 12px; color: #16a34a; font-size: 16px;">💰 Chi tiết thanh toán</h3>
            <table style="width: 100%; font-size: 14px; color: #374151;">
              <tr>
                <td style="padding: 4px 0;">Tạm tính:</td>
                <td style="padding: 4px 0; text-align: right;">${formatCurrency(data.totalAmount)}</td>
              </tr>
              ${data.discountAmount > 0 ? `
              <tr>
                <td style="padding: 4px 0; color: #16a34a;">Giảm giá:</td>
                <td style="padding: 4px 0; text-align: right; color: #16a34a;">-${formatCurrency(data.discountAmount)}</td>
              </tr>` : ''}
              <tr style="border-top: 2px solid #16a34a;">
                <td style="padding: 8px 0; font-weight: 700; font-size: 16px;">Tổng thanh toán:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 700; font-size: 16px; color: #16a34a;">${formatCurrency(data.finalAmount)}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">Bạn muốn thay đổi kế hoạch? Bạn có thể hủy đơn đặt sân trước 24h:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/account/bookings?cancel_code=${data.bookingCode}" 
               style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
               Hủy đặt sân
            </a>
          </div>

          <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 24px;">
            Nếu bạn cần hỗ trợ, vui lòng liên hệ <a href="mailto:support@sportsfield.vn" style="color: #16a34a;">support@sportsfield.vn</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 16px 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">© 2026 Playfinder. Đây là email tự động, vui lòng không phản hồi.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Booking confirmation email sent to ${data.bookerEmail}: ${info.response}`);
    return true;
  } catch (error) {
    // Không throw lỗi để không ảnh hưởng đến flow đặt sân
    console.error("⚠️ Failed to send booking confirmation email:", error);
    return false;
  }
}

/**
 * Gửi email thông báo đang chờ thanh toán (cho Chuyển khoản ngân hàng)
 */
export async function sendBookingWaitingPaymentEmail(data: BookingEmailData) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const slotRows = data.slots
    .map(
      (s) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0;">${s.date}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0;">${s.time}</td>
      </tr>`
    )
    .join('');

  const mailOptions = {
    from: `"Playfinder" <${process.env.EMAIL_USER}>`,
    to: data.bookerEmail,
    subject: `🕒 Đang chờ thanh toán - ${data.bookingCode}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📝 Đã nhận đơn đặt sân!</h1>
          <p style="color: #fef3c7; margin: 8px 0 0; font-size: 14px;">Mã đơn: <strong style="color: white;">${data.bookingCode}</strong></p>
        </div>

        <div style="padding: 24px 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px;">Xin chào <strong>${data.bookerName}</strong>,</p>
          <p style="color: #4b5563;">Chúng tôi đã nhận được yêu cầu đặt sân của bạn tại <strong>${data.clubName}</strong>. Vui lòng hoàn tất thanh toán chuyển khoản để chính thức nhận sân.</p>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #92400e; font-size: 16px;">🏦 Thông tin chuyển khoản</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Ngân hàng:</strong> VietcomBank</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Số tài khoản:</strong> 1234567890</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Chủ tài khoản:</strong> NGUYEN DINH VI</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Nội dung:</strong> <span style="color: #ef4444; font-weight: 800;">${data.bookingCode}</span></p>
            <p style="margin: 12px 0 0; font-size: 13px; color: #d97706;">* Vui lòng chuyển đúng nội dung để hệ thống tự động xác nhận nhanh nhất.</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #f59e0b; font-size: 16px;">⏰ Chi tiết khung giờ</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead style="background: #f3f4f6;">
                <tr>
                  <th style="padding: 10px 12px; text-align: left; color: #6b7280;">Ngày</th>
                  <th style="padding: 10px 12px; text-align: left; color: #6b7280;">Giờ</th>
                </tr>
              </thead>
              <tbody>${slotRows}</tbody>
            </table>
          </div>

          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
             <table style="width: 100%; font-size: 14px;">
               <tr>
                 <td>Tổng thanh toán:</td>
                 <td style="text-align: right; font-weight: 700; color: #f59e0b; font-size: 18px;">${formatCurrency(data.finalAmount)}</td>
               </tr>
             </table>
          </div>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">
            Hệ thống sẽ giữ chỗ cho bạn trong vòng 15 phút. Sau thời gian này nếy chưa nhận được thanh toán, đơn sẽ tự động bị hủy.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 16px 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">© 2026 Playfinder. Cần hỗ trợ? Phản hồi email này.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Waiting payment email sent to ${data.bookerEmail}: ${info.response}`);
    return true;
  } catch (error) {
    console.error("⚠️ Failed to send waiting payment email:", error);
    return false;
  }
}
