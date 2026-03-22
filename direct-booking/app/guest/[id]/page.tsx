import { notFound } from "next/navigation";
import { getBooking } from "@/lib/booking";
import { format, parseISO } from "date-fns";

function cad(cents: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);
}

function fmtDate(iso: string) {
  return format(parseISO(iso), "EEEE, MMMM d, yyyy");
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_deposit: { label: "Awaiting Deposit", color: "text-amber-700 bg-amber-50 border-amber-200" },
  deposit_paid: { label: "Deposit Received ✓", color: "text-blue-700 bg-blue-50 border-blue-200" },
  pending_balance: { label: "Balance Due", color: "text-orange-700 bg-orange-50 border-orange-200" },
  fully_paid: { label: "Fully Paid ✓", color: "text-green-700 bg-green-50 border-green-200" },
  completed: { label: "Stay Complete", color: "text-stone-600 bg-stone-50 border-stone-200" },
  cancelled: { label: "Cancelled", color: "text-red-700 bg-red-50 border-red-200" },
};

export default async function GuestPortal({ params }: { params: { id: string } }) {
  const booking = await getBooking(params.id);
  if (!booking) notFound();

  const isFullyPaid = booking.status === "fully_paid" || booking.status === "completed";
  const checkinUnlocked = isFullyPaid || booking.checkin_info_override;
  const statusInfo = STATUS_LABELS[booking.status] ?? { label: booking.status, color: "text-stone-600 bg-stone-50 border-stone-200" };

  return (
    <main className="min-h-screen bg-brand-50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold text-stone-800 mb-1">Your Booking</h1>
          <p className="text-stone-500 text-sm">Booking ID: {booking.id}</p>
        </div>

        {/* Status */}
        <div className={`border rounded-xl px-5 py-4 text-center font-semibold ${statusInfo.color}`}>
          {statusInfo.label}
        </div>

        {/* Stay details */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-stone-800">Stay Details</h2>
          <Row label="Guest" value={booking.guest_name} />
          <Row label="Check-in" value={fmtDate(booking.check_in)} />
          <Row label="Check-out" value={fmtDate(booking.check_out)} />
          <Row label="Guests" value={String(booking.num_guests)} />
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-stone-800">Payment Summary</h2>
          <Row label={`${cad(booking.nightly_rate_cents)} × ${booking.num_nights} nights`} value={cad(booking.nightly_rate_cents * booking.num_nights)} />
          <Row label="Cleaning fee" value={cad(booking.cleaning_fee_cents)} />
          <div className="border-t border-stone-100 pt-2">
            <Row label="Total" value={cad(booking.total_cents)} bold />
          </div>
          <Row
            label="Deposit"
            value={`${cad(booking.deposit_cents)}${booking.deposit_paid_at ? " ✓ Paid" : " — Pending"}`}
          />
          <Row
            label="Balance"
            value={`${cad(booking.balance_cents)}${booking.balance_paid_at ? " ✓ Paid" : " — Due 14 days before check-in"}`}
          />
        </div>

        {/* Check-in info — gated */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display text-xl font-semibold text-stone-800 mb-3">Check-in Details</h2>
          {checkinUnlocked ? (
            <p className="text-sm text-stone-500 italic">
              Check-in details will be emailed 24 hours before your arrival, or you can find them in your confirmation email.
            </p>
          ) : (
            <div className="rounded-xl bg-stone-50 border border-stone-200 px-5 py-4 text-sm text-stone-500">
              🔒 Check-in details (door code, WiFi, instructions) will be shared once your full balance is confirmed.
            </div>
          )}
        </div>

        {booking.status === "cancelled" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
            This booking was cancelled.{" "}
            <a href="/booking" className="underline font-semibold">
              Book again →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "font-semibold text-stone-800" : "text-stone-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
