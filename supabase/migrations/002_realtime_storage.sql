-- Enable Realtime for messages and conversations
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;

-- Storage bucket for listing images
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict do nothing;

-- Storage RLS: anyone can view, authenticated users can upload to their own folder
create policy "listing_images_select" on storage.objects
  for select using (bucket_id = 'listing-images');

create policy "listing_images_insert" on storage.objects
  for insert with check (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy "listing_images_delete" on storage.objects
  for delete using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "avatars_select" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
