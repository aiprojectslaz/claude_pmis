import { NextResponse } from "next/server";
import {
  createBooking,
  getSettings,
} from "@/lib/booking";
import {
  sendDepositInstructionsEmail,
  sendNewBookingSMSToOwner,
} from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guest_name, guest_email, guest_phone, check_in, check_out, num_guests, special_requests } = body;

    if (!guest_name || !guest_email || !guest_phone || !check_in || !check_out || !num_guests) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const booking = await createBooking({
      guest_name,
      guest_email,
      guest_phone,
      check_in,
      check_out,
      num_guests: Number(num_guests),
      special_requests,
    });

    const settings = await getSettings();

    // Fire notifications (non-blocking — don't fail the booking if email/SMS fails)
    await Promise.allSettled([
      sendDepositInstructionsEmail(booking, settings),
      sendNewBookingSMSToOwner(booking),
    ]);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    const status = message.includes("not available") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
