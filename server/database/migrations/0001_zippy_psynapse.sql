CREATE TABLE IF NOT EXISTS "chat_github_app_installation" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_account_type" text NOT NULL,
	"github_account_avatar_url" text NOT NULL,
	"github_account_id" text NOT NULL,
	"github_account_name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"chat_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_github_app_installation_repositories" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_repository_id" text NOT NULL,
	"github_repository_name" text NOT NULL,
	"github_repository_is_private" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"chat_github_app_installation_id" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_github_app_installation" ADD CONSTRAINT "chat_github_app_installation_chat_user_id_chat_user_id_fk" FOREIGN KEY ("chat_user_id") REFERENCES "public"."chat_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_github_app_installation_repositories" ADD CONSTRAINT "chat_github_app_installation_repositories_chat_github_app_installation_id_chat_github_app_installation_id_fk" FOREIGN KEY ("chat_github_app_installation_id") REFERENCES "public"."chat_github_app_installation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
