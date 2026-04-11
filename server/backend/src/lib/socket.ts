import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient, redis } from "./redis";

let io: SocketIOServer | null = null;

const NOTIFICATION_LIMIT = 50;
const NOTIFICATION_EXPIRE = 24 * 60 * 60; // 1 day

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    adapter: createAdapter(pubClient, subClient),
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-venue", async (venueId: string) => {
      socket.join(`venue-${venueId}`);
      console.log(`Socket ${socket.id} joined venue-${venueId}`);

      // Push historical notifications from Redis to client
      try {
        const notifications = await redis.lrange(`notifications:venue:${venueId}`, 0, -1);
        if (notifications.length > 0) {
          const parsed = notifications.map(n => JSON.parse(n));
          socket.emit("recent-notifications", parsed);
        }
      } catch (err) {
        console.error("Redis fetch notifications error:", err);
      }
    });

    socket.on("leave-venue", (venueId: string) => {
      socket.leave(`venue-${venueId}`);
      console.log(`Socket ${socket.id} left venue-${venueId}`);
    });

    socket.on("join-booking", (bookingId: string) => {
      socket.join(`booking-${bookingId}`);
      console.log(`Socket ${socket.id} joined booking-${bookingId}`);
    });

    socket.on("leave-booking", (bookingId: string) => {
      socket.leave(`booking-${bookingId}`);
      console.log(`Socket ${socket.id} left booking-${bookingId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

/**
 * Gửi thông báo booking mới cho chủ sân và lưu vào Redis.
 */
export const notifyNewBooking = async (venueId: string, bookingData: unknown) => {
  if (io) {
    // 1. Emit live
    io.to(`venue-${venueId}`).emit("booking-updated", bookingData);

    // 2. Save historical notification to Redis
    try {
      const key = `notifications:venue:${venueId}`;
      const notification = JSON.stringify({
        ...(bookingData as object),
        timestamp: new Date().toISOString(),
      });

      await redis.lpush(key, notification);
      await redis.ltrim(key, 0, NOTIFICATION_LIMIT - 1);
      await redis.expire(key, NOTIFICATION_EXPIRE);
    } catch (err) {
      console.error("Failed to cache notification in Redis:", err);
    }
  }
};

/**
 * Gửi thông báo cập nhật trạng thái đơn đặt sân đến client đang theo dõi booking đó
 * Lưu ý: Có thể lưu vào Redis của User/Booking nếu cần, nhưng booking room
 * thường chỉ là live session. Ở đây ta giữ nguyên live.
 */
export const notifyBookingStatusChanged = (bookingId: string, data: unknown) => {
  if (io) {
    io.to(`booking-${bookingId}`).emit("booking-status-changed", data);
    console.log(`📡 Emitted booking-status-changed to booking-${bookingId}`);
  }
};
