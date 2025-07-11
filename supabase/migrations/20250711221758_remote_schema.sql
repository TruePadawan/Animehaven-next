set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_recents_row_for_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.recent_items(profile_id) values(new.id);
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_item_reviews(itemid character varying, n_reviews integer, start_after integer DEFAULT 0)
 RETURNS SETOF item_reviews
 LANGUAGE plpgsql
 SET search_path TO ''
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
 SET search_path TO ''
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
 SET search_path TO ''
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
 SET search_path TO ''
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
 SET search_path TO ''
AS $function$
declare upvote_list uuid[] = (select comments.upvoted_by from comments where id = comment_id);
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
 SET search_path TO ''
AS $function$
declare upvote_list uuid[] = (select item_reviews.upvoted_by from item_reviews where id = review_id);
begin
  if array_position(upvote_list, profile_id) is null then
      update item_reviews set upvoted_by = array_prepend(profile_id, upvote_list) where id = review_id;
      return 'UPVOTE_ADDED';
  else
      update item_reviews set upvoted_by = array_remove(upvote_list, profile_id) where id = review_id;
      return 'UPVOTE_REMOVED';
  end if;
end;
$function$
;


