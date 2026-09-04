


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."classroom_level" AS ENUM (
    'I0',
    'I1',
    'I2'
);


ALTER TYPE "public"."classroom_level" OWNER TO "postgres";


CREATE TYPE "public"."diaper_type" AS ENUM (
    'pee',
    'poo',
    'both',
    'dry'
);


ALTER TYPE "public"."diaper_type" OWNER TO "postgres";


CREATE TYPE "public"."event_audience" AS ENUM (
    'school',
    'classroom',
    'individual',
    'staff'
);


ALTER TYPE "public"."event_audience" OWNER TO "postgres";


CREATE TYPE "public"."event_type" AS ENUM (
    'event',
    'announcement',
    'alert'
);


ALTER TYPE "public"."event_type" OWNER TO "postgres";


CREATE TYPE "public"."guardian_relation" AS ENUM (
    'mother',
    'father',
    'tutor',
    'other'
);


ALTER TYPE "public"."guardian_relation" OWNER TO "postgres";


CREATE TYPE "public"."meal_amount" AS ENUM (
    'all',
    'most',
    'little',
    'none'
);


ALTER TYPE "public"."meal_amount" OWNER TO "postgres";


CREATE TYPE "public"."mood" AS ENUM (
    'happy',
    'calm',
    'sad',
    'irritable'
);


ALTER TYPE "public"."mood" OWNER TO "postgres";


CREATE TYPE "public"."record_status" AS ENUM (
    'active',
    'inactive',
    'paused'
);


ALTER TYPE "public"."record_status" OWNER TO "postgres";


CREATE TYPE "public"."staff_attendance_status" AS ENUM (
    'present',
    'absent',
    'sick',
    'holiday'
);


ALTER TYPE "public"."staff_attendance_status" OWNER TO "postgres";


CREATE TYPE "public"."student_gender" AS ENUM (
    'boy',
    'girl',
    'other'
);


ALTER TYPE "public"."student_gender" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'teacher',
    'guardian'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_user_password"("p_user_id" "uuid", "p_password" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'extensions'
    AS $_$
DECLARE
  v_email text;
BEGIN
  IF p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password massa curt';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Usuari Auth no trobat: %', p_user_id;
  END IF;

  UPDATE auth.users
  SET
    encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    email_change = '',
    email_change_token_new = '',
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    updated_at = now()
  WHERE id = p_user_id;

  UPDATE auth.identities
  SET
    identity_data = COALESCE(identity_data, '{}'::jsonb) || jsonb_build_object(
      'sub', p_user_id::text,
      'email', lower(v_email),
      'email_verified', true
    ),
    provider_id = CASE
      WHEN provider_id ~* '^[0-9a-f-]{36}$' THEN lower(v_email)
      ELSE provider_id
    END,
    updated_at = now()
  WHERE user_id = p_user_id
    AND provider = 'email';
END;
$_$;


