import { NextRequest, NextResponse } from "next/server";
import { processPaymentWebhook } from "@/modules/payment/payment.service";

// GET /api/payments/webhook - Thường cho VNPay Return URL hoặc kiểm tra nhanh
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = await processPaymentWebhook(params);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error (GET):", error);
    return NextResponse.json({ RspCode: "99", Message: "Unknown error" }, { status: 500 });
  }
}

// POST /api/payments/webhook - Dùng cho MoMo IPN và VNPay IPN
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received payment IPN:", body);

    const result = await processPaymentWebhook(body);
    
    // MoMo yêu cầu HTTP STATUS 204 No Content hoặc status 200 tùy version
    // Ở đây ta trả về status 200 với thông báo thành công
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error (POST):", error);
    // Nếu lỗi, vẫn nên trả về 200 hoặc mã lỗi cụ thể theo tài liệu payment gateway để họ gọi lại sau
    return NextResponse.json({ RspCode: "99", Message: "Internal Error" }, { status: 500 });
  }
}
