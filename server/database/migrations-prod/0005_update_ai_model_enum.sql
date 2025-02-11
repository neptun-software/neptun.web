-- First check current enum values
SELECT unnest(enum_range(NULL::ai_model_enum));

SELECT typname, enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid;

-- Rename existing enum type
ALTER TYPE ai_model_enum RENAME TO ai_model_enum_old;

-- Create new enum type with all current values
CREATE TYPE ai_model_enum AS ENUM (
    'qwen/Qwen2.5-72B-Instruct',
    'qwen/Qwen2.5-Coder-32B-Instruct',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'meta-llama/Llama-3.3-70B-Instruct',
    'mistralai/Mistral-Nemo-Instruct-2407',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'microsoft/Phi-3-mini-4k-instruct',
    'google/gemma-2-27b-it'
);

-- Update the table to use new enum type
ALTER TABLE chat_conversation 
  ALTER COLUMN model TYPE ai_model_enum 
  USING (
    CASE model::text 
      WHEN 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5' THEN 'google/gemma-2-27b-it'
      WHEN 'meta-llama/Meta-Llama-3-8B-Instruct' THEN 'meta-llama/Llama-3.3-70B-Instruct'
      WHEN 'mistralai/Mistral-7B-Instruct-v0.1' THEN 'mistralai/Mistral-7B-Instruct-v0.3'
      ELSE model::text
    END::ai_model_enum
  );

-- Drop old enum type
DROP TYPE ai_model_enum_old;
