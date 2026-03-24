import { z } from "zod";

export const clubSchema = z.object({
  name: z.string().min(3, "Tên câu lạc bộ phải có ít nhất 3 ký tự").max(100),
  description: z.string().max(2000).optional(),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  ward: z.string().optional(),
  district: z.string().min(2, "Vui lòng chọn quận/huyện"),
  city: z.string().min(2, "Vui lòng chọn thành phố"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  slotDuration: z.number().min(30).max(240).default(60), // Hỗ trợ từ 30p đến 4 tiếng
});

export const updateClubSchema = clubSchema.partial();
