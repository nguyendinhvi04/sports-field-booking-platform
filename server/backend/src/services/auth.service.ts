import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { sendResetPasswordEmail } from "@/lib/mail";
import axios from "axios";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import type { RegisterInput, LoginInput, ResetPasswordInput } from "@/validations/auth.schema";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SALT_ROUNDS = 12;

// ============================================================
// AUTH SERVICE
// ============================================================

/**
 * Đăng ký tài khoản mới
 */
export async function registerUser(input: RegisterInput) {
  // Kiểm tra email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  // Kiểm tra SĐT đã tồn tại chưa
  if (input.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: input.phone },
    });
    if (existingPhone) throw new Error("PHONE_EXISTS");
  }

  // Hash mật khẩu
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Tạo user và profile trong 1 transaction
  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      fullName: input.fullName,
      passwordHash,
      role: input.role,
      profile: { create: {} }, // Tạo profile rỗng đi kèm
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Đăng nhập và trả về token
 */
export async function loginUser(input: LoginInput) {
  // Tìm user theo email, kèm ownerProfile.kycStatus nếu là OWNER
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      fullName: true,
      passwordHash: true,
      role: true,
      isActive: true,
      isVerified: true,
      avatarUrl: true,
      ownerProfile: {
        select: { kycStatus: true }, // Lấy trạng thái KYC để mở/khóa dashboard
      },
    },
  });

  if (!user || !user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_DISABLED");
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Cập nhật lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Tạo JWT token
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      // kycStatus: PENDING = đã nộp chờ duyệt, APPROVED = đã duyệt mở khóa, REJECTED = bị từ chối
      kycStatus: user.ownerProfile?.kycStatus ?? null,
    },
  };
}

/**
 * Lấy thông tin user hiện tại (profile)
 */
export async function getMyProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      profile: {
        select: {
          address: true,
          dateOfBirth: true,
          gender: true,
          bio: true,
        },
      },
    },
  });
}

/**
 * Đăng nhập bằng Facebook
 */
export async function loginWithFacebook(accessToken: string, role: "USER" | "OWNER" = "USER") {
  try {
    // 1. Lấy thông tin từ Facebook API
    const fbRes = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        fields: "id,name,email,picture",
        access_token: accessToken,
      },
    });

    const { id, name, email } = fbRes.data;

    if (!id) throw new Error("FACEBOOK_AUTH_FAILED");

    // 2. Kiểm tra xem user đã tồn tại chưa (qua facebookId hoặc email)
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ facebookId: id }, { email: email }],
      },
    });

    if (user) {
      // Cập nhật facebookId nếu user đã tồn tại qua email nhưng chưa có facebookId
      if (!user.facebookId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { facebookId: id },
        });
      }
    } else {
      // 3. Tạo user mới nếu chưa tồn tại
      user = await prisma.user.create({
        data: {
          email: email || `${id}@facebook.com`, // Một số user FB không có email công khai
          fullName: name,
          facebookId: id,
          role: role,
          isEmailVerified: !!email,
          profile: { create: {} },
        },
      });
    }

    // 4. Tạo token JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (error) {
    console.error("Facebook Login Error:", error);
    throw new Error("FACEBOOK_AUTH_FAILED");
  }
}

/**
 * Đăng nhập bằng Google
 */
export async function loginWithGoogle(idToken: string, role: "USER" | "OWNER" = "USER") {
  try {
    // 1. Xác thực ID Token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      throw new Error("GOOGLE_AUTH_FAILED");
    }

    const { sub: googleId, email, name, picture } = payload;

    // 2. Kiểm tra xem user đã tồn tại chưa
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleId }, { email: email }],
      },
    });

    if (user) {
      // Cập nhật googleId nếu đã có user qua email
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleId },
        });
      }
    } else {
      // 3. Tạo user mới
      user = await prisma.user.create({
        data: {
          email: email!,
          fullName: name || "Google User",
          googleId: googleId,
          avatarUrl: picture,
          role: role,
          isEmailVerified: true,
          profile: { create: {} },
        },
      });
    }

    // 4. Tạo JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw new Error("GOOGLE_AUTH_FAILED");
  }
}

/**
 * Xử lý quên mật khẩu
 */
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  
  // Để bảo mật, không báo lỗi nếu email không tồn tại
  if (!user) return true;

  // Tạo token ngẫu nhiên
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000); // 1 giờ sau

  // Lưu vào database
  await prisma.passwordReset.upsert({
    where: { token }, // Thực tế token là unique nên dùng create hoặc update theo userId nếu muốn limit
    update: { token, expiresAt, used: false },
    create: { userId: user.id, token, expiresAt },
  });

  // Gửi email
  await sendResetPasswordEmail(user.email, token);

  return true;
}

/**
 * Reset mật khẩu bằng token
 */
export async function resetPassword(input: ResetPasswordInput) {
  // Tìm token trong DB
  const resetRequest = await prisma.passwordReset.findUnique({
    where: { token: input.token },
    include: { user: true },
  });

  if (!resetRequest || resetRequest.used || resetRequest.expiresAt < new Date()) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  // Hash mật khẩu mới
  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  // Cập nhật mật khẩu và đánh dấu token đã dùng
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRequest.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: { used: true },
    }),
  ]);

  return true;
}
