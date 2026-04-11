import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { toggleCourtStatus } from "@/modules/admin/admin.service";
import { CourtStatus } from "@/generated/prisma";

/**
 * Cập nhật trạng thái một sân đơn lẻ (Admin)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!id || !status) {
      return errorResponse("Thiếu thông tin ID sân hoặc trạng thái", 400);
    }

    // Validate status enumeration
    if (!Object.values(CourtStatus).includes(status)) {
      return errorResponse("Trạng thái sân không hợp lệ", 400);
    }

    const updatedCourt = await toggleCourtStatus(id, status);
    return successResponse("Cập nhật trạng thái sân thành công", updatedCourt);
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái sân:", error);
    return errorResponse("Không thể cập nhật trạng thái sân", 500);
  }
}
