--
-- PostgreSQL database cluster dump
--

\restrict XDczWPvhCJi40yhbLwmKwmbjgFBNCFzEOvsgWdgcUP2cCGD8iVKUlhfgl9sZ8Wh

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE gaia_user;
ALTER ROLE gaia_user WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:swA7pqsL5Qrq4TfpOCIUQQ==$i0m8B4Aj9t4HHw0f3EJKrxs2nWwXWoTMguO+O0INq04=:Kld+BIXQA+nmwnrP4p/jXYcdF3AeOSEwoQ5vZkd2jzA=';

--
-- User Configurations
--








\unrestrict XDczWPvhCJi40yhbLwmKwmbjgFBNCFzEOvsgWdgcUP2cCGD8iVKUlhfgl9sZ8Wh

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict svcugSRXIeo34ZLId0D73pmBfpvj1oZG4H85oMHYoN7DFiNA8AVSRpu2OpBtF4s

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

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
-- PostgreSQL database dump complete
--

\unrestrict svcugSRXIeo34ZLId0D73pmBfpvj1oZG4H85oMHYoN7DFiNA8AVSRpu2OpBtF4s

--
-- Database "gaia_db" dump
--

--
-- PostgreSQL database dump
--

\restrict Sl89czTG9OlzhcyZhKHfabcxyV9mVTZF3Y7igSCTYP56JhN9KzxDxHm7Xi30n1C

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

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
-- Name: gaia_db; Type: DATABASE; Schema: -; Owner: gaia_user
--

CREATE DATABASE gaia_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE gaia_db OWNER TO gaia_user;

\unrestrict Sl89czTG9OlzhcyZhKHfabcxyV9mVTZF3Y7igSCTYP56JhN9KzxDxHm7Xi30n1C
\connect gaia_db
\restrict Sl89czTG9OlzhcyZhKHfabcxyV9mVTZF3Y7igSCTYP56JhN9KzxDxHm7Xi30n1C

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_atualizado_em(); Type: FUNCTION; Schema: public; Owner: gaia_user
--

CREATE FUNCTION public.update_atualizado_em() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_atualizado_em() OWNER TO gaia_user;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: gaia_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO gaia_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access_logs; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.access_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    acao character varying(100),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    detalhes jsonb
);


ALTER TABLE public.access_logs OWNER TO gaia_user;

--
-- Name: TABLE access_logs; Type: COMMENT; Schema: public; Owner: gaia_user
--

COMMENT ON TABLE public.access_logs IS 'Log de todos os acessos e ações realizadas no sistema';


--
-- Name: backup_config; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.backup_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    google_drive_enabled boolean DEFAULT false,
    google_drive_token text,
    s3_enabled boolean DEFAULT false,
    s3_bucket character varying(255),
    s3_region character varying(50),
    local_backup_enabled boolean DEFAULT true,
    backup_interval_minutes integer DEFAULT 15,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.backup_config OWNER TO gaia_user;

--
-- Name: backup_history; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.backup_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    backup_type character varying(50) NOT NULL,
    destination character varying(100),
    status character varying(50),
    arquivo_size bigint,
    criado_em timestamp without time zone DEFAULT now(),
    completado_em timestamp without time zone
);


ALTER TABLE public.backup_history OWNER TO gaia_user;

--
-- Name: campaign_logs; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.campaign_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    acao character varying(100) NOT NULL,
    detalhes jsonb,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.campaign_logs OWNER TO gaia_user;

--
-- Name: campaign_metrics; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.campaign_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    plataforma character varying(50) NOT NULL,
    impressoes integer DEFAULT 0,
    cliques integer DEFAULT 0,
    conversoes integer DEFAULT 0,
    custo numeric(10,2) DEFAULT 0,
    receita numeric(10,2) DEFAULT 0,
    cpc numeric(10,2) DEFAULT 0,
    ctr numeric(5,2) DEFAULT 0,
    roas numeric(5,2) DEFAULT 0,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.campaign_metrics OWNER TO gaia_user;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    titulo character varying(255) NOT NULL,
    descricao text,
    publico jsonb NOT NULL,
    orcamento numeric(10,2) NOT NULL,
    imagem_url character varying(500),
    texto text NOT NULL,
    status character varying(50) DEFAULT 'rascunho'::character varying,
    plataformas jsonb DEFAULT '{"tiktok": false, "whatsapp": false, "instagram": false, "google_ads": false}'::jsonb,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now(),
    iniciado_em timestamp without time zone,
    finalizado_em timestamp without time zone
);


ALTER TABLE public.campaigns OWNER TO gaia_user;

--
-- Name: demo_mode_sessions; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.demo_mode_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    status character varying(50) DEFAULT 'ativo'::character varying,
    campanhas_demo integer DEFAULT 0,
    vendas_demo integer DEFAULT 0,
    receita_demo numeric(10,2) DEFAULT 0,
    criado_em timestamp without time zone DEFAULT now(),
    atualizado_em timestamp without time zone DEFAULT now()
);


ALTER TABLE public.demo_mode_sessions OWNER TO gaia_user;

--
-- Name: jwt_sessions; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.jwt_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    token_hash character varying(255) NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expira_em timestamp without time zone NOT NULL,
    revogado boolean DEFAULT false
);


ALTER TABLE public.jwt_sessions OWNER TO gaia_user;

--
-- Name: TABLE jwt_sessions; Type: COMMENT; Schema: public; Owner: gaia_user
--

COMMENT ON TABLE public.jwt_sessions IS 'Sessões JWT para controle de tokens';


--
-- Name: logs; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    acao character varying(255) NOT NULL,
    detalhes text,
    ip_address character varying(45),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs OWNER TO gaia_user;

--
-- Name: metrics; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    campaign_id uuid NOT NULL,
    data date NOT NULL,
    cliques integer DEFAULT 0,
    impressoes integer DEFAULT 0,
    conversoes integer DEFAULT 0,
    custo numeric(10,2),
    receita numeric(10,2),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.metrics OWNER TO gaia_user;

--
-- Name: offline_cache; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.offline_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tipo_dados character varying(100),
    dados jsonb NOT NULL,
    sincronizado boolean DEFAULT false,
    criado_em timestamp without time zone DEFAULT now(),
    sincronizado_em timestamp without time zone
);


