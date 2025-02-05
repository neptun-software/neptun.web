import { POSSIBLE_AI_MODELS } from '../../../lib/data/ai.models'

export interface PossibleAiModels {
  [key: string]: {
    [model: string]: ModelConfiguration
  }
}

export interface ModelConfiguration {
  publisher: string
  name: string
  description: string
  icon: string
  type: 'instruct' | 'chat'
  configuration: (inputs: string) => {
    inputs: string
    model: string
    max_new_tokens?: number
    typical_p?: number
    repetition_penalty?: number
    truncate?: number
    return_full_text?: boolean
    parameters: {
      max_new_tokens: number
      typical_p: number
      repetition_penalty: number
      truncate: number
      return_full_text: boolean
    }
  }
}

export const ALLOWED_AI_MODELS = Object.keys(POSSIBLE_AI_MODELS).flatMap(
  publisher =>
    Object.keys(POSSIBLE_AI_MODELS[publisher]).map(
      model => `${publisher}/${model}`,
    ),
)

export const defaultAiModelProvider = 'google'
export const defaultAiModel = 'gemma-2-27b-it'
export const defaultAiModelDomain = `${defaultAiModelProvider}/${defaultAiModel}`

export const allowedModelsConst = [
  'qwen/Qwen2.5-72B-Instruct',
  'qwen/Qwen2.5-Coder-32B-Instruct',
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
  'meta-llama/Llama-3.3-70B-Instruct',
  'mistralai/Mistral-Nemo-Instruct-2407',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'google/gemma-2-27b-it',
  'microsoft/Phi-3-mini-4k-instruct',
  defaultAiModelDomain,
] as const

export type AllowedAiModels = `${(typeof allowedModelsConst)[number]}`
export type AllowedAiModelPaths =
  `/api/ai/huggingface/${(typeof allowedModelsConst)[number]}/chat`

export enum AllowedAiModelPublishersEnum {
  Qwen = 'qwen',
  DeepSeek = 'deepseek-ai',
  MetaLlama = 'meta-llama',
  Mistral = 'mistralai',
  Google = 'google',
  Microsoft = 'microsoft',
}

export enum AllowedAiModelNamesEnum {
  Qwen72B = 'Qwen2.5-72B-Instruct',
  QwenCoder = 'Qwen2.5-Coder-32B-Instruct',
  DeepSeekR1 = 'DeepSeek-R1-Distill-Qwen-32B',
  Llama3 = 'Llama-3.3-70B-Instruct',
  MistralNemo = 'Mistral-Nemo-Instruct-2407',
  Mistral7B = 'Mistral-7B-Instruct-v0.3',
  Gemma = 'gemma-2-27b-it',
  Phi3 = 'Phi-3-mini-4k-instruct',
}

export enum AllowedAiModelsEnum {
  Qwen72B = 'qwen/Qwen2.5-72B-Instruct',
  QwenCoder = 'qwen/Qwen2.5-Coder-32B-Instruct',
  DeepSeekR1 = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
  Llama3 = 'meta-llama/Llama-3.3-70B-Instruct',
  MistralNemo = 'mistralai/Mistral-Nemo-Instruct-2407',
  Mistral7B = 'mistralai/Mistral-7B-Instruct-v0.3',
  Gemma = 'google/gemma-2-27b-it',
  Phi3 = 'microsoft/Phi-3-mini-4k-instruct',
}
