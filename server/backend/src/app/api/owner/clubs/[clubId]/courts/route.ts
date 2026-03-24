import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { createCourt } from "@/services/court.service";
import { createCourtSchema } from "@/validations/court.schema";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * POST /api/owner/clubs/[clubId]/courts
 * Thêm một sân mới vào câu lạc bộ (Dành cho chủ sân hoặc Admin)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleCheck = requireRole(user, ["OWNER", "ADMIN"]);
    if (roleCheck) return roleCheck;

    const { clubId } = await params;
    const body = await req.json();

    // Validate input
    const parsed = createCourtSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "Dữ liệu sân không hợp lệ",
        422,
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // TODO: Kiểm tra xem user có phải chủ của club này không?
    // Giả sử service sẽ ném lỗi nếu không tìm thấy clubId hoặc không có quyền truy cập sâu hơn nếu cần
    
    const court = await createCourt(clubId, parsed.data);

    return successResponse("Thêm sân mới thành công", court, 201);
  } catch (error: unknown) {
    console.error("POST Create Court Error:", error);
    return serverErrorResponse(error);
  }
}
