import { POSSIBLE_AI_MODELS } from '~/lib/data/ai.models'

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

export const defaultAiModelProvider = 'meta-llama'
export const defaultAiModel = 'Meta-Llama-3-8B-Instruct'
export const defaultAiModelDomain = `${defaultAiModelProvider}/${defaultAiModel}`
export const allowedModelsConst = [
  'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
  'mistralai/Mistral-7B-Instruct-v0.1',
  defaultAiModelDomain,
] as const

export type AllowedAiModels = `${(typeof allowedModelsConst)[number]}`
export type AllowedAiModelPaths =
  `/api/ai/huggingface/${(typeof allowedModelsConst)[number]}/chat`

export enum AllowedAiModelPublishersEnum {
  OpenAssistant = 'OpenAssistant',
  Mistral = 'mistralai',
  // eslint-disable-next-line ts/prefer-literal-enum-member
  metaLlama = defaultAiModelProvider,
}

export enum AllowedAiModelNamesEnum {
  OpenAssistant = 'oasst-sft-4-pythia-12b-epoch-3.5',
  Mistral = 'Mistral-7B-Instruct-v0.1',
  // eslint-disable-next-line ts/prefer-literal-enum-member
  metaLlama = defaultAiModel,
}

export enum AllowedAiModelsEnum {
  OpenAssistant = 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
  Mistral = 'mistralai/Mistral-7B-Instruct-v0.1',
  // eslint-disable-next-line ts/prefer-literal-enum-member
  metaLlama = defaultAiModelDomain,
}