ALTER FUNCTION "public"."admin_set_user_password"("p_user_id" "uuid", "p_password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auth_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$;


ALTER FUNCTION "public"."auth_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auth_school_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_school_id UUID;
BEGIN
  SELECT school_id INTO v_school_id FROM public.profiles WHERE id = auth.uid();
  RETURN v_school_id;
END;
$$;


ALTER FUNCTION "public"."auth_school_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_guardian_user"("p_email" "text", "p_full_name" "text", "p_phone" "text", "p_school_id" "uuid", "p_password" "text" DEFAULT '123456'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    is_anonymous, is_super_admin
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    p_email, extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'guardian'),
    jsonb_build_object('full_name', p_full_name, 'email', p_email, 'email_verified', true),
    now(), now(), NULL, '', '', '', '', false, false
  )
  RETURNING id INTO new_user_id;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (new_user_id, new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', p_email, 'email_verified', true), 'email', new_user_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset)
  VALUES (new_user_id, p_school_id, 'guardian', p_full_name, p_email, p_phone, 'active', true);

  RETURN new_user_id;
END;
$$;


ALTER FUNCTION "public"."create_guardian_user"("p_email" "text", "p_full_name" "text", "p_phone" "text", "p_school_id" "uuid", "p_password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_staff_user"("p_email" "text", "p_full_name" "text", "p_role" "text", "p_password" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'extensions'
    AS $$
DECLARE
  v_user_id UUID;
  v_school_id UUID;
  v_admin_role TEXT;
BEGIN
  SELECT school_id INTO v_school_id FROM public.profiles WHERE id = auth.uid();
  SELECT role::text INTO v_admin_role FROM public.profiles WHERE id = auth.uid();

  IF v_admin_role != 'admin' OR v_school_id IS NULL THEN
    RAISE EXCEPTION 'Only admins can create staff users';
  END IF;

  IF p_role NOT IN ('admin', 'teacher', 'auxiliary') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, teacher or auxiliary';
  END IF;

  v_user_id := extensions.uuid_generate_v4();

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', p_full_name),
    'authenticated',
    'authenticated',
    false,
    now(),
    now()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email, 'email_verified', true),
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  INSERT INTO public.profiles (id, school_id, role, full_name, email, status)
  VALUES (v_user_id, v_school_id, p_role, p_full_name, p_email, 'active');

  RETURN v_user_id;
END;
$$;


ALTER FUNCTION "public"."create_staff_user"("p_email" "text", "p_full_name" "text", "p_role" "text", "p_password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_my_student"("p_student_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.student_guardians
    WHERE guardian_id = auth.uid()
      AND student_id = p_student_id
  );
END;
$$;


ALTER FUNCTION "public"."is_my_student"("p_student_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff_of_student"("p_student_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_school_id UUID;
  v_auth_school UUID;
  v_auth_role TEXT;
BEGIN
  SELECT school_id INTO v_school_id FROM students WHERE id = p_student_id;
  SELECT school_id INTO v_auth_school FROM profiles WHERE id = auth.uid();
  SELECT role::text INTO v_auth_role FROM profiles WHERE id = auth.uid();
  
  RETURN (v_school_id = v_auth_school AND v_auth_role IN ('admin', 'teacher'));
END;
$$;


ALTER FUNCTION "public"."is_staff_of_student"("p_student_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "school_id" "uuid",
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."classroom_daily_notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "classroom_id" "uuid" NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "note" "text",
    "photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."classroom_daily_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."classrooms" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "level" "public"."classroom_level" NOT NULL,
    "teacher_id" "uuid",
    "capacity" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "auxiliary_teacher_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "status" "public"."record_status" DEFAULT 'active'::"public"."record_status" NOT NULL
);


ALTER TABLE "public"."classrooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "school_id" "uuid" NOT NULL,
    "classroom_id" "uuid" NOT NULL,
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "mood" "public"."mood",
    "meal_breakfast" "public"."meal_amount",
    "meal_lunch" "public"."meal_amount",
    "meal_snack" "public"."meal_amount",
    "diaper_type" "text",
    "diaper_changes" integer DEFAULT 0 NOT NULL,
    "nap_start" time without time zone,
    "nap_end" time without time zone,
    "photos" "text"[] DEFAULT '{}'::"text"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."daily_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dining_menus" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "title" "text",
    "description" "text",
    "file_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "dining_menus_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."dining_menus" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events_announcements" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "classroom_id" "uuid",
    "author_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "event_type" "public"."event_type" DEFAULT 'announcement'::"public"."event_type" NOT NULL,
    "audience" "public"."event_audience" DEFAULT 'school'::"public"."event_audience" NOT NULL,
    "event_date" "date",
    "is_pinned" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events_announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "student_id" "uuid",
    "content" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "school_id" "uuid",
    "role" "text" DEFAULT 'guardian'::"public"."user_role" NOT NULL,
    "full_name" "text" NOT NULL,
    "avatar_url" "text",
    "email" "text" NOT NULL,
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."record_status" DEFAULT 'active'::"public"."record_status" NOT NULL,
    "force_password_reset" boolean DEFAULT false NOT NULL,
    "welcome_email_sent" boolean DEFAULT false NOT NULL,
    CONSTRAINT "profiles_status_check" CHECK (("status" = ANY (ARRAY['active'::"public"."record_status", 'paused'::"public"."record_status", 'inactive'::"public"."record_status"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."school_billing_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "monthly_price" numeric(12,2) NOT NULL,
    "effective_from" "date" DEFAULT CURRENT_DATE NOT NULL,
    "reason" "text",
    "actor_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."school_billing_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."school_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "doc_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text",
    "signed_at" "date",
    "expires_at" "date",
    "notes" "text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "school_documents_doc_type_check" CHECK (("doc_type" = ANY (ARRAY['contract'::"text", 'nda'::"text", 'amendment'::"text", 'proposal'::"text", 'invoice_scan'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."school_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."school_invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "due_date" "date",
    "paid_at" timestamp with time zone,
    "reference" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "school_invoices_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending'::"text", 'sent'::"text", 'paid'::"text", 'overdue'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."school_invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "address" "text",
    "phone" "text",
    "email" "text",
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "cif" "text",
    "contact_email" "text"
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff_attendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "staff_id" "uuid" NOT NULL,
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "status" "public"."staff_attendance_status" DEFAULT 'present'::"public"."staff_attendance_status" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."staff_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_guardians" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "guardian_id" "uuid" NOT NULL,
    "relation" "public"."guardian_relation" DEFAULT 'tutor'::"public"."guardian_relation" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."student_guardians" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "school_id" "uuid" NOT NULL,
    "classroom_id" "uuid",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "date_of_birth" "date" NOT NULL,
    "avatar_url" "text",
    "allergies" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "gender" "public"."student_gender",
    "intolerances" "text",
    "authorized_pickup" "text",
    "parents_phone" "text",
    "internal_notes" "text",
    "alias" "text",
    "status" "public"."record_status" DEFAULT 'active'::"public"."record_status" NOT NULL
);


ALTER TABLE "public"."students" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classroom_daily_notes"
    ADD CONSTRAINT "classroom_daily_notes_classroom_id_date_key" UNIQUE ("classroom_id", "date");



ALTER TABLE ONLY "public"."classroom_daily_notes"
    ADD CONSTRAINT "classroom_daily_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classrooms"
    ADD CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classrooms"
    ADD CONSTRAINT "classrooms_school_id_name_key" UNIQUE ("school_id", "name");



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_student_id_date_key" UNIQUE ("student_id", "date");



ALTER TABLE ONLY "public"."dining_menus"
    ADD CONSTRAINT "dining_menus_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dining_menus"
    ADD CONSTRAINT "dining_menus_school_id_month_year_key" UNIQUE ("school_id", "month", "year");



ALTER TABLE ONLY "public"."events_announcements"
    ADD CONSTRAINT "events_announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_billing_events"
    ADD CONSTRAINT "school_billing_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_documents"
    ADD CONSTRAINT "school_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."school_invoices"
    ADD CONSTRAINT "school_invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."staff_attendance"
    ADD CONSTRAINT "staff_attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_attendance"
    ADD CONSTRAINT "staff_attendance_staff_id_date_key" UNIQUE ("staff_id", "date");



ALTER TABLE ONLY "public"."student_guardians"
    ADD CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_guardians"
    ADD CONSTRAINT "student_guardians_student_id_guardian_id_key" UNIQUE ("student_id", "guardian_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_action_created_idx" ON "public"."audit_logs" USING "btree" ("action", "created_at" DESC);



CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "audit_logs_actor_id_idx" ON "public"."audit_logs" USING "btree" ("actor_id");



CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "audit_logs_school_id_idx" ON "public"."audit_logs" USING "btree" ("school_id");



CREATE INDEX "idx_classrooms_school" ON "public"."classrooms" USING "btree" ("school_id");



CREATE INDEX "idx_classrooms_teacher" ON "public"."classrooms" USING "btree" ("teacher_id");



CREATE INDEX "idx_daily_logs_classroom_date" ON "public"."daily_logs" USING "btree" ("classroom_id", "date" DESC);



CREATE INDEX "idx_daily_logs_date" ON "public"."daily_logs" USING "btree" ("date" DESC);



CREATE INDEX "idx_daily_logs_school" ON "public"."daily_logs" USING "btree" ("school_id");



CREATE INDEX "idx_daily_logs_student_date" ON "public"."daily_logs" USING "btree" ("student_id", "date" DESC);



CREATE INDEX "idx_dining_menus_school" ON "public"."dining_menus" USING "btree" ("school_id");



CREATE INDEX "idx_events_classroom" ON "public"."events_announcements" USING "btree" ("classroom_id");



CREATE INDEX "idx_events_date" ON "public"."events_announcements" USING "btree" ("event_date" DESC);



CREATE INDEX "idx_events_school" ON "public"."events_announcements" USING "btree" ("school_id");



CREATE INDEX "idx_messages_receiver" ON "public"."messages" USING "btree" ("receiver_id");



CREATE INDEX "idx_messages_school" ON "public"."messages" USING "btree" ("school_id");



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_messages_student" ON "public"."messages" USING "btree" ("student_id");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("school_id", "role");



CREATE INDEX "idx_profiles_school" ON "public"."profiles" USING "btree" ("school_id");



CREATE INDEX "idx_schools_slug" ON "public"."schools" USING "btree" ("slug");



CREATE INDEX "idx_staff_attendance_date" ON "public"."staff_attendance" USING "btree" ("date" DESC);



CREATE INDEX "idx_staff_attendance_school" ON "public"."staff_attendance" USING "btree" ("school_id");



CREATE INDEX "idx_student_guardians_guardian" ON "public"."student_guardians" USING "btree" ("guardian_id");



CREATE INDEX "idx_student_guardians_student" ON "public"."student_guardians" USING "btree" ("student_id");



CREATE INDEX "idx_students_classroom" ON "public"."students" USING "btree" ("classroom_id");



CREATE INDEX "idx_students_school" ON "public"."students" USING "btree" ("school_id");



CREATE INDEX "school_billing_events_school_id_idx" ON "public"."school_billing_events" USING "btree" ("school_id");



CREATE INDEX "school_documents_school_id_idx" ON "public"."school_documents" USING "btree" ("school_id");



CREATE INDEX "school_invoices_due_date_idx" ON "public"."school_invoices" USING "btree" ("due_date");



CREATE INDEX "school_invoices_school_id_idx" ON "public"."school_invoices" USING "btree" ("school_id");



CREATE INDEX "school_invoices_status_idx" ON "public"."school_invoices" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "set_daily_logs_updated_at" BEFORE UPDATE ON "public"."daily_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "set_staff_attendance_updated_at" BEFORE UPDATE ON "public"."staff_attendance" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."classroom_daily_notes"
    ADD CONSTRAINT "classroom_daily_notes_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."classroom_daily_notes"
    ADD CONSTRAINT "classroom_daily_notes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."classroom_daily_notes"
    ADD CONSTRAINT "classroom_daily_notes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."classrooms"
    ADD CONSTRAINT "classrooms_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."classrooms"
    ADD CONSTRAINT "classrooms_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_logs"
    ADD CONSTRAINT "daily_logs_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."dining_menus"
    ADD CONSTRAINT "dining_menus_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events_announcements"
    ADD CONSTRAINT "events_announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."events_announcements"
    ADD CONSTRAINT "events_announcements_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events_announcements"
    ADD CONSTRAINT "events_announcements_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_billing_events"
    ADD CONSTRAINT "school_billing_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."school_billing_events"
    ADD CONSTRAINT "school_billing_events_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_documents"
    ADD CONSTRAINT "school_documents_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."school_documents"
    ADD CONSTRAINT "school_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."school_invoices"
    ADD CONSTRAINT "school_invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."school_invoices"
    ADD CONSTRAINT "school_invoices_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff_attendance"
    ADD CONSTRAINT "staff_attendance_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff_attendance"
    ADD CONSTRAINT "staff_attendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_guardians"
    ADD CONSTRAINT "student_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_guardians"
    ADD CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_logs_service_only" ON "public"."audit_logs" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."classroom_daily_notes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "classroom_daily_notes_select_guardian" ON "public"."classroom_daily_notes" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."student_guardians" "sg"
     JOIN "public"."students" "s" ON (("s"."id" = "sg"."student_id")))
  WHERE (("sg"."guardian_id" = "auth"."uid"()) AND ("s"."classroom_id" = "classroom_daily_notes"."classroom_id")))));



CREATE POLICY "classroom_daily_notes_select_staff" ON "public"."classroom_daily_notes" FOR SELECT TO "authenticated" USING (("school_id" IN ( SELECT "p"."school_id"
   FROM "public"."profiles" "p"
  WHERE ("p"."id" = "auth"."uid"()))));



ALTER TABLE "public"."classrooms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "classrooms_modify_admin" ON "public"."classrooms" TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text"))) WITH CHECK ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text")));



CREATE POLICY "classrooms_select_school" ON "public"."classrooms" FOR SELECT TO "authenticated" USING (("school_id" = "public"."auth_school_id"()));



ALTER TABLE "public"."daily_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "daily_logs_delete_admin" ON "public"."daily_logs" FOR DELETE TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text")));



