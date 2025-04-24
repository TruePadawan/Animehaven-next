alter table "public"."profiles" alter column "saved_lists" drop default;
alter table "public"."profiles" alter column "saved_lists" type bigint[] using array[]::bigint[];
alter table "public"."profiles" alter column "saved_lists" set default '{}'::bigint[];
