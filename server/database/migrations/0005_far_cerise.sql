ALTER TABLE "chat_github_app_installation_repository" RENAME TO "github_app_installation_repository";--> statement-breakpoint
ALTER TABLE "github_app_installation_repository" DROP CONSTRAINT "chat_github_app_installation_repository_chat_github_app_installation_id_chat_github_app_installation_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "github_app_installation_repository" ADD CONSTRAINT "github_app_installation_repository_chat_github_app_installation_id_chat_github_app_installation_id_fk" FOREIGN KEY ("chat_github_app_installation_id") REFERENCES "public"."chat_github_app_installation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
