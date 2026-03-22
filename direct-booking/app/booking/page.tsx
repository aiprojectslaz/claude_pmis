"use client";

import { useState, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, differenceInCalendarDays, parseISO, addDays } from "date-fns";
import "react-day-picker/dist/style.css";

interface BookingForm {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  num_guests: string;
  special_requests: string;
}

type Step = "calendar" | "form" | "success" | "error";

export default function BookingPage() {
  const [range, setRange] = useState<DateRange | undefined>();
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [step, setStep] = useState<Step>("calendar");
  const [form, setForm] = useState<BookingForm>({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    num_guests: "2",
    special_requests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then(({ blocked }) => {
        setBlockedDates((blocked as string[]).map((d: string) => parseISO(d)));
      })
      .catch(console.error);
  }, []);

  const numNights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!range?.from || !range?.to) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          num_guests: Number(form.num_guests),
          check_in: format(range.from, "yyyy-MM-dd"),
          check_out: format(range.to, "yyyy-MM-dd"),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong. Please try again.");
        setStep("error");
      } else {
        setBookingId(json.booking.id);
        setStep("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (step === "success" && bookingId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-10 max-w-lg w-full">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="font-display text-3xl font-semibold mb-3 text-stone-800">Request Received!</h1>
          <p className="text-stone-600 mb-6">
            Check your inbox for e-Transfer instructions. Your dates are soft-held for 48 hours
            while we await your deposit.
          </p>
          <a
            href={`/guest/${bookingId}`}
            className="inline-block bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-800 transition-colors"
          >
            View Your Booking
          </a>
        </div>
      </main>
    );
  }

  if (step === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-10 max-w-lg w-full">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="font-display text-3xl font-semibold mb-3 text-stone-800">Something went wrong</h1>
          <p className="text-red-600 mb-6">{errorMsg}</p>
          <button
            onClick={() => { setStep("calendar"); setRange(undefined); }}
            className="bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-semibold text-stone-800 mb-2 text-center">
          Check Availability
        </h1>
        <p className="text-stone-500 text-center mb-8">
          Select your check-in and check-out dates below.
        </p>

        {step === "calendar" && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={[{ before: addDays(today, 1) }, ...blockedDates]}
              numberOfMonths={2}
              className="mx-auto"
            />
            {numNights > 0 && (
              <div className="mt-4 p-4 bg-brand-50 rounded-xl text-sm text-stone-700">
                <strong>{numNights} night{numNights !== 1 ? "s" : ""}</strong>
                {" — "}
                {range?.from && format(range.from, "MMM d")} → {range?.to && format(range.to, "MMM d, yyyy")}
              </div>
            )}
            <button
              disabled={!range?.from || !range?.to || numNights < 1}
              onClick={() => setStep("form")}
              className="mt-4 w-full bg-brand-700 text-white py-3 rounded-lg font-semibold hover:bg-brand-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <button
              onClick={() => setStep("calendar")}
              className="text-sm text-brand-700 hover:underline mb-4 block"
            >
              ← Change dates
            </button>
            <div className="mb-6 p-4 bg-brand-50 rounded-xl text-sm text-stone-700">
              <strong>{numNights} night{numNights !== 1 ? "s" : ""}</strong>
              {" — "}
              {range?.from && format(range.from, "MMM d")} → {range?.to && format(range.to, "MMM d, yyyy")}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {(
                [
                  { id: "guest_name", label: "Full Name", type: "text", required: true },
                  { id: "guest_email", label: "Email", type: "email", required: true },
                  { id: "guest_phone", label: "Phone Number", type: "tel", required: true },
                ] as const
              ).map(({ id, label, type, required }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor={id}>
                    {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    required={required}
                    value={form[id]}
                    onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="num_guests">
                  Number of Guests
                </label>
                <select
                  id="num_guests"
                  value={form.num_guests}
                  onChange={(e) => setForm((f) => ({ ...f, num_guests: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="special_requests">
                  Special Requests (optional)
                </label>
                <textarea
                  id="special_requests"
                  rows={3}
                  value={form.special_requests}
                  onChange={(e) => setForm((f) => ({ ...f, special_requests: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-700 text-white py-3 rounded-lg font-semibold hover:bg-brand-800 transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Booking Request"}
              </button>

              <p className="text-xs text-stone-400 text-center">
                No payment yet — you&apos;ll receive e-Transfer instructions by email.
              </p>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
