import { NextRequest } from "next/server";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { createReview, getReviewsByClubId } from "@/modules/review/review.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/reviews?clubId=... & [courtId=...]
 * Lấy danh sách đánh giá của một sân/CLB
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) {
      return errorResponse("Thiếu clubId", 400);
    }

    const reviews = await getReviewsByClubId(clubId);
    return successResponse("Lấy danh sách đánh giá thành công", reviews);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/reviews
 * Người dùng gửi đánh giá đơn đã hoàn thành
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const body = await req.json();
    const { bookingId, rating, comment, imageUrls } = body;

    if (!bookingId || !rating) {
      return errorResponse("Thiếu thông tin đánh giá (bookingId, rating)", 400);
    }

    const review = await createReview(user.userId, {
      bookingId,
      rating: Number(rating),
      comment,
      imageUrls
    });

    return successResponse("Gửi đánh giá thành công", review, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "BOOKING_NOT_FOUND_OR_NOT_COMPLETED") {
        return errorResponse("Đơn hàng chưa hoàn thành hoặc không tồn tại", 400);
      }
      if (error.message === "ALREADY_REVIEWED") {
        return errorResponse("Bạn đã đánh giá đơn hàng này rồi", 409);
      }
    }
    return serverErrorResponse(error);
  }
}
