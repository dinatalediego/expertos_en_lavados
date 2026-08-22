-- LimpiaFast Growth OS v0.2
-- Run in Supabase SQL Editor (PostgreSQL).

create extension if not exists pgcrypto;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  service_type text,
  service_detail text,
  district text,
  photo_received boolean default false,
  pain_point text,
  urgency text,
  status text not null default 'QUALIFYING',
  source_ad_id text,
  ctwa_clid text,
  referral jsonb not null default '{}'::jsonb,
  quoted_price numeric(12,2),
  booked boolean not null default false,
  booking_date timestamptz,
  revenue numeric(12,2),
  direct_cost numeric(12,2),
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bot_sessions (
  phone text primary key,
  state text not null,
  step integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  direction text not null check (direction in ('inbound','outbound')),
  message_type text not null,
  body text,
  meta_message_id text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_phone_created on messages(phone, created_at desc);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_source_ad on leads(source_ad_id);

create table if not exists ad_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  ad_id text not null,
  ad_name text,
  campaign_name text,
  adset_name text,
  spend numeric(12,2) not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  conversations integer not null default 0,
  qualified integer not null default 0,
  bookings integer not null default 0,
  revenue numeric(12,2) not null default 0,
  daily_budget numeric(12,2),
  created_at timestamptz not null default now(),
  unique(metric_date, ad_id)
);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Public PostgREST access is disabled by default. The app writes through the
-- server-side Supabase service role, which bypasses RLS. Never expose the
-- service-role key in browser code.
alter table public.leads enable row level security;
alter table public.bot_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.ad_daily_metrics enable row level security;
alter table public.lead_events enable row level security;
