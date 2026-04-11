import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3001",
  "http://127.0.0.1:5173",
];

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Methods":     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":     "Content-Type,Authorization,X-Requested-With,Accept",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age":           "86400",
};

function addCors(response: NextResponse, origin: string): NextResponse {
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";

  // Handle preflight OPTIONS — must return 200 for CORS to work
  if (request.method === "OPTIONS") {
    return addCors(new NextResponse(null, { status: 200 }), origin);
  }

  // Pass through normal requests, attach CORS headers
  return addCors(NextResponse.next(), origin);
}

export const config = {
  matcher: "/api/:path*",
};
