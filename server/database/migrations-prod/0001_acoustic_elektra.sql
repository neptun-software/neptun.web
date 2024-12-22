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
ALTER TABLE "chat_conversation_file" DROP CONSTRAINT "chat_conversation_file_chat_conversation_id_chat_conversation_i";
--> statement-breakpoint
ALTER TABLE "chat_conversation_file" DROP CONSTRAINT "chat_conversation_file_chat_conversation_message_id_chat_conver";
--> statement-breakpoint
ALTER TABLE "chat_conversation_message" DROP CONSTRAINT "chat_conversation_message_chat_conversation_id_chat_conversatio";
--> statement-breakpoint
ALTER TABLE "github_app_installation_repository" DROP CONSTRAINT "github_app_installation_repository_github_app_installation_id_g";
--> statement-breakpoint
ALTER TABLE "chat_conversation_share" DROP CONSTRAINT "chat_conversation_share_chat_conversation_id_chat_conversation_";
--> statement-breakpoint
ALTER TABLE "chat_conversation_share_whitelist_entry" DROP CONSTRAINT "chat_conversation_share_whitelist_entry_whitelisted_neptun_user";
--> statement-breakpoint
ALTER TABLE "chat_conversation_share_whitelist_entry" DROP CONSTRAINT "chat_conversation_share_whitelist_entry_chat_conversation_share";
--> statement-breakpoint
ALTER TABLE "chat_conversation_file" ADD COLUMN "neptun_user_file_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "neptun_user_file" ADD CONSTRAINT "neptun_user_file_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "chat_conversation_message" ADD CONSTRAINT "chat_conversation_message_chat_conversation_id_chat_conversation_id_fk" FOREIGN KEY ("chat_conversation_id") REFERENCES "public"."chat_conversation"("id") ON DELETE cascade ON UPDATE no action;
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
ALTER TABLE "chat_conversation_file" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "chat_conversation_file" DROP COLUMN IF EXISTS "language";--> statement-breakpoint
ALTER TABLE "chat_conversation_file" DROP COLUMN IF EXISTS "file_extension";--> statement-breakpoint
ALTER TABLE "chat_conversation_file" DROP COLUMN IF EXISTS "text";