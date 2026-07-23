-- Smriti Box — full schema (run in Supabase SQL editor, in order)
create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  occasion_type text not null check (occasion_type in ('birthday','anniversary','fathers_day','mothers_day','valentines_day','other')),
  slug text unique not null,
  recipient_name text not null,
  target_date timestamptz,
  message text,
  signature text,
  closing_line text,
  locked_message text default 'something is waiting for you here — Some memories and a letter, sealed until your day arrives.',
  locked_footer text default 'come back on the day to open it',
  countdown_eyebrow text default 'Finally that day has arrived',
  countdown_arrived text default 'Happy Birthday',
  section_eyebrow text default 'The moments worth remembering',
  envelope_letter_mark text default 'My days would be incomplete without you — today, and forever.',
  is_published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table timeline_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  sort_order int not null default 0,
  date_label text,
  caption text,
  image_path text
);

create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  sort_order int default 0,
  image_path text not null,
  caption text,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  type text not null check (type in ('publish','extra_images')),
  amount int not null,
  quantity int not null default 1,
  bkash_txn_id text not null,
  bkash_number text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  submitted_at timestamptz default now(),
  verified_at timestamptz,
  verified_by uuid references profiles(id)
);

-- auto-create profile on signup
create function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- image limit enforcement — 20 FREE IMAGES TOTAL across timeline_items + gallery_images combined
create function event_image_limit(p_event_id uuid)
returns int as $$
  select 20 + coalesce(sum(quantity), 0)::int
  from payments
  where event_id = p_event_id and type = 'extra_images' and status = 'verified';
$$ language sql stable;

create function event_image_usage(p_event_id uuid)
returns int as $$
  select
    (select count(*) from timeline_items where event_id = p_event_id and image_path is not null)
    +
    (select count(*) from gallery_images where event_id = p_event_id);
$$ language sql stable;

create function check_gallery_limit()
returns trigger as $$
begin
  if event_image_usage(new.event_id) >= event_image_limit(new.event_id) then
    raise exception 'Image limit reached for this event';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_gallery_limit
  before insert on gallery_images
  for each row execute function check_gallery_limit();

create function check_timeline_image_limit()
returns trigger as $$
begin
  -- only enforce when a NEW image is being attached (not when clearing one)
  if new.image_path is not null and (old.image_path is null or old.image_path is distinct from new.image_path) then
    if event_image_usage(new.event_id) >= event_image_limit(new.event_id) then
      raise exception 'Image limit reached for this event';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_timeline_image_limit
  before update on timeline_items
  for each row execute function check_timeline_image_limit();

-- admin helpers
create function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer;

create function verify_payment(p_payment_id uuid)
returns void as $$
declare
  v_event_id uuid;
  v_type text;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  select event_id, type into v_event_id, v_type from payments where id = p_payment_id;

  update payments
  set status = 'verified', verified_at = now(), verified_by = auth.uid()
  where id = p_payment_id;

  if v_type = 'publish' then
    update events set is_published = true, updated_at = now() where id = v_event_id;
  end if;
end;
$$ language plpgsql security definer;

create function reject_payment(p_payment_id uuid)
returns void as $$
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;
  update payments set status = 'rejected', verified_at = now(), verified_by = auth.uid()
  where id = p_payment_id;
end;
$$ language plpgsql security definer;

-- RLS
alter table profiles enable row level security;
alter table events enable row level security;
alter table timeline_items enable row level security;
alter table gallery_images enable row level security;
alter table payments enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "update own profile" on profiles for update using (id = auth.uid());

create policy "owner full access events" on events for all using (owner_id = auth.uid());
create policy "public read published events" on events for select using (is_published = true);
create policy "admin read all events" on events for select using (is_admin());

create policy "owner full access timeline" on timeline_items for all
  using (exists (select 1 from events where events.id = event_id and events.owner_id = auth.uid()));
create policy "public read timeline of published" on timeline_items for select
  using (exists (select 1 from events where events.id = event_id and events.is_published = true));
create policy "admin read all timeline" on timeline_items for select using (is_admin());

create policy "owner full access gallery" on gallery_images for all
  using (exists (select 1 from events where events.id = event_id and events.owner_id = auth.uid()));
create policy "public read gallery of published" on gallery_images for select
  using (exists (select 1 from events where events.id = event_id and events.is_published = true));
create policy "admin read all gallery" on gallery_images for select using (is_admin());

create policy "owner insert own payments" on payments for insert
  with check (exists (select 1 from events where events.id = event_id and events.owner_id = auth.uid()));
create policy "owner read own payments" on payments for select
  using (exists (select 1 from events where events.id = event_id and events.owner_id = auth.uid()));
create policy "admin full access payments" on payments for all using (is_admin());

-- storage bucket
insert into storage.buckets (id, name, public) values ('event-images', 'event-images', true)
  on conflict (id) do nothing;

create policy "owner upload own event images" on storage.objects for insert
  with check (bucket_id = 'event-images' and (storage.foldername(name))[1] in (
    select id::text from events where owner_id = auth.uid()
  ));
create policy "public read event images" on storage.objects for select
  using (bucket_id = 'event-images');
