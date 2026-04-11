import crypto from "crypto";
import axios from "axios";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { notifyNewBooking } from "@/lib/socket";
import { eventEmitter } from "@/lib/events";

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || "";
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || "";
const VNP_URL = process.env.VNP_URL || "";
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || "";

// ── Stripe ──────────────────────────────────────────────
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_CONFIG_MISSING");
  return new Stripe(secretKey, { apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion });
}

// ─────────────────────────────────────────────────────────
// CREATE PAYMENT URL (Router)
// ─────────────────────────────────────────────────────────
export async function createPaymentUrl(bookingId: string, amount: number, method: string, ipAddr: string = "127.0.0.1") {
  if (method === "CREDIT_CARD") {
    return await createStripeCheckoutSession(bookingId, amount);
  }
  if (method === "MOMO") {
    return await createMoMoPaymentUrl(bookingId, amount);
    // Placeholder – MoMo handled on separate branch
    return `https://test-payment.momo.vn/pay?amount=${amount}&orderId=${bookingId}`;
  }
  if (method === "CASH" || method === "BANK_TRANSFER") {
    return null;
  }

  // VNPAY (default)
  return createVNPayUrl(bookingId, amount, ipAddr);
}

// ─────────────────────────────────────────────────────────
// STRIPE: Create Checkout Session
// ─────────────────────────────────────────────────────────
async function createStripeCheckoutSession(bookingId: string, amount: number): Promise<string> {
  const stripe = getStripe();
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

  // Fetch booking details for a richer checkout experience
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      club: { select: { name: true } },
      items: { include: { timeSlot: { include: { court: { select: { name: true } } } } } },
    },
  });

  const clubName = booking?.club?.name || "Sports Field";
  const courtNames = booking?.items?.map(i => i.timeSlot.court.name).filter(Boolean) || [];
  const description = courtNames.length > 0
    ? `Đặt sân: ${courtNames.join(", ")} tại ${clubName}`
    : `Đặt sân tại ${clubName}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: bookingId,
    line_items: [
      {
        price_data: {
          currency: "vnd",
          product_data: {
            name: `Đặt sân - ${clubName}`,
            description,
          },
          unit_amount: Math.round(amount), // VND doesn't use decimal subunits
        },
        quantity: 1,
      },
    ],
    success_url: `${frontendUrl}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/checkout?cancelled=1`,
    metadata: {
      bookingId,
    },
    expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
  });

  if (!session.url) {
    throw new Error("STRIPE_SESSION_URL_MISSING");
  }

  // Save Stripe session ID to payment record for later verification
  await prisma.payment.update({
    where: { bookingId },
    data: { transactionRef: session.id },
  });

  return session.url;
}

// ─────────────────────────────────────────────────────────
// STRIPE: Process Webhook (called from /api/payments/stripe-webhook)
// ─────────────────────────────────────────────────────────
export async function processStripeWebhook(rawBody: string, signature: string): Promise<{ received: boolean }> {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret) {
    // Verify signature in production
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } else {
    // Dev mode – parse directly (no signature verification)
    event = JSON.parse(rawBody) as Stripe.Event;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId || session.client_reference_id;

    if (bookingId && session.payment_status === "paid") {
      await handleSuccessfulPayment(bookingId, session.payment_intent as string);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId || session.client_reference_id;

    if (bookingId) {
      await handleFailedPayment(bookingId);
    }
  }

  return { received: true };
}

/**
 * Verify a Stripe Checkout Session by session_id (called from frontend after redirect)
 */
export async function verifyStripeSession(sessionId: string): Promise<{ success: boolean; bookingId?: string }> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const bookingId = session.metadata?.bookingId || session.client_reference_id;

  if (!bookingId) {
    return { success: false };
  }

  if (session.payment_status === "paid") {
    // Check if already processed
    const payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (payment && payment.status !== "CONFIRMED") {
      await handleSuccessfulPayment(bookingId, session.payment_intent as string);
    }
    return { success: true, bookingId };
  }

  return { success: false, bookingId };
}

// ─────────────────────────────────────────────────────────
// VNPAY: Create Payment URL
// ─────────────────────────────────────────────────────────
function createVNPayUrl(bookingId: string, amount: number, ipAddr: string): string {
  const date = new Date();
  const pad = (n: number) => n < 10 ? '0' + n : n;
  const createDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  let vnp_Params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: bookingId,
    vnp_OrderInfo: `Thanh toan don dat san ${bookingId}`,
    vnp_OrderType: "other",
    vnp_Amount: (amount * 100).toString(),
    vnp_ReturnUrl: VNP_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);
  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = new URL(VNP_URL);
  Object.entries(vnp_Params).forEach(([key, value]) => {
    paymentUrl.searchParams.append(key, value);
  });

  return paymentUrl.toString();
}

// ─────────────────────────────────────────────────────────
// VNPAY: Process Webhook
// ─────────────────────────────────────────────────────────
export async function processPaymentWebhook(vnp_Params: Record<string, string>) {
  const secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  const sortedParams = sortObject(vnp_Params);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash !== signed) {
    throw new Error("INVALID_SIGNATURE");
  }

  const responseCode = vnp_Params["vnp_ResponseCode"];
  const bookingId = vnp_Params["vnp_TxnRef"];

  if (responseCode === "00") {
    await handleSuccessfulPayment(bookingId, vnp_Params["vnp_TransactionNo"]);
    return { RspCode: "00", Message: "Confirm Success" };
  } else {
    await handleFailedPayment(bookingId);
    return { RspCode: "02", Message: "Order failed" };
  }
}

// ─────────────────────────────────────────────────────────
// SHARED: Handle Successful / Failed Payment
// ─────────────────────────────────────────────────────────
async function handleSuccessfulPayment(bookingId: string, transactionRef: string) {
  const updatedBooking = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { bookingId } });
    if (!payment || payment.status === "CONFIRMED") return null;

    await tx.payment.update({
      where: { bookingId },
      data: {
        status: "CONFIRMED",
        paidAt: new Date(),
        transactionRef,
      },
    });

    return await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
      include: { items: { include: { timeSlot: { include: { court: true } } } } },
    });
  });

  if (updatedBooking?.clubId) {
    notifyNewBooking(updatedBooking.clubId, {
      booking: updatedBooking,
      type: "payment-confirmed",
    });

    eventEmitter.emit("booking.status_updated", {
      clubId: updatedBooking.clubId,
      booking: updatedBooking,
      type: "payment-confirmed",
    });
  }

  return { RspCode: "02", Message: "Order failed" };
}

async function handleFailedPayment(bookingId: string) {
  await prisma.payment.update({
    where: { bookingId },
    data: { status: "CANCELLED" },
  });

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  if (updatedBooking.clubId) {
    notifyNewBooking(updatedBooking.clubId, {
      booking: updatedBooking,
      type: "booking-cancelled",
    });
  }
}

// ─────────────────────────────────────────────────────────
// Upload Payment Proof (Bank Transfer)
// ─────────────────────────────────────────────────────────
export async function submitPaymentProof(bookingId: string, proofImageUrl: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { bookingId } });
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    await tx.payment.update({
      where: { bookingId },
      data: { proofImageUrl, status: "WAITING_PAYMENT" },
    });

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "WAITING_PAYMENT" },
    });

    if (updatedBooking.clubId) {
      notifyNewBooking(updatedBooking.clubId, {
        booking: updatedBooking,
        type: "payment-proof-submitted",
      });
    }

    return updatedBooking;
  });
}

// ─────────────────────────────────────────────────────────
function sortObject(obj: Record<string, string>) {
  const sorted: Record<string, string> = {};
  const str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
