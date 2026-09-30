--
-- PostgreSQL database dump
--

\restrict rMXMgbknsmxcQZt7YaUKJwx1Z7XUSbqIbz8TYSwTofnZ7JovMiI6BMy0YqfQrop

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone',
    'recovery_code'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: disponibilidad_mesa; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.disponibilidad_mesa AS ENUM (
    'Disponible',
    'Reservada',
    'Ocupada'
);


--
-- Name: estado_en_resto; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_en_resto AS ENUM (
    'libre',
    'esperando_mesa',
    'mesa_asignada',
    'sentado',
    'pagando'
);


--
-- Name: estado_general_pedido; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_general_pedido AS ENUM (
    'Pendiente de Confirmación',
    'Rechazado',
    'Confirmado',
    'En Preparación',
    'Listo para Entregar',
    'Entregado',
    'Pagado'
);


--
-- Name: estado_item_producto; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_item_producto AS ENUM (
    'Pendiente',
    'En Preparación',
    'Listo'
);


--
-- Name: tipo_mesa; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_mesa AS ENUM (
    'Estándar',
    'VIP',
    'Movilidad reducida'
);


--
-- Name: tipo_producto; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_producto AS ENUM (
    'Comida',
    'Bebida',
    'Postre'
);


--
-- Name: usuarios_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.usuarios_estado AS ENUM (
    'Pendiente',
    'Activo',
    'Rechazado'
);


--
-- Name: usuarios_rol; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.usuarios_rol AS ENUM (
    'dueño',
    'supervisor',
    'metre',
    'mozo',
    'cocinero',
    'cantinero',
    'cliente registrado',
    'cliente anónimo'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
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


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    -- Normalize selected_columns order so ARRAY['a','b'] and ARRAY['b','a'] are treated
    -- as the same subscription group in apply_rls. Preserve an empty array as '{}'
    -- ("primary keys only") so it stays distinct from NULL ("all columns"); array_agg
    -- over an empty set would otherwise collapse '{}' back to NULL.
    if new.selected_columns is not null then
        new.selected_columns = coalesce(
            (
                select array_agg(c order by c)
                from unnest(new.selected_columns) c
            ),
            '{}'::text[]
        );
    end if;

    return new;
end;
$$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: enforce_bucket_lifecycle_service_role(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_lifecycle_service_role() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog'
    AS $$
BEGIN
  IF current_user::text IS DISTINCT FROM TG_ARGV[0]
     AND (
       OLD.lifecycle_configuration IS DISTINCT FROM NEW.lifecycle_configuration
       OR OLD.lifecycle_configuration_generation IS DISTINCT FROM NEW.lifecycle_configuration_generation
     ) THEN
    -- AFTER runs only after caller RLS has accepted the proposed row. The API
    -- recognizes this specific error after rolling back its permission probe;
    -- direct non-service writes still fail and cannot persist the change.
    RAISE EXCEPTION 'bucket control columns may only be changed by the configured storage service role'
      USING ERRCODE = 'PST01',
            SCHEMA = TG_TABLE_SCHEMA,
            TABLE = TG_TABLE_NAME,
            CONSTRAINT = TG_NAME;
  END IF;

  RETURN NULL;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN p_delimiter <> ''
         AND position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(
        p_key,
        length(p_prefix)
            + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1))
            + length(p_delimiter) - 1
    )
    ELSE NULL
END;
$$;


--
-- Name: get_size_by_bucket(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket(noncurrent_versions text DEFAULT 'include'::text, delete_markers text DEFAULT 'include'::text) RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'include');
    delete_markers := COALESCE(delete_markers, 'include');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'include';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'include';
    END IF;

    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        where (noncurrent_versions != 'exclude' OR obj.archived_at IS NULL)
          and (noncurrent_versions != 'only' OR obj.archived_at IS NOT NULL)
          and (delete_markers != 'exclude' OR NOT obj.is_delete_marker)
          and (delete_markers != 'only' OR obj.is_delete_marker)
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text, raw_prefix_param text DEFAULT NULL::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE sql STABLE
    AS $_$
WITH candidates AS (
    SELECT
        upload.key AS object_key,
        CASE
            WHEN position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1)) > 0
            THEN left(
                upload.key,
                length(coalesce($7, $2))
                    + position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1))
                    + length($3) - 1
            )
            ELSE upload.key
        END AS result_key,
        upload.id,
        upload.created_at,
        position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1)) > 0 AS is_common_prefix
    FROM storage.s3_multipart_uploads AS upload
    WHERE upload.bucket_id = $1
      AND upload.key COLLATE "C" LIKE $2 || '%'
), filtered AS (
    SELECT candidate.*
    FROM candidates AS candidate
    WHERE $5 = ''
       OR candidate.result_key COLLATE "C" > $5
       OR (
           candidate.result_key COLLATE "C" = $5
           AND NOT candidate.is_common_prefix
           AND $6 <> ''
           -- A completed or aborted marker repeats the remaining same-key uploads.
           AND COALESCE(
               (candidate.created_at, candidate.id COLLATE "C") > (
                   SELECT marker.created_at, marker.id COLLATE "C"
                   FROM storage.s3_multipart_uploads AS marker
                   WHERE marker.bucket_id = $1
                     AND marker.key COLLATE "C" = $5
                     AND marker.id = $6
               ),
               TRUE
           )
       )
), ranked AS (
    SELECT
        filtered.*,
        row_number() OVER (
            PARTITION BY filtered.result_key COLLATE "C"
            ORDER BY filtered.created_at, filtered.id COLLATE "C"
        ) AS prefix_rank
    FROM filtered
)
SELECT ranked.result_key, ranked.id, ranked.created_at
FROM ranked
WHERE NOT ranked.is_common_prefix OR ranked.prefix_rank = 1
ORDER BY ranked.result_key COLLATE "C", ranked.created_at, ranked.id COLLATE "C"
LIMIT $4;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text, text, text, timestamp with time zone, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, next_token_archived_at timestamp with time zone DEFAULT NULL::timestamp with time zone, next_token_version text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_start_relative TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;
    v_version_filter TEXT;

    -- true when noncurrent_versions can return >1 row per name; keeps them
    -- ordered most-recent-first and lets pagination resume mid-key
    v_multi_row BOOLEAN;
    v_name_order TEXT;
    v_exact_range_predicate TEXT;
    v_strict_range_predicate TEXT;
    v_inclusive_range_predicate TEXT;

    -- Seek state for the current name. archived_at is normalized to JavaScript's
    -- millisecond precision and version breaks ties within the same millisecond.
    -- Current rows use 'infinity'; NULL means no tiebreak has been established.
    v_next_seek TEXT;
    v_next_seek_at TIMESTAMPTZ;
    v_next_seek_version TEXT;
    v_next_seek_strict BOOLEAN := false;
    v_cursor_is_folder BOOLEAN;
    v_count INT := 0;
    v_previous_seek TEXT;
    v_previous_seek_at TIMESTAMPTZ;
    v_previous_seek_version TEXT;
    v_previous_count INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;
    v_batch_query_strict TEXT;
    v_delete_marker_peek_query TEXT;
    v_delete_marker_peek_query_strict TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);
    v_next_seek_at := NULL;
    v_next_seek_version := '';

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    v_multi_row := noncurrent_versions IN ('only', 'include');
    v_name_order := CASE WHEN v_is_asc THEN 'ASC' ELSE 'DESC' END;

    v_version_filter := '';
    IF noncurrent_versions = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NULL';
    ELSIF noncurrent_versions = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NOT NULL';
    END IF;
    IF delete_markers = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND NOT o.is_delete_marker';
    ELSIF delete_markers = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.is_delete_marker';
    END IF;

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Keep caller-provided cursors inside the requested prefix range.
    IF v_start <> '' AND v_upper_bound IS NOT NULL THEN
        IF v_is_asc THEN
            IF v_start COLLATE "C" < v_prefix COLLATE "C" THEN
                v_start := '';
            ELSIF v_start COLLATE "C" >= v_upper_bound COLLATE "C" THEN
                RETURN;
            END IF;
        ELSE
            IF v_start COLLATE "C" < v_prefix COLLATE "C" THEN
                RETURN;
            ELSIF v_start COLLATE "C" >= v_upper_bound COLLATE "C" THEN
                v_start := '';
            END IF;
        END IF;
    END IF;

    v_start_relative := substring(v_start FROM length(v_prefix) + 1);

    -- Direction affects only the indexed name range and its ordering. Cursor
    -- state transitions and within-key version ordering stay shared.
    IF v_is_asc THEN
        v_exact_range_predicate := 'TRUE';
        v_strict_range_predicate := 'o.name COLLATE "C" > $2';
        v_inclusive_range_predicate := 'o.name COLLATE "C" >= $2';
        IF v_upper_bound IS NOT NULL THEN
            v_exact_range_predicate := 'o.name COLLATE "C" < $3';
            v_strict_range_predicate := v_strict_range_predicate || ' AND o.name COLLATE "C" < $3';
            v_inclusive_range_predicate := v_inclusive_range_predicate || ' AND o.name COLLATE "C" < $3';
        END IF;
    ELSE
        v_exact_range_predicate := 'TRUE';
        v_strict_range_predicate := 'o.name COLLATE "C" < $2';
        v_inclusive_range_predicate := 'o.name COLLATE "C" < $2';
        IF v_prefix <> '' THEN
            v_exact_range_predicate := 'o.name COLLATE "C" >= $3';
            v_strict_range_predicate := v_strict_range_predicate || ' AND o.name COLLATE "C" >= $3';
            v_inclusive_range_predicate := v_inclusive_range_predicate || ' AND o.name COLLATE "C" >= $3';
        END IF;
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    -- The multi-row order matches the externally serialized cursor exactly:
    -- archived_at at millisecond precision, then version as the final tiebreak.
    --
    -- When v_multi_row, the seek is a keyset tuple comparison ("name > $2 OR
    -- (name = $2 AND tiebreak)") - Postgres won't split that OR into indexable
    -- form (confirmed even with fully literal values), so as one WHERE clause
    -- it forces a full bucket scan filtered row-by-row. Splitting it into two
    -- independently-indexable branches (exact name match with the tiebreak
    -- filter, vs. strictly-past names) combined with UNION ALL lets each
    -- branch keep name as a real index condition; the outer ORDER BY/LIMIT
    -- re-merges them into the same page the single query used to produce.
    IF v_multi_row THEN
        v_batch_query := format(
            $sql$
            SELECT *
            FROM (
                (
                    SELECT o.name, o.id, o.updated_at, o.created_at,
                           o.last_accessed_at, o.metadata, o.version,
                           o.archived_at, o.is_delete_marker, o.is_versioned
                    FROM storage.objects o
                    WHERE o.bucket_id = $1
                      AND o.name COLLATE "C" = $2
                      AND %s
                      AND NOT $7::boolean
                      AND (
                          $5::timestamptz IS NULL
                          OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < $5
                          OR (
                              COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = $5
                              AND COALESCE(o.version, '') > $6
                          )
                      )
                      %s
                    ORDER BY
                        COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC,
                        COALESCE(o.version, '') ASC
                    LIMIT $4
                )
                UNION ALL
                (
                    SELECT o.name, o.id, o.updated_at, o.created_at,
                           o.last_accessed_at, o.metadata, o.version,
                           o.archived_at, o.is_delete_marker, o.is_versioned
                    FROM storage.objects o
                    WHERE o.bucket_id = $1
                      AND %s
                      %s
                    ORDER BY
                        o.name COLLATE "C" %s,
                        COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC,
                        COALESCE(o.version, '') ASC
                    LIMIT $4
                )
            ) sub
            ORDER BY
                sub.name COLLATE "C" %s,
                COALESCE(date_trunc('milliseconds', sub.archived_at), 'infinity'::timestamptz) DESC,
                COALESCE(sub.version, '') ASC
            LIMIT $4
            $sql$,
            v_exact_range_predicate,
            v_version_filter,
            v_strict_range_predicate,
            v_version_filter,
            v_name_order,
            v_name_order
        );
    ELSE
        v_batch_query := format(
            $sql$
            SELECT o.name, o.id, o.updated_at, o.created_at,
                   o.last_accessed_at, o.metadata, o.version,
                   o.archived_at, o.is_delete_marker, o.is_versioned
            FROM storage.objects o
            WHERE o.bucket_id = $1
              AND %s
              %s
            ORDER BY o.name COLLATE "C" %s, o.archived_at DESC
            LIMIT $4
            $sql$,
            v_inclusive_range_predicate,
            v_version_filter,
            v_name_order
        );

        -- Strict counterpart of the query above: used once the single-row
        -- ASC batch advance (below) has left v_next_seek pointing at the
        -- last row already emitted, so an inclusive predicate would
        -- re-match it forever. Only single-row mode ever sets strict mode,
        -- so this variant is never needed when v_multi_row.
        v_batch_query_strict := format(
            $sql$
            SELECT o.name, o.id, o.updated_at, o.created_at,
                   o.last_accessed_at, o.metadata, o.version,
                   o.archived_at, o.is_delete_marker, o.is_versioned
            FROM storage.objects o
            WHERE o.bucket_id = $1
              AND %s
              %s
            ORDER BY o.name COLLATE "C" %s, o.archived_at DESC
            LIMIT $4
            $sql$,
            v_strict_range_predicate,
            v_version_filter,
            v_name_order
        );
    END IF;

    -- The static peek predicates cannot use the partial delete-marker index
    -- once PL/pgSQL switches to a generic plan because whether
    -- is_delete_marker is required remains parameter-dependent. Reuse the
    -- already-specialized batch query with a one-row limit for this sparse
    -- filter so the plan sees a literal `o.is_delete_marker` predicate.
    IF delete_markers = 'only' THEN
        v_delete_marker_peek_query :=
            'SELECT marker_page.name FROM (' || v_batch_query || ') marker_page LIMIT 1';
        IF NOT v_multi_row THEN
            v_delete_marker_peek_query_strict :=
                'SELECT marker_page.name FROM (' || v_batch_query_strict || ') marker_page LIMIT 1';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor performs one specialized initial seek so
            -- partial current-version and delete-marker indexes remain available.
            EXECUTE format(
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1%s%s ORDER BY o.name COLLATE "C" DESC LIMIT 1',
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND o.name COLLATE "C" >= $2 AND o.name COLLATE "C" < $3'
                    ELSE ''
                END,
                v_version_filter
            )
            INTO v_next_seek
            USING _bucket_id, v_prefix, v_upper_bound;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Folder continuation tokens retain their trailing delimiter. A
        -- delimiter-less startAfter is always a literal key boundary.
        v_cursor_is_folder := delimiter_param <> ''
            AND v_start_relative <> ''
            AND right(v_start_relative, length(delimiter_param)) = delimiter_param;

        IF v_cursor_is_folder THEN
            v_next_seek := CASE
                WHEN right(v_start, length(delimiter_param)) = delimiter_param
                    THEN v_start
                ELSE v_start || delimiter_param
            END;
            IF v_is_asc THEN
                v_next_seek := left(v_next_seek, -1)
                    || chr(ascii(right(v_next_seek, 1)) + 1);
            END IF;
            v_next_seek_strict := NOT v_is_asc;
        ELSE
            -- leaf object: when v_multi_row, stay on v_start with the
            -- caller-supplied tiebreak so a page boundary mid-key resumes
            -- that key's remaining rows instead of skipping them. Truncate
            -- to milliseconds like every other v_next_seek_at assignment -
            -- harmless today since object.ts's cursor always round-trips
            -- through JS Date first, but this shouldn't rely on that.
            IF v_multi_row THEN
                v_next_seek := v_start;
                v_next_seek_at := date_trunc('milliseconds', next_token_archived_at);
                v_next_seek_version := coalesce(next_token_version, '');
                v_next_seek_strict := coalesce(next_token, '') = '';
            ELSIF v_is_asc THEN
                v_next_seek := v_start;
                v_next_seek_strict := true;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        v_previous_seek := v_next_seek;
        v_previous_seek_at := v_next_seek_at;
        v_previous_seek_version := v_next_seek_version;
        v_previous_count := v_count;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        -- v_multi_row is branched here (rather than folded into the WHERE
        -- clause as a bound parameter) so each concrete query keeps an
        -- unconditional seek predicate - once PL/pgSQL switches to its
        -- cached generic plan (after 5 calls), a parameter-gated
        -- "(NOT v_multi_row AND name >= $x) OR (v_multi_row AND ...)"
        -- predicate stops the planner from using name as an index
        -- condition at all, degrading every subsequent peek to a full
        -- index scan filtered row-by-row instead of a bounded range scan.
        -- v_multi_row's seek predicate is a keyset tuple comparison
        -- ("name > x OR (name = x AND tiebreak)") - Postgres does not
        -- split this OR into indexable form even with fully literal
        -- values, so it falls back to a full scan filtered row-by-row.
        -- Splitting it into two independently-indexable branches (exact
        -- name match with the tiebreak filter, vs. strictly-past name)
        -- combined with UNION ALL lets each branch keep name as a real
        -- index condition; the outer ORDER BY/LIMIT picks whichever of
        -- the (at most 2) rows sorts first.
        IF delete_markers = 'only' THEN
            EXECUTE CASE WHEN v_next_seek_strict AND NOT v_multi_row
                THEN v_delete_marker_peek_query_strict
                ELSE v_delete_marker_peek_query
            END
                INTO v_peek_name
                USING _bucket_id, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END,
                    1, v_next_seek_at, v_next_seek_version, v_next_seek_strict;
        ELSIF v_multi_row THEN
            IF v_is_asc THEN
                IF v_upper_bound IS NOT NULL THEN
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND o.name COLLATE "C" < v_upper_bound
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" > v_next_seek AND o.name COLLATE "C" < v_upper_bound
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" ASC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" > v_next_seek
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" ASC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSE
                IF v_upper_bound IS NOT NULL THEN
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND o.name COLLATE "C" >= v_prefix
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" DESC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" DESC LIMIT 1;
                ELSE
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" DESC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" DESC LIMIT 1;
                END IF;
            END IF;
        ELSE
            -- Single-row mode is always noncurrent_versions='exclude'. Keep
            -- this predicate literal so generic plans use the current index.
            IF v_is_asc THEN
                IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" > v_next_seek
                      AND o.name COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSIF v_next_seek_strict THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" > v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSIF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" >= v_next_seek
                      AND o.name COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" >= v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSE
                IF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" < v_next_seek
                      AND o.name COLLATE "C" >= v_prefix
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" DESC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" < v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" DESC LIMIT 1;
                END IF;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := v_common_prefix;
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            version := NULL;
            archived_at := NULL;
            is_delete_marker := NULL;
            is_versioned := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1)
                    || chr(ascii(right(v_common_prefix, 1)) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
            v_next_seek_at := NULL;
            v_next_seek_version := '';
            v_next_seek_strict := NOT v_is_asc;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE CASE WHEN v_next_seek_strict AND NOT v_multi_row THEN v_batch_query_strict ELSE v_batch_query END
                USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size, v_next_seek_at, v_next_seek_version,
                v_next_seek_strict
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it. Reset
                    -- strict mode too it may have been set by an earlier
                    -- row in this same batch (see the single-row ASC advance
                    -- below), and v_next_seek here is the folder-triggering
                    -- row's own name, which the next peek must find inclusively.
                    v_next_seek := CASE
                        WHEN v_is_asc THEN v_current.name
                        ELSE v_current.name || delimiter_param
                    END;
                    v_next_seek_at := NULL;
                    v_next_seek_version := '';
                    v_next_seek_strict := false;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                version := v_current.version;
                archived_at := v_current.archived_at;
                is_delete_marker := v_current.is_delete_marker;
                is_versioned := v_current.is_versioned;
                RETURN NEXT;
                v_count := v_count + 1;

                -- when v_multi_row, stay on this name and record its
                -- archived_at as the new tiebreak so remaining rows for the
                -- same key are picked up before moving to the next name
                IF v_multi_row THEN
                    v_next_seek := v_current.name;
                    v_next_seek_at := COALESCE(date_trunc('milliseconds', v_current.archived_at), 'infinity'::timestamptz);
                    v_next_seek_version := COALESCE(v_current.version, '');
                    v_next_seek_strict := false;
                ELSIF v_is_asc THEN
                    -- Appending the delimiter as a fake lexical successor
                    -- would skip a real key like `name || '!'` (or any
                    -- character sorting below the delimiter), which sorts
                    -- between `name` and `name || delimiter`. Track the real
                    -- name and mark the next comparison strict instead.
                    v_next_seek := v_current.name;
                    v_next_seek_strict := true;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;

        IF v_count = v_previous_count
           AND v_next_seek IS NOT DISTINCT FROM v_previous_seek
           AND v_next_seek_at IS NOT DISTINCT FROM v_previous_seek_at
           AND v_next_seek_version IS NOT DISTINCT FROM v_previous_seek_version THEN
            RAISE EXCEPTION 'storage.list_objects_with_delimiter made no progress at seek (%, %, %)',
                v_next_seek, v_next_seek_at, v_next_seek_version;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_bucket_control_columns(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_bucket_control_columns() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  configuration_changed boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.lifecycle_configuration IS NOT NULL
       OR NEW.lifecycle_configuration_generation IS NOT NULL THEN
      IF NOT pg_has_role(current_user, TG_ARGV[0], 'MEMBER') THEN
        RAISE EXCEPTION 'only members of the configured storage service role may insert lifecycle policy state'
          USING ERRCODE = '42501',
                HINT = format(
                  'Insert with both lifecycle columns NULL and configure lifecycle through the Storage API afterward, or insert as a member of %I.',
                  TG_ARGV[0]
                );
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  configuration_changed =
    OLD.lifecycle_configuration IS DISTINCT FROM NEW.lifecycle_configuration
    OR OLD.lifecycle_configuration_generation IS DISTINCT FROM NEW.lifecycle_configuration_generation;

  IF NOT configuration_changed THEN
    RETURN NEW;
  END IF;

  IF NEW.type IS DISTINCT FROM 'STANDARD' THEN
    RAISE EXCEPTION 'bucket versioning and lifecycle controls require a Standard bucket'
      USING ERRCODE = '0A000';
  END IF;

  IF NEW.lifecycle_configuration IS NULL
     AND NEW.lifecycle_configuration_generation IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.lifecycle_configuration IS NULL
     OR NEW.lifecycle_configuration_generation IS NULL
     OR OLD.lifecycle_configuration IS NOT DISTINCT FROM NEW.lifecycle_configuration
     OR OLD.lifecycle_configuration_generation IS NOT DISTINCT FROM NEW.lifecycle_configuration_generation THEN
    RAISE EXCEPTION 'a changed lifecycle policy requires a new non-null generation'
      USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_prefix_len INT;
    v_prefix_start INT;
    v_combined_levels INT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;
    v_version_filter TEXT;
    v_multi_row BOOLEAN;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;
    v_delete_marker_peek_query TEXT;
    v_delete_marker_peek_query_strict TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_next_seek_at TIMESTAMPTZ;
    v_next_seek_version TEXT;
    v_next_seek_strict BOOLEAN := false;
    v_count INT := 0;
    v_skipped INT := 0;
    v_previous_seek TEXT;
    v_previous_seek_at TIMESTAMPTZ;
    v_previous_seek_version TEXT;
    v_previous_count INT;
    v_previous_skipped INT;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_prefix_len := length(coalesce(prefix, ''));
    v_prefix_start := coalesce(array_length(string_to_array(coalesce(prefix, ''), v_delimiter), 1), 1);
    v_combined_levels := coalesce(array_length(string_to_array(v_prefix, v_delimiter), 1), 1);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);
    v_next_seek_at := NULL;
    v_next_seek_version := '';

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    v_multi_row := noncurrent_versions IN ('only', 'include');

    v_version_filter := '';
    IF noncurrent_versions = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NULL';
    ELSIF noncurrent_versions = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NOT NULL';
    END IF;
    IF delete_markers = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND NOT o.is_delete_marker';
    ELSIF delete_markers = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.is_delete_marker';
    END IF;

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT array_to_string(path_tokens[$1:$2], '/') AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $3 || '%%'
                  AND bucket_id = $4
                  AND array_length(objects.path_tokens, 1) <> $2
                  AND ($7 != 'exclude' OR objects.archived_at IS NULL)
                  AND ($7 != 'only' OR objects.archived_at IS NOT NULL)
                  AND ($8 != 'exclude' OR NOT objects.is_delete_marker)
                  AND ($8 != 'only' OR objects.is_delete_marker)
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata,
                   NULL::text AS version,
                   NULL::timestamptz AS archived_at,
                   NULL::boolean AS is_delete_marker,
                   NULL::boolean AS is_versioned FROM folders)
            UNION ALL
            (SELECT array_to_string(path_tokens[$1:$2], '/') AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata,
                   version, archived_at, is_delete_marker, is_versioned
             FROM storage.objects
             WHERE objects.name ILIKE $3 || '%%'
               AND bucket_id = $4
               AND array_length(objects.path_tokens, 1) = $2
               AND ($7 != 'exclude' OR objects.archived_at IS NULL)
               AND ($7 != 'only' OR objects.archived_at IS NOT NULL)
               AND ($8 != 'exclude' OR NOT objects.is_delete_marker)
               AND ($8 != 'only' OR objects.is_delete_marker)
             -- name, then version, as tiebreaks so two versions of the same
             -- key tying on the sort column still sort deterministically
             ORDER BY %I %s, name COLLATE "C" %s, COALESCE(version, '') %s)
            LIMIT $5 OFFSET $6
            $sql$, v_sort_order, v_order_by, v_sort_order, v_sort_order, v_sort_order
        ) USING v_prefix_start, v_combined_levels, v_prefix, bucketname, v_limit, offsets, noncurrent_versions, delete_markers;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build a resume-safe batch query. The exact-name branch returns remaining
    -- versions after the current (archived_at, version) boundary; the strict
    -- name branch returns subsequent keys. UNION ALL keeps both predicates
    -- independently indexable.
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" > $2 AND lower(o.name) COLLATE "C" < $3' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" ASC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" > $2' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" ASC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 AND lower(o.name) COLLATE "C" >= $3' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" DESC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" DESC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        END IF;
    END IF;

    -- Keep the delete-marker predicate literal so the cached generic
    -- plan can use idx_objects_delete_markers during the main-loop peek.
    IF delete_markers = 'only' THEN
        IF v_multi_row THEN
            v_delete_marker_peek_query :=
                'SELECT marker_page.name FROM (' || v_batch_query || ') marker_page LIMIT 1';
        ELSIF v_is_asc THEN
            -- Two separate literal query strings, not one gated by a bound
            -- boolean: folding "$n AND op1 OR NOT $n AND op2" into a single
            -- query defeats the generic plan's ability to push either
            -- comparison into the index. Branching in PL/pgSQL control flow
            -- instead keeps each query's index condition intact.
            v_delete_marker_peek_query :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" >= $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" < $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1';
            -- Strict variant: used once the single-row ASC batch advance
            -- (below) has left v_next_seek pointing at the last row already
            -- emitted, so a plain >= would re-match it forever.
            v_delete_marker_peek_query_strict :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" > $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" < $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1';
        ELSE
            v_delete_marker_peek_query :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" < $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" >= $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC performs one specialized initial seek so partial current-version
        -- and delete-marker indexes remain available.
        EXECUTE format(
            'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1%s%s ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1',
            CASE WHEN v_upper_bound IS NOT NULL
                THEN ' AND lower(o.name) COLLATE "C" >= $2 AND lower(o.name) COLLATE "C" < $3'
                ELSE ''
            END,
            v_version_filter
        )
        INTO v_peek_name
        USING bucketname, v_prefix_lower, v_upper_bound;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch and
    -- the delete-marker-only path
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        v_previous_seek := v_next_seek;
        v_previous_seek_at := v_next_seek_at;
        v_previous_seek_version := v_next_seek_version;
        v_previous_count := v_count;
        v_previous_skipped := v_skipped;

        -- STEP 1: PEEK
        v_peek_name := NULL;
        IF delete_markers = 'only' THEN
            EXECUTE CASE WHEN v_next_seek_strict
                THEN v_delete_marker_peek_query_strict
                ELSE v_delete_marker_peek_query
            END
                INTO v_peek_name
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END,
                    1, v_next_seek_at, v_next_seek_version;
        ELSIF v_multi_row AND v_next_seek_at IS NOT NULL THEN
            SELECT o.name INTO v_peek_name
            FROM storage.objects o
            WHERE o.bucket_id = bucketname
              AND lower(o.name) COLLATE "C" = v_next_seek
              AND (COALESCE(o.archived_at, 'infinity'::timestamptz) < v_next_seek_at
                   OR (COALESCE(o.archived_at, 'infinity'::timestamptz) = v_next_seek_at
                       AND COALESCE(o.version, '') > v_next_seek_version))
              AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
              AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
              AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
              AND (delete_markers != 'only' OR o.is_delete_marker)
            ORDER BY COALESCE(o.archived_at, 'infinity'::timestamptz) DESC,
                     COALESCE(o.version, '') ASC
            LIMIT 1;

            -- The current key is exhausted. Clear its version boundary and
            -- make the following ASC name peek strict. Appending '/' is not a
            -- valid lexical successor because keys ending in characters such
            -- as '!' sort between the exhausted name and name || '/'.
            IF v_peek_name IS NULL THEN
                IF v_is_asc THEN
                    v_next_seek_strict := true;
                END IF;
                v_next_seek_at := NULL;
                v_next_seek_version := '';
            END IF;
        END IF;

        -- Single-row mode is always noncurrent_versions='exclude'. Keep the
        -- current-row predicate literal so generic plans use the current index.
        IF delete_markers != 'only' AND v_peek_name IS NULL AND NOT v_multi_row THEN
            IF v_is_asc THEN
                IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSIF v_next_seek_strict THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSIF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSIF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                  AND o.archived_at IS NULL
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                  AND o.archived_at IS NULL
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        ELSIF delete_markers != 'only' AND v_peek_name IS NULL AND v_is_asc THEN
            IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSIF v_next_seek_strict THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSIF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSIF delete_markers != 'only' AND v_peek_name IS NULL THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- If the peek landed on a different key than we were tracking, any
        -- version boundary belongs to the OLD key and must not leak into the
        -- new one - e.g. the deleteMarkers='only' peek doesn't know or care
        -- whether it's continuing the same key or jumping to a new one, so
        -- it never clears these itself.
        IF lower(v_peek_name) IS DISTINCT FROM v_next_seek THEN
            v_next_seek_at := NULL;
            v_next_seek_version := '';
        END IF;

        -- The peek is authoritative for the next key to process. This is
        -- especially important after exhausting a multi-version key: the
        -- version boundary has been cleared, so executing the batch against
        -- a stale v_next_seek would replay every version of that old key.
        v_next_seek := lower(v_peek_name);
        v_next_seek_strict := false;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := substring(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter) from v_prefix_len + 1);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                version := NULL;
                archived_at := NULL;
                is_delete_marker := NULL;
                is_versioned := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
            v_next_seek_at := NULL;
            v_next_seek_version := '';
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size,
                    v_next_seek_at, v_next_seek_version
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it. Reset
                    -- strict mode too - it may have been set by an earlier
                    -- row in this same batch (see the single-row ASC advance
                    -- below), and v_next_seek here is the folder-triggering
                    -- row's own name, which the next peek must find inclusively.
                    v_next_seek := CASE
                        WHEN v_is_asc THEN lower(v_current.name)
                        ELSE lower(v_current.name) || v_delimiter
                    END;
                    v_next_seek_at := NULL;
                    v_next_seek_version := '';
                    v_next_seek_strict := false;
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := substring(v_current.name from v_prefix_len + 1);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    version := v_current.version;
                    archived_at := v_current.archived_at;
                    is_delete_marker := v_current.is_delete_marker;
                    is_versioned := v_current.is_versioned;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Multi-row mode must remain on this key until all of its
                -- versions have crossed the internal batch boundary.
                IF v_multi_row THEN
                    v_next_seek := lower(v_current.name);
                    v_next_seek_at := COALESCE(v_current.archived_at, 'infinity'::timestamptz);
                    v_next_seek_version := COALESCE(v_current.version, '');
                ELSIF v_is_asc THEN
                    -- Appending the delimiter as a fake lexical successor would
                    -- skip a real key like `name || '!'` (or any character
                    -- sorting below the delimiter), which sorts between `name`
                    -- and `name || delimiter`. Track the real name and mark the
                    -- next comparison strict instead - same fix as the
                    -- exhausted-key case above.
                    v_next_seek := lower(v_current.name);
                    v_next_seek_strict := true;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;

        IF v_count = v_previous_count
           AND v_skipped = v_previous_skipped
           AND v_next_seek IS NOT DISTINCT FROM v_previous_seek
           AND v_next_seek_at IS NOT DISTINCT FROM v_previous_seek_at
           AND v_next_seek_version IS NOT DISTINCT FROM v_previous_seek_version THEN
            RAISE EXCEPTION 'storage.search made no progress at seek (%, %, %)',
                v_next_seek, v_next_seek_at, v_next_seek_version;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, p_start_after_version text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
    v_prefix_pattern text;
    v_sort_order text;
    v_sort_column text;
    v_version_tiebreak text;
