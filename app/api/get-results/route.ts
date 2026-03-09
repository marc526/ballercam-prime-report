// This route is no longer needed — the frontend reads /report-data.json directly
// Kept as a pass-through for compatibility
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ redirect: "/report-data.json" }, { status: 200 });
}
