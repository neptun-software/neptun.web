--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.6

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: ai_model_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ai_model_enum AS ENUM (
    'google/gemma-2-27b-it',
    'qwen/Qwen2.5-72B-Instruct',
    'qwen/Qwen2.5-Coder-32B-Instruct',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'mistralai/Mistral-Nemo-Instruct-2407',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'microsoft/Phi-3-mini-4k-instruct',
    'cloudflare/llama-3.3-70b-instruct-fp8-fast',
    'openrouter/gemini-2.0-pro-exp-02-05',
    'openrouter/deepseek-chat',
    'openrouter/llama-3.3-70b-instruct',
    'ollama/rwkv-6-world'
);


--
-- Name: chat_conversation_message_actor_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.chat_conversation_message_actor_enum AS ENUM (
    'user',
    'assistant'
);


--
-- Name: context_file_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.context_file_category AS ENUM (
    'bundler',
    'build_tool',
    'server',
    'package_manager',
    'runtime',
    'documentation',
    'test_tool',
    'unknown'
);


--
-- Name: context_file_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.context_file_type AS ENUM (
    'markdown',
    'pdf',
    'text'
);


--
-- Name: import_source_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.import_source_type AS ENUM (
    'local_folder',
    'github_repository_installation',
    'public_github_repository_url'
);


--
-- Name: oauth_provider_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.oauth_provider_enum AS ENUM (
    'github',
    'google'
);


--
-- Name: programming_language; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.programming_language AS ENUM (
    'typescript',
    'javascript',
    'php',
    'go',
    'python',
    'java',
    'kotlin',
    'ruby',
    'elixir'
);