CREATE POLICY "daily_logs_insert_teacher" ON "public"."daily_logs" FOR INSERT TO "authenticated" WITH CHECK ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"])) AND ("teacher_id" = "auth"."uid"())));



CREATE POLICY "daily_logs_select_guardian" ON "public"."daily_logs" FOR SELECT TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'guardian'::"text") AND ("student_id" IN ( SELECT "student_guardians"."student_id"
   FROM "public"."student_guardians"
  WHERE ("student_guardians"."guardian_id" = "auth"."uid"())))));



CREATE POLICY "daily_logs_select_staff" ON "public"."daily_logs" FOR SELECT TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"]))));



CREATE POLICY "daily_logs_update_teacher" ON "public"."daily_logs" FOR UPDATE TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"])))) WITH CHECK ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"]))));



ALTER TABLE "public"."dining_menus" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dining_menus_modify_admin" ON "public"."dining_menus" TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text"))) WITH CHECK ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text")));



CREATE POLICY "dining_menus_select_school" ON "public"."dining_menus" FOR SELECT TO "authenticated" USING (("school_id" = "public"."auth_school_id"()));



ALTER TABLE "public"."events_announcements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_modify_staff" ON "public"."events_announcements" TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"])))) WITH CHECK ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"]))));



CREATE POLICY "events_select_school" ON "public"."events_announcements" FOR SELECT TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND (("audience" = 'school'::"public"."event_audience") OR (("audience" = 'classroom'::"public"."event_audience") AND ("classroom_id" IN ( SELECT "classrooms"."id"
   FROM "public"."classrooms"
  WHERE ("classrooms"."school_id" = "public"."auth_school_id"())))))));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_insert" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK (("sender_id" = "auth"."uid"()));



