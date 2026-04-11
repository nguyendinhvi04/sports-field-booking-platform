import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const courts = await prisma.court.findMany({
      where: { club: { slug: "cau-long-quan-7-pro" } },
      take: 1,
      include: {
        pricings: true,
        club: {
          include: { openingHours: true }
        }
      }
    });

    return NextResponse.json({ success: true, courts });
  } catch (err: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định" 
    }, { status: 500 });
  }
}
