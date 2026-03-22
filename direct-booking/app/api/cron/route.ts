import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  cancelBooking,
  getSettings,
  hasNotificationBeenSent,
  type Booking,
} from "@/lib/booking";
import {
  sendDepositReminderSMSToOwner,
  sendBalanceReminderEmail,
  sendBalanceOverdueEmail,
  sendBalanceOverdueSMSToOwner,
  sendCheckinInstructionsEmail,
} from "@/lib/notifications";
import { differenceInHours, differenceInCalendarDays, parseISO } from "date-fns";

function requireCronAuth(request: Request): boolean {
  return request.headers.get("x-cron-secret") === process.env.CRON_SECRET;
}

export async function GET(request: Request) {
  if (!requireCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: string[] = [];

  try {
    const settings = await getSettings();

    // ─── 1. Auto-cancel pending_deposit bookings older than auto_cancel_hours ───
    const { data: pendingBookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("status", "pending_deposit");

    for (const b of (pendingBookings ?? []) as Booking[]) {
      const hoursSinceCreated = differenceInHours(now, parseISO(b.created_at));
      if (hoursSinceCreated >= settings.auto_cancel_hours) {
        await cancelBooking(b.id, "Auto-cancelled: deposit not received within 48 hours");
        results.push(`AUTO_CANCEL: ${b.id} (${b.guest_name})`);
      }
    }

    // ─── 2. Deposit reminder SMS to owner (4h after request, once only) ───────
    const { data: newPending } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("status", "pending_deposit");

    for (const b of (newPending ?? []) as Booking[]) {
      const hoursSince = differenceInHours(now, parseISO(b.created_at));
      if (hoursSince >= 4) {
        const alreadySent = await hasNotificationBeenSent(b.id, "deposit_reminder_sms_owner");
        if (!alreadySent) {
          await sendDepositReminderSMSToOwner(b);
          results.push(`DEPOSIT_REMINDER_SMS: ${b.id}`);
        }
      }
    }

    // ─── 3. Balance reminder email at day -14 ────────────────────────────────
    const { data: depositPaidBookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .in("status", ["deposit_paid", "pending_balance"]);

    for (const b of (depositPaidBookings ?? []) as Booking[]) {
      const daysUntilCheckin = differenceInCalendarDays(parseISO(b.check_in), now);
      if (daysUntilCheckin <= settings.balance_due_days_before && daysUntilCheckin > 3) {
        const alreadySent = await hasNotificationBeenSent(b.id, "balance_reminder_email");
        if (!alreadySent) {
          await sendBalanceReminderEmail(b, settings);
          // Update status to pending_balance
          await supabaseAdmin
            .from("bookings")
            .update({ status: "pending_balance" })
            .eq("id", b.id)
            .eq("status", "deposit_paid");
          results.push(`BALANCE_REMINDER: ${b.id}`);
        }
      }
    }

    // ─── 4. Balance overdue at day -3 ────────────────────────────────────────
    const { data: overdueBookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .in("status", ["deposit_paid", "pending_balance"]);

    for (const b of (overdueBookings ?? []) as Booking[]) {
      const daysUntilCheckin = differenceInCalendarDays(parseISO(b.check_in), now);
      if (daysUntilCheckin <= 3 && daysUntilCheckin >= 0) {
        const alreadySentEmail = await hasNotificationBeenSent(b.id, "balance_overdue_email");
        if (!alreadySentEmail) {
          await sendBalanceOverdueEmail(b, settings);
          await sendBalanceOverdueSMSToOwner(b);
          results.push(`BALANCE_OVERDUE: ${b.id}`);
        }
      }
    }

    // ─── 5. Auto-send check-in instructions at day -1 (fully_paid only) ─────
    const { data: fullyPaidBookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("status", "fully_paid")
      .is("checkin_info_sent_at", null);

    for (const b of (fullyPaidBookings ?? []) as Booking[]) {
      const daysUntilCheckin = differenceInCalendarDays(parseISO(b.check_in), now);
      if (daysUntilCheckin <= 1 && daysUntilCheckin >= 0) {
        await sendCheckinInstructionsEmail(b, settings);
        await supabaseAdmin
          .from("bookings")
          .update({ checkin_info_sent_at: now.toISOString() })
          .eq("id", b.id);
        results.push(`CHECKIN_INSTRUCTIONS: ${b.id}`);
      }
    }

    return NextResponse.json({ ok: true, processed: results });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
