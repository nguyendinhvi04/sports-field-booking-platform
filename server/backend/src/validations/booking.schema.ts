import { z } from "zod";

// Zod v4: dùng .min(1, msg) thay cho required_error

export const createBookingSchema = z.object({
  clubId: z
    .string()
    .min(1, "Vui lòng chọn câu lạc bộ")
    .cuid("clubId không hợp lệ"),

  timeSlotIds: z
    .array(z.string().cuid("Slot ID không hợp lệ"))
    .min(1, "Vui lòng chọn ít nhất 1 khung giờ"),

  bookerName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự"),

  bookerPhone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),

  bookerEmail: z.string().email("Email không hợp lệ").optional(),

  note: z.string().max(500, "Ghi chú không quá 500 ký tự").optional(),

  voucherCode: z.string().optional(),

  paymentMethod: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "MOMO", "VNPAY", "CASH"]).default("VNPAY"),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500, "Lý do không quá 500 ký tự").optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
