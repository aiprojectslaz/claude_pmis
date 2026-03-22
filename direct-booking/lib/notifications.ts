import { Resend } from "resend";
import twilio from "twilio";
import type { Booking, PropertySettings } from "./booking";
import { logNotification } from "./booking";
import { format, parseISO } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY!);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const FROM_EMAIL = `${process.env.RESEND_FROM_NAME ?? "Direct Booking"} <${process.env.RESEND_FROM_EMAIL ?? "bookings@example.com"}>`;
const OWNER_PHONE = process.env.OWNER_PHONE!;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

function cad(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

function fmtDate(iso: string): string {
  return format(parseISO(iso), "EEEE, MMMM d, yyyy");
}

// ─────────────────────────────────────────
// SMS helpers
// ─────────────────────────────────────────

async function sendSMS(to: string, body: string): Promise<void> {
  await twilioClient.messages.create({ body, from: TWILIO_FROM, to });
}

// ─────────────────────────────────────────
// 1. Deposit instructions → guest email
// ─────────────────────────────────────────

export async function sendDepositInstructionsEmail(
  booking: Booking,
  settings: PropertySettings
): Promise<void> {
  const type = "deposit_instructions_email";
  const subject = `Booking Request Received — ${settings.property_name}`;
  const html = `
    <h2>Hi ${booking.guest_name},</h2>
    <p>Thanks for your booking request for <strong>${settings.property_name}</strong>!</p>
    <p>Your stay is not confirmed until we receive your deposit. Please send an Interac e-Transfer to hold your dates.</p>
    <hr/>
    <h3>E-Transfer Details</h3>
    <table>
      <tr><td><strong>Amount:</strong></td><td>${cad(booking.deposit_cents)}</td></tr>
      <tr><td><strong>Send to:</strong></td><td>${settings.etransfer_email}</td></tr>
      <tr><td><strong>Security Question:</strong></td><td>${settings.etransfer_security_question}</td></tr>
      <tr><td><strong>Answer:</strong></td><td>${settings.etransfer_security_answer}</td></tr>
      <tr><td><strong>Message:</strong></td><td>Deposit – ${booking.guest_name} – ${fmtDate(booking.check_in)}</td></tr>
    </table>
    <hr/>
    <h3>Your Booking Summary</h3>
    <table>
      <tr><td><strong>Check-in:</strong></td><td>${fmtDate(booking.check_in)}</td></tr>
      <tr><td><strong>Check-out:</strong></td><td>${fmtDate(booking.check_out)}</td></tr>
      <tr><td><strong>Guests:</strong></td><td>${booking.num_guests}</td></tr>
      <tr><td><strong>Nightly rate:</strong></td><td>${cad(booking.nightly_rate_cents)} × ${booking.num_nights} nights</td></tr>
      <tr><td><strong>Cleaning fee:</strong></td><td>${cad(booking.cleaning_fee_cents)}</td></tr>
      <tr><td><strong>Total:</strong></td><td>${cad(booking.total_cents)}</td></tr>
      <tr><td><strong>Deposit due now:</strong></td><td>${cad(booking.deposit_cents)}</td></tr>
      <tr><td><strong>Balance due 14 days before check-in:</strong></td><td>${cad(booking.balance_cents)}</td></tr>
    </table>
    <p>Your booking request will be automatically cancelled if the deposit is not received within 48 hours.</p>
    <p>You can view your booking status at: <a href="${APP_URL}/guest/${booking.id}">${APP_URL}/guest/${booking.id}</a></p>
    <p>Questions? Reply to this email.</p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject,
    html,
  });

  await logNotification(booking.id, type, booking.guest_email, !error, error?.message);
  if (error) throw new Error(`Resend error: ${error.message}`);
}

// ─────────────────────────────────────────
// 2. New booking SMS → owner
// ─────────────────────────────────────────

export async function sendNewBookingSMSToOwner(
  booking: Booking
): Promise<void> {
  const type = "deposit_sms_owner";
  const body =
    `New booking request!\n` +
    `Guest: ${booking.guest_name}\n` +
    `Dates: ${fmtDate(booking.check_in)} → ${fmtDate(booking.check_out)}\n` +
    `Deposit: ${cad(booking.deposit_cents)}\n` +
    `Check your e-Transfer and confirm at ${APP_URL}/dashboard`;

  try {
    await sendSMS(OWNER_PHONE, body);
    await logNotification(booking.id, type, OWNER_PHONE, true);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await logNotification(booking.id, type, OWNER_PHONE, false, msg);
    throw e;
  }
}

// ─────────────────────────────────────────
// 3. Deposit reminder SMS → owner (4h after request)
// ─────────────────────────────────────────

export async function sendDepositReminderSMSToOwner(
  booking: Booking
): Promise<void> {
  const type = "deposit_reminder_sms_owner";
  const body =
    `Reminder: ${booking.guest_name} hasn't paid the deposit yet.\n` +
    `${fmtDate(booking.check_in)} → ${fmtDate(booking.check_out)}\n` +
    `Deposit: ${cad(booking.deposit_cents)}\n` +
    `Auto-cancels in ~44hrs if unpaid.`;

  try {
    await sendSMS(OWNER_PHONE, body);
    await logNotification(booking.id, type, OWNER_PHONE, true);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await logNotification(booking.id, type, OWNER_PHONE, false, msg);
  }
}

// ─────────────────────────────────────────
// 4. Deposit confirmed → guest email
// ─────────────────────────────────────────

export async function sendDepositConfirmedEmail(
  booking: Booking,
  settings: PropertySettings
): Promise<void> {
  const type = "deposit_confirmed_email";
  const subject = `Deposit Received — Your stay at ${settings.property_name} is confirmed!`;
  const html = `
    <h2>Great news, ${booking.guest_name}!</h2>
    <p>We've received your deposit of ${cad(booking.deposit_cents)}. Your stay is confirmed.</p>
    <h3>Stay Details</h3>
    <table>
      <tr><td><strong>Check-in:</strong></td><td>${fmtDate(booking.check_in)}</td></tr>
      <tr><td><strong>Check-out:</strong></td><td>${fmtDate(booking.check_out)}</td></tr>
      <tr><td><strong>Balance due (14 days before check-in):</strong></td><td>${cad(booking.balance_cents)}</td></tr>
    </table>
    <p>We'll email you balance payment instructions 14 days before your stay. Check-in details will be shared once the full balance is received.</p>
    <p>View your booking: <a href="${APP_URL}/guest/${booking.id}">${APP_URL}/guest/${booking.id}</a></p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject,
    html,
  });

  await logNotification(booking.id, type, booking.guest_email, !error, error?.message);
  if (error) throw new Error(`Resend error: ${error.message}`);
}

// ─────────────────────────────────────────
// 5. Balance reminder → guest email (14 days before)
// ─────────────────────────────────────────

export async function sendBalanceReminderEmail(
  booking: Booking,
  settings: PropertySettings
): Promise<void> {
  const type = "balance_reminder_email";
  const subject = `Balance Due — ${settings.property_name}`;
  const html = `
    <h2>Hi ${booking.guest_name},</h2>
    <p>Your check-in is coming up on ${fmtDate(booking.check_in)}! Your balance of ${cad(booking.balance_cents)} is now due.</p>
    <h3>E-Transfer Details</h3>
    <table>
      <tr><td><strong>Amount:</strong></td><td>${cad(booking.balance_cents)}</td></tr>
      <tr><td><strong>Send to:</strong></td><td>${settings.etransfer_email}</td></tr>
      <tr><td><strong>Security Question:</strong></td><td>${settings.etransfer_security_question}</td></tr>
      <tr><td><strong>Answer:</strong></td><td>${settings.etransfer_security_answer}</td></tr>
      <tr><td><strong>Message:</strong></td><td>Balance – ${booking.guest_name} – ${fmtDate(booking.check_in)}</td></tr>
    </table>
    <p>Check-in details (door code, WiFi) will be sent once your balance is confirmed.</p>
    <p>View your booking: <a href="${APP_URL}/guest/${booking.id}">${APP_URL}/guest/${booking.id}</a></p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject,
    html,
  });

  await logNotification(booking.id, type, booking.guest_email, !error, error?.message);
  if (error) throw new Error(`Resend error: ${error.message}`);
}

