CREATE TABLE "neptun_user_webauthn_credential" (
	"id" text NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"backed_up" boolean DEFAULT false NOT NULL,
	"transports" json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"neptun_user_id" integer NOT NULL,
	CONSTRAINT "neptun_user_webauthn_credential_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "neptun_webauthn_challenge" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"challenge" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "neptun_webauthn_challenge_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
ALTER TABLE "neptun_user_webauthn_credential" ADD CONSTRAINT "neptun_user_webauthn_credential_neptun_user_id_neptun_user_id_fk" FOREIGN KEY ("neptun_user_id") REFERENCES "public"."neptun_user"("id") ON DELETE cascade ON UPDATE no action;