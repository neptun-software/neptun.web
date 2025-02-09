ALTER TYPE "ai_model_enum" ADD VALUE 'microsoft/Phi-3-mini-4k-instruct';--> statement-breakpoint
ALTER TABLE "neptun_context_import" DROP COLUMN IF EXISTS "exclude_patterns";