


-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text default '',
  status_text text default 'Disponible en novaSync',
  availability text not null default 'online' check (availability in ('online', 'busy', 'away', 'dnd')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
begin
  base_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  );
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'user';
  end if;
  final_username := base_username || '_' || substr(replace(new.id::text, '-', ''), 1, 4);

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. ROOMS
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  topic text default 'General',
  is_private boolean not null default false,
  invite_code text unique not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3. ROOM MEMBERS
create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

-- Helper function to avoid recursive RLS
create or replace function public.is_room_member(p_room_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.room_members
    where room_id = p_room_id and user_id = p_user_id
  );
$$;

create policy "Public rooms or member rooms are viewable"
  on public.rooms for select
  to authenticated
  using (not is_private or public.is_room_member(id, auth.uid()));

create policy "Authenticated users can create rooms"
  on public.rooms for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Room owners can update rooms"
  on public.rooms for update
  to authenticated
  using (auth.uid() = created_by);

create policy "Room members can view membership"
  on public.room_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_room_member(room_id, auth.uid())
  );

create policy "Users can join public rooms or be added as owner"
  on public.room_members for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      exists (select 1 from public.rooms r where r.id = room_id and (not r.is_private or r.created_by = auth.uid()))
    )
  );

create policy "Users can leave rooms"
  on public.room_members for delete
  to authenticated
  using (auth.uid() = user_id);

-- RPC to join any room (including private rooms) via invite_code
create or replace function public.join_room_by_code(p_code text)
returns public.rooms
language plpgsql
security definer set search_path = public
as $$
declare
  target_room public.rooms;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into target_room
  from public.rooms
  where upper(invite_code) = upper(trim(p_code))
  limit 1;

  if target_room.id is null then
    raise exception 'Código de invitación inválido o sala no encontrada';
  end if;

  insert into public.room_members (room_id, user_id, role)
  values (target_room.id, auth.uid(), 'member')
  on conflict (room_id, user_id) do nothing;

  return target_room;
end;
$$;

-- 4. MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'text' check (type in ('text', 'image', 'file', 'location', 'system')),
  content text default '',
  media_url text,
  file_name text,
  file_size bigint,
  mime_type text,
  latitude double precision,
  longitude double precision,
  location_label text,
  reply_to_id uuid references public.messages(id) on delete set null,
  is_pinned boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_room_created on public.messages(room_id, created_at desc);

alter table public.messages enable row level security;

create policy "Room members can read messages"
  on public.messages for select
  to authenticated
  using (
    public.is_room_member(room_id, auth.uid())
    or exists (select 1 from public.rooms r where r.id = room_id and not r.is_private)
  );

create policy "Room members can send messages"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and (
      public.is_room_member(room_id, auth.uid())
      or exists (select 1 from public.rooms r where r.id = room_id and not r.is_private)
    )
  );

create policy "Senders or room members can update pin status"
  on public.messages for update
  to authenticated
  using (
    public.is_room_member(room_id, auth.uid())
  );

create policy "Senders can delete their own messages"
  on public.messages for delete
  to authenticated
  using (auth.uid() = sender_id);

-- 5. MESSAGE REACTIONS
create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

alter table public.message_reactions enable row level security;

create policy "Authenticated users can view reactions"
  on public.message_reactions for select
  to authenticated
  using (true);

create policy "Users can add their own reactions"
  on public.message_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove their own reactions"
  on public.message_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- 6. STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

create policy "Public read access for avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated upload for avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "Authenticated update for avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars');

create policy "Public read access for chat-media"
  on storage.objects for select
  using (bucket_id = 'chat-media');

create policy "Authenticated upload for chat-media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'chat-media');

-- 7. REALTIME PUBLICATIONS
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.message_reactions;
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_members;
