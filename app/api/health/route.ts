import { NextResponse } from "next/server";
import db from "@/lib/db";

/** GET /api/health — DB SELECT 1 확인 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
