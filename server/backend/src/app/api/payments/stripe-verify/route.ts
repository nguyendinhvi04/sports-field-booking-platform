import { NextRequest } from "next/server";
import { verifyStripeSession } from "@/modules/payment/payment.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/payments/stripe-verify?session_id=xxx
 * Called by frontend after Stripe redirects back to verify payment status
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return errorResponse("Thiếu session_id", 400);
    }

    const result = await verifyStripeSession(sessionId);

    if (result.success) {
      return successResponse("Thanh toán thẻ quốc tế thành công!", { bookingId: result.bookingId });
    }

    return errorResponse("Thanh toán chưa hoàn tất hoặc đã bị hủy.", 400);
  } catch (error) {
    console.error("[Stripe Verify Error]:", error);
    return serverErrorResponse(error);
  }
}
