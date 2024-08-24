CREATE TABLE IF NOT EXISTS "chat_conversation_share" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
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
