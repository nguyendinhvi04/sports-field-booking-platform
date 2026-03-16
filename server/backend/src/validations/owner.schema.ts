import { z } from "zod";
import { CustomerTier } from "@/generated/prisma";

export const updateCustomerSchema = z.object({
  tier: z.nativeEnum(CustomerTier).optional(),
  notes: z.string().max(1000, "Ghi chú không được quá 1000 ký tự").optional(),
});
