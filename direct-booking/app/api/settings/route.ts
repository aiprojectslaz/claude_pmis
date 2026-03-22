import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/booking";

function requireDashboardAuth(request: Request): boolean {
  const password = request.headers.get("x-dashboard-password");
  return password === process.env.DASHBOARD_PASSWORD;
}

export async function GET(request: Request) {
  if (!requireDashboardAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!requireDashboardAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const patch = await request.json();
    await updateSettings(patch);
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
