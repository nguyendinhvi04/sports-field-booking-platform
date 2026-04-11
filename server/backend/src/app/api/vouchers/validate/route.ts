import { getAuthUser } from "@/middlewares/auth.middleware";
import { validateVoucher } from "@/modules/marketing/voucher.service";
import { errorResponse, successResponse, serverErrorResponse } from "@/lib/response";
import { NextRequest } from "next/server";

/**
 * POST /api/vouchers/validate
 * Body: { code, clubId, orderAmount }
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const body = await req.json();
    const { code, clubId, orderAmount } = body;

    if (!code || !clubId || orderAmount === undefined) {
      return errorResponse("Thiếu thông tin (code, clubId, orderAmount)", 400);
    }

    const voucher = await validateVoucher(code, user.userId, clubId, orderAmount);

    return successResponse("Mã giảm giá hợp lệ", {
      code: voucher.code,
      type: voucher.type,
      value: Number(voucher.value),
      minOrderAmount: Number(voucher.minOrderAmount),
      maxDiscountAmount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errorMap: Record<string, string> = {
        VOUCHER_NOT_FOUND: "Mã giảm giá không tồn tại",
        VOUCHER_EXPIRED: "Mã giảm giá đã hết hạn sử dụng",
        VOUCHER_INVALID_FOR_THIS_CLUB: "Mã giảm giá không áp dụng cho sân này",
        VOUCHER_OUT_OF_STOCK: "Mã giảm giá đã hết lượt sử dụng",
        VOUCHER_LIMIT_EXCEEDED: "Bạn đã hết lượt sử dụng mã này",
      };

      const msg = errorMap[err.message];
      if (msg) return errorResponse(msg, 422);

      if (err.message.startsWith("ORDER_AMOUNT_TOO_LOW_MIN_")) {
        const min = err.message.replace("ORDER_AMOUNT_TOO_LOW_MIN_", "");
        return errorResponse(
          `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(Number(min))} đ để dùng mã này`,
          422
        );
      }
    }

    return serverErrorResponse(err);
  }
}
