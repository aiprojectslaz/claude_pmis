import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import type { Booking } from "@/lib/booking";

const ICAL_STATUSES = ["deposit_paid", "pending_balance", "fully_paid", "completed"];

function toICalDate(isoDate: string): string {
  // All-day event: YYYYMMDD
  return format(parseISO(isoDate), "yyyyMMdd");
}

function toICalDateTime(isoDateTime: string): string {
  return format(parseISO(isoDateTime), "yyyyMMdd'T'HHmmss'Z'");
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.ICAL_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .in("status", ICAL_STATUSES);

  if (error) {
    return new NextResponse("Internal error", { status: 500 });
  }

  const bookings = (data ?? []) as Booking[];
  const now = toICalDateTime(new Date().toISOString());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";

  const events = bookings
    .map((b) => {
      const uid = `${b.id}@${new URL(appUrl).hostname}`;
      const summary = escapeICalText(`BOOKED – ${b.guest_name}`);
      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${toICalDate(b.check_in)}`,
        `DTEND;VALUE=DATE:${toICalDate(b.check_out)}`,
        `SUMMARY:${summary}`,
        `STATUS:CONFIRMED`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  const cal = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Direct Booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Property Bookings`,
    "X-WR-TIMEZONE:America/Toronto",
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(cal, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bookings.ics"',
      "Cache-Control": "no-cache",
    },
  });
}
