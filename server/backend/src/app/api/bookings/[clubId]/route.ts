import { NextRequest } from "next/server";
import { manualBookingSchema } from "@/validations/manual-booking.schema";
import { createManualBooking } from "@/services/booking.service";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

// POST /api/bookings/:clubId
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clubId: string }> }
) {
    try {
        const { clubId } = await params;
        const { user, error } = await getAuthUser(req);

        if (error) {
            return error;
        }
        
        const body = await req.json();
        const parsed = manualBookingSchema.safeParse(body);
        
        if (!parsed.success) {
            return errorResponse("Dữ liệu không hợp lệ", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
        }
        
        const booking = await createManualBooking(user.userId, clubId, parsed.data);
        return successResponse("Đặt sân thành công, vui lòng thanh toán tại quầy", booking, 201);
    }
    catch (error: unknown) {
        if (error instanceof Error) {
            const errorMap: Record<string, [string, number]> = {
                SLOT_NOT_FOUND: ["Khung giờ không tồn tại", 404],
                SLOT_NOT_AVAILABLE: ["Khung giờ đã được đặt hoặc bị khoá", 409],
                SLOT_TAKEN: ["Khung giờ vừa được người khác đặt. Vui lòng chọn lại.", 409],
                COURT_NOT_FOUND: ["Sân không tồn tại", 404],
                VOUCHER_INVALID: ["Mã giảm giá không hợp lệ hoặc đã hết hạn", 422],
                VOUCHER_EXHAUSTED: ["Mã giảm giá đã hết lượt sử dụng", 422],
                VOUCHER_MIN_ORDER: ["Giá trị đơn hàng chưa đạt tối thiểu để dùng voucher", 422],
            };
            const [msg, status] = errorMap[error.message] || [];
            if (msg) return errorResponse(msg, status);
        }
        return serverErrorResponse(error);
    }
}