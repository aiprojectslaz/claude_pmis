import { NextResponse } from "next/server";
import { getBooking } from "@/lib/booking";

// Sensitive fields only revealed after full payment
const SENSITIVE_FIELDS = ["door_code", "wifi_name", "wifi_password", "checkin_instructions"];

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await getBooking(params.id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isFullyPaid = booking.status === "fully_paid" || booking.status === "completed";
    const checkinInfoUnlocked = isFullyPaid || booking.checkin_info_override;

    // Return booking data, gate sensitive fields
    return NextResponse.json({
      booking: {
        id: booking.id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        check_in: booking.check_in,
        check_out: booking.check_out,
        num_guests: booking.num_guests,
        num_nights: booking.num_nights,
        nightly_rate_cents: booking.nightly_rate_cents,
        cleaning_fee_cents: booking.cleaning_fee_cents,
        total_cents: booking.total_cents,
        deposit_cents: booking.deposit_cents,
        balance_cents: booking.balance_cents,
        status: booking.status,
        deposit_paid_at: booking.deposit_paid_at,
        balance_paid_at: booking.balance_paid_at,
        cancelled_at: booking.cancelled_at,
        checkin_info_unlocked: checkinInfoUnlocked,
        checkin_info_sent_at: booking.checkin_info_sent_at,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Suppress unused import warning
void SENSITIVE_FIELDS;
