ALTER TABLE "chat_github_app_installation" ALTER COLUMN "github_account_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation" ALTER COLUMN "github_account_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ALTER COLUMN "github_repository_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_description" text;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_size" integer;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_language" text;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_license" text;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_website_url" text;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_default_branch" text;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_is_fork" boolean;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_is_template" boolean;--> statement-breakpoint
ALTER TABLE "chat_github_app_installation_repository" ADD COLUMN "github_repository_is_archived" boolean NOT NULL;