CREATE POLICY "messages_select" ON "public"."messages" FOR SELECT TO "authenticated" USING ((("sender_id" = "auth"."uid"()) OR ("receiver_id" = "auth"."uid"())));



CREATE POLICY "messages_update" ON "public"."messages" FOR UPDATE TO "authenticated" USING (("receiver_id" = "auth"."uid"())) WITH CHECK (("receiver_id" = "auth"."uid"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_admin" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text")));



CREATE POLICY "profiles_select_admin" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text")));



CREATE POLICY "profiles_select_guardian" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) AND ("public"."auth_role"() = 'guardian'::"text")));



CREATE POLICY "profiles_select_self" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR (COALESCE((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text"), ''::"text") = 'superadmin'::"text")));



CREATE POLICY "profiles_select_teacher" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND (("id" = "auth"."uid"()) OR ("public"."auth_role"() = 'teacher'::"text"))));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."school_billing_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "school_billing_events_service" ON "public"."school_billing_events" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."school_documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "school_documents_service" ON "public"."school_documents" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."school_invoices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "school_invoices_service" ON "public"."school_invoices" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "school_select_own" ON "public"."schools" FOR SELECT TO "authenticated" USING (("id" = "public"."auth_school_id"()));



CREATE POLICY "school_update_admin" ON "public"."schools" FOR UPDATE TO "authenticated" USING ((("id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text"))) WITH CHECK ((("id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text")));



ALTER TABLE "public"."schools" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "schools_select_member" ON "public"."schools" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "p"."school_id"
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."school_id" IS NOT NULL)))));



