import { NextRequest } from "next/server";
import { getNearbyClubs } from "@/services/club.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/clubs/nearby?lat=...&lng=...&radius=...
 * Trả về danh sách các sân (club) gần tọa độ của người dùng nhất
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radius = parseFloat(searchParams.get("radius") || "20"); // Mặc định 20km

    // Kiểm tra tính hợp lệ của tọa độ
    if (isNaN(lat) || isNaN(lng)) {
      return errorResponse("Vui lòng cung cấp tọa độ (lat, lng) hợp lệ.", 400);
    }

    // Lấy dữ liệu từ service
    const results = await getNearbyClubs(lat, lng, radius);

    return successResponse("Lấy danh sách sân gần bạn thành công", results);
  } catch (error: unknown) {
    console.error("GET Nearby Clubs Error:", error);
    return serverErrorResponse(error);
  }
}
