import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await kv.get("prime-report");
  if (!data) {
    return NextResponse.json({ error: "No report data yet" }, { status: 404 });
  }
  return NextResponse.json(data);
}
