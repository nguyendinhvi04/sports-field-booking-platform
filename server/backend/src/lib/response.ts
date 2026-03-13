import { NextResponse } from "next/server";

// ============================================================
// CHUẨN HOÁ RESPONSE TRẢ VỀ CHO FRONTEND
// ============================================================

type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * Trả về response thành công chuẩn hoá
 * @example ApiResponse.success(res, "Đặt sân thành công", bookingData, 201)
 */
export function successResponse<T>(
  message: string,
  data: T,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

/**
 * Trả về response lỗi chuẩn hoá
 * @example ApiResponse.error("Email đã tồn tại", 409)
 */
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>
): NextResponse<ErrorResponse> {
  return NextResponse.json({ success: false, message, errors }, { status });
}

/**
 * Xử lý lỗi không mong muốn (catch block)
 */
export function serverErrorResponse(error: unknown): NextResponse<ErrorResponse> {
  console.error("[SERVER_ERROR]", error);
  if (error instanceof Error) {
    console.error("Stack trace:", error.stack);
  }
  return NextResponse.json(
    { success: false, message: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau." },
    { status: 500 }
  );
}
