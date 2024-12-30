--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
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
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: nptn_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO nptn_owner;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: ai_model_enum; Type: TYPE; Schema: public; Owner: nptn_owner
--

CREATE TYPE public.ai_model_enum AS ENUM (
    'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
    'meta-llama/Meta-Llama-3-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.1'
);


ALTER TYPE public.ai_model_enum OWNER TO nptn_owner;

--
-- Name: ai_model_enum_old; Type: TYPE; Schema: public; Owner: nptn_owner
--

CREATE TYPE public.ai_model_enum_old AS ENUM (
    'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
    'mistralai/Mistral-7B-Instruct-v0.1',
    'meta-llama/Meta-Llama-3-8B-Instruct'
);


ALTER TYPE public.ai_model_enum_old OWNER TO nptn_owner;

--
-- Name: chat_conversation_message_actor_enum; Type: TYPE; Schema: public; Owner: nptn_owner
--

CREATE TYPE public.chat_conversation_message_actor_enum AS ENUM (
    'user',
    'assistant'
);


ALTER TYPE public.chat_conversation_message_actor_enum OWNER TO nptn_owner;

--
-- Name: oauth_provider_enum; Type: TYPE; Schema: public; Owner: nptn_owner
--

CREATE TYPE public.oauth_provider_enum AS ENUM (
    'github',
    'google'
);


ALTER TYPE public.oauth_provider_enum OWNER TO nptn_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: nptn_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO nptn_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: nptn_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO nptn_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: nptn_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: chat_conversation; Type: TABLE; Schema: public; Owner: nptn_owner
--

CREATE TABLE public.chat_conversation (
    id integer NOT NULL,
    name text NOT NULL,
    model public.ai_model_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL
);


ALTER TABLE public.chat_conversation OWNER TO nptn_owner;

--
-- Name: chat_conversation_file; Type: TABLE; Schema: public; Owner: nptn_owner
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


ALTER TABLE public.chat_conversation_file OWNER TO nptn_owner;

--
-- Name: chat_conversation_file_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_conversation_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_conversation_file_id_seq OWNER TO nptn_owner;

--
-- Name: chat_conversation_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_conversation_file_id_seq OWNED BY public.chat_conversation_file.id;


--
-- Name: chat_conversation_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_conversation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_conversation_id_seq OWNER TO nptn_owner;

--
-- Name: chat_conversation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_conversation_id_seq OWNED BY public.chat_conversation.id;


--
-- Name: chat_conversation_message; Type: TABLE; Schema: public; Owner: nptn_owner
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


ALTER TABLE public.chat_conversation_message OWNER TO nptn_owner;

--
-- Name: chat_conversation_message_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_conversation_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_conversation_message_id_seq OWNER TO nptn_owner;

--
-- Name: chat_conversation_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_conversation_message_id_seq OWNED BY public.chat_conversation_message.id;


--
-- Name: chat_conversation_share; Type: TABLE; Schema: public; Owner: nptn_owner
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


ALTER TABLE public.chat_conversation_share OWNER TO nptn_owner;

--
-- Name: chat_conversation_share_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_conversation_share_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_conversation_share_id_seq OWNER TO nptn_owner;

--
-- Name: chat_conversation_share_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_conversation_share_id_seq OWNED BY public.chat_conversation_share.id;


--
-- Name: chat_conversation_share_whitelist_entry; Type: TABLE; Schema: public; Owner: nptn_owner
--

CREATE TABLE public.chat_conversation_share_whitelist_entry (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    whitelisted_neptun_user_id integer NOT NULL,
    chat_conversation_share_id integer NOT NULL
);


ALTER TABLE public.chat_conversation_share_whitelist_entry OWNER TO nptn_owner;

--
-- Name: chat_conversation_share_whitelist_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_conversation_share_whitelist_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_conversation_share_whitelist_entry_id_seq OWNER TO nptn_owner;

--
-- Name: chat_conversation_share_whitelist_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_conversation_share_whitelist_entry_id_seq OWNED BY public.chat_conversation_share_whitelist_entry.id;


