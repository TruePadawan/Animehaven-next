

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";








ALTER SCHEMA "public" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_recents_row_for_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.recent_items(profile_id) values(new.id);
  return new;
end;$$;


ALTER FUNCTION "public"."create_recents_row_for_profile"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."item_reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "item_id" character varying NOT NULL,
    "creator_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "review" "text" DEFAULT ''::"text" NOT NULL,
    "rating" real NOT NULL,
    "upvoted_by" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "index" bigint NOT NULL
);


ALTER TABLE "public"."item_reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."item_reviews" IS 'Table representing reviews for anime items';



CREATE OR REPLACE FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer DEFAULT 0) RETURNS SETOF "public"."item_reviews"
    LANGUAGE "plpgsql"
    AS $$
    begin    
        return query select * from item_reviews where item_reviews.item_id = itemid
        order by array_length(item_reviews.upvoted_by, 1) limit n_reviews offset start_after;
    end;
$$;


ALTER FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."anime_lists" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "title" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "genres" "json" DEFAULT '{}'::"json" NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "is_public" boolean DEFAULT true NOT NULL,
    "items" "json" DEFAULT '[]'::"json" NOT NULL,
    "comment_instance_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL
);


ALTER TABLE "public"."anime_lists" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_saved_lists"("acct_name" character varying) RETURNS SETOF "public"."anime_lists"
    LANGUAGE "plpgsql"
    AS $$
  declare
    list_ids int8[] = (select profiles.saved_lists from profiles where account_name = acct_name);
  begin
    return query select * from anime_lists where id = any (list_ids);
  end;
$$;


