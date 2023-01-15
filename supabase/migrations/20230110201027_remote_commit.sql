--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 15.1 (Debian 15.1-1.pgdg110+1)

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

--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA "public" OWNER TO "postgres";

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: create_recents_row_for_profile(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."create_recents_row_for_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.recent_items(profile_id) values(new.id);
  return new;
end;$$;


ALTER FUNCTION "public"."create_recents_row_for_profile"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: item_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."item_reviews" (
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

--
-- Name: get_item_reviews(character varying, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer DEFAULT 0) RETURNS SETOF "public"."item_reviews"
    LANGUAGE "plpgsql"
    AS $$
    begin    
        return query select * from item_reviews where item_reviews.item_id = itemid
        order by array_length(item_reviews.upvoted_by, 1) limit n_reviews offset start_after;
    end;
$$;


ALTER FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer) OWNER TO "postgres";

--
-- Name: anime_lists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."anime_lists" (
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

--
-- Name: get_saved_lists(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."get_saved_lists"("acct_name" character varying) RETURNS SETOF "public"."anime_lists"
    LANGUAGE "plpgsql"
    AS $$
  declare
    list_ids int8[] = (select profiles.saved_lists from profiles where account_name = acct_name);
  begin
    return query select * from anime_lists where id = any (list_ids);
  end;
$$;


ALTER FUNCTION "public"."get_saved_lists"("acct_name" character varying) OWNER TO "postgres";

--
-- Name: search_list(character varying, "uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid" DEFAULT NULL::"uuid") RETURNS SETOF "public"."anime_lists"
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

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."profiles" (
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

--
-- Name: search_user(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION "public"."search_user"("phrase" character varying) RETURNS SETOF "public"."profiles"
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

--
-- Name: anime_lists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."anime_lists" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."anime_lists_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."comments" (
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

--
-- Name: comments_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."comments" ALTER COLUMN "index" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."comments_index_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: discussions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."discussions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "title" character varying NOT NULL,
    "body" "text" NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "comment_instance_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tag" character varying NOT NULL
);


ALTER TABLE "public"."discussions" OWNER TO "postgres";

--
-- Name: discussions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."discussions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."discussions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: item_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."item_recommendations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" character varying NOT NULL,
    "recommended_by" "uuid" NOT NULL
);


ALTER TABLE "public"."item_recommendations" OWNER TO "postgres";

--
-- Name: item_reviews_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE "public"."item_reviews" ALTER COLUMN "index" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."item_reviews_index_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recent_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."recent_items" (
    "profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "discussions" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    "lists" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    "animes" "json" DEFAULT '[]'::"json" NOT NULL
);


ALTER TABLE "public"."recent_items" OWNER TO "postgres";

--
-- Name: anime_lists anime_lists_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."anime_lists"
    ADD CONSTRAINT "anime_lists_id_key" UNIQUE ("id");


--
-- Name: anime_lists anime_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."anime_lists"
    ADD CONSTRAINT "anime_lists_pkey" PRIMARY KEY ("id");


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");


--
-- Name: discussions discussions_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_id_key" UNIQUE ("id");


--
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_pkey" PRIMARY KEY ("id");


--
-- Name: item_recommendations item_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."item_recommendations"
    ADD CONSTRAINT "item_recommendations_pkey" PRIMARY KEY ("id");


--
-- Name: item_reviews item_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."item_reviews"
    ADD CONSTRAINT "item_reviews_pkey" PRIMARY KEY ("id");


--
-- Name: recent_items recent_items_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."recent_items"
    ADD CONSTRAINT "recent_items_id_key" UNIQUE ("profile_id");


--
-- Name: recent_items recent_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."recent_items"
    ADD CONSTRAINT "recent_items_pkey" PRIMARY KEY ("profile_id");


--
-- Name: profiles users_account_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_account_name_key" UNIQUE ("account_name");


--
-- Name: profiles users_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_id_key" UNIQUE ("id");


--
-- Name: profiles users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: profiles_fts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "profiles_fts" ON "public"."profiles" USING "gin" ("fts");


--
-- Name: profiles create_recents_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER "create_recents_trigger" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_recents_row_for_profile"();


--
-- Name: anime_lists anime_lists_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."anime_lists"
    ADD CONSTRAINT "anime_lists_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");


--
-- Name: comments comments_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");


--
-- Name: discussions discussions_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."discussions"
    ADD CONSTRAINT "discussions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");