--
-- Name: github_app_installation; Type: TABLE; Schema: public; Owner: nptn_owner
--

CREATE TABLE public.github_app_installation (
    id integer NOT NULL,
    github_account_type text NOT NULL,
    github_account_avatar_url text NOT NULL,
    github_account_id integer NOT NULL,
    github_account_name text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    neptun_user_id integer NOT NULL
);


ALTER TABLE public.github_app_installation OWNER TO nptn_owner;

--
-- Name: chat_github_app_installation_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_github_app_installation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_github_app_installation_id_seq OWNER TO nptn_owner;

--
-- Name: chat_github_app_installation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_github_app_installation_id_seq OWNED BY public.github_app_installation.id;


--
-- Name: github_app_installation_repository; Type: TABLE; Schema: public; Owner: nptn_owner
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


ALTER TABLE public.github_app_installation_repository OWNER TO nptn_owner;

--
-- Name: chat_github_app_installation_repository_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_github_app_installation_repository_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_github_app_installation_repository_id_seq OWNER TO nptn_owner;

--
-- Name: chat_github_app_installation_repository_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_github_app_installation_repository_id_seq OWNED BY public.github_app_installation_repository.id;


--
-- Name: neptun_user; Type: TABLE; Schema: public; Owner: nptn_owner
--