ALTER TABLE "public"."staff_attendance" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "staff_attendance_admin_all" ON "public"."staff_attendance" TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text"))) WITH CHECK ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text")));



CREATE POLICY "staff_attendance_staff_select" ON "public"."staff_attendance" FOR SELECT TO "authenticated" USING (("staff_id" = "auth"."uid"()));



ALTER TABLE "public"."student_guardians" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "student_guardians_modify_admin" ON "public"."student_guardians" TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."students" "s"
  WHERE (("s"."id" = "student_guardians"."student_id") AND ("s"."school_id" = "public"."auth_school_id"())))) AND ("public"."auth_role"() = 'admin'::"text"))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."students" "s"
  WHERE (("s"."id" = "student_guardians"."student_id") AND ("s"."school_id" = "public"."auth_school_id"())))) AND ("public"."auth_role"() = 'admin'::"text")));



CREATE POLICY "student_guardians_select_guardian" ON "public"."student_guardians" FOR SELECT TO "authenticated" USING (("guardian_id" = "auth"."uid"()));



CREATE POLICY "student_guardians_select_own" ON "public"."student_guardians" FOR SELECT TO "authenticated" USING (("guardian_id" = "auth"."uid"()));



CREATE POLICY "student_guardians_select_staff" ON "public"."student_guardians" FOR SELECT TO "authenticated" USING ((("public"."auth_role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"])) AND "public"."is_staff_of_student"("student_id")));



ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "students_modify_admin" ON "public"."students" TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text"))) WITH CHECK ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'admin'::"text")));



