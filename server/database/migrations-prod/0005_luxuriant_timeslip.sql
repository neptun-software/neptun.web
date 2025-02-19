ALTER TABLE "chat_conversation" RENAME COLUMN "model" TO "model_name";--> statement-breakpoint
ALTER TABLE "public"."chat_conversation" ALTER COLUMN "model_name" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."ai_model_enum";--> statement-breakpoint
CREATE TYPE "public"."ai_model_enum" AS ENUM('google/gemma-2-27b-it', 'qwen/Qwen2.5-72B-Instruct', 'qwen/Qwen2.5-Coder-32B-Instruct', 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', 'mistralai/Mistral-Nemo-Instruct-2407', 'mistralai/Mistral-7B-Instruct-v0.3', 'microsoft/Phi-3-mini-4k-instruct', 'cloudflare/llama-3.3-70b-instruct-fp8-fast');--> statement-breakpoint
ALTER TABLE "public"."chat_conversation" ALTER COLUMN "model_name" SET DATA TYPE "public"."ai_model_enum" USING "model_name"::"public"."ai_model_enum";