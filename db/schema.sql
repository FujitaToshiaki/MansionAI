--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    condominium_id character varying NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    status text NOT NULL,
    user_id character varying,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: ai_search_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_search_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    condominium_id character varying NOT NULL,
    query text NOT NULL,
    results jsonb,
    context text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: ai_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_tasks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    task_id text NOT NULL,
    task_type text NOT NULL,
    agent_type text NOT NULL,
    condominium_id character varying,
    status text DEFAULT 'queued'::text NOT NULL,
    progress integer DEFAULT 0,
    current_step text,
    settings jsonb,
    result jsonb,
    error_message text,
    estimated_duration integer,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: condominiums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.condominiums (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    units integer NOT NULL,
    build_year integer NOT NULL,
    management_start_date timestamp without time zone NOT NULL,
    current_regulation_version text DEFAULT '1.0'::text,
    law_revision_status text DEFAULT 'pending'::text NOT NULL,
    last_activity timestamp without time zone DEFAULT now(),
    assigned_manager text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: decisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decisions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    condominium_id character varying NOT NULL,
    document_id character varying,
    title text NOT NULL,
    description text,
    result text NOT NULL,
    voting_results jsonb,
    related_regulation_article text,
    category text NOT NULL,
    meeting_date timestamp without time zone NOT NULL,
    is_auto_extracted boolean DEFAULT false,
    confidence integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    condominium_id character varying NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    file_path text,
    original_file_name text,
    file_size integer,
    mime_type text,
    ocr_status text DEFAULT 'pending'::text,
    ocr_accuracy integer,
    ocr_text text,
    uploaded_at timestamp without time zone DEFAULT now(),
    processed_at timestamp without time zone
);


--
-- Name: knowledge_chunks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_chunks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    document_id character varying NOT NULL,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    embedding text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: knowledge_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_documents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    condominium_id character varying NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    metadata jsonb,
    original_file_name text,
    uploaded_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: regulation_analysis_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regulation_analysis_results (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    condominium_id character varying NOT NULL,
    task_id character varying,
    priority text NOT NULL,
    article text NOT NULL,
    title text NOT NULL,
    reason text NOT NULL,
    current_text text,
    proposed_text text,
    legal_basis text,
    standard_regulation_ref text,
    related_decision_id character varying,
    law_revision_required boolean DEFAULT false,
    impact text NOT NULL,
    implementation_notes text,
    data_sources jsonb,
    change_history jsonb,
    status text DEFAULT 'draft'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: regulation_revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regulation_revisions (
    id integer NOT NULL,
    category character varying(100) NOT NULL,
    title character varying(200) NOT NULL,
    change_description text NOT NULL,
    before_text text,
    after_text text,
    article_number character varying(50),
    reference_section character varying(100),
    change_type character varying(50) NOT NULL,
    creation_date timestamp without time zone,
    group_id character varying(100),
    revision_header_id character varying
);


--
-- Name: regulation_revisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.regulation_revisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: regulation_revisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.regulation_revisions_id_seq OWNED BY public.regulation_revisions.id;


--
-- Name: regulations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regulations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    condominium_id character varying NOT NULL,
    version text NOT NULL,
    article text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    revision_reason text,
    effective_date timestamp without time zone,
    is_active boolean DEFAULT true,
    ai_generated_suggestion text,
    approval_status text DEFAULT 'draft'::text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: revision_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revision_groups (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    version text NOT NULL,
    description text,
    total_items integer DEFAULT 0,
    completed_items integer DEFAULT 0,
    status text DEFAULT 'draft'::text NOT NULL,
    effective_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: revision_headers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revision_headers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    year integer NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'planning'::text NOT NULL,
    total_items integer DEFAULT 0,
    completed_items integer DEFAULT 0,
    start_date timestamp without time zone,
    target_completion_date timestamp without time zone,
    actual_completion_date timestamp without time zone,
    revision_type text DEFAULT 'law_compliance'::text NOT NULL,
    priority_level text DEFAULT 'medium'::text NOT NULL,
    assigned_manager text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'manager'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: regulation_revisions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulation_revisions ALTER COLUMN id SET DEFAULT nextval('public.regulation_revisions_id_seq'::regclass);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: ai_search_history ai_search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_search_history
    ADD CONSTRAINT ai_search_history_pkey PRIMARY KEY (id);


--
-- Name: ai_tasks ai_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tasks
    ADD CONSTRAINT ai_tasks_pkey PRIMARY KEY (id);


--
-- Name: ai_tasks ai_tasks_task_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tasks
    ADD CONSTRAINT ai_tasks_task_id_unique UNIQUE (task_id);


--
-- Name: condominiums condominiums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.condominiums
    ADD CONSTRAINT condominiums_pkey PRIMARY KEY (id);


--
-- Name: decisions decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: knowledge_chunks knowledge_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_pkey PRIMARY KEY (id);


--
-- Name: knowledge_documents knowledge_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_pkey PRIMARY KEY (id);


--
-- Name: regulation_analysis_results regulation_analysis_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulation_analysis_results
    ADD CONSTRAINT regulation_analysis_results_pkey PRIMARY KEY (id);


--
-- Name: regulation_revisions regulation_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulation_revisions
    ADD CONSTRAINT regulation_revisions_pkey PRIMARY KEY (id);


--
-- Name: regulations regulations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulations
    ADD CONSTRAINT regulations_pkey PRIMARY KEY (id);


--
-- Name: revision_groups revision_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revision_groups
    ADD CONSTRAINT revision_groups_pkey PRIMARY KEY (id);


--
-- Name: revision_headers revision_headers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revision_headers
    ADD CONSTRAINT revision_headers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: activities activities_condominium_id_condominiums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_condominium_id_condominiums_id_fk FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id);


--
-- Name: activities activities_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ai_search_history ai_search_history_condominium_id_condominiums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_search_history
    ADD CONSTRAINT ai_search_history_condominium_id_condominiums_id_fk FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id);


