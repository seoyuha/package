-- Supabase SQL Editor에 실행하세요. 관리자 UUID는 Auth > Users에서 확인하세요.
create table if not exists public.hub_admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.hub_games (
  id text primary key, position integer not null default 0, name text not null,
  description text not null default '', category text not null default '종합',
  unit text not null default '전단원', student_url text not null,
  teacher_url text not null default '', image_url text not null default ''
);
alter table public.hub_games enable row level security;
alter table public.hub_admins enable row level security;
drop policy if exists "hub public reads games" on public.hub_games;
create policy "hub public reads games" on public.hub_games for select to anon,authenticated using (true);
drop policy if exists "hub admins write games" on public.hub_games;
create policy "hub admins write games" on public.hub_games for all to authenticated
using (exists(select 1 from public.hub_admins where user_id=(select auth.uid())))
with check (exists(select 1 from public.hub_admins where user_id=(select auth.uid())));
drop policy if exists "admin reads own record" on public.hub_admins;
create policy "admin reads own record" on public.hub_admins for select to authenticated using (user_id=(select auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('hub-images','hub-images',true,4194304,array['image/webp'])
on conflict (id) do nothing;
drop policy if exists "hub public sees thumbnails" on storage.objects;
create policy "hub public sees thumbnails" on storage.objects for select to anon,authenticated using (bucket_id='hub-images');
drop policy if exists "hub admins add thumbnails" on storage.objects;
create policy "hub admins add thumbnails" on storage.objects for insert to authenticated
with check (bucket_id='hub-images' and exists(select 1 from public.hub_admins where user_id=(select auth.uid())));
-- 관리자 가입 후 자신의 Auth 사용자 UUID를 다음 명령에 넣고 따로 실행:
-- insert into public.hub_admins(user_id) values ('실제-관리자-UUID');
