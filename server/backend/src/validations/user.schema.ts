import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100, "Họ tên không được quá 100 ký tự").optional(),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
  avatarUrl: z.string().url("Đường dẫn ảnh không hợp lệ").optional().or(z.literal("")),
  address: z.string().max(255).optional(),
  dateOfBirth: z.string().datetime({ message: "Định dạng ngày sinh không hợp lệ (ISO 8601)" }).optional().or(z.literal("")),
  gender: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
