import { prisma } from "@/lib/prisma";
import { BookingStatus, Prisma } from "@/generated/prisma";

/**
 * Booking Repository
 * Handles all database interactions for the Booking module.
 * Separating this allows for better unit testing and potential caching implementation.
 */
export const bookingRepository = {
  /**
   * Find booking by ID with optional filters (e.g., owned by a specific user/club)
   */
  async findById(id: string, include?: Prisma.BookingInclude) {
    return prisma.booking.findUnique({
      where: { id },
      include,
    });
  },

  /**
   * Find first booking matching the condition
   */
  async findFirst(where: Prisma.BookingWhereInput, include?: Prisma.BookingInclude) {
    return prisma.booking.findFirst({
      where,
      include,
    });
  },

  /**
   * Get bookings for a specific user
   */
  async findByUserId(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        club: { select: { name: true, slug: true, address: true, logoUrl: true } },
        items: { include: { timeSlot: { include: { court: true } } } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Create a booking (usually called within a transaction)
   */
  async create(data: Prisma.BookingCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.booking.create({
      data,
      include: {
        items: { include: { timeSlot: { include: { court: true } } } },
        payment: true,
      },
    });
  },

  /**
   * Update booking status
   */
  async updateStatus(id: string, status: BookingStatus, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.booking.update({
      where: { id },
      data: { status },
    });
  },

  /**
   * Release slots tied to a booking
   */
  async releaseSlots(bookingId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const booking = await client.booking.findUnique({
      where: { id: bookingId },
      select: { items: { select: { timeSlotId: true } } },
    });

    if (booking && booking.items.length > 0) {
      const timeSlotIds = booking.items.map((item) => item.timeSlotId);
      await client.timeSlot.updateMany({
        where: { id: { in: timeSlotIds } },
        data: { status: "AVAILABLE" },
      });
    }
  },
};
