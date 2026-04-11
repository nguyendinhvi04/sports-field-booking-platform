import { z } from "zod";

export const manualBookingSchema = z.object({
  clubId: z.string().min(1, "Vui lòng chọn câu lạc bộ"),
  
  // Chấp nhận danh sách slot ảo cho đặt sân thủ công
  slots: z.array(z.object({
    courtId: z.string().cuid("ID sân không hợp lệ"),
    startTime: z.string().min(1, "Thiếu thời gian bắt đầu")
  })).min(1, "Vui lòng chọn ít nhất 1 slot"),

  bookerName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  bookerPhone: z.string().min(1, "Số điện thoại là bắt buộc"),
  bookerEmail: z.string().email("Email không hợp lệ").optional().nullable(),
  note: z.string().optional().nullable(),
  isPaid: z.boolean().default(true),
});

export type ManualBookingInput = z.infer<typeof manualBookingSchema>;
