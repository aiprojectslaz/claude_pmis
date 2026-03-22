"use client";

import { useState, useEffect, useCallback } from "react";
import type { PropertySettings } from "@/lib/booking";

type SettingsForm = Omit<PropertySettings, "min_nights" | "max_nights" | "balance_due_days_before" | "auto_cancel_hours" | "deposit_percent" | "nightly_rate_cents" | "cleaning_fee_cents"> & {
  nightly_rate: string;
  cleaning_fee: string;
  deposit_percent: string;
  min_nights: string;
  max_nights: string;
  balance_due_days_before: string;
  auto_cancel_hours: string;
};

function centsToStr(cents: number) { return (cents / 100).toFixed(2); }
function strToCents(s: string) { return Math.round(parseFloat(s || "0") * 100); }

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [form, setForm] = useState<Partial<SettingsForm>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings", { headers: { "x-dashboard-password": pw } });
      if (res.status === 401) { setError("Wrong password"); return; }
      const { settings } = await res.json();
      setForm({
        ...settings,
        nightly_rate: centsToStr(settings.nightly_rate_cents),
        cleaning_fee: centsToStr(settings.cleaning_fee_cents),
        deposit_percent: String(settings.deposit_percent),
        min_nights: String(settings.min_nights),
        max_nights: String(settings.max_nights),
        balance_due_days_before: String(settings.balance_due_days_before),
        auto_cancel_hours: String(settings.auto_cancel_hours),
      });
      setAuthed(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const payload: Partial<PropertySettings> = {
        property_name: form.property_name,
        property_address: form.property_address,
        property_description: form.property_description,
        nightly_rate_cents: strToCents(form.nightly_rate ?? "0"),
        cleaning_fee_cents: strToCents(form.cleaning_fee ?? "0"),
        deposit_percent: Number(form.deposit_percent),
        etransfer_email: form.etransfer_email,
        etransfer_security_question: form.etransfer_security_question,
        etransfer_security_answer: form.etransfer_security_answer,
        door_code: form.door_code,
        wifi_name: form.wifi_name,
        wifi_password: form.wifi_password,
        checkin_instructions: form.checkin_instructions,
        min_nights: Number(form.min_nights),
        max_nights: Number(form.max_nights),
        balance_due_days_before: Number(form.balance_due_days_before),
        auto_cancel_hours: Number(form.auto_cancel_hours),
      };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-dashboard-password": password },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  function field(id: keyof SettingsForm, label: string, type = "text", placeholder?: string) {
    return (
      <div key={id}>
        <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
        <input
          type={type}
          value={(form[id] as string) ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          placeholder={placeholder}
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 w-full max-w-sm shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-stone-800 mb-6 text-center">Settings</h1>
          <form onSubmit={(e) => { e.preventDefault(); fetchSettings(password); }} className="space-y-4">
            <input
              type="password"
              placeholder="Dashboard password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-brand-700 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-800 disabled:opacity-60">
              {loading ? "Loading…" : "Enter"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-semibold text-stone-800">Property Settings</h1>
          <a href="/dashboard" className="text-sm border border-stone-300 rounded-lg px-4 py-2 hover:bg-white transition-colors">
            ← Dashboard
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Section title="Property Info">
            {field("property_name", "Property Name")}
            {field("property_address", "Address")}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.property_description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, property_description: e.target.value }))}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </Section>

          <Section title="Rates">
            {field("nightly_rate", "Nightly Rate (CAD)", "number", "200.00")}
            {field("cleaning_fee", "Cleaning Fee (CAD)", "number", "150.00")}
            {field("deposit_percent", "Deposit %", "number", "50")}
            {field("min_nights", "Minimum Nights", "number")}
            {field("max_nights", "Maximum Nights", "number")}
          </Section>

          <Section title="e-Transfer">
            {field("etransfer_email", "e-Transfer Email")}
            {field("etransfer_security_question", "Security Question")}
            {field("etransfer_security_answer", "Security Answer")}
          </Section>

          <Section title="Check-in Info (Sent After Full Payment)">
            {field("door_code", "Door Code")}
            {field("wifi_name", "WiFi Network Name")}
            {field("wifi_password", "WiFi Password")}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Check-in Instructions</label>
              <textarea
                rows={6}
                value={form.checkin_instructions ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, checkin_instructions: e.target.value }))}
                placeholder="Parking info, access instructions, house rules, etc."
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </Section>

          <Section title="Automation">
            {field("balance_due_days_before", "Balance Due Days Before Check-in", "number")}
            {field("auto_cancel_hours", "Auto-cancel Pending Bookings After (hours)", "number")}
          </Section>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm font-medium">✓ Settings saved!</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-700 text-white py-3 rounded-lg font-semibold hover:bg-brand-800 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
      <h2 className="font-display text-xl font-semibold text-stone-800">{title}</h2>
      {children}
    </div>
  );
}