ALTER TABLE public.offline_cache OWNER TO gaia_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    senha character varying(255) NOT NULL,
    nome character varying(255),
    google_ads_key character varying(500),
    instagram_token character varying(500),
    whatsapp_token character varying(500),
    chaves_api jsonb DEFAULT '{"whatsapp": null, "instagram": null, "google_ads": null}'::jsonb,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO gaia_user;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: gaia_user
--

COMMENT ON TABLE public.users IS 'Tabela de usuários do Gaia com chaves de API criptografadas';


--
-- Name: COLUMN users.chaves_api; Type: COMMENT; Schema: public; Owner: gaia_user
--

COMMENT ON COLUMN public.users.chaves_api IS 'Chaves de API criptografadas em JSON (google_ads, instagram, whatsapp)';


--
-- Name: voice_history; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.voice_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    comando text NOT NULL,
    transcricao text,
    resposta text,
    audio_url character varying(500),
    campanha_id uuid,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.voice_history OWNER TO gaia_user;

--
-- Name: whatsapp_messages; Type: TABLE; Schema: public; Owner: gaia_user
--

CREATE TABLE public.whatsapp_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    campaign_id uuid,
    numero_cliente character varying(20) NOT NULL,
    tipo character varying(20) NOT NULL,
    conteudo text NOT NULL,
    resposta text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_messages OWNER TO gaia_user;

--
-- Data for Name: access_logs; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.access_logs (id, user_id, ip_address, acao, "timestamp", detalhes) FROM stdin;
\.


--
-- Data for Name: backup_config; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.backup_config (id, user_id, google_drive_enabled, google_drive_token, s3_enabled, s3_bucket, s3_region, local_backup_enabled, backup_interval_minutes, criado_em, atualizado_em) FROM stdin;
\.


--
-- Data for Name: backup_history; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.backup_history (id, user_id, backup_type, destination, status, arquivo_size, criado_em, completado_em) FROM stdin;
\.


--
-- Data for Name: campaign_logs; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.campaign_logs (id, campaign_id, acao, detalhes, "timestamp") FROM stdin;
76790ff6-835b-4a46-a78a-6dacc3f234be	a79b4dae-9586-4e35-8d31-baf46c63fa35	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
944fbb87-1ed5-49a3-84af-d4a6a276a0a4	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
6dcfdf99-55f0-40e3-afc9-987ffda31a4c	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
22c0b636-e005-40a2-86c7-7d237ec27d77	638a4cfa-742e-4548-9927-66fc4119d620	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
85551d7f-fa70-4ea5-a5c0-44a764813908	ea7e3bb0-d793-4254-9c98-819931338c6a	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
d3424a2a-074a-4102-b947-d2fda973d512	a59db332-fede-4795-a1da-ee9bc397da9f	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
e28b1f3e-6b71-497b-8611-eacbd4169879	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
758d906e-379d-4253-b39a-7e567f78436d	eee3eb1e-4c36-4155-8350-93ec0a35bd67	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
a7b62505-806b-4498-85da-c8685e53cfdc	8efeb629-5221-4536-bc85-d262c60fa72e	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
997da45e-bb1f-4ece-9831-926d3cc38e2c	cc7cfe45-258e-4e16-8ae5-04ce91f8080f	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
9d815846-7d85-4f61-90c1-7a439a036fe7	d6c9deb7-6b31-4bb6-997a-48c150e144f5	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
a367eab5-3262-410d-80b4-872a0ea33982	9a71a652-a4d7-4348-a84a-78e396e7128f	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
944cb79a-282a-47d9-8b1d-800fcabc6ae9	0a0a2d7f-d85b-4f63-b36b-2eb52215a659	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
ba3d1f2f-9803-4949-8f85-21af7b852f7f	3a7b4e61-48c0-49ee-8f73-cb3e621522b3	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
a398e684-97a6-4709-bb7d-8bdcef846dc9	47e33042-6308-41e9-a943-804820fdedf0	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
14268de6-0f40-4c59-9348-407ce1cedea2	78444104-f7b7-4bcc-8255-fe3d92093669	disparar	{"status": "sucesso", "timestamp": "2025-12-08T03:47:48Z", "plataformas": ["instagram", "google_ads", "tiktok", "whatsapp"]}	2025-12-08 03:47:48.207875
d03592f6-a394-4848-a778-aba7f498af87	a79b4dae-9586-4e35-8d31-baf46c63fa35	analisar	{"score": 14, "timestamp": "2025-12-08T03:47:48Z", "recomendacoes": ["otimizar_publico", "aumentar_orcamento"]}	2025-12-08 03:47:48.251845
37ea96d9-a15a-4da4-a47f-95de96161b99	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	analisar	{"score": 60, "timestamp": "2025-12-08T03:47:48Z", "recomendacoes": ["otimizar_publico", "aumentar_orcamento"]}	2025-12-08 03:47:48.251845
ffc2ed07-e87a-4367-b4b2-349b3885bc7b	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	analisar	{"score": 36, "timestamp": "2025-12-08T03:47:48Z", "recomendacoes": ["otimizar_publico", "aumentar_orcamento"]}	2025-12-08 03:47:48.251845
73e236da-ba47-4d6a-891e-a5922440b0f0	638a4cfa-742e-4548-9927-66fc4119d620	analisar	{"score": 58, "timestamp": "2025-12-08T03:47:48Z", "recomendacoes": ["otimizar_publico", "aumentar_orcamento"]}	2025-12-08 03:47:48.251845
39b8c147-6f56-47a7-9264-f3ead3a2b298	ea7e3bb0-d793-4254-9c98-819931338c6a	analisar	{"score": 56, "timestamp": "2025-12-08T03:47:48Z", "recomendacoes": ["otimizar_publico", "aumentar_orcamento"]}	2025-12-08 03:47:48.251845
\.


