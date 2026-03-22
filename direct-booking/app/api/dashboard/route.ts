import { NextResponse } from "next/server";
import {
  getAllBookings,
  confirmDeposit,
  confirmBalance,
  cancelBooking,
  markPaidOutsideSystem,
  overrideCheckinInfo,
  markCompleted,
} from "@/lib/booking";
import {
  sendDepositConfirmedEmail,
  sendBalanceConfirmedEmail,
  sendCheckinInstructionsEmail,
} from "@/lib/notifications";
import { getSettings } from "@/lib/booking";

function requireAuth(request: Request): boolean {
  return request.headers.get("x-dashboard-password") === process.env.DASHBOARD_PASSWORD;
}

export async function GET(request: Request) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const bookings = await getAllBookings();
    return NextResponse.json({ bookings });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, booking_id, reason, payment_stage } = await request.json();

    if (!booking_id || !action) {
      return NextResponse.json({ error: "Missing action or booking_id" }, { status: 400 });
    }

    const settings = await getSettings();
    let booking;

    switch (action) {
      case "confirm_deposit": {
        booking = await confirmDeposit(booking_id);
        await sendDepositConfirmedEmail(booking, settings).catch(console.error);
        break;
      }
      case "confirm_balance": {
        booking = await confirmBalance(booking_id);
        await sendBalanceConfirmedEmail(booking, settings).catch(console.error);
        break;
      }
      case "cancel": {
        await cancelBooking(booking_id, reason);
        return NextResponse.json({ success: true });
      }
      case "mark_paid_outside_system": {
        if (!payment_stage) {
          return NextResponse.json({ error: "Missing payment_stage" }, { status: 400 });
        }
        booking = await markPaidOutsideSystem(booking_id, payment_stage);
        if (payment_stage === "deposit") {
          await sendDepositConfirmedEmail(booking, settings).catch(console.error);
        } else {
          await sendBalanceConfirmedEmail(booking, settings).catch(console.error);
        }
        break;
      }
      case "override_checkin_info": {
        await overrideCheckinInfo(booking_id);
        // Get fresh booking to send email
        const { getBooking } = await import("@/lib/booking");
        const b = await getBooking(booking_id);
        if (b) {
          await sendCheckinInstructionsEmail(b, settings).catch(console.error);
        }
        return NextResponse.json({ success: true });
      }
      case "mark_completed": {
        await markCompleted(booking_id);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ booking });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
