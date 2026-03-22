import { NextResponse } from "next/server";
import { getBlockedDates } from "@/lib/booking";

export async function GET() {
  try {
    const blocked = await getBlockedDates();
    return NextResponse.json({ blocked });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
