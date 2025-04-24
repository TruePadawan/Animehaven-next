alter table "public"."profiles" alter column "saved_lists" drop default;
alter table "public"."profiles" alter column "saved_lists" type bigint[] using array[]::bigint[];