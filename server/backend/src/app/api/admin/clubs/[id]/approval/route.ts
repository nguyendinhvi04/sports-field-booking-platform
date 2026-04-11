import { NextRequest } from "next/server";
import { updateClubApprovalStatus } from "@/modules/admin/admin.service";
import { successResponse, serverErrorResponse, badRequestResponse } from "@/lib/response";
import { ApprovalStatus } from "@/generated/prisma";

/**
 * PATCH /api/admin/clubs/:id/approval
 * Duyệt hoặc từ chối câu lạc bộ
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!Object.values(ApprovalStatus).includes(status)) {
      return badRequestResponse("Trạng thái phê duyệt không hợp lệ");
    }

    const updatedClub = await updateClubApprovalStatus(id, status);
    return successResponse("Cập nhật trạng thái phê duyệt thành công", updatedClub);
  } catch (error: unknown) {
    console.error("PATCH Admin Club Approval Error:", error);
    return serverErrorResponse(error);
  }
}
