import { EventEmitter } from "events";

/**
 * Global Event Emitter for decoupling backend modules
 * Usage:
 * backendEventEmitter.emit('booking.created', { bookingId: '...' });
 * backendEventEmitter.on('booking.created', async (data) => { ... });
 */
class BackendEventEmitter extends EventEmitter {}

export const eventEmitter = new BackendEventEmitter();