--
-- Data for Name: campaign_metrics; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.campaign_metrics (id, campaign_id, plataforma, impressoes, cliques, conversoes, custo, receita, cpc, ctr, roas, "timestamp") FROM stdin;
7a42ffd8-a747-4bff-8ed9-eca6248d9edd	a79b4dae-9586-4e35-8d31-baf46c63fa35	instagram	8043	470	44	235.00	1827.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
98ba0efd-25de-4a6c-9b53-9ad77db99b15	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	instagram	10495	305	25	397.00	1649.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
ed0e6fc6-2ba8-411f-8aa4-efaf3bc9cb22	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	instagram	5945	621	38	450.00	1684.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
edd6cd94-c58d-4367-ae7e-f0832d207349	93b70108-df67-4013-b2ba-6f50aaad87c6	instagram	7814	558	28	260.00	668.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
df3c4c87-8c07-4dd6-8729-1dbe711f3eda	638a4cfa-742e-4548-9927-66fc4119d620	instagram	14632	440	56	200.00	982.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
1d22f325-4d62-46cb-8c93-9f5409a40c10	ea7e3bb0-d793-4254-9c98-819931338c6a	instagram	10187	287	14	598.00	2182.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
caf5f685-fe13-4c53-a702-a3884a86b163	a59db332-fede-4795-a1da-ee9bc397da9f	instagram	7177	391	24	279.00	2323.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
dc8d7380-e48d-41fe-b516-ee6b43292ea4	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	instagram	8652	498	23	150.00	1678.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
d58ff6b6-434f-4034-b615-36f33cf90e88	5e311451-4c8c-4e35-b30c-55a2102a99c8	instagram	10215	297	29	317.00	1903.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
bc93621a-ea9d-4c12-89ef-25eb47b23f87	eee3eb1e-4c36-4155-8350-93ec0a35bd67	instagram	8581	571	37	116.00	1659.00	0.00	0.00	0.00	2025-12-07 20:47:59.079479
1b44a8b9-44de-4716-8dd1-ef035b0cb1de	a79b4dae-9586-4e35-8d31-baf46c63fa35	google_ads	9887	606	77	522.00	2367.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
0544b8e7-4cff-4df8-8510-d992d7feb84c	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	google_ads	8253	760	75	265.00	3052.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
fdebc63a-7cf0-42d4-9b71-3e72ac6c6962	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	google_ads	20930	965	40	799.00	1901.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
be95b588-e9cc-499c-a679-e92db6699417	93b70108-df67-4013-b2ba-6f50aaad87c6	google_ads	10654	423	78	458.00	988.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
1f0a46af-150c-45bb-8409-8941b1287306	638a4cfa-742e-4548-9927-66fc4119d620	google_ads	16013	515	45	331.00	986.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
866e5338-cc8b-49ee-a5db-c323d534d16e	ea7e3bb0-d793-4254-9c98-819931338c6a	google_ads	22645	978	30	449.00	2866.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
4b8ae99a-ea9f-479e-84e9-1793a97c2b15	a59db332-fede-4795-a1da-ee9bc397da9f	google_ads	18641	427	93	257.00	1684.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
fe37266a-6cef-47a1-9200-262b90e5ffb7	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	google_ads	9021	570	47	861.00	1161.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
2bfe85c2-ffd9-49a8-8da9-2fc903aebe7a	5e311451-4c8c-4e35-b30c-55a2102a99c8	google_ads	16683	657	31	431.00	1454.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
6738d786-8704-4508-a8a0-c59ab3342d37	eee3eb1e-4c36-4155-8350-93ec0a35bd67	google_ads	19649	502	46	960.00	1880.00	0.00	0.00	0.00	2025-12-07 20:47:59.195662
dbae5974-db74-4ab9-b85e-010d2fc1f01c	a79b4dae-9586-4e35-8d31-baf46c63fa35	tiktok	23761	529	77	254.00	2742.00	0.00	0.00	0.00	2025-12-07 20:47:59.20509
e0cc0672-b4a1-4103-9296-bc7c1ffd8c27	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	tiktok	17836	951	96	389.00	3076.00	0.00	0.00	0.00	2025-12-07 20:47:59.20509
1a664148-a3be-4098-a8b0-70edff3570fa	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	tiktok	10472	1300	93	283.00	2369.00	0.00	0.00	0.00	2025-12-07 20:47:59.20509
484a8a8e-8df6-4767-9cff-6828f3d9b9f1	638a4cfa-742e-4548-9927-66fc4119d620	tiktok	17577	1213	69	467.00	723.00	0.00	0.00	0.00	2025-12-07 20:47:59.20509
b66fa01c-bc22-4ece-93d6-750f51f8ab1e	ea7e3bb0-d793-4254-9c98-819931338c6a	tiktok	17212	672	121	618.00	938.00	0.00	0.00	0.00	2025-12-07 20:47:59.20509
6b00758b-0265-4032-83a0-882d19b0e97f	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	tiktok	14896	629	93	338.00	714.00	0.00	0.00	0.00	2025-12-07 20:47:59.20509
9333e999-3250-42ff-92eb-6bd3bebe326f	eee3eb1e-4c36-4155-8350-93ec0a35bd67	tiktok	24202	993	92	238.00	2345.00	0.00	0.00	0.00	2025-12-07 20:47:59.20509
bf5aa527-0ff9-4c9d-b685-fea0d36fdd8e	a79b4dae-9586-4e35-8d31-baf46c63fa35	whatsapp	4463	389	15	135.00	772.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
3f312dbc-596b-4f94-b0cd-718a72cee96d	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	whatsapp	6648	167	43	94.00	1365.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
1a0f9abe-4b4e-46e3-99e9-5fe06b7d3e62	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	whatsapp	5921	180	28	234.00	1733.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
93e88f9e-3258-401a-b4ee-924fde13dc5a	93b70108-df67-4013-b2ba-6f50aaad87c6	whatsapp	3938	225	29	304.00	1124.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
cce7e71a-9da3-4c3d-a898-e69ca6f60906	638a4cfa-742e-4548-9927-66fc4119d620	whatsapp	6372	282	26	275.00	1354.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
88b2a2a7-f494-4fd2-8d3b-7ba7b8709ce6	ea7e3bb0-d793-4254-9c98-819931338c6a	whatsapp	6836	371	36	143.00	1436.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
4af809dd-8ad2-4182-8834-9b55e6283a57	a59db332-fede-4795-a1da-ee9bc397da9f	whatsapp	4673	220	45	143.00	942.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
7951d984-e7d9-4cc7-ac20-ed567cc8761d	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	whatsapp	4427	153	28	214.00	1675.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
de78ca66-049b-4b78-9e00-bce810c762f6	5e311451-4c8c-4e35-b30c-55a2102a99c8	whatsapp	4329	245	24	313.00	380.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
c493c03c-efea-47eb-939b-c6a66b1e736f	eee3eb1e-4c36-4155-8350-93ec0a35bd67	whatsapp	6313	119	44	221.00	361.00	0.00	0.00	0.00	2025-12-07 20:47:59.213298
3df6af7d-9309-4385-af39-e995410edb28	a79b4dae-9586-4e35-8d31-baf46c63fa35	instagram	13843	482	11	146.00	2357.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
31851ee5-d4ae-4761-b12f-3ab4387c551c	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	instagram	14114	211	42	437.00	1436.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
54ee869e-845b-4fe1-b109-aca42029265b	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	instagram	6071	239	25	484.00	2455.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
dd37e289-4181-449d-984d-d119bd6c3d4d	93b70108-df67-4013-b2ba-6f50aaad87c6	instagram	11862	333	40	174.00	1142.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
773edb65-a572-4d99-aa30-e808548dbdd5	638a4cfa-742e-4548-9927-66fc4119d620	instagram	5251	464	44	363.00	2034.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
2d291e84-5273-4626-9de7-ec7b4ab3f7f1	ea7e3bb0-d793-4254-9c98-819931338c6a	instagram	12263	228	59	547.00	1374.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
8a59fb74-b4eb-44b1-8fc1-78bd72486ff3	a59db332-fede-4795-a1da-ee9bc397da9f	instagram	5815	506	39	529.00	1771.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
b8cd9ef0-c9a3-4dd7-8d93-5948e848e0b9	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	instagram	11938	552	28	177.00	2055.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
4648a5fc-ea43-46d2-8f03-502773385c98	5e311451-4c8c-4e35-b30c-55a2102a99c8	instagram	6122	415	44	292.00	1316.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
2e1a3a81-5362-4973-b360-fba211936d09	eee3eb1e-4c36-4155-8350-93ec0a35bd67	instagram	11280	655	21	297.00	795.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
cba88971-b17f-4910-ac83-aaa22f058f4b	8efeb629-5221-4536-bc85-d262c60fa72e	instagram	12362	251	26	526.00	1744.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
4bbb9c90-b0e2-456e-900d-31be1b5a96aa	cc7cfe45-258e-4e16-8ae5-04ce91f8080f	instagram	9916	583	19	399.00	1416.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
2b4f0d95-6871-4d15-ae62-ddbea1ad7560	d6c9deb7-6b31-4bb6-997a-48c150e144f5	instagram	7089	661	47	298.00	1630.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
d98623bd-568b-428a-a355-16dca426a0fe	24e9c590-f75a-451e-ada6-b626f4bec767	instagram	8220	486	52	131.00	1029.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
034cb6bb-b7ca-4615-b462-df3f9eb027e9	9a71a652-a4d7-4348-a84a-78e396e7128f	instagram	13805	362	14	196.00	1443.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
77d5f759-7418-4e15-83e9-298160c2a9b0	0a0a2d7f-d85b-4f63-b36b-2eb52215a659	instagram	7085	221	42	151.00	1042.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
5a7fac18-cd5d-43c2-b0ef-56541825c9cf	3a7b4e61-48c0-49ee-8f73-cb3e621522b3	instagram	12728	235	10	502.00	787.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
60929ec2-1b1c-42b1-af54-1e99879acf3d	47e33042-6308-41e9-a943-804820fdedf0	instagram	7398	606	24	187.00	1284.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
db86341c-7f69-4b1f-89ed-46f53d5ee57e	c6d46198-4506-48db-9ea7-80f000572454	instagram	9302	234	38	255.00	1468.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
54c0352d-9fae-44b0-b062-91b50edecc90	78444104-f7b7-4bcc-8255-fe3d92093669	instagram	7441	555	19	118.00	1643.00	0.00	0.00	0.00	2025-12-08 03:47:48.054615
e7f9602b-d2a2-4e21-9e5c-787033c4b2ba	a79b4dae-9586-4e35-8d31-baf46c63fa35	google_ads	12260	419	68	422.00	2257.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
32f79ee1-5109-4d5c-bd70-e197848bb6cc	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	google_ads	10230	975	49	734.00	3214.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
6be6966a-9f11-4989-830a-46418ebbefb5	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	google_ads	22966	568	78	755.00	2454.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
1f169735-2d2e-4c96-9818-bc01cc389323	93b70108-df67-4013-b2ba-6f50aaad87c6	google_ads	17921	921	46	451.00	1069.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
90cdd7e8-1430-4e00-bcc7-815398bc8c21	638a4cfa-742e-4548-9927-66fc4119d620	google_ads	19927	1056	50	885.00	946.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
db3af0fb-b828-4036-a4ba-61dda5c3889f	ea7e3bb0-d793-4254-9c98-819931338c6a	google_ads	13844	1077	96	914.00	2875.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
c5db1c7e-1a69-4f65-8e5a-a63bcc627234	a59db332-fede-4795-a1da-ee9bc397da9f	google_ads	21527	891	82	428.00	2960.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
b8e536b6-d0e1-470c-9fa4-7ee8b96b0b2b	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	google_ads	15090	957	29	576.00	2663.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
ed3464fe-16eb-443b-a059-5e450e37b175	5e311451-4c8c-4e35-b30c-55a2102a99c8	google_ads	19911	1083	36	864.00	2236.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
81bcccb2-e92d-4f25-823d-b74d0b0e0b53	eee3eb1e-4c36-4155-8350-93ec0a35bd67	google_ads	12255	1044	76	866.00	1511.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
6492a183-8744-4569-8605-9d02899ab0f1	8efeb629-5221-4536-bc85-d262c60fa72e	google_ads	22268	890	26	571.00	2360.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
c98c9354-3716-404b-9939-87a7becdfabe	cc7cfe45-258e-4e16-8ae5-04ce91f8080f	google_ads	22566	958	97	260.00	1787.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
1c06e846-67d8-4087-9070-c332cd8b364f	d6c9deb7-6b31-4bb6-997a-48c150e144f5	google_ads	19924	990	23	761.00	2797.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
9553ed81-6dd1-4fa5-a90f-2f6f77a0f3ae	24e9c590-f75a-451e-ada6-b626f4bec767	google_ads	11277	960	36	428.00	2342.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
fc565b14-fafb-4e84-ba9d-1a0896c6f91e	9a71a652-a4d7-4348-a84a-78e396e7128f	google_ads	10693	854	33	440.00	2182.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
0420e733-25fc-473c-9907-1eb27c7077af	0a0a2d7f-d85b-4f63-b36b-2eb52215a659	google_ads	14686	1062	88	707.00	3329.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
aaf68241-21ea-4586-ab58-9ccff164252d	3a7b4e61-48c0-49ee-8f73-cb3e621522b3	google_ads	22850	671	62	457.00	1627.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
6e5dcce5-a1ca-4a45-85bc-ac453c16e0f9	47e33042-6308-41e9-a943-804820fdedf0	google_ads	15945	719	37	300.00	970.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
9774d08d-53da-4a42-98d5-734254e6d7f2	c6d46198-4506-48db-9ea7-80f000572454	google_ads	8328	1036	35	871.00	1994.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
89e55864-f49f-4526-ac7a-49e7e437a8b0	78444104-f7b7-4bcc-8255-fe3d92093669	google_ads	13215	514	40	818.00	995.00	0.00	0.00	0.00	2025-12-08 03:47:48.166485
92cb1a82-dfae-469e-ab12-0b622a6339e4	a79b4dae-9586-4e35-8d31-baf46c63fa35	tiktok	29198	1173	73	722.00	2644.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
5ec491b8-3e48-48d3-b571-c66d78b89fcc	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	tiktok	28673	1084	61	552.00	2763.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
70ee8553-8d31-4727-b3eb-07349c8ced57	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	tiktok	20103	542	55	661.00	1025.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
ca96fffe-c997-488e-9b7e-df07b69dc1b4	638a4cfa-742e-4548-9927-66fc4119d620	tiktok	24621	459	31	416.00	2320.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
0840a61c-dfb4-456e-8d95-0a8f663a0f39	ea7e3bb0-d793-4254-9c98-819931338c6a	tiktok	19540	922	80	657.00	1133.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
7a7c8993-d049-4928-abe8-09ddb56f19e8	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	tiktok	26450	1099	47	232.00	1203.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
32c44459-53f6-47ba-92fa-01770d1c60f1	eee3eb1e-4c36-4155-8350-93ec0a35bd67	tiktok	23828	562	63	344.00	1584.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
2f40509b-0a27-4cd1-a970-1f9c78296bc8	8efeb629-5221-4536-bc85-d262c60fa72e	tiktok	22802	798	120	158.00	1390.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
187e7556-8c92-4a89-88f9-44f830481f5b	cc7cfe45-258e-4e16-8ae5-04ce91f8080f	tiktok	11320	1166	100	298.00	2750.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
de722cb1-9006-49ae-a1f9-838d270ecb4a	d6c9deb7-6b31-4bb6-997a-48c150e144f5	tiktok	16944	804	66	494.00	1548.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
6b3262a9-8adc-4a91-a5f3-ed14d3591b8d	9a71a652-a4d7-4348-a84a-78e396e7128f	tiktok	29466	560	109	672.00	2799.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
961f1618-0dc0-446f-82de-338eb521a1b8	0a0a2d7f-d85b-4f63-b36b-2eb52215a659	tiktok	18336	690	100	340.00	3073.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
74f069e5-c8b7-4ff5-ae81-2b1458b90046	47e33042-6308-41e9-a943-804820fdedf0	tiktok	12091	1384	53	609.00	2449.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
0abbb764-25ab-44ca-b458-adeab03f86e3	78444104-f7b7-4bcc-8255-fe3d92093669	tiktok	16735	1113	107	598.00	1898.00	0.00	0.00	0.00	2025-12-08 03:47:48.188473
af160717-bdaf-47fe-b92b-3b8c3147e7ed	a79b4dae-9586-4e35-8d31-baf46c63fa35	whatsapp	4213	100	43	120.00	1224.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
dee65334-fcb8-4be8-9773-c03325456a55	935548b9-1af1-4e6a-b3d8-686a71bd4fd3	whatsapp	2802	135	38	336.00	1312.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
6593042b-bf86-40e5-b20d-7b018367b9cb	fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	whatsapp	4920	217	39	157.00	547.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
e19140a2-3ec1-446c-8840-8dd115583e02	93b70108-df67-4013-b2ba-6f50aaad87c6	whatsapp	3400	150	43	343.00	688.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
c2dfac2c-3f6d-4017-8763-b8c34db6c68f	638a4cfa-742e-4548-9927-66fc4119d620	whatsapp	2054	312	49	317.00	1408.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
eec121a3-cfd1-4b38-a297-342655aea46d	ea7e3bb0-d793-4254-9c98-819931338c6a	whatsapp	6227	213	48	287.00	1771.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
29eea9a3-70b0-4dfb-a419-a8bf298981bc	a59db332-fede-4795-a1da-ee9bc397da9f	whatsapp	3084	134	28	218.00	1500.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
8e66d6c4-5c1d-4116-b526-2d01b1d7a46d	a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	whatsapp	3788	272	10	62.00	539.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
44b7a9b9-52f4-47a0-83f7-9950f93bf822	5e311451-4c8c-4e35-b30c-55a2102a99c8	whatsapp	6925	313	41	116.00	1031.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
3b1463b2-0e6e-483c-bb6f-2050771de91c	eee3eb1e-4c36-4155-8350-93ec0a35bd67	whatsapp	5755	321	46	117.00	382.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
b189debd-097e-4c6e-8451-af323b7e0c4b	8efeb629-5221-4536-bc85-d262c60fa72e	whatsapp	2994	247	43	105.00	729.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
67eb15d3-a916-47bc-ad61-f239dacf3bcf	cc7cfe45-258e-4e16-8ae5-04ce91f8080f	whatsapp	3331	350	24	61.00	1020.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
febda55f-2065-4729-9983-1d3a616ed661	d6c9deb7-6b31-4bb6-997a-48c150e144f5	whatsapp	2227	383	24	62.00	1225.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
4dc9952c-780b-4020-a408-f0a6ea511be6	24e9c590-f75a-451e-ada6-b626f4bec767	whatsapp	5103	304	18	248.00	1088.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
e5292c5a-cadd-477d-ae47-cdb93cdccb5b	9a71a652-a4d7-4348-a84a-78e396e7128f	whatsapp	2202	110	48	142.00	1143.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
be638717-c282-4185-85ce-cd121f9069b4	0a0a2d7f-d85b-4f63-b36b-2eb52215a659	whatsapp	6630	135	27	126.00	1463.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
28fc3493-655f-48c5-bc5b-ebb2fdd3237f	3a7b4e61-48c0-49ee-8f73-cb3e621522b3	whatsapp	5453	275	23	309.00	1235.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
1c46b1b6-8c48-4686-8403-1bdddd073469	47e33042-6308-41e9-a943-804820fdedf0	whatsapp	6359	192	25	64.00	1419.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
d8e7bf6f-cfa2-47f9-ad46-2a04eb0e3206	c6d46198-4506-48db-9ea7-80f000572454	whatsapp	4416	127	49	53.00	1471.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
f41e4def-65bd-4de4-9cca-59a6c79d0ce2	78444104-f7b7-4bcc-8255-fe3d92093669	whatsapp	5410	210	47	150.00	926.00	0.00	0.00	0.00	2025-12-08 03:47:48.196653
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.campaigns (id, user_id, titulo, descricao, publico, orcamento, imagem_url, texto, status, plataformas, criado_em, atualizado_em, iniciado_em, finalizado_em) FROM stdin;
a79b4dae-9586-4e35-8d31-baf46c63fa35	550e8400-e29b-41d4-a716-446655440000	Black Friday 2025	Promoção de Black Friday com desconto de 50%	{"cidades": ["São Paulo", "Rio de Janeiro"], "idade_max": 65, "idade_min": 18, "interesses": ["compras", "promoções"]}	1000.00	\N	Aproveite a Black Friday com 50% de desconto em todos os produtos!	ativo	{"tiktok": true, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
935548b9-1af1-4e6a-b3d8-686a71bd4fd3	550e8400-e29b-41d4-a716-446655440000	Lançamento Produto X	Lançamento do novo produto X com tecnologia inovadora	{"cidades": ["São Paulo", "Belo Horizonte", "Brasília"], "idade_max": 45, "idade_min": 25, "interesses": ["tecnologia", "inovação"]}	1500.00	\N	Conheça o novo Produto X - Tecnologia que muda tudo!	ativo	{"tiktok": false, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
fbcb3b25-7b82-4526-b766-bc9e3b22bcc8	550e8400-e29b-41d4-a716-446655440000	Webinar Marketing Digital	Webinar gratuito sobre estratégias de marketing digital	{"cidades": ["São Paulo", "Rio de Janeiro", "Curitiba"], "idade_max": 50, "idade_min": 20, "interesses": ["marketing", "negócios"]}	800.00	\N	Participe do nosso webinar gratuito sobre Marketing Digital!	ativo	{"tiktok": true, "whatsapp": false, "instagram": true, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
93b70108-df67-4013-b2ba-6f50aaad87c6	550e8400-e29b-41d4-a716-446655440000	Desconto Especial Clientes	Desconto exclusivo para clientes VIP	{"cidades": ["São Paulo"], "idade_max": 60, "idade_min": 30, "interesses": ["luxo", "exclusividade"]}	2000.00	\N	Desconto exclusivo de 30% para nossos clientes VIP!	pausada	{"tiktok": false, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
638a4cfa-742e-4548-9927-66fc4119d620	550e8400-e29b-41d4-a716-446655440000	Curso Python Avançado	Curso online de Python para iniciantes	{"cidades": ["São Paulo", "Rio de Janeiro", "Brasília", "Recife"], "idade_max": 40, "idade_min": 18, "interesses": ["programação", "educação"]}	1200.00	\N	Aprenda Python do zero com nosso curso completo!	ativo	{"tiktok": true, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
ea7e3bb0-d793-4254-9c98-819931338c6a	550e8400-e29b-41d4-a716-446655440000	Fitness Challenge 30 Dias	Desafio de fitness de 30 dias com prêmios	{"cidades": ["São Paulo", "Rio de Janeiro", "Belo Horizonte"], "idade_max": 50, "idade_min": 18, "interesses": ["fitness", "saúde"]}	1500.00	\N	Participe do Fitness Challenge 30 Dias e ganhe prêmios!	ativo	{"tiktok": true, "whatsapp": true, "instagram": true, "google_ads": false}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
a59db332-fede-4795-a1da-ee9bc397da9f	550e8400-e29b-41d4-a716-446655440000	Pacote Viagem Caribe	Pacote de viagem para o Caribe com tudo incluído	{"cidades": ["São Paulo", "Rio de Janeiro"], "idade_max": 65, "idade_min": 25, "interesses": ["viagem", "turismo"]}	2500.00	\N	Viaje para o Caribe com tudo incluído - Aproveite!	ativo	{"tiktok": false, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
a9a1f7e1-0e2a-497c-af7c-3945bf0cc736	550e8400-e29b-41d4-a716-446655440000	Download App Mobile	Campanha para download do novo app mobile	{"cidades": ["São Paulo", "Rio de Janeiro", "Brasília", "Curitiba"], "idade_max": 45, "idade_min": 18, "interesses": ["tecnologia", "apps"]}	1000.00	\N	Baixe nosso app e ganhe 100 pontos de bônus!	ativo	{"tiktok": true, "whatsapp": false, "instagram": true, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
5e311451-4c8c-4e35-b30c-55a2102a99c8	550e8400-e29b-41d4-a716-446655440000	Consultoria Empresarial	Serviço de consultoria para empresas	{"cidades": ["São Paulo"], "idade_max": 65, "idade_min": 35, "interesses": ["negócios", "consultoria"]}	3000.00	\N	Transforme seu negócio com nossa consultoria especializada!	rascunho	{"tiktok": false, "whatsapp": true, "instagram": false, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
eee3eb1e-4c36-4155-8350-93ec0a35bd67	550e8400-e29b-41d4-a716-446655440000	Promoção Natal 2025	Promoção especial de Natal com descontos incríveis	{"cidades": ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília"], "idade_max": 60, "idade_min": 18, "interesses": ["compras", "natal"]}	2000.00	\N	Natal chegou! Descontos de até 70% em tudo!	ativo	{"tiktok": true, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	2025-12-07 20:47:59.024875	\N
8efeb629-5221-4536-bc85-d262c60fa72e	550e8400-e29b-41d4-a716-446655440000	Black Friday 2025	Promoção de Black Friday com desconto de 50%	{"cidades": ["São Paulo", "Rio de Janeiro"], "idade_max": 65, "idade_min": 18, "interesses": ["compras", "promoções"]}	1000.00	\N	Aproveite a Black Friday com 50% de desconto em todos os produtos!	ativo	{"tiktok": true, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
cc7cfe45-258e-4e16-8ae5-04ce91f8080f	550e8400-e29b-41d4-a716-446655440000	Lançamento Produto X	Lançamento do novo produto X com tecnologia inovadora	{"cidades": ["São Paulo", "Belo Horizonte", "Brasília"], "idade_max": 45, "idade_min": 25, "interesses": ["tecnologia", "inovação"]}	1500.00	\N	Conheça o novo Produto X - Tecnologia que muda tudo!	ativo	{"tiktok": false, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
d6c9deb7-6b31-4bb6-997a-48c150e144f5	550e8400-e29b-41d4-a716-446655440000	Webinar Marketing Digital	Webinar gratuito sobre estratégias de marketing digital	{"cidades": ["São Paulo", "Rio de Janeiro", "Curitiba"], "idade_max": 50, "idade_min": 20, "interesses": ["marketing", "negócios"]}	800.00	\N	Participe do nosso webinar gratuito sobre Marketing Digital!	ativo	{"tiktok": true, "whatsapp": false, "instagram": true, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
24e9c590-f75a-451e-ada6-b626f4bec767	550e8400-e29b-41d4-a716-446655440000	Desconto Especial Clientes	Desconto exclusivo para clientes VIP	{"cidades": ["São Paulo"], "idade_max": 60, "idade_min": 30, "interesses": ["luxo", "exclusividade"]}	2000.00	\N	Desconto exclusivo de 30% para nossos clientes VIP!	pausada	{"tiktok": false, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
9a71a652-a4d7-4348-a84a-78e396e7128f	550e8400-e29b-41d4-a716-446655440000	Curso Python Avançado	Curso online de Python para iniciantes	{"cidades": ["São Paulo", "Rio de Janeiro", "Brasília", "Recife"], "idade_max": 40, "idade_min": 18, "interesses": ["programação", "educação"]}	1200.00	\N	Aprenda Python do zero com nosso curso completo!	ativo	{"tiktok": true, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
0a0a2d7f-d85b-4f63-b36b-2eb52215a659	550e8400-e29b-41d4-a716-446655440000	Fitness Challenge 30 Dias	Desafio de fitness de 30 dias com prêmios	{"cidades": ["São Paulo", "Rio de Janeiro", "Belo Horizonte"], "idade_max": 50, "idade_min": 18, "interesses": ["fitness", "saúde"]}	1500.00	\N	Participe do Fitness Challenge 30 Dias e ganhe prêmios!	ativo	{"tiktok": true, "whatsapp": true, "instagram": true, "google_ads": false}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
3a7b4e61-48c0-49ee-8f73-cb3e621522b3	550e8400-e29b-41d4-a716-446655440000	Pacote Viagem Caribe	Pacote de viagem para o Caribe com tudo incluído	{"cidades": ["São Paulo", "Rio de Janeiro"], "idade_max": 65, "idade_min": 25, "interesses": ["viagem", "turismo"]}	2500.00	\N	Viaje para o Caribe com tudo incluído - Aproveite!	ativo	{"tiktok": false, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
47e33042-6308-41e9-a943-804820fdedf0	550e8400-e29b-41d4-a716-446655440000	Download App Mobile	Campanha para download do novo app mobile	{"cidades": ["São Paulo", "Rio de Janeiro", "Brasília", "Curitiba"], "idade_max": 45, "idade_min": 18, "interesses": ["tecnologia", "apps"]}	1000.00	\N	Baixe nosso app e ganhe 100 pontos de bônus!	ativo	{"tiktok": true, "whatsapp": false, "instagram": true, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
c6d46198-4506-48db-9ea7-80f000572454	550e8400-e29b-41d4-a716-446655440000	Consultoria Empresarial	Serviço de consultoria para empresas	{"cidades": ["São Paulo"], "idade_max": 65, "idade_min": 35, "interesses": ["negócios", "consultoria"]}	3000.00	\N	Transforme seu negócio com nossa consultoria especializada!	rascunho	{"tiktok": false, "whatsapp": true, "instagram": false, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
78444104-f7b7-4bcc-8255-fe3d92093669	550e8400-e29b-41d4-a716-446655440000	Promoção Natal 2025	Promoção especial de Natal com descontos incríveis	{"cidades": ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília"], "idade_max": 60, "idade_min": 18, "interesses": ["compras", "natal"]}	2000.00	\N	Natal chegou! Descontos de até 70% em tudo!	ativo	{"tiktok": true, "whatsapp": true, "instagram": true, "google_ads": true}	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	2025-12-08 03:47:47.871901	\N
\.


--
-- Data for Name: demo_mode_sessions; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.demo_mode_sessions (id, user_id, status, campanhas_demo, vendas_demo, receita_demo, criado_em, atualizado_em) FROM stdin;
\.


--
-- Data for Name: jwt_sessions; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.jwt_sessions (id, user_id, token_hash, criado_em, expira_em, revogado) FROM stdin;
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.logs (id, user_id, acao, detalhes, ip_address, criado_em) FROM stdin;
\.


--
-- Data for Name: metrics; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.metrics (id, campaign_id, data, cliques, impressoes, conversoes, custo, receita, criado_em) FROM stdin;
\.


--
-- Data for Name: offline_cache; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.offline_cache (id, user_id, tipo_dados, dados, sincronizado, criado_em, sincronizado_em) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.users (id, email, senha, nome, google_ads_key, instagram_token, whatsapp_token, chaves_api, criado_em, atualizado_em) FROM stdin;
550e8400-e29b-41d4-a716-446655440000	admin@gaia.local	senha123	Admin Demo	\N	\N	\N	{"whatsapp": null, "instagram": null, "google_ads": null}	2025-12-07 20:47:55.989003	2025-12-07 20:47:55.989003
da040b85-b1e3-4af5-b5d9-08990a3fef85	davidcruner@gmail.com	$2a$10$9BwJPhI5lCUBjuvHrFOY1OGpNfzk.BY/wEGV19eVctZ8/xMaqQ.s.	Usuário	TEST_GOOGLE_ADS_KEY_12345			{"whatsapp": null, "instagram": null, "google_ads": null}	2025-12-07 20:54:10.627145	2025-12-07 21:46:20.901378
\.


--
-- Data for Name: voice_history; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.voice_history (id, user_id, comando, transcricao, resposta, audio_url, campanha_id, "timestamp") FROM stdin;
\.


--
-- Data for Name: whatsapp_messages; Type: TABLE DATA; Schema: public; Owner: gaia_user
--

COPY public.whatsapp_messages (id, user_id, campaign_id, numero_cliente, tipo, conteudo, resposta, "timestamp") FROM stdin;
\.


--
-- Name: access_logs access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_pkey PRIMARY KEY (id);


--
-- Name: backup_config backup_config_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.backup_config
    ADD CONSTRAINT backup_config_pkey PRIMARY KEY (id);


--
-- Name: backup_config backup_config_user_id_key; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.backup_config
    ADD CONSTRAINT backup_config_user_id_key UNIQUE (user_id);


--
-- Name: backup_history backup_history_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.backup_history
    ADD CONSTRAINT backup_history_pkey PRIMARY KEY (id);


--
-- Name: campaign_logs campaign_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.campaign_logs
    ADD CONSTRAINT campaign_logs_pkey PRIMARY KEY (id);


--
-- Name: campaign_metrics campaign_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.campaign_metrics
    ADD CONSTRAINT campaign_metrics_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: demo_mode_sessions demo_mode_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.demo_mode_sessions
    ADD CONSTRAINT demo_mode_sessions_pkey PRIMARY KEY (id);


--
-- Name: jwt_sessions jwt_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.jwt_sessions
    ADD CONSTRAINT jwt_sessions_pkey PRIMARY KEY (id);


--
-- Name: jwt_sessions jwt_sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.jwt_sessions
    ADD CONSTRAINT jwt_sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: metrics metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_pkey PRIMARY KEY (id);


--
-- Name: offline_cache offline_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.offline_cache
    ADD CONSTRAINT offline_cache_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: voice_history voice_history_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.voice_history
    ADD CONSTRAINT voice_history_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_messages whatsapp_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id);


--
-- Name: idx_access_logs_timestamp; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_access_logs_timestamp ON public.access_logs USING btree ("timestamp");


--
-- Name: idx_access_logs_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_access_logs_user_id ON public.access_logs USING btree (user_id);


--
-- Name: idx_backup_config_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_backup_config_user_id ON public.backup_config USING btree (user_id);


--
-- Name: idx_backup_history_status; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_backup_history_status ON public.backup_history USING btree (status);


--
-- Name: idx_backup_history_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_backup_history_user_id ON public.backup_history USING btree (user_id);


--
-- Name: idx_campaign_logs_campaign_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_campaign_logs_campaign_id ON public.campaign_logs USING btree (campaign_id);


--
-- Name: idx_campaign_metrics_campaign_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_campaign_metrics_campaign_id ON public.campaign_metrics USING btree (campaign_id);


--
-- Name: idx_campaigns_status; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_campaigns_status ON public.campaigns USING btree (status);


--
-- Name: idx_campaigns_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_campaigns_user_id ON public.campaigns USING btree (user_id);


--
-- Name: idx_demo_sessions_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_demo_sessions_user_id ON public.demo_mode_sessions USING btree (user_id);


--
-- Name: idx_jwt_sessions_token_hash; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_jwt_sessions_token_hash ON public.jwt_sessions USING btree (token_hash);


--
-- Name: idx_jwt_sessions_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_jwt_sessions_user_id ON public.jwt_sessions USING btree (user_id);


--
-- Name: idx_offline_cache_sincronizado; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_offline_cache_sincronizado ON public.offline_cache USING btree (sincronizado);


--
-- Name: idx_offline_cache_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_offline_cache_user_id ON public.offline_cache USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_voice_history_timestamp; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_voice_history_timestamp ON public.voice_history USING btree ("timestamp");


--
-- Name: idx_voice_history_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_voice_history_user_id ON public.voice_history USING btree (user_id);


--
-- Name: idx_whatsapp_messages_campaign_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_whatsapp_messages_campaign_id ON public.whatsapp_messages USING btree (campaign_id);


--
-- Name: idx_whatsapp_messages_user_id; Type: INDEX; Schema: public; Owner: gaia_user
--

CREATE INDEX idx_whatsapp_messages_user_id ON public.whatsapp_messages USING btree (user_id);


--
-- Name: users trigger_update_users_atualizado_em; Type: TRIGGER; Schema: public; Owner: gaia_user
--

CREATE TRIGGER trigger_update_users_atualizado_em BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();


--
-- Name: backup_config update_backup_config_updated_at; Type: TRIGGER; Schema: public; Owner: gaia_user
--

CREATE TRIGGER update_backup_config_updated_at BEFORE UPDATE ON public.backup_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: campaigns update_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: gaia_user
--

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: demo_mode_sessions update_demo_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: gaia_user
--

CREATE TRIGGER update_demo_sessions_updated_at BEFORE UPDATE ON public.demo_mode_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: access_logs access_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.access_logs
    ADD CONSTRAINT access_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: backup_config backup_config_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.backup_config
    ADD CONSTRAINT backup_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: backup_history backup_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.backup_history
    ADD CONSTRAINT backup_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: campaign_logs campaign_logs_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.campaign_logs
    ADD CONSTRAINT campaign_logs_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_metrics campaign_metrics_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.campaign_metrics
    ADD CONSTRAINT campaign_metrics_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: demo_mode_sessions demo_mode_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.demo_mode_sessions
    ADD CONSTRAINT demo_mode_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: jwt_sessions jwt_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.jwt_sessions
    ADD CONSTRAINT jwt_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: logs logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: metrics metrics_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: offline_cache offline_cache_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.offline_cache
    ADD CONSTRAINT offline_cache_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: voice_history voice_history_campanha_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.voice_history
    ADD CONSTRAINT voice_history_campanha_id_fkey FOREIGN KEY (campanha_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: voice_history voice_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.voice_history
    ADD CONSTRAINT voice_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: whatsapp_messages whatsapp_messages_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: whatsapp_messages whatsapp_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gaia_user
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Sl89czTG9OlzhcyZhKHfabcxyV9mVTZF3Y7igSCTYP56JhN9KzxDxHm7Xi30n1C

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict rUeHZVztFNKl8DBhPKpIimC212hlQOjTMubAelumxCDWp1leH1DWOBZcxmAWq90

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

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
-- PostgreSQL database dump complete
--

\unrestrict rUeHZVztFNKl8DBhPKpIimC212hlQOjTMubAelumxCDWp1leH1DWOBZcxmAWq90

--
-- PostgreSQL database cluster dump complete
--

