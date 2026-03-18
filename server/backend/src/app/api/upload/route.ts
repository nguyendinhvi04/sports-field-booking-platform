import { NextRequest } from "next/server";
import { uploadImage, UploadFolder } from "@/lib/cloudinary";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";

// Giới hạn kích thước file (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Danh sách folder hợp lệ và quyền truy cập tương ứng
const FOLDER_CONFIG: Record<string, {
  folder: UploadFolder;
  roles: string[];         // roles được phép upload vào folder này
  description: string;
}> = {
  "user-avatar":      { folder: "users/avatars",       roles: ["USER", "OWNER", "ADMIN"], description: "Ảnh đại diện người dùng" },
  "user-kyc":         { folder: "users/kyc",           roles: ["OWNER", "ADMIN"],         description: "Ảnh giấy tờ KYC" },
  "club-logo":        { folder: "clubs/logos",         roles: ["OWNER", "ADMIN"],         description: "Logo câu lạc bộ" },
  "club-cover":       { folder: "clubs/covers",        roles: ["OWNER", "ADMIN"],         description: "Ảnh bìa câu lạc bộ" },
  "club-gallery":     { folder: "clubs/gallery",       roles: ["OWNER", "ADMIN"],         description: "Bộ sưu tập ảnh CLB" },
  "court-image":      { folder: "courts/images",       roles: ["OWNER", "ADMIN"],         description: "Ảnh sân bóng" },
  "business-license": { folder: "documents/licenses",  roles: ["OWNER", "ADMIN"],         description: "Giấy phép kinh doanh" },
  "payment-proof":    { folder: "payments/proofs",     roles: ["USER", "OWNER", "ADMIN"], description: "Bằng chứng thanh toán" },
};

/**
 * POST /api/upload
 * Body: multipart/form-data
 *   - file: File ảnh
 *   - type: Loại upload (vd: "user-avatar", "club-logo", "court-image", ...)
 *   - entityId: (tùy chọn) ID đối tượng để tự động cập nhật DB sau upload
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Xác thực token
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    // 2. Lấy formData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const entityId = formData.get("entityId") as string | null;

    // 3. Validate input
    if (!file) return errorResponse("Vui lòng cung cấp file ảnh.", 422);
    if (!type) return errorResponse("Vui lòng cung cấp loại upload (type).", 422);

    const config = FOLDER_CONFIG[type];
    if (!config) {
      return errorResponse(
        `Loại upload không hợp lệ. Các loại hợp lệ: ${Object.keys(FOLDER_CONFIG).join(", ")}`,
        422
      );
    }

    // 4. Kiểm tra quyền
    if (!config.roles.includes(user.role)) {
      return errorResponse(`Bạn không có quyền upload ${config.description}.`, 403);
    }

    // 5. Validate file
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("Kích thước file không được vượt quá 5MB.", 422);
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse("Chỉ chấp nhận ảnh định dạng JPG, PNG, GIF, WebP.", 422);
    }

    // 6. Chuyển File sang Buffer và upload lên Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImage(buffer, config.folder);

    // 7. Tự động cập nhật DB sau upload
    // - Các type dùng userId (avatar, kyc, license): luôn update vì userId lấy từ token
    // - Các type dùng entityId (club, court): chỉ update khi có entityId
    const userScopedTypes = ["user-avatar", "user-kyc", "business-license"];
    if (userScopedTypes.includes(type)) {
      await updateEntityInDB(type, entityId || "", user.userId, result.secureUrl);
    } else if (entityId) {
      await updateEntityInDB(type, entityId, user.userId, result.secureUrl);
    }

    return successResponse(`Upload ${config.description} thành công`, {
      url: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    }, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * Tự động cập nhật URL ảnh vào Database sau khi upload xong
 */
async function updateEntityInDB(type: string, entityId: string, userId: string, url: string) {
  try {
    switch (type) {
      // Cập nhật avatar người dùng
      case "user-avatar":
        await prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: url },
        });
        break;

      // Cập nhật ảnh CCCD mặt trước trong OwnerProfile
      case "user-kyc":
        // entityId ở đây là "front" hoặc "back"
        if (entityId === "front") {
          await prisma.ownerProfile.upsert({
            where: { userId },
            create: { userId, idCardFrontUrl: url },
            update: { idCardFrontUrl: url },
          });
        } else if (entityId === "back") {
          await prisma.ownerProfile.upsert({
            where: { userId },
            create: { userId, idCardBackUrl: url },
            update: { idCardBackUrl: url },
          });
        }
        break;

      // Cập nhật logo câu lạc bộ
      case "club-logo":
        await prisma.club.update({
          where: { id: entityId },
          data: { logoUrl: url },
        });
        break;

      // Cập nhật ảnh bìa câu lạc bộ
      case "club-cover":
        await prisma.club.update({
          where: { id: entityId },
          data: { coverImageUrl: url },
        });
        break;

      // Thêm ảnh vào gallery câu lạc bộ
      case "club-gallery":
        await prisma.clubImage.create({
          data: { clubId: entityId, url },
        });
        break;

      // Thêm ảnh vào danh sách ảnh của sân
      case "court-image":
        await prisma.courtImage.create({
          data: { courtId: entityId, url },
        });
        break;

      // Cập nhật ảnh giấy phép kinh doanh trong OwnerProfile
      case "business-license":
        await prisma.ownerProfile.upsert({
          where: { userId },
          create: { userId, businessLicenseUrl: url },
          update: { businessLicenseUrl: url },
        });
        break;

      // Cập nhật ảnh bằng chứng thanh toán trong Payment
      case "payment-proof":
        await prisma.payment.update({
          where: { bookingId: entityId },
          data: { proofImageUrl: url },
        });
        break;
    }
  } catch (dbError) {
    // Không throw lỗi DB - ảnh vẫn đã upload lên Cloudinary thành công
    // Frontend có thể tự xử lý cập nhật DB sau nếu cần
    console.error("Auto-update DB failed after upload:", dbError);
  }
}
