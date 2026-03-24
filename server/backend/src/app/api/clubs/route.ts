import { NextRequest } from "next/server";
import { searchClubs } from "@/services/club.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/clubs
 * Tìm kiếm danh sách các câu lạc bộ (venue) với các bộ lọc
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      sport:    searchParams.get("sport") || undefined,
      city:     searchParams.get("city") || undefined,
      district: searchParams.get("district") || undefined,
      surface:  searchParams.get("surface") || undefined,
      format:   searchParams.get("format") || undefined,
      facility: searchParams.getAll("facility"), // Nhận mảng nếu có nhiều facility
      limit:    parseInt(searchParams.get("limit") || "50"),
    };

    const clubs = await searchClubs(filters);

    return successResponse("Tìm kiếm sân thành công", clubs);
  } catch (error: unknown) {
    console.error("GET Search Clubs Error:", error);
    return serverErrorResponse(error);
  }
}
