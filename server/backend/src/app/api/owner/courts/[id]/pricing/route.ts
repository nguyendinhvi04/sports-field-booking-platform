import { NextRequest } from "next/server";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";
import { 
  getCourtFullPricing, 
  upsertRegularPricing, 
  addSpecialPricing, 
  deletePricing 
} from "@/services/pricing.service";

/**
 * UTILITY: Kiểm tra Owner có quyền sở hữu sân hay không
 */
async function checkCourtOwnership(userId: string, courtId: string) {
  const court = await prisma.court.findFirst({
    where: { 
      id: courtId,
      club: { ownerId: userId }
    }
  });
  return !!court;
}

// GET /api/owner/courts/[id]/pricing  → Lấy bảng giá sân
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const { id: courtId } = await params;
    const isOwner = await checkCourtOwnership(user.userId, courtId);
    if (!isOwner) return errorResponse("Bạn không có quyền quản lý sân này.", 403);

    const data = await getCourtFullPricing(courtId);
    return successResponse("Lấy bảng giá thành công", data);
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// POST /api/owner/courts/[id]/pricing  → Thêm/Cập nhật giá định kỳ (Regular)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const { id: courtId } = await params;
    const isOwner = await checkCourtOwnership(user.userId, courtId);
    if (!isOwner) return errorResponse("Không có quyền", 403);

    const body = await req.json();
    const result = await upsertRegularPricing(courtId, body);

    return successResponse("Cập nhật giá thành công", result);
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// PUT /api/owner/courts/[id]/pricing  → Thêm giá ngày lễ (Special)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const { id: courtId } = await params;
    if (!await checkCourtOwnership(user.userId, courtId)) return errorResponse("Không có quyền", 403);

    const body = await req.json();
    // Parse date từ string
    if (typeof body.specificDate === 'string') body.specificDate = new Date(body.specificDate);

    const result = await addSpecialPricing(courtId, body);
    return successResponse("Thêm giá ngày lễ thành công", result);
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// DELETE /api/owner/courts/[id]/pricing  → Xóa cấu hình giá cụ thể
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const { id: courtId } = await params;
    if (!await checkCourtOwnership(user.userId, courtId)) return errorResponse("Không có quyền", 403);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as "regular" | "special";
    const pricingId = searchParams.get("id");

    if (!type || !pricingId) return errorResponse("Thiếu thông tin xóa", 400);

    await deletePricing(type, pricingId);
    return successResponse("Đã xóa cấu hình giá", null);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
