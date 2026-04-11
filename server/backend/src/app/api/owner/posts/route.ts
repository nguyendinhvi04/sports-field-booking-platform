import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/middlewares/auth.middleware";
import { createPost, getPosts, deletePost } from "@/modules/marketing/post.service";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";

/**
 * GET /api/owner/posts?clubId=...
 * Lấy danh sách bài đăng của CLB cho chủ sân quản lý
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleError = requireRole(user, ["OWNER"]);
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) return errorResponse("Thiếu clubId", 400);

    const posts = await getPosts({ clubId, isUser: false });
    return successResponse("Lấy danh sách bài đăng thành công", posts);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/owner/posts
 * Đăng bài tin mới
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleError = requireRole(user, ["OWNER"]);
    if (roleError) return roleError;

    const body = await req.json();
    const { clubId, type, title, content, imageUrl, linkedCourtId, linkedDate, expiresAt } = body;

    if (!clubId || !type || !title || !content) {
      return errorResponse("Thiếu thông tin bắt buộc (clubId, type, title, content)", 400);
    }

    const post = await createPost(clubId, user.userId, {
      type,
      title,
      content,
      imageUrl,
      linkedCourtId,
      linkedDate: linkedDate ? new Date(linkedDate) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    return successResponse("Đăng bài thành công", post, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * DELETE /api/owner/posts?id=...
 * Xóa bài đăng
 */
export async function DELETE(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    const roleError = requireRole(user, ["OWNER"]);
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return errorResponse("Thiếu bài đăng ID", 400);

    await deletePost(id, user.userId);
    return successResponse("Xóa bài đăng thành công", null);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
