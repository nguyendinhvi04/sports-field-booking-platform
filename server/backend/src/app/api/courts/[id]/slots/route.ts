import { NextRequest } from "next/server";
import { getSlotsByCourtId } from "@/modules/slot/slot.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/courts/[id]/slots?start=2026-03-30&end=2026-03-31
 * Lấy lịch trống của một sân trong khoảng thời gian nhất định (Public API)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    if (!startStr || !endStr) {
      return errorResponse("Thiếu khoảng thời gian (start, end)", 400);
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    // Mặc định kết thúc là cuối ngày của end date
    endDate.setHours(23, 59, 59, 999);

    const slots = await getSlotsByCourtId(id, startDate, endDate);
    return successResponse("Lấy lịch sân thành công", slots);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
