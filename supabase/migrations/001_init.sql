-- WaveRow Database Schema
-- Run via: supabase db push

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- PROFILES
-- ============================================================
create type user_role as enum ('student', 'landlord', 'admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role user_role not null default 'student',
  avatar_url text,
  bio text,
  phone text,
  is_verified_student boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- RLS
alter table profiles enable row level security;
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- ============================================================
-- LISTINGS
-- ============================================================
create type listing_type as enum ('APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM');
create type listing_status as enum ('ACTIVE', 'PENDING', 'RENTED', 'EXPIRED');

create table listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  listing_type listing_type not null default 'APARTMENT',
  status listing_status not null default 'ACTIVE',
  rent_per_month integer not null, -- stored in cents
  bedrooms integer not null default 1,
  bathrooms numeric(3,1) not null default 1,
  sqft integer,
  neighborhood text,
  address text,
  lat numeric(9,6),
  lng numeric(9,6),
  available_from date,
  lease_duration_months integer,
  is_sublease boolean not null default false,
  utilities_included boolean not null default false,
  pet_friendly boolean not null default false,
  furnished boolean not null default false,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  is_featured boolean not null default false,
  scam_flagged boolean not null default false,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger listings_updated_at before update on listings
  for each row execute function set_updated_at();

-- Full text search
create index listings_neighborhood_idx on listings(neighborhood);
create index listings_status_idx on listings(status);
create index listings_rent_idx on listings(rent_per_month);
create index listings_created_idx on listings(created_at desc);
create index listings_trgm_title on listings using gin(title gin_trgm_ops);

-- RLS
alter table listings enable row level security;
create policy "listings_select_active" on listings for select using (status = 'ACTIVE' or auth.uid() = user_id);
create policy "listings_insert_auth" on listings for insert with check (auth.uid() = user_id);
create policy "listings_update_own" on listings for update using (auth.uid() = user_id);
create policy "listings_delete_own" on listings for delete using (auth.uid() = user_id);

-- ============================================================
-- SAVED LISTINGS
-- ============================================================
create table saved_listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

alter table saved_listings enable row level security;
create policy "saved_listings_own" on saved_listings using (auth.uid() = user_id);

-- ============================================================
-- CONVERSATIONS + MESSAGES
-- ============================================================
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete set null,
  participant_one uuid not null references profiles(id) on delete cascade,
  participant_two uuid not null references profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique(listing_id, participant_one, participant_two)
);

create index conversations_p1 on conversations(participant_one);
create index conversations_p2 on conversations(participant_two);

alter table conversations enable row level security;
create policy "conversations_participants" on conversations
  using (auth.uid() = participant_one or auth.uid() = participant_two);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_conversation on messages(conversation_id, created_at);

alter table messages enable row level security;
create policy "messages_conversation_participants" on messages
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

-- Auto-update conversation last_message on new message
create or replace function update_conversation_last_message()
returns trigger language plpgsql security definer as $$
begin
  update conversations
  set last_message = new.content, last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;
create trigger messages_update_conversation
  after insert on messages
  for each row execute function update_conversation_last_message();

-- ============================================================
-- ROOMMATE PROFILES
-- ============================================================
create type sleep_schedule as enum ('early_bird', 'night_owl', 'flexible');

create table roommate_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  display_name text,
  bio text,
  budget_min integer,
  budget_max integer,
  move_in_date date,
  preferred_neighborhoods text[] not null default '{}',
  sleep_schedule sleep_schedule not null default 'flexible',
  cleanliness_level integer not null default 3 check (cleanliness_level between 1 and 5),
  social_level integer not null default 3 check (social_level between 1 and 5),
  has_pets boolean not null default false,
  smoking boolean not null default false,
  major text,
  year text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger roommate_profiles_updated_at before update on roommate_profiles
  for each row execute function set_updated_at();

alter table roommate_profiles enable row level security;
create policy "roommate_profiles_select_active" on roommate_profiles for select using (is_active = true);
create policy "roommate_profiles_insert_own" on roommate_profiles for insert with check (auth.uid() = user_id);
create policy "roommate_profiles_update_own" on roommate_profiles for update using (auth.uid() = user_id);

-- ============================================================
-- WAITLIST
-- ============================================================
create table waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;
create policy "waitlist_insert" on waitlist for insert with check (true);

-- ============================================================
-- PRICE ALERTS
-- ============================================================
create table price_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  target_price integer, -- cents, null = any drop
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

alter table price_alerts enable row level security;
create policy "price_alerts_own" on price_alerts using (auth.uid() = user_id);