CREATE POLICY "students_select_guardian" ON "public"."students" FOR SELECT TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = 'guardian'::"text") AND "public"."is_my_student"("id")));



CREATE POLICY "students_select_staff" ON "public"."students" FOR SELECT TO "authenticated" USING ((("school_id" = "public"."auth_school_id"()) AND ("public"."auth_role"() = ANY (ARRAY['admin'::"text", 'teacher'::"text"]))));



CREATE POLICY "superadmin_read_schools" ON "public"."schools" FOR SELECT TO "authenticated" USING ((COALESCE((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text"), ''::"text") = 'superadmin'::"text"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_set_user_password"("p_user_id" "uuid", "p_password" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_set_user_password"("p_user_id" "uuid", "p_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_set_user_password"("p_user_id" "uuid", "p_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_user_password"("p_user_id" "uuid", "p_password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."auth_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."auth_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auth_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auth_school_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."auth_school_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auth_school_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_guardian_user"("p_email" "text", "p_full_name" "text", "p_phone" "text", "p_school_id" "uuid", "p_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_guardian_user"("p_email" "text", "p_full_name" "text", "p_phone" "text", "p_school_id" "uuid", "p_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_guardian_user"("p_email" "text", "p_full_name" "text", "p_phone" "text", "p_school_id" "uuid", "p_password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_staff_user"("p_email" "text", "p_full_name" "text", "p_role" "text", "p_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_staff_user"("p_email" "text", "p_full_name" "text", "p_role" "text", "p_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_staff_user"("p_email" "text", "p_full_name" "text", "p_role" "text", "p_password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_my_student"("p_student_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_my_student"("p_student_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_my_student"("p_student_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_staff_of_student"("p_student_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff_of_student"("p_student_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff_of_student"("p_student_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."classroom_daily_notes" TO "anon";
GRANT ALL ON TABLE "public"."classroom_daily_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."classroom_daily_notes" TO "service_role";



GRANT ALL ON TABLE "public"."classrooms" TO "anon";
GRANT ALL ON TABLE "public"."classrooms" TO "authenticated";
GRANT ALL ON TABLE "public"."classrooms" TO "service_role";



GRANT ALL ON TABLE "public"."daily_logs" TO "anon";
GRANT ALL ON TABLE "public"."daily_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_logs" TO "service_role";



GRANT ALL ON TABLE "public"."dining_menus" TO "anon";
GRANT ALL ON TABLE "public"."dining_menus" TO "authenticated";
GRANT ALL ON TABLE "public"."dining_menus" TO "service_role";



GRANT ALL ON TABLE "public"."events_announcements" TO "anon";
GRANT ALL ON TABLE "public"."events_announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."events_announcements" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."school_billing_events" TO "anon";
GRANT ALL ON TABLE "public"."school_billing_events" TO "authenticated";
GRANT ALL ON TABLE "public"."school_billing_events" TO "service_role";



GRANT ALL ON TABLE "public"."school_documents" TO "anon";
GRANT ALL ON TABLE "public"."school_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."school_documents" TO "service_role";



GRANT ALL ON TABLE "public"."school_invoices" TO "anon";
GRANT ALL ON TABLE "public"."school_invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."school_invoices" TO "service_role";



GRANT ALL ON TABLE "public"."schools" TO "anon";
GRANT ALL ON TABLE "public"."schools" TO "authenticated";
GRANT ALL ON TABLE "public"."schools" TO "service_role";



GRANT ALL ON TABLE "public"."staff_attendance" TO "anon";
GRANT ALL ON TABLE "public"."staff_attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_attendance" TO "service_role";



GRANT ALL ON TABLE "public"."student_guardians" TO "anon";
GRANT ALL ON TABLE "public"."student_guardians" TO "authenticated";
GRANT ALL ON TABLE "public"."student_guardians" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







