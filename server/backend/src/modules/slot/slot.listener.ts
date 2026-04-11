import { eventEmitter } from "@/lib/events";
import { notifyNewBooking } from "@/lib/socket";

/**
 * Slot Event Listener
 * Decouples slot-related notifications from business logic.
 */
export const initSlotListeners = () => {
    /**
     * Listen for manual slot status toggling (LOCKED/AVAILABLE)
     */
    eventEmitter.on('slot.toggled', ({ clubId, slot, type }) => {
        if (clubId) {
            notifyNewBooking(clubId, {
                slot,
                type: type || 'slot-updated'
            });
        }
    });

    /**
     * Future events:
     * - 'slot.hold': When someone starts selecting a slot in real-time
     * - 'slot.expired': When a held slot becomes available again
     */
};
