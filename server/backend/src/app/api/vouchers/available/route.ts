import { NextRequest } from "next/server";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { getAvailableVouchers } from "@/modules/marketing/voucher.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/vouchers/available?clubId=...
 * Lấy danh sách mã giảm giá mà người dùng có thể áp dụng
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get("clubId") || undefined;

    const vouchers = await getAvailableVouchers(user.userId, clubId);
    return successResponse("Lấy danh sách mã giảm giá thành công", vouchers);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
