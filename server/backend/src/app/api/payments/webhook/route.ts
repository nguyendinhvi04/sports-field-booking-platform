import { NextRequest, NextResponse } from "next/server";
import { processPaymentWebhook } from "@/services/payment.service";

// GET /api/payments/webhook
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const vnpParams: Record<string, string> = {};
    
    // Convert URLSearchParams to object
    url.searchParams.forEach((value, key) => {
      vnpParams[key] = value;
    });

    const result = await processPaymentWebhook(vnpParams);
    
    // VNPay usually expects a specific JSON format response to acknowledge IPN
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" }, { status: 500 });
  }
}