--
-- Name: item_recommendations item_recommendations_recommended_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."item_recommendations"
    ADD CONSTRAINT "item_recommendations_recommended_by_fkey" FOREIGN KEY ("recommended_by") REFERENCES "public"."profiles"("id");


--
-- Name: item_reviews item_reviews_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."item_reviews"
    ADD CONSTRAINT "item_reviews_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");


--
-- Name: profiles profiles_email_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_fkey" FOREIGN KEY ("email") REFERENCES "auth"."users"("email");


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");


--
-- Name: recent_items recent_items_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."recent_items"
    ADD CONSTRAINT "recent_items_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");


--
-- Name: item_reviews Allow delete for authenticated users and own review; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow delete for authenticated users and own review" ON "public"."item_reviews" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));


--
-- Name: item_recommendations Allow delete for only rows created by same user; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow delete for only rows created by same user" ON "public"."item_recommendations" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "recommended_by"));


--
-- Name: item_reviews Allow updates on reviews made by the user only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow updates on reviews made by the user only" ON "public"."item_reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));


--
-- Name: anime_lists Enable auth users to read all their created lists; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable auth users to read all their created lists" ON "public"."anime_lists" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "creator_id") OR ("is_public" = true)));


--
-- Name: anime_lists Enable delete for users based on creator_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on creator_id" ON "public"."anime_lists" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));


--
-- Name: discussions Enable delete for users based on creator_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on creator_id" ON "public"."discussions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));


--
-- Name: profiles Enable delete for users based on id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on id" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));


--
-- Name: comments Enable delete for users based on user_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for users based on user_id" ON "public"."comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));


--
-- Name: anime_lists Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."anime_lists" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: comments Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: discussions Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."discussions" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: item_recommendations Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."item_recommendations" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: item_reviews Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."item_reviews" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: profiles Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: recent_items Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON "public"."recent_items" FOR INSERT TO "authenticated" WITH CHECK (true);


--
-- Name: comments Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."comments" FOR SELECT USING (true);


--
-- Name: discussions Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."discussions" FOR SELECT USING (true);


--
-- Name: item_reviews Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."item_reviews" FOR SELECT USING (true);


--
-- Name: profiles Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);


--
-- Name: anime_lists Enable read access for anon users only for public lists; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for anon users only for public lists" ON "public"."anime_lists" FOR SELECT TO "anon" USING (("is_public" = true));


--
-- Name: recent_items Enable read access for auth users only and on their own row; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for auth users only and on their own row" ON "public"."recent_items" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "profile_id"));


--
-- Name: item_recommendations Enable read access for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for authenticated users only" ON "public"."item_recommendations" FOR SELECT USING (true);


--
-- Name: comments Enable update for auth users and only on their own comments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for auth users and only on their own comments" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));


--
-- Name: anime_lists Enable update for users based on creator_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on creator_id" ON "public"."anime_lists" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));


--
-- Name: discussions Enable update for users based on creator_id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on creator_id" ON "public"."discussions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id")) WITH CHECK (("auth"."uid"() = "creator_id"));


--
-- Name: recent_items Enable update for users based on email; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on email" ON "public"."recent_items" FOR UPDATE USING (("auth"."uid"() = "profile_id")) WITH CHECK (("auth"."uid"() = "profile_id"));


--
-- Name: profiles Enable update for users based on id; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for users based on id" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: item_recommendations Prevent any updates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Prevent any updates" ON "public"."item_recommendations" FOR UPDATE USING (false) WITH CHECK (false);


--
-- Name: anime_lists; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."anime_lists" ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

--
-- Name: discussions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."discussions" ENABLE ROW LEVEL SECURITY;

--
-- Name: item_recommendations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."item_recommendations" ENABLE ROW LEVEL SECURITY;

--
-- Name: item_reviews; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."item_reviews" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: recent_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."recent_items" ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea", "text"[], "text"[]); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "dashboard_user";


