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
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/client/reset-password?token=${token}`;
  
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
