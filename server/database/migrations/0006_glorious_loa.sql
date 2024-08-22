ALTER TABLE "chat_github_app_installation" RENAME TO "github_app_installation";--> statement-breakpoint
ALTER TABLE "github_app_installation_repository" RENAME COLUMN "chat_github_app_installation_id" TO "github_app_installation_id";--> statement-breakpoint
ALTER TABLE "github_app_installation" DROP CONSTRAINT "chat_github_app_installation_neptun_user_id_neptun_user_id_fk";
--> statement-breakpoint
ALTER TABLE "github_app_installation_repository" DROP CONSTRAINT "github_app_installation_repository_chat_github_app_installation_id_chat_github_app_installation_id_fk";
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
