CREATE INDEX refresh_token_session_id ON auth.refresh_tokens USING btree (session_id);

CREATE UNIQUE INDEX users_email_key ON auth.users USING btree (email);

alter table "auth"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.email()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  	coalesce(
		nullif(current_setting('request.jwt.claim.email', true), ''),
		(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
	)::text
$function$
;

CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  	coalesce(
		nullif(current_setting('request.jwt.claim.role', true), ''),
		(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
	)::text
$function$
;

CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select 
  	coalesce(
		nullif(current_setting('request.jwt.claim.sub', true), ''),
		(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
	)::uuid
$function$
;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return split_part(_filename, '.', 2);
END
$function$
;

create policy "Enable delete for users based on id"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((auth.uid() = id));


create policy "Enable insert for authenticated users only"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (true);


create policy "Give users authenticated access to folder 1oj01fe_0"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = ANY (ARRAY['final'::text, 'temp'::text])) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder 1oj01fe_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = ANY (ARRAY['final'::text, 'temp'::text])) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder 1oj01fe_2"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = ANY (ARRAY['final'::text, 'temp'::text])) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder 1oj01fe_3"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = ANY (ARRAY['final'::text, 'temp'::text])) AND (auth.role() = 'authenticated'::text)));



