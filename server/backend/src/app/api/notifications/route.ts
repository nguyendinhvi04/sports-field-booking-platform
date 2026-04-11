import { NextRequest } from "next/server";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { getMyNotifications, markAsRead, deleteNotification } from "@/modules/user/notification.service";
import { successResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/notifications
 * Lấy danh sách thông báo của user hiện tại
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const notifications = await getMyNotifications(user.userId);
    return successResponse("Lấy thông báo thành công", notifications);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * PATCH /api/notifications
 * Đánh dấu một hoặc tất cả thông báo là đã đọc
 * body: { id?: "通知ID" } // Nếu không có id => đánh dấu tất cả
 */
export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const body = await req.json();
    const notificationId = body.id;

    await markAsRead(user.userId, notificationId);
    return successResponse("Cập nhật thông báo thành công", null);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * DELETE /api/notifications?id=...
 */
export async function DELETE(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return serverErrorResponse("Thiếu ID thông báo");

    await deleteNotification(user.userId, id);
    return successResponse("Xóa thông báo thành công", null);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