// ─────────────────────────────────────────
// 6. Balance overdue → guest email + owner SMS (3 days before)
// ─────────────────────────────────────────

export async function sendBalanceOverdueEmail(
  booking: Booking,
  settings: PropertySettings
): Promise<void> {
  const type = "balance_overdue_email";
  const subject = `URGENT: Balance Overdue — ${settings.property_name}`;
  const html = `
    <h2>Hi ${booking.guest_name},</h2>
    <p><strong>Your balance of ${cad(booking.balance_cents)} is overdue.</strong> Check-in is in 3 days on ${fmtDate(booking.check_in)}.</p>
    <p>Please send payment immediately to avoid cancellation.</p>
    <table>
      <tr><td><strong>Amount:</strong></td><td>${cad(booking.balance_cents)}</td></tr>
      <tr><td><strong>Send to:</strong></td><td>${settings.etransfer_email}</td></tr>
      <tr><td><strong>Security Question:</strong></td><td>${settings.etransfer_security_question}</td></tr>
      <tr><td><strong>Answer:</strong></td><td>${settings.etransfer_security_answer}</td></tr>
    </table>
    <p>View your booking: <a href="${APP_URL}/guest/${booking.id}">${APP_URL}/guest/${booking.id}</a></p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject,
    html,
  });

  await logNotification(booking.id, type, booking.guest_email, !error, error?.message);
}

export async function sendBalanceOverdueSMSToOwner(
  booking: Booking
): Promise<void> {
  const type = "balance_overdue_sms_owner";
  const body =
    `ALERT: ${booking.guest_name} balance overdue!\n` +
    `Check-in in 3 days: ${fmtDate(booking.check_in)}\n` +
    `Balance owed: ${cad(booking.balance_cents)}\n` +
    `Dashboard: ${APP_URL}/dashboard`;

  try {
    await sendSMS(OWNER_PHONE, body);
    await logNotification(booking.id, type, OWNER_PHONE, true);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await logNotification(booking.id, type, OWNER_PHONE, false, msg);
  }
}

// ─────────────────────────────────────────
// 7. Balance confirmed → guest email
// ─────────────────────────────────────────

export async function sendBalanceConfirmedEmail(
  booking: Booking,
  settings: PropertySettings
): Promise<void> {
  const type = "balance_confirmed_email";
  const subject = `Payment Complete — See you soon at ${settings.property_name}!`;
  const html = `
    <h2>You're all paid up, ${booking.guest_name}!</h2>
    <p>We've received your full payment. Check-in details will be sent 24 hours before your arrival on ${fmtDate(booking.check_in)}.</p>
    <p>View your booking: <a href="${APP_URL}/guest/${booking.id}">${APP_URL}/guest/${booking.id}</a></p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject,
    html,
  });

  await logNotification(booking.id, type, booking.guest_email, !error, error?.message);
}

