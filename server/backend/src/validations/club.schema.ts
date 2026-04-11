import { z } from "zod";

// Trả về undefined nếu chuỗi rỗng, ngược lại validate URL
const optionalUrl = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => v === undefined || /^https?:\/\/.+/.test(v), {
    message: "URL không hợp lệ",
  });

// Trả về undefined nếu chuỗi rỗng, ngược lại validate min length
const optionalMinString = (min: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => v === undefined || v.length >= min, {
      message: `Phải có ít nhất ${min} ký tự`,
    });

export const clubSchema = z.object({
  name:          z.string().min(3, "Tên câu lạc bộ phải có ít nhất 3 ký tự").max(100),
  description:   z.string().optional().transform((v) => (v === "" ? undefined : v)),
  address:       z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  ward:          z.string().optional().transform((v) => (v === "" ? undefined : v)),
  district:      z.string().min(2, "Vui lòng chọn quận/huyện"),
  city:          z.string().min(2, "Vui lòng chọn thành phố"),
  latitude:      z.number().optional(),
  longitude:     z.number().optional(),
  phone:         optionalMinString(10),
  email:         z.string().optional().transform((v) => (v === "" ? undefined : v)).refine(
    (v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    { message: "Email không hợp lệ" }
  ),
  website:       optionalUrl,
  logoUrl:       optionalUrl,
  coverImageUrl: optionalUrl,
  slotDuration:  z.number().min(30).max(240).optional(),
});

export const updateClubSchema = clubSchema.partial();
