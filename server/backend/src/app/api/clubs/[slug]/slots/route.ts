import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/response";
import { getInferredSlotsForCourt } from "@/modules/slot/slot.service";

/**
 * GET /api/clubs/[slug]/slots?date=YYYY-MM-DD
 * Lấy danh sách time slots cho tất cả các sân của một CLB theo ngày
 * Public endpoint — không cần auth (cho trang đặt sân)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!slug) {
      return errorResponse("Thiếu slug câu lạc bộ", 400);
    }
    if (!date) {
      return errorResponse("Thiếu ngày (date=YYYY-MM-DD)", 400);
    }

    // 1. Tìm Club theo slug
    const club = await prisma.club.findUnique({
      where: { slug },
      select: { id: true, slotDuration: true },
    });

    if (!club) {
      return errorResponse("Không tìm thấy câu lạc bộ", 404);
    }

    const targetDate = new Date(`${date}T12:00:00.000+07:00`);

    // 2. Lấy tất cả courts của club kèm pricing cho ngày đó
    const courts = await prisma.court.findMany({
      where: { clubId: club.id, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        sportType: true,
        surface: true,
        indoorOutdoor: true,
        sortOrder: true,
        pricings: {
          where: { isActive: true },
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            pricePerHour: true,
            label: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // 3. Map dữ liệu & Tính toán slots theo cơ chế Hybrid cho từng sân
    const result = await Promise.all(courts.map(async (court) => {
      // Gọi service tính toán slot ảo + thực tế
      const calculatedSlots = await getInferredSlotsForCourt(court.id, targetDate);

      const slots = calculatedSlots.map((slot) => {
        const slotHour = new Date(slot.startTime).getHours();
        const slotDow = new Date(slot.startTime).getDay();

        // Tìm pricing phù hợp để tính giá
        const pricing = court.pricings.find((p) => {
          const pStart = new Date(p.startTime).getHours();
          const pEnd = new Date(p.endTime).getHours();
          const pDow = p.dayOfWeek;

          let isTimeMatch = false;
          if (pStart === pEnd) {
            isTimeMatch = true; // Cả ngày (24h)
          } else if (pStart < pEnd) {
            isTimeMatch = slotHour >= pStart && slotHour < pEnd; // Giờ bình thường (e.g 06-18)
          } else {
            isTimeMatch = slotHour >= pStart || slotHour < pEnd; // Xuyên đêm (e.g 18-06)
          }

          return isTimeMatch && (pDow === null || pDow === slotDow);
        });

        const pricePerHour = pricing ? Number(pricing.pricePerHour) : 0;
        const price = (pricePerHour * club.slotDuration) / 60;

        // Format thời gian thành "HH:mm – HH:mm"
        const startH = new Date(slot.startTime).getHours().toString().padStart(2, "0");
        const startM = new Date(slot.startTime).getMinutes().toString().padStart(2, "0");
        const endH = new Date(slot.endTime).getHours().toString().padStart(2, "0");
        const endM = new Date(slot.endTime).getMinutes().toString().padStart(2, "0");
        const time = `${startH}:${startM} – ${endH}:${endM}`;

        return {
          id: slot.id,
          time,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price,
          status: slot.status,
          bookingStatus: slot.bookingStatus,
        };
      });

      return {
        id: court.id,
        name: court.name,
        sportType: court.sportType,
        surface: court.surface,
        indoorOutdoor: court.indoorOutdoor,
        slots,
      };
    }));

    return successResponse("Lấy danh sách khung giờ thành công", {
      clubId: club.id,
      slotDuration: club.slotDuration,
      courts: result,
    });
  } catch (error) {
    console.error("GET Slots Error:", error);
    return serverErrorResponse(error);
  }
}

