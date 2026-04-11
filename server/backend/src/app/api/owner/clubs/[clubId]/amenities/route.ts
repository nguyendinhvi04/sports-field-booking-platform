import { NextRequest } from "next/server";
import { successResponse, serverErrorResponse, errorResponse } from "@/lib/response";
import { getClubById, updateClubAmenities, getAllAmenities } from "@/modules/club/club.service";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";

/**
 * [GET] /api/owner/clubs/[clubId]/amenities
 * Lấy danh sách tiện ích hiện tại của CLB và tất cả tiện ích hệ thống
 */
export async function GET(req: NextRequest, { params }: { params: { clubId: string } }) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;
    
    const roleError = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleError) return roleError;

    const { clubId } = params;
    const club = await getClubById(clubId, user.userId);
    if (!club) return errorResponse("Không tìm thấy CLB hoặc bạn không có quyền", 404);

    const allAmenities = await getAllAmenities();
    
    // Merge: Đánh dấu cái nào CLB đang có + kèm giá
    const currentMap = new Map();
    club.amenities.forEach(ca => {
      currentMap.set(ca.amenityId, Number(ca.price));
    });

    const result = allAmenities.map(a => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
      isSelected: currentMap.has(a.id),
      price: currentMap.get(a.id) || 0
    }));

    return successResponse("Lấy danh sách tiện ích thành công", result);
  } catch (err: unknown) {
    return serverErrorResponse(err);
  }
}

/**
 * [POST] /api/owner/clubs/[clubId]/amenities
 * Cập nhật danh sách tiện ích và giá tiền
 */
export async function POST(req: NextRequest, { params }: { params: { clubId: string } }) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;
    
    const roleError = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleError) return roleError;

    const { clubId } = params;
    const body = await req.json();
    const { amenities } = body; // [{ amenityId: string, price: number }]

    if (!Array.isArray(amenities)) {
      return errorResponse("Dữ liệu không hợp lệ (Expect array 'amenities')", 400);
    }

    const updated = await updateClubAmenities(clubId, user.userId, amenities);
    return successResponse("Cập nhật tiện ích thành công", updated);
  } catch (err: unknown) {
    return serverErrorResponse(err);
  }
}
