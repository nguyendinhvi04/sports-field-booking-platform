import { prisma } from "@/lib/prisma";
import { Prisma, TimeSlotStatus } from "@/generated/prisma";

/**
 * Slot Repository
 * Handles DB interactions for Time Slots.
 */
export const slotRepository = {
  /**
   * Find a time slot by court and start time
   */
  async findByCourtAndStartTime(courtId: string, startTime: Date) {
    return prisma.timeSlot.findUnique({
      where: {
        courtId_startTime: { courtId, startTime }
      },
      include: {
        court: { select: { clubId: true, name: true } }
      }
    });
  },

  /**
   * Upsert a time slot (Create if not exists, update status)
   */
  async upsertSlot(data: { courtId: string, startTime: Date, endTime: Date, status: TimeSlotStatus }, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.timeSlot.upsert({
      where: {
        courtId_startTime: { 
            courtId: data.courtId, 
            startTime: data.startTime 
        }
      },
      update: { status: data.status },
      create: {
        courtId: data.courtId,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status
      },
      include: {
        court: { select: { clubId: true } }
      }
    });
  },

  /**
   * Get busy slots (BOOKED/LOCKED) for a court on a specific date
   */
  async getBusySlots(courtId: string, startOfDay: Date, endOfDay: Date) {
    return prisma.timeSlot.findMany({
      where: {
        courtId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ["BOOKED", "LOCKED"] }
      },
      include: {
        bookingItems: {
          select: {
            booking: { select: { status: true } }
          }
        }
      }
    });
  },

  /**
   * Find court with full context (club, opening hours, pricing)
   */
  async findCourtContext(courtId: string) {
    return prisma.court.findUnique({
      where: { id: courtId },
      include: {
        club: {
          include: {
            openingHours: true,
          }
        },
        pricings: { where: { isActive: true } }
      }
    });
  }
};