--
-- Name: FUNCTION "crypt"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "dearmor"("text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_bytes"(integer); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_uuid"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text", integer); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "dashboard_user";


--
-- Name: FUNCTION "pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_key_id"("bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "sign"("payload" "json", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "try_cast_double"("inp" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_decode"("data" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_encode"("data" "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1mc"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v3"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v4"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v5"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_nil"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_dns"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_oid"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_url"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_x500"(); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "dashboard_user";


--
-- Name: FUNCTION "verify"("token" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "comment_directive"("comment_" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "service_role";


--
-- Name: FUNCTION "exception"("message" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "service_role";


--
-- Name: FUNCTION "get_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "service_role";


--
-- Name: FUNCTION "increment_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "service_role";


--
-- Name: FUNCTION "graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb"); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "anon";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "service_role";


--
-- Name: SEQUENCE "key_key_id_seq"; Type: ACL; Schema: pgsodium; Owner: postgres
--

GRANT ALL ON SEQUENCE "pgsodium"."key_key_id_seq" TO "pgsodium_keyiduser";


--
-- Name: FUNCTION "create_recents_row_for_profile"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."create_recents_row_for_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_recents_row_for_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_recents_row_for_profile"() TO "service_role";


--
-- Name: TABLE "item_reviews"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."item_reviews" TO "anon";
GRANT ALL ON TABLE "public"."item_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."item_reviews" TO "service_role";


--
-- Name: FUNCTION "get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_item_reviews"("itemid" character varying, "n_reviews" integer, "start_after" integer) TO "service_role";


--
-- Name: TABLE "anime_lists"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."anime_lists" TO "anon";
GRANT ALL ON TABLE "public"."anime_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."anime_lists" TO "service_role";


--
-- Name: FUNCTION "get_saved_lists"("acct_name" character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."get_saved_lists"("acct_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_saved_lists"("acct_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_saved_lists"("acct_name" character varying) TO "service_role";


--
-- Name: FUNCTION "search_list"("phrase" character varying, "profile_id" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_list"("phrase" character varying, "profile_id" "uuid") TO "service_role";


--
-- Name: TABLE "profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";


--
-- Name: FUNCTION "search_user"("phrase" character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."search_user"("phrase" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."search_user"("phrase" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_user"("phrase" character varying) TO "service_role";


--
-- Name: TABLE "pg_stat_statements"; Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "dashboard_user";


--
-- Name: TABLE "pg_stat_statements_info"; Type: ACL; Schema: extensions; Owner: postgres
--

GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "dashboard_user";


--
-- Name: SEQUENCE "seq_schema_version"; Type: ACL; Schema: graphql; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "postgres";
GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "anon";
GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "authenticated";
GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "service_role";


--
-- Name: TABLE "valid_key"; Type: ACL; Schema: pgsodium; Owner: postgres
--

GRANT ALL ON TABLE "pgsodium"."valid_key" TO "pgsodium_keyiduser";


--
-- Name: SEQUENCE "anime_lists_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."anime_lists_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."anime_lists_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."anime_lists_id_seq" TO "service_role";


--
-- Name: TABLE "comments"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";


--
-- Name: SEQUENCE "comments_index_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."comments_index_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_index_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_index_seq" TO "service_role";


--
-- Name: TABLE "discussions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."discussions" TO "anon";
GRANT ALL ON TABLE "public"."discussions" TO "authenticated";
GRANT ALL ON TABLE "public"."discussions" TO "service_role";


--
-- Name: SEQUENCE "discussions_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."discussions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."discussions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."discussions_id_seq" TO "service_role";


--
-- Name: TABLE "item_recommendations"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."item_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."item_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."item_recommendations" TO "service_role";


--
-- Name: SEQUENCE "item_reviews_index_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."item_reviews_index_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."item_reviews_index_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."item_reviews_index_seq" TO "service_role";


--
-- Name: TABLE "recent_items"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."recent_items" TO "anon";
GRANT ALL ON TABLE "public"."recent_items" TO "authenticated";
GRANT ALL ON TABLE "public"."recent_items" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- PostgreSQL database dump complete
--

RESET ALL;
