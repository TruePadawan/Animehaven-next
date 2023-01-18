begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;

  -- re-create the supabase_realtime publication with no tables
  create publication supabase_realtime;
commit;

-- add a table to the publication
alter publication supabase_realtime add table comments;
insert into storage.buckets (id, name, public) values('avatars','avatars',true);
CREATE POLICY "Give users authenticated access to folder 1oj01fe_0" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = ANY (ARRAY['final'::text, 'temp'::text])) AND (auth.role() = 'authenticated'::text));
CREATE POLICY "Give users authenticated access to folder 1oj01fe_1" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = ANY (ARRAY['final'::text, 'temp'::text])) AND (auth.role() = 'authenticated'::text));
CREATE POLICY "Give users authenticated access to folder 1oj01fe_2" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = ANY (ARRAY['final'::text, 'temp'::text])) AND (auth.role() = 'authenticated'::text));
CREATE POLICY "Give users authenticated access to folder 1oj01fe_3" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = ANY (ARRAY['final'::text, 'temp'::text])) AND (auth.role() = 'authenticated'::text));