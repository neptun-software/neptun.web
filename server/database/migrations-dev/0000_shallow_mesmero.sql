DO $$ BEGIN
 CREATE TYPE "public"."ai_model_enum" AS ENUM('mistralai/Mistral-7B-Instruct-v0.1', 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', 'meta-llama/Meta-Llama-3-8B-Instruct');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."chat_conversation_message_actor_enum" AS ENUM('user', 'assistant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."oauth_provider_enum" AS ENUM('github', 'google');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"model" "ai_model_enum" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_conversation_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL,
	"chat_conversation_id" integer NOT NULL,
	"chat_conversation_message_id" integer NOT NULL,
	"neptun_user_file_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_conversation_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"actor" "chat_conversation_message_actor_enum" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL,
	"chat_conversation_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_conversation_share" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_shared" boolean DEFAULT true NOT NULL,
	"share_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"is_protected" boolean DEFAULT false NOT NULL,
	"hashed_password" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"chat_conversation_id" integer NOT NULL,
	CONSTRAINT "chat_conversation_share_share_id_unique" UNIQUE("share_id"),
	CONSTRAINT "chat_conversation_share_chat_conversation_id_unique" UNIQUE("chat_conversation_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_conversation_share_whitelist_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"whitelisted_neptun_user_id" integer NOT NULL,
	"chat_conversation_share_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_app_installation" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_account_type" text NOT NULL,
	"github_account_avatar_url" text NOT NULL,
	"github_account_id" integer NOT NULL,
	"github_account_name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_app_installation_repository" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_repository_id" integer NOT NULL,
	"github_repository_name" text NOT NULL,
	"github_repository_description" text,
	"github_repository_size" integer,
	"github_repository_language" text,
	"github_repository_license" text,
	"github_repository_url" text NOT NULL,
	"github_repository_website_url" text,
	"github_repository_default_branch" text,
	"github_repository_is_private" boolean NOT NULL,
	"github_repository_is_fork" boolean,
	"github_repository_is_template" boolean,
	"github_repository_is_archived" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"github_app_installation_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neptun_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"primary_email" text NOT NULL,
	"hashed_password" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "neptun_user_primary_email_unique" UNIQUE("primary_email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neptun_user_file" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"text" text NOT NULL,
	"language" text DEFAULT 'text' NOT NULL,
	"file_extension" text DEFAULT 'txt' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neptun_user_oauth_account" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" "oauth_provider_enum" NOT NULL,
	"oauth_user_id" text NOT NULL,
	"oauth_email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neptun_user_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text,
	"file_name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL,
	"template_collection_id" integer,
	"user_file_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neptun_user_template_collection" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_shared" boolean DEFAULT false NOT NULL,
	"share_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL,
	CONSTRAINT "neptun_user_template_collection_share_id_unique" UNIQUE("share_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation" ADD CONSTRAINT "chat_conversation_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_file" ADD CONSTRAINT "chat_conversation_file_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_file" ADD CONSTRAINT "chat_conversation_file_chat_conversation_id_chat_conversation_id_fk" FOREIGN KEY ("chat_conversation_id") REFERENCES "public"."chat_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_file" ADD CONSTRAINT "chat_conversation_file_chat_conversation_message_id_chat_conversation_message_id_fk" FOREIGN KEY ("chat_conversation_message_id") REFERENCES "public"."chat_conversation_message"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_file" ADD CONSTRAINT "chat_conversation_file_neptun_user_file_id_neptun_user_file_id_fk" FOREIGN KEY ("neptun_user_file_id") REFERENCES "public"."neptun_user_file"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_message" ADD CONSTRAINT "chat_conversation_message_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_message" ADD CONSTRAINT "chat_conversation_message_chat_conversation_id_chat_conversation_id_fk" FOREIGN KEY ("chat_conversation_id") REFERENCES "public"."chat_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_share" ADD CONSTRAINT "chat_conversation_share_chat_conversation_id_chat_conversation_id_fk" FOREIGN KEY ("chat_conversation_id") REFERENCES "public"."chat_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_share_whitelist_entry" ADD CONSTRAINT "chat_conversation_share_whitelist_entry_whitelisted_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("whitelisted_neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_conversation_share_whitelist_entry" ADD CONSTRAINT "chat_conversation_share_whitelist_entry_chat_conversation_share_id_chat_conversation_share_id_fk" FOREIGN KEY ("chat_conversation_share_id") REFERENCES "public"."chat_conversation_share"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "github_app_installation" ADD CONSTRAINT "github_app_installation_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "github_app_installation_repository" ADD CONSTRAINT "github_app_installation_repository_github_app_installation_id_github_app_installation_id_fk" FOREIGN KEY ("github_app_installation_id") REFERENCES "public"."github_app_installation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_user_file" ADD CONSTRAINT "neptun_user_file_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_user_oauth_account" ADD CONSTRAINT "neptun_user_oauth_account_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_user_template" ADD CONSTRAINT "neptun_user_template_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_user_template" ADD CONSTRAINT "neptun_user_template_template_collection_id_neptun_user_template_collection_id_fk" FOREIGN KEY ("template_collection_id") REFERENCES "public"."neptun_user_template_collection"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_user_template" ADD CONSTRAINT "neptun_user_template_user_file_id_neptun_user_file_id_fk" FOREIGN KEY ("user_file_id") REFERENCES "public"."neptun_user_file"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_user_template_collection" ADD CONSTRAINT "neptun_user_template_collection_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
