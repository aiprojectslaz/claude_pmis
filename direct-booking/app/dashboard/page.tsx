"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import type { Booking } from "@/lib/booking";

const STATUS_LABELS: Record<string, string> = {
  pending_deposit: "Awaiting Deposit",
  deposit_paid: "Deposit Paid",
  pending_balance: "Balance Due",
  fully_paid: "Fully Paid",
  completed: "Complete",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  pending_deposit: "bg-amber-100 text-amber-800",
  deposit_paid: "bg-blue-100 text-blue-800",
  pending_balance: "bg-orange-100 text-orange-800",
  fully_paid: "bg-green-100 text-green-800",
  completed: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-100 text-red-700",
};

function cad(cents: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);
}

function fmtDate(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy");
}

export default function DashboardPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard", {
        headers: { "x-dashboard-password": pw },
      });
      if (res.status === 401) { setError("Wrong password"); return; }
      const json = await res.json();
      setBookings(json.bookings ?? []);
      setAuthed(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  async function doAction(
    bookingId: string,
    action: string,
    extra?: Record<string, string>
  ) {
    setActionLoading(bookingId + action);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dashboard-password": password,
        },
        body: JSON.stringify({ action, booking_id: bookingId, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.error); return; }
      await fetchBookings(password);
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 w-full max-w-sm shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-stone-800 mb-6 text-center">
            Owner Dashboard
          </h1>
          <form
            onSubmit={(e) => { e.preventDefault(); fetchBookings(password); }}
            className="space-y-4"
          >
            <input
              type="password"
              placeholder="Dashboard password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-700 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-800 transition-colors disabled:opacity-60"
            >
              {loading ? "Checking…" : "Enter"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const active = bookings.filter((b) => b.status !== "cancelled" && b.status !== "completed");
  const archive = bookings.filter((b) => b.status === "cancelled" || b.status === "completed");

  return (
    <main className="min-h-screen bg-brand-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-semibold text-stone-800">Bookings</h1>
          <div className="flex gap-3">
            <a
              href="/dashboard/settings"
              className="text-sm border border-stone-300 rounded-lg px-4 py-2 hover:bg-white transition-colors"
            >
              Settings
            </a>
            <button
              onClick={() => fetchBookings(password)}
              className="text-sm bg-white border border-stone-300 rounded-lg px-4 py-2 hover:bg-stone-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && <p className="text-stone-500 text-center py-12">Loading…</p>}

        {!loading && active.length === 0 && (
          <div className="text-center py-16 text-stone-400">No active bookings.</div>
        )}

        <div className="space-y-4">
          {active.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              actionLoading={actionLoading}
              onAction={doAction}
            />
          ))}
        </div>

        {archive.length > 0 && (
          <details className="mt-10">
            <summary className="cursor-pointer text-stone-500 text-sm font-medium mb-4">
              Show {archive.length} archived booking{archive.length !== 1 ? "s" : ""}
            </summary>
            <div className="space-y-4 mt-4">
              {archive.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  actionLoading={actionLoading}
                  onAction={doAction}
                />
              ))}
            </div>
          </details>
        )}
      </div>
    </main>
  );
}

function BookingCard({
  booking: b,
  actionLoading,
  onAction,
}: {
  booking: Booking;
  actionLoading: string | null;
  onAction: (id: string, action: string, extra?: Record<string, string>) => void;
}) {
  const busy = (action: string) => actionLoading === b.id + action;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-stone-800">{b.guest_name}</p>
          <p className="text-sm text-stone-500">{b.guest_email} · {b.guest_phone}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status]}`}>
          {STATUS_LABELS[b.status]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm text-stone-600 mb-4">
        <div><span className="block text-xs text-stone-400 uppercase tracking-wide">Check-in</span>{fmtDate(b.check_in)}</div>
        <div><span className="block text-xs text-stone-400 uppercase tracking-wide">Check-out</span>{fmtDate(b.check_out)}</div>
        <div><span className="block text-xs text-stone-400 uppercase tracking-wide">Total</span>{cad(b.total_cents)}</div>
      </div>

      <div className="text-sm text-stone-500 mb-4">
        Deposit: {cad(b.deposit_cents)} {b.deposit_paid_at ? "✓ paid" : "— pending"} ·{" "}
        Balance: {cad(b.balance_cents)} {b.balance_paid_at ? "✓ paid" : "— pending"}
      </div>

      {/* Action buttons by status */}
      <div className="flex flex-wrap gap-2">
        {b.status === "pending_deposit" && (
          <>
            <ActionBtn
              label="✓ Confirm Deposit"
              loading={busy("confirm_deposit")}
              onClick={() => onAction(b.id, "confirm_deposit")}
              primary
            />
            <ActionBtn
              label="Mark Paid (Cash/Exception)"
              loading={busy("mark_paid_outside_system")}
              onClick={() => onAction(b.id, "mark_paid_outside_system", { payment_stage: "deposit" })}
            />
            <ActionBtn
              label="Cancel"
              loading={busy("cancel")}
              onClick={() => { const r = prompt("Cancel reason?") ?? ""; onAction(b.id, "cancel", { reason: r }); }}
              danger
            />
          </>
        )}
        {(b.status === "deposit_paid" || b.status === "pending_balance") && (
          <>
            <ActionBtn
              label="✓ Confirm Balance"
              loading={busy("confirm_balance")}
              onClick={() => onAction(b.id, "confirm_balance")}
              primary
            />
            <ActionBtn
              label="Mark Paid (Cash/Exception)"
              loading={busy("mark_paid_outside_system")}
              onClick={() => onAction(b.id, "mark_paid_outside_system", { payment_stage: "balance" })}
            />
          </>
        )}
        {b.status === "fully_paid" && !b.checkin_info_sent_at && (
          <ActionBtn
            label="Send Check-in Info Now"
            loading={busy("override_checkin_info")}
            onClick={() => onAction(b.id, "override_checkin_info")}
          />
        )}
        {b.status === "fully_paid" && (
          <ActionBtn
            label="Mark Completed"
            loading={busy("mark_completed")}
            onClick={() => onAction(b.id, "mark_completed")}
          />
        )}
        <a
          href={`/guest/${b.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs border border-stone-300 rounded-lg px-3 py-1.5 hover:bg-stone-50 transition-colors"
        >
          Guest Portal ↗
        </a>
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  loading,
  onClick,
  primary,
  danger,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  const base = "text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60";
  const style = danger
    ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
    : primary
    ? "bg-brand-700 text-white hover:bg-brand-800"
    : "bg-stone-100 text-stone-700 hover:bg-stone-200";
  return (
    <button disabled={loading} onClick={onClick} className={`${base} ${style}`}>
      {loading ? "…" : label}
    </button>
  );
}
