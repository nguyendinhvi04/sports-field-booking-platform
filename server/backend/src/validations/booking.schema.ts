import { z } from "zod";

// Zod schema for booking input supporting hybrid slot mechanism
export const createBookingSchema = z.object({
  clubId: z
    .string()
    .min(1, "Vui lòng chọn câu lạc bộ")
    .cuid("clubId không hợp lệ"),

  // Mảng các slot chứa thông tin để xác định/tạo slot trong DB
  slots: z
    .array(z.object({
      courtId: z.string().cuid("ID sân không hợp lệ"),
      startTime: z.string().min(1, "Thiếu thời gian bắt đầu") // ISO string
    }))
    .min(1, "Vui lòng chọn ít nhất 1 khung giờ"),

  bookerName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự"),

  bookerPhone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),

  bookerEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),

  note: z.string().max(500, "Ghi chú không quá 500 ký tự").optional(),

  voucherCode: z.string().optional(),

  paymentMethod: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "MOMO", "VNPAY", "CASH"]).default("VNPAY"),
  
  serviceIds: z.array(z.string().cuid()).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500, "Lý do không quá 500 ký tự").optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