--
-- Name: project_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_type AS ENUM (
    'web-site',
    'web-service',
    'web-app'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversation (
    id integer NOT NULL,
    name text NOT NULL,
    model public.ai_model_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL
);


--
-- Name: chat_conversation_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversation_file (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL,
    chat_conversation_id integer NOT NULL,
    chat_conversation_message_id integer NOT NULL,
    neptun_user_file_id integer NOT NULL
);


--
-- Name: chat_conversation_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_conversation_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_conversation_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_conversation_file_id_seq OWNED BY public.chat_conversation_file.id;


--
-- Name: chat_conversation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_conversation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_conversation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_conversation_id_seq OWNED BY public.chat_conversation.id;


--
-- Name: chat_conversation_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversation_message (
    id integer NOT NULL,
    message text NOT NULL,
    actor public.chat_conversation_message_actor_enum DEFAULT 'user'::public.chat_conversation_message_actor_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL,
    chat_conversation_id integer NOT NULL
);


--
-- Name: chat_conversation_message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_conversation_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_conversation_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_conversation_message_id_seq OWNED BY public.chat_conversation_message.id;


--
-- Name: chat_conversation_share; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversation_share (
    id integer NOT NULL,
    is_shared boolean DEFAULT true NOT NULL,
    share_id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_protected boolean DEFAULT false NOT NULL,
    hashed_password text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    chat_conversation_id integer NOT NULL
);


--
-- Name: chat_conversation_share_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_conversation_share_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_conversation_share_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_conversation_share_id_seq OWNED BY public.chat_conversation_share.id;


--
-- Name: chat_conversation_share_whitelist_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversation_share_whitelist_entry (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    whitelisted_neptun_user_id integer NOT NULL,
    chat_conversation_share_id integer NOT NULL
);


--
-- Name: chat_conversation_share_whitelist_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_conversation_share_whitelist_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_conversation_share_whitelist_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_conversation_share_whitelist_entry_id_seq OWNED BY public.chat_conversation_share_whitelist_entry.id;


--
-- Name: github_app_installation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.github_app_installation (
    id integer NOT NULL,
    github_account_type text NOT NULL,
    github_account_avatar_url text NOT NULL,
    github_account_id integer NOT NULL,
    github_account_name text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL,
    github_installation_id integer NOT NULL
);


--
-- Name: chat_github_app_installation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_github_app_installation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_github_app_installation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_github_app_installation_id_seq OWNED BY public.github_app_installation.id;


--
-- Name: github_app_installation_repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.github_app_installation_repository (
    id integer NOT NULL,
    github_repository_id integer NOT NULL,
    github_repository_name text NOT NULL,
    github_repository_description text,
    github_repository_size integer,
    github_repository_language text,
    github_repository_license text,
    github_repository_url text NOT NULL,
    github_repository_website_url text,
    github_repository_default_branch text,
    github_repository_is_private boolean NOT NULL,
    github_repository_is_fork boolean,
    github_repository_is_template boolean,
    github_repository_is_archived boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    github_app_installation_id integer NOT NULL
);


--
-- Name: chat_github_app_installation_repository_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_github_app_installation_repository_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_github_app_installation_repository_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_github_app_installation_repository_id_seq OWNED BY public.github_app_installation_repository.id;


--
-- Name: neptun_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_user (
    id integer NOT NULL,
    primary_email text NOT NULL,
    hashed_password text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: chat_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_user_id_seq OWNED BY public.neptun_user.id;


--
-- Name: neptun_user_oauth_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_user_oauth_account (
    id integer NOT NULL,
    provider public.oauth_provider_enum NOT NULL,
    oauth_user_id text NOT NULL,
    oauth_email text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL
);


--
-- Name: chat_user_oauth_account_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_user_oauth_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_user_oauth_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_user_oauth_account_id_seq OWNED BY public.neptun_user_oauth_account.id;


--
-- Name: neptun_context_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_context_file (
    id integer NOT NULL,
    title text NOT NULL,
    original_path text NOT NULL,
    content text NOT NULL,
    file_type public.context_file_type NOT NULL,
    category public.context_file_category,
    file_size integer,
    pdf_url text,
    language text DEFAULT 'text'::text NOT NULL,
    metadata jsonb,
    parent_path text,
    depth integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL,
    import_id integer NOT NULL,
    project_id integer
);


--
-- Name: neptun_context_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.neptun_context_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: neptun_context_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.neptun_context_file_id_seq OWNED BY public.neptun_context_file.id;


--
-- Name: neptun_context_import; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_context_import (
    id integer NOT NULL,
    source_type public.import_source_type NOT NULL,
    source_path text NOT NULL,
    source_ref text,
    import_status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    file_tree jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL,
    project_id integer
);


--
-- Name: neptun_context_import_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.neptun_context_import_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: neptun_context_import_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.neptun_context_import_id_seq OWNED BY public.neptun_context_import.id;


--
-- Name: neptun_user_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_user_file (
    id integer NOT NULL,
    title text,
    text text NOT NULL,
    language text DEFAULT 'text'::text NOT NULL,
    file_extension text DEFAULT 'txt'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL
);


--
-- Name: neptun_user_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.neptun_user_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: neptun_user_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.neptun_user_file_id_seq OWNED BY public.neptun_user_file.id;


--
-- Name: neptun_user_project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_user_project (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type public.project_type NOT NULL,
    main_language public.programming_language NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL,
    prompt_context jsonb
);


--
-- Name: neptun_user_project_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.neptun_user_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: neptun_user_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.neptun_user_project_id_seq OWNED BY public.neptun_user_project.id;


--
-- Name: neptun_user_template; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_user_template (
    id integer NOT NULL,
    description text,
    file_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL,
    template_collection_id integer,
    user_file_id integer
);


--
-- Name: neptun_user_template_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_user_template_collection (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_shared boolean DEFAULT false NOT NULL,
    share_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL
);


--
-- Name: neptun_user_template_collection_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.neptun_user_template_collection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: neptun_user_template_collection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.neptun_user_template_collection_id_seq OWNED BY public.neptun_user_template_collection.id;


--
-- Name: neptun_user_template_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.neptun_user_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: neptun_user_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.neptun_user_template_id_seq OWNED BY public.neptun_user_template.id;


--
-- Name: neptun_user_webauthn_credential; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_user_webauthn_credential (
    id text NOT NULL,
    public_key text NOT NULL,
    counter integer DEFAULT 0 NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    transports json NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL
);


--
-- Name: neptun_webauthn_challenge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neptun_webauthn_challenge (
    id integer NOT NULL,
    attempt_id text NOT NULL,
    challenge text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL
);


--
-- Name: neptun_webauthn_challenge_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.neptun_webauthn_challenge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: neptun_webauthn_challenge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.neptun_webauthn_challenge_id_seq OWNED BY public.neptun_webauthn_challenge.id;


--
-- Name: project_chat_conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_chat_conversation (
    project_id integer NOT NULL,
    chat_conversation_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: project_github_installation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_github_installation (
    project_id integer NOT NULL,
    github_installation_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: project_template_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_template_collection (
    project_id integer NOT NULL,
    template_collection_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: project_user_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_user_file (
    project_id integer NOT NULL,
    user_file_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: chat_conversation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_id_seq'::regclass);


--
-- Name: chat_conversation_file id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_file ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_file_id_seq'::regclass);


--
-- Name: chat_conversation_message id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_message ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_message_id_seq'::regclass);


--
-- Name: chat_conversation_share id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_share_id_seq'::regclass);


--
-- Name: chat_conversation_share_whitelist_entry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share_whitelist_entry ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_share_whitelist_entry_id_seq'::regclass);


--
-- Name: github_app_installation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.github_app_installation ALTER COLUMN id SET DEFAULT nextval('public.chat_github_app_installation_id_seq'::regclass);


--
-- Name: github_app_installation_repository id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.github_app_installation_repository ALTER COLUMN id SET DEFAULT nextval('public.chat_github_app_installation_repository_id_seq'::regclass);


--
-- Name: neptun_context_file id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_file ALTER COLUMN id SET DEFAULT nextval('public.neptun_context_file_id_seq'::regclass);


--
-- Name: neptun_context_import id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_import ALTER COLUMN id SET DEFAULT nextval('public.neptun_context_import_id_seq'::regclass);


--
-- Name: neptun_user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user ALTER COLUMN id SET DEFAULT nextval('public.chat_user_id_seq'::regclass);


--
-- Name: neptun_user_file id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_file ALTER COLUMN id SET DEFAULT nextval('public.neptun_user_file_id_seq'::regclass);


--
-- Name: neptun_user_oauth_account id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_oauth_account ALTER COLUMN id SET DEFAULT nextval('public.chat_user_oauth_account_id_seq'::regclass);


--
-- Name: neptun_user_project id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_project ALTER COLUMN id SET DEFAULT nextval('public.neptun_user_project_id_seq'::regclass);


--
-- Name: neptun_user_template id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template ALTER COLUMN id SET DEFAULT nextval('public.neptun_user_template_id_seq'::regclass);


--
-- Name: neptun_user_template_collection id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template_collection ALTER COLUMN id SET DEFAULT nextval('public.neptun_user_template_collection_id_seq'::regclass);


--
-- Name: neptun_webauthn_challenge id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_webauthn_challenge ALTER COLUMN id SET DEFAULT nextval('public.neptun_webauthn_challenge_id_seq'::regclass);


--
-- Name: chat_conversation_file chat_conversation_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_message chat_conversation_message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_message
    ADD CONSTRAINT chat_conversation_message_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation chat_conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation
    ADD CONSTRAINT chat_conversation_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_share chat_conversation_share_chat_conversation_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share
    ADD CONSTRAINT chat_conversation_share_chat_conversation_id_unique UNIQUE (chat_conversation_id);


--
-- Name: chat_conversation_share chat_conversation_share_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share
    ADD CONSTRAINT chat_conversation_share_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_share chat_conversation_share_share_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share
    ADD CONSTRAINT chat_conversation_share_share_id_unique UNIQUE (share_id);


--
-- Name: chat_conversation_share_whitelist_entry chat_conversation_share_whitelist_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share_whitelist_entry
    ADD CONSTRAINT chat_conversation_share_whitelist_entry_pkey PRIMARY KEY (id);


--
-- Name: github_app_installation chat_github_app_installation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.github_app_installation
    ADD CONSTRAINT chat_github_app_installation_pkey PRIMARY KEY (id);


--
-- Name: github_app_installation_repository chat_github_app_installation_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.github_app_installation_repository
    ADD CONSTRAINT chat_github_app_installation_repository_pkey PRIMARY KEY (id);


--
-- Name: neptun_user_oauth_account chat_user_oauth_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_oauth_account
    ADD CONSTRAINT chat_user_oauth_account_pkey PRIMARY KEY (id);


--
-- Name: neptun_user chat_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user
    ADD CONSTRAINT chat_user_pkey PRIMARY KEY (id);


--
-- Name: neptun_context_file neptun_context_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_file
    ADD CONSTRAINT neptun_context_file_pkey PRIMARY KEY (id);


--
-- Name: neptun_context_import neptun_context_import_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_import
    ADD CONSTRAINT neptun_context_import_pkey PRIMARY KEY (id);


--
-- Name: neptun_user_file neptun_user_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_file
    ADD CONSTRAINT neptun_user_file_pkey PRIMARY KEY (id);


--
-- Name: neptun_user neptun_user_primary_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user
    ADD CONSTRAINT neptun_user_primary_email_unique UNIQUE (primary_email);


--
-- Name: neptun_user_project neptun_user_project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_project
    ADD CONSTRAINT neptun_user_project_pkey PRIMARY KEY (id);


--
-- Name: neptun_user_template_collection neptun_user_template_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template_collection
    ADD CONSTRAINT neptun_user_template_collection_pkey PRIMARY KEY (id);


--
-- Name: neptun_user_template_collection neptun_user_template_collection_share_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template_collection
    ADD CONSTRAINT neptun_user_template_collection_share_id_unique UNIQUE (share_id);


--
-- Name: neptun_user_template neptun_user_template_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template
    ADD CONSTRAINT neptun_user_template_pkey PRIMARY KEY (id);


--
-- Name: neptun_user_webauthn_credential neptun_user_webauthn_credential_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_webauthn_credential
    ADD CONSTRAINT neptun_user_webauthn_credential_id_unique UNIQUE (id);


--
-- Name: neptun_webauthn_challenge neptun_webauthn_challenge_attempt_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_webauthn_challenge
    ADD CONSTRAINT neptun_webauthn_challenge_attempt_id_unique UNIQUE (attempt_id);


--
-- Name: neptun_webauthn_challenge neptun_webauthn_challenge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_webauthn_challenge
    ADD CONSTRAINT neptun_webauthn_challenge_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_file chat_conversation_file_chat_conversation_id_chat_conversation_i; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_chat_conversation_id_chat_conversation_i FOREIGN KEY (chat_conversation_id) REFERENCES public.chat_conversation(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_file chat_conversation_file_chat_conversation_message_id_chat_conver; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_chat_conversation_message_id_chat_conver FOREIGN KEY (chat_conversation_message_id) REFERENCES public.chat_conversation_message(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_file chat_conversation_file_neptun_user_file_id_neptun_user_file_id_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_neptun_user_file_id_neptun_user_file_id_ FOREIGN KEY (neptun_user_file_id) REFERENCES public.neptun_user_file(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_file chat_conversation_file_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_message chat_conversation_message_chat_conversation_id_chat_conversatio; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_message
    ADD CONSTRAINT chat_conversation_message_chat_conversation_id_chat_conversatio FOREIGN KEY (chat_conversation_id) REFERENCES public.chat_conversation(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_message chat_conversation_message_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_message
    ADD CONSTRAINT chat_conversation_message_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: chat_conversation chat_conversation_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation
    ADD CONSTRAINT chat_conversation_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_share chat_conversation_share_chat_conversation_id_chat_conversation_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share
    ADD CONSTRAINT chat_conversation_share_chat_conversation_id_chat_conversation_ FOREIGN KEY (chat_conversation_id) REFERENCES public.chat_conversation(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_share_whitelist_entry chat_conversation_share_whitelist_entry_chat_conversation_share; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share_whitelist_entry
    ADD CONSTRAINT chat_conversation_share_whitelist_entry_chat_conversation_share FOREIGN KEY (chat_conversation_share_id) REFERENCES public.chat_conversation_share(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_share_whitelist_entry chat_conversation_share_whitelist_entry_whitelisted_neptun_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversation_share_whitelist_entry
    ADD CONSTRAINT chat_conversation_share_whitelist_entry_whitelisted_neptun_user FOREIGN KEY (whitelisted_neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: github_app_installation github_app_installation_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.github_app_installation
    ADD CONSTRAINT github_app_installation_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: github_app_installation_repository github_app_installation_repository_github_app_installation_id_g; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.github_app_installation_repository
    ADD CONSTRAINT github_app_installation_repository_github_app_installation_id_g FOREIGN KEY (github_app_installation_id) REFERENCES public.github_app_installation(id) ON DELETE CASCADE;


--
-- Name: neptun_context_file neptun_context_file_import_id_neptun_context_import_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_file
    ADD CONSTRAINT neptun_context_file_import_id_neptun_context_import_id_fk FOREIGN KEY (import_id) REFERENCES public.neptun_context_import(id) ON DELETE CASCADE;


--
-- Name: neptun_context_file neptun_context_file_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_file
    ADD CONSTRAINT neptun_context_file_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_context_file neptun_context_file_project_id_neptun_user_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_file
    ADD CONSTRAINT neptun_context_file_project_id_neptun_user_project_id_fk FOREIGN KEY (project_id) REFERENCES public.neptun_user_project(id) ON DELETE CASCADE;


--
-- Name: neptun_context_import neptun_context_import_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_import
    ADD CONSTRAINT neptun_context_import_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_context_import neptun_context_import_project_id_neptun_user_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_context_import
    ADD CONSTRAINT neptun_context_import_project_id_neptun_user_project_id_fk FOREIGN KEY (project_id) REFERENCES public.neptun_user_project(id) ON DELETE CASCADE;


--
-- Name: neptun_user_file neptun_user_file_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_file
    ADD CONSTRAINT neptun_user_file_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_oauth_account neptun_user_oauth_account_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_oauth_account
    ADD CONSTRAINT neptun_user_oauth_account_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_project neptun_user_project_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_project
    ADD CONSTRAINT neptun_user_project_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_template_collection neptun_user_template_collection_neptun_user_id_neptun_user_id_f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template_collection
    ADD CONSTRAINT neptun_user_template_collection_neptun_user_id_neptun_user_id_f FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_template neptun_user_template_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template
    ADD CONSTRAINT neptun_user_template_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_template neptun_user_template_template_collection_id_neptun_user_templat; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template
    ADD CONSTRAINT neptun_user_template_template_collection_id_neptun_user_templat FOREIGN KEY (template_collection_id) REFERENCES public.neptun_user_template_collection(id) ON DELETE CASCADE;


--
-- Name: neptun_user_template neptun_user_template_user_file_id_neptun_user_file_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_template
    ADD CONSTRAINT neptun_user_template_user_file_id_neptun_user_file_id_fk FOREIGN KEY (user_file_id) REFERENCES public.neptun_user_file(id) ON DELETE CASCADE;


--
-- Name: neptun_user_webauthn_credential neptun_user_webauthn_credential_neptun_user_id_neptun_user_id_f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neptun_user_webauthn_credential
    ADD CONSTRAINT neptun_user_webauthn_credential_neptun_user_id_neptun_user_id_f FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: project_chat_conversation project_chat_conversation_chat_conversation_id_chat_conversatio; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_chat_conversation
    ADD CONSTRAINT project_chat_conversation_chat_conversation_id_chat_conversatio FOREIGN KEY (chat_conversation_id) REFERENCES public.chat_conversation(id) ON DELETE CASCADE;


--
-- Name: project_chat_conversation project_chat_conversation_project_id_neptun_user_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_chat_conversation
    ADD CONSTRAINT project_chat_conversation_project_id_neptun_user_project_id_fk FOREIGN KEY (project_id) REFERENCES public.neptun_user_project(id) ON DELETE CASCADE;


--
-- Name: project_github_installation project_github_installation_github_installation_id_github_app_i; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_github_installation
    ADD CONSTRAINT project_github_installation_github_installation_id_github_app_i FOREIGN KEY (github_installation_id) REFERENCES public.github_app_installation(id) ON DELETE CASCADE;


--
-- Name: project_github_installation project_github_installation_project_id_neptun_user_project_id_f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_github_installation
    ADD CONSTRAINT project_github_installation_project_id_neptun_user_project_id_f FOREIGN KEY (project_id) REFERENCES public.neptun_user_project(id) ON DELETE CASCADE;


--
-- Name: project_template_collection project_template_collection_project_id_neptun_user_project_id_f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_template_collection
    ADD CONSTRAINT project_template_collection_project_id_neptun_user_project_id_f FOREIGN KEY (project_id) REFERENCES public.neptun_user_project(id) ON DELETE CASCADE;


--
-- Name: project_template_collection project_template_collection_template_collection_id_neptun_user_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_template_collection
    ADD CONSTRAINT project_template_collection_template_collection_id_neptun_user_ FOREIGN KEY (template_collection_id) REFERENCES public.neptun_user_template_collection(id) ON DELETE CASCADE;


--
-- Name: project_user_file project_user_file_project_id_neptun_user_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_user_file
    ADD CONSTRAINT project_user_file_project_id_neptun_user_project_id_fk FOREIGN KEY (project_id) REFERENCES public.neptun_user_project(id) ON DELETE CASCADE;


--
-- Name: project_user_file project_user_file_user_file_id_neptun_user_file_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_user_file
    ADD CONSTRAINT project_user_file_user_file_id_neptun_user_file_id_fk FOREIGN KEY (user_file_id) REFERENCES public.neptun_user_file(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

