import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || "DUMMY123";
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || "DUMMY_SECRET";
const VNP_URL = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || "http://localhost:3000/api/bookings/vnpay-return";

export async function createPaymentUrl(bookingId: string, amount: number, method: string, ipAddr: string = "127.0.0.1") {
  if (method === "MOMO") {
    // Tương tự cho MoMo
    return `https://test-payment.momo.vn/pay?amount=${amount}&orderId=${bookingId}`;
  }
  if (method === "CASH" || method === "BANK_TRANSFER") {
    return null;
  }

  // VNPAY
  const date = new Date();
  
  // Format yyyyMMddHHmmss
  const pad = (n: number) => n < 10 ? '0' + n : n;
  const createDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  
  const orderId = bookingId;

  let vnp_Params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan don dat san ${orderId}`,
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

export async function processPaymentWebhook(vnp_Params: Record<string, string>) {
  const secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash !== signed) {
    throw new Error("INVALID_SIGNATURE");
  }

  const responseCode = vnp_Params["vnp_ResponseCode"];
  const bookingId = vnp_Params["vnp_TxnRef"];

  if (responseCode === "00") {
    // Thanh toán thành công
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { bookingId } });
      if (!payment) return;
      if (payment.status === "CONFIRMED") return;

      await tx.payment.update({
        where: { bookingId },
        data: {
          status: "CONFIRMED",
          paidAt: new Date(),
          transactionRef: vnp_Params["vnp_TransactionNo"],
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
    });
    return { RspCode: "00", Message: "Confirm Success" };
  } else {
    // Giao dịch lỗi 
    await prisma.payment.update({
      where: { bookingId },
      data: { status: "CANCELLED" }
    });
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });
    return { RspCode: "02", Message: "Order failed" };
  }
}

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
