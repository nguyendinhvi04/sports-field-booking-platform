import { NextRequest, NextResponse } from "next/server";
import { processStripeWebhook } from "@/modules/payment/payment.service";

/**
 * POST /api/payments/stripe-webhook
 * Stripe sends events here (checkout.session.completed, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const result = await processStripeWebhook(rawBody, signature);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[Stripe Webhook Error]:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
