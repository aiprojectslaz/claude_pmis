-- Run this once in your Supabase SQL editor

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────
create type booking_status as enum (
  'pending_deposit',
  'deposit_paid',
  'pending_balance',
  'fully_paid',
  'completed',
  'cancelled'
);

-- ─────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Guest info
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,

  -- Stay details
  check_in date not null,
  check_out date not null,
  num_guests integer not null default 1,
  special_requests text,

  -- Pricing (in CAD cents)
  nightly_rate_cents integer not null,
  num_nights integer not null,
  cleaning_fee_cents integer not null default 0,
  total_cents integer not null,
  deposit_cents integer not null,   -- amount due first
  balance_cents integer not null,   -- amount due 14 days before check-in

  -- Status
  status booking_status not null default 'pending_deposit',

  -- Payment timestamps
  deposit_paid_at timestamptz,
  balance_paid_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,

  -- Check-in info control
  checkin_info_sent_at timestamptz,
  checkin_info_override boolean not null default false,  -- manual override by owner

  -- Notes (owner-only internal)
  owner_notes text
);

-- ─────────────────────────────────────────
-- blocked_dates
-- ─────────────────────────────────────────
create table blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  is_soft_block boolean not null default false,   -- true = pending_deposit; released on cancel
  booking_id uuid references bookings(id) on delete cascade,
  reason text,   -- for manual owner blocks with no booking

  unique (date)
);

create index blocked_dates_date_idx on blocked_dates(date);
create index blocked_dates_booking_id_idx on blocked_dates(booking_id);

-- ─────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────
create type notification_type as enum (
  'deposit_instructions_email',
  'deposit_sms_owner',
  'deposit_reminder_sms_owner',
  'deposit_confirmed_email',
  'balance_reminder_email',
  'balance_overdue_email',
  'balance_overdue_sms_owner',
  'balance_confirmed_email',
  'checkin_instructions_email'
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  booking_id uuid not null references bookings(id) on delete cascade,
  type notification_type not null,
  recipient text not null,   -- email address or phone number
  success boolean not null default true,
  error_message text
);

create index notifications_booking_type_idx on notifications(booking_id, type);

-- ─────────────────────────────────────────
-- property_settings  (single-row config)
-- ─────────────────────────────────────────
create table property_settings (
  id integer primary key default 1 check (id = 1),   -- enforce single row

  -- Property info
  property_name text not null default 'Our Cabin',
  property_address text not null default '',
  property_description text not null default '',

  -- Rates (CAD cents)
  nightly_rate_cents integer not null default 20000,       -- $200/night
  cleaning_fee_cents integer not null default 15000,       -- $150
  deposit_percent integer not null default 50,             -- 50% deposit

  -- e-Transfer instructions
  etransfer_email text not null default '',
  etransfer_security_question text not null default '',
  etransfer_security_answer text not null default '',

  -- Check-in details (withheld until fully_paid)
  door_code text not null default '',
  wifi_name text not null default '',
  wifi_password text not null default '',
  checkin_instructions text not null default '',           -- markdown/plain text

  -- Booking rules
  min_nights integer not null default 2,
  max_nights integer not null default 30,
  balance_due_days_before integer not null default 14,     -- days before check-in
  auto_cancel_hours integer not null default 48            -- hours before pending auto-cancels
);

-- Insert the single settings row
insert into property_settings (id) values (1)
  on conflict (id) do nothing;

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- (Service role key bypasses RLS; anon key used only for public availability)
-- ─────────────────────────────────────────
alter table bookings enable row level security;
alter table blocked_dates enable row level security;
alter table notifications enable row level security;
alter table property_settings enable row level security;

-- Anon can only read blocked_dates (for calendar)
create policy "anon_read_blocked_dates"
  on blocked_dates for select
  to anon
  using (true);

-- Service role has full access (enforced at app layer, not DB layer)
-- All other access goes through service role key in API routes