--
-- Name: ai_search_history ai_search_history_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_search_history
    ADD CONSTRAINT ai_search_history_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ai_tasks ai_tasks_condominium_id_condominiums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_tasks
    ADD CONSTRAINT ai_tasks_condominium_id_condominiums_id_fk FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id);


--
-- Name: decisions decisions_condominium_id_condominiums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_condominium_id_condominiums_id_fk FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id);


--
-- Name: decisions decisions_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: documents documents_condominium_id_condominiums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_condominium_id_condominiums_id_fk FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id);


--
-- Name: knowledge_chunks knowledge_chunks_document_id_knowledge_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_document_id_knowledge_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.knowledge_documents(id);


--
-- Name: knowledge_documents knowledge_documents_condominium_id_condominiums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_condominium_id_condominiums_id_fk FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id);


--
-- Name: regulation_analysis_results regulation_analysis_results_condominium_id_condominiums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulation_analysis_results
    ADD CONSTRAINT regulation_analysis_results_condominium_id_condominiums_id_fk FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id);


--
-- Name: regulation_analysis_results regulation_analysis_results_related_decision_id_decisions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulation_analysis_results
    ADD CONSTRAINT regulation_analysis_results_related_decision_id_decisions_id_fk FOREIGN KEY (related_decision_id) REFERENCES public.decisions(id);


--
-- Name: regulation_analysis_results regulation_analysis_results_task_id_ai_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulation_analysis_results
    ADD CONSTRAINT regulation_analysis_results_task_id_ai_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.ai_tasks(id);


--
-- Name: regulation_revisions regulation_revisions_group_id_revision_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulation_revisions
    ADD CONSTRAINT regulation_revisions_group_id_revision_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.revision_groups(id);


--
-- Name: regulation_revisions regulation_revisions_revision_header_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulation_revisions
    ADD CONSTRAINT regulation_revisions_revision_header_id_fkey FOREIGN KEY (revision_header_id) REFERENCES public.revision_headers(id);


--
-- Name: regulations regulations_condominium_id_condominiums_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regulations
    ADD CONSTRAINT regulations_condominium_id_condominiums_id_fk FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id);


--
-- PostgreSQL database dump complete
--

\unrestrict RBN7S120vKj2fcT8YcercSyHPysyByuim6IuC9CnIy9C2x9JcXolHPBSPZv8q62

