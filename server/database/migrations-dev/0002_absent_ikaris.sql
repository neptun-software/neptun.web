DO $$ BEGIN
 CREATE TYPE "public"."context_file_category" AS ENUM('bundler', 'build_tool', 'server', 'package_manager', 'runtime', 'documentation', 'test_tool', 'unknown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."context_file_type" AS ENUM('markdown', 'pdf', 'text');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."import_source_type" AS ENUM('local_folder', 'github_repository_installation', 'public_github_repository_url');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."programming_language" AS ENUM('typescript', 'javascript', 'php', 'go', 'python', 'java', 'kotlin', 'ruby', 'elixir');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."project_type" AS ENUM('web-site', 'web-service', 'web-app');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neptun_context_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"original_path" text NOT NULL,
	"content" text NOT NULL,
	"file_type" "context_file_type" NOT NULL,
	"category" "context_file_category",
	"file_size" integer,
	"pdf_url" text,
	"language" text DEFAULT 'text' NOT NULL,
	"metadata" jsonb,
	"parent_path" text,
	"depth" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL,
	"import_id" integer NOT NULL,
	"project_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neptun_context_import" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" "import_source_type" NOT NULL,
	"source_path" text NOT NULL,
	"source_ref" text,
	"import_status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"file_tree" jsonb,
	"exclude_patterns" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL,
	"project_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neptun_user_project" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "project_type" NOT NULL,
	"main_language" "programming_language" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_chat_conversation" (
	"project_id" integer NOT NULL,
	"chat_conversation_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_github_installation" (
	"project_id" integer NOT NULL,
	"github_installation_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_template_collection" (
	"project_id" integer NOT NULL,
	"template_collection_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_user_file" (
	"project_id" integer NOT NULL,
	"user_file_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_context_file" ADD CONSTRAINT "neptun_context_file_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_context_file" ADD CONSTRAINT "neptun_context_file_import_id_neptun_context_import_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."neptun_context_import"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_context_file" ADD CONSTRAINT "neptun_context_file_project_id_neptun_user_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."neptun_user_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_context_import" ADD CONSTRAINT "neptun_context_import_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_context_import" ADD CONSTRAINT "neptun_context_import_project_id_neptun_user_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."neptun_user_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_user_project" ADD CONSTRAINT "neptun_user_project_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_chat_conversation" ADD CONSTRAINT "project_chat_conversation_project_id_neptun_user_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."neptun_user_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_chat_conversation" ADD CONSTRAINT "project_chat_conversation_chat_conversation_id_chat_conversation_id_fk" FOREIGN KEY ("chat_conversation_id") REFERENCES "public"."chat_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_github_installation" ADD CONSTRAINT "project_github_installation_project_id_neptun_user_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."neptun_user_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_github_installation" ADD CONSTRAINT "project_github_installation_github_installation_id_github_app_installation_id_fk" FOREIGN KEY ("github_installation_id") REFERENCES "public"."github_app_installation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_template_collection" ADD CONSTRAINT "project_template_collection_project_id_neptun_user_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."neptun_user_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_template_collection" ADD CONSTRAINT "project_template_collection_template_collection_id_neptun_user_template_collection_id_fk" FOREIGN KEY ("template_collection_id") REFERENCES "public"."neptun_user_template_collection"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_user_file" ADD CONSTRAINT "project_user_file_project_id_neptun_user_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."neptun_user_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_user_file" ADD CONSTRAINT "project_user_file_user_file_id_neptun_user_file_id_fk" FOREIGN KEY ("user_file_id") REFERENCES "public"."neptun_user_file"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
