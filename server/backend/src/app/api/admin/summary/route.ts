import { NextRequest } from "next/server";
import { getAdminSummary, getMonthlyStatsAdmin } from "@/modules/admin/admin.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/admin/summary
 * Lấy các số liệu tổng quan cho Dashboard/Sidebar + Charts
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const [summary, monthlyStats] = await Promise.all([
      getAdminSummary(startDate, endDate),
      getMonthlyStatsAdmin()
    ]);

    return successResponse("Lấy số liệu tổng quan thành công", {
      ...summary,
      monthlyStats
    });
  } catch (error: unknown) {
    console.error("GET Admin Summary Error:", error);
    return serverErrorResponse(error);
  }
}
