alter table "public"."anime_lists" drop constraint "anime_lists_creator_id_fkey";

alter table "public"."comments" drop constraint "comments_creator_id_fkey";

alter table "public"."discussions" drop constraint "discussions_creator_id_fkey";

alter table "public"."item_recommendations" drop constraint "item_recommendations_recommended_by_fkey";

alter table "public"."item_reviews" drop constraint "item_reviews_creator_id_fkey";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."recent_items" drop constraint "recent_items_profile_id_fkey";

alter table "public"."anime_lists" add constraint "anime_lists_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."anime_lists" validate constraint "anime_lists_creator_id_fkey";

alter table "public"."comments" add constraint "comments_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_creator_id_fkey";

alter table "public"."discussions" add constraint "discussions_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."discussions" validate constraint "discussions_creator_id_fkey";

alter table "public"."item_recommendations" add constraint "item_recommendations_recommended_by_fkey" FOREIGN KEY (recommended_by) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."item_recommendations" validate constraint "item_recommendations_recommended_by_fkey";

alter table "public"."item_reviews" add constraint "item_reviews_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."item_reviews" validate constraint "item_reviews_creator_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."recent_items" add constraint "recent_items_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."recent_items" validate constraint "recent_items_profile_id_fkey";


