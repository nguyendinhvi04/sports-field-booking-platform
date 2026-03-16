import { z } from "zod";

export const manualBookingSchema = z.object({
  courtId: z.string().min(1, "Vui lòng chọn sân"),
  timeSlotIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 slot"),
  bookerName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  bookerPhone: z.string().min(1, "Số điện thoại là bắt buộc"),
  bookerEmail: z.string().email("Email không hợp lệ").optional().nullable(),
  note: z.string().optional().nullable(),
  isPaid: z.boolean().default(true), // Mặc định là đã thanh toán tại quầy
});

export type ManualBookingInput = z.infer<typeof manualBookingSchema>;
