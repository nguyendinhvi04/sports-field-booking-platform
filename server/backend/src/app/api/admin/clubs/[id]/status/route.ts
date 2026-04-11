import { NextRequest } from "next/server";
import { toggleClubActiveStatus } from "@/modules/admin/admin.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * PATCH /api/admin/clubs/:id/status
 * Khóa hoặc mở khóa câu lạc bộ
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    const updatedClub = await toggleClubActiveStatus(id, isActive);
    return successResponse("Cập nhật trạng thái hoạt động thành công", updatedClub);
  } catch (error: unknown) {
    console.error("PATCH Admin Club Status Error:", error);
    return serverErrorResponse(error);
  }
}
