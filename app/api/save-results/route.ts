import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-save-secret");
  if (secret !== process.env.SAVE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await kv.set("prime-report", body);

  return NextResponse.json({ ok: true });
}
