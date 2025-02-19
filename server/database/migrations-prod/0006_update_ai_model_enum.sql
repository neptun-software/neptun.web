SELECT unnest(enum_range(NULL::ai_model_enum));

-- Rename existing enum type
ALTER TYPE ai_model_enum RENAME TO ai_model_enum_old;

-- Create new enum type with all current values
CREATE TYPE ai_model_enum AS ENUM (
    'qwen/Qwen2.5-72B-Instruct',
    'qwen/Qwen2.5-Coder-32B-Instruct',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'mistralai/Mistral-Nemo-Instruct-2407',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'microsoft/Phi-3-mini-4k-instruct',
    'google/gemma-2-27b-it',
    'cloudflare/llama-3.3-70b-instruct-fp8-fast'
);

-- Update the table to use new enum type, with explicit casting
ALTER TABLE chat_conversation 
  ALTER COLUMN model_name TYPE ai_model_enum 
  USING CASE 
    WHEN model_name::text NOT IN (
      'qwen/Qwen2.5-72B-Instruct',
      'qwen/Qwen2.5-Coder-32B-Instruct',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
      'mistralai/Mistral-Nemo-Instruct-2407',
      'mistralai/Mistral-7B-Instruct-v0.3',
      'microsoft/Phi-3-mini-4k-instruct',
      'google/gemma-2-27b-it',
      'cloudflare/llama-3.3-70b-instruct-fp8-fast'
    ) THEN 'google/gemma-2-27b-it'::ai_model_enum
    ELSE model_name::ai_model_enum
  END;

-- Drop old enum type
DROP TYPE ai_model_enum_old;
