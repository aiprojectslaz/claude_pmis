import { supabaseAdmin } from "./supabase";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type BookingStatus =
  | "pending_deposit"
  | "deposit_paid"
  | "pending_balance"
  | "fully_paid"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  created_at: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  special_requests: string | null;
  nightly_rate_cents: number;
  num_nights: number;
  cleaning_fee_cents: number;
  total_cents: number;
  deposit_cents: number;
  balance_cents: number;
  status: BookingStatus;
  deposit_paid_at: string | null;
  balance_paid_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  checkin_info_sent_at: string | null;
  checkin_info_override: boolean;
  owner_notes: string | null;
}

export interface PropertySettings {
  property_name: string;
  property_address: string;
  property_description: string;
  nightly_rate_cents: number;
  cleaning_fee_cents: number;
  deposit_percent: number;
  etransfer_email: string;
  etransfer_security_question: string;
  etransfer_security_answer: string;
  door_code: string;
  wifi_name: string;
  wifi_password: string;
  checkin_instructions: string;
  min_nights: number;
  max_nights: number;
  balance_due_days_before: number;
  auto_cancel_hours: number;
}

export interface CreateBookingInput {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  special_requests?: string;
}

// ─────────────────────────────────────────
// Property settings
// ─────────────────────────────────────────

export async function getSettings(): Promise<PropertySettings> {
  const { data, error } = await supabaseAdmin
    .from("property_settings")
    .select("*")
    .single();
  if (error) throw new Error(`Failed to load settings: ${error.message}`);
  return data as PropertySettings;
}

export async function updateSettings(
  patch: Partial<PropertySettings>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("property_settings")
    .update(patch)
    .eq("id", 1);
  if (error) throw new Error(`Failed to update settings: ${error.message}`);
}

// ─────────────────────────────────────────
// Pricing helpers
// ─────────────────────────────────────────

export function calculatePricing(
  checkIn: string,
  checkOut: string,
  settings: PropertySettings
): {
  numNights: number;
  nightlyRateCents: number;
  cleaningFeeCents: number;
  totalCents: number;
  depositCents: number;
  balanceCents: number;
} {
  const numNights = differenceInCalendarDays(
    parseISO(checkOut),
    parseISO(checkIn)
  );
  const nightlyRateCents = settings.nightly_rate_cents;
  const cleaningFeeCents = settings.cleaning_fee_cents;
  const totalCents = numNights * nightlyRateCents + cleaningFeeCents;
  const depositCents = Math.round(
    totalCents * (settings.deposit_percent / 100)
  );
  const balanceCents = totalCents - depositCents;
  return {
    numNights,
    nightlyRateCents,
    cleaningFeeCents,
    totalCents,
    depositCents,
    balanceCents,
  };
}

// ─────────────────────────────────────────
// Availability
// ─────────────────────────────────────────

/** Returns all blocked date strings (YYYY-MM-DD) including soft blocks. */
export async function getBlockedDates(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("blocked_dates")
    .select("date");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { date: string }) => r.date);
}

/** Returns only hard-blocked dates (for iCal — excludes soft blocks). */
export async function getHardBlockedDates(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("blocked_dates")
    .select("date")
    .eq("is_soft_block", false);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { date: string }) => r.date);
}

export async function isAvailable(
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const blocked = await getBlockedDates();
  const blockedSet = new Set(blocked);
  let current = parseISO(checkIn);
  const end = parseISO(checkOut);
  while (current < end) {
    if (blockedSet.has(format(current, "yyyy-MM-dd"))) return false;
    current = addDays(current, 1);
  }
  return true;
}

async function softBlockDates(
  checkIn: string,
  checkOut: string,
  bookingId: string
): Promise<void> {
  const dates: { date: string; is_soft_block: boolean; booking_id: string }[] =
    [];
  let current = parseISO(checkIn);
  const end = parseISO(checkOut);
  while (current < end) {
    dates.push({
      date: format(current, "yyyy-MM-dd"),
      is_soft_block: true,
      booking_id: bookingId,
    });
    current = addDays(current, 1);
  }
  const { error } = await supabaseAdmin.from("blocked_dates").insert(dates);
  if (error) throw new Error(`Soft block failed: ${error.message}`);
}

