ALTER TABLE "chat_user" RENAME TO "neptun_user";--> statement-breakpoint
ALTER TABLE "chat_user_oauth_account" RENAME TO "neptun_user_oauth_account";--> statement-breakpoint
ALTER TABLE "chat_conversation" RENAME COLUMN "chat_user_id" TO "neptun_user_id";--> statement-breakpoint
ALTER TABLE "chat_conversation_file" RENAME COLUMN "chat_user_id" TO "neptun_user_id";--> statement-breakpoint
ALTER TABLE "chat_conversation_message" RENAME COLUMN "chat_user_id" TO "neptun_user_id";--> statement-breakpoint
ALTER TABLE "chat_github_app_installation" RENAME COLUMN "chat_user_id" TO "neptun_user_id";--> statement-breakpoint
ALTER TABLE "neptun_user_oauth_account" RENAME COLUMN "chat_user_id" TO "neptun_user_id";--> statement-breakpoint
ALTER TABLE "neptun_user" DROP CONSTRAINT "chat_user_primary_email_unique";--> statement-breakpoint
ALTER TABLE "chat_conversation" DROP CONSTRAINT "chat_conversation_chat_user_id_chat_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_conversation_file" DROP CONSTRAINT "chat_conversation_file_chat_user_id_chat_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_conversation_message" DROP CONSTRAINT "chat_conversation_message_chat_user_id_chat_user_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_github_app_installation" DROP CONSTRAINT "chat_github_app_installation_chat_user_id_chat_user_id_fk";
--> statement-breakpoint
ALTER TABLE "neptun_user_oauth_account" DROP CONSTRAINT "chat_user_oauth_account_chat_user_id_chat_user_id_fk";
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
 ALTER TABLE "chat_conversation_message" ADD CONSTRAINT "chat_conversation_message_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_github_app_installation" ADD CONSTRAINT "chat_github_app_installation_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;
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
ALTER TABLE "neptun_user" ADD CONSTRAINT "neptun_user_primary_email_unique" UNIQUE("primary_email");