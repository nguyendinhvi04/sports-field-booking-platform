import { NextRequest } from "next/server";
import { errorResponse } from "./response";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple In-memory Rate Limiting
 * @param req NextRequest
 * @param limit tối đa số request trong khoảng thời gian (windowMs)
 * @param windowMs khoảng thời gian (ms), mặc định 1 phút
 * @param customMessage Thông báo tùy chỉnh khi bị block
 * @returns Error Response | null
 */
export async function checkRateLimit(
  req: NextRequest,
  limit: number = 5,
  windowMs: number = 60 * 1000,
  customMessage?: string
) {
  // Lấy IP của người dùng (trong local có thể trả về null, dùng dự phòng)
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();

  if (!store[ip]) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return null;
  }

  const client = store[ip];

  // Nếu quá thời gian reset, reset bộ đếm
  if (now > client.resetTime) {
    client.count = 1;
    client.resetTime = now + windowMs;
    return null;
  }

  // Tăng bộ đếm
  client.count++;

  // Nếu vượt quá giới hạn
  if (client.count > limit) {
    const secondsLeft = Math.ceil((client.resetTime - now) / 1000);
    const message = customMessage || `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${secondsLeft} giây.`;
    return errorResponse(message, 429);
  }

  return null;
}

// Khởi tạo tác vụ dọn dẹp bộ nhớ (Tự động chạy)
let cleanupStarted = false;
export function startCleanupTask() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const ip in store) {
      if (now > store[ip].resetTime) {
        delete store[ip];
      }
    }
  }, 5 * 60 * 1000); 
}

// Chạy luôn khi module được load
startCleanupTask();
