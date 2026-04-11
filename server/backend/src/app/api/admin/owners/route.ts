import { NextResponse } from "next/server";
import { getAllOwnersAdmin } from "@/modules/admin/admin.service";

export async function GET() {
  try {
    const owners = await getAllOwnersAdmin();
    return NextResponse.json({
      success: true,
      data: owners,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Owners:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi lấy danh sách chủ câu lạc bộ" },
      { status: 500 }
    );
  }
}