BEGIN
    v_prefix := coalesce(p_prefix, '');
    -- Keep the raw prefix for common-prefix calculations and escape only LIKE metacharacters.
    v_prefix_pattern := replace(v_prefix, chr(92), chr(92) || chr(92));
    v_prefix_pattern := replace(v_prefix_pattern, '%', chr(92) || '%');
    v_prefix_pattern := replace(v_prefix_pattern, '_', chr(92) || '_');

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    -- $9 is only populated in multi-row mode; it's always '' otherwise, so
    -- only use each row's real version as a tiebreak in multi-row mode.
    v_version_tiebreak := CASE WHEN noncurrent_versions IN ('only', 'include') THEN 'COALESCE(version, '''')' ELSE '''''' END;

    -- Defense-in-depth: this function is independently reachable and must
    -- not trust p_sort_order/p_sort_column to already be validated by a
    -- caller. Normalize to the same strict allow-list storage.search_v2
    -- uses before interpolating anything into dynamic SQL below.
    v_sort_order := lower(coalesce(p_sort_order, 'asc'));
    IF v_sort_order NOT IN ('asc', 'desc') THEN
        v_sort_order := 'asc';
    END IF;

    v_sort_column := lower(coalesce(p_sort_column, 'updated_at'));
    IF v_sort_column NOT IN ('updated_at', 'created_at') THEN
        v_sort_column := 'updated_at';
    END IF;

    IF v_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                o.version AS obj_version,
                o.archived_at AS obj_archived_at,
                o.is_delete_marker AS obj_is_delete_marker,
                o.is_versioned AS obj_is_versioned,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $10 || '%%'
              AND ($7 != 'exclude' OR o.archived_at IS NULL)
              AND ($7 != 'only' OR o.archived_at IS NOT NULL)
              AND ($8 != 'exclude' OR NOT o.is_delete_marker)
              AND ($8 != 'only' OR o.is_delete_marker)
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                common_prefix AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                NULL::text AS version,
                NULL::timestamptz AS archived_at,
                NULL::boolean AS is_delete_marker,
                NULL::boolean AS is_versioned,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                obj_version AS version,
                obj_archived_at AS archived_at,
                obj_is_delete_marker AS is_delete_marker,
                obj_is_versioned AS is_versioned,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz),
                    name COLLATE "C",
                    %s
                ) %s ROW(
                    -- truncated the same way as the stored value above
                    date_trunc('milliseconds', COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz)),
                    $5,
                    $9
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata,
            version,
            archived_at,
            is_delete_marker,
            is_versioned
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s,
            COALESCE(version, '') %s
        LIMIT $4
    $sql$,
        v_sort_column,
        v_version_tiebreak,
        v_cursor_op,
        v_sort_column,
        v_sort_order,
        v_sort_order,
        v_sort_order
    );

    -- version is the third tiebreak component for two versions of the same
    -- key tying on both timestamp and name (see filtered CTE / ORDER BY above)
    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after, noncurrent_versions, delete_markers, coalesce(p_start_after_version, ''), v_prefix_pattern;
END;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text, text, text, timestamp with time zone, text, boolean); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, start_after_archived_at timestamp with time zone DEFAULT NULL::timestamp with time zone, start_after_version text DEFAULT ''::text, start_after_is_continuation boolean DEFAULT false) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata,
            l.version,
            l.archived_at,
            l.is_delete_marker,
            l.is_versioned
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            CASE WHEN start_after_is_continuation THEN '' ELSE start_after END,
            CASE WHEN start_after_is_continuation THEN start_after ELSE '' END,
            v_sort_ord,
            noncurrent_versions,
            delete_markers,
            start_after_archived_at,
            start_after_version
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after,
            noncurrent_versions, delete_markers, start_after_version
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: mfa_recovery_code_sets; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_recovery_code_sets (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    mfa_factor_id uuid NOT NULL,
    failed_verification_count integer DEFAULT 0 NOT NULL,
    verification_locked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mfa_recovery_code_sets_failed_verification_count_check CHECK ((failed_verification_count >= 0))
);


--
-- Name: mfa_recovery_codes; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_recovery_codes (
    id uuid NOT NULL,
    mfa_recovery_code_set_id uuid NOT NULL,
    code_hash text NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: scim_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.scim_tokens (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    token_hash text NOT NULL,
    prefix text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    revoked_at timestamp with time zone,
    last_used_at timestamp with time zone,
    CONSTRAINT scim_tokens_expires_at_future CHECK (((expires_at IS NULL) OR (expires_at > created_at))),
    CONSTRAINT scim_tokens_revoked_after_created CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at))),
    CONSTRAINT scim_tokens_token_hash_check CHECK ((token_hash ~ '^[0-9a-f]{64}$'::text))
);


--
-- Name: scim_users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.scim_users (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    user_id uuid,
    resource jsonb NOT NULL,
    user_name text GENERATED ALWAYS AS (lower((resource ->> 'userName'::text))) STORED NOT NULL,
    external_id text GENERATED ALWAYS AS ((resource ->> 'externalId'::text)) STORED,
    active boolean GENERATED ALWAYS AS (COALESCE(((resource ->> 'active'::text))::boolean, true)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mesa_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    fecha_apertura timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_cierre timestamp with time zone
);


--
-- Name: clientes_anonimos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes_anonimos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombres text NOT NULL,
    foto_url text,
    fecha_ingreso timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: mensajes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensajes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    autor_id uuid NOT NULL,
    cuerpo text NOT NULL,
    fecha timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT mensajes_cuerpo_check CHECK ((length(TRIM(BOTH FROM cuerpo)) > 0))
);


--
-- Name: mesas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mesas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero_mesa integer NOT NULL,
    cantidad_lugares integer NOT NULL,
    tipo public.tipo_mesa DEFAULT 'Estándar'::public.tipo_mesa NOT NULL,
    disponibilidad public.disponibilidad_mesa DEFAULT 'Disponible'::public.disponibilidad_mesa NOT NULL,
    cliente_id uuid,
    qr_url text NOT NULL,
    foto_url text NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT mesas_cantidad_lugares_check CHECK ((cantidad_lugares > 0)),
    CONSTRAINT mesas_numero_mesa_check CHECK ((numero_mesa > 0))
);


--
-- Name: pedido_detalles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido_detalles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pedido_id uuid NOT NULL,
    producto_id uuid NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    precio_total_parcial numeric(10,2) GENERATED ALWAYS AS (((cantidad)::numeric * precio_unitario)) STORED,
    estado_producto public.estado_item_producto DEFAULT 'Pendiente'::public.estado_item_producto NOT NULL,
    CONSTRAINT pedido_detalles_cantidad_check CHECK ((cantidad > 0))
);


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedidos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero_pedido integer NOT NULL,
    mesa_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    estado public.estado_general_pedido DEFAULT 'Pendiente de Confirmación'::public.estado_general_pedido NOT NULL,
    precio_total_neto numeric(10,2) DEFAULT 0.00 NOT NULL,
    descuento_juego numeric(5,2) DEFAULT 0.00 NOT NULL,
    propina_porcentaje numeric(5,2) DEFAULT 0.00 NOT NULL,
    fecha timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: pedidos_numero_pedido_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedidos_numero_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedidos_numero_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedidos_numero_pedido_seq OWNED BY public.pedidos.numero_pedido;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    tiempo_elaboracion_minutos integer NOT NULL,
    precio numeric(10,2) NOT NULL,
    fotos_urls text[] NOT NULL,
    tipo public.tipo_producto NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_cantidad_fotos CHECK ((cardinality(fotos_urls) = 3))
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    apellidos text,
    nombres text NOT NULL,
    dni text,
    cuil text,
    correo_electronico text,
    perfil public.usuarios_rol NOT NULL,
    foto_url text,
    estado public.usuarios_estado DEFAULT 'Activo'::public.usuarios_estado NOT NULL,
    fecha_registro timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    token_push text,
    estado_en_resto public.estado_en_resto DEFAULT 'libre'::public.estado_en_resto,
    mesa_id uuid
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2026_09_20; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_09_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


--
-- Name: messages_2026_09_21; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_09_21 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


--
-- Name: messages_2026_09_22; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_09_22 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


--
-- Name: messages_2026_09_23; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_09_23 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


--
-- Name: messages_2026_09_24; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_09_24 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


--
-- Name: messages_2026_09_25; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_09_25 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


--
-- Name: messages_2026_09_26; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_09_26 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone DEFAULT now()
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL,
    versioning_status text DEFAULT 'DISABLED'::text NOT NULL,
    lifecycle_configuration jsonb,
    lifecycle_configuration_generation uuid,
    CONSTRAINT buckets_lifecycle_configuration_pair_check CHECK (((lifecycle_configuration IS NULL) = (lifecycle_configuration_generation IS NULL))),
    CONSTRAINT buckets_lifecycle_configuration_shape_check CHECK (((lifecycle_configuration IS NULL) OR ((jsonb_typeof(lifecycle_configuration) = 'object'::text) AND (lifecycle_configuration ? 'rules'::text) AND
CASE
    WHEN (jsonb_typeof((lifecycle_configuration -> 'rules'::text)) = 'array'::text) THEN ((jsonb_array_length((lifecycle_configuration -> 'rules'::text)) >= 1) AND (jsonb_array_length((lifecycle_configuration -> 'rules'::text)) <= 1000))
    ELSE false
END))),
    CONSTRAINT buckets_lifecycle_configuration_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR ((lifecycle_configuration IS NULL) AND (lifecycle_configuration_generation IS NULL)))),
    CONSTRAINT buckets_versioning_dark_check CHECK ((versioning_status = 'DISABLED'::text)),
    CONSTRAINT buckets_versioning_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR (versioning_status = 'DISABLED'::text))),
    CONSTRAINT buckets_versioning_status_check CHECK ((versioning_status = ANY (ARRAY['DISABLED'::text, 'ENABLED'::text, 'SUSPENDED'::text])))
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    archived_at timestamp with time zone,
    is_delete_marker boolean DEFAULT false NOT NULL,
    is_versioned boolean DEFAULT false NOT NULL
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_2026_09_20; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_20 FOR VALUES FROM ('2026-09-20 00:00:00') TO ('2026-09-21 00:00:00');


--
-- Name: messages_2026_09_21; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_21 FOR VALUES FROM ('2026-09-21 00:00:00') TO ('2026-09-22 00:00:00');


--
-- Name: messages_2026_09_22; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_22 FOR VALUES FROM ('2026-09-22 00:00:00') TO ('2026-09-23 00:00:00');


--
-- Name: messages_2026_09_23; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_23 FOR VALUES FROM ('2026-09-23 00:00:00') TO ('2026-09-24 00:00:00');


--
-- Name: messages_2026_09_24; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_24 FOR VALUES FROM ('2026-09-24 00:00:00') TO ('2026-09-25 00:00:00');


--
-- Name: messages_2026_09_25; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_25 FOR VALUES FROM ('2026-09-25 00:00:00') TO ('2026-09-26 00:00:00');


--
-- Name: messages_2026_09_26; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_26 FOR VALUES FROM ('2026-09-26 00:00:00') TO ('2026-09-27 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: pedidos numero_pedido; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN numero_pedido SET DEFAULT nextval('public.pedidos_numero_pedido_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
0eda206f-34b4-4997-9e93-486c82af04b1	0eda206f-34b4-4997-9e93-486c82af04b1	{"sub": "0eda206f-34b4-4997-9e93-486c82af04b1", "email": "duenio@restaurante.com", "email_verified": false, "phone_verified": false}	email	2026-08-24 21:27:44.928659+00	2026-08-24 21:27:44.928736+00	2026-08-24 21:27:44.928736+00	a3512a3e-fbbf-4446-8aeb-ec71c9f27efd
d6dba4da-1598-4e53-ac2e-cfe47c76fd68	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{"sub": "d6dba4da-1598-4e53-ac2e-cfe47c76fd68", "email": "supervisor@restaurante.com", "email_verified": false, "phone_verified": false}	email	2026-08-25 21:49:51.563878+00	2026-08-25 21:49:51.563949+00	2026-08-25 21:49:51.563949+00	125d0e9d-e674-4d6b-adc6-683684006ef7
fa1f5f64-5a23-4359-93de-a69deecdd6df	fa1f5f64-5a23-4359-93de-a69deecdd6df	{"sub": "fa1f5f64-5a23-4359-93de-a69deecdd6df", "email": "metre@restaurante.com", "email_verified": false, "phone_verified": false}	email	2026-08-25 21:50:06.852316+00	2026-08-25 21:50:06.852388+00	2026-08-25 21:50:06.852388+00	56a39466-00d0-42dd-8cea-9a90d2b2a8d3
f66c5d58-c6f1-4598-b2f4-b06dd7a9a58a	f66c5d58-c6f1-4598-b2f4-b06dd7a9a58a	{"sub": "f66c5d58-c6f1-4598-b2f4-b06dd7a9a58a", "email": "mozo@restaurante.com", "email_verified": false, "phone_verified": false}	email	2026-08-25 21:50:43.204412+00	2026-08-25 21:50:43.204488+00	2026-08-25 21:50:43.204488+00	3ce73bfa-9122-4a1b-98b9-9a7b01619898
268c6ca3-9187-4659-b644-964ea7ec542f	268c6ca3-9187-4659-b644-964ea7ec542f	{"sub": "268c6ca3-9187-4659-b644-964ea7ec542f", "email": "cocinero@restaurante.com", "email_verified": false, "phone_verified": false}	email	2026-08-25 21:50:58.331575+00	2026-08-25 21:50:58.331643+00	2026-08-25 21:50:58.331643+00	a3c9c20f-df1f-4797-8ffb-1757aad5b535
16dfbda1-6f81-4362-86b8-885e54a2a22a	16dfbda1-6f81-4362-86b8-885e54a2a22a	{"sub": "16dfbda1-6f81-4362-86b8-885e54a2a22a", "email": "cliente@restaurante.com", "email_verified": false, "phone_verified": false}	email	2026-08-25 21:51:14.045914+00	2026-08-25 21:51:14.045992+00	2026-08-25 21:51:14.045992+00	549744c0-a0cf-4f77-9598-f9a9d8a8e135
363bfe32-6da7-44f5-b97c-e87cea7fec8e	363bfe32-6da7-44f5-b97c-e87cea7fec8e	{"sub": "363bfe32-6da7-44f5-b97c-e87cea7fec8e", "email": "nd.jeremias@live.com", "nombres": "Nicolas", "apellidos": "Jeremias", "email_verified": false, "phone_verified": false}	email	2026-09-23 22:26:20.517177+00	2026-09-23 22:26:20.517234+00	2026-09-23 22:26:20.517234+00	dcf665f2-488c-453e-ac8a-90312c18399c
48a5b03b-3675-4efb-b230-9266023919a9	48a5b03b-3675-4efb-b230-9266023919a9	{"sub": "48a5b03b-3675-4efb-b230-9266023919a9", "email": "cantinero@restaurante.com", "email_verified": false, "phone_verified": false}	email	2026-09-02 20:56:20.504134+00	2026-09-02 20:56:20.50426+00	2026-09-02 20:56:20.50426+00	3d88bc18-88a8-430e-9565-17c2e5c281cf
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_recovery_code_sets (id, user_id, mfa_factor_id, failed_verification_count, verification_locked_until, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_recovery_codes (id, mfa_recovery_code_set_id, code_hash, consumed_at, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at, expires_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
20260821000000
20260821010000
20260824000000
20260824000001
20260831180000
\.


--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.scim_tokens (id, sso_provider_id, token_hash, prefix, created_at, expires_at, revoked_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.scim_users (id, sso_provider_id, user_id, resource, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	16dfbda1-6f81-4362-86b8-885e54a2a22a	authenticated	authenticated	cliente@restaurante.com	$2a$10$KvYHQACjZIx82ewuFV9PDez0/Fj1l.DiEjyubWC5lFSr8wru3bSOy	2026-08-25 21:51:14.04855+00	\N		\N		\N			\N	2026-09-23 15:03:49.750373+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-25 21:51:14.043552+00	2026-09-23 15:03:49.763026+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9d12ee75-4b94-4531-b061-9fd28c5facca	authenticated	authenticated	\N		\N	\N		\N		\N			\N	2026-09-21 23:30:13.113453+00	{}	{}	\N	2026-09-21 23:30:13.094132+00	2026-09-21 23:30:13.121297+00	\N	\N			\N		0	\N		\N	f	\N	t
00000000-0000-0000-0000-000000000000	f66c5d58-c6f1-4598-b2f4-b06dd7a9a58a	authenticated	authenticated	mozo@restaurante.com	$2a$10$KMpqz.ptf4TlJMgQmv1X3urvO3nB.kiDq8NMEIaQIq1HEFGaPgCoi	2026-08-25 21:50:43.215663+00	\N		\N		\N			\N	2026-09-23 22:31:32.788505+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-25 21:50:43.202211+00	2026-09-23 22:31:32.821557+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	48a5b03b-3675-4efb-b230-9266023919a9	authenticated	authenticated	cantinero@restaurante.com	$2a$10$wNmuC.SIKhx.ensmi6NiNuDyB8sFzhIPe4/E5oSdyaF6B0kbTWi9W	2026-09-02 20:56:20.511279+00	\N		\N		\N			\N	2026-09-22 23:29:42.956144+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-09-02 20:56:20.492856+00	2026-09-22 23:29:42.965536+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	363bfe32-6da7-44f5-b97c-e87cea7fec8e	authenticated	authenticated	nd.jeremias@live.com	$2a$10$0F9oZws9Nb1Y/6Za8G.FiuExp9MP1lCkgbKeLUmKh75y7FQ6aTrFS	2026-09-23 22:26:20.523988+00	\N		\N		\N			\N	2026-09-23 22:27:30.576872+00	{"provider": "email", "providers": ["email"]}	{"sub": "363bfe32-6da7-44f5-b97c-e87cea7fec8e", "email": "nd.jeremias@live.com", "nombres": "Nicolas", "apellidos": "Jeremias", "email_verified": true, "phone_verified": false}	\N	2026-09-23 22:26:20.495268+00	2026-09-23 22:27:30.597753+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0eda206f-34b4-4997-9e93-486c82af04b1	authenticated	authenticated	duenio@restaurante.com	$2a$10$DeG0DkkxLOog78NAwnkgxeNHlk0SvNvq5sZSJgrmZfR4FtrsImfrS	2026-08-24 21:27:44.938895+00	\N		\N		\N			\N	2026-09-23 22:27:39.517961+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-24 21:27:44.908883+00	2026-09-23 22:27:39.521483+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	fa1f5f64-5a23-4359-93de-a69deecdd6df	authenticated	authenticated	metre@restaurante.com	$2a$10$J9ENn5fgUQZu.M5vVequd.O4WNCYjgt5gbMsWPAhtHFLPtjD8HI5m	2026-08-25 21:50:06.854571+00	\N		\N		\N			\N	2026-09-23 22:28:18.538102+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-25 21:50:06.850701+00	2026-09-23 22:28:18.542135+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	268c6ca3-9187-4659-b644-964ea7ec542f	authenticated	authenticated	cocinero@restaurante.com	$2a$10$dcj2Wj1GTwxoCLcvazMkkeDzdMPbkRKMD2bsZ40PqHUdUg5/.NVu.	2026-08-25 21:50:58.334795+00	\N		\N		\N			\N	2026-09-22 23:07:00.146475+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-25 21:50:58.329722+00	2026-09-22 23:07:00.148994+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	authenticated	authenticated	supervisor@restaurante.com	$2a$10$4Lvhn4f/V8jKSKVd2PP.A.drn2gEKMcB6BP5bElMxO5oZJ9U.a682	2026-08-25 21:49:51.571377+00	\N		\N		\N			\N	2026-09-23 14:03:25.86133+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-25 21:49:51.549318+00	2026-09-23 14:03:25.883851+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	95d704d5-5b55-45b5-8668-a3fbcc4c8137	authenticated	authenticated	\N		\N	\N		\N		\N			\N	2026-09-21 23:35:28.327494+00	{}	{}	\N	2026-09-21 23:35:28.318059+00	2026-09-21 23:35:28.330519+00	\N	\N			\N		0	\N		\N	f	\N	t
00000000-0000-0000-0000-000000000000	a264327b-95ef-47f8-ac8a-31a3bbb1439e	authenticated	authenticated	\N		\N	\N		\N		\N			\N	2026-09-22 23:18:19.588509+00	{}	{}	\N	2026-09-22 23:18:19.582062+00	2026-09-22 23:18:19.590824+00	\N	\N			\N		0	\N		\N	f	\N	t
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chats (id, mesa_id, cliente_id, fecha_apertura, fecha_cierre) FROM stdin;
\.


--
-- Data for Name: clientes_anonimos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clientes_anonimos (id, nombres, foto_url, fecha_ingreso) FROM stdin;
\.


--
-- Data for Name: mensajes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mensajes (id, chat_id, autor_id, cuerpo, fecha) FROM stdin;
\.


--
-- Data for Name: mesas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mesas (id, numero_mesa, cantidad_lugares, tipo, disponibilidad, cliente_id, qr_url, foto_url, fecha_creacion) FROM stdin;
36e7805f-940b-4d58-a261-116f0c77f157	1	2	Estándar	Ocupada	\N	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/qr/36e7805f-940b-4d58-a261-116f0c77f157-qr.png	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/mesas/mesa_1.jpg	2026-09-12 14:32:39.366075+00
ce07fabe-cbc6-4169-a91a-2bc7a917e896	2	4	Movilidad reducida	Ocupada	363bfe32-6da7-44f5-b97c-e87cea7fec8e	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/qr/ce07fabe-cbc6-4169-a91a-2bc7a917e896-qr.png	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/mesas/mesa_2.webp	2026-09-12 14:33:32.917782+00
57802893-010d-4ed7-ad41-961ce6d8e7ac	5	2	Estándar	Disponible	\N	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/qr/57802893-010d-4ed7-ad41-961ce6d8e7ac-qr.png	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/mesas/mesa_5.jpg	2026-09-12 14:30:40.785423+00
73428324-b87a-48bc-94f0-a4d9ff6ffd53	6	4	Estándar	Reservada	\N	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/qr/233-qr	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/mesas/mesa_6.avif	2026-09-04 23:38:15.458745+00
ad381473-6473-4ce2-a30e-9a93d590cb8a	3	2	VIP	Disponible	\N	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/qr/ad381473-6473-4ce2-a30e-9a93d590cb8a-qr.png	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/mesas/mesa_3.jpg	2026-09-12 14:34:07.59533+00
e33032da-f69b-41b2-8f44-b0c678bb3619	4	4	Movilidad reducida	Disponible	\N	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/qr/e33032da-f69b-41b2-8f44-b0c678bb3619-qr.png	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/mesas/mesa_4.jpg	2026-09-12 14:34:48.110211+00
\.


--
-- Data for Name: pedido_detalles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedido_detalles (id, pedido_id, producto_id, cantidad, precio_unitario, estado_producto) FROM stdin;
f183c980-b7c9-4827-9fc2-910393b683f8	6a0e212f-4bce-465c-a62f-183cef1ea450	1779c57d-49d1-4710-a7bb-f91d39f211c0	1	18500.00	Pendiente
3a5b7a24-3091-427d-8a71-b0dd52601add	6a0e212f-4bce-465c-a62f-183cef1ea450	abb7d1cf-2c4f-4f41-833e-4e8b6bdf3480	1	5900.00	Pendiente
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedidos (id, numero_pedido, mesa_id, cliente_id, estado, precio_total_neto, descuento_juego, propina_porcentaje, fecha) FROM stdin;
6a0e212f-4bce-465c-a62f-183cef1ea450	10	ce07fabe-cbc6-4169-a91a-2bc7a917e896	363bfe32-6da7-44f5-b97c-e87cea7fec8e	Pendiente de Confirmación	24400.00	0.00	0.00	2026-09-23 22:30:11.773924+00
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.productos (id, nombre, descripcion, tiempo_elaboracion_minutos, precio, fotos_urls, tipo, fecha_creacion) FROM stdin;
149428df-3015-46af-b257-0d2d0866877a	Bife de chorizo con puré	Bife de chorizo de 400 g a la parrilla con puré de papas y chimichurri casero.	30	24900.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/bife_de_chorizo_con_pure_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/bife_de_chorizo_con_pure_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/bife_de_chorizo_con_pure_3.jpg}	Comida	2026-09-17 01:34:44.072629+00
1779c57d-49d1-4710-a7bb-f91d39f211c0	Milanesa napolitana con papas fritas	Milanesa de ternera con salsa de tomate, jamón y mozzarella gratinada, acompañada de papas fritas.	25	18500.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/milanesa_napolitana_con_papas_fritas_1.avif,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/milanesa_napolitana_con_papas_fritas_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/milanesa_napolitana_con_papas_fritas_3.jpg}	Comida	2026-09-17 01:34:44.072629+00
378bed9a-aa76-46d9-a8d0-c47306a96512	Limonada de frutos rojos	Limonada natural con frutillas, arándanos y hielo frappé.	5	6500.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/limonada_de_frutos_rojos_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/limonada_de_frutos_rojos_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/limonada_de_frutos_rojos_3.jpg}	Bebida	2026-09-17 01:34:44.072629+00
003c8de7-0a6f-4769-bb2e-db22a8cd88fe	Flan casero mixto	Flan casero con dulce de leche y crema chantilly.	5	7200.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/flan_casero_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/flan_casero_2.webp,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/flan_casero_3.jpg}	Postre	2026-09-17 01:34:44.072629+00
46de9489-de35-4a6d-9f69-1c62cc99f4c5	Hamburguesa doble cheddar	Doble medallón de carne, cheddar, panceta crocante y cebolla caramelizada, con papas rústicas.	18	16200.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/hamburguesa_doble_con_cheddar_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/hamburguesa_doble_con_cheddar_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/hamburguesa_doble_con_cheddar_3.jpg}	Comida	2026-09-17 01:34:44.072629+00
73dd29f5-19c3-432c-834a-370e9b7a98b5	Volcán de chocolate con helado	Bizcocho tibio de chocolate con centro fundido y bocha de helado de americana.	15	9800.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/volcan_de_chocolate_con_helado_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/volcan_de_chocolate_con_helado_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/volcan_de_chocolate_con_helado_3.jpg}	Postre	2026-09-17 01:34:44.072629+00
80b1e591-9f56-438b-95b9-451ec2b4d411	Pollo grillado con ensalada	Suprema de pollo grillada con ensalada de hojas verdes, tomate cherry y zanahoria.	22	14500.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/pollo_grisado_con_ensalada_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/pollo_grisado_con_ensalada_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/pollo_grisado_con_ensalada_3.jpg}	Comida	2026-09-17 01:34:44.072629+00
9cb9e636-4a35-436c-8628-ec22cc62613c	Copa helada 3 gustos	Copa con tres bochas de helado a elección, salsa de chocolate y almendras.	5	8200.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/copa_helada_3_gustos_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/copa_helada_3_gustos_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/copa_helada_3_gustos_3.jpg}	Postre	2026-09-17 01:34:44.072629+00
9e1a134b-8f6c-41c0-96e6-c582c4639862	Ravioles de ricota con bolognesa	Ravioles caseros rellenos de ricota y espinaca con salsa bolognesa y queso rallado.	20	15800.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/ravioles_de_ricota_con_bolognesa_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/ravioles_de_ricota_con_bolognesa_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/ravioles_de_ricota_con_bolognesa_3.jpg}	Comida	2026-09-17 01:34:44.072629+00
abb7d1cf-2c4f-4f41-833e-4e8b6bdf3480	Cerveza artesanal IPA pinta	Pinta de cerveza artesanal estilo IPA, amarga y aromática.	2	5900.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/cerveza_artesanal_IPA_pinta_1.png,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/cerveza_artesanal_IPA_pinta_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/cerveza_artesanal_IPA_pinta_3.png}	Bebida	2026-09-17 01:34:44.072629+00
ba97410d-cc1e-41c2-8110-71446e78f265	Copa de vino Malbec	Copa de Malbec mendocino, ideal para acompañar carnes.	2	5500.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/copa_de_vino_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/copa_de_vino_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/copa_de_vino_3.jpg}	Bebida	2026-09-17 01:34:44.072629+00
e7241155-4baa-4154-83b8-b23038028262	Panqueques con dulce de leche	Dos panqueques rellenos de dulce de leche, caramelizados con azúcar.	10	7500.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/panqueques_con_dulce_de_leche_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/panqueques_con_dulce_de_leche_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/panqueques_con_dulce_de_leche_3.jpg}	Postre	2026-09-17 01:34:44.072629+00
ff55091c-ed19-4d2b-8aed-9337309e0c52	Tiramisú	Clásico tiramisú con mascarpone, café y cacao amargo.	5	8900.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/tiramisu_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/tiramisu_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/tiramisu_3.jpg}	Postre	2026-09-17 01:34:44.072629+00
ed95e2e5-2057-41ad-ba2f-ac26aad9b498	Jugo de naranja exprimido	Vaso de 400 ml de jugo de naranja natural exprimido en el momento.	4	4800.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/jugo_de_naranja_exprimido_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/jugo_de_naranja_exprimido_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/jugo_de_naranja_exprimido_3.jpg}	Bebida	2026-09-17 01:34:44.072629+00
38018b11-33a4-46f2-88da-ab71c6eaad7a	Licuado de banana con leche	Licuado cremoso de banana con leche entera, servido frío.	5	5200.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/licuado_de_banana_con_leche_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/licuado_de_banana_con_leche_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/licuado_de_banana_con_leche_3.jpg}	Bebida	2026-09-17 01:34:44.072629+00
5173956f-31ea-4bdd-8c74-a092cc6c2927	Agua mineral sin gas 500 ml	Botella individual de agua mineral natural sin gas, servida fría.	1	2800.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/agua_sin_gas_1.jpeg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/agua_sin_gas_2.jpeg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/agua_sin_gas_3.jpeg}	Bebida	2026-09-17 03:09:06.247467+00
263bcd94-7c7a-4c17-a743-b2b397d49bef	Coca-Cola 354 ml lata	Lata de Coca-Cola sabor original, servida bien fría con hielo.	1	3200.00	{https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/coca-cola_lata_1.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/coca-cola_lata_2.jpg,https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/productos/coca-cola_lata_3.jpg}	Bebida	2026-09-17 03:09:06.247467+00
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, apellidos, nombres, dni, cuil, correo_electronico, perfil, foto_url, estado, fecha_registro, token_push, estado_en_resto, mesa_id) FROM stdin;
fa1f5f64-5a23-4359-93de-a69deecdd6df	Demo	Maître	30000003	22300000032	metre@restaurante.com	metre	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/usuarios/foto_0_1789428423428.jpg	Activo	2026-08-29 22:15:24.895147+00	\N	\N	\N
363bfe32-6da7-44f5-b97c-e87cea7fec8e	Jeremias	Nicolas	12345678		nd.jeremias@live.com	cliente registrado	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/usuarios/foto_0_1790202365217.jpg	Activo	2026-09-23 22:26:21.641977+00	\N	sentado	ce07fabe-cbc6-4169-a91a-2bc7a917e896
f66c5d58-c6f1-4598-b2f4-b06dd7a9a58a	Demo	Mozo	30000004	22300000042	mozo@restaurante.com	mozo	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/usuarios/foto_0_1789428422193.png	Activo	2026-08-29 22:15:24.895147+00	\N	\N	\N
d6dba4da-1598-4e53-ac2e-cfe47c76fd68	Demo	Supervisor	30000002	22300000022	supervisor@restaurante.com	supervisor	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/usuarios/foto_0_1789428417917.webp	Activo	2026-08-29 22:15:24.895147+00	\N	\N	\N
0eda206f-34b4-4997-9e93-486c82af04b1	Demo	Dueño	30000001	22300000012	duenio@restaurante.com	dueño	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/usuarios/foto_0_1789428418982.jpg	Activo	2026-08-29 22:15:24.895147+00	\N	libre	\N
268c6ca3-9187-4659-b644-964ea7ec542f	Demo	Cocinero	30000005	22300000052	cocinero@restaurante.com	cocinero	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/usuarios/foto_0_1789428420649.webp	Activo	2026-08-29 22:15:24.895147+00	\N	\N	\N
48a5b03b-3675-4efb-b230-9266023919a9	Demo	Cantinero	30000007	22300000072	cantinero@restaurante.com	cantinero	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/usuarios/foto_0_1789428422821.webp	Activo	2026-09-02 21:00:38.716547+00	\N	\N	\N
16dfbda1-6f81-4362-86b8-885e54a2a22a	Demo	Cliente	30000006	\N	cliente@restaurante.com	cliente registrado	https://uwmptccyleznngdazgrp.supabase.co/storage/v1/object/public/Fotos/usuarios/foto_0_1789429109336.webp	Activo	2026-08-29 22:15:24.895147+00	\N	sentado	\N
\.


--
-- Data for Name: messages_2026_09_20; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_09_20 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_21; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_09_21 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_22; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_09_22 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_23; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_09_23 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_24; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_09_24 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_25; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_09_25 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: messages_2026_09_26; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_09_26 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload, skip_broadcast) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-08-03 15:05:56
20211116045059	2026-08-03 15:05:56
20211116050929	2026-08-03 15:05:56
20211116051442	2026-08-03 15:05:56
20211116212300	2026-08-03 15:05:56
20211116213355	2026-08-03 15:05:56
20211116213934	2026-08-03 15:05:56
20211116214523	2026-08-03 15:05:56
20211122062447	2026-08-03 15:05:56
20211124070109	2026-08-03 15:05:56
20211202204204	2026-08-03 15:05:56
20211202204605	2026-08-03 15:05:56
20211210212804	2026-08-03 15:05:56
20211228014915	2026-08-03 15:05:56
20220107221237	2026-08-03 15:05:56
20220228202821	2026-08-03 15:05:56
20220312004840	2026-08-03 15:05:56
20220603231003	2026-08-03 15:05:56
20220603232444	2026-08-03 15:05:56
20220615214548	2026-08-03 15:05:56
20220712093339	2026-08-03 15:05:56
20220908172859	2026-08-03 15:05:56
20220916233421	2026-08-03 15:05:56
20230119133233	2026-08-03 15:05:56
20230128025114	2026-08-03 15:05:56
20230128025212	2026-08-03 15:05:56
20230227211149	2026-08-03 15:05:56
20230228184745	2026-08-03 15:05:56
20230308225145	2026-08-03 15:05:56
20230328144023	2026-08-03 15:05:56
20231018144023	2026-08-03 15:05:56
20231204144023	2026-08-03 15:05:56
20231204144024	2026-08-03 15:05:56
20231204144025	2026-08-03 15:05:56
20240108234812	2026-08-03 15:05:56
20240109165339	2026-08-03 15:05:56
20240227174441	2026-08-03 15:05:56
20240311171622	2026-08-03 15:05:56
20240321100241	2026-08-03 15:05:56
20240401105812	2026-08-03 15:05:56
20240418121054	2026-08-03 15:05:56
20240523004032	2026-08-03 15:05:56
20240618124746	2026-08-03 15:05:56
20240801235015	2026-08-03 15:05:56
20240805133720	2026-08-03 15:05:56
20240827160934	2026-08-03 15:05:56
20240919163303	2026-08-03 15:05:56
20240919163305	2026-08-03 15:05:56
20241019105805	2026-08-03 15:05:56
20241030150047	2026-08-03 15:05:56
20241108114728	2026-08-03 15:05:56
20241121104152	2026-08-03 15:05:56
20241130184212	2026-08-03 15:05:56
20241220035512	2026-08-03 15:05:56
20241220123912	2026-08-03 15:05:56
20241224161212	2026-08-03 15:05:56
20250107150512	2026-08-03 15:05:56
20250110162412	2026-08-03 15:05:56
20250123174212	2026-08-03 15:05:56
20250128220012	2026-08-03 15:05:56
20250506224012	2026-08-03 15:05:56
20250523164012	2026-08-03 15:05:56
20250714121412	2026-08-03 15:05:56
20250905041441	2026-08-03 15:05:56
20251103001201	2026-08-03 15:05:56
20251120212548	2026-08-03 15:05:56
20251120215549	2026-08-03 15:05:56
20260218120000	2026-08-03 15:05:56
20260326120000	2026-08-03 15:05:56
20260514120000	2026-08-03 15:05:56
20260527120000	2026-08-03 15:05:56
20260528120000	2026-08-03 15:05:56
20260603120000	2026-08-03 15:05:56
20260605120000	2026-08-03 15:05:56
20260606110000	2026-08-03 15:05:56
20260616120000	2026-08-03 15:05:56
20260624120000	2026-08-03 15:05:56
20260626120000	2026-08-03 15:05:56
20260706120000	2026-08-03 15:05:56
20260707120000	2026-08-03 15:05:56
20260709120000	2026-08-03 15:05:56
20260714120000	2026-09-04 01:23:55
20260827120000	2026-09-15 22:52:11
20260914120000	2026-09-21 22:50:15
20260916120000	2026-09-21 22:50:15
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type, versioning_status, lifecycle_configuration, lifecycle_configuration_generation) FROM stdin;
Fotos	Fotos	\N	2026-08-03 15:08:13.585314+00	2026-08-03 15:08:13.585314+00	t	f	\N	\N	\N	STANDARD	DISABLED	\N	\N
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-08-03 12:56:36.288316
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-08-03 12:56:36.332799
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-08-03 12:56:36.337478
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-08-03 12:56:36.37649
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-08-03 12:56:36.396269
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-08-03 12:56:36.401011
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-08-03 12:56:36.407918
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-08-03 12:56:36.412807
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-08-03 12:56:36.416398
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-08-03 12:56:36.420421
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-08-03 12:56:36.426054
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-08-03 12:56:36.432512
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-08-03 12:56:36.436877
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-08-03 12:56:36.440719
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-08-03 12:56:36.444484
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-08-03 12:56:36.509446
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-08-03 12:56:36.513362
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-08-03 12:56:36.517195
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-08-03 12:56:36.522284
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-08-03 12:56:36.52789
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-08-03 12:56:36.533345
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-08-03 12:56:36.540395
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-08-03 12:56:36.568697
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-08-03 12:56:36.583858
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-08-03 12:56:36.588163
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-08-03 12:56:36.592008
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-08-03 12:56:36.598973
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-08-03 12:56:36.602273
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-08-03 12:56:36.605539
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-08-03 12:56:36.614694
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-08-03 12:56:36.618123
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-08-03 12:56:36.62147
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-08-03 12:56:36.624855
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-08-03 12:56:36.627867
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-08-03 12:56:36.631328
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-08-03 12:56:36.635108
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-08-03 12:56:36.638876
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-08-03 12:56:36.642374
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-08-03 12:56:36.646857
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-08-03 12:56:36.662647
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-08-03 12:56:36.667141
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-08-03 12:56:36.671036
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-08-03 12:56:36.674996
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-08-03 12:56:36.67846
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-08-03 12:56:36.682618
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-08-03 12:56:36.688441
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-08-03 12:56:36.701657
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-08-03 12:56:36.706584
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-08-03 12:56:36.710165
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-08-03 12:56:36.743772
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-08-03 12:56:36.747916
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-08-03 12:56:37.870974
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-08-03 12:56:37.903703
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-08-03 12:56:37.953427
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-08-03 12:56:37.956063
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-08-03 12:56:37.957813
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-08-03 12:56:37.967871
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-08-03 12:56:37.978966
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-08-03 12:56:37.985634
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-08-03 12:56:37.99088
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-08-03 12:56:37.995237
61	mark-filename-immutable	fe0096517ae9d60aaec1d110172ba9036dc66bb7	2026-08-13 09:45:37.534858
62	object-versioning-core	0b855f00ff3be0bfca91efee02a9858912491a9a	2026-08-22 23:41:35.029175
63	fix-search-name-relative-to-prefix	c7485e417624f795ce8bb2da21927f48e088904d	2026-08-23 18:03:47.84484
64	fix-search-by-timestamp-sqli	0af424ecd388a39bb1645184b222185a12149675	2026-08-23 18:03:47.898806
66	objects-current-version-index	191466c93aa2c46a00e36505577c5fcab8d7cb4b	2026-09-07 18:02:50.513894
67	objects-null-version-index	15bfe8c35b66642b6c78ba60060fa8793bd2207a	2026-09-07 18:02:50.519667
65	objects-key-version-index	da319c4b89ba800ce795d1b699f3a70675138058	2026-09-07 18:02:50.505317
68	bucket-lifecycle-configuration	3c08f6f889922f399519722a932b51007c11bebc	2026-09-21 21:48:35.045224
69	validate-bucket-lifecycle-constraints	4febacaaaa0e61e2b783bef081fe03a287e65eb3	2026-09-21 21:48:35.069482
70	list-objects-with-versions	5c17c3777616cd8d7b18b82835525fa3205af57b	2026-09-21 21:48:35.078674
71	objects-delete-marker-index	6d14858e66c66f8d6accf8a2630aefd1527fddba	2026-09-21 21:48:36.06776
72	drop-bucketid-objname-index	302beb09e1b469d7d4db19566f2389d280b64aa3	2026-09-21 21:48:36.177612
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, archived_at, is_delete_marker, is_versioned) FROM stdin;
0858f51b-2df1-4f3e-872b-0f497d8f3892	Fotos	usuarios/anonimo_ff3d43c1-c817-4fb9-a402-698c1096222e.jpg	ff3d43c1-c817-4fb9-a402-698c1096222e	2026-09-03 21:58:44.614147+00	2026-09-03 21:58:44.614147+00	2026-09-03 21:58:44.614147+00	{"eTag": "\\"e486378ec3a00c9c947d23a5509199d7\\"", "size": 407310, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-03T21:58:45.000Z", "contentLength": 407310, "httpStatusCode": 200}	c037f445-b20d-4084-aaa5-225083ff9f06	ff3d43c1-c817-4fb9-a402-698c1096222e	{}	\N	f	f
d307c210-183d-4015-a957-e7b4b2c111ae	Fotos	usuarios/foto_0_1789432966079.jpg	\N	2026-09-15 00:42:56.470506+00	2026-09-15 00:42:56.470506+00	2026-09-15 00:42:56.470506+00	{"eTag": "\\"6a196bb65ac59b87845d79128254b40a\\"", "size": 43243, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T00:42:57.000Z", "contentLength": 43243, "httpStatusCode": 200}	aab9c88d-10da-4078-8aae-5fbc7cce052f	\N	{}	\N	f	f
c9a46eb4-8396-4084-ab29-6bac7a68785b	Fotos	qr/5602239a-b958-4239-bf0a-fa35579a9087-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-15 14:23:19.660283+00	2026-09-15 14:23:19.660283+00	2026-09-15 14:23:19.660283+00	{"eTag": "\\"0154276655fb95900665dcf24d27a296\\"", "size": 6856, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T14:23:20.000Z", "contentLength": 6856, "httpStatusCode": 200}	e7da463f-7101-4553-8bfd-3481140770a4	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
fe970cff-f465-4261-a898-ebf3bfc9142b	Fotos	productos/c0558fd4-727e-451d-9dab-79ee789c4176-foto_0_1789773707180.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-18 23:22:08.493658+00	2026-09-18 23:22:08.493658+00	2026-09-18 23:22:08.493658+00	{"eTag": "\\"1e08c7ff083921dff762c263cad2ac2e\\"", "size": 1826042, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:22:09.000Z", "contentLength": 1826042, "httpStatusCode": 200}	7f2f1150-c50a-4f9b-91c6-c8fd3dca4d0f	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
f0a2dff5-b691-489f-9103-f880801b2b89	Fotos	screenshots/boceto.png	\N	2026-08-28 00:42:14.441399+00	2026-08-28 00:42:14.441399+00	2026-08-28 00:42:14.441399+00	{"eTag": "\\"8d4e20933682a833a030aaba80d62e31-1\\"", "size": 1926185, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T00:42:14.000Z", "contentLength": 1926185, "httpStatusCode": 200}	d187b89f-0ed8-42d7-a6cf-838d859dad8a	\N	\N	\N	f	f
92461931-d177-4b6c-88ce-22fe6d36cbb6	Fotos	usuarios/foto_0_1787926896469.jpg	\N	2026-08-28 14:22:06.40252+00	2026-08-28 14:22:06.40252+00	2026-08-28 14:22:06.40252+00	{"eTag": "\\"290aa640e917da3966204218905c3056\\"", "size": 98856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T14:22:07.000Z", "contentLength": 98856, "httpStatusCode": 200}	23ed55bc-7dc7-4dde-a428-a77959d16fdf	\N	{}	\N	f	f
53325449-9170-432e-9064-5191a4366711	Fotos	usuarios/foto_0_1787928524465.jpg	03f63993-7cec-4ace-987e-d8ee3f7e12a8	2026-08-28 14:48:45.808469+00	2026-08-28 14:48:45.808469+00	2026-08-28 14:48:45.808469+00	{"eTag": "\\"290aa640e917da3966204218905c3056\\"", "size": 98856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T14:48:46.000Z", "contentLength": 98856, "httpStatusCode": 200}	253d652f-855c-48d9-8216-375b68dddbfe	03f63993-7cec-4ace-987e-d8ee3f7e12a8	{}	\N	f	f
2903bf39-3030-4bb5-b36e-0aab4bfb1754	Fotos	usuarios/foto_0_1787928719826.jpg	03f63993-7cec-4ace-987e-d8ee3f7e12a8	2026-08-28 14:52:01.528519+00	2026-08-28 14:52:01.528519+00	2026-08-28 14:52:01.528519+00	{"eTag": "\\"94b11f7ee6485ee2c61b57d146fd706c\\"", "size": 88076, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T14:52:02.000Z", "contentLength": 88076, "httpStatusCode": 200}	74062d5c-f41f-4988-83af-1651076cab8a	03f63993-7cec-4ace-987e-d8ee3f7e12a8	{}	\N	f	f
6ce6f657-2d1e-44f1-9d8e-879bd622ccd9	Fotos	usuarios/foto_0_1787928868169.jpg	03f63993-7cec-4ace-987e-d8ee3f7e12a8	2026-08-28 14:54:29.441471+00	2026-08-28 14:54:29.441471+00	2026-08-28 14:54:29.441471+00	{"eTag": "\\"0b02b318b9a23ef75f23898823596db9\\"", "size": 60333, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T14:54:30.000Z", "contentLength": 60333, "httpStatusCode": 200}	ebb87e9c-e00b-40c1-87dc-5f9bc967c86e	03f63993-7cec-4ace-987e-d8ee3f7e12a8	{}	\N	f	f
e831ac7e-b05e-40d5-a086-722c9f7fb1ab	Fotos	usuarios/foto_0_1787928956519.jpg	\N	2026-08-28 14:55:57.716675+00	2026-08-28 14:55:57.716675+00	2026-08-28 14:55:57.716675+00	{"eTag": "\\"290aa640e917da3966204218905c3056\\"", "size": 98856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T14:55:58.000Z", "contentLength": 98856, "httpStatusCode": 200}	53c63944-99e1-4497-a41d-c57acd75da5f	\N	{}	\N	f	f
cfcc0fd1-94cc-454d-93a8-43d9f80753f4	Fotos	usuarios/foto_0_1787928985013.jpg	\N	2026-08-28 14:56:29.594576+00	2026-08-28 14:56:29.594576+00	2026-08-28 14:56:29.594576+00	{"eTag": "\\"0b02b318b9a23ef75f23898823596db9\\"", "size": 60333, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T14:56:30.000Z", "contentLength": 60333, "httpStatusCode": 200}	63c1b888-8649-4561-bf30-7c1634f02168	\N	{}	\N	f	f
de74b240-348b-4e64-98f2-d146ae605e78	Fotos	usuarios/foto_0_1787929515915.jpg	0b0472ce-3dbf-44c2-8db5-627b579ed794	2026-08-28 15:05:17.66501+00	2026-08-28 15:05:17.66501+00	2026-08-28 15:05:17.66501+00	{"eTag": "\\"290aa640e917da3966204218905c3056\\"", "size": 98856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T15:05:18.000Z", "contentLength": 98856, "httpStatusCode": 200}	b9a4d410-dddd-43c5-998f-68b29a131b69	0b0472ce-3dbf-44c2-8db5-627b579ed794	{}	\N	f	f
4e838427-8465-4bad-8cc1-a2f4343f9ec1	Fotos	usuarios/foto_0_1787929555233.jpg	0b0472ce-3dbf-44c2-8db5-627b579ed794	2026-08-28 15:05:56.50321+00	2026-08-28 15:05:56.50321+00	2026-08-28 15:05:56.50321+00	{"eTag": "\\"94b11f7ee6485ee2c61b57d146fd706c\\"", "size": 88076, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T15:05:57.000Z", "contentLength": 88076, "httpStatusCode": 200}	dba25493-f836-4197-9f35-9d0ea6a70159	0b0472ce-3dbf-44c2-8db5-627b579ed794	{}	\N	f	f
051f767e-7bad-4dcd-a78a-72da3a770a02	Fotos	usuarios/foto_0_1787929606008.jpg	0b0472ce-3dbf-44c2-8db5-627b579ed794	2026-08-28 15:06:46.878776+00	2026-08-28 15:06:46.878776+00	2026-08-28 15:06:46.878776+00	{"eTag": "\\"db40e8c1a9e04f5fde4c08cb4d97a558\\"", "size": 90356, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T15:06:47.000Z", "contentLength": 90356, "httpStatusCode": 200}	7a74ad04-b0e6-4be9-af22-e2bfb2325eba	0b0472ce-3dbf-44c2-8db5-627b579ed794	{}	\N	f	f
88fbfa15-968a-4253-8118-070109aa8634	Fotos	usuarios/foto_0_1787929820428.jpg	\N	2026-08-28 15:10:21.91731+00	2026-08-28 15:10:21.91731+00	2026-08-28 15:10:21.91731+00	{"eTag": "\\"290aa640e917da3966204218905c3056\\"", "size": 98856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T15:10:22.000Z", "contentLength": 98856, "httpStatusCode": 200}	7f926cd2-910d-465e-ba8b-a16d74573b88	\N	{}	\N	f	f
d6253dd7-e77d-4564-ae54-435ee34207ad	Fotos	usuarios/anonimo_729e5cf3-13f8-412d-979e-853d4ea81f01.jpg	729e5cf3-13f8-412d-979e-853d4ea81f01	2026-09-10 22:01:04.615044+00	2026-09-10 22:01:04.615044+00	2026-09-10 22:01:04.615044+00	{"eTag": "\\"61cf19ad79c40afb7f40c3703d4d001c\\"", "size": 2259761, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-10T22:01:05.000Z", "contentLength": 2259761, "httpStatusCode": 200}	62edb25d-753c-43de-8972-9bf93ed534bc	729e5cf3-13f8-412d-979e-853d4ea81f01	{}	\N	f	f
ada49911-2d6f-479e-85fa-c33edc4f473b	Fotos	usuarios/foto_0_1787930176362.jpg	\N	2026-08-28 15:16:17.167289+00	2026-08-28 15:16:17.167289+00	2026-08-28 15:16:17.167289+00	{"eTag": "\\"db40e8c1a9e04f5fde4c08cb4d97a558\\"", "size": 90356, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T15:16:18.000Z", "contentLength": 90356, "httpStatusCode": 200}	7c22cad8-166a-4ac6-90a7-0c8ad19ce500	\N	{}	\N	f	f
e4585d1e-a028-4e63-af8c-00bc9a8a5d2d	Fotos	usuarios/anonimo_b3911eb1-e1ea-435f-a290-d083aae26cf7.jpg	b3911eb1-e1ea-435f-a290-d083aae26cf7	2026-09-04 01:47:07.259789+00	2026-09-04 01:47:07.259789+00	2026-09-04 01:47:07.259789+00	{"eTag": "\\"defcff94f6e1d169cfe1d1294cc7c910\\"", "size": 53038, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-04T01:47:08.000Z", "contentLength": 53038, "httpStatusCode": 200}	07b4c21a-2a85-4970-be8d-e3bd4e4ca94e	b3911eb1-e1ea-435f-a290-d083aae26cf7	{}	\N	f	f
dcb49c30-b7b1-42fc-ba36-794b79529b07	Fotos	usuarios/foto_0_1787937178215.jpg	\N	2026-08-28 17:13:10.996172+00	2026-08-28 17:13:10.996172+00	2026-08-28 17:13:10.996172+00	{"eTag": "\\"c9bcee3ba35379aa53823316822cab2f\\"", "size": 87979, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-28T17:13:11.000Z", "contentLength": 87979, "httpStatusCode": 200}	4308769a-b5ca-4131-a8b4-14768a40c59f	\N	{}	\N	f	f
0d384577-a76b-4789-988d-43e84dfb9e38	Fotos	qr/3694e06c-9dbc-4eba-9054-8684984b896b-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 23:04:29.714039+00	2026-09-21 23:04:29.714039+00	2026-09-21 23:04:29.714039+00	{"eTag": "\\"c673e44304b1e0deec8e78abe4e73cf4\\"", "size": 4935, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:04:30.000Z", "contentLength": 4935, "httpStatusCode": 200}	dba2d694-a107-44fe-a7d6-dfaf629f3b5f	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
52ffd094-53d9-494f-ad31-5c419be135bc	Fotos	usuarios/foto_0_1788043193322.jpg	\N	2026-08-29 22:40:02.509327+00	2026-08-29 22:40:02.509327+00	2026-08-29 22:40:02.509327+00	{"eTag": "\\"290aa640e917da3966204218905c3056\\"", "size": 98856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-29T22:40:03.000Z", "contentLength": 98856, "httpStatusCode": 200}	41c694fd-be6f-420d-9b0f-1cd7e54b9222	\N	{}	\N	f	f
c689f957-92f6-4f41-80d9-e2f8acb248f4	Fotos	usuarios/foto_0_1789225621353.jpg	\N	2026-09-12 15:07:08.362603+00	2026-09-12 15:07:08.362603+00	2026-09-12 15:07:08.362603+00	{"eTag": "\\"cdee6134cbd99f82e4880789ed78270b\\"", "size": 293201, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T15:07:09.000Z", "contentLength": 293201, "httpStatusCode": 200}	5ee464fa-df56-4b03-997e-ebcae5da3ecc	\N	{}	\N	f	f
a710027b-cccb-4220-beaf-859ee408e990	Fotos	usuarios/foto_0_1788043418934.jpg	\N	2026-08-29 22:43:46.08125+00	2026-08-29 22:43:46.08125+00	2026-08-29 22:43:46.08125+00	{"eTag": "\\"290aa640e917da3966204218905c3056\\"", "size": 98856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-29T22:43:47.000Z", "contentLength": 98856, "httpStatusCode": 200}	de35f4be-e54a-4987-b493-22fe015a415f	\N	{}	\N	f	f
69ad60de-9df4-4b96-ae11-93606b7bb1c1	Fotos	productos/bife_de_chorizo_con_pure_3.jpg	\N	2026-09-17 02:48:11.835341+00	2026-09-17 02:48:11.835341+00	2026-09-17 02:48:11.835341+00	{"eTag": "\\"ec6df0ed5b3b8beb26ad8115fc18d3b6-1\\"", "size": 44621, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:48:12.000Z", "contentLength": 44621, "httpStatusCode": 200}	9e0d482d-8526-43d1-86c8-7991e6bd5e5d	\N	\N	\N	f	f
fc5ba8de-33b3-408a-98b4-54f95eea687e	Fotos	assets/logo-blanco.png	\N	2026-09-14 20:50:32.434644+00	2026-09-14 20:50:32.434644+00	2026-09-14 20:50:32.434644+00	{"eTag": "\\"e4bddc29b8394b5866dd1a32f0644df6-1\\"", "size": 206002, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T20:50:32.000Z", "contentLength": 206002, "httpStatusCode": 200}	219e0918-6777-40c9-abdf-b2c89ba7abc0	\N	\N	\N	f	f
ac080a1c-6c0b-4676-993c-670682a69729	Fotos	productos/ea784c10-2a17-464d-a54c-f3d1baa1ae14-foto_1_1789773717041.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-18 23:22:10.815658+00	2026-09-18 23:22:10.815658+00	2026-09-18 23:22:10.815658+00	{"eTag": "\\"04582d0588d819a27a7d4c6b76e48cef\\"", "size": 1676780, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:22:11.000Z", "contentLength": 1676780, "httpStatusCode": 200}	abd6fae6-069c-46cd-bcea-42f3089e7675	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
1b21ec32-7077-4aa9-bae9-d8734d66332b	Fotos	mesas/mesa99-foto-1790031870493.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 23:04:33.072597+00	2026-09-21 23:04:33.072597+00	2026-09-21 23:04:33.072597+00	{"eTag": "\\"18ed63773c81c0d0621bf98b70a02962\\"", "size": 7855331, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:04:33.000Z", "contentLength": 7855331, "httpStatusCode": 200}	3030b143-0f1c-4817-88f6-4e5654127fa6	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
45ce793e-4a6e-419f-96e7-c65b3c374f60	Fotos	productos/fd932303-203a-40fd-9a14-3dfb6581fcc4-foto_2_1789773723970.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-18 23:22:12.308416+00	2026-09-18 23:22:12.308416+00	2026-09-18 23:22:12.308416+00	{"eTag": "\\"661cadf1f504e23a67f0fbf765981485\\"", "size": 1875044, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:22:13.000Z", "contentLength": 1875044, "httpStatusCode": 200}	4b3ea046-e226-4e44-a245-d4ad45f6bbef	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
798cd8b8-7477-4c87-a59f-5f0f1ca8d495	Fotos	productos/bife_de_chorizo_con_pure_2.jpg	\N	2026-09-17 02:48:11.80123+00	2026-09-17 02:48:11.80123+00	2026-09-17 02:48:11.80123+00	{"eTag": "\\"dd767ea03c42587373fb1ee8b84b1684-1\\"", "size": 33257, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:48:12.000Z", "contentLength": 33257, "httpStatusCode": 200}	1bbb7410-cd91-4d17-9dd7-0d11b85fb3b4	\N	\N	\N	f	f
9686863f-15e7-437b-b1d6-87508ca69d32	Fotos	usuarios/foto_0_1789474617602.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-15 12:17:24.800636+00	2026-09-15 12:17:24.800636+00	2026-09-15 12:17:24.800636+00	{"eTag": "\\"f0b7a90b1dc28a34404936f8db916f10\\"", "size": 38652, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T12:17:25.000Z", "contentLength": 38652, "httpStatusCode": 200}	fb6a5e24-790b-41e7-a1e1-26b721b6b7fb	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
856415eb-3553-43e5-b384-ed3c7ee29fd4	Fotos	usuarios/foto_0_1790031954816.jpg	\N	2026-09-21 23:06:45.183676+00	2026-09-21 23:06:45.183676+00	2026-09-21 23:06:45.183676+00	{"eTag": "\\"c5928d1a3e574f3ed58d60895c12772b\\"", "size": 1678449, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:06:46.000Z", "contentLength": 1678449, "httpStatusCode": 200}	fc42cd22-f7e1-412c-8cab-4cfa31447086	\N	{}	\N	f	f
1cf50eec-1b6e-45bd-bcf3-4821983692b8	Fotos	usuarios/anonimo_13b5eddf-aca2-44a1-ae34-9eb9c2b49821.jpg	13b5eddf-aca2-44a1-ae34-9eb9c2b49821	2026-09-04 01:58:45.263151+00	2026-09-04 01:58:45.263151+00	2026-09-04 01:58:45.263151+00	{"eTag": "\\"1d6de1caf89d210aa99214537f09d5cf\\"", "size": 117968, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-04T01:58:46.000Z", "contentLength": 117968, "httpStatusCode": 200}	b162848f-c802-4264-a8df-55807dcec9fe	13b5eddf-aca2-44a1-ae34-9eb9c2b49821	{}	\N	f	f
36d75086-85ae-4c19-ab28-599ab2b7c8ed	Fotos	usuarios/anonimo_1788308734828.jpg	\N	2026-09-02 00:25:35.255418+00	2026-09-02 00:25:35.255418+00	2026-09-02 00:25:35.255418+00	{"eTag": "\\"037102535adbc7dee26efa94acc283b3\\"", "size": 53352, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-02T00:25:36.000Z", "contentLength": 53352, "httpStatusCode": 200}	f5e0263c-1b82-40bd-8a2a-0d0c77fa4d05	\N	{}	\N	f	f
803afaef-22f5-451e-99ec-5eaf206ba97c	Fotos	qr/0c0756ab-77ea-421a-98c7-2101513a210c-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-15 14:24:59.146622+00	2026-09-15 14:24:59.146622+00	2026-09-15 14:24:59.146622+00	{"eTag": "\\"fa8dcb2125992d4cdc8cf1af0f977d2b\\"", "size": 6978, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T14:25:00.000Z", "contentLength": 6978, "httpStatusCode": 200}	db56123b-f768-4f33-b683-0fe3bdfc65f5	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
79f0f510-756e-4ce4-a197-51c9d3daacfc	Fotos	usuarios/anonimo_1788308831996.jpg	\N	2026-09-02 00:27:11.812599+00	2026-09-02 00:27:11.812599+00	2026-09-02 00:27:11.812599+00	{"eTag": "\\"290aa640e917da3966204218905c3056\\"", "size": 98856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-02T00:27:12.000Z", "contentLength": 98856, "httpStatusCode": 200}	25e84526-7321-4896-9c92-a59a8748f29e	\N	{}	\N	f	f
11e6ed3b-f727-4aa9-a7b4-026d10bcfdca	Fotos	usuarios/anonimo_2db3be76-9f0f-4430-b1d9-794e67fda0c7.jpg	2db3be76-9f0f-4430-b1d9-794e67fda0c7	2026-09-21 23:19:51.584715+00	2026-09-21 23:19:51.584715+00	2026-09-21 23:19:51.584715+00	{"eTag": "\\"d2d4453bb4932053f58465a0187e35cd\\"", "size": 3789363, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:19:52.000Z", "contentLength": 3789363, "httpStatusCode": 200}	e982914f-7687-4955-854b-7feeb2f7b35a	2db3be76-9f0f-4430-b1d9-794e67fda0c7	{}	\N	f	f
85d72a97-4395-4b72-8b77-5fbfe3c1aecb	Fotos	productos/agua_sin_gas_3.jpeg	\N	2026-09-17 03:11:45.694667+00	2026-09-17 03:11:45.694667+00	2026-09-17 03:11:45.694667+00	{"eTag": "\\"27957ebe823effbbb75635332b46eba6-1\\"", "size": 8876, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:11:46.000Z", "contentLength": 8876, "httpStatusCode": 200}	63ff789a-d394-4ee6-b94d-fe55c71fed6b	\N	\N	\N	f	f
9ca7caaf-0b4b-48ea-96e3-765a2860e8d9	Fotos	usuarios/anonimo_9d12ee75-4b94-4531-b061-9fd28c5facca.jpg	9d12ee75-4b94-4531-b061-9fd28c5facca	2026-09-21 23:30:16.11972+00	2026-09-21 23:30:16.11972+00	2026-09-21 23:30:16.11972+00	{"eTag": "\\"10e1330bc1b960c697861c08b17b2190\\"", "size": 3374432, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:30:17.000Z", "contentLength": 3374432, "httpStatusCode": 200}	ddd20964-9fd5-460f-a812-74ab57df11a1	9d12ee75-4b94-4531-b061-9fd28c5facca	{}	\N	f	f
cf0d6e1c-3c6a-4b0b-8af4-fc6e4420d8c7	Fotos	productos/coca-cola_lata_2.jpg	\N	2026-09-17 03:11:50.559047+00	2026-09-17 03:11:50.559047+00	2026-09-17 03:11:50.559047+00	{"eTag": "\\"21e1588c015bebc069ae53cfc96b673e-1\\"", "size": 19874, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:11:51.000Z", "contentLength": 19874, "httpStatusCode": 200}	1cad6581-b569-4f12-944b-3a5f0dacef8a	\N	\N	\N	f	f
8a4e6bfd-2dd7-4d3e-a743-578c3a2a1508	Fotos	usuarios/foto_0_1789774801309.jpg	\N	2026-09-18 23:41:40.339862+00	2026-09-18 23:41:40.339862+00	2026-09-18 23:41:40.339862+00	{"eTag": "\\"2a0ea5b81e81093cdae160c832a5aa84\\"", "size": 11670216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:41:41.000Z", "contentLength": 11670216, "httpStatusCode": 200}	80383a6f-0e15-4417-b373-4646917c715c	\N	{}	\N	f	f
97af1725-e891-4feb-a863-0f96c6bce78d	Fotos	usuarios/foto_0_1789775005600.jpg	\N	2026-09-18 23:43:58.145028+00	2026-09-18 23:43:58.145028+00	2026-09-18 23:43:58.145028+00	{"eTag": "\\"49f28a7b3b4af920d44ea0b7b9b5751e\\"", "size": 7883003, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:43:59.000Z", "contentLength": 7883003, "httpStatusCode": 200}	d101801d-1942-40cd-b83d-756190f09caa	\N	{}	\N	f	f
fe9bd1ee-f318-4c3f-845a-7d7b30a93e0e	Fotos	usuarios/anonimo_41e8686f-1408-4af8-9835-eb26551c5dba.jpg	41e8686f-1408-4af8-9835-eb26551c5dba	2026-09-18 23:45:50.80349+00	2026-09-18 23:45:50.80349+00	2026-09-18 23:45:50.80349+00	{"eTag": "\\"86f37730e77b6b95de83468faa48d574\\"", "size": 3438944, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:45:51.000Z", "contentLength": 3438944, "httpStatusCode": 200}	5fe371c4-1351-40ae-9dad-5edadd550ca6	41e8686f-1408-4af8-9835-eb26551c5dba	{}	\N	f	f
6696d649-f888-4bd4-a559-666ee3690b6c	Fotos	usuarios/anonimo_01656793-ab42-4320-ac9e-bd3a97d2f3b4.jpg	01656793-ab42-4320-ac9e-bd3a97d2f3b4	2026-09-03 21:52:38.85364+00	2026-09-03 21:52:38.85364+00	2026-09-03 21:52:38.85364+00	{"eTag": "\\"9ad5f5653d045b64c75f9669eaf90bf0\\"", "size": 368863, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-03T21:52:39.000Z", "contentLength": 368863, "httpStatusCode": 200}	c11d455e-6620-4922-adec-16a116f246ad	01656793-ab42-4320-ac9e-bd3a97d2f3b4	{}	\N	f	f
5aecd196-e225-451b-8d8c-fd1b00ea34da	Fotos	productos/bife_de_chorizo_con_pure_1.jpg	\N	2026-09-17 02:48:11.895037+00	2026-09-17 02:48:11.895037+00	2026-09-17 02:48:11.895037+00	{"eTag": "\\"e6c036e9455080ccd9e3fc5502125c06-1\\"", "size": 26044, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:48:12.000Z", "contentLength": 26044, "httpStatusCode": 200}	b395d6d4-5a6d-4cc9-821e-77703d2e6086	\N	\N	\N	f	f
e97e320a-5eeb-4d00-ac50-3f2caccbf998	Fotos	usuarios/anonimo_95d704d5-5b55-45b5-8668-a3fbcc4c8137.jpg	95d704d5-5b55-45b5-8668-a3fbcc4c8137	2026-09-21 23:35:31.478483+00	2026-09-21 23:35:31.478483+00	2026-09-21 23:35:31.478483+00	{"eTag": "\\"7a36fe006f60cf8948c31d0c6e5829cb\\"", "size": 3214433, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:35:32.000Z", "contentLength": 3214433, "httpStatusCode": 200}	e61ab09e-900b-46ed-80b9-179581560a87	95d704d5-5b55-45b5-8668-a3fbcc4c8137	{}	\N	f	f
a88cb824-7f60-464d-b911-f0980259c3ec	Fotos	qr/3ee8daf7-836e-4485-b20e-2bb863c4a9ee-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-11 13:50:55.496709+00	2026-09-11 13:50:55.496709+00	2026-09-11 13:50:55.496709+00	{"eTag": "\\"d7ebd28298da8d204b51e12e31834a13\\"", "size": 7159, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-11T13:50:56.000Z", "contentLength": 7159, "httpStatusCode": 200}	3dd9baba-ff44-43bd-acd1-bcb264aee964	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
15cf7b35-d314-4c0f-9ddf-d30f5162e44f	Fotos	usuarios/foto_0_1789479183930.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-15 13:33:27.168402+00	2026-09-15 13:33:27.168402+00	2026-09-15 13:33:27.168402+00	{"eTag": "\\"9f8bfb5a8de4ef22780b86f67581bf95\\"", "size": 23893, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T13:33:28.000Z", "contentLength": 23893, "httpStatusCode": 200}	6b221481-a2d1-4074-8bcd-8285238ae502	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
5d4f37dd-6dd0-4536-bd55-3ea40c5ce2d7	Fotos	usuarios/foto_0_1790031480365.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 22:58:38.691741+00	2026-09-21 22:58:38.691741+00	2026-09-21 22:58:38.691741+00	{"eTag": "\\"9a7d29b13d73b65afe4264b21ea1109a\\"", "size": 2820958, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T22:58:39.000Z", "contentLength": 2820958, "httpStatusCode": 200}	60b63b44-ffbc-4477-9121-3d34adfbd469	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
9b13b41f-643a-4055-ad6d-b7feab71e2bc	Fotos	productos/864baa95-69db-4d16-85de-edd4bcf3811e-foto_0_1790031588148.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-21 23:00:05.734383+00	2026-09-21 23:00:05.734383+00	2026-09-21 23:00:05.734383+00	{"eTag": "\\"8fe97fc2b7c954aa110ab501454d40bb\\"", "size": 2520251, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:00:06.000Z", "contentLength": 2520251, "httpStatusCode": 200}	c20fedb9-40b6-4429-910c-0445648e334f	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
30868b40-6b16-405e-ad05-28854612f012	Fotos	assets/logo-3d.png	\N	2026-09-14 20:50:32.74545+00	2026-09-14 20:50:32.74545+00	2026-09-14 20:50:32.74545+00	{"eTag": "\\"8b9a13d3fd586f38e78d27e7d2578d45-1\\"", "size": 552576, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T20:50:32.000Z", "contentLength": 552576, "httpStatusCode": 200}	20c62a1e-fcee-485f-a17e-ca764c4ef97c	\N	\N	\N	f	f
808e21c1-9e77-4ff2-abce-62417be1f817	Fotos	qr/.emptyFolderPlaceholder	\N	2026-09-04 02:46:36.364037+00	2026-09-04 02:46:36.364037+00	2026-09-04 02:46:36.364037+00	{"eTag": "\\"d41d8cd98f00b204e9800998ecf8427e\\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-09-04T02:46:36.370Z", "contentLength": 0, "httpStatusCode": 200}	d2366d52-599c-4345-9abc-25f4afae944f	\N	{}	\N	f	f
9bbce30d-1f4a-4c33-8667-1aa50bcde7ff	Fotos	productos/f0f270a2-0a82-416a-9dc1-a33c4dd7afc5-foto_1_1790031594247.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-21 23:00:06.415031+00	2026-09-21 23:00:06.415031+00	2026-09-21 23:00:06.415031+00	{"eTag": "\\"ce2c154b84df8dfb1f2eb0e668749dab\\"", "size": 49565, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:00:07.000Z", "contentLength": 49565, "httpStatusCode": 200}	54ba8edb-e6fd-47bf-ae38-8d79fceba47d	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
574a7b4b-6b4a-47df-b22d-0d36ec75c1c9	Fotos	usuarios/foto_0_1789428423428.jpg	\N	2026-09-14 23:41:25.96368+00	2026-09-14 23:41:25.96368+00	2026-09-14 23:41:25.96368+00	{"eTag": "\\"1f157b54a5c71552b53c418987a2894a-1\\"", "size": 24596, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 24596, "httpStatusCode": 200}	65825b1c-4731-48bf-bb03-b62a6ea784fd	\N	\N	\N	f	f
31329379-a48e-46ff-bda2-5b8b18022647	Fotos	usuarios/foto_0_1789428421473.jpg	\N	2026-09-14 23:41:26.023922+00	2026-09-14 23:41:26.023922+00	2026-09-14 23:41:26.023922+00	{"eTag": "\\"383f803e2801f423383fd8052c9f95fa-1\\"", "size": 29515, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 29515, "httpStatusCode": 200}	dc981f34-1d18-4817-9a51-e8595c3f109b	\N	\N	\N	f	f
44663737-686c-41b2-b6ff-da168e381ff1	Fotos	productos/85edd233-dbbe-4b5a-a741-6e7b8f4ad598-foto_2_1790031600797.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-21 23:00:09.327599+00	2026-09-21 23:00:09.327599+00	2026-09-21 23:00:09.327599+00	{"eTag": "\\"0d3fc74909e505fa8a16d06ad306f43c\\"", "size": 1920139, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:00:10.000Z", "contentLength": 1920139, "httpStatusCode": 200}	050c16ff-607d-4dc0-beaa-0ca4304869d5	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
4b45ff64-d828-482d-8c7e-e5cb8e280d01	Fotos	productos/agua_sin_gas_2.jpeg	\N	2026-09-17 03:11:45.512362+00	2026-09-17 03:11:45.512362+00	2026-09-17 03:11:45.512362+00	{"eTag": "\\"e234d92587b8321ed29006437690d066-1\\"", "size": 10868, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:11:46.000Z", "contentLength": 10868, "httpStatusCode": 200}	04006a05-403f-45e3-8d8b-7ea2ba31725e	\N	\N	\N	f	f
1164621b-7df6-471e-8012-e5db49d16f67	Fotos	usuarios/foto_0_1790118369471.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-22 23:06:40.373148+00	2026-09-22 23:06:40.373148+00	2026-09-22 23:06:40.373148+00	{"eTag": "\\"cef523c1dac5cdae102498c2360071f4\\"", "size": 2641313, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:06:41.000Z", "contentLength": 2641313, "httpStatusCode": 200}	02f02fa7-0da1-4655-94fb-1ef82cc0a850	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
33f8613c-a400-4254-b6c6-8410d2e3c2ec	Fotos	usuarios/foto_0_1789479504573.jpg	\N	2026-09-15 13:38:46.4736+00	2026-09-15 13:38:46.4736+00	2026-09-15 13:38:46.4736+00	{"eTag": "\\"f0b7a90b1dc28a34404936f8db916f10\\"", "size": 38652, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T13:38:47.000Z", "contentLength": 38652, "httpStatusCode": 200}	67b9f89b-7e86-4277-918f-e27860f17e01	\N	{}	\N	f	f
3ed1277d-59c7-466d-8b06-903a0fbe8431	Fotos	usuarios/anonimo_2ee68b5a-909e-41df-b097-8d83f922e4a0.jpg	2ee68b5a-909e-41df-b097-8d83f922e4a0	2026-09-04 20:19:16.441868+00	2026-09-04 20:19:16.441868+00	2026-09-04 20:19:16.441868+00	{"eTag": "\\"49ebd8fb8fc0de68d6c266bd1ea4eeb6\\"", "size": 33073, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-04T20:19:17.000Z", "contentLength": 33073, "httpStatusCode": 200}	26a5633b-7de8-499d-b21d-ca83c8cebe63	2ee68b5a-909e-41df-b097-8d83f922e4a0	{}	\N	f	f
bde8b188-18e8-4a35-827c-d7e373a43661	Fotos	productos/coca-cola_lata_3.jpg	\N	2026-09-17 03:11:50.557506+00	2026-09-17 03:11:50.557506+00	2026-09-17 03:11:50.557506+00	{"eTag": "\\"f7ec29e26fc6a57ccf8ea9ffc5514fa7-1\\"", "size": 62302, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:11:51.000Z", "contentLength": 62302, "httpStatusCode": 200}	fd0e4f75-ac5a-4ed2-b237-e26f2fc8eeb4	\N	\N	\N	f	f
5fcbc557-efb9-4f18-8f3c-681d2d46db2c	Fotos	usuarios/foto_0_1789501418801.jpg	\N	2026-09-15 19:45:32.651061+00	2026-09-15 19:45:32.651061+00	2026-09-15 19:45:32.651061+00	{"eTag": "\\"6a196bb65ac59b87845d79128254b40a\\"", "size": 43243, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T19:45:33.000Z", "contentLength": 43243, "httpStatusCode": 200}	7fc88cb1-a891-4b6c-b646-b228f17e3b8d	\N	{}	\N	f	f
8ab1c251-4e42-4242-9b0a-c0e05abf428b	Fotos	productos/6c1f6790-7c0d-4025-8c60-2789d8f1ce6f-foto_0_1790031654279.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-21 23:01:09.673638+00	2026-09-21 23:01:09.673638+00	2026-09-21 23:01:09.673638+00	{"eTag": "\\"72cfcdf706717fae04a93217b9519d59\\"", "size": 2060391, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:01:10.000Z", "contentLength": 2060391, "httpStatusCode": 200}	0d5ee024-dd00-4554-b7f6-e3dc84274d31	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
dd995343-c7eb-4a19-b0ce-cb8c1dbeb653	Fotos	usuarios/foto_0_1789511901981.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-15 22:39:09.163268+00	2026-09-15 22:39:09.163268+00	2026-09-15 22:39:09.163268+00	{"eTag": "\\"6f00ebae5af62c1a7c6ff86482f1050c\\"", "size": 2490210, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T22:39:10.000Z", "contentLength": 2490210, "httpStatusCode": 200}	6ecf2159-2851-421d-9ab0-fb83122f5c5b	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
f53fd257-d39c-406d-aa12-aa65330be1a1	Fotos	productos/0b28f11a-8530-495c-a00a-1e14ffafbbbc-foto_1_1790031659557.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-21 23:01:10.865375+00	2026-09-21 23:01:10.865375+00	2026-09-21 23:01:10.865375+00	{"eTag": "\\"dc383d68693941b36b75cf53858949d0\\"", "size": 1782524, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:01:11.000Z", "contentLength": 1782524, "httpStatusCode": 200}	d6a1ede7-8f8c-413a-a5d1-bfb27050e9d8	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
51ea9945-ef08-4dcd-8aac-670d6d2bd25f	Fotos	productos/de3a6525-1ee6-4718-9395-1e32768ab377-foto_2_1790031665695.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-21 23:01:12.158075+00	2026-09-21 23:01:12.158075+00	2026-09-21 23:01:12.158075+00	{"eTag": "\\"cbf203d45d55c858f11d7aebba8acdb3\\"", "size": 1769382, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:01:13.000Z", "contentLength": 1769382, "httpStatusCode": 200}	196c4585-83f4-4e49-9d1d-7952f75c25bc	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
88aa97dc-d19c-4acf-9fd1-415e726f2cc9	Fotos	productos/agua_sin_gas_1.jpeg	\N	2026-09-17 03:11:45.588251+00	2026-09-17 03:11:45.588251+00	2026-09-17 03:11:45.588251+00	{"eTag": "\\"0a536dc4b33ecc33aa2a768abf068735-1\\"", "size": 13587, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:11:46.000Z", "contentLength": 13587, "httpStatusCode": 200}	36832668-1194-453f-a105-472adff29a7e	\N	\N	\N	f	f
66ffe4eb-a7ca-4e4e-b2a2-be21bc5be7f1	Fotos	qr/021b5dbe-df57-4343-a284-05d2ea36fdde-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-15 13:52:09.607365+00	2026-09-15 13:52:09.607365+00	2026-09-15 13:52:09.607365+00	{"eTag": "\\"d4f775426dccb431f4cddbcb08ebdd34\\"", "size": 6765, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T13:52:10.000Z", "contentLength": 6765, "httpStatusCode": 200}	ddc50984-27af-40e3-909c-0def8c47eecb	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
0d2f329d-c688-492a-b2c9-ef47b4b92338	Fotos	qr/57802893-010d-4ed7-ad41-961ce6d8e7ac-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-12 14:30:34.128353+00	2026-09-12 14:30:34.128353+00	2026-09-12 14:30:34.128353+00	{"eTag": "\\"de032643942cea75c3ff4c5a411027e8\\"", "size": 4919, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T14:30:35.000Z", "contentLength": 4919, "httpStatusCode": 200}	b6027192-e8d3-4b02-b901-725a0ffaf507	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
595e1467-841a-49a4-a8e4-e409db42b310	Fotos	productos/coca-cola_lata_1.jpg	\N	2026-09-17 03:11:51.371563+00	2026-09-17 03:11:51.371563+00	2026-09-17 03:11:51.371563+00	{"eTag": "\\"774a41227c60b4add2263d2b48829e1f-1\\"", "size": 192600, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:11:51.000Z", "contentLength": 192600, "httpStatusCode": 200}	ca720c69-f2f5-4e76-aede-6b09576b607a	\N	\N	\N	f	f
cc3f7ec7-57b7-4ab2-859b-a21a7d34dfa3	Fotos	qr/f882f3da-6204-4953-86d8-46ba813417fb-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 23:02:30.063635+00	2026-09-21 23:02:30.063635+00	2026-09-21 23:02:30.063635+00	{"eTag": "\\"3e4ef7788b49f73efa23fa1ec29a8d96\\"", "size": 4939, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:02:31.000Z", "contentLength": 4939, "httpStatusCode": 200}	ef834dc9-89f1-4c57-acee-a8fdc11bee3a	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
cd654839-e6e9-4b5a-b49e-d39cd986c9e2	Fotos	productos/f73387a1-2c03-4bb4-aeb9-65f7706646e9-foto_0_1790118451611.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-22 23:07:52.484652+00	2026-09-22 23:07:52.484652+00	2026-09-22 23:07:52.484652+00	{"eTag": "\\"ff954c5ccb920d799d93c720640607d1\\"", "size": 1732009, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:07:53.000Z", "contentLength": 1732009, "httpStatusCode": 200}	a785a68d-ae58-46f2-bce9-9b892dd08f26	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
21d67efa-63e9-4bf4-a27a-af77b7005bd8	Fotos	mesas/mesa8-foto-1790031750973.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 23:02:33.195685+00	2026-09-21 23:02:33.195685+00	2026-09-21 23:02:33.195685+00	{"eTag": "\\"3459f3d288bc6a0cb37ea97b2d876617\\"", "size": 9004035, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:02:34.000Z", "contentLength": 9004035, "httpStatusCode": 200}	8b0334bc-be65-46c5-81bf-2487ab889729	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
f9cb2584-534e-47df-a19a-3bb666ee62d8	Fotos	qr/2d645a3e-d119-4d79-b5fa-dd08e9783f15-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 23:02:43.936129+00	2026-09-21 23:02:43.936129+00	2026-09-21 23:02:43.936129+00	{"eTag": "\\"df1b252c1db2763d9d72fa6af6712a55\\"", "size": 4952, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:02:44.000Z", "contentLength": 4952, "httpStatusCode": 200}	b2f51070-f39c-4cba-ae03-eaa8d629a0af	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
3506c5f3-6d05-457b-963a-29f00e701106	Fotos	mesas/mesa8-foto-1790031764715.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 23:02:47.339991+00	2026-09-21 23:02:47.339991+00	2026-09-21 23:02:47.339991+00	{"eTag": "\\"3459f3d288bc6a0cb37ea97b2d876617\\"", "size": 9004035, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:02:48.000Z", "contentLength": 9004035, "httpStatusCode": 200}	c0dedd59-0dcf-4094-8429-6e684d84989b	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
f5c2c762-c7a1-4cc1-991e-ba3754e797d7	Fotos	qr/58165298-5b8f-4b05-a511-a380dd22e3ee-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 23:03:02.364909+00	2026-09-21 23:03:02.364909+00	2026-09-21 23:03:02.364909+00	{"eTag": "\\"ce18e452fa5445da0680f41e707d7b2f\\"", "size": 4917, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:03:03.000Z", "contentLength": 4917, "httpStatusCode": 200}	b22ddee8-4f1a-4593-9284-ade063f72bc4	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
d368b195-27cc-4374-8cc9-a9e8695e6b14	Fotos	qr/34-qr	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-04 23:22:51.430406+00	2026-09-04 23:22:51.430406+00	2026-09-04 23:22:51.430406+00	{"eTag": "\\"5a87932cacbfa5a4008ce39449c84ccd\\"", "size": 4865, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-04T23:22:52.000Z", "contentLength": 4865, "httpStatusCode": 200}	babffd16-8766-4bd3-b35c-7fc152ffe112	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
bb4b30d8-5fed-4dbf-b0ba-8a3865625cc0	Fotos	usuarios/foto_0_1789429109336.webp	\N	2026-09-14 23:41:25.864336+00	2026-09-14 23:41:25.864336+00	2026-09-14 23:41:25.864336+00	{"eTag": "\\"af09d409396e9bb1624bd2acd0654817-1\\"", "size": 80818, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 80818, "httpStatusCode": 200}	936faebe-e326-4a68-9da1-f820d3c450d6	\N	\N	\N	f	f
50d2e9e7-435b-4796-9ee7-b8c378b6def3	Fotos	usuarios/foto_0_1789428417917.webp	\N	2026-09-14 23:41:25.922211+00	2026-09-14 23:41:25.922211+00	2026-09-14 23:41:25.922211+00	{"eTag": "\\"5f7016308519bee02a5480d09b21138a-1\\"", "size": 22258, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 22258, "httpStatusCode": 200}	c0e3dbbc-c783-498e-a0a7-d99c44846d41	\N	\N	\N	f	f
c177c43e-467b-4770-a598-4a93b7d878a5	Fotos	usuarios/foto_0_1789428422821.webp	\N	2026-09-14 23:41:25.943784+00	2026-09-14 23:41:25.943784+00	2026-09-14 23:41:25.943784+00	{"eTag": "\\"d8e39d5d9a647a1763045a65762e832a-1\\"", "size": 39302, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 39302, "httpStatusCode": 200}	a249acef-9e75-48b5-9310-aef5cb25316f	\N	\N	\N	f	f
1f6094b5-c300-448b-8968-5bd3dce95fda	Fotos	usuarios/foto_0_1789428418982.jpg	\N	2026-09-14 23:41:25.96097+00	2026-09-14 23:41:25.96097+00	2026-09-14 23:41:25.96097+00	{"eTag": "\\"c574159d162f036e44cc7094a0ff29a3-1\\"", "size": 47090, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 47090, "httpStatusCode": 200}	7d5b2c6f-3173-4bef-9c55-8d56092971f0	\N	\N	\N	f	f
bab63b3f-f966-4910-b941-dd42cc8f0940	Fotos	productos/ee953b69-c1e8-4687-8cdb-e224630f302d-foto_1_1790118456126.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-22 23:07:55.034536+00	2026-09-22 23:07:55.034536+00	2026-09-22 23:07:55.034536+00	{"eTag": "\\"f3c53fff49c0983b27c1e2d87a3c0f53\\"", "size": 105945, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:07:55.000Z", "contentLength": 105945, "httpStatusCode": 200}	b612b5ff-f41a-430a-a76d-ddaaca1dae84	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
10c5bb51-6862-4821-b394-4be6a4db349f	Fotos	qr/36e7805f-940b-4d58-a261-116f0c77f157-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-12 14:32:34.569967+00	2026-09-12 14:32:34.569967+00	2026-09-12 14:32:34.569967+00	{"eTag": "\\"2eb37d3d29e87a9cd5d339ebb51488bc\\"", "size": 4920, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T14:32:35.000Z", "contentLength": 4920, "httpStatusCode": 200}	30f8ca4e-fc5a-4bd8-a279-52a0ae5372fb	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
45d9a753-c0b6-4b40-a2e2-33e203efac25	Fotos	qr/37-qr	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-04 23:23:43.482799+00	2026-09-04 23:23:43.482799+00	2026-09-04 23:23:43.482799+00	{"eTag": "\\"605209116d41067e727e31646c31cef5\\"", "size": 5560, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-04T23:23:44.000Z", "contentLength": 5560, "httpStatusCode": 200}	eb099b2b-fe9b-476e-ad42-327d6b00f97f	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
990a12be-6d07-4983-9772-12df4c10ae68	Fotos	productos/0973f998-7911-4ebd-bc11-15d12363ce85-foto_2_1790118464021.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-22 23:08:37.523186+00	2026-09-22 23:08:37.523186+00	2026-09-22 23:08:37.523186+00	{"eTag": "\\"47dd0d83005738c947f127930663d701\\"", "size": 2485199, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:08:38.000Z", "contentLength": 2485199, "httpStatusCode": 200}	f711feab-ed8c-4b2f-b9a7-5b34b83c6e5d	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
3c49fe90-90dc-4e26-80fb-d4cc8ab91658	Fotos	qr/445-qr	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-04 23:24:06.07124+00	2026-09-04 23:24:06.07124+00	2026-09-04 23:24:06.07124+00	{"eTag": "\\"2c0b175264a707c99f7b816a8b0fc2a3\\"", "size": 4957, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-04T23:24:07.000Z", "contentLength": 4957, "httpStatusCode": 200}	b77a1d81-5b92-4c0b-896f-0bf90389f163	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
6de4a4d7-a3a7-4ece-be70-cb28dbe7ad2b	Fotos	mesas/mesa9-foto-1790031783127.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-21 23:03:04.995309+00	2026-09-21 23:03:04.995309+00	2026-09-21 23:03:04.995309+00	{"eTag": "\\"3459f3d288bc6a0cb37ea97b2d876617\\"", "size": 9004035, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-21T23:03:05.000Z", "contentLength": 9004035, "httpStatusCode": 200}	e8078bcd-a1aa-4654-bb63-a3ffe8727b04	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
0a1f8ea5-3d72-4afb-a25d-427d5db93327	Fotos	productos/95025242-d02c-40a9-945d-c90de717e46c-foto_0_1790118610831.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-22 23:10:37.894367+00	2026-09-22 23:10:37.894367+00	2026-09-22 23:10:37.894367+00	{"eTag": "\\"a8e520638423efde8da20081ea29a99f\\"", "size": 1685167, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:10:38.000Z", "contentLength": 1685167, "httpStatusCode": 200}	ee0398f3-28d8-4cc0-94ad-119fba434879	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
da3ab032-83a8-4db4-831b-d8d210d30430	Fotos	qr/ce07fabe-cbc6-4169-a91a-2bc7a917e896-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-12 14:33:27.694989+00	2026-09-12 14:33:27.694989+00	2026-09-12 14:33:27.694989+00	{"eTag": "\\"6760a5545933b0cb23d9e57f56310a54\\"", "size": 4918, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T14:33:28.000Z", "contentLength": 4918, "httpStatusCode": 200}	a4b16305-54bb-4f4b-9fb1-367b69c392cb	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
b1a56946-a2fa-47f3-9f6a-38fd707272e5	Fotos	qr/233-qr	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-04 23:38:12.277184+00	2026-09-04 23:38:12.277184+00	2026-09-04 23:38:12.277184+00	{"eTag": "\\"e009a94b73ba1ef7c422a36d304be6e4\\"", "size": 4911, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-04T23:38:13.000Z", "contentLength": 4911, "httpStatusCode": 200}	f7035c30-5f72-4062-9746-1f348a543bc7	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
ebdeca0c-1a0f-41c2-b4a2-78f1a770d3c2	Fotos	usuarios/foto_0_1789511102971.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-15 22:25:29.861861+00	2026-09-15 22:25:29.861861+00	2026-09-15 22:25:29.861861+00	{"eTag": "\\"e6ee5848d804f0526adbc2f3265316be\\"", "size": 2724026, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T22:25:30.000Z", "contentLength": 2724026, "httpStatusCode": 200}	6be3636c-17d5-45b4-8ccb-54a0412356d0	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
c9442906-0bc2-4abe-b139-50bd095b0e5a	Fotos	productos/f62f6b0e-0a13-4f1f-9e02-72814a96ca35-foto_1_1790118619453.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-22 23:10:39.491893+00	2026-09-22 23:10:39.491893+00	2026-09-22 23:10:39.491893+00	{"eTag": "\\"0c7919ce13133ebe83158e1689defccf\\"", "size": 1610522, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:10:40.000Z", "contentLength": 1610522, "httpStatusCode": 200}	afa99783-cd76-4a0e-aef0-ce50b1d74a0a	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
8be0cf92-6e40-474a-9c6f-addbc938039b	Fotos	productos/d8a96697-4d25-4619-bb17-13348ffebbc8-foto_2_1790118632272.jpg	48a5b03b-3675-4efb-b230-9266023919a9	2026-09-22 23:10:40.525673+00	2026-09-22 23:10:40.525673+00	2026-09-22 23:10:40.525673+00	{"eTag": "\\"eff94197c6a20a2fa8367dd6e8b962e3\\"", "size": 1893534, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:10:41.000Z", "contentLength": 1893534, "httpStatusCode": 200}	9dad185f-d536-4b42-abf3-47fb91cb1421	48a5b03b-3675-4efb-b230-9266023919a9	{}	\N	f	f
2e925484-7904-45b2-8aab-bd7767334892	Fotos	usuarios/foto_0_1790118804414.jpg	\N	2026-09-22 23:13:50.623581+00	2026-09-22 23:13:50.623581+00	2026-09-22 23:13:50.623581+00	{"eTag": "\\"d0b2cae984c6772c75a6c7f92d960499\\"", "size": 1881738, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:13:51.000Z", "contentLength": 1881738, "httpStatusCode": 200}	22c76f47-f814-4d2d-8cfa-fc1c00e046a3	\N	{}	\N	f	f
7d0bcb38-54f5-4fa9-8c82-d0d49dcd22d8	Fotos	qr/ad381473-6473-4ce2-a30e-9a93d590cb8a-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-12 14:34:03.046469+00	2026-09-12 14:34:03.046469+00	2026-09-12 14:34:03.046469+00	{"eTag": "\\"c10d008b9e2328f2bd4a7dfdf7872939\\"", "size": 4859, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T14:34:04.000Z", "contentLength": 4859, "httpStatusCode": 200}	fa8d4ae4-c157-4929-a0ec-b2cf3d206eb7	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
e5639e51-2252-4b97-9f48-64299d466b05	Fotos	usuarios/anonimo_f3e3b21e-3564-40bb-aa3c-43964563957e.jpg	f3e3b21e-3564-40bb-aa3c-43964563957e	2026-09-05 01:18:47.235804+00	2026-09-05 01:18:47.235804+00	2026-09-05 01:18:47.235804+00	{"eTag": "\\"d1eca5fa497d64c2f473760b4c46c830\\"", "size": 2576533, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-05T01:18:48.000Z", "contentLength": 2576533, "httpStatusCode": 200}	144abfb0-db65-4b3c-b413-cb9a53566d74	f3e3b21e-3564-40bb-aa3c-43964563957e	{}	\N	f	f
a608dd8a-1a6b-4ebc-a3a5-6f59bbc08154	Fotos	qr/e3df8eab-51ed-4cae-81fc-ecc733c34c5d-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-15 14:18:31.186175+00	2026-09-15 14:18:31.186175+00	2026-09-15 14:18:31.186175+00	{"eTag": "\\"7a80ef7c9dc16a9a4d6ea1cb8895c6d6\\"", "size": 6697, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T14:18:32.000Z", "contentLength": 6697, "httpStatusCode": 200}	93245d2f-5978-463b-99ff-308b0ed4cbed	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
b6c42424-7e43-4864-b0f4-bbec213828f2	Fotos	qr/e33032da-f69b-41b2-8f44-b0c678bb3619-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-12 14:34:44.326122+00	2026-09-12 14:34:44.326122+00	2026-09-12 14:34:44.326122+00	{"eTag": "\\"2058426e5cc1dcca136c5857e4aa53c1\\"", "size": 4902, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T14:34:45.000Z", "contentLength": 4902, "httpStatusCode": 200}	8dbb6b4f-9ffd-426b-9c1d-35b09161b926	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
6b387686-458e-4a9f-98f6-38ba3023b091	Fotos	usuarios/foto_0_1790118914589.jpg	\N	2026-09-22 23:15:33.547495+00	2026-09-22 23:15:33.547495+00	2026-09-22 23:15:33.547495+00	{"eTag": "\\"7280e1a7ef7b5d705011792f6437fd62\\"", "size": 1827799, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:15:34.000Z", "contentLength": 1827799, "httpStatusCode": 200}	53fe93ac-abbd-4ab9-92f2-29c8eaf6e5a3	\N	{}	\N	f	f
3fe114f8-18ad-4e5d-af9c-aba2b1685803	Fotos	usuarios/anonimo_816ab38e-1ccc-409f-8d8c-c65a4e4e20f6.jpg	816ab38e-1ccc-409f-8d8c-c65a4e4e20f6	2026-09-09 13:35:15.604228+00	2026-09-09 13:35:15.604228+00	2026-09-09 13:35:15.604228+00	{"eTag": "\\"c3b2612c51b7ab4d6125fc26f9ae7927\\"", "size": 2199153, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-09T13:35:16.000Z", "contentLength": 2199153, "httpStatusCode": 200}	80ba3563-c9dc-4b32-aedf-0eeff298f6a6	816ab38e-1ccc-409f-8d8c-c65a4e4e20f6	{}	\N	f	f
1c05e275-1ff0-4f0f-a68d-1ff70472b46b	Fotos	usuarios/anonimo_a264327b-95ef-47f8-ac8a-31a3bbb1439e.jpg	a264327b-95ef-47f8-ac8a-31a3bbb1439e	2026-09-22 23:18:29.039725+00	2026-09-22 23:18:29.039725+00	2026-09-22 23:18:29.039725+00	{"eTag": "\\"890f57f563cc81d9a3627bc795d6982a\\"", "size": 1986094, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-22T23:18:29.000Z", "contentLength": 1986094, "httpStatusCode": 200}	a7254e2b-d7d9-463d-bf9e-3961c5721c9a	a264327b-95ef-47f8-ac8a-31a3bbb1439e	{}	\N	f	f
c9d9500d-fb62-4b53-8fe7-8a2734eec780	Fotos	qr/55-17efd3e9-3372-4844-bc7d-3036666a7685-qr.png	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 02:14:50.855282+00	2026-09-23 02:14:50.855282+00	2026-09-23 02:14:50.855282+00	{"eTag": "\\"c84c534bc89189e855ceb408027c5141\\"", "size": 4942, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T02:14:51.000Z", "contentLength": 4942, "httpStatusCode": 200}	0e7aacac-e354-492a-901a-06840362f289	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
650751f5-d458-4fb0-b132-3c0d0fd73cef	Fotos	qr/45-qr	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-10 12:47:32.659396+00	2026-09-10 12:47:32.659396+00	2026-09-10 12:47:32.659396+00	{"eTag": "\\"8c9438c2ebb28443873c9bf153cdbafc\\"", "size": 7455, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-10T12:47:33.000Z", "contentLength": 7455, "httpStatusCode": 200}	b9c2f3b4-2879-438a-b097-df0e86ee7f9d	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
baa7f99c-37d1-4db9-aafa-60a76195f6dc	Fotos	usuarios/foto_0_1789223877479.jpg	\N	2026-09-12 14:38:07.296765+00	2026-09-12 14:38:07.296765+00	2026-09-12 14:38:07.296765+00	{"eTag": "\\"cdee6134cbd99f82e4880789ed78270b\\"", "size": 293201, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-12T14:38:08.000Z", "contentLength": 293201, "httpStatusCode": 200}	edbe6b99-003f-4597-9cfc-53cf955e1d42	\N	{}	\N	f	f
a04bec95-7ac8-434c-a369-5c784e200f5f	Fotos	mesas/mesa_7.jpg	\N	2026-09-17 03:29:29.698163+00	2026-09-17 03:29:29.698163+00	2026-09-17 03:29:29.698163+00	{"eTag": "\\"bf710da1e8f3de368fe6086d25691519-1\\"", "size": 325935, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:29:29.000Z", "contentLength": 325935, "httpStatusCode": 200}	96b95291-36e1-4848-ae43-8be28a1e9c7a	\N	\N	\N	f	f
1b2398f5-74de-4e34-aab8-10ee2609433b	Fotos	qr/46-qr	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-10 12:50:52.568503+00	2026-09-10 12:50:52.568503+00	2026-09-10 12:50:52.568503+00	{"eTag": "\\"5290b255a7e6d6b57e85ea299ebe7653\\"", "size": 6845, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-10T12:50:53.000Z", "contentLength": 6845, "httpStatusCode": 200}	7c0971f9-f88b-42fa-8f15-ae7348ceb216	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
912e62fe-3199-4f46-8bcc-6828104262b9	Fotos	mesas/mesa55-foto-1790129690462.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 02:14:52.117599+00	2026-09-23 02:14:52.117599+00	2026-09-23 02:14:52.117599+00	{"eTag": "\\"07eedf0c692a502b1f1005596f2814dd\\"", "size": 88781, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T02:14:53.000Z", "contentLength": 88781, "httpStatusCode": 200}	387f2078-ebd5-4509-941e-9bc6835add65	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
04bbb717-06c7-49df-b3c7-c5311e47e9d5	Fotos	qr/47-qr	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-10 12:51:34.112234+00	2026-09-10 12:51:34.112234+00	2026-09-10 12:51:34.112234+00	{"eTag": "\\"ce5dc8f89489a888b965e4f67c05afea\\"", "size": 7028, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-10T12:51:35.000Z", "contentLength": 7028, "httpStatusCode": 200}	69c94f8a-4c77-4928-94e1-013f6b4e1d63	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
e19fc59e-dcda-479b-9a1c-1c77f4cf74c9	Fotos	usuarios/anonimo_3edb020f-dabf-491a-8194-61ac4ad39c9a.jpg	3edb020f-dabf-491a-8194-61ac4ad39c9a	2026-09-10 21:41:26.515631+00	2026-09-10 21:41:26.515631+00	2026-09-10 21:41:26.515631+00	{"eTag": "\\"9ad1896ecb1e7b2dd190b331d8b59931\\"", "size": 3186, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-10T21:41:27.000Z", "contentLength": 3186, "httpStatusCode": 200}	99c8ad3c-6af9-4aa0-b03a-b1a0c492180d	3edb020f-dabf-491a-8194-61ac4ad39c9a	{}	\N	f	f
b5f1ef6e-b159-4d75-bfe8-df9c5f78d69b	Fotos	usuarios/anonimo_d4c73881-94f3-4b34-ab2d-3d646d33a304.jpg	d4c73881-94f3-4b34-ab2d-3d646d33a304	2026-09-10 21:55:33.56402+00	2026-09-10 21:55:33.56402+00	2026-09-10 21:55:33.56402+00	{"eTag": "\\"9ad1896ecb1e7b2dd190b331d8b59931\\"", "size": 3186, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-10T21:55:34.000Z", "contentLength": 3186, "httpStatusCode": 200}	a41020af-92c2-4580-9bdc-36366b8128c6	d4c73881-94f3-4b34-ab2d-3d646d33a304	{}	\N	f	f
33b3b54e-bf7f-4a5d-a161-53d8b7768bbd	Fotos	assets/logo-3d-blanco.png	\N	2026-09-14 20:50:32.810129+00	2026-09-14 20:50:32.810129+00	2026-09-14 20:50:32.810129+00	{"eTag": "\\"f93fa3f9f9c6d6e65a5edf151b6038cb-1\\"", "size": 520088, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T20:50:32.000Z", "contentLength": 520088, "httpStatusCode": 200}	63a52dcd-7c86-493f-b5a4-e365f5041542	\N	\N	\N	f	f
7e89bb5b-9c14-44f6-97a0-e6790c23d74b	Fotos	usuarios/foto_0_1789428420649.webp	\N	2026-09-14 23:41:25.96981+00	2026-09-14 23:41:25.96981+00	2026-09-14 23:41:25.96981+00	{"eTag": "\\"1859246cce612b4d36aeb6f382494d9d-1\\"", "size": 31250, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 31250, "httpStatusCode": 200}	ffa488a9-a173-48d2-9d4a-59ec30cac98c	\N	\N	\N	f	f
809fc3f4-d002-4187-b2bf-bcab9f8e770e	Fotos	usuarios/foto_0_1789428419834.webp	\N	2026-09-14 23:41:26.049122+00	2026-09-14 23:41:26.049122+00	2026-09-14 23:41:26.049122+00	{"eTag": "\\"bc400e99c74578c0a85a4ff14d88806d-1\\"", "size": 124594, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 124594, "httpStatusCode": 200}	833e2f77-47ff-4dd6-b681-2d9255b34714	\N	\N	\N	f	f
7249dd22-7d95-48bd-937c-13a4e004ff2f	Fotos	usuarios/foto_0_1789428422193.png	\N	2026-09-14 23:41:26.48939+00	2026-09-14 23:41:26.48939+00	2026-09-14 23:41:26.48939+00	{"eTag": "\\"9cd9efe9b41b3c92b4403f1d5cf62cbb-1\\"", "size": 626672, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-14T23:41:26.000Z", "contentLength": 626672, "httpStatusCode": 200}	0dd03c4b-eeb3-4e53-8e41-be14a1e39bb2	\N	\N	\N	f	f
1d7f2d15-17b2-4771-8a5d-816d7dd1e206	Fotos	usuarios/foto_0_1789432837352.jpg	\N	2026-09-15 00:41:55.724581+00	2026-09-15 00:41:55.724581+00	2026-09-15 00:41:55.724581+00	{"eTag": "\\"6a196bb65ac59b87845d79128254b40a\\"", "size": 43243, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T00:41:56.000Z", "contentLength": 43243, "httpStatusCode": 200}	c3dc8e8e-83b0-4b46-a0e3-83110fb09654	\N	{}	\N	f	f
57401132-f9fd-4d20-ba80-492bbe44cc37	Fotos	mesas/mesa_5.jpg	\N	2026-09-17 03:29:29.248154+00	2026-09-17 03:29:29.248154+00	2026-09-17 03:29:29.248154+00	{"eTag": "\\"5b6674266d601b1612d7287c549b3f2b-1\\"", "size": 55444, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:29:29.000Z", "contentLength": 55444, "httpStatusCode": 200}	3135ccdb-87c4-429e-9e48-eaffa1031bde	\N	\N	\N	f	f
57a93c5d-9a82-4bc2-a012-96865c109cc2	Fotos	mesas/mesa_4.jpg	\N	2026-09-17 03:29:29.270348+00	2026-09-17 03:29:29.270348+00	2026-09-17 03:29:29.270348+00	{"eTag": "\\"4f437ea09cba59f35430b68e2caa1fdc-1\\"", "size": 17331, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:29:29.000Z", "contentLength": 17331, "httpStatusCode": 200}	19fae8e9-d826-473d-a59b-89b0cf49c8b1	\N	\N	\N	f	f
d29267c4-4a84-4f5c-a60e-4bdde1ec4923	Fotos	mesas/mesa_6.avif	\N	2026-09-17 03:29:29.285762+00	2026-09-17 03:29:29.285762+00	2026-09-17 03:29:29.285762+00	{"eTag": "\\"306921cecca69d7f8bddfc6356b9ae4b-1\\"", "size": 72044, "mimetype": "image/avif", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:29:29.000Z", "contentLength": 72044, "httpStatusCode": 200}	b29b2df3-2a61-437b-9f4a-31ddfe1b3b19	\N	\N	\N	f	f
89e18815-2ea0-48a9-b27a-d44cc42a80bf	Fotos	qr/55-e9af287a-7773-4b48-a3c1-b1e59a777efa-qr.png	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:47:42.800022+00	2026-09-23 11:47:42.800022+00	2026-09-23 11:47:42.800022+00	{"eTag": "\\"887b8c3a12b8b69ed63340c6b4598462\\"", "size": 6961, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:47:43.000Z", "contentLength": 6961, "httpStatusCode": 200}	f7805e06-ca0c-4889-8390-ac525b053439	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
6aa4b187-8e12-4384-b26c-4dec2159928c	Fotos	mesas/mesa55-foto-1790164086212.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:47:43.711811+00	2026-09-23 11:47:43.711811+00	2026-09-23 11:47:43.711811+00	{"eTag": "\\"3949311720201c08db21db05df92fe45\\"", "size": 29459, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:47:44.000Z", "contentLength": 29459, "httpStatusCode": 200}	e00879ec-dc28-4d5a-b7fb-335e20f56cd0	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
86a8e87e-e8b9-4d77-acb4-4dccb51c8689	Fotos	usuarios/foto_0_1789512246297.jpg	\N	2026-09-15 22:45:12.816147+00	2026-09-15 22:45:12.816147+00	2026-09-15 22:45:12.816147+00	{"eTag": "\\"4ef119b90fb756e64a1e39de5d75e84c\\"", "size": 1494524, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T22:45:13.000Z", "contentLength": 1494524, "httpStatusCode": 200}	02906bca-f964-477c-b7c0-c35b6a59d120	\N	{}	\N	f	f
716fe9e5-2ac6-4722-8ebc-6db990c652b4	Fotos	usuarios/foto_0_1789512527833.jpg	\N	2026-09-15 22:49:07.463462+00	2026-09-15 22:49:07.463462+00	2026-09-15 22:49:07.463462+00	{"eTag": "\\"35019f9588c1b89ede9ea11090c7acec\\"", "size": 2086195, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T22:49:08.000Z", "contentLength": 2086195, "httpStatusCode": 200}	bac6df7a-238b-4bcc-a979-3c9f799ac8ca	\N	{}	\N	f	f
b60a3f38-67a8-4562-9acb-2b30e3a6214a	Fotos	qr/44-1b5b480a-19b3-4f63-a308-7314170432c8-qr.png	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:51:26.12189+00	2026-09-23 11:51:26.12189+00	2026-09-23 11:51:26.12189+00	{"eTag": "\\"1dbf5ed7b9b26aaee7e95065f2f43210\\"", "size": 6858, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:51:27.000Z", "contentLength": 6858, "httpStatusCode": 200}	f53fa7a5-225b-4cf6-a26c-c00092bb62d4	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
3a764247-332f-4883-99f7-8168920812ec	Fotos	usuarios/anonimo_7d1f7534-55d6-48fd-9468-0e0c45e734dd.jpg	7d1f7534-55d6-48fd-9468-0e0c45e734dd	2026-09-15 22:53:56.186721+00	2026-09-15 22:53:56.186721+00	2026-09-15 22:53:56.186721+00	{"eTag": "\\"46599e5bb0eabc0f0a798ae037571e69\\"", "size": 3661985, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T22:53:57.000Z", "contentLength": 3661985, "httpStatusCode": 200}	38891a20-4568-4a3a-80ac-fa1115d1e2a2	7d1f7534-55d6-48fd-9468-0e0c45e734dd	{}	\N	f	f
e21d6178-cf30-4797-aa4e-a18286c05328	Fotos	mesas/mesa44-foto-1790164309527.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:51:27.182807+00	2026-09-23 11:51:27.182807+00	2026-09-23 11:51:27.182807+00	{"eTag": "\\"3949311720201c08db21db05df92fe45\\"", "size": 29459, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:51:28.000Z", "contentLength": 29459, "httpStatusCode": 200}	837f58ed-e376-4961-9ba2-7fc070eb09e1	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
d45b6b6a-989d-43bd-9bee-dbe97bbcc488	Fotos	qr/d1bea9ca-52ed-44e3-ad83-23c279dde7da-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-15 22:42:56.855001+00	2026-09-15 22:42:56.855001+00	2026-09-15 22:42:56.855001+00	{"eTag": "\\"7ba4274e98a2bd56e70a025349531723\\"", "size": 4842, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T22:42:57.000Z", "contentLength": 4842, "httpStatusCode": 200}	f25f456c-5b33-425c-900f-7aed6a522d4f	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
4e275734-cd59-49bc-9ef6-95f059162df8	Fotos	mesas/mesa_1.jpg	\N	2026-09-17 03:29:30.023676+00	2026-09-17 03:29:30.023676+00	2026-09-17 03:29:30.023676+00	{"eTag": "\\"194cf0441b7b8509a7862b2ca08eb6eb-1\\"", "size": 752936, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:29:30.000Z", "contentLength": 752936, "httpStatusCode": 200}	2c24b5c1-a97d-4f53-b591-19cda09ec023	\N	\N	\N	f	f
bd7f0304-5aed-434d-8d01-1cb0546f0703	Fotos	qr/44-1364dde9-116f-42d3-93ae-75ffd540400b-qr.png	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:52:40.722405+00	2026-09-23 11:52:40.722405+00	2026-09-23 11:52:40.722405+00	{"eTag": "\\"948563d39eada635bed138123f70e24b\\"", "size": 6910, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:52:41.000Z", "contentLength": 6910, "httpStatusCode": 200}	9acd78ca-603e-41f5-a652-4c2fc50d58de	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
6e166bd7-42e9-492c-b9ee-2dcf84e83016	Fotos	usuarios/anonimo_467b47eb-fad0-4646-a0cf-599a9e5cf24e.jpg	467b47eb-fad0-4646-a0cf-599a9e5cf24e	2026-09-15 22:54:38.017275+00	2026-09-15 22:54:38.017275+00	2026-09-15 22:54:38.017275+00	{"eTag": "\\"ee43d26b90652f28862ab3c53c1df84c\\"", "size": 3592889, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T22:54:38.000Z", "contentLength": 3592889, "httpStatusCode": 200}	0430a230-f5c8-45b7-ba1b-cca7cce8c38d	467b47eb-fad0-4646-a0cf-599a9e5cf24e	{}	\N	f	f
fb87e9f3-0d39-4aca-a6cf-b82714088048	Fotos	mesas/mesa44-foto-1790164384118.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:52:41.209851+00	2026-09-23 11:52:41.209851+00	2026-09-23 11:52:41.209851+00	{"eTag": "\\"3949311720201c08db21db05df92fe45\\"", "size": 29459, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:52:42.000Z", "contentLength": 29459, "httpStatusCode": 200}	6341e19a-4ffa-4687-8aea-b20a55c63caa	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
e0ee0591-bdca-4d77-a098-f8b641331054	Fotos	usuarios/anonimo_43fbb793-abbe-46e5-beaa-3490163dcbc8.jpg	43fbb793-abbe-46e5-beaa-3490163dcbc8	2026-09-15 22:56:34.840899+00	2026-09-15 22:56:34.840899+00	2026-09-15 22:56:34.840899+00	{"eTag": "\\"3f26fa2a5ad635377b606a05d76afa8b\\"", "size": 3670048, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-15T22:56:35.000Z", "contentLength": 3670048, "httpStatusCode": 200}	f856f3d7-13d5-4fa0-851b-cd9c8e6f2d86	43fbb793-abbe-46e5-beaa-3490163dcbc8	{}	\N	f	f
f2684f2e-c728-41e4-8109-979958e88621	Fotos	qr/44-4bc426b8-bfb1-4d0b-81b0-2af69636116a-qr.png	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:54:11.721282+00	2026-09-23 11:54:11.721282+00	2026-09-23 11:54:11.721282+00	{"eTag": "\\"f3bb8cd1e08ce1751eb6e23a7c4b60f7\\"", "size": 7075, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:54:12.000Z", "contentLength": 7075, "httpStatusCode": 200}	80422239-c3a6-4512-9e6a-8b3a55df1998	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
eb4bf77c-c814-4cae-a3a2-c161201815d9	Fotos	mesas/mesa44-foto-1790164475107.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:54:12.206699+00	2026-09-23 11:54:12.206699+00	2026-09-23 11:54:12.206699+00	{"eTag": "\\"3949311720201c08db21db05df92fe45\\"", "size": 29459, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:54:13.000Z", "contentLength": 29459, "httpStatusCode": 200}	dbf402d3-dbee-438d-98c2-8362426a1739	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
3a71f07d-7194-4c8e-88fc-1182defc07d1	Fotos	qr/44-84e7284f-6e6b-4eac-83e7-2fc5272df859-qr.png	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:58:08.217818+00	2026-09-23 11:58:08.217818+00	2026-09-23 11:58:08.217818+00	{"eTag": "\\"ebdaca458a5fe58a3701bd6e27ee44a5\\"", "size": 6908, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:58:09.000Z", "contentLength": 6908, "httpStatusCode": 200}	405d49e1-dbe7-429e-bd4e-2c2a94bf68ef	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
ec9240c0-d2c2-44b8-8570-3602160582a7	Fotos	mesas/mesa44-foto-1790164711542.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 11:58:09.236151+00	2026-09-23 11:58:09.236151+00	2026-09-23 11:58:09.236151+00	{"eTag": "\\"3949311720201c08db21db05df92fe45\\"", "size": 29459, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T11:58:10.000Z", "contentLength": 29459, "httpStatusCode": 200}	64b71ef1-f0e5-4434-9f68-5c2bc6d9897d	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
960e11fc-e388-4fc2-a986-47a7f8fcfe89	Fotos	usuarios/foto_0_1789568433956.jpg	\N	2026-09-16 14:20:51.894047+00	2026-09-16 14:20:51.894047+00	2026-09-16 14:20:51.894047+00	{"eTag": "\\"f0b7a90b1dc28a34404936f8db916f10\\"", "size": 38652, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-16T14:20:52.000Z", "contentLength": 38652, "httpStatusCode": 200}	5cc322d6-9e3b-472d-93a8-f354646f3d5e	\N	{}	\N	f	f
84763b94-aefb-4f14-b9fd-0f7714d01b99	Fotos	mesas/mesa_3.jpg	\N	2026-09-17 03:29:29.412671+00	2026-09-17 03:29:29.412671+00	2026-09-17 03:29:29.412671+00	{"eTag": "\\"31d14701f0ce56e28990ea85d6be8ef7-1\\"", "size": 33808, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:29:29.000Z", "contentLength": 33808, "httpStatusCode": 200}	04b39c09-0ac8-4cf1-893a-04283841a62f	\N	\N	\N	f	f
f318b665-fc30-459c-a5c4-ae52805be715	Fotos	qr/44-7463b200-93dc-4b2b-89da-b2b7024c6d85-qr.png	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 12:01:25.21886+00	2026-09-23 12:01:25.21886+00	2026-09-23 12:01:25.21886+00	{"eTag": "\\"66ef00bc7a215b939ce82d4774d9f65b\\"", "size": 7027, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T12:01:26.000Z", "contentLength": 7027, "httpStatusCode": 200}	b71e0910-b6a8-416c-add9-262ae612f45f	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
6b49e569-2e59-408b-813e-47be304640e6	Fotos	mesas/mesa44-foto-1790164908511.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 12:01:25.974477+00	2026-09-23 12:01:25.974477+00	2026-09-23 12:01:25.974477+00	{"eTag": "\\"3949311720201c08db21db05df92fe45\\"", "size": 29459, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T12:01:26.000Z", "contentLength": 29459, "httpStatusCode": 200}	6265358d-4d6b-40a0-adc0-5411fee32719	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
dbe87c04-7517-4ec5-b514-3c3d67f15946	Fotos	productos/copa_de_vino_1.jpg	\N	2026-09-17 02:42:04.302076+00	2026-09-17 02:42:04.302076+00	2026-09-17 02:42:04.302076+00	{"eTag": "\\"015d3f781cd784d6df79a209b1c49a8d-1\\"", "size": 19113, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:04.000Z", "contentLength": 19113, "httpStatusCode": 200}	f7a72aa6-9af4-4580-ac26-5b512f5ac197	\N	\N	\N	f	f
7360e350-bbac-4883-acd2-59989c6ce7f8	Fotos	productos/tiramisu_1.jpg	\N	2026-09-17 02:42:04.696848+00	2026-09-17 02:42:04.696848+00	2026-09-17 02:42:04.696848+00	{"eTag": "\\"5e0867434b60662067ae5053fe9efa30-1\\"", "size": 60734, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 60734, "httpStatusCode": 200}	53ee784d-73cd-42a2-b8b7-c13c7bdd036f	\N	\N	\N	f	f
30f96605-0127-4bf7-b37a-e7697dacfe3f	Fotos	productos/cerveza_artesanal_IPA_pinta_3.png	\N	2026-09-17 02:42:04.704251+00	2026-09-17 02:42:04.704251+00	2026-09-17 02:42:04.704251+00	{"eTag": "\\"a5961ecf70de708d120c45e10bc12963-1\\"", "size": 18736, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 18736, "httpStatusCode": 200}	12c30998-a613-4197-9018-4214fb443f2e	\N	\N	\N	f	f
25659d40-f96f-4eff-8d5c-bc37890282ee	Fotos	productos/tiramisu_3.jpg	\N	2026-09-17 02:42:04.734422+00	2026-09-17 02:42:04.734422+00	2026-09-17 02:42:04.734422+00	{"eTag": "\\"ed343a6d5c1b8885c951c2db42a4ab46-1\\"", "size": 63766, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 63766, "httpStatusCode": 200}	f0df5a5e-356d-4792-b386-f69b10912c36	\N	\N	\N	f	f
4335b44b-83ec-40ae-8565-ae07eb4fea32	Fotos	productos/volcan_de_chocolate_con_helado_3.jpg	\N	2026-09-17 02:42:04.744732+00	2026-09-17 02:42:04.744732+00	2026-09-17 02:42:04.744732+00	{"eTag": "\\"45e7d07e1a12d76c469817c147affe29-1\\"", "size": 38090, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 38090, "httpStatusCode": 200}	bbe60f0d-59e1-46ab-a00a-288f61d29f6a	\N	\N	\N	f	f
5cd9730e-3519-49fa-bff4-e63b1b83da5c	Fotos	productos/cerveza_artesanal_IPA_pinta_2.jpg	\N	2026-09-17 02:42:04.744942+00	2026-09-17 02:42:04.744942+00	2026-09-17 02:42:04.744942+00	{"eTag": "\\"13f23070595efc7b55ad65cafa1e1cb8-1\\"", "size": 12133, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 12133, "httpStatusCode": 200}	f51deb66-38c6-43fd-a90c-d9dca9038a28	\N	\N	\N	f	f
a49458e4-b85f-4cbf-aacb-0dc2cb31154c	Fotos	productos/volcan_de_chocolate_con_helado_2.jpg	\N	2026-09-17 02:42:04.75104+00	2026-09-17 02:42:04.75104+00	2026-09-17 02:42:04.75104+00	{"eTag": "\\"ea19761abe94969a8b8ef6f88db780a5-1\\"", "size": 26274, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 26274, "httpStatusCode": 200}	e1a2a5d8-c8e8-4a2e-a907-e76fbcd3abbd	\N	\N	\N	f	f
8515c4aa-496a-4ff3-bbae-154448d68b34	Fotos	productos/volcan_de_chocolate_con_helado_1.jpg	\N	2026-09-17 02:42:04.753978+00	2026-09-17 02:42:04.753978+00	2026-09-17 02:42:04.753978+00	{"eTag": "\\"dced178c6e10d09ce14ef1334b47e60a-1\\"", "size": 28781, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 28781, "httpStatusCode": 200}	e448a57e-82e7-43ee-8a41-0298215f079f	\N	\N	\N	f	f
aa751e7c-c9a2-41f2-8ebc-2eb3966f3ce3	Fotos	productos/cerveza_artesanal_IPA_pinta_1.png	\N	2026-09-17 02:42:05.205889+00	2026-09-17 02:42:05.205889+00	2026-09-17 02:42:05.205889+00	{"eTag": "\\"aaf48b52bc433b2a3313571fcd7409a0-1\\"", "size": 417875, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 417875, "httpStatusCode": 200}	baee2057-82ec-417b-96c5-0b011164df99	\N	\N	\N	f	f
e8833404-8eb3-4887-8990-e6d597a40146	Fotos	productos/tiramisu_2.jpg	\N	2026-09-17 02:42:05.34506+00	2026-09-17 02:42:05.34506+00	2026-09-17 02:42:05.34506+00	{"eTag": "\\"1184ebf9908ac0a0667ce4eabca7cd70-1\\"", "size": 447500, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:05.000Z", "contentLength": 447500, "httpStatusCode": 200}	32e91a92-e182-4a81-9d3d-138b2fb4ff15	\N	\N	\N	f	f
0745f07a-67ec-4c2d-89cf-59cdf2ded0a7	Fotos	mesas/mesa_2.webp	\N	2026-09-17 03:29:29.694281+00	2026-09-17 03:29:29.694281+00	2026-09-17 03:29:29.694281+00	{"eTag": "\\"0b3db61ae96743c1b79fea90e594f4b4-1\\"", "size": 311586, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T03:29:29.000Z", "contentLength": 311586, "httpStatusCode": 200}	85d7a183-4c67-40a8-8c36-5a427339d0a1	\N	\N	\N	f	f
c0a5be7d-12bf-427c-8d5c-5d0e2dc2369c	Fotos	productos/copa_de_vino_2.jpg	\N	2026-09-17 02:42:06.064811+00	2026-09-17 02:42:06.064811+00	2026-09-17 02:42:06.064811+00	{"eTag": "\\"4242d571f3de79e44f96010ce3ce1aa2-1\\"", "size": 4958, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 4958, "httpStatusCode": 200}	d823653d-5eb2-4eec-a8b6-733061257c2b	\N	\N	\N	f	f
813292dd-e0f9-41df-853e-b5b57c3774b3	Fotos	productos/copa_helada_3_gustos_3.jpg	\N	2026-09-17 02:42:06.094242+00	2026-09-17 02:42:06.094242+00	2026-09-17 02:42:06.094242+00	{"eTag": "\\"4706f8dcc063638dbf7c12b14c6aa26a-1\\"", "size": 21642, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 21642, "httpStatusCode": 200}	0caf1503-9cc2-4fca-9804-bca4b680ef50	\N	\N	\N	f	f
762b3e84-e0da-4489-bcd0-a4766dc0f197	Fotos	productos/hamburguesa_doble_con_cheddar_3.jpg	\N	2026-09-17 02:42:07.497767+00	2026-09-17 02:42:07.497767+00	2026-09-17 02:42:07.497767+00	{"eTag": "\\"c0140577957c32aa243cc3f0de36acfa-1\\"", "size": 17486, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 17486, "httpStatusCode": 200}	7f382b8d-468e-473a-9719-8a09bbeb725a	\N	\N	\N	f	f
897583db-dca2-4cc3-b88c-fdf4e7f162ab	Fotos	productos/ravioles_de_ricota_con_bolognesa_1.jpg	\N	2026-09-17 02:42:08.426259+00	2026-09-17 02:42:08.426259+00	2026-09-17 02:42:08.426259+00	{"eTag": "\\"9e079c83d7c6bcff55f83ffb828909df-1\\"", "size": 34962, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:09.000Z", "contentLength": 34962, "httpStatusCode": 200}	e7f912ff-67bb-467d-a187-1d055710e4a2	\N	\N	\N	f	f
29ced2ce-647b-4fb4-8779-38b7f16e20f2	Fotos	usuarios/foto_0_1790166261733.jpg	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	2026-09-23 12:24:16.73035+00	2026-09-23 12:24:16.73035+00	2026-09-23 12:24:16.73035+00	{"eTag": "\\"f0b7a90b1dc28a34404936f8db916f10\\"", "size": 38652, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T12:24:17.000Z", "contentLength": 38652, "httpStatusCode": 200}	262b32a4-4c72-473a-9d6c-a578ae9834c8	d6dba4da-1598-4e53-ac2e-cfe47c76fd68	{}	\N	f	f
21cd3503-3ccb-4249-8589-25bf5dcaa996	Fotos	usuarios/foto_0_1789652722252.jpg	\N	2026-09-17 13:45:38.77814+00	2026-09-17 13:45:38.77814+00	2026-09-17 13:45:38.77814+00	{"eTag": "\\"7de434d3ec08beb475a0e39001d367e9\\"", "size": 58649, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:45:39.000Z", "contentLength": 58649, "httpStatusCode": 200}	9912b40f-d383-4bfa-85a9-6dc4b03fb8b3	\N	{}	\N	f	f
3b5e323f-584f-4506-b1ef-9196547f35b3	Fotos	productos/hamburguesa_doble_con_cheddar_1.jpg	\N	2026-09-17 02:42:06.160466+00	2026-09-17 02:42:06.160466+00	2026-09-17 02:42:06.160466+00	{"eTag": "\\"cbc2ab318a90c49df2cbd1f29d5a153e-1\\"", "size": 20647, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 20647, "httpStatusCode": 200}	8c80f8d9-e74f-4f3d-b07a-288cac8300bf	\N	\N	\N	f	f
5fba11c7-bc8b-4b47-9ee8-c0d4868ef9e6	Fotos	usuarios/foto_0_1790167698003.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-23 12:48:12.439926+00	2026-09-23 12:48:12.439926+00	2026-09-23 12:48:12.439926+00	{"eTag": "\\"f0b7a90b1dc28a34404936f8db916f10\\"", "size": 38652, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T12:48:13.000Z", "contentLength": 38652, "httpStatusCode": 200}	3a98291d-563c-4c3b-bf4e-79d7659671db	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
9e8fbbf7-8c4a-4945-9f7a-567a85c8e53e	Fotos	productos/milanesa_napolitana_con_papas_fritas_2.jpg	\N	2026-09-17 02:42:08.685065+00	2026-09-17 02:42:08.685065+00	2026-09-17 02:42:08.685065+00	{"eTag": "\\"7b326647f78fee8172947d1024cc1bba-1\\"", "size": 314446, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 314446, "httpStatusCode": 200}	4fa869da-e943-4837-9d1a-f7f9a7d0bd57	\N	\N	\N	f	f
f8ca2b46-7cbd-4ca3-ae3b-a24808d0f3c1	Fotos	usuarios/foto_0_1790167840641.jpg	\N	2026-09-23 12:50:30.193888+00	2026-09-23 12:50:30.193888+00	2026-09-23 12:50:30.193888+00	{"eTag": "\\"f0b7a90b1dc28a34404936f8db916f10\\"", "size": 38652, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T12:50:31.000Z", "contentLength": 38652, "httpStatusCode": 200}	701d4bc9-4d68-46df-b54f-8c4e1a5a935d	\N	{}	\N	f	f
ce7a103d-ca83-4634-9626-cb9b116143cb	Fotos	usuarios/foto_0_1790168039879.jpg	\N	2026-09-23 12:53:57.367916+00	2026-09-23 12:53:57.367916+00	2026-09-23 12:53:57.367916+00	{"eTag": "\\"3949311720201c08db21db05df92fe45\\"", "size": 29459, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T12:53:58.000Z", "contentLength": 29459, "httpStatusCode": 200}	de1cf67c-78b2-4632-a1cf-38dfe1937a8a	\N	{}	\N	f	f
89001e7f-d663-4f91-ad41-5026d1a6a890	Fotos	usuarios/foto_0_1789653421510.jpg	\N	2026-09-17 13:57:10.984563+00	2026-09-17 13:57:10.984563+00	2026-09-17 13:57:10.984563+00	{"eTag": "\\"7de434d3ec08beb475a0e39001d367e9\\"", "size": 58649, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:57:11.000Z", "contentLength": 58649, "httpStatusCode": 200}	8136d80b-17bc-4212-ada9-b705a489bddc	\N	{}	\N	f	f
8333fb37-8641-4e5d-9cb9-d007f883f8ca	Fotos	productos/flan_casero_3.jpg	\N	2026-09-17 02:42:06.358873+00	2026-09-17 02:42:06.358873+00	2026-09-17 02:42:06.358873+00	{"eTag": "\\"57875281464cba4f90d82cd4c1bd60fc-1\\"", "size": 14787, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 14787, "httpStatusCode": 200}	d89e132d-70bd-40ea-a7c0-12f1a8d8fbeb	\N	\N	\N	f	f
bf2dfba8-6d8c-4d5d-a942-e176ae6ed96a	Fotos	usuarios/foto_0_1790171671360.jpg	\N	2026-09-23 13:54:23.126051+00	2026-09-23 13:54:23.126051+00	2026-09-23 13:54:23.126051+00	{"eTag": "\\"f0b7a90b1dc28a34404936f8db916f10\\"", "size": 38652, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T13:54:24.000Z", "contentLength": 38652, "httpStatusCode": 200}	28c57947-46e5-4d43-815d-a216879baf00	\N	{}	\N	f	f
5cc68234-0b67-4f9a-8906-25a940606297	Fotos	productos/pollo_grisado_con_ensalada_2.jpg	\N	2026-09-17 02:42:08.420016+00	2026-09-17 02:42:08.420016+00	2026-09-17 02:42:08.420016+00	{"eTag": "\\"e5ebc2b8ce3200a27146a8434f1aa6c8-1\\"", "size": 40389, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:09.000Z", "contentLength": 40389, "httpStatusCode": 200}	d28c3e8b-445e-4c22-a68c-636a04325093	\N	\N	\N	f	f
557407f8-2da2-4b7f-befe-a572156c4947	Fotos	usuarios/foto_0_1789680075312.jpg	\N	2026-09-17 21:33:34.145752+00	2026-09-17 21:33:34.145752+00	2026-09-17 21:33:34.145752+00	{"eTag": "\\"7de434d3ec08beb475a0e39001d367e9\\"", "size": 58649, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T21:33:35.000Z", "contentLength": 58649, "httpStatusCode": 200}	430b2b1e-8427-46ef-9370-025c718fc434	\N	{}	\N	f	f
b66b89cc-b233-4f78-bb2f-7046f4fb95d4	Fotos	usuarios/foto_0_1790200547306.jpg	\N	2026-09-23 21:56:01.338009+00	2026-09-23 21:56:01.338009+00	2026-09-23 21:56:01.338009+00	{"eTag": "\\"5f07fcd8829819cd72022d04a36ff6bd\\"", "size": 2104263, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T21:56:02.000Z", "contentLength": 2104263, "httpStatusCode": 200}	318fcea9-6bb7-4d4e-bb79-26f90657af72	\N	{}	\N	f	f
470a7428-6eac-4a7a-a077-40415d993b96	Fotos	productos/copa_helada_3_gustos_1.jpg	\N	2026-09-17 02:42:06.081127+00	2026-09-17 02:42:06.081127+00	2026-09-17 02:42:06.081127+00	{"eTag": "\\"1cca54af73dd50488a506397eb4e12d9-1\\"", "size": 19130, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 19130, "httpStatusCode": 200}	a9d2e488-4d36-40e4-8689-1feaef53ad05	\N	\N	\N	f	f
ad821775-aa09-473d-9fba-e0b9d516d91d	Fotos	productos/copa_de_vino_3.jpg	\N	2026-09-17 02:42:06.131412+00	2026-09-17 02:42:06.131412+00	2026-09-17 02:42:06.131412+00	{"eTag": "\\"aa04f828e932a1df25d5d7b06e8bad2e-1\\"", "size": 14026, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 14026, "httpStatusCode": 200}	abca85e1-3e55-452e-aed7-7b1a86186504	\N	\N	\N	f	f
3017108d-d7cf-4cd1-ae83-bd83407fa34b	Fotos	productos/hamburguesa_doble_con_cheddar_2.jpg	\N	2026-09-17 02:42:06.152914+00	2026-09-17 02:42:06.152914+00	2026-09-17 02:42:06.152914+00	{"eTag": "\\"1f8e1bfd8b29fb1697dc81dfdd08731b-1\\"", "size": 32814, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 32814, "httpStatusCode": 200}	1243419c-32fd-4d6a-ab6d-49c87fbd31c2	\N	\N	\N	f	f
44325759-d4d1-4013-ae01-1124dc3f4363	Fotos	productos/flan_casero_2.webp	\N	2026-09-17 02:42:06.199406+00	2026-09-17 02:42:06.199406+00	2026-09-17 02:42:06.199406+00	{"eTag": "\\"793b090fc4e98dbb2502a795604f602c-1\\"", "size": 30118, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 30118, "httpStatusCode": 200}	eb27bfbc-0d28-48f6-9d0d-a58c521e629e	\N	\N	\N	f	f
2ea8cfad-d4f0-4f1c-9d46-5d1783061f6e	Fotos	productos/copa_helada_3_gustos_2.jpg	\N	2026-09-17 02:42:06.226954+00	2026-09-17 02:42:06.226954+00	2026-09-17 02:42:06.226954+00	{"eTag": "\\"a9ba6aad8215c645dfe0817caf9f23f7-1\\"", "size": 18866, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 18866, "httpStatusCode": 200}	68f1ec48-2fcc-4417-8c97-873f7a8d3ba9	\N	\N	\N	f	f
5602f572-7380-476b-9847-6322fc62b879	Fotos	productos/flan_casero_1.jpg	\N	2026-09-17 02:42:06.769334+00	2026-09-17 02:42:06.769334+00	2026-09-17 02:42:06.769334+00	{"eTag": "\\"7fd2d2f7c6bcfe82dbb80b6811ac99de-1\\"", "size": 793831, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:06.000Z", "contentLength": 793831, "httpStatusCode": 200}	674833b0-171e-4241-b628-5cbd0682e6b8	\N	\N	\N	f	f
e2930f1c-87e2-41fb-9494-66706215d4a6	Fotos	productos/licuado_de_banana_con_leche_2.jpg	\N	2026-09-17 02:42:07.485437+00	2026-09-17 02:42:07.485437+00	2026-09-17 02:42:07.485437+00	{"eTag": "\\"0f937c121ccaf55032acfbfaf21cfe4c-1\\"", "size": 46604, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 46604, "httpStatusCode": 200}	a981a143-a55e-4517-9b8d-ce7d233cede2	\N	\N	\N	f	f
85064a1c-17db-40c0-b18d-246163a098a3	Fotos	productos/limonada_de_frutos_rojos_2.jpg	\N	2026-09-17 02:42:07.509861+00	2026-09-17 02:42:07.509861+00	2026-09-17 02:42:07.509861+00	{"eTag": "\\"fb605383510ca31df6644c58dcf998fb-1\\"", "size": 16048, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 16048, "httpStatusCode": 200}	39993ac7-2d94-4588-b31d-c534d0e97352	\N	\N	\N	f	f
e813e018-f6ef-49dc-b341-bd06b483111e	Fotos	productos/jugo_de_naranja_exprimido_1.jpg	\N	2026-09-17 02:42:07.526654+00	2026-09-17 02:42:07.526654+00	2026-09-17 02:42:07.526654+00	{"eTag": "\\"ca242ab6706b224eba0978aa6bd8cf1a-1\\"", "size": 28574, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 28574, "httpStatusCode": 200}	c973ba11-86c0-4343-8a01-6efbef8d08db	\N	\N	\N	f	f
6efc23a0-bfd6-47f3-bb0d-568740744f7a	Fotos	productos/jugo_de_naranja_exprimido_2.jpg	\N	2026-09-17 02:42:07.526028+00	2026-09-17 02:42:07.526028+00	2026-09-17 02:42:07.526028+00	{"eTag": "\\"b06ae0d1904a700e9ee015950a27c67b-1\\"", "size": 30573, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 30573, "httpStatusCode": 200}	c766ff1e-6ac4-46a3-bec0-02abff2692f6	\N	\N	\N	f	f
5cb7096f-d949-4dec-97b5-9d5ca486743a	Fotos	productos/milanesa_napolitana_con_papas_fritas_3.jpg	\N	2026-09-17 02:42:08.7954+00	2026-09-17 02:42:08.7954+00	2026-09-17 02:42:08.7954+00	{"eTag": "\\"26c6c5d966347a58fa7f2dfc39a9273a-1\\"", "size": 500479, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 500479, "httpStatusCode": 200}	ab24321b-b30d-4239-97c4-d183e7867577	\N	\N	\N	f	f
89145374-cb6b-4d05-a041-73110bfaa3b4	Fotos	usuarios/foto_0_1789681268067.jpg	\N	2026-09-17 21:41:22.236528+00	2026-09-17 21:41:22.236528+00	2026-09-17 21:41:22.236528+00	{"eTag": "\\"4dc5bd0fd72c0db33ff2572ca4e19386\\"", "size": 172065, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T21:41:23.000Z", "contentLength": 172065, "httpStatusCode": 200}	af1d1040-f2bd-483c-b955-fec7b29a5153	\N	{}	\N	f	f
02d346d9-46a3-4d59-85a2-06c65e159404	Fotos	usuarios/foto_0_1790202365217.jpg	\N	2026-09-23 22:26:19.866135+00	2026-09-23 22:26:19.866135+00	2026-09-23 22:26:19.866135+00	{"eTag": "\\"1fdebe4af614cf6a172cf57fbb49b11e\\"", "size": 2704772, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-23T22:26:20.000Z", "contentLength": 2704772, "httpStatusCode": 200}	10b37f53-8d57-40b4-bf0c-dcee1dfb543e	\N	{}	\N	f	f
aebd516b-9194-4443-afab-8e3b100951a4	Fotos	productos/jugo_de_naranja_exprimido_3.jpg	\N	2026-09-17 02:42:07.532883+00	2026-09-17 02:42:07.532883+00	2026-09-17 02:42:07.532883+00	{"eTag": "\\"27629667d1c15d8419a997c6749ccc15-1\\"", "size": 20781, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 20781, "httpStatusCode": 200}	587e6281-16ac-4a4b-85c3-062ad14f2c4d	\N	\N	\N	f	f
4859e3cc-142e-426e-8b12-ccea8943363c	Fotos	productos/licuado_de_banana_con_leche_3.jpg	\N	2026-09-17 02:42:07.54949+00	2026-09-17 02:42:07.54949+00	2026-09-17 02:42:07.54949+00	{"eTag": "\\"93f10ae636d6cf0d051181af092567e2-1\\"", "size": 9587, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 9587, "httpStatusCode": 200}	12291aec-abbd-4085-964c-f7b137dd6a7b	\N	\N	\N	f	f
d8332842-210b-4fd5-b98e-acdd7743fb02	Fotos	productos/limonada_de_frutos_rojos_3.jpg	\N	2026-09-17 02:42:07.567667+00	2026-09-17 02:42:07.567667+00	2026-09-17 02:42:07.567667+00	{"eTag": "\\"860918de9ca17e032e07b61d32008a93-1\\"", "size": 39126, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 39126, "httpStatusCode": 200}	49bfb033-9bf8-4f76-8788-cfb74ae3665b	\N	\N	\N	f	f
a288cf35-2f8d-4836-9c3b-66cba0819be3	Fotos	productos/panqueques_con_dulce_de_leche_1.jpg	\N	2026-09-17 02:42:08.592601+00	2026-09-17 02:42:08.592601+00	2026-09-17 02:42:08.592601+00	{"eTag": "\\"5e1b45d4c26e5491a88e8a35ee63d88b-1\\"", "size": 261118, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 261118, "httpStatusCode": 200}	69ce97da-097b-48ff-9a9c-7c6ba9b6e688	\N	\N	\N	f	f
334dc21a-2827-4cb3-b055-3753aaaf5b62	Fotos	usuarios/foto_0_1789689588698.jpg	\N	2026-09-18 00:00:05.297252+00	2026-09-18 00:00:05.297252+00	2026-09-18 00:00:05.297252+00	{"eTag": "\\"11f738260702798b34e025dbe07ddcee\\"", "size": 40786, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T00:00:06.000Z", "contentLength": 40786, "httpStatusCode": 200}	8c187f52-5011-4dbb-acdb-da0c7418278e	\N	{}	\N	f	f
ff070558-e2ef-4956-aefc-3942f700aa82	Fotos	usuarios/foto_0_1789689897855.jpg	\N	2026-09-18 00:05:03.021339+00	2026-09-18 00:05:03.021339+00	2026-09-18 00:05:03.021339+00	{"eTag": "\\"7de434d3ec08beb475a0e39001d367e9\\"", "size": 58649, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T00:05:03.000Z", "contentLength": 58649, "httpStatusCode": 200}	254ba68b-ded2-43b0-9189-0fae3cdf8540	\N	{}	\N	f	f
d6a74754-eb13-48b2-853f-e2d10d6d663d	Fotos	productos/licuado_de_banana_con_leche_1.jpg	\N	2026-09-17 02:42:07.538948+00	2026-09-17 02:42:07.538948+00	2026-09-17 02:42:07.538948+00	{"eTag": "\\"2dcaac39f0eeb703b76c5509ceb04309-1\\"", "size": 39780, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 39780, "httpStatusCode": 200}	af8234f7-bb78-4b0b-a0d0-92d6965e2540	\N	\N	\N	f	f
b17c495d-105e-474b-9c8f-089ca1576586	Fotos	productos/pollo_grisado_con_ensalada_3.jpg	\N	2026-09-17 02:42:08.674984+00	2026-09-17 02:42:08.674984+00	2026-09-17 02:42:08.674984+00	{"eTag": "\\"a3112ab31029cd69c070b028ecb45a0e-1\\"", "size": 210373, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:09.000Z", "contentLength": 210373, "httpStatusCode": 200}	91775473-cf94-443e-93b8-0fb2e8a04e53	\N	\N	\N	f	f
228acdea-b8bb-46ea-9b4a-f392fcfbf522	Fotos	usuarios/foto_0_1789690067615.jpg	\N	2026-09-18 00:08:22.205929+00	2026-09-18 00:08:22.205929+00	2026-09-18 00:08:22.205929+00	{"eTag": "\\"11f738260702798b34e025dbe07ddcee\\"", "size": 40786, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T00:08:23.000Z", "contentLength": 40786, "httpStatusCode": 200}	735650ab-15e7-444b-86f5-dec9593865ec	\N	{}	\N	f	f
d7fd0ae5-f770-4f87-8db9-7f092cd84fb6	Fotos	usuarios/foto_0_1789690551093.jpg	\N	2026-09-18 00:16:11.032195+00	2026-09-18 00:16:11.032195+00	2026-09-18 00:16:11.032195+00	{"eTag": "\\"11f738260702798b34e025dbe07ddcee\\"", "size": 40786, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T00:16:11.000Z", "contentLength": 40786, "httpStatusCode": 200}	c210fd59-949f-4afd-9352-3c016915224b	\N	{}	\N	f	f
9f629e9c-6baf-4be1-9e18-1e37127ef2af	Fotos	usuarios/foto_0_1789691450466.jpg	\N	2026-09-18 00:31:05.673764+00	2026-09-18 00:31:05.673764+00	2026-09-18 00:31:05.673764+00	{"eTag": "\\"11f738260702798b34e025dbe07ddcee\\"", "size": 40786, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T00:31:06.000Z", "contentLength": 40786, "httpStatusCode": 200}	c42429b2-49b5-4b9e-aab9-99d7c65ce7ce	\N	{}	\N	f	f
f604e0cc-d11d-4fdc-9fb0-0b49e0d53092	Fotos	productos/limonada_de_frutos_rojos_1.jpg	\N	2026-09-17 02:42:07.585842+00	2026-09-17 02:42:07.585842+00	2026-09-17 02:42:07.585842+00	{"eTag": "\\"94c80a0575b26e5b1ecb231be90f45ef-1\\"", "size": 69970, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 69970, "httpStatusCode": 200}	191a4f18-c1f2-463d-a4fc-ae48d74430ee	\N	\N	\N	f	f
8f01c8d1-924c-4d32-9af9-b131ab92f613	Fotos	productos/milanesa_napolitana_con_papas_fritas_1.avif	\N	2026-09-17 02:42:09.080528+00	2026-09-17 02:42:09.080528+00	2026-09-17 02:42:09.080528+00	{"eTag": "\\"ba0c10192f8832d781e8c65dfad6a743-1\\"", "size": 666784, "mimetype": "image/avif", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:08.000Z", "contentLength": 666784, "httpStatusCode": 200}	3d25f39f-4f28-44e8-91dc-1208956a7c38	\N	\N	\N	f	f
d9d1c114-cce0-47cb-83df-434ed7c3f2bd	Fotos	usuarios/foto_0_1789731334172.jpg	\N	2026-09-18 11:35:51.264394+00	2026-09-18 11:35:51.264394+00	2026-09-18 11:35:51.264394+00	{"eTag": "\\"7de434d3ec08beb475a0e39001d367e9\\"", "size": 58649, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T11:35:52.000Z", "contentLength": 58649, "httpStatusCode": 200}	6c66b009-a66e-4916-8205-b383a4dee4c8	\N	{}	\N	f	f
9b159987-ee8c-4aba-b9ea-8815dd77faf0	Fotos	productos/ravioles_de_ricota_con_bolognesa_2.jpg	\N	2026-09-17 02:42:10.337434+00	2026-09-17 02:42:10.337434+00	2026-09-17 02:42:10.337434+00	{"eTag": "\\"2872d052fd21a7996af830ec951e4190-1\\"", "size": 108366, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:10.000Z", "contentLength": 108366, "httpStatusCode": 200}	4a333845-2e13-4982-acf3-2f6247cfc24c	\N	\N	\N	f	f
147e4124-3437-43bf-9336-1a7538b193a9	Fotos	usuarios/foto_0_1789732540921.jpg	\N	2026-09-18 11:56:04.261367+00	2026-09-18 11:56:04.261367+00	2026-09-18 11:56:04.261367+00	{"eTag": "\\"11f738260702798b34e025dbe07ddcee\\"", "size": 40786, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T11:56:05.000Z", "contentLength": 40786, "httpStatusCode": 200}	7054f198-bd7f-4077-afb9-a92eea8952e3	\N	{}	\N	f	f
037b2bfc-da0c-4f38-869b-6a06988deb4f	Fotos	productos/pollo_grisado_con_ensalada_1.jpg	\N	2026-09-17 02:42:09.56857+00	2026-09-17 02:42:09.56857+00	2026-09-17 02:42:09.56857+00	{"eTag": "\\"2d79c642a2a9c60f26c25413075ee250-1\\"", "size": 3088449, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:09.000Z", "contentLength": 3088449, "httpStatusCode": 200}	13d7b08a-df7d-43d3-ae67-e97037f17234	\N	\N	\N	f	f
bbdbcd2c-931e-465d-b038-5df60888cb96	Fotos	productos/ravioles_de_ricota_con_bolognesa_3.jpg	\N	2026-09-17 02:42:10.243868+00	2026-09-17 02:42:10.243868+00	2026-09-17 02:42:10.243868+00	{"eTag": "\\"e94781ad415532f0f8857037091dcb16-1\\"", "size": 31677, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:10.000Z", "contentLength": 31677, "httpStatusCode": 200}	2b9223ed-3490-4932-8fd9-87be08cd2551	\N	\N	\N	f	f
5b1bc476-5cb2-4fc6-af7b-f527f299934f	Fotos	productos/panqueques_con_dulce_de_leche_3.jpg	\N	2026-09-17 02:42:08.467116+00	2026-09-17 02:42:08.467116+00	2026-09-17 02:42:08.467116+00	{"eTag": "\\"b1a6233e2275b8bfb7e474cbb9d4d0cf-1\\"", "size": 84914, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:09.000Z", "contentLength": 84914, "httpStatusCode": 200}	2d903b5b-8adc-4e84-ba96-5ca0829c3d40	\N	\N	\N	f	f
03427005-5f54-4b52-b853-cc11a0cd107a	Fotos	usuarios/foto_0_1789765715911.jpg	\N	2026-09-18 21:08:51.986825+00	2026-09-18 21:08:51.986825+00	2026-09-18 21:08:51.986825+00	{"eTag": "\\"68211ccb7b9a90f624be0a5eba6d827b\\"", "size": 26461, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T21:08:52.000Z", "contentLength": 26461, "httpStatusCode": 200}	089011d6-a517-45e2-8ea6-9a8f25504a11	\N	{}	\N	f	f
c9fa853e-8957-4d02-8219-125d0f174794	Fotos	productos/panqueques_con_dulce_de_leche_2.jpg	\N	2026-09-17 02:42:08.354334+00	2026-09-17 02:42:08.354334+00	2026-09-17 02:42:08.354334+00	{"eTag": "\\"4d2333179f3883cf62ffe17b04861265-1\\"", "size": 46132, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T02:42:09.000Z", "contentLength": 46132, "httpStatusCode": 200}	5ef774df-3545-4985-90f8-ade3e2095c1f	\N	\N	\N	f	f
c6655047-2056-4012-8de4-6d641e17cdbc	Fotos	usuarios/foto_0_1789773553976.jpg	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-18 23:19:33.119473+00	2026-09-18 23:19:33.119473+00	2026-09-18 23:19:33.119473+00	{"eTag": "\\"33c28118b022e696505d2a02e85b235b\\"", "size": 2232638, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:19:34.000Z", "contentLength": 2232638, "httpStatusCode": 200}	afd4e910-5163-4dab-b315-033f191eef36	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
e671ce81-bfb0-44fd-89ba-a82d5fe81fa3	Fotos	productos/6995744c-4897-465a-bbfe-04203329c98c-foto_0_1789773624013.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-18 23:20:42.488685+00	2026-09-18 23:20:42.488685+00	2026-09-18 23:20:42.488685+00	{"eTag": "\\"6bc9679cd5bc366fc3cbfabca788a978\\"", "size": 2378202, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:20:43.000Z", "contentLength": 2378202, "httpStatusCode": 200}	56693775-d945-4f92-b9e4-1e68e585aa8c	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
c921658e-221e-4ea7-a7f4-7082c85ea8bd	Fotos	productos/86ac1b83-c090-4de8-9c8c-6f19827487f4-foto_1_1789773631388.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-18 23:20:43.44852+00	2026-09-18 23:20:43.44852+00	2026-09-18 23:20:43.44852+00	{"eTag": "\\"ac6ed45397088e0e7b216fcd8605667e\\"", "size": 198706, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:20:44.000Z", "contentLength": 198706, "httpStatusCode": 200}	7c3eef8a-9da0-4b18-b771-1f5344096240	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
91525448-8060-449b-9d37-826e2a03c95d	Fotos	productos/68163a69-4c0a-496d-a442-d92d5bb13fa3-foto_2_1789773636910.jpg	268c6ca3-9187-4659-b644-964ea7ec542f	2026-09-18 23:20:46.64697+00	2026-09-18 23:20:46.64697+00	2026-09-18 23:20:46.64697+00	{"eTag": "\\"69e52e79936d66448ab14957bc01508e\\"", "size": 2567742, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:20:47.000Z", "contentLength": 2567742, "httpStatusCode": 200}	246d16a8-51e9-41ff-92a0-94becabe0d2b	268c6ca3-9187-4659-b644-964ea7ec542f	{}	\N	f	f
0008851e-774f-4707-8366-5e045bbdaefb	Fotos	qr/309fbfd5-4bb8-4254-90b0-b043102b35ef-qr.png	0eda206f-34b4-4997-9e93-486c82af04b1	2026-09-18 23:26:27.153185+00	2026-09-18 23:26:27.153185+00	2026-09-18 23:26:27.153185+00	{"eTag": "\\"f2ade72f8d2d4a4a4334c5dfa770edee\\"", "size": 4877, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T23:26:28.000Z", "contentLength": 4877, "httpStatusCode": 200}	ebccc787-8542-432a-9cf9-3752bad47576	0eda206f-34b4-4997-9e93-486c82af04b1	{}	\N	f	f
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 948, true);


--
-- Name: pedidos_numero_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedidos_numero_pedido_seq', 10, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 403, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_mfa_factor_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_mfa_factor_id_key UNIQUE (mfa_factor_id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_pkey PRIMARY KEY (id);


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_user_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_user_id_key UNIQUE (user_id);


--
-- Name: mfa_recovery_codes mfa_recovery_codes_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_codes
    ADD CONSTRAINT mfa_recovery_codes_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: scim_tokens scim_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_tokens
    ADD CONSTRAINT scim_tokens_pkey PRIMARY KEY (id);


--
-- Name: scim_users scim_users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: clientes_anonimos clientes_anonimos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes_anonimos
    ADD CONSTRAINT clientes_anonimos_pkey PRIMARY KEY (id);


--
-- Name: mensajes mensajes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_pkey PRIMARY KEY (id);


--
-- Name: mesas mesas_numero_mesa_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesas
    ADD CONSTRAINT mesas_numero_mesa_key UNIQUE (numero_mesa);


--
-- Name: mesas mesas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesas
    ADD CONSTRAINT mesas_pkey PRIMARY KEY (id);


--
-- Name: pedido_detalles pedido_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_detalles
    ADD CONSTRAINT pedido_detalles_pkey PRIMARY KEY (id);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- Name: productos productos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_nombre_key UNIQUE (nombre);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_electronico_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_electronico_key UNIQUE (correo_electronico);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_20 messages_2026_09_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_09_20
    ADD CONSTRAINT messages_2026_09_20_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_21 messages_2026_09_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_09_21
    ADD CONSTRAINT messages_2026_09_21_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_22 messages_2026_09_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_09_22
    ADD CONSTRAINT messages_2026_09_22_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_23 messages_2026_09_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_09_23
    ADD CONSTRAINT messages_2026_09_23_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_24 messages_2026_09_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_09_24
    ADD CONSTRAINT messages_2026_09_24_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_25 messages_2026_09_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_09_25
    ADD CONSTRAINT messages_2026_09_25_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_09_26 messages_2026_09_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_09_26
    ADD CONSTRAINT messages_2026_09_26_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: mfa_recovery_codes_set_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_recovery_codes_set_id_idx ON auth.mfa_recovery_codes USING btree (mfa_recovery_code_set_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: scim_tokens_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_tokens_expires_at_idx ON auth.scim_tokens USING btree (expires_at);


--
-- Name: scim_tokens_revoked_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_tokens_revoked_at_idx ON auth.scim_tokens USING btree (revoked_at);


--
-- Name: scim_tokens_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_tokens_sso_provider_id_idx ON auth.scim_tokens USING btree (sso_provider_id);


--
-- Name: scim_tokens_token_hash_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX scim_tokens_token_hash_key ON auth.scim_tokens USING btree (token_hash);


--
-- Name: scim_users_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_created_at_idx ON auth.scim_users USING btree (sso_provider_id, created_at, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_deleted_at_idx ON auth.scim_users USING btree (deleted_at);


--
-- Name: scim_users_external_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX scim_users_external_id_key ON auth.scim_users USING btree (sso_provider_id, external_id) WHERE ((external_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: scim_users_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_id_idx ON auth.scim_users USING btree (sso_provider_id, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_sso_provider_id_idx ON auth.scim_users USING btree (sso_provider_id);


--
-- Name: scim_users_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_updated_at_idx ON auth.scim_users USING btree (sso_provider_id, updated_at, id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_user_id_idx ON auth.scim_users USING btree (user_id);


--
-- Name: scim_users_user_name_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX scim_users_user_name_idx ON auth.scim_users USING btree (sso_provider_id, user_name COLLATE "C", id) WHERE (deleted_at IS NULL);


--
-- Name: scim_users_user_name_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX scim_users_user_name_key ON auth.scim_users USING btree (sso_provider_id, user_name) WHERE (deleted_at IS NULL);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: chats_uno_abierto_por_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX chats_uno_abierto_por_cliente ON public.chats USING btree (cliente_id) WHERE (fecha_cierre IS NULL);


--
-- Name: idx_mensajes_chat_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mensajes_chat_fecha ON public.mensajes USING btree (chat_id, fecha);


--
-- Name: mensajes_por_chat_y_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mensajes_por_chat_y_fecha ON public.mensajes USING btree (chat_id, fecha);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_20_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_09_20_inserted_at_topic_idx ON realtime.messages_2026_09_20 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_21_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_09_21_inserted_at_topic_idx ON realtime.messages_2026_09_21 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_22_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_09_22_inserted_at_topic_idx ON realtime.messages_2026_09_22 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_23_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_09_23_inserted_at_topic_idx ON realtime.messages_2026_09_23 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_24_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_09_24_inserted_at_topic_idx ON realtime.messages_2026_09_24 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_25_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_09_25_inserted_at_topic_idx ON realtime.messages_2026_09_25 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_09_26_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_09_26_inserted_at_topic_idx ON realtime.messages_2026_09_26 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: idx_objects_current_version; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_objects_current_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (archived_at IS NULL);


--
-- Name: idx_objects_delete_markers; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_delete_markers ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE is_delete_marker;


--
-- Name: idx_objects_null_version; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_objects_null_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (NOT is_versioned);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_name_version_key; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_name_version_key ON storage.objects USING btree (bucket_id, name COLLATE "C", version) NULLS NOT DISTINCT;


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2026_09_20_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_20_inserted_at_topic_idx;


--
-- Name: messages_2026_09_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_20_pkey;


--
-- Name: messages_2026_09_21_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_21_inserted_at_topic_idx;


--
-- Name: messages_2026_09_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_21_pkey;


--
-- Name: messages_2026_09_22_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_22_inserted_at_topic_idx;


--
-- Name: messages_2026_09_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_22_pkey;


--
-- Name: messages_2026_09_23_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_23_inserted_at_topic_idx;


--
-- Name: messages_2026_09_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_23_pkey;


--
-- Name: messages_2026_09_24_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_24_inserted_at_topic_idx;


--
-- Name: messages_2026_09_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_24_pkey;


--
-- Name: messages_2026_09_25_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_25_inserted_at_topic_idx;


--
-- Name: messages_2026_09_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_25_pkey;


--
-- Name: messages_2026_09_26_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_26_inserted_at_topic_idx;


--
-- Name: messages_2026_09_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_26_pkey;


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_bucket_control_insert; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_bucket_control_insert BEFORE INSERT ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns('service_role');


--
-- Name: buckets protect_bucket_control_update; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_bucket_control_update BEFORE UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns();


--
-- Name: buckets protect_bucket_control_update_role; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_bucket_control_update_role AFTER UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_lifecycle_service_role('service_role');


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_mfa_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_mfa_factor_id_fkey FOREIGN KEY (mfa_factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_recovery_codes mfa_recovery_codes_mfa_recovery_code_set_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_recovery_codes
    ADD CONSTRAINT mfa_recovery_codes_mfa_recovery_code_set_id_fkey FOREIGN KEY (mfa_recovery_code_set_id) REFERENCES auth.mfa_recovery_code_sets(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_tokens scim_tokens_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_tokens
    ADD CONSTRAINT scim_tokens_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_users scim_users_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: scim_users scim_users_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chats chats_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: chats chats_mesa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas(id) ON DELETE CASCADE;


--
-- Name: mensajes mensajes_autor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: mensajes mensajes_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: mesas mesas_cliente_registrado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesas
    ADD CONSTRAINT mesas_cliente_registrado_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: pedido_detalles pedido_detalles_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_detalles
    ADD CONSTRAINT pedido_detalles_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- Name: pedido_detalles pedido_detalles_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_detalles
    ADD CONSTRAINT pedido_detalles_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE RESTRICT;


--
-- Name: pedidos pedidos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: pedidos pedidos_mesa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas(id) ON DELETE RESTRICT;


--
-- Name: usuarios usuarios_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_mesa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: pedido_detalles Permitir acceso público a detalles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acceso público a detalles" ON public.pedido_detalles USING (true);


--
-- Name: pedidos Permitir acceso público a pedidos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acceso público a pedidos" ON public.pedidos USING (true);


--
-- Name: productos Permitir acceso público a productos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acceso público a productos" ON public.productos USING (true);


--
-- Name: clientes_anonimos Permitir acceso público anónimos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acceso público anónimos" ON public.clientes_anonimos USING (true);


--
-- Name: chats Permitir acceso público chats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acceso público chats" ON public.chats USING (true);


--
-- Name: mensajes Permitir acceso público mensajes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acceso público mensajes" ON public.mensajes USING (true);


--
-- Name: usuarios Permitir acceso público usuarios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir acceso público usuarios" ON public.usuarios USING (true);


--
-- Name: mesas Permitir select total mesas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir select total mesas" ON public.mesas USING (true);


--
-- Name: chats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

--
-- Name: clientes_anonimos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clientes_anonimos ENABLE ROW LEVEL SECURITY;

--
-- Name: mensajes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

--
-- Name: mesas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;

--
-- Name: pedido_detalles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pedido_detalles ENABLE ROW LEVEL SECURITY;

--
-- Name: pedidos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

--
-- Name: productos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Permitir subidas anónimas 14ixu7_0; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Permitir subidas anónimas 14ixu7_0" ON storage.objects FOR SELECT TO supabase_realtime_admin, authenticated, anon, service_role, supabase_privileged_role, supabase_replication_admin, supabase_read_only_user, supabase_etl_admin USING ((bucket_id = 'Fotos'::text));


--
-- Name: objects Permitir subidas anónimas 14ixu7_1; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Permitir subidas anónimas 14ixu7_1" ON storage.objects FOR UPDATE TO supabase_realtime_admin, authenticated, anon, service_role, supabase_privileged_role, supabase_replication_admin, supabase_read_only_user, supabase_etl_admin USING ((bucket_id = 'Fotos'::text));


--
-- Name: objects Permitir subidas anónimas 14ixu7_2; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Permitir subidas anónimas 14ixu7_2" ON storage.objects FOR DELETE TO supabase_realtime_admin, authenticated, anon, service_role, supabase_privileged_role, supabase_replication_admin, supabase_read_only_user, supabase_etl_admin USING ((bucket_id = 'Fotos'::text));


--
-- Name: objects Permitir subidas anónimas 14ixu7_3; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Permitir subidas anónimas 14ixu7_3" ON storage.objects FOR INSERT TO supabase_realtime_admin, authenticated, anon, service_role, supabase_privileged_role, supabase_replication_admin, supabase_read_only_user, supabase_etl_admin WITH CHECK ((bucket_id = 'Fotos'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime mensajes; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.mensajes;


--
-- Name: supabase_realtime usuarios; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.usuarios;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
   EXECUTE FUNCTION public.rls_auto_enable();


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict rMXMgbknsmxcQZt7YaUKJwx1Z7XUSbqIbz8TYSwTofnZ7JovMiI6BMy0YqfQrop

