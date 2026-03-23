import { NextRequest } from "next/server";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { getMyProfile } from "@/services/auth.service";
import { successResponse, serverErrorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/profile
 * Lấy thông tin cá nhân và trạng thái KYC mới nhất của user
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthUser(req);
    if (error) return error;

    // Lấy profile từ service
    const profile = await getMyProfile(user.userId);
    if (!profile) return serverErrorResponse("Không tìm thấy người dùng");
    
    // Nếu là OWNER, kèm theo kycStatus từ ownerProfile (phẳng hóa ra ngoài user)
    if (user.role === 'OWNER') {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId: user.userId },
        select: { kycStatus: true }
      });
      
      const profileWithKyc = {
        ...profile,
        ownerProfile: {
          kycStatus: ownerProfile?.kycStatus ?? null
        }
      };
      return successResponse("Lấy thông tin cá nhân thành công", profileWithKyc);
    }

    return successResponse("Lấy thông tin cá nhân thành công", profile);
  } catch (error: unknown) {
    return serverErrorResponse(error);
  }
}
