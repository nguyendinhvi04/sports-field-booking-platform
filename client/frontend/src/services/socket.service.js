import { io } from "socket.io-client";

// Get base API URL from environment variable or default
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

class SocketService {
  constructor() {
    this.socket = null;
    this.currentVenueId = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(API_URL, {
        transports: ["websocket"],
        upgrade: false,
      });
      console.log("Connecting to socket server via WebSocket...");
    }
  }

  joinVenue(venueId) {
    if (this.socket) {
      this.currentVenueId = venueId;
      this.socket.emit("join-venue", venueId);
      console.log(`Joined venue: ${venueId}`);
    }
  }

  leaveVenue(venueId) {
    if (this.socket) {
      this.socket.emit("leave-venue", venueId);
      this.currentVenueId = null;
      console.log(`Left venue: ${venueId}`);
    }
  }

  onBookingUpdate(callback) {
    if (this.socket) {
      this.socket.on("booking-updated", (data) => {
        console.log("Socket received booking-updated:", data);
        callback(data);
      });
    }
  }

  /**
   * Lắng nghe cập nhật trạng thái đơn đặt sân theo bookingId
   * Dùng cho trang checkout để nhận thông báo real-time khi owner xác nhận thanh toán
   */
  joinBooking(bookingId) {
    if (this.socket) {
      this.socket.emit("join-booking", bookingId);
      console.log(`Joined booking room: ${bookingId}`);
    }
  }

  leaveBooking(bookingId) {
    if (this.socket) {
      this.socket.emit("leave-booking", bookingId);
      console.log(`Left booking room: ${bookingId}`);
    }
  }

  onBookingStatusChanged(callback) {
    if (this.socket) {
      this.socket.on("booking-status-changed", (data) => {
        console.log("Socket received booking-status-changed:", data);
        callback(data);
      });
    }
  }

  offBookingStatusChanged() {
    if (this.socket) {
      this.socket.off("booking-status-changed");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket disconnected");
    }
  }
}

export const socketService = new SocketService();