CREATE TABLE public.neptun_user (
    id integer NOT NULL,
    primary_email text NOT NULL,
    hashed_password text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.neptun_user OWNER TO nptn_owner;

--
-- Name: chat_user_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_user_id_seq OWNER TO nptn_owner;

--
-- Name: chat_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_user_id_seq OWNED BY public.neptun_user.id;


--
-- Name: neptun_user_oauth_account; Type: TABLE; Schema: public; Owner: nptn_owner
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


ALTER TABLE public.neptun_user_oauth_account OWNER TO nptn_owner;

--
-- Name: chat_user_oauth_account_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.chat_user_oauth_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_user_oauth_account_id_seq OWNER TO nptn_owner;

--
-- Name: chat_user_oauth_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.chat_user_oauth_account_id_seq OWNED BY public.neptun_user_oauth_account.id;


--
-- Name: neptun_user_file; Type: TABLE; Schema: public; Owner: nptn_owner
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


ALTER TABLE public.neptun_user_file OWNER TO nptn_owner;

--
-- Name: neptun_user_file_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.neptun_user_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.neptun_user_file_id_seq OWNER TO nptn_owner;

--
-- Name: neptun_user_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.neptun_user_file_id_seq OWNED BY public.neptun_user_file.id;


--
-- Name: neptun_user_template; Type: TABLE; Schema: public; Owner: nptn_owner
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


ALTER TABLE public.neptun_user_template OWNER TO nptn_owner;

--
-- Name: neptun_user_template_collection; Type: TABLE; Schema: public; Owner: nptn_owner
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


ALTER TABLE public.neptun_user_template_collection OWNER TO nptn_owner;

--
-- Name: neptun_user_template_collection_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.neptun_user_template_collection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.neptun_user_template_collection_id_seq OWNER TO nptn_owner;

--
-- Name: neptun_user_template_collection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.neptun_user_template_collection_id_seq OWNED BY public.neptun_user_template_collection.id;


--
-- Name: neptun_user_template_id_seq; Type: SEQUENCE; Schema: public; Owner: nptn_owner
--

CREATE SEQUENCE public.neptun_user_template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.neptun_user_template_id_seq OWNER TO nptn_owner;

--
-- Name: neptun_user_template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nptn_owner
--

ALTER SEQUENCE public.neptun_user_template_id_seq OWNED BY public.neptun_user_template.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: nptn_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: chat_conversation id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_id_seq'::regclass);


--
-- Name: chat_conversation_file id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_file ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_file_id_seq'::regclass);


--
-- Name: chat_conversation_message id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_message ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_message_id_seq'::regclass);


--
-- Name: chat_conversation_share id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_share_id_seq'::regclass);


--
-- Name: chat_conversation_share_whitelist_entry id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share_whitelist_entry ALTER COLUMN id SET DEFAULT nextval('public.chat_conversation_share_whitelist_entry_id_seq'::regclass);


--
-- Name: github_app_installation id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.github_app_installation ALTER COLUMN id SET DEFAULT nextval('public.chat_github_app_installation_id_seq'::regclass);


--
-- Name: github_app_installation_repository id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.github_app_installation_repository ALTER COLUMN id SET DEFAULT nextval('public.chat_github_app_installation_repository_id_seq'::regclass);


--
-- Name: neptun_user id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user ALTER COLUMN id SET DEFAULT nextval('public.chat_user_id_seq'::regclass);


--
-- Name: neptun_user_file id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_file ALTER COLUMN id SET DEFAULT nextval('public.neptun_user_file_id_seq'::regclass);


--
-- Name: neptun_user_oauth_account id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_oauth_account ALTER COLUMN id SET DEFAULT nextval('public.chat_user_oauth_account_id_seq'::regclass);


--
-- Name: neptun_user_template id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template ALTER COLUMN id SET DEFAULT nextval('public.neptun_user_template_id_seq'::regclass);


--
-- Name: neptun_user_template_collection id; Type: DEFAULT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template_collection ALTER COLUMN id SET DEFAULT nextval('public.neptun_user_template_collection_id_seq'::regclass);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: nptn_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_file chat_conversation_file_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_message chat_conversation_message_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_message
    ADD CONSTRAINT chat_conversation_message_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation chat_conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation
    ADD CONSTRAINT chat_conversation_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_share chat_conversation_share_chat_conversation_id_unique; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share
    ADD CONSTRAINT chat_conversation_share_chat_conversation_id_unique UNIQUE (chat_conversation_id);


--
-- Name: chat_conversation_share chat_conversation_share_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share
    ADD CONSTRAINT chat_conversation_share_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_share chat_conversation_share_share_id_unique; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share
    ADD CONSTRAINT chat_conversation_share_share_id_unique UNIQUE (share_id);


--
-- Name: chat_conversation_share_whitelist_entry chat_conversation_share_whitelist_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share_whitelist_entry
    ADD CONSTRAINT chat_conversation_share_whitelist_entry_pkey PRIMARY KEY (id);


--
-- Name: github_app_installation chat_github_app_installation_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.github_app_installation
    ADD CONSTRAINT chat_github_app_installation_pkey PRIMARY KEY (id);


--
-- Name: github_app_installation_repository chat_github_app_installation_repository_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.github_app_installation_repository
    ADD CONSTRAINT chat_github_app_installation_repository_pkey PRIMARY KEY (id);


--
-- Name: neptun_user_oauth_account chat_user_oauth_account_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_oauth_account
    ADD CONSTRAINT chat_user_oauth_account_pkey PRIMARY KEY (id);


--
-- Name: neptun_user chat_user_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user
    ADD CONSTRAINT chat_user_pkey PRIMARY KEY (id);


--
-- Name: neptun_user_file neptun_user_file_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_file
    ADD CONSTRAINT neptun_user_file_pkey PRIMARY KEY (id);


--
-- Name: neptun_user neptun_user_primary_email_unique; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user
    ADD CONSTRAINT neptun_user_primary_email_unique UNIQUE (primary_email);


--
-- Name: neptun_user_template_collection neptun_user_template_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template_collection
    ADD CONSTRAINT neptun_user_template_collection_pkey PRIMARY KEY (id);


--
-- Name: neptun_user_template_collection neptun_user_template_collection_share_id_unique; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template_collection
    ADD CONSTRAINT neptun_user_template_collection_share_id_unique UNIQUE (share_id);


--
-- Name: neptun_user_template neptun_user_template_pkey; Type: CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template
    ADD CONSTRAINT neptun_user_template_pkey PRIMARY KEY (id);


--
-- Name: chat_conversation_file chat_conversation_file_chat_conversation_id_chat_conversation_i; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_chat_conversation_id_chat_conversation_i FOREIGN KEY (chat_conversation_id) REFERENCES public.chat_conversation(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_file chat_conversation_file_chat_conversation_message_id_chat_conver; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_chat_conversation_message_id_chat_conver FOREIGN KEY (chat_conversation_message_id) REFERENCES public.chat_conversation_message(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_file chat_conversation_file_neptun_user_file_id_neptun_user_file_id_; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_neptun_user_file_id_neptun_user_file_id_ FOREIGN KEY (neptun_user_file_id) REFERENCES public.neptun_user_file(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_file chat_conversation_file_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_file
    ADD CONSTRAINT chat_conversation_file_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_message chat_conversation_message_chat_conversation_id_chat_conversatio; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_message
    ADD CONSTRAINT chat_conversation_message_chat_conversation_id_chat_conversatio FOREIGN KEY (chat_conversation_id) REFERENCES public.chat_conversation(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_message chat_conversation_message_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_message
    ADD CONSTRAINT chat_conversation_message_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: chat_conversation chat_conversation_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation
    ADD CONSTRAINT chat_conversation_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_share chat_conversation_share_chat_conversation_id_chat_conversation_; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share
    ADD CONSTRAINT chat_conversation_share_chat_conversation_id_chat_conversation_ FOREIGN KEY (chat_conversation_id) REFERENCES public.chat_conversation(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_share_whitelist_entry chat_conversation_share_whitelist_entry_chat_conversation_share; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share_whitelist_entry
    ADD CONSTRAINT chat_conversation_share_whitelist_entry_chat_conversation_share FOREIGN KEY (chat_conversation_share_id) REFERENCES public.chat_conversation_share(id) ON DELETE CASCADE;


--
-- Name: chat_conversation_share_whitelist_entry chat_conversation_share_whitelist_entry_whitelisted_neptun_user; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.chat_conversation_share_whitelist_entry
    ADD CONSTRAINT chat_conversation_share_whitelist_entry_whitelisted_neptun_user FOREIGN KEY (whitelisted_neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: github_app_installation github_app_installation_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.github_app_installation
    ADD CONSTRAINT github_app_installation_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: github_app_installation_repository github_app_installation_repository_github_app_installation_id_g; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.github_app_installation_repository
    ADD CONSTRAINT github_app_installation_repository_github_app_installation_id_g FOREIGN KEY (github_app_installation_id) REFERENCES public.github_app_installation(id) ON DELETE CASCADE;


--
-- Name: neptun_user_file neptun_user_file_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_file
    ADD CONSTRAINT neptun_user_file_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_oauth_account neptun_user_oauth_account_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_oauth_account
    ADD CONSTRAINT neptun_user_oauth_account_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_template_collection neptun_user_template_collection_neptun_user_id_neptun_user_id_f; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template_collection
    ADD CONSTRAINT neptun_user_template_collection_neptun_user_id_neptun_user_id_f FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_template neptun_user_template_neptun_user_id_neptun_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template
    ADD CONSTRAINT neptun_user_template_neptun_user_id_neptun_user_id_fk FOREIGN KEY (neptun_user_id) REFERENCES public.neptun_user(id) ON DELETE CASCADE;


--
-- Name: neptun_user_template neptun_user_template_template_collection_id_neptun_user_templat; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template
    ADD CONSTRAINT neptun_user_template_template_collection_id_neptun_user_templat FOREIGN KEY (template_collection_id) REFERENCES public.neptun_user_template_collection(id) ON DELETE CASCADE;


--
-- Name: neptun_user_template neptun_user_template_user_file_id_neptun_user_file_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: nptn_owner
--

ALTER TABLE ONLY public.neptun_user_template
    ADD CONSTRAINT neptun_user_template_user_file_id_neptun_user_file_id_fk FOREIGN KEY (user_file_id) REFERENCES public.neptun_user_file(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