ALTER FUNCTION "public"."get_saved_lists"("acct_name" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid" DEFAULT NULL::"uuid") RETURNS SETOF "public"."anime_lists"
    LANGUAGE "plpgsql"
    AS $$
  begin
    if profile_id is null then
      return query SELECT * FROM anime_lists WHERE phrase % ANY(STRING_TO_ARRAY(anime_lists.title, ' '));
    else
      return query SELECT * FROM anime_lists WHERE phrase % ANY(STRING_TO_ARRAY(anime_lists.title, ' ')) and anime_lists.creator_id = profile_id;
    end if;
	end;
$$;


ALTER FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "account_name" "text" NOT NULL,
    "display_name" "text" DEFAULT 'Default User'::"text",
    "avatar_url" "text" DEFAULT 'https://bkpyhkkjvgzfjojacrka.supabase.co/storage/v1/object/public/avatars/noprofilepic.jpg?t=2022-10-21T08%3A51%3A59.939Z'::"text" NOT NULL,
    "bio" "text" DEFAULT 'New to Animehaven'::"text",
    "saved_lists" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "items_watch_status" "json" DEFAULT '{}'::"json" NOT NULL,
    "email" character varying NOT NULL,
    "fts" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", (("account_name" || ' '::"text") || "display_name"))) STORED,
    "roles" "text"[] DEFAULT '{}'::"text"[] NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Table for users'' profile data';



COMMENT ON COLUMN "public"."profiles"."id" IS 'user account id';



CREATE OR REPLACE FUNCTION "public"."search_user"("phrase" character varying) RETURNS SETOF "public"."profiles"
    LANGUAGE "plpgsql"
    AS $$
	begin
		return query
			SELECT *
			FROM profiles 
			WHERE phrase % ANY(STRING_TO_ARRAY(profiles.account_name, ' '))
      OR phrase % ANY(STRING_TO_ARRAY(profiles.display_name, ' '));
	end;
$$;


ALTER FUNCTION "public"."search_user"("phrase" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_comment_upvote"("comment_id" "uuid", "profile_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare upvote_list uuid[] = (select comments.upvoted_by from comments where id = comment_id);
begin
  if array_position(upvote_list, profile_id) is null then
    update comments set upvoted_by = array_prepend(profile_id, upvote_list) where id = comment_id;
    return 'UPVOTE_ADDED';
  else
    update comments set upvoted_by = array_remove(upvote_list, profile_id) where id = comment_id;
    return 'UPVOTE_REMOVED';
  end if;
end;
$$;


ALTER FUNCTION "public"."toggle_comment_upvote"("comment_id" "uuid", "profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_review_upvote"("review_id" "uuid", "profile_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare upvote_list uuid[] = (select item_reviews.upvoted_by from item_reviews where id = review_id);
begin
  if array_position(upvote_list, profile_id) is null then
      update item_reviews set upvoted_by = array_prepend(profile_id, upvote_list) where id = review_id;
      return 'UPVOTE_ADDED';
  else
      update item_reviews set upvoted_by = array_remove(upvote_list, profile_id) where id = review_id;
      return 'UPVOTE_REMOVED';
  end if;
end;$$;


ALTER FUNCTION "public"."toggle_review_upvote"("review_id" "uuid", "profile_id" "uuid") OWNER TO "postgres";


ALTER TABLE "public"."anime_lists" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."anime_lists_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "creator_id" "uuid" NOT NULL,
    "text" "text" NOT NULL,
    "parent_comment_id" "uuid",
    "upvoted_by" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "instance_id" character varying NOT NULL,
    "index" bigint NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."comments"."upvoted_by" IS 'array representing users who upvoted the comment';



ALTER TABLE "public"."comments" ALTER COLUMN "index" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."comments_index_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."discussions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "title" character varying NOT NULL,
    "body" "text" NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "comment_instance_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tag" character varying NOT NULL
);


ALTER TABLE "public"."discussions" OWNER TO "postgres";


ALTER TABLE "public"."discussions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."discussions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."item_recommendations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" character varying NOT NULL,
    "recommended_by" "uuid" NOT NULL
);


ALTER TABLE "public"."item_recommendations" OWNER TO "postgres";


COMMENT ON TABLE "public"."item_recommendations" IS 'Table representing recommendation data for anime';



ALTER TABLE "public"."item_reviews" ALTER COLUMN "index" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."item_reviews_index_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."recent_items" (
    "profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "discussions" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    "lists" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    "animes" "json" DEFAULT '[]'::"json" NOT NULL
);


ALTER TABLE "public"."recent_items" OWNER TO "postgres";


ALTER TABLE ONLY "public"."anime_lists"
    ADD CONSTRAINT "anime_lists_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."anime_lists"
    ADD CONSTRAINT "anime_lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_recommendations"
    ADD CONSTRAINT "item_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_reviews"
    ADD CONSTRAINT "item_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recent_items"
    ADD CONSTRAINT "recent_items_id_key" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."recent_items"
    ADD CONSTRAINT "recent_items_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_account_name_key" UNIQUE ("account_name");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "profiles_fts" ON "public"."profiles" USING "gin" ("fts");



CREATE OR REPLACE TRIGGER "create_recents_trigger" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_recents_row_for_profile"();



ALTER TABLE ONLY "public"."anime_lists"
    ADD CONSTRAINT "anime_lists_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."item_recommendations"
    ADD CONSTRAINT "item_recommendations_recommended_by_fkey" FOREIGN KEY ("recommended_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."item_reviews"
    ADD CONSTRAINT "item_reviews_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."recent_items"
    ADD CONSTRAINT "recent_items_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Allow delete for authenticated users and own review" ON "public"."item_reviews" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Allow delete for only rows created by same user" ON "public"."item_recommendations" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "recommended_by"));



CREATE POLICY "Allow update permission for authenticated users only" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Allow updates on reviews made by the user only" ON "public"."item_reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Enable auth users to read all their created lists" ON "public"."anime_lists" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "creator_id") OR ("is_public" = true)));



CREATE POLICY "Enable delete for users based on creator_id" ON "public"."anime_lists" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Enable delete for users based on creator_id" ON "public"."discussions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Enable delete for users based on id" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."anime_lists" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."discussions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."item_recommendations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."item_reviews" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."recent_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."discussions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."item_reviews" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for anon users only for public lists" ON "public"."anime_lists" FOR SELECT TO "anon" USING (("is_public" = true));



CREATE POLICY "Enable read access for auth users only and on their own row" ON "public"."recent_items" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Enable read access for authenticated users only" ON "public"."item_recommendations" FOR SELECT USING (true);



CREATE POLICY "Enable update for users based on creator_id" ON "public"."anime_lists" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Enable update for users based on creator_id" ON "public"."discussions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Enable update for users based on email" ON "public"."recent_items" FOR UPDATE USING (("auth"."uid"() = "profile_id")) WITH CHECK (("auth"."uid"() = "profile_id"));



CREATE POLICY "Enable update for users based on id" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Prevent any updates" ON "public"."item_recommendations" FOR UPDATE USING (false) WITH CHECK (false);



ALTER TABLE "public"."anime_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discussions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."item_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."item_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recent_items" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."comments";



REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































































































































GRANT ALL ON FUNCTION "public"."create_recents_row_for_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_recents_row_for_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_recents_row_for_profile"() TO "service_role";



GRANT ALL ON TABLE "public"."item_reviews" TO "anon";
GRANT ALL ON TABLE "public"."item_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."item_reviews" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer) TO "service_role";



GRANT ALL ON TABLE "public"."anime_lists" TO "anon";
GRANT ALL ON TABLE "public"."anime_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."anime_lists" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_saved_lists"("acct_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_saved_lists"("acct_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_saved_lists"("acct_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON FUNCTION "public"."search_user"("phrase" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."search_user"("phrase" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_user"("phrase" character varying) TO "service_role";



REVOKE ALL ON FUNCTION "public"."toggle_comment_upvote"("comment_id" "uuid", "profile_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."toggle_comment_upvote"("comment_id" "uuid", "profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_comment_upvote"("comment_id" "uuid", "profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_review_upvote"("review_id" "uuid", "profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_review_upvote"("review_id" "uuid", "profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_review_upvote"("review_id" "uuid", "profile_id" "uuid") TO "service_role";















GRANT ALL ON SEQUENCE "public"."anime_lists_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."anime_lists_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."anime_lists_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_index_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_index_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_index_seq" TO "service_role";



GRANT ALL ON TABLE "public"."discussions" TO "anon";
GRANT ALL ON TABLE "public"."discussions" TO "authenticated";
GRANT ALL ON TABLE "public"."discussions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."discussions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."discussions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."discussions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."item_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."item_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."item_recommendations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."item_reviews_index_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."item_reviews_index_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."item_reviews_index_seq" TO "service_role";



GRANT ALL ON TABLE "public"."recent_items" TO "anon";
GRANT ALL ON TABLE "public"."recent_items" TO "authenticated";
GRANT ALL ON TABLE "public"."recent_items" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
