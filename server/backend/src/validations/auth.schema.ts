import { z } from "zod";

// Zod v4: dùng .min(1, msg) thay cho required_error

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự"),

  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),

  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ")
    .optional(),

  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu không được quá 100 ký tự"),

  role: z.enum(["USER", "OWNER"])
    .optional()
    .default("USER"),

});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),

  password: z
    .string()
    .min(1, "Mật khẩu không được để trống"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token không hợp lệ"),
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
