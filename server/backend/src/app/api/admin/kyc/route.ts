import { NextRequest } from "next/server";
import { getAllOwnerKYCAdmin } from "@/modules/admin/admin.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/admin/kyc
 * Lấy toàn bộ danh sách hồ sơ KYC của Owner
 */
export async function GET(req: NextRequest) {
  try {
    const kycProfiles = await getAllOwnerKYCAdmin();
    return successResponse("Lấy danh sách KYC thành công", kycProfiles);
  } catch (error: unknown) {
    console.error("GET Admin KYC Error:", error);
    return serverErrorResponse(error);
  }
}
