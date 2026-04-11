import { NextRequest } from "next/server";
import { updateOwnerKYCStatus } from "@/modules/admin/admin.service";
import { successResponse, serverErrorResponse, badRequestResponse } from "@/lib/response";
import { ApprovalStatus } from "@/generated/prisma";

/**
 * PATCH /api/admin/kyc/:id
 * Duyệt hoặc từ chối hồ sơ KYC
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, note } = body;

    if (!Object.values(ApprovalStatus).includes(status)) {
      return badRequestResponse("Trạng thái phê duyệt không hợp lệ");
    }

    const updatedProfile = await updateOwnerKYCStatus(id, status, note);
    return successResponse("Cập nhật trạng thái KYC thành công", updatedProfile);
  } catch (error: unknown) {
    console.error("PATCH Admin KYC Error:", error);
    return serverErrorResponse(error);
  }
}
