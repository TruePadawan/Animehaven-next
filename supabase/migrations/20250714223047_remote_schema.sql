drop policy "Enable auth users to read all their created lists" on "public"."anime_lists";

drop policy "Enable delete for users based on creator_id" on "public"."anime_lists";

drop policy "Enable update for users based on creator_id" on "public"."anime_lists";

drop policy "Allow update permission for authenticated users only" on "public"."comments";

drop policy "Enable delete for users based on user_id" on "public"."comments";

drop policy "Enable delete for users based on creator_id" on "public"."discussions";

drop policy "Enable update for users based on creator_id" on "public"."discussions";

drop policy "Allow delete for only rows created by same user" on "public"."item_recommendations";

drop policy "Allow delete for authenticated users and own review" on "public"."item_reviews";

drop policy "Allow updates on reviews made by the user only" on "public"."item_reviews";

drop policy "Enable delete for users based on id" on "public"."profiles";

drop policy "Enable insert for authenticated users only" on "public"."profiles";

drop policy "Enable update for users based on id" on "public"."profiles";

drop policy "Enable read access for auth users only and on their own row" on "public"."recent_items";

drop policy "Enable update for users based on email" on "public"."recent_items";

alter table "public"."anime_lists" drop constraint "anime_lists_creator_id_fkey";

alter table "public"."anime_lists" drop constraint "anime_lists_id_key";

alter table "public"."comments" drop constraint "comments_creator_id_fkey";

alter table "public"."discussions" drop constraint "discussions_creator_id_fkey";

alter table "public"."discussions" drop constraint "discussions_id_key";

alter table "public"."item_recommendations" drop constraint "item_recommendations_recommended_by_fkey";

alter table "public"."item_reviews" drop constraint "item_reviews_creator_id_fkey";

alter table "public"."recent_items" drop constraint "recent_items_profile_id_fkey";

alter table "public"."recent_items" drop constraint "recent_items_id_key";

alter table "public"."profiles" drop constraint "users_id_key";

drop index if exists "public"."anime_lists_id_key";

drop index if exists "public"."discussions_id_key";

drop index if exists "public"."profiles_fts";

drop index if exists "public"."recent_items_id_key";

drop index if exists "public"."users_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_recents_row_for_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
  insert into public.recent_items(profile_id) values(new.id);
  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_item_reviews(itemid character varying, n_reviews integer, start_after integer DEFAULT 0)
 RETURNS SETOF item_reviews
 LANGUAGE plpgsql
AS $function$
    begin    
        return query select * from item_reviews where item_reviews.item_id = itemid
        order by array_length(item_reviews.upvoted_by, 1) limit n_reviews offset start_after;
    end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_saved_lists(acct_name character varying)
 RETURNS SETOF anime_lists
 LANGUAGE plpgsql
AS $function$
  declare
    list_ids int8[] = (select profiles.saved_lists from profiles where account_name = acct_name);
  begin
    return query select * from anime_lists where id = any (list_ids);
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.search_list(phrase character varying, profile_id uuid DEFAULT NULL::uuid)
 RETURNS SETOF anime_lists
 LANGUAGE plpgsql
AS $function$
  begin
    if profile_id is null then
      return query SELECT * FROM anime_lists WHERE phrase % ANY(STRING_TO_ARRAY(anime_lists.title, ' '));
    else
      return query SELECT * FROM anime_lists WHERE phrase % ANY(STRING_TO_ARRAY(anime_lists.title, ' ')) and anime_lists.creator_id = profile_id;
    end if;
	end;
$function$
;

CREATE OR REPLACE FUNCTION public.search_user(phrase character varying)
 RETURNS SETOF profiles
 LANGUAGE plpgsql
AS $function$
	begin
		return query
			SELECT *
			FROM profiles 
			WHERE phrase % ANY(STRING_TO_ARRAY(profiles.account_name, ' '))
      OR phrase % ANY(STRING_TO_ARRAY(profiles.display_name, ' '));
	end;
$function$
;

CREATE OR REPLACE FUNCTION public.toggle_comment_upvote(comment_id uuid, profile_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare upvote_list uuid[] = (select comments.upvoted_by from comments where id = comment_id);
begin
  if array_position(upvote_list, profile_id) is null then
    update comments set upvoted_by = array_prepend(profile_id, upvote_list) where id = comment_id;
    return 'UPVOTE_ADDED';
  else
    update comments set upvoted_by = array_remove(upvote_list, profile_id) where id = comment_id;
    return 'UPVOTE_REMOVED';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.toggle_review_upvote(review_id uuid, profile_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare upvote_list uuid[] = (select item_reviews.upvoted_by from item_reviews where id = review_id);
begin
  if array_position(upvote_list, profile_id) is null then
      update item_reviews set upvoted_by = array_prepend(profile_id, upvote_list) where id = review_id;
      return 'UPVOTE_ADDED';
  else
      update item_reviews set upvoted_by = array_remove(upvote_list, profile_id) where id = review_id;
      return 'UPVOTE_REMOVED';
  end if;
end;$function$
;

create policy "Enable auth users to read all their created lists"
on "public"."anime_lists"
as permissive
for select
to authenticated
using (((( SELECT auth.uid() AS uid) = creator_id) OR (is_public = true)));


create policy "Enable delete for users based on creator_id"
on "public"."anime_lists"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Enable update for users based on creator_id"
on "public"."anime_lists"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = creator_id))
with check ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Allow update permission for authenticated users only"
on "public"."comments"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = creator_id))
with check ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Enable delete for users based on user_id"
on "public"."comments"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Enable delete for users based on creator_id"
on "public"."discussions"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Enable update for users based on creator_id"
on "public"."discussions"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = creator_id))
with check ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Allow delete for only rows created by same user"
on "public"."item_recommendations"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = recommended_by));


create policy "Allow delete for authenticated users and own review"
on "public"."item_reviews"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Allow updates on reviews made by the user only"
on "public"."item_reviews"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = creator_id))
with check ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Enable delete for users based on id"
on "public"."profiles"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Enable insert for authenticated users only"
on "public"."profiles"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Enable update for users based on id"
on "public"."profiles"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Enable read access for auth users only and on their own row"
on "public"."recent_items"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = profile_id));


create policy "Enable update for users based on email"
on "public"."recent_items"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = profile_id))
with check ((( SELECT auth.uid() AS uid) = profile_id));