async function hardBlockDates(bookingId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("blocked_dates")
    .update({ is_soft_block: false })
    .eq("booking_id", bookingId);
  if (error) throw new Error(`Hard block failed: ${error.message}`);
}

async function releaseSoftBlocks(bookingId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("blocked_dates")
    .delete()
    .eq("booking_id", bookingId)
    .eq("is_soft_block", true);
  if (error) throw new Error(`Release soft blocks failed: ${error.message}`);
}

// ─────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────

export async function createBooking(
  input: CreateBookingInput
): Promise<Booking> {
  const settings = await getSettings();

  if (!(await isAvailable(input.check_in, input.check_out))) {
    throw new Error("Selected dates are not available.");
  }

  const pricing = calculatePricing(input.check_in, input.check_out, settings);

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert({
      guest_name: input.guest_name,
      guest_email: input.guest_email,
      guest_phone: input.guest_phone,
      check_in: input.check_in,
      check_out: input.check_out,
      num_guests: input.num_guests,
      special_requests: input.special_requests ?? null,
      nightly_rate_cents: pricing.nightlyRateCents,
      num_nights: pricing.numNights,
      cleaning_fee_cents: pricing.cleaningFeeCents,
      total_cents: pricing.totalCents,
      deposit_cents: pricing.depositCents,
      balance_cents: pricing.balanceCents,
      status: "pending_deposit",
    })
    .select()
    .single();

  if (error) throw new Error(`Create booking failed: ${error.message}`);
  const booking = data as Booking;

  await softBlockDates(input.check_in, input.check_out, booking.id);

  return booking;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Booking;
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("check_in", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Booking[];
}

// ─────────────────────────────────────────
// Status transitions
// ─────────────────────────────────────────

export async function confirmDeposit(bookingId: string): Promise<Booking> {
  const booking = await getBooking(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "pending_deposit")
    throw new Error("Booking is not awaiting deposit");

  const newStatus: BookingStatus =
    booking.balance_cents === 0 ? "fully_paid" : "deposit_paid";

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: newStatus,
      deposit_paid_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await hardBlockDates(bookingId);

  return data as Booking;
}

export async function confirmBalance(bookingId: string): Promise<Booking> {
  const booking = await getBooking(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (
    booking.status !== "deposit_paid" &&
    booking.status !== "pending_balance"
  ) {
    throw new Error("Booking is not awaiting balance");
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ status: "fully_paid", balance_paid_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  return data as Booking;
}

export async function markCheckinSent(bookingId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ checkin_info_sent_at: new Date().toISOString() })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
}

export async function overrideCheckinInfo(bookingId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ checkin_info_override: true })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
}

export async function cancelBooking(
  bookingId: string,
  reason?: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      owner_notes: reason ?? null,
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);

  await releaseSoftBlocks(bookingId);
}

export async function markPaidOutsideSystem(
  bookingId: string,
  paymentStage: "deposit" | "balance"
): Promise<Booking> {
  if (paymentStage === "deposit") return confirmDeposit(bookingId);
  return confirmBalance(bookingId);
}

export async function markCompleted(bookingId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────
// Notifications dedup guard
// ─────────────────────────────────────────

export async function hasNotificationBeenSent(
  bookingId: string,
  type: string
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("notifications")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("type", type)
    .eq("success", true)
    .limit(1);
  return (data ?? []).length > 0;
}

export async function logNotification(
  bookingId: string,
  type: string,
  recipient: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  await supabaseAdmin.from("notifications").insert({
    booking_id: bookingId,
    type,
    recipient,
    success,
    error_message: errorMessage ?? null,
  });
}
