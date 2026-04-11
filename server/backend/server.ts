import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocket } from "./src/lib/socket";
import { initBookingJobs } from "./src/jobs/expire-bookings.job";
import { initBookingListeners } from "./src/modules/booking/booking.listener";
import { initSlotListeners } from "./src/modules/slot/slot.listener";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const url = req.url || "";
      if (url.startsWith("/socket.io")) {
        return;
      }

      const parsedUrl = parse(url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling request:", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // 1. Initialize Socket.io (using the established lib)
  initSocket(httpServer);
  console.log("✓ Socket.io server ready");

  // 2. Initialize Background Cron Jobs
  initBookingJobs();
  console.log("✓ Booking expiration jobs scheduled");

  // 3. Initialize Domain Event Listeners (Modular Architecture)
  initBookingListeners();
  initSlotListeners();
  console.log("✓ All module listeners initialized");

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port} as ${dev ? 'development' : 'production'}`);
    });
});