// ─────────────────────────────────────────
// 8. Check-in instructions → guest email (24h before)
// ─────────────────────────────────────────

export async function sendCheckinInstructionsEmail(
  booking: Booking,
  settings: PropertySettings
): Promise<void> {
  const type = "checkin_instructions_email";
  const subject = `Check-in Tomorrow — ${settings.property_name}`;
  const html = `
    <h2>See you tomorrow, ${booking.guest_name}!</h2>
    <p>Here are your check-in details for ${settings.property_name}:</p>
    <h3>Access Information</h3>
    <table>
      <tr><td><strong>Address:</strong></td><td>${settings.property_address}</td></tr>
      <tr><td><strong>Door Code:</strong></td><td><code style="font-size:1.3em">${settings.door_code}</code></td></tr>
      <tr><td><strong>WiFi Network:</strong></td><td>${settings.wifi_name}</td></tr>
      <tr><td><strong>WiFi Password:</strong></td><td>${settings.wifi_password}</td></tr>
    </table>
    <h3>Check-in Instructions</h3>
    <div style="white-space:pre-wrap">${settings.checkin_instructions}</div>
    <p>View your booking: <a href="${APP_URL}/guest/${booking.id}">${APP_URL}/guest/${booking.id}</a></p>
    <p>Enjoy your stay!</p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.guest_email,
    subject,
    html,
  });

  await logNotification(booking.id, type, booking.guest_email, !error, error?.message);
  if (error) throw new Error(`Resend error: ${error.message}`);
}
